"use client";

import { useEffect, useState } from "react";
import { Clapperboard, Loader2, X } from "lucide-react";
import { Episode, EpisodeStatus } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Episode>) => Promise<void>;
  episode: Episode | null;
}

export default function EditEpisodeModal({
  isOpen,
  onClose,
  onSave,
  episode,
}: Props) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState<EpisodeStatus>("DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (episode) {
      setTitle(episode.title || "");
      setSummary(episode.summary || "");
      setStatus(episode.status || "DRAFT");
      setError("");
    }
  }, [episode, isOpen]);

  if (!isOpen || !episode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Episode title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        summary: summary.trim() || undefined,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update episode.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit Episode ${episode.number}`}
      className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="modal-panel studio-panel my-8 w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[var(--violet)] via-purple-500 to-[var(--coral)]" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-[var(--violet)]">
                <Clapperboard size={20} />
              </span>
              <div>
                <p className="eyebrow mb-0.5">
                  Episode {String(episode.number).padStart(2, "0")}
                </p>
                <h2 className="text-xl font-bold text-[var(--ink)]">
                  Edit Episode Outline
                </h2>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close"
              title="Close"
              onClick={onClose}
              disabled={saving}
              className="studio-icon-button"
            >
              <X size={19} />
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-2.5 text-xs text-[var(--danger)]">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4 text-sm">
            {/* Title */}
            <div>
              <label className="eyebrow mb-1.5 block">Episode Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The 3:17 AM Message"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="eyebrow mb-1.5 block">Episode Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EpisodeStatus)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--violet)] focus:outline-none"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="IN_REVIEW">IN_REVIEW</option>
                <option value="READY">READY</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            </div>

            {/* Summary */}
            <div>
              <label className="eyebrow mb-1.5 block">
                Episode Summary & Dramatic Conflict
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe key narrative events, character dilemmas, confrontations, and the cliffhanger..."
                rows={5}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm leading-6 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 border-t border-[var(--line)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="studio-button studio-button-secondary flex-1 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="studio-button studio-button-primary flex-1 rounded-xl"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
