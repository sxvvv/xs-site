# nico-site

个人网站 · 终端/IDE 风格 · Notion 同步博客笔记 · Next.js 15 · Vercel 免费部署

---

## 🎯 这是什么

一个真正可以部署的个人站模板:

- **终端美学** —— JetBrains Mono · 深色界面 · 侧边栏 · 命令面板 (`⌘K`)
- **Notion 作为 CMS** —— 你在 Notion 写,网站自动显示
- **完全免费** —— GitHub 托管代码 · Vercel 托管网站 · Notion API 免费额度很宽松
- **静态生成 + ISR** —— 访问速度跟纯静态网站一样快,但内容每 60 秒自动更新

页面:
- `/` 关于我
- `/blog` 博客列表 (来自 Notion)
- `/blog/[slug]` 文章详情 (Markdown 渲染 + 代码高亮)
- `/projects` 项目展示 (改 `lib/config.ts`)
- `/notes` 读书笔记 (来自 Notion)

---

## 🚀 快速开始 (本地先跑起来)

```bash
# 1. 安装依赖 (需要 Node.js 20+)
npm install

# 2. 先不管 Notion,直接跑 —— 会显示示例数据
npm run dev
```

打开 http://localhost:3000 —— **应该能看到网站了**。

*还在用示例数据? 正常。下一步配 Notion 之后内容就会被替换。*

---

## 📝 第一阶段 · 接入 Notion (15 分钟)

### Step 1 · 创建 Notion Integration (拿 token)

1. 访问 https://www.notion.so/profile/integrations
2. 点击 **"+ New integration"**
3. 填名字 (比如 "我的网站"),Workspace 选你自己的,Type 选 **Internal**
4. 创建后进入设置页,复制 **Internal Integration Secret**(格式 `ntn_xxx` 或 `secret_xxx`)—— 这就是你的 `NOTION_TOKEN`

### Step 2 · 创建 Blog Database

在 Notion 里新建一个 **full page database**(整页的表格),命名 "Blog"。添加这些字段:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| Name | Title | 文章标题 (默认就有) |
| Date | Date | 发布日期 |
| Tags | Multi-select | 标签 |
| Status | Select | 值: `Published` / `Draft` |
| Excerpt | Text | 摘要 (可选) |
| ReadTime | Text | 例如 `8 min` (可选) |

**⚠️ 关键一步:** 打开这个 database 页面,右上角 `···` → `Connections` → 搜索你刚建的 integration → 点 Confirm。

**没连 integration = API 访问不到,这是最常见的坑。**

然后复制 database ID: database 的 URL 形如  
`https://notion.so/your-workspace/a1b2c3d4e5f6...?v=xxxx`  
问号前那串 32 位字母数字就是 `NOTION_BLOG_DATABASE_ID`。

### Step 3 · 创建 Notes Database

同样方式新建 "Notes" database,字段:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| Name | Title | 书名/论文名 |
| Kind | Select | 值: `book` / `paper` / `framework` / `quote` |
| Author | Text | 作者 |
| Progress | Number | 进度 0-100 |
| Note | Text | 你的笔记 |
| Updated | Date | 更新时间 (排序用) |

同样记得 **Connect integration**,复制 database ID 作为 `NOTION_NOTES_DATABASE_ID`。

### Step 4 · 本地配环境变量

```bash
cp .env.local.example .env.local
```

打开 `.env.local`,填上三个值:

```bash
NOTION_TOKEN=ntn_你的token
NOTION_BLOG_DATABASE_ID=32位blog_db_id
NOTION_NOTES_DATABASE_ID=32位notes_db_id
```

### Step 5 · 写第一篇文章

回到 Notion 的 Blog database:
1. 新建一行 (一篇文章)
2. 填 Name、Date、Tags、Excerpt
3. **Status 设为 Published**
4. 点进去,在页面正文区域正常写 (标题、代码块、引用、图片都支持)

### Step 6 · 重启 dev server

```bash
# Ctrl+C 停止,再启动
npm run dev
```

刷新页面 —— 你应该能看到自己的文章了 🎉

---

## 🌐 第二阶段 · 部署到 Vercel (10 分钟)

### Step 1 · 推到 GitHub

```bash
git init
git add .
git commit -m "initial"
# 在 github.com 新建一个空仓库,然后:
git remote add origin git@github.com:你的用户名/nico-site.git
git branch -M main
git push -u origin main
```

### Step 2 · 部署

1. 访问 https://vercel.com,用 GitHub 账号登录
2. 点 **"Add New..."** → **"Project"**
3. 选你刚推的 `nico-site` 仓库,点 Import
4. **在 "Environment Variables" 区域,把 `.env.local` 里的三个值加进去**  
   (这一步不能漏 —— 否则线上版拉不到 Notion 数据)
