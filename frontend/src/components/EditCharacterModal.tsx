"use client";

import { useEffect, useState } from "react";
import { Loader2, User, X } from "lucide-react";
import { Character } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Character>) => Promise<void>;
  character: Character | null;
}

export default function EditCharacterModal({
  isOpen,
  onClose,
  onSave,
  character,
}: Props) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [gender, setGender] = useState("");
  const [personality, setPersonality] = useState("");
  const [appearance, setAppearance] = useState("");
  const [background, setBackground] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (character) {
      setName(character.name || "");
      setRole(character.role || "");
      setAge(character.age || "");
      setGender(character.gender || "");
      setPersonality(character.personality || "");
      setAppearance(character.appearance || "");
      setBackground(character.background || character.description || "");
      setError("");
    }
  }, [character, isOpen]);

  if (!isOpen || !character) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Character name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        role: role.trim() || undefined,
        age: age ? Number(age) : undefined,
        gender: gender.trim() || undefined,
        personality: personality.trim() || undefined,
        appearance: appearance.trim() || undefined,
        background: background.trim() || undefined,
        description: background.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to update character.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${character.name}`}
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
                <User size={20} />
              </span>
              <div>
                <p className="eyebrow mb-0.5">Character Profile</p>
                <h2 className="text-xl font-bold text-[var(--ink)]">
                  Edit {character.name}
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
            {/* Name & Role */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1.5 block">Character Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Inspector Kabir"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block">Role / Archetype</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Protagonist, Antagonist, Mentor"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="eyebrow mb-1.5 block">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                  min="1"
                  max="120"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                />
              </div>

              <div>
                <label className="eyebrow mb-1.5 block">Gender</label>
                <input
                  type="text"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  placeholder="e.g. Female, Male, Non-binary"
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
                />
              </div>
            </div>

            {/* Personality */}
            <div>
              <label className="eyebrow mb-1.5 block">Personality & Traits</label>
              <textarea
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Key personality attributes, moral compass, quirks..."
                rows={2}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
              />
            </div>

            {/* Appearance */}
            <div>
              <label className="eyebrow mb-1.5 block">Visual Appearance & Style</label>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Physical build, clothing, notable features..."
                rows={2}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
              />
            </div>

            {/* Background */}
            <div>
              <label className="eyebrow mb-1.5 block">Backstory & Motivations</label>
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Origin, pivotal life events, stakes in this series..."
                rows={3}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--violet)] focus:outline-none"
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
