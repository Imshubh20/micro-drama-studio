import { Request, Response } from 'express';
import * as seriesService from '../services/series.service';
import prisma from '../config/database';
import { Tone } from '@prisma/client';

// Demo user email used when no authentication is present
const DEMO_USER_EMAIL = 'demo@microdrama.local';

export async function getAllSeries(req: Request, res: Response) {
  try {
    const series = await seriesService.getAllSeries();
    res.json({ success: true, data: series });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSeriesById(req: Request, res: Response) {
  try {
    const series = await seriesService.getSeriesById(req.params.id as string);
    if (!series) return res.status(404).json({ success: false, error: 'Series not found' });
    res.json({ success: true, data: series });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createSeries(req: Request, res: Response) {
  try {
    const { title, prompt, genre, tone, episodeCount, episodeDuration } = req.body;

    if (!prompt || !genre) {
      return res.status(400).json({ success: false, error: 'Prompt and genre are required' });
    }

    // Ensure demo user exists and use its id when auth is not implemented
    const demoUser = await prisma.user.upsert({
      where: { email: DEMO_USER_EMAIL },
      update: { name: 'Demo Creator' },
      create: { name: 'Demo Creator', email: DEMO_USER_EMAIL },
    });

    const series = await seriesService.createSeries({
      title: title || 'Untitled Series',
      prompt,
      genre,
      tone: (tone as Tone) || 'DRAMATIC',
      episodeCount: episodeCount || 5,
      episodeDuration: episodeDuration || 3,
      userId: demoUser.id,
    });

    res.status(201).json({ success: true, data: series });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateSeries(req: Request, res: Response) {
  try {
    const series = await seriesService.updateSeries(req.params.id as string, req.body);
    res.json({ success: true, data: series });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteSeries(req: Request, res: Response) {
  try {
    await seriesService.deleteSeries(req.params.id as string);
    res.json({ success: true, message: 'Series deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function generateSeries(req: Request, res: Response) {
  try {
    const result = await seriesService.generateSeriesContent(req.params.id as string);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getSeriesCostEstimate(req: Request, res: Response) {
  try {
    const estimate = await seriesService.getSeriesCostEstimate(req.params.id as string);
    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
