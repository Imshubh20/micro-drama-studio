export declare function getCharactersBySeries(seriesId: string): Promise<({
    relationshipsFrom: ({
        toCharacter: {
            id: string;
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
            id: string;
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
})[]>;
export declare function getCharacterById(id: string): Promise<({
    relationshipsFrom: ({
        toCharacter: {
            id: string;
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
            id: string;
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
}) | null>;
export declare function updateCharacter(id: string, data: Partial<{
    name: string;
    age: number;
    gender: string;
    role: string;
    personality: string;
    appearance: string;
    background: string;
    description: string;
}>): Promise<{
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
}>;
export declare function toggleCharacterLock(id: string, isLocked: boolean): Promise<{
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
}>;
export declare function regenerateCharacter(characterId: string): Promise<({
    relationshipsFrom: ({
        toCharacter: {
            id: string;
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
            id: string;
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
}) | null>;
export declare function getCharacterCostEstimate(): {
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
//# sourceMappingURL=character.service.d.ts.map