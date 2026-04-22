/* one-shot: 创建 06 (空 body), 然后小批量追加 blocks */
import { readFileSync } from "node:fs";
import { Client } from "@notionhq/client";
import { markdownToBlocks } from "@tryfabric/martian";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB = process.env.NOTION_BLOG_DATABASE_ID;
const FILE = "drafts/os-notes/processed/06-filesystem.md";
const today = new Date().toISOString().slice(0, 10);
const CHUNK = 30;

const raw = readFileSync(FILE, "utf8");
const { data: fm, content } = matter(raw);
const blocks = markdownToBlocks(content);

const dbMeta = await notion.databases.retrieve({ database_id: DB });
const schema = dbMeta.properties || {};
const pk = (n) => Object.keys(schema).find(k => k.toLowerCase() === n.toLowerCase());

const properties = {};
properties[pk("Name")] = { title: [{ text: { content: fm.title } }] };
if (pk("Date")) properties[pk("Date")] = { date: { start: today } };
if (pk("Tags")) properties[pk("Tags")] = { multi_select: (fm.tags || []).map(name => ({ name })) };
if (pk("Excerpt")) properties[pk("Excerpt")] = { rich_text: [{ text: { content: (fm.summary || "").slice(0, 1900) } }] };
if (pk("ReadTime")) properties[pk("ReadTime")] = { rich_text: [{ text: { content: "14 min" } }] };

console.log(`creating empty page (${blocks.length} blocks to append in chunks of ${CHUNK})`);
const page = await notion.pages.create({ parent: { database_id: DB }, properties, children: [] });
console.log(`page created: ${page.id}`);

for (let i = 0; i < blocks.length; i += CHUNK) {
  const chunk = blocks.slice(i, i + CHUNK);
  let attempt = 0;
  while (true) {
    try {
      await notion.blocks.children.append({ block_id: page.id, children: chunk });
      console.log(`  appended ${i + chunk.length}/${blocks.length}`);
      break;
    } catch (e) {
      attempt++;
      if (attempt >= 3) throw e;
      const wait = 5000 * attempt;
      console.log(`  chunk ${i}-${i+chunk.length} failed (attempt ${attempt}), wait ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  await new Promise(r => setTimeout(r, 1500));
}
console.log("done");
