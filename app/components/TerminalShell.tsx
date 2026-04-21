"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Terminal,
  User,
  FileCode2,
  FolderGit2,
  BookOpen,
  Circle,
  ChevronRight,
  Hash,
  Clock,
  Wifi,
  Command,
  Coffee,
} from "lucide-react";
import { SITE } from "@/lib/config";
import CommandPalette from "./CommandPalette";

const NAV = [
  { id: "about",    label: "about.md",  icon: User,       hint: "whoami", href: "/" },
  { id: "blog",     label: "blog/",     icon: FileCode2,  hint: "ls -la", href: "/blog" },
  { id: "projects", label: "projects/", icon: FolderGit2, hint: "git log", href: "/projects" },
  { id: "notes",    label: "notes/",    icon: BookOpen,   hint: "cat",    href: "/notes" },
];

export default function TerminalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((p) => !p);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const active =
    NAV.find((n) =>
      n.href === "/" ? pathname === "/" : pathname?.startsWith(n.href),
    ) ?? NAV[0];

  return (
    <div
      className="min-h-screen w-full text-neutral-200"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(16,185,129,0.06), transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(6,182,212,0.05), transparent 60%), #07080a",
      }}
    >
      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-10 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">
        <div className="border border-neutral-800 rounded-lg overflow-hidden shadow-2xl shadow-black/60 bg-neutral-950/70 backdrop-blur-sm">
          {/* title bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/70">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex-1 text-center text-[11px] text-neutral-500 tracking-wider">
              <Terminal className="w-3 h-3 inline-block mr-1.5 -mt-0.5" />
              {SITE.handle}@site — zsh — {active.label}
            </div>
            <button
              onClick={() => setPaletteOpen(true)}
              className="flex items-center gap-1.5 text-[10.5px] text-neutral-500 hover:text-emerald-300 border border-neutral-800 hover:border-emerald-500/50 px-2 py-0.5 rounded-sm transition-colors"
            >
              <Command className="w-3 h-3" /> K
            </button>
          </div>

          {/* body */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[640px]">
            {/* sidebar */}
            <aside className="border-b md:border-b-0 md:border-r border-neutral-800 bg-neutral-950/40">
              <div className="px-4 py-4 border-b border-neutral-900">
                <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">
                  workspace
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-950 flex items-center justify-center text-[11px] font-bold">
                    {SITE.handle.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] text-neutral-100 truncate">{SITE.name}</div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" />
                      available
                    </div>
                  </div>
                </div>
              </div>

              <nav className="px-2 py-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 px-2 mb-1.5">
                  explorer
                </div>
                {NAV.map((n) => {
                  const Icon = n.icon;
                  const isActive = active.id === n.id;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded-sm transition-all ${
                        isActive
                          ? "bg-emerald-400/10 text-emerald-200 border-l border-emerald-400"
                          : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                      }`}
                    >
                      <ChevronRight
                        className={`w-3 h-3 flex-shrink-0 transition-transform ${
                          isActive ? "rotate-90 text-emerald-400" : ""
                        }`}
                      />
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 truncate">{n.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="px-4 py-3 border-t border-neutral-900 mt-2">
                <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">
                  shortcuts
                </div>
                <div className="space-y-1 text-[11px] text-neutral-500">
                  <div className="flex justify-between">
                    <span>command</span>
                    <span>
                      <kbd className="px-1 border border-neutral-800 rounded-sm">⌘</kbd>
                      <kbd className="ml-0.5 px-1 border border-neutral-800 rounded-sm">K</kbd>
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* main */}
            <main className="p-6 md:p-8 min-w-0">
              {/* breadcrumb */}
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mb-6 flex-wrap">
                <span>~</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span>{SITE.handle}</span>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-emerald-300">{active.label}</span>
                <span className="ml-auto text-neutral-600">({active.hint})</span>
              </div>

              {children}
            </main>
          </div>

          {/* status bar */}
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-neutral-800 bg-neutral-900/70 text-[10.5px] text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-emerald-400">
                <Circle className="w-1.5 h-1.5 fill-current" /> main
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" /> {active.id}
              </span>
              <span className="hidden md:inline">UTF-8 · LF</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-1">
                <Coffee className="w-3 h-3" /> building in public
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-400" /> online
              </span>
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="w-3 h-3" />
                {now
                  ? now.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })
                  : "--:--:--"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-neutral-600">
          <div>
            crafted with <span className="text-emerald-500">&lt;/&gt;</span> and too much coffee · ©{" "}
            {now ? now.getFullYear() : ""}
          </div>
          <div>v2.4.0</div>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
