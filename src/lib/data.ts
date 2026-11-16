import layers from "@/data/layers.json";
import companies from "@/data/companies.json";
import signals from "@/data/signals.json";
import directions from "@/data/directions.json";
import careers from "@/data/careers.json";
import links from "@/data/links.json";
import funded from "@/data/funded.json";
import type { CareerRow, Company, Direction, FundedRow, Layer, Link, Signal } from "./types";

export type MapData = {
  layers: Layer[];
  companies: Company[];
  signals: Signal[];
  directions: Direction[];
  careers: CareerRow[];
  links: Link[];
};

export const mapData: MapData = {
  layers: layers as Layer[],
  companies: companies as Company[],
  signals: signals as Signal[],
  directions: directions as Direction[],
  careers: careers as CareerRow[],
  links: links as Link[],
};

// The graph adds a wide tier: every AI company in src/data/funded.json that raised $100M+
// or is valued at $1B+. Its rows also add funding facts to the hand-picked companies.
const rows = funded as FundedRow[];
const factsById = new Map(rows.map((r) => [r.id, r.facts]));
const deepIds = new Set(mapData.companies.map((c) => c.id));
const wide: Company[] = rows
  .filter((r) => !deepIds.has(r.id) && r.name && r.layer && r.problem)
  .map((r) => ({
    id: r.id,
    name: r.name!,
    layer: r.layer!,
    kind: "startup",
    stage: "anchor",
    problem: r.problem!,
    verified: false,
    tier: "wide",
    facts: r.facts,
  }));

export const graphData: MapData = {
  ...mapData,
  companies: [
    ...mapData.companies.map((c) => ({ ...c, tier: "deep" as const, facts: factsById.get(c.id) ?? [] })),
    ...wide,
  ],
};
