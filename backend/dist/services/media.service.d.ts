export declare function uploadMedia(params: {
    filePath: string;
    episodeId?: string;
    sceneId?: string;
    type?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'THUMBNAIL';
}): Promise<{
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
}>;
export declare function uploadMediaFromBuffer(params: {
    buffer: Buffer;
    filename: string;
    episodeId?: string;
    sceneId?: string;
    type?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'THUMBNAIL';
}): Promise<{
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
}>;
export declare function getMediaByEpisode(episodeId: string): Promise<{
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
}[]>;
export declare function deleteMedia(id: string): Promise<{
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
}>;
//# sourceMappingURL=media.service.d.ts.map