5. 点 Deploy

大约 90 秒后,你会得到一个地址 `https://nico-site-xxx.vercel.app` —— **这就是你的网站**,任何人都能访问。

### Step 3 · (可选) 绑定自定义域名

如果你买了域名 (比如在 Cloudflare / Namecheap / 阿里云):
1. Vercel Project Settings → Domains → Add
2. 填你的域名,按提示在域名服务商处加 CNAME 记录
3. 几分钟后 HTTPS 自动就绪

---

## 🔄 日常使用流程

写一篇新文章的完整流程:

```
1. 在 Notion Blog database 新建一行
2. 写内容 · Status 设为 Published
3. 回到 Vercel Dashboard → Deployments → Redeploy
4. 30 秒后,新文章出现在你的网站上
```

**或者更自动化的做法:** 因为我们代码里设了 `export const revalidate = 60`,
Vercel 会每 60 秒自动重新拉 Notion 数据。你写完文章不用做任何事,1 分钟内自动上线。

---

## 🎨 定制

### 改个人信息

所有"关于我"的数据在 `lib/config.ts` —— 名字、bio、项目列表、社交链接全在这一个文件里,没有任何 Notion 依赖。

### 改颜色 / 字体

终端风格的配色散布在各组件里,搜索关键色值修改:
- 主色(命令/强调): `emerald-300` / `emerald-400`
- 副色(标签/链接): `cyan-300`
- 字符串/书: `amber-300`
- 引用: `pink-300`

字体在 `app/globals.css` 第一行改(当前是 JetBrains Mono)。

### 加新页面 / 板块

比如想加一个 `/uses` 页面(介绍你用的工具):

```
app/uses/page.tsx  ← 新建这个文件,抄 projects/page.tsx 的结构
```

然后在 `app/components/TerminalShell.tsx` 的 `NAV` 数组里加一项:

```ts
{ id: "uses", label: "uses.md", icon: Wrench, hint: "env", href: "/uses" },
```

---

## 🐛 常见问题

**Q: 部署后看不到 Notion 内容?**
- 检查 Vercel 的 Environment Variables 是否配了三个值
- 检查 Notion Integration 是否 Connect 到了两个 database
- 检查文章的 Status 是不是 `Published` (大小写敏感)

**Q: 我改了 Notion 但网站没更新?**
- 默认 60 秒 revalidate 一次,等一下
- 想立刻看到: Vercel Dashboard → Deployments → 最近一次 → ⋯ → Redeploy

**Q: 想用自己已经存在的 Notion 笔记,不想重建 database?**
- 可以,把 `lib/notion.ts` 里 `getProp(props, "XXX")` 的字段名改成你 database 的字段名即可
- 这个文件已经做了大小写容错

**Q: 可以支持评论吗?**
- 最简单: 文章底部加 Giscus (基于 GitHub Discussions,免费)
- 在 `app/blog/[slug]/page.tsx` 文章底部插入 Giscus 组件即可

**Q: 图片在 Notion 里能显示,但在网站上看不到?**
- Notion 的图片 URL 是临时签名的,会过期。生产方案是 build 时把图片下载到 `/public`
- 或者把图片传到你自己的图床 (S3 / Cloudflare R2 / Imgur),在 Notion 里用外链

---

## 📁 目录结构

```
nico-site/
├── app/
│   ├── blog/
│   │   ├── [slug]/page.tsx   ← 文章详情
│   │   └── page.tsx          ← 文章列表
│   ├── notes/page.tsx        ← 读书笔记
│   ├── projects/page.tsx     ← 项目展示
│   ├── components/
│   │   ├── TerminalShell.tsx ← 终端外壳 (所有页面共用)
│   │   └── CommandPalette.tsx← ⌘K 命令面板
│   ├── globals.css           ← 全局样式 + 代码高亮
│   ├── layout.tsx            ← 根布局
│   └── page.tsx              ← 首页 (About)
├── lib/
│   ├── config.ts             ← 个人信息 (改这个)
│   ├── notion.ts             ← Notion API 封装
│   └── fallback.ts           ← Notion 没配时的示例数据
├── .env.local.example        ← 环境变量模板
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 📦 技术栈

- **Next.js 15** (App Router · 静态生成 · ISR)
- **React 18**
- **Tailwind CSS 3**
- **@notionhq/client** + **notion-to-md** (Notion → Markdown)
- **react-markdown** + **rehype-highlight** (渲染 + 代码高亮)
- **lucide-react** (图标)

托管: Vercel Hobby (免费) · 每月 100GB 带宽,对个人站完全够用。

---

Made with `<code>` and 🌑. MIT license.
