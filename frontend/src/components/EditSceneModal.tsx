"use client";

import { useEffect, useState } from "react";
import { Film, Loader2, X } from "lucide-react";
import { Scene } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Scene>) => Promise<void>;
  scene: Scene | null;
}

export default function EditSceneModal({
  isOpen,
  onClose,
  onSave,
  scene,
}: Props) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("");
  const [camera, setCamera] = useState("");
  const [characters, setCharacters] = useState("");
  const [action, setAction] = useState("");
  const [dialogue, setDialogue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (scene) {
      setTitle(scene.title || "");
      setLocation(scene.location || "");
      setMood(scene.mood || "");
      setCamera(scene.camera || "");
      setCharacters(Array.isArray(scene.characters) ? scene.characters.join(", ") : "");
      setAction(scene.action || "");
      setDialogue(scene.dialogue || "");
      setError("");
    }
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Scene title is required.");
      return;
    }

    const parsedChars = characters
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    setSaving(true);
    setError("");
    try {
      await onSave({
        title: title.trim(),
        location: location.trim() || undefined,
        mood: mood.trim() || undefined,
        camera: camera.trim() || undefined,
        characters: parsedChars,
        action: action.trim() || undefined,
        dialogue: dialogue.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update scene.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit Scene ${scene.number}`}
      className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="modal-panel studio-panel my-8 w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl">
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
                <p className="eyebrow mb-0.5">
                  Scene {scene.number} Editor
                </p>
                <h2 className="text-xl font-bold text-[var(--ink)]">
                  Edit Scene Details
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
            {/* Title & Location */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1.5 block">Scene Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Encrypted Server"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block">Location Slug</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. INT. SECURE SERVER ROOM - NIGHT"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                />
              </div>
            </div>

            {/* Mood & Camera */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1.5 block">Mood & Tone</label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="e.g. Tense, Suspenseful, Claustrophobic"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block">Camera Direction</label>
                <input
                  type="text"
                  value={camera}
                  onChange={(e) => setCamera(e.target.value)}
                  placeholder="e.g. Slow zoom-in on terminal prompt"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                />
              </div>
            </div>

            {/* Characters */}
            <div>
              <label className="eyebrow mb-1.5 block">
                Characters Present (comma separated)
              </label>
              <input
                type="text"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="e.g. Rohan Malhotra, Vivek Rao"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
              />
            </div>

            {/* Action Description */}
            <div>
              <label className="eyebrow mb-1.5 block">Action Beats & Staging</label>
              <textarea
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="Describe physical actions, character movements, environmental cues..."
                rows={3}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm leading-6 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
              />
            </div>

            {/* Dialogue */}
            <div>
              <label className="eyebrow mb-1.5 block">Screenplay Dialogue</label>
              <textarea
                value={dialogue}
                onChange={(e) => setDialogue(e.target.value)}
                placeholder={'Character: "Dialogue line"\nOther: "Response line"'}
                rows={4}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 font-mono text-xs leading-5 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
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
                "Save Scene"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
