/*  lib/notion.ts
    ──────────────────────────────────────────────────────────
    Notion 数据拉取层。所有和 Notion API 打交道的事都在这里。
    页面组件只管消费,不需要知道字段名细节。
    ────────────────────────────────────────────────────────── */

import { Client } from "@notionhq/client";
// @ts-ignore - notion-to-md 没有官方类型声明
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

/*  ─────────────── 工具函数 ─────────────── */

// 从 Notion property 里安全取值,字段名大小写都容错
function getProp(props: any, name: string): any {
  const key = Object.keys(props).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? props[key] : null;
}

function plainText(richText: any[] | undefined): string {
  if (!richText) return "";
  return richText.map((t: any) => t.plain_text).join("");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-");
}

/*  ─────────────── 类型 ─────────────── */

export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  readTime: string;
}

export interface PostDetail extends Post {
  markdown: string;
}

export interface Note {
  id: string;
  title: string;
  kind: "book" | "paper" | "framework" | "quote" | string;
  author: string;
  progress: number;
  note: string;
}

/*  ─────────────── 博客列表 ─────────────── */

export async function getPosts(): Promise<Post[]> {
  if (!process.env.NOTION_BLOG_DATABASE_ID) return [];

  const dbId = process.env.NOTION_BLOG_DATABASE_ID;

  async function tryQuery(opts: any) {
    return notion.databases.query({ database_id: dbId, ...opts });
  }

  let res: any;
  try {
    res = await tryQuery({
      filter: { property: "Status", select: { equals: "Published" } },
      sorts: [{ property: "Date", direction: "descending" }],
    });
  } catch {
    try {
      res = await tryQuery({
        filter: { property: "Status", select: { equals: "Published" } },
      });
    } catch {
      try {
        res = await tryQuery({});
      } catch (err) {
        console.error("[notion] getPosts failed:", err);
        return [];
      }
    }
  }

  const posts = res.results.map((page: any) => {
    const props = page.properties;
    const title = plainText(getProp(props, "Name")?.title) || "Untitled";
    const date =
      getProp(props, "Date")?.date?.start ??
      page.created_time ??
      new Date().toISOString().slice(0, 10);
    const tags =
      getProp(props, "Tags")?.multi_select?.map((t: any) => t.name) ?? [];
    const excerpt = plainText(getProp(props, "Excerpt")?.rich_text);
    const readTime = plainText(getProp(props, "ReadTime")?.rich_text) || "5 min";
    const explicitSlug = plainText(getProp(props, "Slug")?.rich_text).trim();

    return {
      id: page.id,
      slug: explicitSlug || slugify(title) || page.id.slice(0, 8),
      title,
      date: date.slice(0, 10),
      tags,
      excerpt,
      readTime,
    };
  });

  return posts.sort((a: Post, b: Post) => (a.date < b.date ? 1 : -1));
}

/*  ─────────────── 单篇博客详情 ─────────────── */

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return null;

  try {
    const blocks = await n2m.pageToMarkdown(post.id);
    const md = n2m.toMarkdownString(blocks);
    return { ...post, markdown: md.parent || "" };
  } catch (err) {
    console.error("[notion] getPostBySlug failed:", err);
    return { ...post, markdown: "" };
  }
}

/*  ─────────────── 笔记列表 ─────────────── */

export async function getNotes(): Promise<Note[]> {
  if (!process.env.NOTION_NOTES_DATABASE_ID) return [];

  const dbId = process.env.NOTION_NOTES_DATABASE_ID;

  let res: any;
  try {
    res = await notion.databases.query({
      database_id: dbId,
      sorts: [{ property: "Updated", direction: "descending" }],
    });
  } catch {
    try {
      res = await notion.databases.query({ database_id: dbId });
    } catch (err) {
      console.error("[notion] getNotes failed:", err);
      return [];
    }
  }

  return res.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      title: plainText(getProp(props, "Name")?.title) || "",
      kind: getProp(props, "Kind")?.select?.name ?? "note",
      author: plainText(getProp(props, "Author")?.rich_text),
      progress: getProp(props, "Progress")?.number ?? 0,
      note: plainText(getProp(props, "Note")?.rich_text),
    };
  });
}
