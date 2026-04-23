import TerminalShell from "../components/TerminalShell";
import { getNotes, type Note } from "@/lib/notion";
import { FALLBACK_NOTES } from "@/lib/fallback";

export const revalidate = 60;

const KIND_COLORS: Record<string, string> = {
  book: "text-amber-300",
  paper: "text-cyan-300",
  framework: "text-emerald-300",
  quote: "text-pink-300",
  note: "text-neutral-300",
};

function extractTitleOrder(title: string): number | undefined {
  const match = title
    .trim()
    .match(/^(\d{1,3})(?:[\s._\-:\u3001\uFF1A]|$)/);

  if (!match) return undefined;
  return Number.parseInt(match[1], 10);
}

function getNoteOrder(note: Note): number {
  return note.order ?? extractTitleOrder(note.title) ?? Number.POSITIVE_INFINITY;
}

function formatOrder(order: number): string {
  return Number.isFinite(order) ? String(order).padStart(2, "0") : "--";
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const aOrder = getNoteOrder(a);
    const bOrder = getNoteOrder(b);

    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.updated !== b.updated) return (b.updated || "").localeCompare(a.updated || "");

    return a.title.localeCompare(b.title, "zh-CN", {
      numeric: true,
      sensitivity: "base",
    });
  });
}

export default async function NotesPage() {
  let notes = await getNotes();
  const usingFallback = notes.length === 0;
  if (usingFallback) notes = FALLBACK_NOTES;

  notes = sortNotes(notes);

  return (
    <TerminalShell>
      <div className="space-y-5">
        <div className="flex items-baseline justify-between gap-4 text-sm text-neutral-400">
          <div>
            <span className="text-emerald-400">$</span> cat notes/index.log
          </div>
          <div className="text-xs text-neutral-500">
            按编号排序
            {usingFallback ? " · 当前显示示例数据" : ""}
          </div>
        </div>

        <div className="space-y-3">
          {notes.map((note) => {
            const order = getNoteOrder(note);

            return (
              <div
                key={note.id}
                className="group grid grid-cols-[3rem_1fr] gap-3 rounded-sm border border-neutral-800 bg-neutral-950/30 p-3 transition-colors hover:border-neutral-700"
              >
                <div className="flex items-start justify-end pt-1 text-lg font-light tabular-nums text-emerald-300/85">
                  {formatOrder(order)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800/70 pb-2 text-[11px]">
                    <span
                      className={`uppercase tracking-wider ${KIND_COLORS[note.kind] || "text-neutral-300"}`}
                    >
                      {note.kind}
                    </span>

                    <span className="truncate text-neutral-300">
                      {note.title || "Untitled"}
                    </span>

                    {note.author && (
                      <>
                        <span className="text-neutral-700">·</span>
                        <span className="truncate text-neutral-500">{note.author}</span>
                      </>
                    )}

                    {note.progress > 0 && (
                      <span className="ml-auto tabular-nums text-neutral-500">
                        {note.progress}%
                      </span>
                    )}
                  </div>

                  <div className="pt-3">
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-300">
                      {note.note}
                    </p>

                    {note.progress > 0 && note.progress < 100 && (
                      <div className="mt-2.5 h-[2px] overflow-hidden rounded-sm bg-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400/70 to-cyan-400/70"
                          style={{ width: `${note.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {usingFallback ? (
          <div className="rounded-sm border border-amber-400/30 bg-amber-400/5 p-4 text-[12px] leading-relaxed text-amber-200/80">
            当前没有读到 Notion 的笔记数据，所以先显示示例内容。要固定成 `01`、`02`
            这种顺序，可以在 Notes database 里增加 `Order` 字段，或者直接把标题写成
            `01 xxx`、`02 xxx`。
          </div>
        ) : (
          <p className="text-[12px] text-neutral-500">
            <span className="text-emerald-400">$</span> 所有笔记按编号优先，其次再按更新时间排序。
          </p>
        )}
      </div>
    </TerminalShell>
  );
}
