import prisma from '../config/database';
import { EpisodeStatus } from '@prisma/client';
import { callOpenAI, estimateCost } from './ai.service';
import { buildEpisodeGenerationPrompt, buildEpisodeOutlineRegenerationPrompt } from '../prompts';

// ─── Get Episodes for Series ───────────────────────────────
export async function getEpisodesBySeries(seriesId: string) {
  return prisma.episode.findMany({
    where: { seriesId },
    include: {
      scenes: { orderBy: { number: 'asc' } },
      script: true,
      mediaAssets: true,
      _count: { select: { scenes: true, mediaAssets: true } },
    },
    orderBy: { number: 'asc' },
  });
}

// ─── Get Episode By ID ─────────────────────────────────────
export async function getEpisodeById(id: string) {
  return prisma.episode.findUnique({
    where: { id },
    include: {
      series: {
        include: {
          characters: true,
        },
      },
      scenes: {
        orderBy: { number: 'asc' },
        include: { mediaAssets: true },
      },
      script: true,
      mediaAssets: true,
    },
  });
}

// ─── Update Episode ────────────────────────────────────────
export async function updateEpisode(id: string, data: Partial<{
  title: string;
  summary: string;
  status: EpisodeStatus;
}>) {
  return prisma.episode.update({
    where: { id },
    data,
    include: { scenes: true, script: true },
  });
}

// ─── Generate Episode Content ──────────────────────────────
export async function generateEpisodeContent(episodeId: string) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      series: {
        include: {
          characters: true,
        },
      },
    },
  });

  if (!episode) throw new Error('Episode not found');

  const series = episode.series;

  // Create generation job
  const job = await prisma.generationJob.create({
    data: {
      seriesId: series.id,
      type: 'EPISODE',
      targetId: episodeId,
      status: 'GENERATING',
      progress: 0,
      steps: JSON.stringify([
        { label: 'Analyzing episode context', status: 'in_progress' },
        { label: 'Generating scenes', status: 'pending' },
        { label: 'Writing script', status: 'pending' },
        { label: 'Finalizing', status: 'pending' },
      ]),
    },
  });

  await prisma.episode.update({
    where: { id: episodeId },
    data: { status: 'GENERATING' },
  });

  try {
    const prompt = buildEpisodeGenerationPrompt({
      seriesTitle: series.title,
      seriesDescription: series.description || '',
      storyline: series.storyline || '',
      genre: series.genre,
      tone: series.tone,
      episodeDuration: series.episodeDuration,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      episodeSummary: episode.summary || '',
      characters: series.characters.map(c => ({
        name: c.name,
        age: c.age || undefined,
        gender: c.gender || undefined,
        role: c.role || undefined,
        personality: c.personality || undefined,
        appearance: c.appearance || undefined,
        background: c.background || undefined,
        description: c.description || undefined,
        isLocked: c.isLocked,
      })),
    });

    const { content, usage } = await callOpenAI(prompt);

    let parsed: any;
    try {
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const match = content.match(/\{[\s\S]*\}/m);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Invalid AI response: missing JSON structure');
      }
    }

    if (!parsed.scenes || !Array.isArray(parsed.scenes)) {
      throw new Error('Invalid AI response: missing scenes');
    }

    // Delete existing scenes and script
    await prisma.scene.deleteMany({ where: { episodeId } });
    await prisma.script.deleteMany({ where: { episodeId } });

    // Create scenes
    for (const scene of parsed.scenes) {
      await prisma.scene.create({
        data: {
          episodeId,
          number: scene.number,
          title: scene.title,
          location: scene.location,
          characters: scene.characters || [],
          action: scene.action,
          dialogue: scene.dialogue,
          camera: scene.camera,
          mood: scene.mood,
        },
      });
    }

    // Create script
    if (parsed.script) {
      await prisma.script.create({
        data: {
          episodeId,
          content: parsed.script,
        },
      });
    }

    // Update episode status
    await prisma.episode.update({
      where: { id: episodeId },
      data: { status: 'IN_REVIEW' },
    });

    // Record usage
    await prisma.generationUsage.create({
      data: {
        seriesId: series.id,
        type: 'EPISODE',
        targetId: episodeId,
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
          { label: 'Analyzing episode context', status: 'completed' },
          { label: 'Generating scenes', status: 'completed' },
          { label: 'Writing script', status: 'completed' },
          { label: 'Finalizing', status: 'completed' },
        ]),
      },
    });

    return getEpisodeById(episodeId);
  } catch (error: any) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        error: error.message || 'Episode generation failed',
      },
    });

    await prisma.episode.update({
      where: { id: episodeId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
}

// ─── Publish Episode ───────────────────────────────────────
export async function publishEpisode(episodeId: string, platforms: string[]) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { scenes: true, script: true },
  });

  if (!episode) throw new Error('Episode not found');

  // Validation checks
  const checks = {
    hasTitle: !!episode.title,
    hasSummary: !!episode.summary,
    hasScenes: episode.scenes.length > 0,
    hasScript: !!episode.script,
    hasPlatforms: platforms.length > 0,
  };

  const allPassed = Object.values(checks).every(v => v);

  if (!allPassed) {
    return { success: false, checks, message: 'Not all requirements are met for publishing' };
  }

  // Simulate publishing
  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      status: 'PUBLISHING',
      platforms,
    },
  });

  // Simulate publishing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  return { success: true, checks, message: 'Episode published successfully' };
}

