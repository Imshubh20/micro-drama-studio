export type SeriesStatus = 'DRAFT' | 'GENERATING' | 'IN_REVIEW' | 'READY' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
export type Tone = 'DARK' | 'LIGHT' | 'COMEDIC' | 'DRAMATIC' | 'SUSPENSEFUL';
export type EpisodeStatus = 'DRAFT' | 'GENERATING' | 'IN_REVIEW' | 'READY' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'THUMBNAIL';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  prompt: string;
  genre: string;
  tone: Tone;
  episodeCount: number;
  episodeDuration: number;
  storyline: string;
  status: SeriesStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  episodes?: Episode[];
  characters?: Character[];
  _count?: {
    episodes: number;
    characters: number;
  };
}

export interface Episode {
  id: string;
  seriesId: string;
  number: number;
  title: string;
  summary: string;
  status: EpisodeStatus;
  platforms: string[];
  createdAt: string;
  updatedAt: string;
  scenes?: Scene[];
  script?: Script;
  mediaAssets?: MediaAsset[];
  _count?: {
    scenes: number;
    mediaAssets: number;
  };
}

export interface Character {
  id: string;
  seriesId: string;
  name: string;
  age?: number;
  gender?: string;
  role?: string;
  personality?: string;
  appearance?: string;
  background?: string;
  description?: string;
  isLocked: boolean;
  relationshipsFrom?: CharacterRelationship[];
  relationshipsTo?: CharacterRelationship[];
}

export interface CharacterRelationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  relationship: string;
  fromCharacter?: Partial<Character>;
  toCharacter?: Partial<Character>;
}

export interface Scene {
  id: string;
  episodeId: string;
  number: number;
  title: string;
  location: string;
  action: string;
  dialogue: string;
  camera: string;
  mood: string;
  characters: string[];
  mediaAssets?: MediaAsset[];
}

export interface Script {
  id: string;
  episodeId: string;
  content: string;
  version: number;
}

export interface MediaAsset {
  id: string;
  episodeId?: string;
  sceneId?: string;
  type: MediaType;
  url: string;
  publicId?: string;
  provider: string;
  status: string;
  filename?: string;
}

export interface CostEstimate {
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedTotalTokens: number;
  estimatedCost: number;
  breakdown: { item: string; tokens: number; cost: number }[];
}

export interface GenerationJob {
  id: string;
  seriesId: string;
  type: string;
  targetId?: string;
  status: string;
  progress: number;
  steps: any;
  error?: string;
}
