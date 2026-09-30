import { Request, Response } from 'express';
export declare function getEpisodesBySeries(req: Request, res: Response): Promise<void>;
export declare function getEpisodeById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateEpisode(req: Request, res: Response): Promise<void>;
export declare function generateEpisode(req: Request, res: Response): Promise<void>;
export declare function publishEpisode(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getEpisodeCostEstimate(req: Request, res: Response): Promise<void>;
export declare function regenerateEpisodeOutline(req: Request, res: Response): Promise<void>;
export declare function getEpisodeOutlineCostEstimate(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=episode.controller.d.ts.map