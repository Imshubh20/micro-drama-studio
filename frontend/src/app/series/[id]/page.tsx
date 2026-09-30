"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  Clapperboard,
  Edit3,
  Film,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users,
  Wand2,
} from "lucide-react";
import {
  generateSeries,
  getCharacterCostEstimate,
  getEpisodeOutlineCostEstimate,
  getGenerationJob,
  getSeriesById,
  regenerateCharacter,
  regenerateEpisodeOutline,
  toggleCharacterLock,
  updateCharacter,
  updateEpisode,
  updateSeries,
} from "@/services/api";
import { Character, CostEstimate, Episode, GenerationJob, Series } from "@/types";
import EditStoryModal from "@/components/EditStoryModal";
import EditEpisodeModal from "@/components/EditEpisodeModal";
import EditCharacterModal from "@/components/EditCharacterModal";
import ConfirmCostModal from "@/components/ConfirmCostModal";

const coverClass = (genre: string) =>
  /romance/i.test(genre)
    ? "cover-romance"
    : /mystery|thriller|crime/i.test(genre)
      ? "cover-mystery"
      : /drama/i.test(genre)
        ? "cover-drama"
        : "cover-default";

export default function SeriesOverview({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const id = (resolvedParams?.id || routeParams?.id) as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [approving, setApproving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [editingStory, setEditingStory] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  // AI Regeneration Modal state
  const [regenTarget, setRegenTarget] = useState<{
    type: "episode" | "character";
    item: Episode | Character;
  } | null>(null);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const loadSeries = async () => {
    try {
      const data = await getSeriesById(id);
      setSeries(data);
      const nextJob = data.generationJobs?.[0];
      if (nextJob) setJob(nextJob);
      return data;
    } catch {
      setSeries(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!series || retrying) return;
    setRetrying(true);
    try {
      setSeries((prev) => (prev ? { ...prev, status: "GENERATING" } : null));
      generateSeries(id).catch(console.error);
      setTimeout(async () => {
        try {
          const fresh = await getSeriesById(id);
          setSeries(fresh);
          const nextJob = fresh.generationJobs?.[0];
          if (nextJob) setJob(nextJob);
        } catch {
          // Ignore
        } finally {
          setRetrying(false);
        }
      }, 1000);
    } catch {
      setRetrying(false);
    }
  };

  // ── Story Approval ──
  const handleApproveStory = async () => {
    if (!series || approving) return;
    setApproving(true);
    setFeedbackMsg(null);
    try {
      const updated = await updateSeries(id, { status: "READY" });
      setSeries((prev) => (prev ? { ...prev, status: "READY", ...updated } : updated));
      setFeedbackMsg({
        type: "success",
        text: "Story successfully approved! The story is locked and ready for full episode production.",
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || "Failed to approve story.",
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReopenReview = async () => {
    if (!series || approving) return;
    setApproving(true);
    setFeedbackMsg(null);
    try {
      const updated = await updateSeries(id, { status: "IN_REVIEW" });
      setSeries((prev) => (prev ? { ...prev, status: "IN_REVIEW", ...updated } : updated));
      setFeedbackMsg({
        type: "success",
        text: "Story returned to In-Review status for editing.",
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || "Failed to update story status.",
      });
    } finally {
      setApproving(false);
    }
  };

  // ── Manual Story Save ──
  const handleSaveStory = async (data: Partial<Series>) => {
    const updated = await updateSeries(id, data);
    setSeries((prev) => (prev ? { ...prev, ...updated } : updated));
    setFeedbackMsg({ type: "success", text: "Story overview saved." });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // ── Manual Episode Save ──
  const handleSaveEpisode = async (data: Partial<Episode>) => {
    if (!editingEpisode) return;
    const updated = await updateEpisode(editingEpisode.id, data);
    setSeries((prev) =>
      prev
        ? {
            ...prev,
            episodes: prev.episodes?.map((ep) =>
              ep.id === editingEpisode.id ? { ...ep, ...updated } : ep
            ),
          }
        : prev
    );
    setFeedbackMsg({
      type: "success",
      text: `Episode ${editingEpisode.number} updated successfully.`,
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // ── Manual Character Save ──
  const handleSaveCharacter = async (data: Partial<Character>) => {
    if (!editingCharacter) return;
    const updated = await updateCharacter(editingCharacter.id, data);
    setSeries((prev) =>
      prev
        ? {
            ...prev,
            characters: prev.characters?.map((c) =>
              c.id === editingCharacter.id ? { ...c, ...updated } : c
            ),
          }
        : prev
    );
    setFeedbackMsg({
      type: "success",
      text: `Character "${updated.name}" updated successfully.`,
    });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // ── Toggle Character Lock ──
  const handleToggleLock = async (character: Character, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newLockState = !character.isLocked;
    setSeries((prev) =>
      prev
        ? {
            ...prev,
            characters: prev.characters?.map((c) =>
              c.id === character.id ? { ...c, isLocked: newLockState } : c
            ),
          }
        : prev
    );
    try {
      await toggleCharacterLock(character.id, newLockState);
    } catch {
      loadSeries();
    }
  };

  // ── Open AI Regeneration Modal ──
  const openRegenerateEpisodeOutline = async (episode: Episode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRegenTarget({ type: "episode", item: episode });
    setEstimate(null);
    try {
      const est = await getEpisodeOutlineCostEstimate(episode.id);
      setEstimate(est);
    } catch {
      setEstimate(null);
    }
  };

  const openRegenerateCharacter = async (character: Character, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (character.isLocked) {
      setFeedbackMsg({
        type: "error",
        text: `${character.name} is locked. Unlock before regenerating.`,
      });
      return;
    }
    setRegenTarget({ type: "character", item: character });
    setEstimate(null);
    try {
      const est = await getCharacterCostEstimate(character.id);
      setEstimate(est);
    } catch {
      setEstimate(null);
    }
  };

  // ── Execute AI Regeneration ──
  const handleConfirmRegenerate = async () => {
    if (!regenTarget) return;
    setRegenerating(true);
    try {
      if (regenTarget.type === "episode") {
        const updated = await regenerateEpisodeOutline(regenTarget.item.id);
        setSeries((prev) =>
          prev
            ? {
                ...prev,
                episodes: prev.episodes?.map((ep) =>
                  ep.id === regenTarget.item.id ? { ...ep, ...updated } : ep
                ),
              }
            : prev
        );
        setFeedbackMsg({
          type: "success",
          text: `Episode ${(regenTarget.item as Episode).number} outline regenerated successfully.`,
        });
      } else {
        const updated = await regenerateCharacter(regenTarget.item.id);
        setSeries((prev) =>
          prev
            ? {
                ...prev,
                characters: prev.characters?.map((c) =>
                  c.id === regenTarget.item.id ? { ...c, ...updated } : c
                ),
              }
            : prev
        );
        setFeedbackMsg({
          type: "success",
          text: `Character "${(regenTarget.item as Character).name}" regenerated successfully.`,
        });
      }
      setRegenTarget(null);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || "Regeneration failed. Please try again.",
      });
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    const init = async () => {
      const data = await loadSeries();
      const nextJob = data?.generationJobs?.[0];
      if (data?.status === "GENERATING" && nextJob) {
        timer = setInterval(async () => {
          const updated = await getGenerationJob(nextJob.id);
          setJob(updated);
          if (updated.status !== "GENERATING") {
            if (timer) clearInterval(timer);
            await loadSeries();
          }
        }, 2000);
      }
    };

    if (id) {
      init();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [id]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  // ── Not Found ──
  if (!series) {
    return (
      <div className="mx-auto max-w-7xl py-14 text-center">
        <div className="studio-panel mx-auto max-w-md rounded-2xl p-8">
          <p className="text-lg font-bold text-[var(--ink)]">
            Series not found
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            This series could not be found or has been deleted.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Failed State ──
  if (series.status === "FAILED") {
    return (
      <div className="mx-auto max-w-2xl py-14">
        <section className="studio-panel overflow-hidden rounded-2xl p-8 sm:p-10 text-center">
          <span className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl bg-red-500/20 text-red-400">
            <Wand2 size={24} />
          </span>
          <p className="eyebrow mb-2 text-red-400">Generation Failed</p>
          <h1 className="text-2xl font-bold text-[var(--ink)]">
            Could not complete story generation
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
            Something went wrong while shaping {series.title || "your series"}. You can retry generation on this same series without creating a new one.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--violet-deep)] to-[var(--violet)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Wand2 size={16} />
              {retrying ? "Starting retry…" : "Retry Generation"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ── Generating State ──
  if (series.status === "GENERATING") {
    const steps =
      typeof job?.steps === "string"
        ? JSON.parse(job.steps)
        : job?.steps || [];

    return (
      <div className="mx-auto max-w-2xl py-14">
        <section className="studio-panel overflow-hidden rounded-2xl">
          {/* Progress bar */}
          <div className="h-1.5 bg-[var(--surface-soft)]">
            <div
              className="h-full bg-gradient-to-r from-[var(--violet)] via-purple-500 to-[var(--coral)] transition-all duration-700 ease-out"
              style={{ width: `${job?.progress || 0}%` }}
            />
          </div>

          <div className="p-8 sm:p-10">
            <span className="mb-7 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-[var(--violet)]">
              <Wand2 size={24} />
            </span>

            <p className="eyebrow mb-2 flex items-center gap-2">
              <Sparkles size={12} className="text-[var(--coral)]" />
              Building your story
            </p>
            <h1 className="text-2xl font-bold text-[var(--ink)]">
              Your production is taking shape.
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              The studio is working through the world, cast, and episode arc for{" "}
              <span className="font-semibold text-[var(--ink)]">
                {series.title || "your new series"}
              </span>
              .
            </p>

            {/* Steps */}
            <div className="mt-9 space-y-4">
              {steps.map((step: any, index: number) => (
                <div key={index} className="flex items-center gap-3.5 text-sm">
                  <span
                    className={
                      step.status === "completed"
                        ? "text-[var(--green)]"
                        : step.status === "in_progress"
                          ? "text-[var(--violet)]"
                          : "text-[var(--ink-faint)]"
                    }
                  >
                    {step.status === "completed" ? (
                      <CheckCircle2 size={20} />
                    ) : step.status === "in_progress" ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </span>
                  <span
                    className={
                      step.status === "in_progress"
                        ? "font-semibold text-[var(--ink)]"
                        : step.status === "completed"
                          ? "text-[var(--ink-muted)]"
                          : "text-[var(--ink-faint)]"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ── Series Detail (Story Review Hub) ──
  const episodes = series.episodes || [];
  const isApproved = series.status === "READY" || series.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft size={15} />
          Dashboard
        </Link>

        {/* Story Status / Actions Badge */}
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide ${
              isApproved
                ? "bg-emerald-500/15 text-[var(--green)] border border-emerald-500/30"
                : series.status === "IN_REVIEW"
                  ? "bg-violet-500/15 text-[var(--violet)] border border-violet-500/30"
                  : "bg-[var(--surface-soft)] text-[var(--ink-muted)] border border-[var(--line)]"
            }`}
          >
            {isApproved ? (
              <>
                <ShieldCheck size={14} />
                Story Approved · Ready
              </>
            ) : series.status === "IN_REVIEW" ? (
              <>
                <Sparkles size={14} />
                Story In Review
              </>
            ) : (
              series.status
            )}
          </span>
        </div>
      </div>

      {/* Feedback Alert Toast */}
      {feedbackMsg && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm transition-all ${
            feedbackMsg.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-[var(--ink)]"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* ── Story Approval Command Bar ── */}
      <div className="studio-panel mb-7 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow mb-1 flex items-center gap-1.5 text-[var(--violet)]">
            <Sparkles size={13} />
            Story Review & Sign-Off
          </p>
          <h2 className="text-base font-bold text-[var(--ink)]">
            {isApproved
              ? "Story is approved and locked for production"
              : "Review characters and episode outlines before episode generation"}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {isApproved
              ? "You can generate scenes and scripts in each episode below, or re-open review to make changes."
              : "Edit or regenerate any individual character or episode outline without touching the rest, then click Approve Story."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {isApproved ? (
            <button
              onClick={handleReopenReview}
              disabled={approving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--surface-soft)] px-4 py-2.5 text-xs font-semibold text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
            >
              <Edit3 size={14} />
              Re-open Review
            </button>
          ) : (
            <button
              onClick={handleApproveStory}
              disabled={approving || episodes.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-[var(--green)] to-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
            >
              {approving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Approving Story…
                </>
              ) : (
                <>
                  <Check size={15} />
                  Approve Story
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <section className="studio-panel overflow-hidden rounded-2xl">
        <div
          className={`cover ${coverClass(series.genre)} relative h-52 p-7 sm:h-60 sm:p-9`}
        >
          <Film className="cover-mark" size={200} />

          <div className="relative z-10 flex h-full flex-col justify-end">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur-md">
                {series.genre}
              </span>
              <span className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-bold text-white/90 backdrop-blur-md">
                {series.tone}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-xl sm:text-4xl">
              {series.title || "Untitled series"}
            </h1>
          </div>
        </div>

        <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_20rem]">
          {/* Overview Section */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Story overview</p>
              <button
                onClick={() => setEditingStory(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
              >
                <Edit3 size={13} />
                Edit Story
              </button>
            </div>
            <p className="text-lg leading-7 text-[var(--ink)]">
              {series.description || series.prompt}
            </p>
            {series.storyline && (
              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[var(--ink-muted)]">
                {series.storyline}
              </p>
            )}
            {series.status === "DRAFT" && episodes.length === 0 && (
              <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-5">
                <p className="font-semibold text-[var(--ink)]">
                  Story is in draft. Ready to generate cast and episodes?
                </p>
                <button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--violet-deep)] to-[var(--violet)] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <Wand2 size={14} />
                  {retrying ? "Starting generation…" : "Generate Series"}
                </button>
              </div>
            )}
          </div>

          {/* Character Bible Section */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[var(--ink)]">
                <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                  <Users size={16} className="text-[var(--violet)]" />
                </span>
                Character Bible
              </div>
              <Link
                href={`/series/${id}/characters`}
                className="text-xs font-semibold text-[var(--violet)] transition-colors hover:text-[var(--ink)]"
              >
                View all ({series.characters?.length || 0})
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {series.characters?.slice(0, 4).map((character) => (
                <div
                  key={character.id}
                  className="group rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 transition-colors hover:border-[var(--line-strong)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-[var(--ink)]">
                        <span>{character.name}</span>
                        {character.isLocked && (
                          <span title="Character locked from AI modifications">
                            <Lock size={12} className="text-[var(--amber)]" />
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-[var(--ink-muted)]">
                        {character.role || "Character"} {character.age ? `· ${character.age}y` : ""}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingCharacter(character);
                        }}
                        title="Edit character profile"
                        className="rounded p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => openRegenerateCharacter(character, e)}
                        title="Regenerate character with AI"
                        disabled={character.isLocked}
                        className="rounded p-1 text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] disabled:opacity-30"
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        onClick={(e) => handleToggleLock(character, e)}
                        title={character.isLocked ? "Unlock character" : "Lock character"}
                        className={`rounded p-1 ${
                          character.isLocked
                            ? "text-[var(--amber)]"
                            : "text-[var(--ink-muted)] hover:bg-[var(--surface-raised)]"
                        }`}
                      >
                        {character.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-[var(--ink-muted)]">
                  Characters will appear once the story is generated.
                </p>
              )}
            </div>

            <Link
              href={`/series/${id}/characters`}
              className="group mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--violet)] transition-colors hover:text-[var(--ink)]"
            >
              Open full character bible
              <ArrowUpRight
                size={13}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Episodes Story Review & Workspace Section ── */}
      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-1.5">Episode Architecture</p>
            <h2 className="text-xl font-bold text-[var(--ink)]">
              Episode Outlines & Production
            </h2>
          </div>
          <span className="text-sm text-[var(--ink-muted)]">
            {episodes.length} of {series.episodeCount} episodes
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="studio-panel group flex flex-col justify-between rounded-xl p-5 transition-all duration-300 hover:border-[var(--line-strong)]"
            >
              <div>
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-sm font-bold text-[var(--violet)]">
                    {String(episode.number).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate font-bold text-[var(--ink)]">
                        {episode.title}
                      </h3>
                      <span className="rounded-md bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--ink-muted)]">
                        {episode.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)] line-clamp-3">
                      {episode.summary || "No outline summary generated yet."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar for Story Review */}
              <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-3.5 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingEpisode(episode)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-3 py-1.5 font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-raised)]"
                  >
                    <Edit3 size={13} />
                    Edit Outline
                  </button>

                  <button
                    onClick={(e) => openRegenerateEpisodeOutline(episode, e)}
                    title="Regenerate this episode's outline with AI"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-3 py-1.5 font-semibold text-[var(--violet)] transition-colors hover:bg-[var(--surface-raised)]"
                  >
                    <RefreshCw size={13} />
                    Regenerate Outline
                  </button>
                </div>

                <Link
                  href={`/series/${id}/episodes/${episode.id}`}
                  className="inline-flex items-center gap-1 font-semibold text-[var(--violet)] transition-colors hover:text-[var(--ink)]"
                >
                  Workspace
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Modals ── */}
      <EditStoryModal
        isOpen={editingStory}
        onClose={() => setEditingStory(false)}
        onSave={handleSaveStory}
        series={series}
      />

      <EditEpisodeModal
        isOpen={editingEpisode !== null}
        onClose={() => setEditingEpisode(null)}
        onSave={handleSaveEpisode}
        episode={editingEpisode}
      />

      <EditCharacterModal
        isOpen={editingCharacter !== null}
        onClose={() => setEditingCharacter(null)}
        onSave={handleSaveCharacter}
        character={editingCharacter}
      />

      <ConfirmCostModal
        isOpen={regenTarget !== null}
        onClose={() => setRegenTarget(null)}
        onConfirm={handleConfirmRegenerate}
        estimate={estimate}
        isGenerating={regenerating}
        title={
          regenTarget?.type === "episode"
            ? `Regenerate Episode ${(regenTarget.item as Episode).number} Outline?`
            : `Regenerate ${(regenTarget?.item as Character)?.name || "character"}?`
        }
        description={
          regenTarget?.type === "episode"
            ? "This will regenerate only this episode's title and summary while maintaining narrative continuity with the rest of the series."
            : "This refreshes personality, appearance, and background while retaining the character's role in the series."
        }
      />
    </div>
  );
}
