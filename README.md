# nico-site

Personal site with a terminal/IDE aesthetic. Content lives in Notion, site is built with Next.js 15, deployed on Vercel.

**Live demo:** https://xs-site-phi.vercel.app

---

## Features

- Terminal-style UI (JetBrains Mono, dark theme, sidebar, `⌘K` command palette)
- Notion-backed content for blog posts and reading notes
- Static generation with 60-second ISR
- Markdown rendering with code highlighting
- Zero config for the about / projects pages — everything lives in `lib/config.ts`

## Pages

| Route            | Content         | Source             |
| ---------------- | --------------- | ------------------ |
| `/`              | About           | `lib/config.ts`    |
| `/projects`      | Projects        | `lib/config.ts`    |
| `/blog`          | Blog list       | Notion (Blog DB)   |
| `/blog/[slug]`   | Blog post       | Notion (Blog DB)   |
| `/notes`         | Reading notes   | Notion (Notes DB)  |

## Stack

Next.js 15 (App Router) · React 18 · Tailwind CSS 3 · `@notionhq/client` + `notion-to-md` · `react-markdown` + `rehype-highlight` · `lucide-react`

Deployed on Vercel Hobby (free).

---

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Without a Notion token the site falls back to sample data from `lib/fallback.ts`, so every page renders on first run. To wire up your own content, follow the steps below.

## Notion setup

### 1. Create an integration

Go to <https://www.notion.so/profile/integrations>, create an **Internal** integration, and copy the **Internal Integration Secret** (`ntn_...` or `secret_...`). This is your `NOTION_TOKEN`.

### 2. Create the Blog database

Create a full-page database named `Blog` with these properties:

| Property | Type         | Notes                         |
| -------- | ------------ | ----------------------------- |
| Name     | Title        | Post title                    |
| Date     | Date         | Published date                |
| Tags     | Multi-select | —                             |
| Status   | Select       | `Published` / `Draft`         |
| Excerpt  | Text         | Optional                      |
| ReadTime | Text         | Optional, e.g. `8 min`        |

Open the database, click `···` → **Connections** → select your integration. The integration cannot read the database unless it is explicitly connected.

The database ID is the 32-character segment in the URL:

```
https://notion.so/<workspace>/<DATABASE_ID>?v=...
```

### 3. Create the Notes database

Create a second database named `Notes`:

| Property | Type         | Notes                                      |
| -------- | ------------ | ------------------------------------------ |
| Name     | Title        | Book or paper title                        |
| Kind     | Select       | `book` / `paper` / `framework` / `quote`   |
| Author   | Text         | —                                          |
| Progress | Number       | 0–100                                      |
| Note     | Text         | Your notes                                 |
| Updated  | Date         | Used for sorting                           |

Connect the integration to this database as well.

### 4. Environment variables

```bash
cp .env.local.example .env.local
```

```env
NOTION_TOKEN=ntn_xxxxxxxxxxxx
NOTION_BLOG_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_NOTES_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Restart the dev server. Drafts are filtered out — only rows with `Status = Published` appear on the site.

## Deployment

1. Push the repository to GitHub.
2. Import the repo at <https://vercel.com>.
3. Add `NOTION_TOKEN`, `NOTION_BLOG_DATABASE_ID`, and `NOTION_NOTES_DATABASE_ID` under **Environment Variables**.
4. Deploy.

To bind a custom domain, go to **Project Settings → Domains** and follow the CNAME instructions.

Content refreshes automatically every 60 seconds (`export const revalidate = 60`). For immediate updates, trigger a redeploy from the Vercel dashboard.

---

## Customization

### Profile and projects

Edit `lib/config.ts`. Everything on `/` and `/projects` is pulled from this file — no Notion dependency.

### Colors

The terminal palette is spread across components. Search and replace:

| Role               | Tailwind token          |
| ------------------ | ----------------------- |
| Primary / commands | `emerald-300/400`       |
| Secondary / links  | `cyan-300`              |
| Strings / books    | `amber-300`             |
| Quotes             | `pink-300`              |

### Font

First line of `app/globals.css`. Defaults to JetBrains Mono.

### Adding a page

Example — a `/uses` page for tools and hardware:

1. Create `app/uses/page.tsx` (model it on `app/projects/page.tsx`).
2. Add an entry to the `NAV` array in `app/components/TerminalShell.tsx`:

   ```ts
   { id: "uses", label: "uses.md", icon: Wrench, hint: "env", href: "/uses" }
   ```

## Project structure

```
.
├── app/
│   ├── blog/
│   │   ├── [slug]/page.tsx       # Post detail
│   │   └── page.tsx              # Post list
│   ├── notes/page.tsx
│   ├── projects/page.tsx
│   ├── components/
│   │   ├── TerminalShell.tsx     # Layout shell
│   │   └── CommandPalette.tsx    # ⌘K
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # About
├── lib/
│   ├── config.ts                 # Profile, projects, socials
│   ├── notion.ts                 # Notion client wrapper
│   └── fallback.ts               # Sample data
├── .env.local.example
├── next.config.js
└── tailwind.config.js
```

## FAQ

**Content is missing after deploy.**
Verify the three environment variables are set on Vercel, that both databases are connected to the integration, and that posts have `Status = Published` (case-sensitive).

**Notion updates don't appear.**
ISR revalidates every 60 seconds. For instant updates, redeploy from the Vercel dashboard.

**Can I reuse an existing Notion database?**
Yes. Adjust the property names passed to `getProp(props, "...")` in `lib/notion.ts`. The helper is case-insensitive.

**Images from Notion break over time.**
Notion serves images from signed, short-lived URLs. Either download them to `/public` at build time or host them externally (S3, Cloudflare R2, etc.) and reference the external URL from Notion.

**How do I add comments?**
Drop a Giscus component (GitHub Discussions-backed, free) at the bottom of `app/blog/[slug]/page.tsx`.

## License

MIT
