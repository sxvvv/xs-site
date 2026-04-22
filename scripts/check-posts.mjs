/* scripts/check-posts.mjs
   列出 Blog DB 里所有 page 的 title + status + date,
   用来诊断为什么线上没显示。
*/
import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB = process.env.NOTION_BLOG_DATABASE_ID;
if (!DB) { console.error("no NOTION_BLOG_DATABASE_ID"); process.exit(1); }

const res = await notion.databases.query({ database_id: DB, page_size: 100 });
console.log(`total pages: ${res.results.length}\n`);

const prop = (p, name) => {
  const k = Object.keys(p).find(x => x.toLowerCase() === name.toLowerCase());
  return k ? p[k] : null;
};
const plain = (rt) => (rt || []).map(t => t.plain_text).join("");

let published = 0;
for (const pg of res.results) {
  const props = pg.properties;
  const title = plain(prop(props, "Name")?.title) || "(untitled)";
  const statusProp = prop(props, "Status");
  const status = statusProp?.select?.name ?? statusProp?.status?.name ?? "(none)";
  const date = prop(props, "Date")?.date?.start ?? "(none)";
  const marker = status === "Published" ? "✓" : "·";
  if (status === "Published") published++;
  console.log(`${marker} [${status.padEnd(12)}] ${date.padEnd(10)} ${title}`);
}
console.log(`\npublished pages: ${published} / ${res.results.length}`);
console.log(published === 0
  ? "\n→ 这就是为什么线上看到的是 fallback: 一篇 Published 都没有。\n  要么 Status 选项名打错了(大小写/空格敏感),要么还没改 Status。"
  : "\n→ Published 有了。如果线上还没显示,很可能是 Vercel 环境变量或部署的问题。");
