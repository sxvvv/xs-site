/*  app/api/revalidate/route.ts
    ──────────────────────────────────────────────────────────
    按需触发 Next.js ISR 重新验证。用于 Notion 更新后立即刷新线上内容,
    不用等 60 秒的定时刷新,也不用手动 redeploy。

    用法 (POST 优先):
      POST /api/revalidate
        Header: x-revalidate-secret: <REVALIDATE_SECRET>
        Body (可选): {"target":"blog"|"notes"|"all"}   // 默认 all

    也支持 GET (方便浏览器/curl 手动触发):
      GET /api/revalidate?secret=<REVALIDATE_SECRET>&target=all

    环境变量: REVALIDATE_SECRET 必须在 Vercel 里设置。
    ────────────────────────────────────────────────────────── */

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

type Target = "blog" | "notes" | "all";

function isAuthorized(provided: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;
  return !!provided && provided === expected;
}

function run(target: Target) {
  const revalidated: string[] = [];
  if (target === "blog" || target === "all") {
    // "layout" 模式会连带刷所有 /blog/[slug] 动态子路由
    revalidatePath("/blog", "layout");
    revalidated.push("/blog", "/blog/[slug]");
  }
  if (target === "notes" || target === "all") {
    revalidatePath("/notes");
    revalidated.push("/notes");
  }
  return revalidated;
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!isAuthorized(secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let target: Target = "all";
  try {
    const body = await req.json();
    if (body?.target === "blog" || body?.target === "notes") target = body.target;
  } catch {
    // 空 body 也 OK,走默认 all
  }

  const revalidated = run(target);
  return NextResponse.json({ ok: true, target, revalidated, now: Date.now() });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  if (!isAuthorized(secret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const raw = url.searchParams.get("target");
  const target: Target = raw === "blog" || raw === "notes" ? raw : "all";
  const revalidated = run(target);
  return NextResponse.json({ ok: true, target, revalidated, now: Date.now() });
}
