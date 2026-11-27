// Everything you are likely to change lives here: the words on screen, the company
// to spotlight, and how long each part lasts. Times are in seconds.
// After editing, preview with `npm run studio` and render with `npm run render`.

export const FPS = 30;

export const script = {
  // 1. Open close on AGI in the middle.
  intro: {
    start: 0,
    title: "Where is AI heading?",
    sub: "Every ring of this map points to the middle.",
  },

  // 2. Pull out one ring at a time. Each ring gets `perRing` seconds.
  // The caption under each ring name comes from its definition in src/data/layers.json.
  // Set a ring's text here to override it.
  rings: {
    start: 2.6,
    perRing: 1.9,
    names: {
      models: "Models",
      infra: "Infrastructure",
      compute: "Chips",
      energy: "Energy",
      applications: "Apps",
    } as Record<string, string>,
    overrides: {} as Record<string, string>,
  },

  // 3. Show every connection at once. {companies} and {links} are filled in from the data.
  links: {
    start: 12.4,
    title: "{companies} companies. {links} connections.",
    sub: "Who invests in, runs on, and builds on whom.",
  },

  // 4. Spotlight one company. Use its id from src/data/companies.json.
  // {count} is its number of connections.
  spotlight: {
    start: 15.4,
    company: "nvidia",
    title: "NVIDIA: {count} connections.",
    sub: "Chips for nearly everyone on the map.",
  },

  // 5. Closing card.
  outro: {
    start: 20.6,
    title: "The US AI ecosystem",
    sub: "Energy. Chips. Infra. Models. Apps.\nAll pointing toward AGI.",
    footer: "Explore the map: link in thread",
  },

  // Total length of the video.
  duration: 25,
};

export const sec = (s: number) => Math.round(s * FPS);
