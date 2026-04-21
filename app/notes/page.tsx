import TerminalShell from "../components/TerminalShell";
import { getNotes } from "@/lib/notion";
import { FALLBACK_NOTES } from "@/lib/fallback";

export const revalidate = 60;

const KIND_COLORS: Record<string, string> = {
  book: "text-amber-300",
  paper: "text-cyan-300",
  framework: "text-emerald-300",
  quote: "text-pink-300",
  note: "text-neutral-300",
};

export default async function NotesPage() {
  let notes = await getNotes();
  const usingFallback = notes.length === 0;
  if (usingFallback) notes = FALLBACK_NOTES;

  return (
    <TerminalShell>
      <div className="space-y-5">
        <div className="text-sm text-neutral-400">
          <span className="text-emerald-400">$</span> cat notes/recent.log
        </div>

        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className="group border border-neutral-800 hover:border-neutral-700 bg-neutral-950/30 rounded-sm"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-neutral-800/70 text-[11px] bg-neutral-900/40">
                <span className={`uppercase tracking-wider ${KIND_COLORS[n.kind] || "text-neutral-300"}`}>
                  {n.kind}
                </span>
                <span className="text-neutral-700">·</span>
                <span className="text-neutral-400 truncate">{n.title || "—"}</span>
                {n.author && (
                  <>
                    <span className="text-neutral-700">·</span>
                    <span className="text-neutral-500 truncate">{n.author}</span>
                  </>
                )}
                {n.progress > 0 && (
                  <span className="ml-auto text-neutral-500 tabular-nums">{n.progress}%</span>
                )}
              </div>
              <div className="px-3 py-3">
                <p className="text-[13px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {n.note}
                </p>
                {n.progress > 0 && n.progress < 100 && (
                  <div className="mt-2.5 h-[2px] bg-neutral-800 overflow-hidden rounded-sm">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/70"
                      style={{ width: `${n.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {usingFallback ? (
          <div className="p-4 border border-amber-400/30 bg-amber-400/5 rounded-sm text-[12px] text-amber-200/80 leading-relaxed">
            还在用示例数据 · 在 Notion 里创建 Notes database (字段: Name, Kind, Author, Progress, Note, Updated)
            并填写 NOTION_NOTES_DATABASE_ID 后,这里会自动显示你的真实笔记。
          </div>
        ) : (
          <p className="text-[12px] text-neutral-500">
            <span className="text-emerald-400">$</span> 所有笔记都是公开的,欢迎指出错误。
          </p>
        )}
      </div>
    </TerminalShell>
  );
}
