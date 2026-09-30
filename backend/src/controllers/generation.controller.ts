import { Request, Response } from 'express';
import prisma from '../config/database';

export async function getGenerationJob(req: Request, res: Response) {
  try {
    const job = await prisma.generationJob.findUnique({
      where: { id: req.params.id as string },
    });
    if (!job) return res.status(404).json({ success: false, error: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getGenerationUsage(req: Request, res: Response) {
  try {
    const usages = await prisma.generationUsage.findMany({
      where: { seriesId: req.params.seriesId as string },
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
