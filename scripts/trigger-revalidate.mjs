/* scripts/trigger-revalidate.mjs
   手动触发线上站点重新抓取 Notion 内容。
   用法:
     node scripts/trigger-revalidate.mjs                # 刷新全部
     node scripts/trigger-revalidate.mjs blog           # 只刷 blog
     node scripts/trigger-revalidate.mjs notes          # 只刷 notes
   读取 .env.local 里的 REVALIDATE_SECRET 和 SITE_URL。
*/
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SECRET = process.env.REVALIDATE_SECRET;
const SITE = process.env.SITE_URL || "https://xs-site-phi.vercel.app";
const target = process.argv[2] || "all";

if (!SECRET) {
  console.error("missing REVALIDATE_SECRET in .env.local");
  process.exit(1);
}
if (!["all", "blog", "notes"].includes(target)) {
  console.error(`unknown target '${target}'. use: all | blog | notes`);
  process.exit(1);
}

const url = `${SITE}/api/revalidate`;
const res = await fetch(url, {
  method: "POST",
  headers: {
    "x-revalidate-secret": SECRET,
    "content-type": "application/json",
  },
  body: JSON.stringify({ target }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}:`, text);
  process.exit(1);
}
console.log(text);
