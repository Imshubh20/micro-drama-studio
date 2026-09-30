import cloudinary from '../config/cloudinary';
import prisma from '../config/database';
import { config } from '../config';

// ─── Placeholder URLs for mock media ───────────────────────
const MOCK_PLACEHOLDERS: Record<string, { url: string; label: string }> = {
  IMAGE: {
    url: 'https://placehold.co/1920x1080/1a1a2e/e94560?text=AI+Generated+Image',
    label: 'Scene Image',
  },
  VIDEO: {
    url: 'https://placehold.co/1920x1080/0d1b2a/00d4ff?text=AI+Generated+Video',
    label: 'Scene Video',
  },
  AUDIO: {
    url: 'https://placehold.co/800x200/1b2838/22d3ee?text=AI+Generated+Audio',
    label: 'Voice-Over Audio',
  },
  THUMBNAIL: {
    url: 'https://placehold.co/640x360/2d1b4e/c084fc?text=AI+Thumbnail',
    label: 'Thumbnail',
  },
};

// ─── Progress Step Descriptions ────────────────────────────
const PROGRESS_STEPS: Record<string, { progress: number; label: string }[]> = {
  IMAGE: [
    { progress: 10, label: 'Analyzing scene description…' },
    { progress: 30, label: 'Composing visual layout…' },
    { progress: 55, label: 'Rendering image with AI diffusion…' },
    { progress: 80, label: 'Applying color grading…' },
    { progress: 100, label: 'Image generation complete' },
  ],
  VIDEO: [
    { progress: 10, label: 'Extracting scene motion cues…' },
    { progress: 25, label: 'Generating keyframes…' },
    { progress: 50, label: 'Interpolating video frames…' },
    { progress: 75, label: 'Adding transitions and effects…' },
    { progress: 90, label: 'Encoding video output…' },
    { progress: 100, label: 'Video generation complete' },
  ],
  AUDIO: [
    { progress: 15, label: 'Analyzing dialogue and tone…' },
    { progress: 40, label: 'Synthesizing voice with AI TTS…' },
    { progress: 70, label: 'Mixing ambient audio layers…' },
    { progress: 90, label: 'Normalizing audio levels…' },
    { progress: 100, label: 'Audio generation complete' },
  ],
};

