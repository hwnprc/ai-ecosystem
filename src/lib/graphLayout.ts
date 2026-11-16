import { scalePoint } from "d3";
import type { Company, Layer, LayerId, Link } from "./types";

// Rings from the center out. The customer sits in the middle, so a ring's
// distance from the center is its distance from the person paying.
export const RING_ORDER: LayerId[] = ["applications", "models", "infra", "compute", "energy"];

export const VIEW = 1000; // the SVG viewBox is VIEW x VIEW, centered on 0,0
export const CENTER_R = 52;
const INNER = 150;
const OUTER = 440;

export type PlacedNode = Company & { x: number; y: number; angle: number; r: number };
export type Ring = { layer: Layer; r: number };

export function ringRadius(index: number) {
  if (RING_ORDER.length === 1) return INNER;
  return INNER + ((OUTER - INNER) * index) / (RING_ORDER.length - 1);
}

// Spread each layer's companies evenly around its ring. Each ring starts at a
// slightly different angle so nodes on neighbouring rings do not line up.
export function layoutGraph(layers: Layer[], companies: Company[]) {
  const rings: Ring[] = RING_ORDER.map((id, i) => ({
    layer: layers.find((l) => l.id === id)!,
    r: ringRadius(i),
  })).filter((ring) => ring.layer);

  const nodes: PlacedNode[] = [];
  rings.forEach((ring, i) => {
    const members = companies.filter((c) => c.layer === ring.layer.id);
    const scale = scalePoint<string>()
      .domain(members.map((c) => c.id))
      .range([0, 360 - 360 / Math.max(members.length, 1)]);
    const offset = -90 + i * 23; // degrees, start near the top
    members.forEach((c) => {
      const angle = (scale(c.id) ?? 0) + offset;
      const rad = (angle * Math.PI) / 180;
      nodes.push({ ...c, angle, r: ring.r, x: ring.r * Math.cos(rad), y: ring.r * Math.sin(rad) });
    });
  });
  return { rings, nodes };
}

// A curved edge that bends toward the center, like a chord drawn through the rings.
export function edgePath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const pull = 0.45;
  return `M${a.x},${a.y} Q${mx * pull},${my * pull} ${b.x},${b.y}`;
}

// Rotation (degrees) that brings a node to the bottom of the circle, taking the
// shortest way round from the current rotation.
export function rotationToBottom(angle: number, current: number) {
  const target = 90 - angle;
  let delta = (target - current) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return current + delta;
}

export const LINK_LABELS: Record<Link["type"], { out: string; in: string }> = {
  invests: { out: "Invests in", in: "Backed by" },
  "runs-on": { out: "Runs on", in: "Supplies compute to" },
  "builds-on": { out: "Builds on", in: "Its models are used by" },
  "buys-power": { out: "Buys power from", in: "Sells power to" },
};

// Dash pattern per link type, so the graph stays black and white.
export const LINK_DASH: Record<Link["type"], string | undefined> = {
  invests: undefined,
  "runs-on": "6 4",
  "builds-on": "2 4",
  "buys-power": "10 3 2 3",
};

// Each ring is its own system, with its own color and node shape, like the civic graph.
export type NodeShape = "circle" | "diamond" | "square" | "hexagon" | "triangle";
export const LAYER_STYLE: Record<LayerId, { color: string; shape: NodeShape }> = {
  applications: { color: "#e0645c", shape: "circle" },
  models: { color: "#a35ce0", shape: "diamond" },
  infra: { color: "#6a6fd8", shape: "square" },
  compute: { color: "#d655c8", shape: "hexagon" },
  energy: { color: "#d9822b", shape: "triangle" },
};
export const HUB_COLOR = "#e07a3a";

// Split a curved edge in half so an arrowhead can sit in the middle of it.
export function edgeHalves(a: { x: number; y: number }, b: { x: number; y: number }) {
  const pull = 0.45;
  const c = { x: ((a.x + b.x) / 2) * pull, y: ((a.y + b.y) / 2) * pull };
  const q0 = { x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 };
  const q1 = { x: (c.x + b.x) / 2, y: (c.y + b.y) / 2 };
  const m = { x: (q0.x + q1.x) / 2, y: (q0.y + q1.y) / 2 };
  return [`M${a.x},${a.y} Q${q0.x},${q0.y} ${m.x},${m.y}`, `M${m.x},${m.y} Q${q1.x},${q1.y} ${b.x},${b.y}`];
}

// A wavy badge for the hub, drawn as a closed path.
export function starburst(r: number, bumps = 14, depth = 0.09) {
  const pts: string[] = [];
  for (let i = 0; i <= 180; i++) {
    const t = (i / 180) * Math.PI * 2;
    const rr = r * (1 + depth * Math.sin(bumps * t));
    pts.push(`${(rr * Math.cos(t)).toFixed(1)},${(rr * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}
