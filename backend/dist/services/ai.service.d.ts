export declare function isDemoMode(): boolean;
export declare function callGemini(prompt: string): Promise<{
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}>;
export declare const callOpenAI: typeof callGemini;
export declare const callAI: typeof callGemini;
export declare function callMockAI(prompt: string): Promise<{
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}>;
export declare function estimateCost(type: 'series' | 'episode' | 'episode_outline' | 'character' | 'scene', episodeCount?: number): {
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
//# sourceMappingURL=ai.service.d.ts.map