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
const express_1 = require("express");
const seriesCtrl = __importStar(require("../controllers/series.controller"));
const episodeCtrl = __importStar(require("../controllers/episode.controller"));
const characterCtrl = __importStar(require("../controllers/character.controller"));
const sceneCtrl = __importStar(require("../controllers/scene.controller"));
const mediaCtrl = __importStar(require("../controllers/media.controller"));
const generationCtrl = __importStar(require("../controllers/generation.controller"));
const ai_service_1 = require("../services/ai.service");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// ─── Series ────────────────────────────────────────────────
router.get('/series', seriesCtrl.getAllSeries);
router.post('/series', seriesCtrl.createSeries);
router.get('/series/:id', seriesCtrl.getSeriesById);
router.put('/series/:id', seriesCtrl.updateSeries);
router.delete('/series/:id', seriesCtrl.deleteSeries);
router.post('/series/:id/generate', seriesCtrl.generateSeries);
router.get('/series/:id/cost-estimate', seriesCtrl.getSeriesCostEstimate);
// ─── Episodes ──────────────────────────────────────────────
router.get('/series/:id/episodes', episodeCtrl.getEpisodesBySeries);
router.get('/episodes/:id', episodeCtrl.getEpisodeById);
router.put('/episodes/:id', episodeCtrl.updateEpisode);
router.post('/episodes/:id/generate', episodeCtrl.generateEpisode);
router.post('/episodes/:id/regenerate-outline', episodeCtrl.regenerateEpisodeOutline);
router.get('/episodes/:id/outline-cost-estimate', episodeCtrl.getEpisodeOutlineCostEstimate);
router.post('/episodes/:id/publish', episodeCtrl.publishEpisode);
router.get('/episodes/:id/cost-estimate', episodeCtrl.getEpisodeCostEstimate);
// ─── Characters ────────────────────────────────────────────
router.get('/series/:seriesId/characters', characterCtrl.getCharactersBySeries);
router.get('/characters/:id', characterCtrl.getCharacterById);
router.put('/characters/:id', characterCtrl.updateCharacter);
router.patch('/characters/:id/lock', characterCtrl.toggleCharacterLock);
router.post('/characters/:id/regenerate', characterCtrl.regenerateCharacter);
router.get('/characters/:id/cost-estimate', characterCtrl.getCharacterCostEstimate);
// ─── Scenes ────────────────────────────────────────────────
router.get('/scenes/:id', sceneCtrl.getSceneById);
router.put('/scenes/:id', sceneCtrl.updateScene);
router.post('/scenes/:id/regenerate', sceneCtrl.regenerateScene);
router.get('/scenes/:id/cost-estimate', sceneCtrl.getSceneCostEstimate);
// ─── Scripts ───────────────────────────────────────────────
router.put('/episodes/:episodeId/script', sceneCtrl.updateScript);
// ─── Media ─────────────────────────────────────────────────
router.post('/media/upload', upload.single('file'), mediaCtrl.uploadMedia);
router.get('/episodes/:episodeId/media', mediaCtrl.getMediaByEpisode);
router.delete('/media/:id', mediaCtrl.deleteMedia);
// ─── Generation ────────────────────────────────────────────
router.get('/generations/:id', generationCtrl.getGenerationJob);
router.get('/series/:seriesId/usage', generationCtrl.getGenerationUsage);
// ─── Health ────────────────────────────────────────────────
router.get('/health', (_, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        demoMode: (0, ai_service_1.isDemoMode)(),
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map