"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  Edit3,
  Film,
  Image as ImageIcon,
  Loader2,
  Mic,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Video,
  Wand2,
} from "lucide-react";
import {
  deleteMedia,
  generateEpisode,
  generateMedia,
  getEpisodeById,
  getEpisodeCostEstimate,
  getGenerationJob,
  getMediaByScene,
  getSceneCostEstimate,
  publishEpisode,
  regenerateScene,
  updateEpisode,
  updateScene,
} from "@/services/api";
import { CostEstimate, Episode, GenerationJob, MediaAsset, Scene } from "@/types";
import ConfirmCostModal from "@/components/ConfirmCostModal";
import EditSceneModal from "@/components/EditSceneModal";
import EditEpisodeModal from "@/components/EditEpisodeModal";

type Tab = "STORY" | "SCENES" | "MEDIA" | "SCRIPT" | "PUBLISH";

type MediaJobState = {
  jobId: string;
  sceneId: string;
  type: string;
  progress: number;
  label: string;
  status: string;
};

export default function EpisodeWorkspace({
  params,
}: {
  params?: Promise<{ id: string; episodeId: string }>;
}) {
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const id = (resolvedParams?.id || routeParams?.id) as string;
  const episodeId = (resolvedParams?.episodeId || routeParams?.episodeId) as string;

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("SCENES");
  const [modal, setModal] = useState<"episode" | "scene" | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingOutline, setEditingOutline] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [working, setWorking] = useState(false);
  const [platforms, setPlatforms] = useState<string[]>(["Web"]);

  // ── Media generation state ──
  const [mediaJobs, setMediaJobs] = useState<MediaJobState[]>([]);
  const [sceneMedia, setSceneMedia] = useState<Record<string, MediaAsset[]>>({});
  const [mediaLoading, setMediaLoading] = useState(false);
  const pollRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const load = async () => {
    try {
      const data = await getEpisodeById(episodeId);
      if (data && data.seriesId && id && data.seriesId !== id) {
        setError("This episode does not belong to the selected series.");
        setEpisode(null);
        return;
      }
      setEpisode(data);
      if (data.status === "DRAFT" && (!data.scenes || data.scenes.length === 0)) {
        setTab("STORY");
      }
    } catch {
      setError("We could not load this episode.");
      setEpisode(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (episodeId) {
      load();
    }
  }, [episodeId, id]);

  const estimateEpisode = async () => {
    setModal("episode");
    setEstimate(null);
    try {
      setEstimate(await getEpisodeCostEstimate(episodeId));
    } catch {
      setError("We could not calculate the episode cost.");
    }
  };

  const estimateScene = async (nextId: string) => {
    setSceneId(nextId);
    setModal("scene");
    setEstimate(null);
    try {
      setEstimate(await getSceneCostEstimate(nextId));
    } catch {
      setError("We could not calculate the scene cost.");
    }
  };

  const confirm = async () => {
    setWorking(true);
    try {
      if (modal === "episode") await generateEpisode(episodeId);
      if (modal === "scene" && sceneId) await regenerateScene(sceneId);
      await load();
      setModal(null);
      setTab("SCENES");
    } catch {
      setError("Generation could not be completed. Please try again.");
    } finally {
      setWorking(false);
    }
  };

  // ── Manual Scene Save ──
  const handleSaveScene = async (data: Partial<Scene>) => {
    if (!editingScene) return;
    const updated = await updateScene(editingScene.id, data);
    setEpisode((prev) =>
      prev
        ? {
            ...prev,
            scenes: prev.scenes?.map((s) =>
              s.id === editingScene.id ? { ...s, ...updated } : s
            ),
          }
        : prev
    );
    setEditingScene(null);
  };

  // ── Manual Episode Outline Save ──
  const handleSaveEpisode = async (data: Partial<Episode>) => {
    const updated = await updateEpisode(episodeId, data);
    setEpisode((prev) => (prev ? { ...prev, ...updated } : updated));
    setEditingOutline(false);
  };

  const publish = async () => {
    setWorking(true);
    try {
      await publishEpisode(episodeId, platforms);
      await load();
    } catch {
      setError("Publishing failed. Please retry.");
    } finally {
      setWorking(false);
    }
  };

  const toggle = (value: string) =>
    setPlatforms((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );

  // ── Load media assets for all scenes ──
  const loadSceneMedia = useCallback(async () => {
    if (!episode?.scenes?.length) return;
    setMediaLoading(true);
    try {
      const results: Record<string, MediaAsset[]> = {};
      await Promise.all(
        episode.scenes.map(async (scene) => {
          try {
            const media = await getMediaByScene(scene.id);
            results[scene.id] = media || [];
          } catch {
            results[scene.id] = [];
          }
        })
      );
      setSceneMedia(results);
    } finally {
      setMediaLoading(false);
    }
  }, [episode?.scenes]);

  // Auto-load media when switching to MEDIA tab
  useEffect(() => {
    if (tab === "MEDIA" && episode?.scenes?.length) {
      loadSceneMedia();
    }
  }, [tab, loadSceneMedia]);

  // Cleanup poll intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollRefs.current).forEach(clearInterval);
    };
  }, []);

  // ── Start media generation ──
  const handleGenerateMedia = async (
    scene: Scene,
    type: "IMAGE" | "VIDEO" | "AUDIO"
  ) => {
    if (!episode) return;
    const key = `${scene.id}-${type}`;

    // Don't start if already in progress
    if (mediaJobs.some((j) => j.sceneId === scene.id && j.type === type && j.status !== "COMPLETED" && j.status !== "FAILED")) {
      return;
    }

    try {
      const result = await generateMedia({
        seriesId: episode.seriesId,
        episodeId: episode.id,
        sceneId: scene.id,
        type,
        sceneTitle: scene.title,
      });

      const newJob: MediaJobState = {
        jobId: result.jobId,
        sceneId: scene.id,
        type,
        progress: 0,
        label: `Starting ${type.toLowerCase()} generation…`,
        status: "QUEUED",
      };

      setMediaJobs((prev) => [...prev, newJob]);

      // Start polling
      const interval = setInterval(async () => {
        try {
          const job: GenerationJob = await getGenerationJob(result.jobId);
          const steps = typeof job.steps === "string" ? JSON.parse(job.steps) : job.steps;
          const lastStep = steps?.[steps.length - 1];

          setMediaJobs((prev) =>
            prev.map((j) =>
              j.jobId === result.jobId
                ? {
                    ...j,
                    progress: job.progress,
                    label: lastStep?.label || j.label,
                    status: job.status,
                  }
                : j
            )
          );

          if (job.status === "COMPLETED" || job.status === "FAILED") {
            clearInterval(interval);
            delete pollRefs.current[key];

            if (job.status === "COMPLETED") {
              // Refresh media for this scene
              try {
                const media = await getMediaByScene(scene.id);
                setSceneMedia((prev) => ({ ...prev, [scene.id]: media || [] }));
              } catch { /* ignore */ }
            }
          }
        } catch {
          clearInterval(interval);
          delete pollRefs.current[key];
        }
      }, 1000);

      pollRefs.current[key] = interval;
    } catch (err: any) {
      setError(err.message || "Failed to start media generation");
    }
  };

  // ── Delete a media asset ──
  const handleDeleteMedia = async (assetId: string, sceneId: string) => {
    try {
      await deleteMedia(assetId);
      setSceneMedia((prev) => ({
        ...prev,
        [sceneId]: (prev[sceneId] || []).filter((a) => a.id !== assetId),
      }));
    } catch {
      setError("Failed to delete media asset.");
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  // ── Not found ──
  if (!episode || (episode.seriesId && id && episode.seriesId !== id)) {
    return (
      <div className="mx-auto max-w-7xl py-14 text-center">
        <div className="studio-panel mx-auto max-w-md rounded-2xl p-8">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Film size={26} className="text-[var(--violet)]" />
          </span>
          <p className="text-lg font-bold text-[var(--ink)]">
            Episode not found
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            {error || "This episode could not be found or does not belong to this series."}
          </p>
          <Link
            href={`/series/${id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
          >
            <ArrowLeft size={15} />
            Back to Series Overview
          </Link>
        </div>
      </div>
    );
  }

  const hasScenes = Boolean(episode.scenes?.length);
  const tabs: [Tab, string, typeof Film][] = [
    ["STORY", "Story Outline", Film],
    ["SCENES", "Scenes", Play],
    ["MEDIA", "Media", ImageIcon],
    ["SCRIPT", "Script", Clapperboard],
    ["PUBLISH", "Publish", Send],
  ];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <Link
        href={`/series/${id}`}
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} />
        Series overview
      </Link>

      {/* ── Header ── */}
      <header className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--coral)]" />
            Episode {String(episode.number).padStart(2, "0")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
            {episode.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Episode workspace · {episode.scenes?.length || 0} scenes
          </p>
        </div>

        <button
          onClick={estimateEpisode}
          className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--violet-deep)] to-[var(--violet)] px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Wand2 size={16} />
          {hasScenes ? "Regenerate all scenes" : "Generate episode scenes"}
        </button>
      </header>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--ink)] backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* ── Tab Bar ── */}
      <div className="mb-7 flex w-full gap-1 overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface-glass)] p-1.5 backdrop-blur-sm">
        {tabs.map(([value, label, Icon]) => {
          const disabled =
            (value === "SCRIPT" && !episode.script) ||
            (value === "PUBLISH" && !hasScenes) ||
            (value === "MEDIA" && !hasScenes);

          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              disabled={disabled}
              className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                tab === value
                  ? "bg-gradient-to-r from-[var(--violet-glow)] to-transparent text-[var(--ink)] shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              } disabled:cursor-not-allowed disabled:opacity-35`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── STORY Tab ── */}
      {tab === "STORY" && (
        <section className="studio-panel max-w-4xl overflow-hidden rounded-xl">
          <div className="h-1 bg-gradient-to-r from-[var(--violet)] to-[var(--coral)]" />
          <div className="p-7 sm:p-9">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">Episode summary & outline</p>
              <button
                onClick={() => setEditingOutline(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
              >
                <Edit3 size={13} />
                Edit Outline
              </button>
            </div>
            <p className="text-lg leading-8 text-[var(--ink)]">
              {episode.summary || "No summary outline created yet."}
            </p>

            {(!hasScenes || episode.status === "DRAFT") && (
              <div className="mt-9 border-t border-[var(--line)] pt-7">
                <p className="text-sm text-[var(--ink-muted)]">
                  Ready to produce screenplay scenes for this episode?
                </p>
                <button
                  onClick={estimateEpisode}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--violet-deep)] to-[var(--violet)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
                >
                  <Wand2 size={15} />
                  Generate Scenes & Script
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SCENES Tab ── */}
      {tab === "SCENES" && (
        <div className="grid gap-5 xl:grid-cols-[14rem_1fr]">
          {/* Scene Nav */}
          <aside className="studio-panel hidden rounded-xl p-3.5 xl:block">
            <p className="eyebrow mb-3 px-2.5">Scene List</p>
            {episode.scenes?.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setEditingScene(scene)}
                className="mb-1.5 flex w-full items-center gap-2.5 rounded-lg bg-[var(--surface-soft)] px-3 py-2.5 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[var(--violet)] to-purple-600 text-[10px] font-bold text-white">
                  {scene.number}
                </span>
                <span className="truncate">{scene.title}</span>
              </button>
            ))}
          </aside>

          {/* Scenes List */}
          <div className="space-y-5">
            {episode.scenes?.map((scene: Scene) => (
              <article
                key={scene.id}
                className="studio-panel overflow-hidden rounded-xl"
              >
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
                  <div className="flex items-center gap-3.5">
                    <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-sm font-bold text-[var(--violet)]">
                      {scene.number}
                    </span>
                    <div>
                      <h2 className="font-bold text-[var(--ink)]">
                        {scene.title}
                      </h2>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {scene.location} · {scene.mood}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingScene(scene)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
                    >
                      <Edit3 size={13} />
                      Edit Scene
                    </button>
                    <button
                      onClick={() => estimateScene(scene.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--surface-raised)]"
                    >
                      <RefreshCw size={13} />
                      Regenerate
                    </button>
                  </div>
                </header>

                <div className="grid gap-7 p-6 lg:grid-cols-[1fr_14rem]">
                  <div className="space-y-6">
                    <section>
                      <p className="eyebrow mb-2">Action</p>
                      <p className="text-sm leading-6 text-[var(--ink-muted)]">
                        {scene.action}
                      </p>
                    </section>

                    <section className="rounded-lg border-l-2 border-[var(--violet)] pl-5">
                      <p className="eyebrow mb-2">Dialogue</p>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">
                        {scene.dialogue || "No dialogue in this scene."}
                      </p>
                    </section>
                  </div>

                  <dl className="space-y-5 border-l border-[var(--line)] pl-6 text-sm">
                    <div>
                      <dt className="eyebrow mb-1.5">Location</dt>
                      <dd className="text-[var(--ink)]">{scene.location}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1.5">Characters</dt>
                      <dd className="mt-2 flex flex-wrap gap-1.5">
                        {scene.characters?.map((character) => (
                          <span
                            key={character}
                            className="rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-[var(--ink-muted)]"
                          >
                            {character}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1.5">Camera</dt>
                      <dd className="text-[var(--ink)]">{scene.camera}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* ── MEDIA Tab ── */}
      {tab === "MEDIA" && (
        <div className="space-y-6">
          {/* Media Tab Header */}
          <div className="studio-panel overflow-hidden rounded-xl">
            <div className="h-1 bg-gradient-to-r from-[var(--coral)] to-amber-400" />
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="eyebrow mb-1">AI Media Generation</p>
                <h2 className="text-xl font-bold text-[var(--ink)]">
                  Generate images, video &amp; audio for each scene
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-muted)]">
                  Mock generation with simulated progress · ₹0 cost
                </p>
              </div>
              <button
                onClick={loadSceneMedia}
                disabled={mediaLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
              >
                <RefreshCw size={14} className={mediaLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {/* Per-Scene Media Cards */}
          {episode.scenes?.map((scene: Scene) => {
            const assets = sceneMedia[scene.id] || [];
            const activeJobs = mediaJobs.filter(
              (j) =>
                j.sceneId === scene.id &&
                (j.status === "QUEUED" || j.status === "GENERATING")
            );

            return (
              <article
                key={scene.id}
                className="studio-panel overflow-hidden rounded-xl"
              >
                {/* Scene Header */}
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-sm font-bold text-amber-400">
                      {scene.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-[var(--ink)]">
                        {scene.title}
                      </h3>
                      <p className="text-xs text-[var(--ink-muted)]">
                        {scene.location} · {scene.mood}
                      </p>
                    </div>
                  </div>

                  {/* Generate Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(["IMAGE", "VIDEO", "AUDIO"] as const).map((type) => {
                      const isRunning = activeJobs.some((j) => j.type === type);
                      const Icon =
                        type === "IMAGE"
                          ? ImageIcon
                          : type === "VIDEO"
                          ? Video
                          : Mic;
                      const colors =
                        type === "IMAGE"
                          ? "from-pink-600 to-rose-500"
                          : type === "VIDEO"
                          ? "from-cyan-600 to-blue-500"
                          : "from-emerald-600 to-green-500";

                      return (
                        <button
                          key={type}
                          onClick={() => handleGenerateMedia(scene, type)}
                          disabled={isRunning}
                          className={`inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r ${colors} px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
                        >
                          {isRunning ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Icon size={13} />
                          )}
                          {type === "IMAGE"
                            ? "Generate Image"
                            : type === "VIDEO"
                            ? "Generate Video"
                            : "Generate Audio"}
                        </button>
                      );
                    })}
                  </div>
                </header>

                {/* Active Generation Progress */}
                {activeJobs.length > 0 && (
                  <div className="border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--violet)_4%,transparent)] px-6 py-4">
                    <div className="space-y-3">
                      {activeJobs.map((job) => (
                        <div key={job.jobId} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 font-semibold text-[var(--ink)]">
                              <Loader2
                                size={12}
                                className="animate-spin text-[var(--violet)]"
                              />
                              {job.type} · {job.label}
                            </span>
                            <span className="font-mono text-[var(--ink-muted)]">
                              {job.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--coral)] transition-all duration-500 ease-out"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Assets Gallery */}
                {assets.length > 0 ? (
                  <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {assets.map((asset) => {
                      const typeColors =
                        asset.type === "IMAGE"
                          ? "border-pink-500/30 bg-pink-500/5"
                          : asset.type === "VIDEO"
                          ? "border-cyan-500/30 bg-cyan-500/5"
                          : "border-emerald-500/30 bg-emerald-500/5";
                      const TypeIcon =
                        asset.type === "IMAGE"
                          ? ImageIcon
                          : asset.type === "VIDEO"
                          ? Video
                          : Mic;
                      const typeLabel =
                        asset.type === "IMAGE"
                          ? "AI Image"
                          : asset.type === "VIDEO"
                          ? "AI Video"
                          : "AI Audio";

                      return (
                        <div
                          key={asset.id}
                          className={`group relative overflow-hidden rounded-xl border ${typeColors} transition-all duration-200 hover:shadow-md`}
                        >
                          {/* Preview */}
                          <div className="aspect-video overflow-hidden bg-[var(--surface-deep)]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.url}
                              alt={asset.filename || typeLabel}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-2">
                              <TypeIcon size={14} className="text-[var(--ink-muted)]" />
                              <div>
                                <p className="text-xs font-semibold text-[var(--ink)]">
                                  {typeLabel}
                                </p>
                                <p className="text-[10px] text-[var(--ink-muted)]">
                                  {asset.provider} · {asset.status}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteMedia(asset.id, scene.id)}
                              className="rounded-lg p-1.5 text-[var(--ink-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                              title="Delete asset"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  activeJobs.length === 0 && (
                    <div className="flex items-center justify-center gap-3 p-10 text-sm text-[var(--ink-faint)]">
                      <ImageIcon size={20} />
                      No media generated yet. Use the buttons above to start.
                    </div>
                  )
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ── SCRIPT Tab ── */}
      {tab === "SCRIPT" && episode.script && (
        <section className="studio-panel overflow-hidden rounded-xl">
          <header className="flex items-center justify-between border-b border-[var(--line)] px-6 py-4">
            <div>
              <p className="eyebrow mb-1">Screenplay</p>
              <h2 className="font-bold text-[var(--ink)]">Formatted script</h2>
            </div>
            <span className="rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-muted)]">
              Version {episode.script.version}
            </span>
          </header>
          <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap p-7 font-sans text-sm leading-7 text-[var(--ink-muted)]">
            {episode.script.content}
          </pre>
        </section>
      )}

      {/* ── PUBLISH Tab ── */}
      {tab === "PUBLISH" && (
        <section className="studio-panel mx-auto max-w-3xl overflow-hidden rounded-xl">
          <div className="h-1 bg-gradient-to-r from-[var(--green)] to-emerald-400" />
          <div className="p-7 sm:p-9">
            <p className="eyebrow mb-2">Distribution</p>
            <h2 className="text-2xl font-bold text-[var(--ink)]">
              Publish episode
            </h2>

            {/* Checklist */}
            <div className="mt-7 divide-y divide-[var(--line)] rounded-xl border border-[var(--line)]">
              <div className="flex items-center gap-3 p-4 text-sm text-[var(--ink)]">
                <CheckCircle2 size={18} className="text-[var(--green)]" />
                Story and scenes ready ({episode.scenes?.length || 0} scenes)
              </div>
              <div className="flex items-center gap-3 p-4 text-sm text-[var(--ink)]">
                <CheckCircle2
                  size={18}
                  className={
                    episode.script
                      ? "text-[var(--green)]"
                      : "text-[var(--ink-faint)]"
                  }
                />
                {episode.script ? "Script complete" : "Script pending"}
              </div>
            </div>

            {/* Platforms */}
            <p className="eyebrow mb-3.5 mt-8">Platforms</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["Web", "iOS", "Android", "Roku"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => toggle(platform)}
                  className={`rounded-xl border p-3.5 text-left text-sm font-semibold transition-all duration-200 ${
                    platforms.includes(platform)
                      ? "border-[var(--violet)] bg-[color-mix(in_srgb,var(--violet)_12%,transparent)] text-[var(--ink)] shadow-sm shadow-violet-500/10"
                      : "border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-muted)] hover:border-[var(--line-strong)]"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>

            {/* Publish button */}
            <button
              onClick={publish}
              disabled={
                working ||
                platforms.length === 0 ||
                episode.status === "PUBLISHED"
              }
              className={`mt-8 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all duration-300 disabled:opacity-50 ${
                episode.status === "PUBLISHED"
                  ? "bg-[var(--green)] text-[#062a20]"
                  : "bg-gradient-to-r from-emerald-600 to-[var(--green)] text-white shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 hover:shadow-xl"
              }`}
            >
              {working ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Publishing…
                </>
              ) : episode.status === "PUBLISHED" ? (
                <>
                  <CheckCircle2 size={16} />
                  Published
                </>
              ) : (
                <>
                  <Send size={16} />
                  Publish episode
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* ── Modals ── */}
      <EditSceneModal
        isOpen={editingScene !== null}
        onClose={() => setEditingScene(null)}
        onSave={handleSaveScene}
        scene={editingScene}
      />

      <EditEpisodeModal
        isOpen={editingOutline}
        onClose={() => setEditingOutline(false)}
        onSave={handleSaveEpisode}
        episode={episode}
      />

      <ConfirmCostModal
        isOpen={modal !== null}
        onClose={() => setModal(null)}
        onConfirm={confirm}
        estimate={estimate}
        isGenerating={working}
        title={
          modal === "scene"
            ? "Regenerate this scene?"
            : "Generate this episode?"
        }
        description={
          modal === "scene"
            ? "This will refresh the scene action, dialogue, and camera direction."
            : "This will create the scenes and a formatted script for this episode."
        }
      />
    </div>
  );
}
