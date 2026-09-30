"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = uploadMedia;
exports.uploadMediaFromBuffer = uploadMediaFromBuffer;
exports.getMediaByEpisode = getMediaByEpisode;
exports.deleteMedia = deleteMedia;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
// ─── Upload to Cloudinary ──────────────────────────────────
async function uploadMedia(params) {
    const hasCloudinary = config_1.config.cloudinary.cloudName && config_1.config.cloudinary.apiKey;
    let url;
    let publicId;
    let provider = 'cloudinary';
    if (hasCloudinary) {
        const result = await cloudinary_1.default.uploader.upload(params.filePath, {
            folder: 'micro-drama-studio',
            resource_type: 'auto',
        });
        url = result.secure_url;
        publicId = result.public_id;
    }
    else {
        // Demo mode: use placeholder
        url = `https://placehold.co/1920x1080/1a1a2e/e94560?text=Scene+Asset`;
        publicId = `demo_${Date.now()}`;
        provider = 'demo';
    }
    return database_1.default.mediaAsset.create({
        data: {
            episodeId: params.episodeId || null,
            sceneId: params.sceneId || null,
            type: params.type || 'IMAGE',
            url,
            publicId,
            provider,
            status: 'READY',
        },
    });
}
// ─── Upload from Buffer ────────────────────────────────────
async function uploadMediaFromBuffer(params) {
    const hasCloudinary = config_1.config.cloudinary.cloudName && config_1.config.cloudinary.apiKey;
    let url;
    let publicId;
    let provider = 'cloudinary';
    if (hasCloudinary) {
        const result = await new Promise((resolve, reject) => {
            cloudinary_1.default.uploader.upload_stream({ folder: 'micro-drama-studio', resource_type: 'auto' }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            }).end(params.buffer);
        });
        url = result.secure_url;
        publicId = result.public_id;
    }
    else {
        url = `https://placehold.co/1920x1080/1a1a2e/e94560?text=${encodeURIComponent(params.filename)}`;
        publicId = `demo_${Date.now()}`;
        provider = 'demo';
    }
    return database_1.default.mediaAsset.create({
        data: {
            episodeId: params.episodeId || null,
            sceneId: params.sceneId || null,
            type: params.type || 'IMAGE',
            url,
            publicId,
            provider,
            status: 'READY',
            filename: params.filename,
        },
    });
}
// ─── Get Media by Episode ──────────────────────────────────
async function getMediaByEpisode(episodeId) {
    return database_1.default.mediaAsset.findMany({
        where: { episodeId },
        orderBy: { createdAt: 'desc' },
    });
}
// ─── Delete Media ──────────────────────────────────────────
async function deleteMedia(id) {
    const asset = await database_1.default.mediaAsset.findUnique({ where: { id } });
    if (!asset)
        throw new Error('Media asset not found');
    // Delete from Cloudinary if real
    if (asset.provider === 'cloudinary' && asset.publicId) {
        try {
            await cloudinary_1.default.uploader.destroy(asset.publicId);
        }
        catch (e) {
            console.error('Failed to delete from Cloudinary:', e);
        }
    }
    return database_1.default.mediaAsset.delete({ where: { id } });
}
//# sourceMappingURL=media.service.js.map