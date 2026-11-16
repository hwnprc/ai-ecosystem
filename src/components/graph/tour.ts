import type { MapData } from "@/lib/data";
import type { Company, LayerId, Link } from "@/lib/types";
import { VIEW, linkKey, type PlacedNode } from "@/lib/graphLayout";

// The part of the graph a tour step looks at, in SVG units (the graph is VIEW x VIEW, centered on 0,0).
export type Box = { x: number; y: number; size: number };
export const FULL_VIEW: Box = { x: -VIEW / 2, y: -VIEW / 2, size: VIEW };

// One stop on the guided tour. Every number in the text is counted from the data,
// so the tour stays true when the daily update adds companies and links.
export type TourStep = {
  id: string;
  title: string;
  body: string[]; // short paragraphs
  lit: Set<string> | null; // companies to keep bright; null = all
  links: Set<string> | null; // link keys to draw bright; null = none picked out
  labels: Set<string> | null; // company names to show; null = the graph's usual rule
  view: Box; // where to zoom
  ring?: LayerId; // a ring to draw bold
  agi?: boolean; // light the arrows into AGI
};

const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);

// "a, b and c"
function list(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? "");
}

// The smallest square around these companies, with room for names. Wide spreads show the whole graph.
function boxAround(ids: Iterable<string>, nodes: Map<string, PlacedNode>, pad = 70, min = 460): Box {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const id of ids) {
    const n = nodes.get(id);
    if (!n) continue;
    x0 = Math.min(x0, n.x);
    y0 = Math.min(y0, n.y);
    x1 = Math.max(x1, n.x);
    y1 = Math.max(y1, n.y);
  }
  if (!Number.isFinite(x0)) return FULL_VIEW;
  const size = Math.max(min, x1 - x0 + pad * 2, y1 - y0 + pad * 2);
  if (size > VIEW * 0.82) return FULL_VIEW;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { x: cx - size / 2, y: cy - size / 2, size };
}

