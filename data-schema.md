# Destination Data Schema — Where To Next

This is the canonical frontmatter contract for every file in `/data`. Follow this exactly for any new destination you add — it's what `lib/destinations.ts` and `lib/types.ts` expect to parse.

## Required frontmatter fields

```yaml
---
title: string                     # article title, matches source
destination: string               # primary destination name, e.g. "Costa Rica"
country: string                   # country name
region: string                    # continent / general region, e.g. "Central America"
source_url: string                # full URL to the original hudsonandemily.com article
tags: [string, ...]               # lowercase, hyphenated for multi-word tags (e.g. scuba-diving)
tier: null                        # always start new entries as null — auto-computed later, see tier-schema.md
best_months: [string, ...] | null # e.g. [January, February, March, April] — leave null until scored
budget_tier:                      # leave null until scored
  backpacker: string              # e.g. "$59–75/day"
  luxury: string                  # e.g. "$374–500/day"
transit_notes: string | null      # 2-4 sentences, leave null until scored
score:                            # leave null until scored
  cost_value: number              # 1-10
  uniqueness: number              # 1-10
  transit_ease: number            # 1-10
  family_friendliness: number     # 1-10
coordinates:
  lat: number                     # geographic latitude
  lng: number                     # geographic longitude
---
```

## Body structure

The markdown body below the frontmatter always follows this shape:

```markdown
## Summary
2-3 sentence overview of the destination and what the source article covers, in your own words.

## Things To Do
- Bulleted list of distinct activities/attractions, one line each, paraphrased from the source — never copied verbatim.

## Notes From The Article
- Bulleted list of other useful details (logistics, tips, standout recommendations), paraphrased.
```

## Rules for adding a new destination

1. Generate the `.md` file using the same rewrite-in-your-own-words prompt from the original scraping step — never paste source text verbatim, always credit `source_url`.
2. Start with `tier`, `best_months`, `budget_tier`, `transit_notes`, and `score` all `null`. The destination will appear on the globe and in search immediately, and on its own detail page, but not on `/tiers` until scored.
3. Run the enrichment prompt (best_months / budget_tier / transit_notes / score) per destination — see the process we used for the first 6.
4. **Do not** include the extra source-citation fields (`best_months_note`, `budget_tier_source`, `transit_notes_source`, etc.) in the frontmatter that ships in `/data`. Keep those in a separate personal log (e.g. `.agents/decisions.md` or your own notes) so the production frontmatter stays exactly matched to this schema — extra undeclared fields aren't invalid, but they're clutter the app was never built to expect or display.
5. Leave `tier` as `null` even after scoring — it's computed automatically from `score` per `tier-schema.md`, not hand-set. If you ever want to manually override a computed tier for a specific destination, that's a deliberate exception and should be noted in `.agents/decisions.md` explaining why.
6. Drop the finished `.md` file straight into `/data`. No other step is needed — the build pipeline picks it up, computes its tier, and it appears across the globe, search, and (once tiered) the tiers page automatically.
