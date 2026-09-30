"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSceneById = getSceneById;
exports.updateScene = updateScene;
exports.regenerateScene = regenerateScene;
exports.getSceneCostEstimate = getSceneCostEstimate;
exports.updateScript = updateScript;
const database_1 = __importDefault(require("../config/database"));
const ai_service_1 = require("./ai.service");
const prompts_1 = require("../prompts");
// ─── Get Scene By ID ───────────────────────────────────────
async function getSceneById(id) {
    return database_1.default.scene.findUnique({
        where: { id },
        include: { mediaAssets: true },
    });
}
// ─── Update Scene ──────────────────────────────────────────
async function updateScene(id, data) {
    return database_1.default.scene.update({
        where: { id },
        data,
        include: { mediaAssets: true },
    });
}
// ─── Regenerate Scene ──────────────────────────────────────
async function regenerateScene(sceneId) {
    const scene = await database_1.default.scene.findUnique({
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
    if (!scene)
        throw new Error('Scene not found');
    const series = scene.episode.series;
    const episode = scene.episode;
    const prompt = (0, prompts_1.buildSceneRegenerationPrompt)({
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
    const job = await database_1.default.generationJob.create({
        data: {
            seriesId: series.id,
            type: 'SCENE',
            targetId: sceneId,
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
        // Update scene
        await database_1.default.scene.update({
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
        await database_1.default.generationUsage.create({
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
        await database_1.default.generationJob.update({
            where: { id: job.id },
            data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
        });
        return getSceneById(sceneId);
    }
    catch (error) {
        await database_1.default.generationJob.update({
            where: { id: job.id },
            data: { status: 'FAILED', error: error.message },
        });
        throw error;
    }
}
// ─── Scene Cost Estimate ───────────────────────────────────
function getSceneCostEstimate() {
    return (0, ai_service_1.estimateCost)('scene');
}
// ─── Update Script ─────────────────────────────────────────
async function updateScript(episodeId, content) {
    const existing = await database_1.default.script.findUnique({ where: { episodeId } });
    if (existing) {
        return database_1.default.script.update({
            where: { episodeId },
            data: { content, version: existing.version + 1 },
        });
    }
    return database_1.default.script.create({
        data: { episodeId, content },
    });
}
//# sourceMappingURL=scene.service.js.map