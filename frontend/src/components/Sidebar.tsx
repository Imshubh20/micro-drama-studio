"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Clapperboard,
  Command,
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Sparkles,
  Sun,
  Monitor,
} from "lucide-react";

type Theme = "dark" | "light" | "system";

const links = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "My Library", href: "/", icon: BookOpen },
  { name: "New Series", href: "/create", icon: Plus },
  { name: "Settings", href: "/", icon: Settings },
];

function applyTheme(theme: Theme) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const saved = (localStorage.getItem("mds-theme") as Theme | null) || "system";
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const changeTheme = (next: Theme) => {
    setTheme(next);
    localStorage.setItem("mds-theme", next);
    applyTheme(next);
  };

  const active = (name: string, href: string) =>
    name === "My Library" ? pathname.startsWith("/series") : pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--surface-glass)] px-4 py-5 backdrop-blur-2xl md:flex">
        {/* Logo */}
        <Link
          href="/"
          className="group mb-8 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--surface-soft)]"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--violet)] via-purple-500 to-[var(--coral)] text-white shadow-lg shadow-violet-900/30 transition-transform duration-300 group-hover:scale-105">
            <Clapperboard size={20} />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-[0.1em] text-[var(--ink)]">
              MICRO DRAMA
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.18em] text-[var(--ink-muted)]">
              STUDIO
            </span>
          </span>
        </Link>

        {/* Navigation */}
        <p className="eyebrow mb-3 px-3">Workspace</p>
        <nav className="space-y-1" aria-label="Primary navigation">
          {links.map(({ name, href, icon: Icon }) => {
            const isActive = active(name, href);
            return (
              <Link
                key={name}
                href={href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-gradient-to-r from-[var(--violet-glow)] to-transparent text-[var(--ink)] shadow-sm"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--violet)]" />
                )}
                <Icon
                  size={17}
                  className={`transition-all duration-200 group-hover:scale-110
                    ${isActive ? "text-[var(--violet)]" : ""}`}
                />
                {name}
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--violet)] shadow-sm shadow-violet-500/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-4">
          {/* Theme Switcher */}
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
            <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
              <Sparkles size={14} className="text-[var(--coral)]" />
              Appearance
            </div>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--surface-soft)] p-1">
              {(
                [
                  ["dark", Moon, "Dark"],
                  ["light", Sun, "Light"],
                  ["system", Monitor, "System"],
                ] as const
              ).map(([value, Icon, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-label={label}
                  title={label}
                  onClick={() => changeTheme(value)}
                  className={`grid h-8 place-items-center rounded-md text-xs transition-all duration-200
                    ${
                      theme === value
                        ? "bg-[var(--surface-raised)] text-[var(--violet)] shadow-sm"
                        : "text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)]"
                    }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* User */}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--surface-soft)]">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-purple-400 text-[11px] font-bold tracking-tight text-white shadow-md">
              TVID
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[var(--ink)]">
                Demo Creator
              </span>
              <span className="block text-xs text-[var(--ink-muted)]">
                Creator plan
              </span>
            </span>
            <Command
              size={14}
              className="ml-auto text-[var(--ink-faint)]"
            />
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav
        className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-[var(--line)] bg-[var(--surface-glass)] p-2 shadow-2xl backdrop-blur-2xl md:hidden"
        aria-label="Mobile navigation"
      >
        {links.slice(0, 3).map(({ name, href, icon: Icon }) => {
          const isActive = active(name, href);
          return (
            <Link
              key={name}
              href={href}
              aria-label={name}
              className={`grid min-w-14 place-items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all duration-200
                ${
                  isActive
                    ? "bg-[var(--violet-glow)] text-[var(--violet)]"
                    : "text-[var(--ink-muted)]"
                }`}
            >
              <Icon size={18} />
              {name.replace("New Series", "Create")}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
