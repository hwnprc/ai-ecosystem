// Everything you are likely to change lives here: the words on screen, the company
// to spotlight, and how long each part lasts. Times are in seconds.
// After editing, preview with `npm run studio` and render with `npm run render`.

export const FPS = 30;

export const script = {
  // 0. The hook: the whole map, from the very first frame, to grab attention.
  // At `end` the camera dives into AGI, taking `dive` seconds.
  // {companies} and {links} are filled in from the data.
  // During the hook, pulses ripple out from `sources` along the links, one hop every `hop` seconds.
  hook: {
    end: 3.4,
    dive: 0.7,
    sources: ["nvidia", "openai", "google-cloud"],
    hop: 0.45,
    title: "I mapped the US AI ecosystem.",
    sub: "{companies} companies. {links} connections.",
  },

  // 1. Close on AGI in the middle.
  intro: {
    start: 4.1,
    title: "Where is AI heading?",
    sub: "Every ring of this map points to the middle.",
  },

  // 2. Pull out one ring at a time. Each ring gets `perRing` seconds.
  // The caption under each ring name comes from its definition in src/data/layers.json.
  // Set a ring's text here to override it.
  rings: {
    start: 6.0,
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
    start: 15.5,
    title: "Everything is connected.",
    sub: "Who invests in, runs on, and builds on whom.",
  },

  // 4. Spotlight one company. Use its id from src/data/companies.json.
  // {count} is its number of connections.
  spotlight: {
    start: 18.2,
    company: "nvidia",
    title: "NVIDIA: {count} connections.",
    sub: "Chips for nearly everyone on the map.",
  },

  // 5. Closing card.
  outro: {
    start: 23.2,
    title: "The US AI ecosystem",
    sub: "Energy. Chips. Infra. Models. Apps.\nAll pointing toward AGI.",
    footer: "Explore the map: link in thread",
  },

  // Total length of the video.
  duration: 27.6,
};

export const sec = (s: number) => Math.round(s * FPS);
