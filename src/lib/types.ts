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
  // deep = hand-picked, with researched links. wide = on the map because it raised $100M+
  // or is valued at $1B+, with no links researched yet.
  tier?: "deep" | "wide";
  facts?: Fact[]; // why it qualifies: funding rounds and valuations
  heading?: Heading; // where it is heading, from its latest concrete move
};

// One short sentence on where a company is heading, resting on one sourced move.
export type Heading = { id: string; text: string; date: string; source: string };

// One funding or valuation fact, e.g. "Raised $250M Series C (Oct 2025)".
export type Fact = { text: string; source: string };

// One row of src/data/funded.json. Rows for companies already in companies.json carry only facts.
export type FundedRow = { id: string; facts: Fact[]; name?: string; layer?: LayerId; problem?: string };

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

// A relationship between two companies, read "from <type> to".
// invests:    from puts money into to
// runs-on:    from trains or serves its AI on to's chips or cloud
// builds-on:  from uses to's models inside its product
// buys-power: from has agreed to buy electricity from to
// partners:   a named strategic or customer deal that fits none of the above
// acquires:   from bought, acqui-hired, or licensed the core tech or team of to
export type LinkType = "invests" | "runs-on" | "builds-on" | "buys-power" | "partners" | "acquires";

export type Link = {
  from: string; // Company.id
  to: string; // Company.id
  type: LinkType;
  note: string; // one short sentence on what the link is
  source: string; // URL of the article or press release
  date?: string; // YYYY-MM or YYYY-MM-DD of the event
  confidence?: "high" | "medium" | "low"; // how clearly the source states it
  check?: string; // why a person should double-check it
  verified: boolean; // true once Haewon has read the source
};
