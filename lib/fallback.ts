/*  lib/fallback.ts
    当 NOTION_TOKEN 没配置 / 还没建 database 时,用这些假数据先跑起来。
    让你第一次 npm run dev 就能看到效果,不用被 API 细节卡住。 */

import type { Post, Note } from "./notion";

export const FALLBACK_POSTS: Post[] = [
  {
    id: "f1",
    slug: "hello-world",
    title: "Hello, world —— 这个网站怎么来的",
    date: "2026-04-20",
    tags: ["meta", "site"],
    excerpt:
      "为什么又建了一个个人站,以及我想用它记录什么。(编辑 Notion 里的 blog database,这里会自动换成你的真文章)",
    readTime: "3 min",
  },
  {
    id: "f2",
    slug: "reading-list",
    title: "2026 年的阅读清单 —— 系统、AI、一点点哲学",
    date: "2026-04-10",
    tags: ["reading", "learning"],
    excerpt: "今年打算认真读完的 10 本书,以及为什么选它们。",
    readTime: "6 min",
  },
];

export const FALLBACK_NOTES: Note[] = [
  {
    id: "f1",
    title: "Designing Data-Intensive Applications",
    kind: "book",
    author: "Martin Kleppmann",
    progress: 72,
    note: "第 7 章之前可以每周啃一章。事务隔离级别那一节值得反复看。",
  },
  {
    id: "f2",
    title: "",
    kind: "quote",
    author: "Richard Feynman",
    progress: 0,
    note: '"What I cannot create, I do not understand." —— 贴在我的台灯上。',
  },
];
