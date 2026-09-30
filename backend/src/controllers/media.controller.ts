import { Request, Response } from 'express';
import * as mediaService from '../services/media.service';

export async function uploadMedia(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { episodeId, sceneId, type } = req.body;

    const asset = await mediaService.uploadMediaFromBuffer({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      episodeId: episodeId || undefined,
      sceneId: sceneId || undefined,
      type: type || 'IMAGE',
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMediaByEpisode(req: Request, res: Response) {
  try {
    const media = await mediaService.getMediaByEpisode(req.params.episodeId as string);
    res.json({ success: true, data: media });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getMediaByScene(req: Request, res: Response) {
  try {
    const media = await mediaService.getMediaByScene(req.params.sceneId as string);
    res.json({ success: true, data: media });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function generateMedia(req: Request, res: Response) {
  try {
    const { seriesId, episodeId, sceneId, type, sceneTitle } = req.body;

    if (!seriesId || !episodeId || !sceneId || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: seriesId, episodeId, sceneId, type',
      });
    }

    if (!['IMAGE', 'VIDEO', 'AUDIO'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type. Must be IMAGE, VIDEO, or AUDIO',
      });
    }

    const result = await mediaService.generateMockMedia({
      seriesId,
      episodeId,
      sceneId,
      type,
      sceneTitle,
    });

    res.status(202).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function deleteMedia(req: Request, res: Response) {
  try {
    await mediaService.deleteMedia(req.params.id as string);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
