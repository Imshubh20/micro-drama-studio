import { Request, Response } from 'express';
import * as episodeService from '../services/episode.service';

export async function getEpisodesBySeries(req: Request, res: Response) {
  try {
    const episodes = await episodeService.getEpisodesBySeries(req.params.id as string);
    res.json({ success: true, data: episodes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEpisodeById(req: Request, res: Response) {
  try {
    const episode = await episodeService.getEpisodeById(req.params.id as string);
    if (!episode) return res.status(404).json({ success: false, error: 'Episode not found' });
    res.json({ success: true, data: episode });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateEpisode(req: Request, res: Response) {
  try {
    const episode = await episodeService.updateEpisode(req.params.id as string, req.body);
    res.json({ success: true, data: episode });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function generateEpisode(req: Request, res: Response) {
  try {
    const result = await episodeService.generateEpisodeContent(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function publishEpisode(req: Request, res: Response) {
  try {
    const { platforms } = req.body;
    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one platform is required' });
    }
    const result = await episodeService.publishEpisode(req.params.id as string, platforms);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEpisodeCostEstimate(req: Request, res: Response) {
  try {
    const estimate = await episodeService.getEpisodeCostEstimate(req.params.id as string);
    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function regenerateEpisodeOutline(req: Request, res: Response) {
  try {
    const episode = await episodeService.regenerateEpisodeOutline(req.params.id as string);
    res.json({ success: true, data: episode });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getEpisodeOutlineCostEstimate(req: Request, res: Response) {
  try {
    const estimate = episodeService.getEpisodeOutlineCostEstimate();
    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

