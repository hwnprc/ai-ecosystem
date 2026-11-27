# Promo video

A 28-second video of the AI Ecosystem Graph, made with [Remotion](https://www.remotion.dev).
It reads the same data as the site (`src/data`) and uses the same ring layout
(`src/lib/graphLayout.ts`). When the data changes, a new render shows the new map.

What it shows:

1. The whole map, alive: pulses ripple out from the biggest hubs along the links. Then the camera dives into AGI.
2. The camera pulls out one ring at a time: models, infrastructure, chips, energy, apps.
3. Every connection appears at once.
4. The dial turns to spotlight one company (NVIDIA) and its links.
5. A closing card.

There are two versions. `Promo` is 1080x1080 for the X feed. `PromoWide` is 1920x1080.
Both are H.264 mp4 at 30 fps, with no sound, so they work muted.

## Run it

You need Node 20 or newer. From this folder:

```bash
npm install
npm run studio        # opens a preview in the browser, with a timeline you can scrub
npm run render        # writes out/ai-ecosystem-square.mp4
npm run render:wide   # writes out/ai-ecosystem-wide.mp4
```

The first render downloads a headless Chrome. That takes a minute once.

For sharp thin lines and small text, `render` draws every frame at twice the size
(2160 px), then scales it down to 1080 with a high-quality filter and a high bitrate.
The 2x master stays in `out/raw-square.mp4` if you ever need it.

## Change it

Almost everything you will want to change is in `src/script.ts`:

- The words on screen. Use `\n` for a line break.
- The company to spotlight. Set `spotlight.company` to its id in `src/data/companies.json`, then rewrite `spotlight.sub`.
- How long each part lasts. Each part has a `start` time in seconds. `duration` is the full length.
  If you move one start, move the later ones too.
- The ring captions come from each layer's `definition` in `src/data/layers.json`.
  To use different words in the video only, add them to `rings.overrides`, for example
  `overrides: { energy: "Power is the new bottleneck." }`.

Colors, sizes and the camera are in `src/Promo.tsx`.

Studio reloads as you save, so you can see each change right away.
