import { Request, Response } from 'express';
import * as characterService from '../services/character.service';

export async function getCharactersBySeries(req: Request, res: Response) {
  try {
    const characters = await characterService.getCharactersBySeries(req.params.seriesId as string);
    res.json({ success: true, data: characters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCharacterById(req: Request, res: Response) {
  try {
    const character = await characterService.getCharacterById(req.params.id as string);
    if (!character) return res.status(404).json({ success: false, error: 'Character not found' });
    res.json({ success: true, data: character });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateCharacter(req: Request, res: Response) {
  try {
    const character = await characterService.updateCharacter(req.params.id as string, req.body);
    res.json({ success: true, data: character });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function toggleCharacterLock(req: Request, res: Response) {
  try {
    const { isLocked } = req.body;
    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isLocked must be a boolean' });
    }
    const character = await characterService.toggleCharacterLock(req.params.id as string, isLocked);
    res.json({ success: true, data: character });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function regenerateCharacter(req: Request, res: Response) {
  try {
    const character = await characterService.regenerateCharacter(req.params.id as string);
    res.json({ success: true, data: character });
  } catch (error: any) {
    // Check if it's a lock error
    if (error.message?.includes('LOCKED')) {
      return res.status(403).json({ success: false, error: error.message, code: 'CHARACTER_LOCKED' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getCharacterCostEstimate(req: Request, res: Response) {
  try {
    const estimate = characterService.getCharacterCostEstimate();
    res.json({ success: true, data: estimate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
