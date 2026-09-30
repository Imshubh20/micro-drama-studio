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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEpisodesBySeries = getEpisodesBySeries;
exports.getEpisodeById = getEpisodeById;
exports.updateEpisode = updateEpisode;
exports.generateEpisode = generateEpisode;
exports.publishEpisode = publishEpisode;
exports.getEpisodeCostEstimate = getEpisodeCostEstimate;
exports.regenerateEpisodeOutline = regenerateEpisodeOutline;
exports.getEpisodeOutlineCostEstimate = getEpisodeOutlineCostEstimate;
const episodeService = __importStar(require("../services/episode.service"));
async function getEpisodesBySeries(req, res) {
    try {
        const episodes = await episodeService.getEpisodesBySeries(req.params.id);
        res.json({ success: true, data: episodes });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getEpisodeById(req, res) {
    try {
        const episode = await episodeService.getEpisodeById(req.params.id);
        if (!episode)
            return res.status(404).json({ success: false, error: 'Episode not found' });
        res.json({ success: true, data: episode });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function updateEpisode(req, res) {
    try {
        const episode = await episodeService.updateEpisode(req.params.id, req.body);
        res.json({ success: true, data: episode });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function generateEpisode(req, res) {
    try {
        const result = await episodeService.generateEpisodeContent(req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function publishEpisode(req, res) {
    try {
        const { platforms } = req.body;
        if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
            return res.status(400).json({ success: false, error: 'At least one platform is required' });
        }
        const result = await episodeService.publishEpisode(req.params.id, platforms);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getEpisodeCostEstimate(req, res) {
    try {
        const estimate = await episodeService.getEpisodeCostEstimate(req.params.id);
        res.json({ success: true, data: estimate });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function regenerateEpisodeOutline(req, res) {
    try {
        const episode = await episodeService.regenerateEpisodeOutline(req.params.id);
        res.json({ success: true, data: episode });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
async function getEpisodeOutlineCostEstimate(req, res) {
    try {
        const estimate = episodeService.getEpisodeOutlineCostEstimate();
        res.json({ success: true, data: estimate });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}
//# sourceMappingURL=episode.controller.js.map