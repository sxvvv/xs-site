import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import TerminalShell from "../../components/TerminalShell";
import { getPostBySlug, getPosts } from "@/lib/notion";
import { FALLBACK_POSTS } from "@/lib/fallback";

export const revalidate = 60;

// 预生成所有文章路径 (build time)
export async function generateStaticParams() {
  const posts = await getPosts();
  const list = posts.length ? posts : FALLBACK_POSTS;
  return list.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // fallback 预览内容 (当 Notion 没配好时)
  if (!post) {
    const fb = FALLBACK_POSTS.find((p) => p.slug === slug);
    if (!fb) notFound();

    return (
      <TerminalShell>
        <BackLink />
        <article className="prose-terminal">
          <Header post={fb} />
          <div className="p-4 border border-amber-400/30 bg-amber-400/5 rounded-sm text-[13px] text-amber-200/80 leading-relaxed">
            这是一篇示例文章占位。当你在 Notion 里创建同名文章并把 Status 设为 Published 后,
            这里会自动显示真实内容。
          </div>
          <p>
            <code>lib/notion.ts</code> 会把 Notion 页面的块(段落、标题、代码块、图片、列表、引用、表格)
            统一转成 Markdown,再由 <code>react-markdown</code> 渲染 —— 所以你在 Notion 里怎么写,
            这里就怎么显示。支持 GFM(表格、任务列表、删除线)和代码高亮。
          </p>
        </article>
      </TerminalShell>
    );
  }

  return (
    <TerminalShell>
      <BackLink />
      <article className="prose-terminal max-w-3xl">
        <Header post={post} />
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {post.markdown || "_(这篇文章还是空的。去 Notion 里写点东西吧 ↗)_"}
        </ReactMarkdown>
      </article>

      <div className="mt-16 pt-8 border-t border-neutral-800 text-[12px] text-neutral-500 flex items-center justify-between">
        <Link href="/blog" className="hover:text-emerald-300 transition-colors">
          ← 回到文章列表
        </Link>
        <span>$ EOF</span>
      </div>
    </TerminalShell>
  );
}

function BackLink() {
  return (
    <Link
      href="/blog"
      className="inline-flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-emerald-300 mb-6 transition-colors"
    >
      <ArrowLeft className="w-3 h-3" /> cd ../blog
    </Link>
  );
}

function Header({ post }: { post: { title: string; date: string; readTime: string; tags: string[] } }) {
  return (
    <header className="mb-8 pb-6 border-b border-neutral-800/70">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.tags.map((t) => (
          <span
            key={t}
            className="text-[10.5px] text-cyan-300/80 before:content-['#'] before:text-neutral-600 before:mr-0.5"
          >
            {t}
          </span>
        ))}
      </div>
      <h1 className="text-2xl md:text-3xl text-neutral-50 font-light leading-tight tracking-tight">
        {post.title}
      </h1>
      <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-500">
        <span className="flex items-center gap-1 tabular-nums">
          <Calendar className="w-3 h-3" /> {post.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {post.readTime}
        </span>
      </div>
    </header>
  );
}
