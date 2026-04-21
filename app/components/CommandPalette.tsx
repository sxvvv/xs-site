"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";

const CMDS = [
  { label: "go to about",    hint: "whoami",   href: "/" },
  { label: "go to blog",     hint: "ls -la",   href: "/blog" },
  { label: "go to projects", hint: "git log",  href: "/projects" },
  { label: "go to notes",    hint: "cat",      href: "/notes" },
];

export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else setQ("");
  }, [open]);

  if (!open) return null;
  const items = CMDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-neutral-950 border border-neutral-700 rounded-md shadow-2xl"
      >
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-800">
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="type a command..."
            className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-600 outline-none"
          />
          <kbd className="text-[10px] text-neutral-500 border border-neutral-700 px-1 rounded">
            esc
          </kbd>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {items.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-neutral-500">
              no matches
            </div>
          )}
          {items.map((it) => (
            <button
              key={it.href}
              onClick={() => {
                router.push(it.href);
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-neutral-300 hover:bg-emerald-400/10 hover:text-emerald-200 text-left"
            >
              <span className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                {it.label}
              </span>
              <span className="text-[10px] text-neutral-500">{it.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
