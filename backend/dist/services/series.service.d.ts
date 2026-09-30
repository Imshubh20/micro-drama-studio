import { SeriesStatus, Tone } from '@prisma/client';
export declare function createSeries(data: {
    title: string;
    prompt: string;
    genre: string;
    tone: Tone;
    episodeCount: number;
    episodeDuration: number;
    userId: string;
}): Promise<{
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
    episodes: {
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
}>;
export declare function getAllSeries(userId?: string): Promise<({
    _count: {
        characters: number;
        episodes: number;
    };
    characters: {
        id: string;
        name: string;
        role: string | null;
    }[];
    episodes: {
        id: string;
        number: number;
        status: import(".prisma/client").$Enums.EpisodeStatus;
        title: string;
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
})[]>;
export declare function getSeriesById(id: string): Promise<({
    characters: ({
        relationshipsFrom: ({
            toCharacter: {
                name: string;
            };
        } & {
            id: string;
            fromCharacterId: string;
            toCharacterId: string;
            relationship: string;
            createdAt: Date;
        })[];
        relationshipsTo: ({
            fromCharacter: {
                name: string;
            };
        } & {
            id: string;
            fromCharacterId: string;
            toCharacterId: string;
            relationship: string;
            createdAt: Date;
        })[];
    } & {
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
    })[];
    episodes: ({
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
    })[];
    generationJobs: {
        id: string;
        seriesId: string;
        type: import(".prisma/client").$Enums.GenerationType;
        targetId: string | null;
        status: import(".prisma/client").$Enums.GenerationStatus;
        progress: number;
        steps: import("@prisma/client/runtime/library").JsonValue | null;
        error: string | null;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
    }[];
    generationUsages: {
        id: string;
        seriesId: string;
        type: import(".prisma/client").$Enums.GenerationType;
        targetId: string | null;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        estimatedCost: number;
        model: string;
        createdAt: Date;
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
}) | null>;
export declare function updateSeries(id: string, data: Partial<{
    title: string;
    description: string;
    storyline: string;
    status: SeriesStatus;
    genre: string;
    tone: Tone;
}>): Promise<{
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
    episodes: {
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
}>;
export declare function generateSeriesContent(seriesId: string): Promise<({
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
    episodes: {
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
    }[];
    generationJobs: {
        id: string;
        seriesId: string;
        type: import(".prisma/client").$Enums.GenerationType;
        targetId: string | null;
        status: import(".prisma/client").$Enums.GenerationStatus;
        progress: number;
        steps: import("@prisma/client/runtime/library").JsonValue | null;
        error: string | null;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
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
}) | null>;
export declare function getSeriesCostEstimate(seriesId: string): Promise<{
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
export declare function deleteSeries(id: string): Promise<{
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
}>;
//# sourceMappingURL=series.service.d.ts.map