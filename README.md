<div align="center">

# WhereToNext 🌍✈️

> A modern, data-driven travel discovery guide helping you decide where to pack your bags next.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

</div>

**WhereToNext** is a curated, full-stack web application designed to help travelers discover, evaluate, and plan their next vacation. Starting from curated travel articles and blog pipelines, the platform processes unstructured travel stories into lightweight, structured Markdown/JSON datasets — enriched with practical travel logistics, seasonal guides, cost breakdowns, and interactive exploration features.

---

## ✨ Features

- **📍 Curated Destination Guides** — Comprehensive breakdowns of top vacation spots around the world, built from rich travel itineraries.
- **💡 Practical Logistics** — Data-enriched profiles detailing optimal visiting months (peak vs. off-peak), estimated daily budgets, and transit options.
- **📊 Interactive Tier List** — A gamified, interactive ranking engine (S → E) categorizing destinations based on overall experience, accessibility, and value.
- **⚡ Lightweight Architecture** — Powered by a clean Markdown (`.md`) and JSON data layer, keeping performance fast and content easy to process programmatically.

---

## 🛠️ Tech Stack

### Frontend & UI
| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router & Static Site Generation) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Data Serving | [gray-matter](https://www.npmjs.com/package/gray-matter) — reads YAML frontmatter + Markdown from `/data` at build time |

### Data Processing & Scraping Pipeline
| Layer | Choice |
|---|---|
| Language | Python |
| Scraping | Playwright (dynamic/JS pages) or BeautifulSoup + Requests (static pages) |
| HTML → Markdown | Markdownify |
| Data Modeling | Pydantic (enforces schema: `name`, `location`, `best_season`, `est_cost`, `tier_rank`) |
| API (optional) | FastAPI — typed backend endpoints if you need a live service alongside the static site |

**Why this split:** Python handles scraping, enrichment, and AI-driven tier reasoning well, while Next.js + TypeScript delivers fast, SEO-friendly, statically-rendered pages for the destination guides and tier list UI.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Python](https://www.python.org/) v3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/WhereToNext.git
cd WhereToNext
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

### 3. Data Pipeline Setup (Optional / Scraper)
```bash
cd scraper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📂 Data Pipeline Workflow

1. **Scrape** — Paginate through the source blog, extract article text, strip HTML noise, and write one `.md` file per destination into `/raw`.
2. **Extract** — Batch-process `/raw` to pull structured metadata (name, location, summary) into a master JSON or Markdown list.
3. **Enrich** — For each destination, look up optimal visiting months, peak/off-peak seasons, estimated daily budget (backpacker vs. luxury), and primary transit options; append under standardized headings.
4. **Tier** — Apply a consistent rubric to grade every destination S (must-visit) through E (niche/overrated), with a short justification per place covering transit ease, cost, and attractions.
5. **Serve** — Next.js reads the enriched Markdown/JSON data at build time (via `gray-matter`) and renders destination cards, filters, and the interactive Tier List.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.