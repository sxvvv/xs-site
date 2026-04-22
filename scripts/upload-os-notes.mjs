/* scripts/upload-os-notes.mjs
   批量把 drafts/os-notes/processed/*.md 创建成 Notion 博客库的 Draft page。
   使用 .env.local 里的 NOTION_TOKEN + NOTION_BLOG_DATABASE_ID。
   幂等:遇到同名 page 自动跳过(靠 Name 匹配)。
*/
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const TOKEN = process.env.NOTION_TOKEN;
const DB = process.env.NOTION_BLOG_DATABASE_ID;
if (!TOKEN || !DB) {
  console.error("missing NOTION_TOKEN or NOTION_BLOG_DATABASE_ID in .env.local");
  process.exit(1);
}

const notion = new Client({ auth: TOKEN });
const POSTS_DIR = "drafts/os-notes/processed";

// word-based read time estimate
function estimateReadTime(md) {
  const chinese = (md.match(/[一-龥]/g) || []).length;
  const english = md.replace(/[一-龥]/g, " ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.round(chinese / 400 + english / 220));
  return `${minutes} min`;
}

// fetch existing page titles in the DB to avoid duplicates
async function existingTitles() {
  const titles = new Set();
  let cursor;
  do {
    const res = await notion.databases.query({ database_id: DB, start_cursor: cursor, page_size: 100 });
    for (const p of res.results) {
      const props = p.properties || {};
      const nameKey = Object.keys(props).find(k => k.toLowerCase() === "name");
      const t = nameKey ? props[nameKey]?.title?.map(x => x.plain_text).join("") : "";
      if (t) titles.add(t);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return titles;
}

async function main() {
  // probe DB schema so we only populate existing properties
  const dbMeta = await notion.databases.retrieve({ database_id: DB });
  const schema = dbMeta.properties || {};
  const hasProp = (name) => Object.keys(schema).some(k => k.toLowerCase() === name.toLowerCase());
  const propKey = (name) => Object.keys(schema).find(k => k.toLowerCase() === name.toLowerCase());
  console.log("DB properties:", Object.keys(schema).join(", "));

  const existing = await existingTitles();
  console.log(`DB has ${existing.size} existing pages`);

  const files = readdirSync(POSTS_DIR).filter(f => f.endsWith(".md")).sort();
  const today = new Date().toISOString().slice(0, 10);

  for (const f of files) {
    const raw = readFileSync(join(POSTS_DIR, f), "utf8");
    const { data: fm, content } = matter(raw);
    const title = fm.title || f;
    if (existing.has(title)) {
      console.log(`skip (exists): ${title}`);
      continue;
    }

    const slug = fm.slug || "";
    const tags = fm.tags || [];
    const excerpt = fm.summary || "";
    const readTime = estimateReadTime(content);

    let blocks = [];
    try {
      blocks = markdownToBlocks(content);
    } catch (err) {
      console.error(`md parse failed for ${f}:`, err.message);
      continue;
    }

    // Notion API caps at 100 blocks per append; slice first 100 for create
    const first = blocks.slice(0, 100);
    const rest = blocks.slice(100);

    const properties = {};
    properties[propKey("Name")] = { title: [{ text: { content: title } }] };
    if (hasProp("Status")) {
      const statusProp = schema[propKey("Status")];
      if (statusProp.type === "status") {
        const opts = statusProp.status?.options?.map(o => o.name) || [];
        const name = opts.includes("Draft") ? "Draft" : (opts.includes("Not started") ? "Not started" : null);
        if (name) properties[propKey("Status")] = { status: { name } };
      } else if (statusProp.type === "select") {
        const opts = statusProp.select?.options?.map(o => o.name) || [];
        if (opts.includes("Draft")) {
          properties[propKey("Status")] = { select: { name: "Draft" } };
        } else {
          console.warn(`  (no 'Draft' option in Status select; leaving Status unset — add a Draft option in Notion to classify)`);
        }
      }
    }
    if (hasProp("Date")) properties[propKey("Date")] = { date: { start: today } };
    if (hasProp("Tags")) properties[propKey("Tags")] = { multi_select: tags.map(name => ({ name })) };
    if (hasProp("Excerpt")) properties[propKey("Excerpt")] = { rich_text: [{ text: { content: excerpt.slice(0, 1900) } }] };
    if (hasProp("ReadTime")) properties[propKey("ReadTime")] = { rich_text: [{ text: { content: readTime } }] };
    if (hasProp("Slug")) {
      properties[propKey("Slug")] = { rich_text: [{ text: { content: slug } }] };
    } else {
      console.warn(`  (no Slug column — slug '${slug}' not written; add a Slug text column later and re-run to backfill)`);
    }

    try {
      const page = await notion.pages.create({
        parent: { database_id: DB },
        properties,
        children: first,
      });
      console.log(`created: ${title} (${page.id})`);

      // append remaining blocks in 100-chunks
      for (let i = 0; i < rest.length; i += 100) {
        const chunk = rest.slice(i, i + 100);
        await notion.blocks.children.append({ block_id: page.id, children: chunk });
      }
      // gentle pacing to avoid Notion/Cloudflare rate limits
      await new Promise(r => setTimeout(r, 700));
    } catch (err) {
      console.error(`create failed for ${title}:`, err.body || err.message);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
