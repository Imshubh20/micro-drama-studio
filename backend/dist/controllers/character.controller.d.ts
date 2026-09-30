import { Request, Response } from 'express';
export declare function getCharactersBySeries(req: Request, res: Response): Promise<void>;
export declare function getCharacterById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateCharacter(req: Request, res: Response): Promise<void>;
export declare function toggleCharacterLock(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function regenerateCharacter(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getCharacterCostEstimate(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=character.controller.d.ts.map