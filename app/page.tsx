import Link from "next/link";
import { Circle, Github, Mail, ArrowUpRight, Terminal, FileCode2 } from "lucide-react";
import TerminalShell from "./components/TerminalShell";
import { SITE } from "@/lib/config";
import { getPosts } from "@/lib/notion";
import { FALLBACK_POSTS } from "@/lib/fallback";

export const revalidate = 60;

export default async function HomePage() {
  let posts = await getPosts();
  if (posts.length === 0) posts = FALLBACK_POSTS;
  const recent = posts.slice(0, 3);

  return (
    <TerminalShell>
      {/* ─── hero ─── */}
      <section className="mb-16 pb-12 border-b border-neutral-800/70">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-emerald-400/70 mb-5">
          <Terminal className="w-3 h-3" />
          <span>welcome.sh</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-light text-neutral-50 tracking-tight leading-[1.15]">
          <span className="text-emerald-300">const</span>{" "}
          <span className="text-neutral-200">me</span>{" "}
          <span className="text-neutral-600">=</span>{" "}
          <span className="text-amber-300">&quot;{SITE.name}&quot;</span>
          <span className="text-neutral-600">;</span>
          <span className="inline-block w-2 h-6 md:h-9 ml-1 align-middle bg-emerald-300/80 animate-pulse" />
        </h1>
        <p className="font-prose text-neutral-300 text-[15px] md:text-[16px] mt-7 max-w-2xl leading-[1.85]">
          {SITE.tagline}
        </p>
      </section>

      {/* ─── whoami ─── */}
      <section className="space-y-7">
        <div className="text-sm text-neutral-400 font-mono">
          <span className="text-emerald-400">$</span> whoami{" "}
          <span className="text-neutral-600">--verbose</span>
        </div>

        <div className="grid md:grid-cols-[110px_1fr] gap-x-8 gap-y-5 text-[13.5px] pl-4 md:pl-6">
          <div className="text-neutral-500 font-mono">name</div>
          <div className="text-neutral-100">
            {SITE.name}{" "}
            <span className="text-neutral-500 text-[12px]">
              &lt;{SITE.handle}@localhost&gt;
            </span>
          </div>

          <div className="text-neutral-500 font-mono">role</div>
          <div className="text-neutral-200">{SITE.role}</div>

          <div className="text-neutral-500 font-mono">location</div>
          <div className="text-neutral-200">{SITE.location}</div>

          <div className="text-neutral-500 font-mono">status</div>
          <div className="flex items-center gap-2 text-emerald-300">
            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
            <span>{SITE.status}</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400">欢迎交流</span>
          </div>

          <div className="text-neutral-500 font-mono pt-0.5">interests</div>
          <div className="flex flex-wrap gap-1.5">
            {SITE.interests.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[11px] border border-neutral-700/80 text-neutral-300 rounded-sm hover:border-emerald-400/40 hover:text-emerald-200 transition-colors"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── about ─── */}
      <section className="mt-16 space-y-7">
        <div className="text-sm text-neutral-400 font-mono">
          <span className="text-emerald-400">$</span> cat{" "}
          <span className="text-cyan-300">about.md</span>
        </div>

        <div className="pl-4 md:pl-6 border-l-2 border-emerald-400/30">
          <div className="font-prose text-neutral-200 text-[15px] leading-[1.9] space-y-5 max-w-2xl">
            {SITE.about.map((p, i) => (
              <p
                key={i}
                className={i === SITE.about.length - 1 ? "text-neutral-400 text-[14px] pt-1" : ""}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ─── recent posts ─── */}
      {recent.length > 0 && (
        <section className="mt-16 space-y-6">
          <div className="flex items-baseline justify-between">
            <div className="text-sm text-neutral-400 font-mono">
              <span className="text-emerald-400">$</span> tail -n 3{" "}
              <span className="text-cyan-300">blog/</span>
            </div>
            <Link
              href="/blog"
              className="text-[11px] text-neutral-500 hover:text-emerald-300 transition-colors flex items-center gap-1"
            >
              view all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="pl-4 md:pl-6 divide-y divide-neutral-800/60">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group grid grid-cols-[auto_1fr] gap-4 py-3.5 items-baseline hover:bg-emerald-400/[0.03] -mx-2 px-2 transition-colors rounded-sm"
              >
                <div className="text-[11px] text-neutral-500 tabular-nums font-mono pt-0.5">
                  {p.date}
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] text-neutral-100 group-hover:text-emerald-200 transition-colors truncate">
                    <FileCode2 className="w-3 h-3 inline-block mr-2 -mt-0.5 text-neutral-600 group-hover:text-emerald-400/70 transition-colors" />
                    {p.title}
                  </div>
                  {p.excerpt && (
                    <div className="font-prose text-neutral-400 text-[13px] mt-1.5 leading-relaxed truncate">
                      {p.excerpt}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── contact ─── */}
      <section className="mt-16 space-y-5">
        <div className="text-sm text-neutral-400 font-mono">
          <span className="text-emerald-400">$</span> ls{" "}
          <span className="text-cyan-300">contact/</span>
        </div>
        <div className="flex flex-wrap gap-2.5 text-[13px] pl-4 md:pl-6">
          {[
            { Icon: Github,  label: "github",      href: SITE.github },
            { Icon: Mail,    label: SITE.email,    href: `mailto:${SITE.email}` },
          ].map(({ Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="group flex items-center gap-2 px-3 py-2 border border-neutral-800 hover:border-emerald-400/60 text-neutral-300 hover:text-emerald-200 hover:bg-emerald-400/[0.04] transition-all rounded-sm"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          ))}
        </div>
      </section>
    </TerminalShell>
  );
}
