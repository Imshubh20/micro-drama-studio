export declare function getSceneById(id: string): Promise<({
    mediaAssets: {
        id: string;
        episodeId: string | null;
        sceneId: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        url: string;
        publicId: string | null;
        provider: string;
        status: import(".prisma/client").$Enums.MediaStatus;
        filename: string | null;
        createdAt: Date;
    }[];
} & {
    id: string;
    episodeId: string;
    number: number;
    title: string | null;
    location: string | null;
    action: string | null;
    dialogue: string | null;
    camera: string | null;
    mood: string | null;
    characters: string[];
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function updateScene(id: string, data: Partial<{
    title: string;
    location: string;
    action: string;
    dialogue: string;
    camera: string;
    mood: string;
    characters: string[];
}>): Promise<{
    mediaAssets: {
        id: string;
        episodeId: string | null;
        sceneId: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        url: string;
        publicId: string | null;
        provider: string;
        status: import(".prisma/client").$Enums.MediaStatus;
        filename: string | null;
        createdAt: Date;
    }[];
} & {
    id: string;
    episodeId: string;
    number: number;
    title: string | null;
    location: string | null;
    action: string | null;
    dialogue: string | null;
    camera: string | null;
    mood: string | null;
    characters: string[];
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function regenerateScene(sceneId: string): Promise<({
    mediaAssets: {
        id: string;
        episodeId: string | null;
        sceneId: string | null;
        type: import(".prisma/client").$Enums.MediaType;
        url: string;
        publicId: string | null;
        provider: string;
        status: import(".prisma/client").$Enums.MediaStatus;
        filename: string | null;
        createdAt: Date;
    }[];
} & {
    id: string;
    episodeId: string;
    number: number;
    title: string | null;
    location: string | null;
    action: string | null;
    dialogue: string | null;
    camera: string | null;
    mood: string | null;
    characters: string[];
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function getSceneCostEstimate(): {
    estimatedPromptTokens: number;
    estimatedCompletionTokens: number;
    estimatedTotalTokens: number;
    estimatedCost: number;
    breakdown: {
        item: string;
        tokens: number;
        cost: number;
    }[];
};
export declare function updateScript(episodeId: string, content: string): Promise<{
    id: string;
    episodeId: string;
    content: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=scene.service.d.ts.map