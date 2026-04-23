/*  lib/fallback.ts
    Fallback content used when Notion is not configured yet. */

import type { Post, Note } from "./notion";

export const FALLBACK_POSTS: Post[] = [
  {
    id: "f1",
    slug: "hello-world",
    title: "01 网站为什么重新做",
    date: "2026-04-20",
    tags: ["meta", "site"],
    excerpt: "记录这个站点的设计方向、内容组织方式，以及为什么把博客和笔记重新整理成分类结构。",
    readTime: "3 min",
    category: "站点",
    order: 1,
  },
  {
    id: "f2",
    slug: "notion-workflow",
    title: "02 Notion 到博客的内容流",
    date: "2026-04-18",
    tags: ["meta", "workflow"],
    excerpt: "梳理从 Notion 数据库到前端页面的同步方式，避免每次改内容都重新部署。",
    readTime: "5 min",
    category: "站点",
    order: 2,
  },
  {
    id: "f3",
    slug: "reading-list",
    title: "01 今年的系统阅读清单",
    date: "2026-04-10",
    tags: ["reading", "learning"],
    excerpt: "把操作系统、网络和 AI infra 的阅读路线按主题整理，方便长期推进。",
    readTime: "6 min",
    category: "阅读",
    order: 1,
  },
];

export const FALLBACK_NOTES: Note[] = [
  {
    id: "n1",
    title: "01 Designing Data-Intensive Applications",
    kind: "book",
    author: "Martin Kleppmann",
    progress: 72,
    note: "重点回看复制、事务隔离和流处理这几章，后面可以继续拆成专题笔记。",
    order: 1,
    updated: "2026-04-20",
  },
  {
    id: "n2",
    title: "02 CUDA 编程模型速记",
    kind: "framework",
    author: "NVIDIA",
    progress: 35,
    note: "先把 grid、block、warp 之间的关系记熟，再往共享内存和 occupancy 深挖。",
    order: 2,
    updated: "2026-04-18",
  },
  {
    id: "n3",
    title: "03 What I cannot create",
    kind: "quote",
    author: "Richard Feynman",
    progress: 0,
    note: "\"What I cannot create, I do not understand.\" 这句很适合作为做系统学习时的提醒。",
    order: 3,
    updated: "2026-04-16",
  },
];
