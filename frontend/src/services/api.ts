const API_URL = 'http://localhost:5000/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || data.message || 'API request failed');
  }

  return data.data || data;
}

// ─── Series ────────────────────────────────────────────────

export const getSeries = () => fetchAPI('/series');
export const getSeriesById = (id: string) => fetchAPI(`/series/${id}`);
export const createSeries = (data: any) => fetchAPI('/series', { method: 'POST', body: JSON.stringify(data) });
export const updateSeries = (id: string, data: any) => fetchAPI(`/series/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSeries = (id: string) => fetchAPI(`/series/${id}`, { method: 'DELETE' });
export const generateSeries = (id: string) => fetchAPI(`/series/${id}/generate`, { method: 'POST' });
export const getSeriesCostEstimate = (id: string) => fetchAPI(`/series/${id}/cost-estimate`);

// ─── Episodes ──────────────────────────────────────────────

export const getEpisodeById = (id: string) => fetchAPI(`/episodes/${id}`);
export const updateEpisode = (id: string, data: any) => fetchAPI(`/episodes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const generateEpisode = (id: string) => fetchAPI(`/episodes/${id}/generate`, { method: 'POST' });
export const regenerateEpisodeOutline = (id: string) => fetchAPI(`/episodes/${id}/regenerate-outline`, { method: 'POST' });
export const getEpisodeOutlineCostEstimate = (id: string) => fetchAPI(`/episodes/${id}/outline-cost-estimate`);
export const publishEpisode = (id: string, platforms: string[]) => fetchAPI(`/episodes/${id}/publish`, { method: 'POST', body: JSON.stringify({ platforms }) });
export const getEpisodeCostEstimate = (id: string) => fetchAPI(`/episodes/${id}/cost-estimate`);

// ─── Characters ────────────────────────────────────────────

export const toggleCharacterLock = (id: string, isLocked: boolean) => fetchAPI(`/characters/${id}/lock`, { method: 'PATCH', body: JSON.stringify({ isLocked }) });
export const regenerateCharacter = (id: string) => fetchAPI(`/characters/${id}/regenerate`, { method: 'POST' });
export const getCharacterCostEstimate = (id: string) => fetchAPI(`/characters/${id}/cost-estimate`);
export const updateCharacter = (id: string, data: any) => fetchAPI(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ─── Scenes & Script ───────────────────────────────────────

export const regenerateScene = (id: string) => fetchAPI(`/scenes/${id}/regenerate`, { method: 'POST' });
export const getSceneCostEstimate = (id: string) => fetchAPI(`/scenes/${id}/cost-estimate`);
export const updateScene = (id: string, data: any) => fetchAPI(`/scenes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateScript = (episodeId: string, content: string) => fetchAPI(`/episodes/${episodeId}/script`, { method: 'PUT', body: JSON.stringify({ content }) });

// ─── Media ─────────────────────────────────────────────────

export const uploadMedia = (formData: FormData) => fetchAPI('/media/upload', { method: 'POST', body: formData });
export const generateMedia = (data: { seriesId: string; episodeId: string; sceneId: string; type: string; sceneTitle?: string }) =>
  fetchAPI('/media/generate', { method: 'POST', body: JSON.stringify(data) });
export const getMediaByEpisode = (episodeId: string) => fetchAPI(`/episodes/${episodeId}/media`);
export const getMediaByScene = (sceneId: string) => fetchAPI(`/scenes/${sceneId}/media`);
export const deleteMedia = (id: string) => fetchAPI(`/media/${id}`, { method: 'DELETE' });

// ─── Generation Jobs ───────────────────────────────────────

export const getGenerationJob = (id: string) => fetchAPI(`/generations/${id}`);

