import prisma from '../config/database';
import { callOpenAI, estimateCost } from './ai.service';
import { buildSceneRegenerationPrompt } from '../prompts';

// ─── Get Scene By ID ───────────────────────────────────────
export async function getSceneById(id: string) {
  return prisma.scene.findUnique({
    where: { id },
    include: { mediaAssets: true },
  });
}

// ─── Update Scene ──────────────────────────────────────────
export async function updateScene(id: string, data: Partial<{
  title: string;
  location: string;
  action: string;
  dialogue: string;
  camera: string;
  mood: string;
  characters: string[];
}>) {
  return prisma.scene.update({
    where: { id },
    data,
    include: { mediaAssets: true },
  });
}

// ─── Regenerate Scene ──────────────────────────────────────
export async function regenerateScene(sceneId: string) {
  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
    include: {
      episode: {
        include: {
          series: {
            include: { characters: true },
          },
        },
      },
    },
  });

  if (!scene) throw new Error('Scene not found');

  const series = scene.episode.series;
  const episode = scene.episode;

  const prompt = buildSceneRegenerationPrompt({
    seriesTitle: series.title,
    genre: series.genre,
    tone: series.tone,
    episodeTitle: episode.title,
    episodeSummary: episode.summary || '',
    sceneNumber: scene.number,
    characters: series.characters.map(c => ({
      name: c.name,
      role: c.role || undefined,
      isLocked: c.isLocked,
    })),
  });

  // Create generation job
  const job = await prisma.generationJob.create({
    data: {
      seriesId: series.id,
      type: 'SCENE',
      targetId: sceneId,
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

    // Update scene
    await prisma.scene.update({
      where: { id: sceneId },
      data: {
        title: parsed.title,
        location: parsed.location,
        characters: parsed.characters || [],
        action: parsed.action,
        dialogue: parsed.dialogue,
        camera: parsed.camera,
        mood: parsed.mood,
      },
    });

    // Record usage
    await prisma.generationUsage.create({
      data: {
        seriesId: series.id,
        type: 'SCENE',
        targetId: sceneId,
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

    return getSceneById(sceneId);
  } catch (error: any) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', error: error.message },
    });
    throw error;
  }
}

// ─── Scene Cost Estimate ───────────────────────────────────
export function getSceneCostEstimate() {
  return estimateCost('scene');
}

// ─── Update Script ─────────────────────────────────────────
export async function updateScript(episodeId: string, content: string) {
  const existing = await prisma.script.findUnique({ where: { episodeId } });
  if (existing) {
    return prisma.script.update({
      where: { episodeId },
      data: { content, version: existing.version + 1 },
    });
  }
  return prisma.script.create({
    data: { episodeId, content },
  });
}
