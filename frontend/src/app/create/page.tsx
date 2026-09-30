"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Circle, Sparkles, Wand2 } from "lucide-react";
import { createSeries, generateSeries, getSeriesCostEstimate, updateSeries } from "@/services/api";
import { CostEstimate, Tone } from "@/types";
import ConfirmCostModal from "@/components/ConfirmCostModal";

const steps = ["Story idea", "Series details", "AI generation", "Review"];

export default function CreateSeries() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
    genre: "",
    episodeCount: 5,
    episodeDuration: 3,
    tone: "DRAMATIC" as Tone,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  const [createdSeriesId, setCreatedSeriesId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Synchronous lock ref to prevent rapid double-clicks from firing multiple requests
  const isSubmittingRef = useRef(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prompt || !formData.genre) {
      setError("Add a story idea and genre to continue.");
      return;
    }
    // Block duplicate rapid submissions synchronously
    if (isSubmittingRef.current || submitting || generating) {
      return;
    }
    isSubmittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      let seriesId = createdSeriesId;
      if (!seriesId) {
        // Create ONE new Series
        const series = await createSeries(formData);
        seriesId = series.id;
        setCreatedSeriesId(series.id);
      } else {
        // If series was already created in this form session, update it instead of creating a duplicate
        await updateSeries(seriesId, formData);
      }
      if (seriesId) {
        setCostEstimate(await getSeriesCostEstimate(seriesId));
        setShowModal(true);
      }
    } catch {
      setError("We could not prepare this story. Please try again.");
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const confirm = async () => {
    if (!createdSeriesId || generating) return;
    setGenerating(true);
    try {
      // Trigger generation on the SAME existing seriesId
      generateSeries(createdSeriesId).catch(console.error);
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push(`/series/${createdSeriesId}`);
    } catch {
      setError("We could not start generation. Please try again.");
      setGenerating(false);
      setShowModal(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-10">
      {/* ── Header ── */}
      <header className="mb-9">
        <p className="eyebrow mb-2 flex items-center gap-2">
          <Sparkles size={12} className="text-[var(--coral)]" />
          New production
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          Build a story{" "}
          <span className="bg-gradient-to-r from-[var(--violet)] to-[var(--coral)] bg-clip-text text-transparent">
            worth watching
          </span>
          .
        </h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Give the studio a vivid premise. We will shape the world, cast, and
          episode arc.
        </p>
      </header>

      {/* ── Steps Indicator ── */}
      <div className="mb-9 grid grid-cols-2 gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-glass)] p-4 backdrop-blur-sm sm:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2.5 text-xs font-medium">
            <span
              className={`grid size-7 place-items-center rounded-lg transition-all duration-300 ${
                index === 0
                  ? "bg-gradient-to-br from-[var(--violet)] to-purple-600 text-white shadow-sm shadow-violet-500/30"
                  : "bg-[var(--surface-soft)] text-[var(--ink-faint)]"
              }`}
            >
              {index === 0 ? <Check size={14} /> : index + 1}
            </span>
            <span
              className={
                index === 0
                  ? "font-semibold text-[var(--ink)]"
                  : "text-[var(--ink-muted)]"
              }
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--ink)] backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* ── Form ── */}
      <form
        onSubmit={submit}
        className="grid gap-6 lg:grid-cols-[1fr_18rem]"
      >
        {/* Main content panel */}
        <section className="studio-panel overflow-hidden rounded-xl">
          {/* Top gradient accent */}
          <div className="h-1 bg-gradient-to-r from-[var(--violet)] via-purple-500 to-[var(--coral)]" />

          <div className="p-6 sm:p-8">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-[var(--ink)]">
                  The story spark
                </h2>
                <p className="mt-1.5 text-sm text-[var(--ink-muted)]">
                  Start with the moment that pulls the audience in.
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20">
                <Sparkles size={18} className="text-[var(--coral)]" />
              </span>
            </div>

            <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">
              Story idea <span className="text-[var(--coral)]">*</span>
            </label>
            <textarea
              required
              value={formData.prompt}
              onChange={(e) =>
                setFormData({ ...formData, prompt: e.target.value })
              }
              rows={8}
              placeholder="A college student keeps meeting the same mysterious girl on the last metro. Every morning, she has vanished without a trace."
              className="studio-field w-full resize-none rounded-xl px-4 py-3.5 text-sm leading-6"
            />
            <p className="mt-2 text-xs text-[var(--ink-faint)]">
              Try a protagonist, a complication, and what is at stake.
            </p>

            <div className="mt-8 border-t border-[var(--line)] pt-7">
              <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">
                Series title{" "}
                <span className="font-normal text-[var(--ink-faint)]">
                  optional
                </span>
              </label>
              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="The Last Metro"
                className="studio-field h-12 w-full rounded-xl px-4 text-sm"
              />
            </div>
          </div>
        </section>

        {/* Sidebar panel */}
        <aside className="studio-panel overflow-hidden rounded-xl">
          <div className="h-1 bg-gradient-to-r from-[var(--cyan)] to-[var(--violet)]" />

          <div className="p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[var(--ink)]">
              Series details
            </h2>

            <div className="mt-6 space-y-5">
              <label className="block text-sm font-semibold text-[var(--ink)]">
                Genre <span className="text-[var(--coral)]">*</span>
                <input
                  required
                  value={formData.genre}
                  onChange={(e) =>
                    setFormData({ ...formData, genre: e.target.value })
                  }
                  placeholder="Romance, Mystery…"
                  className="studio-field mt-2 h-11 w-full rounded-xl px-4 text-sm"
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--ink)]">
                Tone
                <select
                  value={formData.tone}
                  onChange={(e) =>
                    setFormData({ ...formData, tone: e.target.value as Tone })
                  }
                  className="studio-field mt-2 h-11 w-full rounded-xl px-4 text-sm"
                >
                  <option value="DRAMATIC">Dramatic</option>
                  <option value="DARK">Dark</option>
                  <option value="LIGHT">Light</option>
                  <option value="COMEDIC">Comedic</option>
                  <option value="SUSPENSEFUL">Suspenseful</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Episodes
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.episodeCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        episodeCount: parseInt(e.target.value) || 5,
                      })
                    }
                    className="studio-field mt-2 h-11 w-full rounded-xl px-4 text-sm"
                  />
                </label>

                <label className="block text-sm font-semibold text-[var(--ink)]">
                  Minutes
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.episodeDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        episodeDuration: parseInt(e.target.value) || 3,
                      })
                    }
                    className="studio-field mt-2 h-11 w-full rounded-xl px-4 text-sm"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.prompt || !formData.genre}
              className="group mt-8 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--violet-deep)] to-[var(--violet)] text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <>
                  <Circle size={16} className="animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Build my story
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>
        </aside>
      </form>

      <ConfirmCostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirm}
        estimate={costEstimate}
        isGenerating={generating}
        title="Ready to build your story?"
        description="The studio will draft the story world, character bible, and episode structure from your brief."
      />
    </div>
  );
}