export function buildTour(data: MapData, placed: PlacedNode[]): TourStep[] {
  const nodes = new Map(placed.map((n) => [n.id, n]));
  const byId = new Map(data.companies.map((c) => [c.id, c]));
  const has = (id: string) => byId.has(id);
  const name = (id: string) => byId.get(id)?.name.replace(/ \(.*\)$/, "") ?? id;
  const L = data.links;
  const total = data.companies.length;
  const keys = (ls: Link[]) => new Set(ls.map(linkKey));
  const ends = (ls: Link[]) => new Set(ls.flatMap((l) => [l.from, l.to]));
  const steps: TourStep[] = [];

  // 1. How to read the map.
  steps.push({
    id: "map",
    title: "A map of the AI industry",
    body: [
      `This map holds ${total} AI companies and ${L.length} deals between them. Each deal links to a source.`,
      "Each ring is one layer: model labs, cloud infrastructure, chips, energy, and apps on the outside.",
      "AGI sits in the middle. It is where many of these companies say they are heading.",
    ],
    lit: null,
    links: null,
    labels: null,
    view: FULL_VIEW,
  });

  // 2. One app, followed down the stack to the power plant.
  const app = has("cursor") ? "cursor" : data.companies.find((c) => c.layer === "applications")?.id;
  if (app) {
    const labs = L.filter((l) => l.from === app && l.type === "builds-on" && byId.get(l.to)?.layer === "models");
    const labIds = new Set(labs.map((l) => l.to));
    const run = L.filter(
      (l) => labIds.has(l.from) && l.type === "runs-on" && byId.get(l.to)?.kind === "bigtech",
    );
    const supplierIds = new Set(run.map((l) => l.to));
    const power = L.filter((l) => supplierIds.has(l.from) && l.type === "buys-power");
    const chain = [...labs, ...run, ...power];
    const clouds = [...supplierIds].filter((id) => byId.get(id)?.layer === "infra");
    const chips = [...supplierIds].filter((id) => byId.get(id)?.layer === "compute");
    const energy = [...new Set(power.map((l) => l.to))];
    steps.push({
      id: "stack",
      title: "One app, five layers",
      body: [
        `Follow one app down the stack. ${name(app)} is a coding tool. It builds on models from ${list([...labIds].map(name))}.`,
        `Those labs run on clouds like ${list(clouds.slice(0, 3).map(name))}${chips.length ? `, and on chips from ${list(chips.map(name))}` : ""}.`,
        energy.length
          ? `The clouds then sign deals to buy power from energy companies like ${list(energy.slice(0, 3).map(name))}.`
          : "",
      ].filter(Boolean),
      lit: new Set([app, ...ends(chain)]),
      links: keys(chain),
      labels: new Set([app, ...ends(chain)]),
      view: FULL_VIEW,
    });
  }

  // 3. Big tech: few companies, most of the deals.
  const big = data.companies.filter((c) => c.kind === "bigtech");
  const bigIds = new Set(big.map((c) => c.id));
  const bigLinks = L.filter((l) => bigIds.has(l.from) || bigIds.has(l.to));
  steps.push({
    id: "bigtech",
    title: "Big tech supplies the stack",
    body: [
      `Only ${big.length} of the ${total} companies are big tech. Yet they take part in ${bigLinks.length} of the ${L.length} deals. That is ${pct(bigLinks.length, L.length)}%.`,
      "Big tech is solving the supply problem. It provides the chips, the cloud, and the money. It also signs the large power deals.",
    ],
    lit: ends(bigLinks),
    links: keys(bigLinks),
    labels: bigIds,
    view: FULL_VIEW,
  });

  // 4. NVIDIA, and money that comes back as chip and cloud spending.
  const degree = new Map<string, number>();
  for (const l of L) {
    degree.set(l.from, (degree.get(l.from) ?? 0) + 1);
    degree.set(l.to, (degree.get(l.to) ?? 0) + 1);
  }
  const top = [...degree].sort((a, b) => b[1] - a[1])[0];
  const hub = top?.[0] ?? "nvidia";
  const hubInvests = L.filter((l) => l.from === hub && l.type === "invests");
  // A loop: a supplier invests in a company that also runs on that supplier.
  const loops = L.filter(
    (l) => l.type === "invests" && L.some((m) => m.type === "runs-on" && m.from === l.to && m.to === l.from),
  );
  const loopBack = L.filter(
    (m) => m.type === "runs-on" && loops.some((l) => l.from === m.to && l.to === m.from),
  );
  steps.push({
    id: "loop",
    title: `${name(hub)} sits at the center of the money`,
    body: [
      `${name(hub)} takes part in ${top?.[1] ?? 0} deals, more than any other company. It has invested in ${hubInvests.length} of them.`,
      `Much of that money comes back. In ${loops.length} cases, a chip or cloud company funds a startup that then runs on its chips or cloud.`,
    ],
    lit: new Set([hub, ...ends(loops)]),
    links: keys([...loops, ...loopBack]),
    labels: ends(loops),
    view: FULL_VIEW,
  });

  // 5. Startups build products on top, mostly on two labs' models.
  const startups = data.companies.filter((c) => c.kind === "startup");
  const appStartups = startups.filter((c) => c.layer === "applications");
  const builds = L.filter((l) => l.type === "builds-on");
  const targets = new Map<string, number>();
  for (const l of builds) targets.set(l.to, (targets.get(l.to) ?? 0) + 1);
  const topLabs = [...targets].sort((a, b) => b[1] - a[1]).slice(0, 2);
  const toTop = topLabs.reduce((s, [, n]) => s + n, 0);
  const tags = [...new Set(appStartups.map((c: Company) => c.tag).filter(Boolean))].slice(0, 4);
  steps.push({
    id: "startups",
    title: "Startups solve the problems on top",
    body: [
      `${startups.length} of the ${total} companies are startups. ${appStartups.length} of them build apps${tags.length ? ` in areas like ${list(tags.map((t) => t!.toLowerCase().replace(/\bai\b/, "AI")))}` : ""}.`,
      `Most apps do not train their own models. ${toTop} of the ${builds.length} "builds on" deals point to just ${topLabs.length} labs: ${list(topLabs.map(([id]) => name(id)))}.`,
    ],
    lit: new Set([...appStartups.map((c) => c.id), ...ends(builds)]),
    links: keys(builds),
    labels: new Set([...topLabs.map(([id]) => id), ...builds.filter((l) => byId.get(l.from)?.tier !== "wide").map((l) => l.from)]),
    view: FULL_VIEW,
    ring: "applications",
  });

  // 6. Where it is all heading: inward, toward AGI.
  const labs = data.companies.filter((c) => c.layer === "models");
  const intoLabs = L.filter((l) => l.type === "invests" && byId.get(l.to)?.layer === "models");
  const allInvests = L.filter((l) => l.type === "invests");
  const deepLabs = labs.filter((c) => c.tier !== "wide").map((c) => c.id);
  steps.push({
    id: "heading",
    title: "Where they are all heading",
    body: [
      `Everything points to the center. ${labs.length} model labs are racing toward AGI.`,
      `The money flows inward too. ${pct(intoLabs.length, allInvests.length)}% of the investments on this map go into model labs.`,
      "The open question is who keeps the value as models get cheaper: the labs, or the apps closest to people.",
    ],
    lit: new Set(labs.map((c) => c.id)),
    links: null,
    labels: new Set(deepLabs),
    view: boxAround(deepLabs, nodes, 120, 640),
    ring: "models",
    agi: true,
  });

  return steps;
}
