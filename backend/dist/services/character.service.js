"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCharactersBySeries = getCharactersBySeries;
exports.getCharacterById = getCharacterById;
exports.updateCharacter = updateCharacter;
exports.toggleCharacterLock = toggleCharacterLock;
exports.regenerateCharacter = regenerateCharacter;
exports.getCharacterCostEstimate = getCharacterCostEstimate;
const database_1 = __importDefault(require("../config/database"));
const ai_service_1 = require("./ai.service");
const prompts_1 = require("../prompts");
// ─── Get Characters for Series ─────────────────────────────
async function getCharactersBySeries(seriesId) {
    return database_1.default.character.findMany({
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
async function getCharacterById(id) {
    return database_1.default.character.findUnique({
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
async function updateCharacter(id, data) {
    return database_1.default.character.update({ where: { id }, data });
}
// ─── Lock / Unlock Character ───────────────────────────────
async function toggleCharacterLock(id, isLocked) {
    return database_1.default.character.update({
        where: { id },
        data: { isLocked },
    });
}
// ─── Regenerate Character ──────────────────────────────────
async function regenerateCharacter(characterId) {
    const character = await database_1.default.character.findUnique({
        where: { id: characterId },
        include: { series: { include: { characters: true } } },
    });
    if (!character)
        throw new Error('Character not found');
    // Server-side lock check
    if (character.isLocked) {
        throw new Error('LOCKED: This character is locked and cannot be regenerated. Unlock the character first to regenerate.');
    }
    const series = character.series;
    const otherCharacters = series.characters.filter(c => c.id !== characterId);
    const prompt = (0, prompts_1.buildCharacterRegenerationPrompt)({
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
    const job = await database_1.default.generationJob.create({
        data: {
            seriesId: series.id,
            type: 'CHARACTER',
            targetId: characterId,
            status: 'GENERATING',
            progress: 50,
        },
    });
    try {
        const { content, usage } = await (0, ai_service_1.callOpenAI)(prompt);
        let parsed;
        try {
            const cleaned = content.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
            parsed = JSON.parse(cleaned);
        }
        catch {
            const match = content.match(/\{[\s\S]*\}/m);
            if (match) {
                parsed = JSON.parse(match[0]);
            }
            else {
                throw new Error('Invalid AI response: missing JSON structure');
            }
        }
        // Update character
        await database_1.default.character.update({
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
        await database_1.default.generationUsage.create({
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
        await database_1.default.generationJob.update({
            where: { id: job.id },
            data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
        });
        return getCharacterById(characterId);
    }
    catch (error) {
        await database_1.default.generationJob.update({
            where: { id: job.id },
            data: { status: 'FAILED', error: error.message },
        });
        throw error;
    }
}
// ─── Character Cost Estimate ───────────────────────────────
function getCharacterCostEstimate() {
    return (0, ai_service_1.estimateCost)('character');
}
//# sourceMappingURL=character.service.js.map