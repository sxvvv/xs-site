import Link from "next/link";
import TerminalShell from "../components/TerminalShell";
import { SITE } from "@/lib/config";

export default function ProjectsPage() {
  return (
    <TerminalShell>
      <div className="space-y-5">
        <div className="text-sm text-neutral-400">
          <span className="text-emerald-400">$</span> git log --oneline --graph projects/
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {SITE.projects.map((p) => (
            <Link
              key={p.name}
              href={p.url}
              className="group relative border border-neutral-800 hover:border-emerald-400/50 bg-neutral-950/40 p-4 rounded-sm transition-all block"
            >
              <div className="absolute top-0 right-0 p-2 text-[10px] text-neutral-600">
                <span
                  className={
                    p.status === "active"
                      ? "text-emerald-400"
                      : p.status === "alpha"
                      ? "text-amber-400"
                      : "text-cyan-400"
                  }
                >
                  ●
                </span>{" "}
                {p.status}
              </div>

              <div className="flex items-baseline gap-2 pr-16">
                <span className="text-neutral-500 text-xs">$</span>
                <h3 className="text-neutral-100 group-hover:text-emerald-200 transition-colors">
                  {p.name}
                </h3>
                <span className="text-[10.5px] text-neutral-500 font-light">
                  {p.tag}
                </span>
              </div>

              <p className="text-[13px] text-neutral-400 mt-2 leading-relaxed">
                {p.desc}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-500 tabular-nums">
                  <span className="text-amber-300/70">★</span>
                  {p.stars}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="pt-4 text-[12px] text-neutral-500">
          <span className="text-emerald-400">$</span> 想改内容? 编辑{" "}
          <code className="text-cyan-300">lib/config.ts</code> 里的 projects 数组。
        </p>
      </div>
    </TerminalShell>
  );
}
