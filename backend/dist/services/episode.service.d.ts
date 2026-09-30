import { EpisodeStatus } from '@prisma/client';
export declare function getEpisodesBySeries(seriesId: string): Promise<({
    _count: {
        mediaAssets: number;
        scenes: number;
    };
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
    scenes: {
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
    }[];
    script: {
        id: string;
        episodeId: string;
        content: string;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    seriesId: string;
    number: number;
    title: string;
    summary: string | null;
    status: import(".prisma/client").$Enums.EpisodeStatus;
    publishedAt: Date | null;
    platforms: string[];
    createdAt: Date;
    updatedAt: Date;
})[]>;
export declare function getEpisodeById(id: string): Promise<({
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
    scenes: ({
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
    })[];
    script: {
        id: string;
        episodeId: string;
        content: string;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    series: {
        characters: {
            id: string;
            seriesId: string;
            name: string;
            age: number | null;
            gender: string | null;
            role: string | null;
            personality: string | null;
            appearance: string | null;
            background: string | null;
            description: string | null;
            isLocked: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        prompt: string;
        genre: string;
        tone: import(".prisma/client").$Enums.Tone;
        episodeCount: number;
        episodeDuration: number;
        storyline: string | null;
        status: import(".prisma/client").$Enums.SeriesStatus;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    seriesId: string;
    number: number;
    title: string;
    summary: string | null;
    status: import(".prisma/client").$Enums.EpisodeStatus;
    publishedAt: Date | null;
    platforms: string[];
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function updateEpisode(id: string, data: Partial<{
    title: string;
    summary: string;
    status: EpisodeStatus;
}>): Promise<{
    scenes: {
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
    }[];
    script: {
        id: string;
        episodeId: string;
        content: string;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    seriesId: string;
    number: number;
    title: string;
    summary: string | null;
    status: import(".prisma/client").$Enums.EpisodeStatus;
    publishedAt: Date | null;
    platforms: string[];
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function generateEpisodeContent(episodeId: string): Promise<({
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
    scenes: ({
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
    })[];
    script: {
        id: string;
        episodeId: string;
        content: string;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    series: {
        characters: {
            id: string;
            seriesId: string;
            name: string;
            age: number | null;
            gender: string | null;
            role: string | null;
            personality: string | null;
            appearance: string | null;
            background: string | null;
            description: string | null;
            isLocked: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        title: string;
        description: string | null;
        prompt: string;
        genre: string;
        tone: import(".prisma/client").$Enums.Tone;
        episodeCount: number;
        episodeDuration: number;
        storyline: string | null;
        status: import(".prisma/client").$Enums.SeriesStatus;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    id: string;
    seriesId: string;
    number: number;
    title: string;
    summary: string | null;
    status: import(".prisma/client").$Enums.EpisodeStatus;
    publishedAt: Date | null;
    platforms: string[];
    createdAt: Date;
    updatedAt: Date;
}) | null>;
export declare function publishEpisode(episodeId: string, platforms: string[]): Promise<{
    success: boolean;
    checks: {
        hasTitle: boolean;
        hasSummary: boolean;
        hasScenes: boolean;
        hasScript: boolean;
        hasPlatforms: boolean;
    };
    message: string;
}>;
export declare function getEpisodeCostEstimate(episodeId: string): Promise<{
    estimatedPromptTokens: number;
    estimatedCompletionTokens: number;
    estimatedTotalTokens: number;
    estimatedCost: number;
    breakdown: {
        item: string;
        tokens: number;
        cost: number;
    }[];
}>;
export declare function regenerateEpisodeOutline(episodeId: string): Promise<{
    scenes: {
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
    }[];
    script: {
        id: string;
        episodeId: string;
        content: string;
        version: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
} & {
    id: string;
    seriesId: string;
    number: number;
    title: string;
    summary: string | null;
    status: import(".prisma/client").$Enums.EpisodeStatus;
    publishedAt: Date | null;
    platforms: string[];
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function getEpisodeOutlineCostEstimate(): {
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
//# sourceMappingURL=episode.service.d.ts.map