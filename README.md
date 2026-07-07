<div align="center">

# WhereToNext 🌍✈️

> An explorer's ledger — a curated, tier-ranked travel guide with an interactive 3D globe.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

</div>

**WhereToNext** is a curated travel discovery site built around a vintage-atlas / field-journal aesthetic. Destination write-ups are sourced from travel blogs, rewritten and restructured into a clean Markdown data layer, enriched with real practical travel data, and ranked S→E on a transparent, weighted scoring rubric. No backend or database — everything is static content, rendered at build time.

---

## ✨ Features

- **🌐 Interactive 3D globe homepage** — countries with destinations are highlighted and show a count at rest; zoom in to reveal individual destination pins at their real coordinates.
- **📍 Curated destination guides** — each destination has a rewritten summary, things-to-do list, and practical notes, always crediting and linking back to the original source article.
- **📊 Weighted tier list (S→E)** — every destination is scored 1-10 on cost value, uniqueness, transit ease, and family-friendliness; tiers are computed automatically from a documented weighted formula (see `tier-schema.md`) rather than hand-assigned.
- **💰 Live currency conversion** — budget estimates default to USD and convert on the fly to ~25-30 major world currencies using live exchange rates.
- **🔎 Multi-mode search** — fuzzy, substring, whole-word, strict, and broad matching across titles, tags, and full article content.
- **🧳 Local trip planner** — save destinations to a personal bucket list, stored locally in your browser (no account needed).
- **🔗 Full source attribution** — every destination links back to its original article, plus a one-click search for further reading; a public `SOURCES.md` ledger lists every destination's origin.

---

## 🛠️ Tech Stack

### Frontend
| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router, static generation) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Globe | [react-globe.gl](https://github.com/vasturiano/react-globe.gl) + `world-atlas` (110m topojson) |
| Search | [Fuse.js](https://www.fusejs.io/) with multiple configurable matching modes |
| Data layer | [gray-matter](https://www.npmjs.com/package/gray-matter) — reads YAML frontmatter + Markdown from `/data` at build time, no database |
| Currency rates | [frankfurter.app](https://www.frankfurter.app/) (free, daily ECB rates, no API key) |

### Data Pipeline (private tooling, not part of the deployed site)
| Layer | Choice |
|---|---|
| Language | Python |
| Scraping | [trafilatura](https://trafilatura.readthedocs.io/) for content extraction, with a [Playwright](https://playwright.dev/) fallback for JS-rendered pages |
| Geocoding | [Nominatim](https://nominatim.org/) (OpenStreetMap) — real per-destination coordinates, no API key |
| Enrichment & tiering | AI-assisted, web-search-grounded lookups against a documented rubric — see `tier-schema.md` |

**Why this split:** Python handles scraping, enrichment, and geocoding as one-off/repeatable pipeline steps; Next.js + TypeScript serves the actual site as fast, statically-rendered pages with no runtime backend needed.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) v3.10+ (only needed if you want to run the data pipeline yourself — the site itself just needs Node)

### 1. Clone the repository
```bash
git clone https://github.com/wantedchip/WhereToNext.git
cd WhereToNext
```

### 2. Run the site
```bash
npm install
npm run build
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it.

### 3. (Optional) Data pipeline tooling
The scraping/enrichment tooling lives in a private, untracked `tools/` directory and isn't part of this public repo — see `data-schema.md` and `tier-schema.md` below if you want to understand or extend the data model yourself.

---

## 📂 Data Pipeline Workflow

1. **Scrape** — paginate a source's article listing, extract and clean each article's text, save as raw Markdown.
2. **Ingest** — rewrite each raw article in original wording (never copied verbatim), extract structured metadata, and write a schema-compliant file into `/data`. Content that doesn't fit a single-destination guide is skipped and logged.
3. **Enrich** — for each destination, look up real best-months, budget (backpacker vs. luxury), transit notes, and real geographic coordinates; score it 1-10 on four axes.
4. **Tier (automatic)** — each destination's tier is computed from its four scores using a documented weighted formula — never hand-assigned, always reproducible.
5. **Serve** — Next.js reads every file in `/data` via `gray-matter` at build time and renders the globe, tier list, search, and individual destination pages.

## 📐 Schemas

- **`data-schema.md`** — the exact frontmatter contract every file in `/data` must follow.
- **`tier-schema.md`** — the weighted scoring formula and S–E thresholds.
- **`SOURCES.md`** — a public, plain-language ledger of every destination's original source article.

## 🙏 Attribution

The original destination write-ups this project draws from are sourced from independent travel bloggers. Every destination page links directly back to its original article — see `SOURCES.md` for the complete list, and the in-app **About** page for more on how ratings are generated.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Note: the MIT license covers this project's own code; it does not extend to the original third-party travel write-ups this project references and links to, which remain the property of their respective authors.