import { Request, Response } from 'express';
export declare function getAllSeries(req: Request, res: Response): Promise<void>;
export declare function getSeriesById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createSeries(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateSeries(req: Request, res: Response): Promise<void>;
export declare function deleteSeries(req: Request, res: Response): Promise<void>;
export declare function generateSeries(req: Request, res: Response): Promise<void>;
export declare function getSeriesCostEstimate(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=series.controller.d.ts.map