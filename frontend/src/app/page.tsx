"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Clapperboard,
  Clock3,
  Film,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getSeries } from "@/services/api";
import { Series } from "@/types";

const coverClass = (genre: string) =>
  /romance/i.test(genre)
    ? "cover-romance"
    : /mystery|thriller|crime/i.test(genre)
      ? "cover-mystery"
      : /drama/i.test(genre)
        ? "cover-drama"
        : "cover-default";

const statusTone = (status: string) =>
  status === "PUBLISHED"
    ? "text-[var(--green)] bg-[color-mix(in_srgb,var(--green)_14%,transparent)]"
    : status === "GENERATING"
      ? "text-[var(--amber)] bg-[color-mix(in_srgb,var(--amber)_14%,transparent)]"
      : "text-[var(--violet)] bg-[color-mix(in_srgb,var(--violet)_14%,transparent)]";

export default function Dashboard() {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getSeries()
      .then(setSeriesList)
      .catch(() => setError("We could not load your stories. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const episodes = seriesList.reduce(
    (sum, item) => sum + (item._count?.episodes || 0),
    0
  );
  const published = seriesList.filter(
    (item) => item.status === "PUBLISHED"
  ).length;
  const inProgress = seriesList.filter((item) =>
    ["GENERATING", "IN_REVIEW", "READY"].includes(item.status)
  ).length;

  const stats = [
    {
      label: "Total series",
      value: seriesList.length,
      icon: Film,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-[var(--violet)]",
    },
    {
      label: "Episodes",
      value: episodes,
      icon: Clapperboard,
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-[var(--coral)]",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: TrendingUp,
      gradient: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-[var(--cyan)]",
    },
    {
      label: "Published",
      value: published,
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-green-500/20",
      iconColor: "text-[var(--green)]",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      {/* ── Hero Header ── */}
      <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Sparkles size={12} className="text-[var(--coral)]" />
            Creative dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
            Good afternoon,{" "}
            <span className="bg-gradient-to-r from-[var(--violet)] to-[var(--coral)] bg-clip-text text-transparent">
              Creator
            </span>
            .
          </h1>
          <p className="mt-2.5 text-[var(--ink-muted)]">
            Shape your next story with AI.
          </p>
        </div>

        <Link
          href="/create"
          className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[var(--violet-deep)] to-[var(--violet)] px-6 text-sm font-semibold text-white shadow-lg shadow-violet-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-900/30"
        >
          <Plus
            size={17}
            className="transition-transform duration-300 group-hover:rotate-90"
          />
          Create new series
        </Link>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-sm text-[var(--ink)] backdrop-blur-sm">
          <span>{error}</span>
          <button
            onClick={() => location.reload()}
            className="font-semibold text-[var(--danger)] transition-colors hover:text-[var(--ink)]"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, gradient, iconColor }) => (
          <div
            key={label}
            className="stat-card studio-panel group overflow-hidden rounded-xl p-5"
          >
            <div
              className={`mb-6 grid size-10 place-items-center rounded-xl bg-gradient-to-br ${gradient}`}
            >
              <Icon
                size={18}
                className={`${iconColor} transition-transform duration-300 group-hover:scale-110`}
              />
            </div>
            <div className="text-3xl font-bold tracking-tight text-[var(--ink)]">
              {loading ? (
                <span className="skeleton inline-block h-8 w-14 rounded-lg" />
              ) : (
                value
              )}
            </div>
            <div className="mt-1.5 text-sm font-medium text-[var(--ink-muted)]">
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Library Section ── */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-1.5">Library</p>
            <h2 className="text-xl font-bold text-[var(--ink)]">
              Your stories
            </h2>
          </div>
          {seriesList.length > 3 && (
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--violet)] transition-colors hover:text-[var(--ink)]"
            >
              View all
              <ArrowUpRight
                size={15}
                className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="studio-panel overflow-hidden rounded-xl"
              >
                <div className="skeleton h-48" />
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-2/3 rounded-lg" />
                  <div className="skeleton h-4 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : seriesList.length === 0 && !error ? (
          /* Empty State */
          <div className="studio-panel grid min-h-80 place-items-center rounded-2xl p-10 text-center">
            <div>
              <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-[var(--violet-glow)] to-[var(--coral-glow)] text-[var(--violet)]">
                <Clapperboard size={28} />
              </span>
              <h2 className="text-xl font-bold text-[var(--ink)]">
                Your studio is waiting for its first story.
              </h2>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Create a new series to get started with AI-powered storytelling.
              </p>
              <Link
                href="/create"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--violet)] transition-colors hover:text-[var(--ink)]"
              >
                Create your first series
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        ) : (
          /* Series Grid */
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {seriesList.map((series) => {
              const completed = series.episodeCount
                ? Math.round(
                    ((series._count?.episodes || 0) / series.episodeCount) * 100
                  )
                : 0;

              return (
                <Link
                  key={series.id}
                  href={`/series/${series.id}`}
                  className="series-card studio-panel group overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-1.5"
                >
                  {/* Cover */}
                  <div
                    className={`cover ${coverClass(series.genre)} h-48 p-5`}
                  >
                    <Film className="cover-mark" size={140} />

                    <div className="relative z-10 flex items-start justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-md ${statusTone(series.status)}`}
                      >
                        <span className="status-dot bg-current" />
                        {series.status.replace("_", " ")}
                      </span>
                      <span className="rounded-lg bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md">
                        {series.genre}
                      </span>
                    </div>

                    <h3 className="absolute inset-x-5 bottom-5 z-10 truncate text-xl font-bold text-white drop-shadow-lg">
                      {series.title || "Untitled series"}
                    </h3>
                  </div>

                  {/* Details */}
                  <div className="p-5">
                    <p className="h-10 overflow-hidden text-sm leading-5 text-[var(--ink-muted)]">
                      {series.description || series.prompt}
                    </p>

                    <div className="mt-5 flex items-center justify-between text-xs text-[var(--ink-muted)]">
                      <span className="flex items-center gap-1.5">
                        <Clapperboard size={13} />
                        {series._count?.episodes || 0} / {series.episodeCount}{" "}
                        episodes
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {new Date(series.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="progress-bar mt-4">
                      <div
                        className="progress-fill"
                        style={{ width: `${completed}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
