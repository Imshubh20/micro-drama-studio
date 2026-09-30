"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenerationJob = getGenerationJob;
exports.getGenerationUsage = getGenerationUsage;
const database_1 = __importDefault(require("../config/database"));
async function getGenerationJob(req, res) {
    try {
        const job = await database_1.default.generationJob.findUnique({
            where: { id: req.params.id },
        });
        if (!job)
            return res.status(404).json({ success: false, error: 'Job not found' });
        res.json({ success: true, data: job });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getGenerationUsage(req, res) {
    try {
        const usages = await database_1.default.generationUsage.findMany({
            where: { seriesId: req.params.seriesId },
            orderBy: { createdAt: 'desc' },
        });
        const totalCost = usages.reduce((sum, u) => sum + u.estimatedCost, 0);
        const totalTokens = usages.reduce((sum, u) => sum + u.totalTokens, 0);
        res.json({
            success: true,
            data: {
                usages,
                summary: {
                    totalCost: Math.round(totalCost * 10000) / 10000,
                    totalTokens,
                    generationCount: usages.length,
                },
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=generation.controller.js.map