/* Insert lead figure into each os-notes post (01-09) on Notion.
   Image lives in public/blog-assets/, served via Vercel.
   Inserts as the SECOND block (right after the intro paragraph).
*/
import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const DB = process.env.NOTION_BLOG_DATABASE_ID;
const BASE = "https://xs-site-phi.vercel.app/blog-assets";

// title prefix -> image filename + caption
const MAP = {
  "01": { file: "01-pin-memory-path.png", caption: "Pinned memory → DMA → GPU 路径" },
  "02": { file: "02-cgroup-tree.png", caption: "cgroup v2 层级与训练容器" },
  "03": { file: "03-dataloader-path.png", caption: "DataLoader 数据路径全景" },
  "04": { file: "04-allreduce-ring.png", caption: "Ring AllReduce 拓扑" },
  "05": { file: "05-syscall-transition.png", caption: "用户态 ↔ 内核态切换" },
  "06": { file: "06-inode-tree.png", caption: "inode 与文件系统结构" },
  "07": { file: "07-rcu-timeline.png", caption: "RCU 读写时序" },
  "08": { file: "08-shared-memory.png", caption: "torch.multiprocessing 共享内存" },
  "09": { file: "09-os-roi-quadrant.png", caption: "OS 知识点 ROI 象限" },
};

function imageBlock(file, caption) {
  return {
    object: "block",
    type: "image",
    image: {
      type: "external",
      external: { url: `${BASE}/${file}` },
      caption: [{ type: "text", text: { content: caption } }],
    },
  };
}

// query DB, return [{id, title}]
async function listPages() {
  const out = [];
  let cursor;
  do {
    const r = await notion.databases.query({ database_id: DB, start_cursor: cursor, page_size: 100 });
    for (const p of r.results) {
      const props = p.properties || {};
      const nameKey = Object.keys(props).find(k => k.toLowerCase() === "name");
      const t = nameKey ? props[nameKey]?.title?.map(x => x.plain_text).join("") : "";
      out.push({ id: p.id, title: t });
    }
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

// has page already got an image block at top?
async function hasImage(pageId) {
  const r = await notion.blocks.children.list({ block_id: pageId, page_size: 5 });
  return r.results.some(b => b.type === "image");
}

async function firstBlockId(pageId) {
  const r = await notion.blocks.children.list({ block_id: pageId, page_size: 1 });
  return r.results[0]?.id;
}

const pages = await listPages();
console.log(`DB has ${pages.length} pages`);

for (const [prefix, { file, caption }] of Object.entries(MAP)) {
  const page = pages.find(p => p.title.startsWith(`${prefix} ·`) || p.title.startsWith(`${prefix}·`));
  if (!page) { console.log(`  ${prefix}: NO MATCHING PAGE`); continue; }
  if (await hasImage(page.id)) { console.log(`  ${prefix}: skip (already has image) — ${page.title.slice(0,40)}`); continue; }
  const after = await firstBlockId(page.id);
  if (!after) { console.log(`  ${prefix}: empty page, skip`); continue; }
  try {
    await notion.blocks.children.append({
      block_id: page.id,
      children: [imageBlock(file, caption)],
      after,
    });
    console.log(`  ${prefix}: ✓ inserted ${file}`);
  } catch (e) {
    console.error(`  ${prefix}: FAIL ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 800));
}
console.log("done");
