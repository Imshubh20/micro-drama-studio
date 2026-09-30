"use client";

import { Bell, ChevronRight, Moon, Search, Sun } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function pageName(path: string) {
  if (path === "/") return "Studio";
  if (path === "/create") return "New series";
  if (path.includes("characters")) return "Character bible";
  if (path.includes("episodes")) return "Episode workspace";
  if (path.includes("series")) return "Series";
  return "Studio";
}

export default function Topbar() {
  const pathname = usePathname();
  const [light, setLight] = useState(false);
  const [isDemo, setIsDemo] = useState<boolean | null>(null);

  useEffect(() => {
    setLight(document.documentElement.dataset.theme === "light");
    fetch("http://localhost:5000/api/health")
      .then((r) => r.json())
      .then((data) => setIsDemo(data.demoMode ?? true))
      .catch(() => setIsDemo(true));
  }, []);

  const toggle = () => {
    const next = !light;
    setLight(next);
    localStorage.setItem("mds-theme", next ? "light" : "dark");
    document.documentElement.dataset.theme = next ? "light" : "dark";
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--surface-glass)] px-5 backdrop-blur-2xl md:px-8">
      {/* Breadcrumb & Mode indicator */}
      <div className="flex min-w-0 items-center gap-2.5 text-sm">
        <span className="hidden font-medium text-[var(--ink-faint)] sm:block">
          Micro Drama Studio
        </span>
        <ChevronRight
          size={14}
          className="hidden text-[var(--ink-faint)] sm:block"
        />
        <span className="truncate font-semibold text-[var(--ink)]">
          {pageName(pathname)}
        </span>
        {isDemo !== null && (
          <span
            className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-all ${
              isDemo
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isDemo ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            {isDemo ? "Demo AI Mode" : "Live Gemini"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          className="studio-icon-button hidden sm:grid"
          title="Search"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <button
          className="studio-icon-button relative"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--coral)]" />
        </button>

        <button
          onClick={toggle}
          className="studio-icon-button"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {light ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="ml-2 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[var(--violet)] to-[var(--coral)] text-[11px] font-bold tracking-tight text-white shadow-lg shadow-violet-900/20">
            TVID
          </span>
        </div>
      </div>
    </header>
  );
}
