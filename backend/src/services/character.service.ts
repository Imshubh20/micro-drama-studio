import prisma from '../config/database';
import { callOpenAI, estimateCost } from './ai.service';
import { buildCharacterRegenerationPrompt } from '../prompts';

// ─── Get Characters for Series ─────────────────────────────
export async function getCharactersBySeries(seriesId: string) {
  return prisma.character.findMany({
    where: { seriesId },
    include: {
      relationshipsFrom: {
        include: { toCharacter: { select: { id: true, name: true } } },
      },
      relationshipsTo: {
        include: { fromCharacter: { select: { id: true, name: true } } },
      },
    },
  });
}

// ─── Get Character By ID ───────────────────────────────────
export async function getCharacterById(id: string) {
  return prisma.character.findUnique({
    where: { id },
    include: {
      relationshipsFrom: {
        include: { toCharacter: { select: { id: true, name: true } } },
      },
      relationshipsTo: {
        include: { fromCharacter: { select: { id: true, name: true } } },
      },
    },
  });
}

// ─── Update Character ──────────────────────────────────────
export async function updateCharacter(id: string, data: Partial<{
  name: string;
  age: number;
  gender: string;
  role: string;
  personality: string;
  appearance: string;
  background: string;
  description: string;
}>) {
  return prisma.character.update({ where: { id }, data });
}

// ─── Lock / Unlock Character ───────────────────────────────
export async function toggleCharacterLock(id: string, isLocked: boolean) {
  return prisma.character.update({
    where: { id },
    data: { isLocked },
  });
}

// ─── Regenerate Character ──────────────────────────────────
export async function regenerateCharacter(characterId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: { series: { include: { characters: true } } },
  });

  if (!character) throw new Error('Character not found');

  // Server-side lock check
  if (character.isLocked) {
    throw new Error('LOCKED: This character is locked and cannot be regenerated. Unlock the character first to regenerate.');
  }

  const series = character.series;
  const otherCharacters = series.characters.filter(c => c.id !== characterId);

  const prompt = buildCharacterRegenerationPrompt({
    seriesTitle: series.title,
    genre: series.genre,
    tone: series.tone,
    storyline: series.storyline || '',
    characterName: character.name,
    characterRole: character.role || undefined,
    otherCharacters: otherCharacters.map(c => ({
      name: c.name,
      role: c.role || undefined,
      isLocked: c.isLocked,
    })),
  });

  // Create generation job
  const job = await prisma.generationJob.create({
    data: {
      seriesId: series.id,
      type: 'CHARACTER',
      targetId: characterId,
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

    // Update character
    await prisma.character.update({
      where: { id: characterId },
      data: {
        age: parsed.age,
        gender: parsed.gender,
        role: parsed.role,
        personality: parsed.personality,
        appearance: parsed.appearance,
        background: parsed.background,
        description: parsed.description,
      },
    });

    // Record usage
    await prisma.generationUsage.create({
      data: {
        seriesId: series.id,
        type: 'CHARACTER',
        targetId: characterId,
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

    return getCharacterById(characterId);
  } catch (error: any) {
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', error: error.message },
    });
    throw error;
  }
}

// ─── Character Cost Estimate ───────────────────────────────
export function getCharacterCostEstimate() {
  return estimateCost('character');
}
