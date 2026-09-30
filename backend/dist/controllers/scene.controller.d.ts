import { Request, Response } from 'express';
export declare function getSceneById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateScene(req: Request, res: Response): Promise<void>;
export declare function regenerateScene(req: Request, res: Response): Promise<void>;
export declare function getSceneCostEstimate(req: Request, res: Response): Promise<void>;
export declare function updateScript(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=scene.controller.d.ts.map