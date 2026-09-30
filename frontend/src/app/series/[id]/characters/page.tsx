"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Edit3, Lock, RefreshCw, Sparkles, Unlock, Users } from "lucide-react";
import {
  getCharacterCostEstimate,
  getSeriesById,
  regenerateCharacter,
  toggleCharacterLock,
  updateCharacter,
} from "@/services/api";
import { Character, CostEstimate, Series } from "@/types";
import ConfirmCostModal from "@/components/ConfirmCostModal";
import EditCharacterModal from "@/components/EditCharacterModal";

export default function CharacterBible({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const routeParams = useParams();
  const resolvedParams = params ? use(params) : null;
  const id = (resolvedParams?.id || routeParams?.id) as string;
  const [series, setSeries] = useState<Series | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [running, setRunning] = useState(false);

  const load = async () => {
    try {
      const data = await getSeriesById(id);
      setSeries(data);
    } catch {
      setError("We could not load the character bible.");
      setSeries(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  const lock = async (character: Character) => {
    setSeries((prev) =>
      prev
        ? {
            ...prev,
            characters: prev.characters?.map((item) =>
              item.id === character.id
                ? { ...item, isLocked: !item.isLocked }
                : item
            ),
          }
        : prev
    );
    try {
      await toggleCharacterLock(character.id, !character.isLocked);
    } catch {
      setError("The character lock could not be updated.");
      load();
    }
  };

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
    setEditingCharacter(null);
  };

  const openRegenerate = async (character: Character) => {
    if (character.isLocked) {
      setError(
        `${character.name} is locked. Unlock them before regenerating.`
      );
      return;
    }
    setSelected(character);
    setEstimate(null);
    try {
      setEstimate(await getCharacterCostEstimate(character.id));
    } catch {
      setError("We could not calculate that generation cost.");
    }
  };

  const regenerate = async () => {
    if (!selected) return;
    setRunning(true);
    try {
      await regenerateCharacter(selected.id);
      await load();
      setSelected(null);
    } catch {
      setError("Character generation failed. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="skeleton h-80 rounded-xl" />
      </div>
    );
  }

  // ── Not Found ──
  if (!series) {
    return (
      <div className="mx-auto max-w-7xl py-14 text-center">
        <div className="studio-panel mx-auto max-w-md rounded-2xl p-8">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
            <Users size={26} className="text-[var(--violet)]" />
          </span>
          <p className="text-lg font-bold text-[var(--ink)]">
            Series not found
          </p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            This character bible cannot be loaded because the series does not exist.
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

  const characters = series?.characters || [];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <Link
        href={`/series/${id}`}
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft size={15} />
        Series overview
      </Link>

      {/* Header */}
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--coral)]" />
            Continuity room
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
            Character{" "}
            <span className="bg-gradient-to-r from-[var(--violet)] to-[var(--coral)] bg-clip-text text-transparent">
              bible
            </span>
          </h1>
          <p className="mt-2.5 text-[var(--ink-muted)]">
            Edit profiles or lock characters to keep their identity steady across AI prompts.
          </p>
        </div>
        <span className="hidden rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-3.5 text-[var(--violet)] sm:block">
          <Users size={22} />
        </span>
      </header>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 text-sm text-[var(--ink)] backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Empty state */}
      {characters.length === 0 ? (
        <div className="studio-panel grid min-h-72 place-items-center rounded-2xl p-10 text-center">
          <div>
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Users size={26} className="text-[var(--violet)]" />
            </span>
            <h2 className="text-lg font-bold text-[var(--ink)]">
              The cast has not arrived yet.
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Characters will appear here after your story is generated.
            </p>
          </div>
        </div>
      ) : (
        /* Character Grid */
        <div className="grid gap-5 md:grid-cols-2">
          {characters.map((character) => (
            <article
              key={character.id}
              className={`studio-panel overflow-hidden rounded-xl transition-all duration-300 ${
                character.isLocked
                  ? "border-[color-mix(in_srgb,var(--amber)_35%,transparent)]"
                  : ""
              }`}
            >
              {/* Locked indicator bar */}
              {character.isLocked && (
                <div className="h-0.5 bg-gradient-to-r from-amber-500/50 via-yellow-500/50 to-amber-500/50" />
              )}

              <div className="flex items-start gap-4 p-6">
                {/* Avatar */}
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--violet)] via-purple-500 to-[var(--coral)] text-lg font-bold text-white shadow-lg shadow-violet-900/20">
                  {character.name.slice(0, 1).toUpperCase()}
                </span>

                <div className="min-w-0 flex-1">
                  {/* Name + Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="truncate text-lg font-bold text-[var(--ink)]">
                        {character.name}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-[var(--ink-muted)]">
                        {[
                          character.role,
                          character.age && `${character.age} years`,
                          character.gender,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setEditingCharacter(character)}
                        title="Edit character profile"
                        aria-label="Edit character profile"
                        className="rounded-lg p-2 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => openRegenerate(character)}
                        title="Regenerate character with AI"
                        aria-label="Regenerate character with AI"
                        disabled={character.isLocked}
                        className="rounded-lg p-2 text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--ink)] disabled:opacity-30"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        onClick={() => lock(character)}
                        title={
                          character.isLocked
                            ? "Unlock character"
                            : "Lock character"
                        }
                        aria-label={
                          character.isLocked
                            ? "Unlock character"
                            : "Lock character"
                        }
                        className={`rounded-lg p-2 transition-colors ${
                          character.isLocked
                            ? "bg-[color-mix(in_srgb,var(--amber)_15%,transparent)] text-[var(--amber)]"
                            : "text-[var(--ink-muted)] hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        {character.isLocked ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Character details */}
                  <dl className="mt-6 space-y-5 text-sm">
                    <div>
                      <dt className="eyebrow mb-1.5">Personality</dt>
                      <dd className="leading-5 text-[var(--ink-muted)]">
                        {character.personality || "Not defined yet."}
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1.5">Appearance</dt>
                      <dd className="leading-5 text-[var(--ink-muted)]">
                        {character.appearance || "Not defined yet."}
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow mb-1.5">Background</dt>
                      <dd className="line-clamp-3 leading-5 text-[var(--ink-muted)]">
                        {character.background ||
                          character.description ||
                          "Not defined yet."}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Relationships footer */}
              {character.relationshipsFrom?.length ? (
                <footer className="border-t border-[var(--line)] bg-[var(--surface-soft)] px-6 py-3.5 text-xs text-[var(--ink-muted)]">
                  {character.relationshipsFrom.map((rel) => (
                    <span
                      key={rel.id}
                      className="mr-3 inline-flex gap-1"
                    >
                      <strong className="font-semibold text-[var(--ink)]">
                        {rel.toCharacter?.name}
                      </strong>
                      {rel.relationship}
                    </span>
                  ))}
                </footer>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {/* Manual Edit Character Modal */}
      <EditCharacterModal
        isOpen={editingCharacter !== null}
        onClose={() => setEditingCharacter(null)}
        onSave={handleSaveCharacter}
        character={editingCharacter}
      />

      {/* AI Regenerate Character Confirmation */}
      <ConfirmCostModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirm={regenerate}
        estimate={estimate}
        isGenerating={running}
        title={`Regenerate ${selected?.name || "character"}?`}
        description="This refreshes personality, appearance, and background while retaining the role in the series."
      />
    </div>
  );
}