// ─── Upload to Cloudinary ──────────────────────────────────
export async function uploadMedia(params: {
  filePath: string;
  episodeId?: string;
  sceneId?: string;
  type?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'THUMBNAIL';
}) {
  const hasCloudinary = config.cloudinary.cloudName && config.cloudinary.apiKey;

  let url: string;
  let publicId: string;
  let provider = 'cloudinary';

  if (hasCloudinary) {
    const result = await cloudinary.uploader.upload(params.filePath, {
      folder: 'micro-drama-studio',
      resource_type: 'auto',
    });
    url = result.secure_url;
    publicId = result.public_id;
  } else {
    // Demo mode: use placeholder
    url = `https://placehold.co/1920x1080/1a1a2e/e94560?text=Scene+Asset`;
    publicId = `demo_${Date.now()}`;
    provider = 'demo';
  }

  return prisma.mediaAsset.create({
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
export async function uploadMediaFromBuffer(params: {
  buffer: Buffer;
  filename: string;
  episodeId?: string;
  sceneId?: string;
  type?: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'THUMBNAIL';
}) {
  const hasCloudinary = config.cloudinary.cloudName && config.cloudinary.apiKey;

  let url: string;
  let publicId: string;
  let provider = 'cloudinary';

  if (hasCloudinary) {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'micro-drama-studio', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(params.buffer);
    });
    url = result.secure_url;
    publicId = result.public_id;
  } else {
    url = `https://placehold.co/1920x1080/1a1a2e/e94560?text=${encodeURIComponent(params.filename)}`;
    publicId = `demo_${Date.now()}`;
    provider = 'demo';
  }

  return prisma.mediaAsset.create({
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

// ─── Generate Mock Media (Image/Video/Audio) ───────────────
// Simulates AI media generation with realistic progress steps.
// Creates a GenerationJob for polling and a MediaAsset on completion.
export async function generateMockMedia(params: {
  seriesId: string;
  episodeId: string;
  sceneId: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  sceneTitle?: string;
}): Promise<{ jobId: string }> {
  const { seriesId, episodeId, sceneId, type, sceneTitle } = params;

  // Create a GenerationJob to track progress
  const job = await prisma.generationJob.create({
    data: {
      seriesId,
      type: 'SCENE', // Reuse existing SCENE generation type
      targetId: sceneId,
      status: 'QUEUED',
      progress: 0,
      steps: JSON.stringify([{ progress: 0, label: `Queued ${type.toLowerCase()} generation…`, ts: Date.now() }]),
    },
  });

  // Run the simulated generation in the background (non-blocking)
  simulateMediaGeneration(job.id, { seriesId, episodeId, sceneId, type, sceneTitle }).catch(
    (err) => console.error(`Mock media generation failed for job ${job.id}:`, err)
  );

  return { jobId: job.id };
}

// Background simulation — updates progress, then creates the MediaAsset
async function simulateMediaGeneration(
  jobId: string,
  params: { seriesId: string; episodeId: string; sceneId: string; type: string; sceneTitle?: string }
) {
  const steps = PROGRESS_STEPS[params.type] || PROGRESS_STEPS.IMAGE;
  const stepsLog: { progress: number; label: string; ts: number }[] = [];

  try {
    // Mark as generating
    await prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'GENERATING', progress: 0 },
    });

    // Walk through each simulated step with realistic delays
    for (const step of steps) {
      const delay = 800 + Math.random() * 1200; // 0.8s – 2.0s per step
      await new Promise((r) => setTimeout(r, delay));

      stepsLog.push({ ...step, ts: Date.now() });

      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          progress: step.progress,
          steps: JSON.stringify(stepsLog),
        },
      });
    }

    // Create the final MediaAsset
    const placeholder = MOCK_PLACEHOLDERS[params.type] || MOCK_PLACEHOLDERS.IMAGE;
    const sceneLabel = params.sceneTitle ? encodeURIComponent(params.sceneTitle) : 'Scene';
    const url = placeholder.url.replace(
      /text=[^&]*/,
      `text=${sceneLabel}+${params.type}`
    );

    await prisma.mediaAsset.create({
      data: {
        episodeId: params.episodeId,
        sceneId: params.sceneId,
        type: params.type as any,
        url,
        publicId: `mock_${params.type.toLowerCase()}_${Date.now()}`,
        provider: 'mock-ai',
        status: 'READY',
        filename: `${placeholder.label} — ${params.sceneTitle || 'Scene'}.${params.type === 'AUDIO' ? 'mp3' : params.type === 'VIDEO' ? 'mp4' : 'png'}`,
      },
    });

    // Mark job completed
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });
  } catch (err: any) {
    console.error(`simulateMediaGeneration error:`, err);
    await prisma.generationJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: err.message || 'Mock media generation failed',
      },
    });
  }
}

// ─── Get Media by Episode ──────────────────────────────────
export async function getMediaByEpisode(episodeId: string) {
  return prisma.mediaAsset.findMany({
    where: { episodeId },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Get Media by Scene ────────────────────────────────────
export async function getMediaByScene(sceneId: string) {
  return prisma.mediaAsset.findMany({
    where: { sceneId },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Delete Media ──────────────────────────────────────────
export async function deleteMedia(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) throw new Error('Media asset not found');

  // Delete from Cloudinary if real
  if (asset.provider === 'cloudinary' && asset.publicId) {
    try {
      await cloudinary.uploader.destroy(asset.publicId);
    } catch (e) {
      console.error('Failed to delete from Cloudinary:', e);
    }
  }

  return prisma.mediaAsset.delete({ where: { id } });
}
