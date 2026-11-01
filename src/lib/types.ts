// Shapes of the JSON files in src/data. Every claim on the map should trace back to a Signal.

// The five layers from the AI Frontier deck's value chain slide, bottom to top.
// The consumer sits above applications. Closer to the consumer = more value capture.
export type LayerId = "energy" | "compute" | "infra" | "models" | "applications";

export type LayerState = {
  label: string;
  level: 1 | 2 | 3; // how much value the layer captures, 1 = little, 3 = most
};

export type Layer = {
  id: LayerId;
  name: string;
  definition: string; // one line a non-expert understands on first read
  now: LayerState;
  heading: LayerState; // where the deck expects it to go
  note: string; // what the deck says about this layer's margin
};

export type CompanyKind = "bigtech" | "startup";

// early = pre-seed to Series A and founded 2023 or later; anchor = a larger startup kept for comparison
export type Stage = "bigtech" | "anchor" | "early";

export type Company = {
  id: string;
  name: string;
  layer: LayerId;
  kind: CompanyKind;
  stage: Stage;
  tag?: string; // a sub-area inside the layer, e.g. "Physical AI" or "Dev tools"
  problem: string; // the problem it is solving, in one sentence
  verified: boolean; // false until the problem and stage are checked against sources
};

export type SignalType = "money" | "hiring" | "launch" | "language";

export type Signal = {
  company: string; // Company.id
  type: SignalType;
  date: string; // YYYY-MM-DD
  summary: string;
  source: string; // URL
};

export type Direction = {
  id: string;
  title: string;
  status: "guess" | "evidence"; // guess until backed by signals
  companies: string[]; // Company.id values it cuts across
  summary: string;
};

export type CareerRow = {
  direction: string; // Direction.id
  startup: string;
  bigtech: string;
};
