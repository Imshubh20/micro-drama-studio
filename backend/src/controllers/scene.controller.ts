import { Request, Response } from 'express';
import * as sceneService from '../services/scene.service';

export async function getSceneById(req: Request, res: Response) {
  try {
    const scene = await sceneService.getSceneById(req.params.id as string);
    if (!scene) return res.status(404).json({ success: false, error: 'Scene not found' });
    res.json({ success: true, data: scene });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateScene(req: Request, res: Response) {
  try {
    const scene = await sceneService.updateScene(req.params.id as string, req.body);
    res.json({ success: true, data: scene });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function regenerateScene(req: Request, res: Response) {
  try {
    const scene = await sceneService.regenerateScene(req.params.id as string);
    res.json({ success: true, data: scene });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSceneCostEstimate(req: Request, res: Response) {
  try {
    const estimate = sceneService.getSceneCostEstimate();
    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateScript(req: Request, res: Response) {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'Script content is required' });
    const script = await sceneService.updateScript(req.params.episodeId as string, content);
    res.json({ success: true, data: script });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
