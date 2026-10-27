# Where is AI heading?

An interactive map of the US AI ecosystem, built for my CP191 nano capstone.

**Guiding question:** What problems are big tech companies and AI startups each solving today, and where are they all heading?

The map stacks the industry in six layers, from chips at the bottom to physical AI on top. Each company is tagged as big tech or startup. Clicking a company shows its evidence in four signal types: money, hiring, launches, and language. Directions show how one trend cuts across several layers.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How it is built

- **Next.js + React + TypeScript.** Next.js handles pages and the build. React draws the map.
- **Motion** animates the layer map and the side panel.
- **React Flow** draws the Connections view.
- **D3** is installed for the startup trend chart, which comes once the YC data is collected.

## Where the data lives

All content is plain JSON in `src/data/`. The shapes are defined in `src/lib/types.ts`.

| File | What it holds |
| --- | --- |
| `layers.json` | The six layers, each with a one-line definition |
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
