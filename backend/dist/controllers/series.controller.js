"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSeries = getAllSeries;
exports.getSeriesById = getSeriesById;
exports.createSeries = createSeries;
exports.updateSeries = updateSeries;
exports.deleteSeries = deleteSeries;
exports.generateSeries = generateSeries;
exports.getSeriesCostEstimate = getSeriesCostEstimate;
const seriesService = __importStar(require("../services/series.service"));
const database_1 = __importDefault(require("../config/database"));
// Demo user email used when no authentication is present
const DEMO_USER_EMAIL = 'demo@microdrama.local';
async function getAllSeries(req, res) {
    try {
        const series = await seriesService.getAllSeries();
        res.json({ success: true, data: series });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getSeriesById(req, res) {
    try {
        const series = await seriesService.getSeriesById(req.params.id);
        if (!series)
            return res.status(404).json({ success: false, error: 'Series not found' });
        res.json({ success: true, data: series });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function createSeries(req, res) {
    try {
        const { title, prompt, genre, tone, episodeCount, episodeDuration } = req.body;
        if (!prompt || !genre) {
            return res.status(400).json({ success: false, error: 'Prompt and genre are required' });
        }
        // Ensure demo user exists and use its id when auth is not implemented
        const demoUser = await database_1.default.user.upsert({
            where: { email: DEMO_USER_EMAIL },
            update: { name: 'Demo Creator' },
            create: { name: 'Demo Creator', email: DEMO_USER_EMAIL },
        });
        const series = await seriesService.createSeries({
            title: title || 'Untitled Series',
            prompt,
            genre,
            tone: tone || 'DRAMATIC',
            episodeCount: episodeCount || 5,
            episodeDuration: episodeDuration || 3,
            userId: demoUser.id,
        });
        res.status(201).json({ success: true, data: series });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function updateSeries(req, res) {
    try {
        const series = await seriesService.updateSeries(req.params.id, req.body);
        res.json({ success: true, data: series });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function deleteSeries(req, res) {
    try {
        await seriesService.deleteSeries(req.params.id);
        res.json({ success: true, message: 'Series deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function generateSeries(req, res) {
    try {
        const result = await seriesService.generateSeriesContent(req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getSeriesCostEstimate(req, res) {
    try {
        const estimate = await seriesService.getSeriesCostEstimate(req.params.id);
        res.json({ success: true, data: estimate });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=series.controller.js.map