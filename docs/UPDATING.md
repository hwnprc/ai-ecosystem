# Keeping the AI ecosystem graph up to date

A scheduled Claude task runs this once a day. A person can follow the same steps by hand.
Each run opens one pull request. Nothing reaches the live site until Haewon merges it.

## Files

| File | What it holds |
| --- | --- |
| `src/data/companies.json` | The 56 researched companies (deep tier). |
| `src/data/funded.json` | Funding/valuation facts, plus the funded tier (companies with `name`, `layer`, `problem`). |
| `src/data/links.json` | Connections between companies. |
| `src/data/signals.json` | Dated news items for researched companies. |
| `src/data/headings.json` | One "Where it's heading" line per company. |
| `src/data/websites.json` | Official website per company id. |
| `src/data/meta.json` | `updated`: the date of the last data refresh (YYYY-MM-DD). |

Types for every row are in `src/lib/types.ts`. Keep the existing one-row-per-line JSON style.

## Rules

- **Who is on the map:** an AI company that raised $100M or more, or is valued at $1B or more. Big tech counts. No early-stage companies under that bar.
- **Every new fact needs a real source URL** that you actually saw (news article, press release, company blog). Never invent or guess a URL.
- **Link types** (read "from TYPE to"): `invests`, `runs-on`, `builds-on`, `buys-power`, `partners`, `acquires`. Both ends must be ids already in the data. Big tech ids: `nvidia`, `amd`, `aws` (Amazon), `google-cloud` (Google/Alphabet incl. GV, CapitalG), `azure` (Microsoft, M12), `meta-ai`, `oracle-cloud`, `google-deepmind`, `microsoft-copilot`, `tesla-optimus`. SpaceX and xAI are `xai`.
- **Confidence:** `high` when the source states it plainly. Otherwise `medium` or `low`, with a short `check` note. Always `"verified": false`.
- **Dates:** the date of the event, `YYYY-MM` or `YYYY-MM-DD`.
- Never add a link that already exists with the same from, type and to. If a newer source changes an existing link (e.g. a deal collapsed), update its note and source rather than adding a duplicate.
- Plain, short sentences. No em-dashes.

## Each run

1. Read `src/data/meta.json`. Search for AI news since that date (or the last 3 days, whichever is longer): funding rounds, investments, compute and cloud deals, power deals, partnerships, acquisitions, big launches. Focus on companies already on the map. Keep total web searches modest (about 40).
2. For each solid, sourced item:
   - Add or update links in `links.json`.
   - Add a news item to `signals.json` (types: `money`, `hiring`, `launch`, `language`) when the company is in `companies.json`.
   - If the move changes where the company is going, rewrite its line in `headings.json` (one sentence, about 20 words, with the move's date and source).
   - A funding round or valuation goes in that company's `facts` in `funded.json`.
3. New companies: add one only if it clears the bar above and the source says so. Add it to `funded.json` (id, name, layer, one-line problem, facts) and to `websites.json` if its official site is confirmed. Never add a company only to make a link work.
4. Set `src/data/meta.json` `updated` to today.
5. Check: `npx tsc --noEmit`, `npx eslint src`, `npm run build`. Also run a quick script that every link's `from`/`to` and every heading id exists, and every source starts with `http`.
6. If nothing new and sourced turned up, change nothing and open no PR.
7. Otherwise commit, push, and open one PR titled `Data update YYYY-MM-DD`. The body lists each change as a bullet with its source, and calls out anything marked medium or low.
