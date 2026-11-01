# Where is AI heading?

An interactive map of the US AI ecosystem, built for my CP191 nano capstone.

**Guiding question:** What problems are big tech companies and AI startups each solving today, and where are they all heading?

The map stacks the industry in five layers from the AI Frontier deck's value chain slide: energy, chips, infrastructure, models, and applications, with the consumer on top. Closer to the consumer means more value capture. Each company is tagged as big tech or startup. Clicking a company shows its evidence in four signal types: money, hiring, launches, and language. Directions show how one trend cuts across several layers.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Value capture explainer

`/value-capture` is an interactive reading of the AI Frontier deck "가치는 어디로 가는가" (23 Oct 2026), run through the hosts' six thinking lenses.

- Route: `src/app/value-capture/page.tsx`
- Content: `src/data/valueCapture.ts`
- Components: `src/components/value-capture/`. `ValueCapture.tsx` holds the shared year state. Each section (year bar, layer stack, domain queue, startup test, margin bars, indicators, scenario map) is its own component that reads the year.

## Deploy on Vercel

1. Sign in at vercel.com with GitHub.
2. Choose **Add New → Project** and import `hwnprc/ai-ecosystem`. Vercel detects Next.js. Keep the defaults.
3. Choose **Deploy**. Every push to `main` then redeploys, and every pull request gets a preview link.
4. To use `map.haewonpark.me`, open **Settings → Domains**, add it, and create the CNAME record Vercel shows at your domain registrar.

## How it is built

- **Next.js + React + TypeScript.** Next.js handles pages and the build. React draws the map.
- **Motion** animates the layer map and the side panel.
- **React Flow** draws the Connections view.
- **D3** is installed for the startup trend chart, which comes once the YC data is collected.

## Where the data lives

All content is plain JSON in `src/data/`. The shapes are defined in `src/lib/types.ts`.

| File | What it holds |
| --- | --- |
| `layers.json` | The five layers, each with a definition, today's and future value capture, and the deck's note |
| `companies.json` | Each company's layer, big tech or startup, stage, and the problem it solves |
| `signals.json` | Dated, sourced evidence for each company |
| `directions.json` | Cross-layer directions and the companies they touch |
| `careers.json` | Career reflection rows for each direction |

To add a signal, append an entry like this to `signals.json`:

```json
{
  "company": "decagon",
  "type": "money",
  "date": "2026-10-01",
  "summary": "One sentence on what happened.",
  "source": "https://link-to-the-source"
}
```

`type` is one of `money`, `hiring`, `launch`, or `language`. Every signal needs a date and a source link.

Companies start with `"verified": false`. Set it to `true` once the problem and stage are checked against sources.

## Selection rules

A company is on the map if it is US-based, AI is its core product, it raised money or launched something in the last 18 months, and at least two of its signals are public. Most startups are early-stage: pre-seed to Series A, founded in 2023 or later. Each layer can keep one larger "anchor" startup for comparison.

## Privacy

Conversation notes never go in this repo. The `notes/` and `data-raw/` folders are ignored by git.

## License

Code is under the MIT License. The writing and the dataset are under CC BY 4.0.
