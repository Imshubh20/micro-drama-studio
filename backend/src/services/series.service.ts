import prisma from '../config/database';
import { SeriesStatus, Tone, GenerationStatus, GenerationType } from '@prisma/client';
import { callOpenAI, estimateCost } from './ai.service';
import { buildSeriesGenerationPrompt } from '../prompts';

// ─── Create Series ─────────────────────────────────────────
export async function createSeries(data: {
  title: string;
  prompt: string;
  genre: string;
  tone: Tone;
  episodeCount: number;
  episodeDuration: number;
  userId: string;
}) {
  return prisma.series.create({
    data: {
      title: data.title,
      prompt: data.prompt,
      genre: data.genre,
      tone: data.tone,
      episodeCount: data.episodeCount,
      episodeDuration: data.episodeDuration,
      userId: data.userId,
      status: 'DRAFT',
    },
    include: {
      episodes: true,
      characters: true,
    },
  });
}

// ─── Get All Series ────────────────────────────────────────
export async function getAllSeries(userId?: string) {
  return prisma.series.findMany({
    where: userId ? { userId } : {},
    include: {
      episodes: {
        select: { id: true, status: true, number: true, title: true },
      },
      characters: {
        select: { id: true, name: true, role: true },
      },
      _count: {
        select: { episodes: true, characters: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Get Series By ID ──────────────────────────────────────
export async function getSeriesById(id: string) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      episodes: {
        include: {
          scenes: true,
          script: true,
          mediaAssets: true,
        },
        orderBy: { number: 'asc' },
      },
      characters: {
        include: {
          relationshipsFrom: {
            include: { toCharacter: { select: { name: true } } },
          },
          relationshipsTo: {
            include: { fromCharacter: { select: { name: true } } },
          },
        },
      },
      generationJobs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      generationUsages: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// ─── Update Series ─────────────────────────────────────────
export async function updateSeries(id: string, data: Partial<{
  title: string;
  description: string;
  storyline: string;
  status: SeriesStatus;
  genre: string;
  tone: Tone;
}>) {
  return prisma.series.update({
    where: { id },
    data,
    include: { episodes: true, characters: true },
  });
}

// ─── Generate Series Content ───────────────────────────────
export async function generateSeriesContent(seriesId: string) {
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: {
      characters: { where: { isLocked: true } },
    },
  });

  if (!series) throw new Error('Series not found');

  // Concurrency guard: check if an active generation job is already in progress for this series
  const existingActiveJob = await prisma.generationJob.findFirst({
    where: { seriesId, status: 'GENERATING' },
    orderBy: { createdAt: 'desc' },
  });
  if (existingActiveJob) {
    const elapsedMs = Date.now() - new Date(existingActiveJob.createdAt).getTime();
    if (elapsedMs < 120000) {
      // An active generation is already running; avoid creating duplicate jobs or records
      return prisma.series.findUnique({
        where: { id: seriesId },
        include: {
          episodes: { orderBy: { number: 'asc' } },
          characters: true,
          generationJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
    }
  }

  // Create generation job
  const job = await prisma.generationJob.create({
    data: {
      seriesId,
      type: 'SERIES',
      status: 'GENERATING',
      progress: 0,
      steps: JSON.stringify([
        { label: 'Understanding story idea', status: 'completed' },
        { label: 'Generating title & description', status: 'in_progress' },
        { label: 'Creating characters', status: 'pending' },
        { label: 'Generating episode structure', status: 'pending' },
        { label: 'Building relationships', status: 'pending' },
        { label: 'Finalizing content', status: 'pending' },
      ]),
    },
  });

  // Update series status
  await prisma.series.update({
    where: { id: seriesId },
    data: { status: 'GENERATING' },
  });

  try {
    // Build prompt with locked characters
    const prompt = buildSeriesGenerationPrompt({
      prompt: series.prompt,
      title: series.title !== 'Untitled Series' ? series.title : undefined,
      genre: series.genre,
      tone: series.tone,
      episodeCount: series.episodeCount,
      episodeDuration: series.episodeDuration,
      lockedCharacters: series.characters.filter(c => c.isLocked).map(c => ({
        name: c.name,
        age: c.age || undefined,
        gender: c.gender || undefined,
        role: c.role || undefined,
        personality: c.personality || undefined,
        appearance: c.appearance || undefined,
        background: c.background || undefined,
        description: c.description || undefined,
      })),
    });

    // Update progress
    await updateJobProgress(job.id, 20, 1);

    const { content, usage } = await callOpenAI(prompt);

    // Update progress
    await updateJobProgress(job.id, 50, 2);

    // Debug: log AI content when running in demo mode to help diagnose invalid responses
    if (content && content.length < 10000) {
      console.log('\n--- AI content start ---\n', content, '\n--- AI content end ---\n');
    }

    // Parse and validate response (be tolerant to wrapper text)
    let parsed: any;
    try {
      // Remove any markdown code fences if present
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (err) {
      // Try to extract the first JSON object in the string
      const match = content.match(/\{[\s\S]*\}/m);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e) {
          console.error('Failed to parse AI response JSON:', e);
          console.error('Raw AI content (truncated):', content.slice(0, 2000));
          throw new Error('Invalid AI response structure');
        }
      } else {
        console.error('AI response did not contain JSON object. Raw content (truncated):', content.slice(0, 2000));
        throw new Error('Invalid AI response structure');
      }
    }

    if (!parsed.title && !series.title) {
      parsed.title = 'Untitled Series';
    }
    if (!parsed.characters || !Array.isArray(parsed.characters) || parsed.characters.length === 0) {
      throw new Error('Invalid AI response structure: characters missing or empty');
    }
    if (!parsed.episodes || !Array.isArray(parsed.episodes) || parsed.episodes.length === 0) {
      throw new Error('Invalid AI response structure: episodes missing or empty');
    }

    // Update series with generated content
    await prisma.series.update({
      where: { id: seriesId },
      data: {
        title: parsed.title || series.title,
        description: parsed.description || parsed.logline || series.prompt,
        storyline: parsed.storyline || parsed.description || series.prompt,
        status: 'IN_REVIEW',
      },
    });

    await updateJobProgress(job.id, 60, 3);

    // Create characters (skip locked ones)
    const lockedNames = series.characters.filter(c => c.isLocked).map(c => c.name);
    
    // Delete existing unlocked characters
    await prisma.character.deleteMany({
      where: { seriesId, isLocked: false },
    });

    for (const char of parsed.characters) {
      if (!char.name) continue;
      if (!lockedNames.includes(char.name)) {
        await prisma.character.create({
          data: {
            seriesId,
            name: char.name,
            age: typeof char.age === 'number' ? char.age : parseInt(char.age) || 25,
            gender: char.gender || 'Unknown',
            role: char.role || 'Supporting',
            personality: char.personality || '',
            appearance: char.appearance || '',
            background: char.background || '',
            description: char.description || '',
            isLocked: false,
          },
        });
      }
    }

    await updateJobProgress(job.id, 80, 4);

    // Create episodes with continuity
    await prisma.episode.deleteMany({ where: { seriesId } });
    for (let index = 0; index < parsed.episodes.length; index++) {
      const ep = parsed.episodes[index];
      const epNum = ep.number || ep.episodeNumber || (index + 1);
      await prisma.episode.create({
        data: {
          seriesId,
          number: epNum,
          title: ep.title || `Episode ${epNum}`,
          summary: ep.summary || '',
          status: 'DRAFT',
        },
      });
    }

    await updateJobProgress(job.id, 90, 5);

    // Create character relationships
    if (parsed.relationships) {
      // Delete old relationships for characters in this series
      const allChars = await prisma.character.findMany({ where: { seriesId } });
      const charIds = allChars.map(c => c.id);
      await prisma.characterRelationship.deleteMany({
        where: { fromCharacterId: { in: charIds } },
      });

      for (const rel of parsed.relationships) {
        const fromChar = allChars.find(c => c.name === rel.from);
        const toChar = allChars.find(c => c.name === rel.to);
        if (fromChar && toChar) {
          await prisma.characterRelationship.create({
            data: {
              fromCharacterId: fromChar.id,
              toCharacterId: toChar.id,
              relationship: rel.relationship,
            },
          });
        }
      }
    }

    // Record usage
    await prisma.generationUsage.create({
      data: {
        seriesId,
        type: 'SERIES',
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        estimatedCost: (usage.promptTokens * 0.00015 / 1000) + (usage.completionTokens * 0.0006 / 1000),
      },
    });

    // Complete job
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
        steps: JSON.stringify([
          { label: 'Understanding story idea', status: 'completed' },
          { label: 'Generating title & description', status: 'completed' },
          { label: 'Creating characters', status: 'completed' },
          { label: 'Generating episode structure', status: 'completed' },
          { label: 'Building relationships', status: 'completed' },
          { label: 'Finalizing content', status: 'completed' },
        ]),
      },
    });

    return prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        episodes: { orderBy: { number: 'asc' } },
        characters: true,
        generationJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  } catch (error: any) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        error: error.message || 'Generation failed',
      },
    });

    await prisma.series.update({
      where: { id: seriesId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}

// ─── Get Cost Estimate ─────────────────────────────────────
export async function getSeriesCostEstimate(seriesId: string) {
  const series = await prisma.series.findUnique({ where: { id: seriesId } });
  if (!series) throw new Error('Series not found');
  return estimateCost('series', series.episodeCount);
}

// ─── Helper: Update Job Progress ───────────────────────────
async function updateJobProgress(jobId: string, progress: number, completedStepIndex: number) {
  const job = await prisma.generationJob.findUnique({ where: { id: jobId } });
  if (!job) return;

  const steps = JSON.parse(job.steps as string || '[]');
  for (let i = 0; i < steps.length; i++) {
    if (i < completedStepIndex) {
      steps[i].status = 'completed';
    } else if (i === completedStepIndex) {
      steps[i].status = 'in_progress';
    } else {
      steps[i].status = 'pending';
    }
  }

  await prisma.generationJob.update({
    where: { id: jobId },
    data: { progress, steps: JSON.stringify(steps) },
  });
}

// ─── Delete Series ─────────────────────────────────────────
export async function deleteSeries(id: string) {
  return prisma.series.delete({ where: { id } });
}
