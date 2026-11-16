import type { LayerId } from "@/lib/types";

// What the graph is looking at. "home" means nothing is selected.
export type Focus =
  | { kind: "home" }
  | { kind: "agi" }
  | { kind: "layer"; id: LayerId }
  | { kind: "company"; id: string }
  | { kind: "direction"; id: string };

export const HOME: Focus = { kind: "home" };

// Focus <-> "?n=" value, so a view can be linked to and survives a reload.
export function focusToParam(f: Focus): string | null {
  if (f.kind === "home") return null;
  if (f.kind === "agi") return "agi";
  return `${f.kind}:${f.id}`;
}

export function paramToFocus(p: string | null): Focus {
  if (!p) return HOME;
  if (p === "agi") return { kind: "agi" };
  const [kind, id] = p.split(":");
  if (!id) return HOME;
  if (kind === "layer") return { kind, id: id as LayerId };
  if (kind === "company" || kind === "direction") return { kind, id };
  return HOME;
}

export function sameFocus(a: Focus, b: Focus) {
  return focusToParam(a) === focusToParam(b);
}
