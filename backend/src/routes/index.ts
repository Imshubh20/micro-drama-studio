import { Router } from 'express';
import * as seriesCtrl from '../controllers/series.controller';
import * as episodeCtrl from '../controllers/episode.controller';
import * as characterCtrl from '../controllers/character.controller';
import * as sceneCtrl from '../controllers/scene.controller';
import * as mediaCtrl from '../controllers/media.controller';
import * as generationCtrl from '../controllers/generation.controller';
import { isDemoMode } from '../services/ai.service';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

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
router.post('/media/generate', mediaCtrl.generateMedia);
router.get('/episodes/:episodeId/media', mediaCtrl.getMediaByEpisode);
router.get('/scenes/:sceneId/media', mediaCtrl.getMediaByScene);
router.delete('/media/:id', mediaCtrl.deleteMedia);

// ─── Generation ────────────────────────────────────────────
router.get('/generations/:id', generationCtrl.getGenerationJob);
router.get('/series/:seriesId/usage', generationCtrl.getGenerationUsage);

// ─── Health ────────────────────────────────────────────────
router.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    demoMode: isDemoMode(),
  });
});

export default router;
