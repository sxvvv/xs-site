import { Client } from "@notionhq/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function probe(label, id) {
  try {
    const db = await notion.databases.retrieve({ database_id: id });
    const title = (db.title || []).map(t => t.plain_text).join("");
    const props = Object.entries(db.properties || {}).map(([k, v]) => `${k}(${v.type})`);
    console.log(`\n${label} [${id}]`);
    console.log(`  title: ${title}`);
    console.log(`  props: ${props.join(", ")}`);
  } catch (e) {
    console.log(`\n${label} [${id}] ERROR: ${e.message}`);
  }
}

await probe("NOTION_BLOG_DATABASE_ID", process.env.NOTION_BLOG_DATABASE_ID);
await probe("NOTION_NOTES_DATABASE_ID", process.env.NOTION_NOTES_DATABASE_ID);
