"use client";

import { useEffect, useState } from "react";
import { Film, Loader2, X } from "lucide-react";
import { Series } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Series>) => Promise<void>;
  series: Series | null;
}

export default function EditStoryModal({
  isOpen,
  onClose,
  onSave,
  series,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [storyline, setStoryline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (series) {
      setTitle(series.title || "");
      setDescription(series.description || series.prompt || "");
      setStoryline(series.storyline || "");
      setError("");
    }
  }, [series, isOpen]);

  if (!isOpen || !series) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Series title is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        storyline: storyline.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update story.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Story Details"
      className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="modal-panel studio-panel my-8 w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-[var(--violet)] via-purple-500 to-[var(--coral)]" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-[var(--violet)]">
                <Film size={20} />
              </span>
              <div>
                <p className="eyebrow mb-0.5">Story Review</p>
                <h2 className="text-xl font-bold text-[var(--ink)]">
                  Edit Story Overview
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

          <div className="mt-5 space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-1">
            {/* Title */}
            <div>
              <label className="eyebrow mb-1.5 block">Series Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The 3:17 AM Message"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                required
              />
            </div>

            {/* Premise / Description */}
            <div>
              <label className="eyebrow mb-1.5 block">
                Premise / Logline
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short, punchy overview of the central hook..."
                rows={3}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm leading-6 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
              />
            </div>

            {/* Storyline */}
            <div>
              <label className="eyebrow mb-1.5 block">
                Overall Storyline & Arc
              </label>
              <textarea
                value={storyline}
                onChange={(e) => setStoryline(e.target.value)}
                placeholder="Detailed narrative trajectory across episodes..."
                rows={6}
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
                "Save Story Overview"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
