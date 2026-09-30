import { Tone } from '@prisma/client';
export interface CharacterProfile {
    name: string;
    age?: number;
    gender?: string;
    role?: string;
    personality?: string;
    appearance?: string;
    background?: string;
    description?: string;
    isLocked?: boolean;
}
export declare function buildSeriesGenerationPrompt(params: {
    prompt: string;
    title?: string;
    genre: string;
    tone: Tone;
    episodeCount: number;
    episodeDuration: number;
    seriesMode?: 'SERIES' | 'ANTHOLOGY';
    lockedCharacters?: CharacterProfile[];
}): string;
export declare function buildEpisodeGenerationPrompt(params: {
    seriesTitle: string;
    seriesDescription: string;
    storyline: string;
    genre: string;
    tone: Tone;
    episodeDuration: number;
    episodeNumber: number;
    episodeTitle: string;
    episodeSummary: string;
    characters: CharacterProfile[];
    lockedCharacters?: CharacterProfile[];
}): string;
export declare function buildCharacterRegenerationPrompt(params: {
    seriesTitle: string;
    genre: string;
    tone: Tone;
    storyline: string;
    characterName: string;
    characterRole?: string;
    otherCharacters: CharacterProfile[];
}): string;
export declare function buildSceneRegenerationPrompt(params: {
    seriesTitle: string;
    genre: string;
    tone: Tone;
    episodeTitle: string;
    episodeSummary: string;
    sceneNumber: number;
    characters: CharacterProfile[];
    lockedCharacters?: CharacterProfile[];
}): string;
export declare function buildEpisodeOutlineRegenerationPrompt(params: {
    seriesTitle: string;
    genre: string;
    tone: Tone;
    storyline: string;
    episodeNumber: number;
    currentTitle?: string;
    currentSummary?: string;
    otherEpisodes: Array<{
        number: number;
        title: string;
        summary: string;
    }>;
    characters: CharacterProfile[];
}): string;
//# sourceMappingURL=index.d.ts.map