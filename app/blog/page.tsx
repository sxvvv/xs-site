import Link from "next/link";
import TerminalShell from "../components/TerminalShell";
import { getPosts, type Post } from "@/lib/notion";
import { FALLBACK_POSTS } from "@/lib/fallback";
import { TAG_CATEGORIES, CATEGORY_ORDER } from "@/lib/config";

export const revalidate = 60;

const UNCATEGORIZED = "其他";

function extractTitleOrder(title: string): number | undefined {
  const match = title
    .trim()
    .match(/^(\d{1,3})(?:[\s._\-:\u3001\uFF1A]|$)/);

  if (!match) return undefined;
  return Number.parseInt(match[1], 10);
}

function getPostOrder(post: Post): number {
  return post.order ?? extractTitleOrder(post.title) ?? Number.POSITIVE_INFINITY;
}

function formatOrder(order: number): string {
  return Number.isFinite(order) ? String(order).padStart(2, "0") : "--";
}

function deriveCategory(post: Post): string {
  if (post.category?.trim()) return post.category.trim();
  if (post.series?.trim()) return post.series.trim();

  for (const tag of post.tags) {
    if (TAG_CATEGORIES[tag]) return TAG_CATEGORIES[tag];
  }

  return UNCATEGORIZED;
}

function comparePosts(a: Post, b: Post): number {
  const aOrder = getPostOrder(a);
  const bOrder = getPostOrder(b);

  if (aOrder !== bOrder) return aOrder - bOrder;
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;

  return a.title.localeCompare(b.title, "zh-CN", {
    numeric: true,
    sensitivity: "base",
  });
}

function toCategoryId(category: string): string {
  const slug = category
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");

  return `category-${slug || "misc"}`;
}

export default async function BlogPage() {
  let posts = await getPosts();
  const usingFallback = posts.length === 0;
  if (usingFallback) posts = FALLBACK_POSTS;

  const grouped: Record<string, Post[]> = {};

  for (const post of posts) {
    const category = deriveCategory(post);
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(post);
  }

  for (const category of Object.keys(grouped)) {
    grouped[category].sort(comparePosts);
  }

  const categories = [
    ...CATEGORY_ORDER.filter((category) => grouped[category]),
    ...Object.keys(grouped)
      .filter((category) => !CATEGORY_ORDER.includes(category) && category !== UNCATEGORIZED)
      .sort((a, b) =>
        a.localeCompare(b, "zh-CN", { numeric: true, sensitivity: "base" }),
      ),
    ...(grouped[UNCATEGORIZED] ? [UNCATEGORIZED] : []),
  ];

  return (
    <TerminalShell>
      <div className="space-y-8">
        <div className="flex items-baseline justify-between gap-4 text-sm">
          <div className="text-neutral-400">
            <span className="text-emerald-400">$</span> ls -la blog/
          </div>
          <div className="text-neutral-500 text-xs">
            {posts.length} entries
            {usingFallback ? " · 当前显示示例数据" : ""}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <a
                key={category}
                href={`#${toCategoryId(category)}`}
                className="inline-flex items-center gap-2 rounded-sm border border-neutral-800 bg-neutral-950/40 px-3 py-1.5 text-[11px] text-neutral-300 transition-colors hover:border-emerald-400/50 hover:text-emerald-200"
              >
                <span>{category}</span>
                <span className="tabular-nums text-neutral-500">
                  {String(grouped[category].length).padStart(2, "0")}
                </span>
              </a>
            ))}
          </div>
        )}

        {categories.map((category) => (
          <section key={category} id={toCategoryId(category)} className="scroll-mt-24">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-300/75">
                {category}
              </span>
              <span className="text-xs text-neutral-600">
                {String(grouped[category].length).padStart(2, "0")} posts
              </span>
              <span className="h-px flex-1 bg-neutral-800/80" />
            </div>

            <div className="divide-y divide-neutral-800/70 border-y border-neutral-800/70">
              {grouped[category].map((post) => {
                const order = getPostOrder(post);

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group grid grid-cols-[3rem_1fr_auto] gap-4 px-1 py-4 transition-colors hover:bg-emerald-400/[0.03]"
                  >
                    <div className="pt-0.5 text-right text-sm font-light tabular-nums text-emerald-300/85">
                      {formatOrder(order)}
                    </div>

                    <div className="min-w-0">
                      <div className="text-neutral-100 transition-colors group-hover:text-emerald-200">
                        {post.title}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-500">
                        <span className="tabular-nums">{post.date}</span>
                        {post.tags.length > 0 && (
                          <span className="text-neutral-700">·</span>
                        )}
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-cyan-300/80 before:mr-0.5 before:text-neutral-600 before:content-['#']"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {post.excerpt && (
                        <div className="mt-2 max-w-2xl text-[13px] leading-relaxed text-neutral-400">
                          {post.excerpt}
                        </div>
                      )}
                    </div>

                    <div className="whitespace-nowrap pt-0.5 text-xs tabular-nums text-neutral-500">
                      {post.readTime}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        {usingFallback && (
          <div className="rounded-sm border border-amber-400/30 bg-amber-400/5 p-4 text-[12px] leading-relaxed text-amber-200/80">
            <div className="mb-1 font-medium text-amber-300">提示</div>
            当前没有读到 Notion 的博客数据，所以先显示示例内容。要让分类和编号使用真实数据，
            可以在 Blog database 里增加 `Category` / `Series` 和 `Order` 字段，
            或者直接把标题写成 `01 xxx`、`02 xxx` 这样的格式。
          </div>
        )}
      </div>
    </TerminalShell>
  );
}