// ─── Cost Estimate ─────────────────────────────────────────
export async function getEpisodeCostEstimate(episodeId: string) {
  const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
  if (!episode) throw new Error('Episode not found');
  return estimateCost('episode');
}

// ─── Regenerate Episode Outline ───────────────────────────
export async function regenerateEpisodeOutline(episodeId: string) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: {
      series: {
        include: {
          characters: true,
          episodes: { orderBy: { number: 'asc' } },
        },
      },
    },
  });

  if (!episode) throw new Error('Episode not found');

  const series = episode.series;
  const otherEpisodes = series.episodes
    .filter(ep => ep.id !== episodeId)
    .map(ep => ({
      number: ep.number,
      title: ep.title,
      summary: ep.summary || '',
    }));

  const prompt = buildEpisodeOutlineRegenerationPrompt({
    seriesTitle: series.title,
    genre: series.genre,
    tone: series.tone,
    storyline: series.storyline || '',
    episodeNumber: episode.number,
    currentTitle: episode.title,
    currentSummary: episode.summary || undefined,
    otherEpisodes,
    characters: series.characters.map(c => ({
      name: c.name,
      role: c.role || undefined,
      personality: c.personality || undefined,
      isLocked: c.isLocked,
    })),
  });

  // Create generation job
  const job = await prisma.generationJob.create({
    data: {
      seriesId: series.id,
      type: 'EPISODE',
      targetId: episodeId,
      status: 'GENERATING',
      progress: 50,
    },
  });

  try {
    const { content, usage } = await callOpenAI(prompt);
    let parsed: any;
    try {
      const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const match = content.match(/\{[\s\S]*\}/m);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Invalid AI response: missing JSON structure');
      }
    }

    const updatedTitle = parsed.title || episode.title;
    const updatedSummary = parsed.summary || episode.summary;

    const updated = await prisma.episode.update({
      where: { id: episodeId },
      data: {
        title: updatedTitle,
        summary: updatedSummary,
      },
      include: {
        scenes: true,
        script: true,
      },
    });

    // Record usage
    await prisma.generationUsage.create({
      data: {
        seriesId: series.id,
        type: 'EPISODE',
        targetId: episodeId,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        estimatedCost: (usage.promptTokens * 0.00015 / 1000) + (usage.completionTokens * 0.0006 / 1000),
      },
    });

    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    });

    return updated;
  } catch (error: any) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', error: error.message },
    });
    throw error;
  }
}

export function getEpisodeOutlineCostEstimate() {
  return estimateCost('episode_outline');
}

