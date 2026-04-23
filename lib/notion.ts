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
  series?: string;
  category?: string;
  order?: number;
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
  order?: number;
  updated?: string;
}

function extractLeadingOrder(value: string): number | undefined {
  const match = value
    .trim()
    .match(/^(\d{1,3})(?:[\s._\-:\u3001\uFF1A]|$)/);
  if (!match) return undefined;
  return Number.parseInt(match[1], 10);
}

function readTextValue(prop: any): string {
  if (!prop) return "";
  if (typeof prop.number === "number") return String(prop.number);
  if (prop.select?.name) return prop.select.name;
  if (prop.status?.name) return prop.status.name;
  if (Array.isArray(prop.rich_text)) return plainText(prop.rich_text);
  if (Array.isArray(prop.title)) return plainText(prop.title);
  if (Array.isArray(prop.multi_select) && prop.multi_select.length > 0) {
    return prop.multi_select.map((item: any) => item.name).join(" ");
  }
  return "";
}

function getOrderValue(props: any, fallbackText = ""): number | undefined {
  const candidates = ["Order", "Index", "No", "Number", "序号", "编号"];

  for (const name of candidates) {
    const prop = getProp(props, name);
    if (!prop) continue;

    if (typeof prop.number === "number") return prop.number;

    const parsed = extractLeadingOrder(readTextValue(prop));
    if (typeof parsed === "number") return parsed;
  }

  return extractLeadingOrder(fallbackText);
}

function getCategoryValue(props: any): string | undefined {
  const candidates = ["Category", "Categories", "分类", "类目", "Topic"];

  for (const name of candidates) {
    const value = readTextValue(getProp(props, name)).trim();
    if (value) return value;
  }

  return undefined;
}

/*  ─────────────── 博客列表 ─────────────── */

export async function getPosts(): Promise<Post[]> {
  if (!process.env.NOTION_TOKEN) {
    console.warn("[notion] NOTION_TOKEN is not set — returning empty (site will render fallback).");
    return [];
  }
  if (!process.env.NOTION_BLOG_DATABASE_ID) {
    console.warn("[notion] NOTION_BLOG_DATABASE_ID is not set — returning empty.");
    return [];
  }

  const dbId = process.env.NOTION_BLOG_DATABASE_ID;

  async function tryQuery(opts: any) {
    return notion.databases.query({ database_id: dbId, ...opts });
  }

  // 依次尝试: select 类型过滤 → status 类型过滤 → 不过滤(全部返回后自己挑)
  let res: any;
  try {
    res = await tryQuery({
      filter: { property: "Status", select: { equals: "Published" } },
      sorts: [{ property: "Date", direction: "descending" }],
    });
  } catch (e1: any) {
    try {
      res = await tryQuery({
        filter: { property: "Status", status: { equals: "Published" } },
        sorts: [{ property: "Date", direction: "descending" }],
      });
    } catch (e2: any) {
      try {
        res = await tryQuery({});
      } catch (err: any) {
        console.error("[notion] getPosts failed at all fallbacks:", {
          select_err: e1?.body || e1?.message,
          status_err: e2?.body || e2?.message,
          plain_err: err?.body || err?.message,
          hint: "check: 1) integration has Connections access to the blog DB, 2) DB ID is correct (32 hex chars), 3) token is not expired",
        });
        return [];
      }
    }
  }

  const posts = res.results
    .filter((page: any) => {
      // fallback 路径可能拿到 Drafts,这里按 Status 再过滤一遍(兼容 select/status 两种类型)
      const s = getProp(page.properties, "Status");
      if (!s) return true; // 没 Status 列就全放行
      const name = s.select?.name ?? s.status?.name;
      return !name || name === "Published";
    })
    .map((page: any) => {
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
    const seriesProp = getProp(props, "Series");
    const series = seriesProp?.select?.name || plainText(seriesProp?.rich_text).trim() || undefined;
    const category = getCategoryValue(props);
    const order = getOrderValue(props, title);

    return {
      id: page.id,
      slug: explicitSlug || slugify(title) || page.id.slice(0, 8),
      title,
      date: date.slice(0, 10),
      tags,
      excerpt,
      readTime,
      series,
      category,
      order,
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

  const notes = res.results.map((page: any) => {
    const props = page.properties;
    const title = plainText(getProp(props, "Name")?.title) || "";
    const updated =
      getProp(props, "Updated")?.date?.start ??
      page.last_edited_time ??
      page.created_time ??
      new Date().toISOString();

    return {
      id: page.id,
      title,
      kind: getProp(props, "Kind")?.select?.name ?? "note",
      author: plainText(getProp(props, "Author")?.rich_text),
      progress: getProp(props, "Progress")?.number ?? 0,
      note: plainText(getProp(props, "Note")?.rich_text),
      order: getOrderValue(props, title),
      updated: updated.slice(0, 10),
    };
  });

  return notes.sort((a: Note, b: Note) => {
    const aOrder = a.order ?? Number.POSITIVE_INFINITY;
    const bOrder = b.order ?? Number.POSITIVE_INFINITY;

    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.updated !== b.updated) return a.updated! < b.updated! ? 1 : -1;
    return a.title.localeCompare(b.title, "zh-CN", { numeric: true, sensitivity: "base" });
  });
}
