import Link from "next/link";
import TerminalShell from "../components/TerminalShell";
import { getPosts } from "@/lib/notion";
import { FALLBACK_POSTS } from "@/lib/fallback";

export const revalidate = 60;

export default async function BlogPage() {
  let posts = await getPosts();
  const usingFallback = posts.length === 0;
  if (usingFallback) posts = FALLBACK_POSTS;

  return (
    <TerminalShell>
      <div className="space-y-4">
        <div className="flex items-baseline justify-between text-sm">
          <div className="text-neutral-400">
            <span className="text-emerald-400">$</span> ls -la blog/
          </div>
          <div className="text-neutral-500 text-xs">
            {posts.length} entries{usingFallback ? " · (示例数据,配置 Notion 后替换)" : ""}
          </div>
        </div>

        <div className="divide-y divide-neutral-800/70 border-y border-neutral-800/70">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group grid grid-cols-[auto_1fr_auto] gap-4 py-4 px-1 items-baseline hover:bg-emerald-400/[0.03] transition-colors"
            >
              <div className="text-xs text-neutral-500 tabular-nums pt-0.5 font-light">
                {p.date}
              </div>
              <div>
                <div className="text-neutral-100 group-hover:text-emerald-200 transition-colors">
                  <span className="text-emerald-400/80 mr-2">›</span>
                  {p.title}
                </div>
                {p.excerpt && (
                  <div className="text-neutral-400 text-[13px] mt-1.5 leading-relaxed max-w-2xl">
                    {p.excerpt}
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10.5px] text-cyan-300/80 before:content-['#'] before:text-neutral-600 before:mr-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-neutral-500 pt-0.5 tabular-nums whitespace-nowrap">
                {p.readTime}
              </div>
            </Link>
          ))}
        </div>

        {usingFallback && (
          <div className="mt-6 p-4 border border-amber-400/30 bg-amber-400/5 rounded-sm text-[12px] text-amber-200/80 leading-relaxed">
            <div className="text-amber-300 font-medium mb-1">提示</div>
            还没看到 Notion 里的文章? 确认:(1) .env.local 里的 NOTION_TOKEN 和 NOTION_BLOG_DATABASE_ID 都填了
            (2) Notion database 里至少有一篇 Status 为 Published 的文章
            (3) 该 integration 已经被连接(Connections)到 database
          </div>
        )}
      </div>
    </TerminalShell>
  );
}
