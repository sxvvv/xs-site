/* bypass @notionhq/client, use raw fetch with a common UA and tiny chunks */
import { readFileSync } from "node:fs";
import { markdownToBlocks } from "@tryfabric/martian";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
const TOKEN = process.env.NOTION_TOKEN;
const EXISTING_PAGE = "3495cca0-ebd4-816a-aaaa-e19b1983acc6"; // the empty 06 we created earlier
const FILE = "drafts/os-notes/processed/06-filesystem.md";
const CHUNK = 5;

const raw = readFileSync(FILE, "utf8");
const { content } = matter(raw);
const blocks = markdownToBlocks(content);
console.log(`${blocks.length} blocks; starting at index 30 (first 30 already appended)`);

async function appendChunk(blockId, children) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json",
    },
    body: JSON.stringify({ children }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

for (let i = 30; i < blocks.length; i += CHUNK) {
  const chunk = blocks.slice(i, i + CHUNK);
  let attempt = 0;
  while (true) {
    try {
      await appendChunk(EXISTING_PAGE, chunk);
      console.log(`  appended ${i + chunk.length}/${blocks.length}`);
      break;
    } catch (e) {
      attempt++;
      if (attempt >= 4) { console.error(`  chunk ${i}-${i+chunk.length} FAILED:`, e.message); throw e; }
      const wait = 3000 * attempt;
      console.log(`  chunk ${i}-${i+chunk.length} attempt ${attempt} failed, wait ${wait}ms`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  await new Promise(r => setTimeout(r, 2000));
}
console.log("done");
