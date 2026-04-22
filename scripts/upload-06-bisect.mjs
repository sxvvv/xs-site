/* bisect: append one block at a time from index 40, log which index fails */
import { readFileSync } from "node:fs";
import { markdownToBlocks } from "@tryfabric/martian";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const TOKEN = process.env.NOTION_TOKEN;
const PAGE = "3495cca0-ebd4-816a-aaaa-e19b1983acc6";
const FILE = "drafts/os-notes/processed/06-filesystem.md";
const START = 40;

const raw = readFileSync(FILE, "utf8");
const { content } = matter(raw);
const blocks = markdownToBlocks(content);
console.log(`total blocks: ${blocks.length}, starting at ${START}`);

async function appendOne(child, idx) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${PAGE}/children`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
    body: JSON.stringify({ children: [child] }),
  });
  if (!res.ok) {
    const text = await res.text();
    const snippet = JSON.stringify(child).slice(0, 300);
    console.error(`FAIL @${idx} HTTP ${res.status}`);
    console.error(`  block: ${snippet}`);
    return false;
  }
  return true;
}

const failures = [];
for (let i = START; i < blocks.length; i++) {
  let attempt = 0;
  let ok = false;
  while (attempt < 3) {
    ok = await appendOne(blocks[i], i);
    if (ok) break;
    attempt++;
    await new Promise(r => setTimeout(r, 3000 * attempt));
  }
  if (!ok) {
    failures.push(i);
    console.log(`  SKIPPED ${i} after 3 attempts`);
  } else {
    console.log(`  ok ${i}`);
  }
  await new Promise(r => setTimeout(r, 1200));
}

console.log(`\ndone. failures: ${failures.join(",") || "none"}`);
