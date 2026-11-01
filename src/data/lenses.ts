// The thinking frameworks the AI Frontier Korea hosts use in the 24 Oct 2026
// episode and the 23 Oct deck "Value Capture in AI Market Dynamics".
// The lens definitions are theirs. The company readings are this project's own
// application of those lenses, not the hosts' views.

export type LensId = "chain" | "leak" | "gaps" | "cycle" | "lab" | "barbell";

export type Lens = {
  id: LensId;
  title: string;
  question: string;
  /** The lens's core idea, in plain English. */
  idea: string;
};

export const LENSES: Lens[] = [
  {
    id: "chain",
    title: "Value chain",
    question: "Where in the chain does it sit, and is that spot scarce?",
    idea: "Value goes to whatever is scarce. In pharma the drug maker earns most. For a power strip on Coupang, whoever holds the shopper's eye earns most.",
  },
  {
    id: "leak",
    title: "Leak test",
    question: "Is its advantage something that leaks?",
    idea: "Recipes spread over one beer. Data gets resold to everyone within a year. Only compute and real operation signals stay put.",
  },
  {
    id: "gaps",
    title: "Time gap and domain gap",
    question: "Does it live off being ahead, or off a domain general models can't reach?",
    idea: "Split it in two. Time gap is how far the frontier leads followers, and it keeps shrinking. Domain gap is how far a general model is from what a field needs.",
  },
  {
    id: "cycle",
    title: "Build-out cycle",
    question: "In which phase of the cycle does it make money?",
    idea: "Railroads, telecom, mobile: build-out, over-investment, correction, then an application boom. The next builder walks over the last one's ruins.",
  },
  {
    id: "lab",
    title: "Will a lab come for it?",
    question: "Can a frontier lab buy, build, or simulate its way in?",
    idea: "Watch what data vendors are collecting and who they sell it to. That shows which domain the labs take next.",
  },
  {
    id: "barbell",
    title: "Toyota or Ferrari",
    question: "Is it mass scale, a true niche, or stuck in the middle?",
    idea: "Only two things survive: the mass player and the true niche. In AI that means a frontier lab, or the owner of a domain operation loop. The middle dies.",
  },
];

/* ---------- lens 1: value chain ---------- */
// The stack from the deck's "Today's conclusion" slide (after Jensen's drawing):
// energy at the bottom, the consumer on top. Closer to the person paying means
// more value capture. Infra players keep thin margins.
export type ChainRung = "energy" | "compute" | "infra" | "models" | "apps";
export const CHAIN: { id: ChainRung; name: string; state: "scarce" | "commodity" | "contested"; note: string }[] = [
  { id: "apps", name: "Applications", state: "contested", note: "Wins if it owns the customer or the operation's reward signal" },
  { id: "models", name: "Models", state: "commodity", note: "Followers trail by ~4 months. Price per unit falls ~10x a year" },
  { id: "infra", name: "Infrastructure (AI factory)", state: "commodity", note: "Infra players keep 10% at most. AWS 35%" },
  { id: "compute", name: "Chips (compute)", state: "scarce", note: "Physical bottleneck. ~75% gross margin in the build-out" },
  { id: "energy", name: "Energy", state: "scarce", note: "Physical bottleneck. The \"ultimate moat\", later regulated" },
];

/* ---------- lens 2: leak test ---------- */
export type Asset = "compute" | "data" | "talent" | "signal";
export const ASSETS: { id: Asset; name: string; leaks: boolean; how: string }[] = [
  { id: "compute", name: "Compute or physical assets", leaks: false, how: "Only money adds more" },
  { id: "data", name: "Bought data", leaks: true, how: "Vendors resell it in ~1 year" },
  { id: "talent", name: "Talent and recipes", leaks: true, how: "Spreads in months" },
  { id: "signal", name: "Operation signal", leaks: false, how: "Doesn't exist outside the operation" },
];

/* ---------- lens 4: cycle ---------- */
export type Phase = "buildout" | "correction" | "application" | "paradigm";
export const PHASES: { id: Phase; name: string; past: string }[] = [
  { id: "buildout", name: "Build-out", past: "Track, fiber, towers" },
  { id: "correction", name: "Correction", past: "Owners change" },
  { id: "application", name: "Application era", past: "Netflix, Airbnb, SaaS" },
  { id: "paradigm", name: "New paradigm", past: "Next shift starts" },
];
/** Where the hosts place AI today: the tail end of the build-out. */
export const AI_NOW = 0.22;

export type Answer = "yes" | "no" | null;
export const LAB_QUESTIONS = [
  "Could a third party judge its results on a screen?",
  "Could a lab run the operation itself?",
  "Could simulation replace its real-world signal?",
  "Could a lab buy up the operator market?",
];

export type Barbell = "mass" | "middle" | "niche";

export type Reading = {
  chain: ChainRung;
  assets: Asset[];
  /** 0 = coding (closed), 1 = physical or regulated (open). */
  domain: number;
  /** 0 = doesn't need to be ahead, 1 = only survives while ahead. */
  timeDependence: number;
  phase: Phase;
  lab: Answer[];
  barbell: Barbell;
};

export type Company = {
  id: string;
  name: string;
  kind: "bigtech" | "startup";
  oneLine: string;
  reading: Reading;
  /** One sentence per lens explaining this project's reading. */
  why: Record<LensId, string>;
};

export const COMPANIES: Company[] = [
  {
    id: "physical-intelligence",
    name: "Physical Intelligence",
    kind: "startup",
    oneLine: "General robot models.",
    reading: { chain: "models", assets: ["talent", "signal"], domain: 0.9, timeDependence: 0.5, phase: "application", lab: ["no", "yes", "no", "no"], barbell: "niche" },
    why: {
      chain: "It sells models, a rung turning into a commodity. Its value depends on robot data that labs can't buy.",
      leak: "Its researchers can leave. The real moat is robot data collected by running real robots.",
      gaps: "Physical work is the last domain labs reach. That buys it time.",
      cycle: "It pays off once robots are deployed, after the build-out.",
      lab: "Labs can't easily judge or simulate robot outcomes. But a lab could build its own robot lab.",
      barbell: "A niche, as long as it ties itself to real operations.",
    },
  },
  {
    id: "cursor",
    name: "Cursor",
    kind: "startup",
    oneLine: "AI code editor.",
    reading: { chain: "apps", assets: ["talent", "data"], domain: 0.05, timeDependence: 0.8, phase: "buildout", lab: ["yes", "yes", "yes", "no"], barbell: "middle" },
    why: {
      chain: "An app that holds the developer's screen, which is valuable. But the model under it isn't its own.",
      leak: "Its edge is product talent and usage data. Both leak. Its own model was a late cost fix, per the deck.",
      gaps: "Coding is the first domain labs closed. It survives by staying ahead on product.",
      cycle: "It grew with the coder wave. About 30M coders are already in.",
      lab: "Code can be judged by tests, and labs already ship their own coding agents.",
      barbell: "Between the labs and a true niche. That's the dangerous middle.",
    },
  },
  {
    id: "decagon",
    name: "Decagon",
    kind: "startup",
    oneLine: "AI customer support agents.",
    reading: { chain: "apps", assets: ["signal", "data"], domain: 0.45, timeDependence: 0.5, phase: "application", lab: ["no", "no", "yes", "yes"], barbell: "niche" },
    why: {
      chain: "It sits inside a customer's support operation, close to the person paying.",
      leak: "Resolution data from real tickets is an operation signal. Was the issue really solved?",
      gaps: "Support is half digital, half messy business rules.",
      cycle: "It needs the 1.5B non-coder knowledge workers to adopt AI. That's the lagging part.",
      lab: "A lab won't run a bank's support desk. But support transcripts can be simulated, and the market is consolidating.",
      barbell: "A niche if it owns the outcome loop. Without the loop it's a thin wrapper.",
    },
  },
  {
    id: "anthropic",
    name: "Anthropic",
    kind: "startup",
    oneLine: "Frontier model lab.",
    reading: { chain: "models", assets: ["talent", "data"], domain: 0.2, timeDependence: 0.9, phase: "buildout", lab: ["no", "no", "no", "no"], barbell: "mass" },
    why: {
      chain: "The model rung. Frontier labs still earn a premium, but the deck marks this rung as becoming a commodity.",
      leak: "It rents its compute. Talent and data leak, so its moat is cheapest intelligence per watt.",
      gaps: "Its premium depends on staying ahead. The gap is now 4 months overall and 6 weeks in coding.",
      cycle: "Revenue jumped with the coder wave, but growth slowed from +147% to +45%.",
      lab: "It is the lab. The real question is which domain it takes next.",
      barbell: "Toyota: one of two or three mass players.",
    },
  },
  {
    id: "coreweave",
    name: "CoreWeave",
    kind: "startup",
    oneLine: "GPU cloud (neocloud).",
    reading: { chain: "infra", assets: ["compute"], domain: 0.1, timeDependence: 0.7, phase: "buildout", lab: ["yes", "yes", "no", "yes"], barbell: "middle" },
    why: {
      chain: "Infrastructure: it borrows to buy GPUs and rents them out. A spread business with thin margins.",
      leak: "It holds compute, which doesn't leak. But it doesn't own the chips' maker margin either.",
      gaps: "It sells generic capacity. No domain protects it.",
      cycle: "It wins in build-out while spot beats contract price. It's exposed at the correction around 2027 to 2028.",
      lab: "Labs are its customers, and hyperscalers or Nvidia could buy it.",
      barbell: "The middle. The deck says spread businesses lose in every scenario.",
    },
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    kind: "bigtech",
    oneLine: "AI chips.",
    reading: { chain: "compute", assets: ["compute", "talent"], domain: 0.5, timeDependence: 0.6, phase: "buildout", lab: ["no", "no", "no", "no"], barbell: "mass" },
    why: {
      chain: "Chips: a physical bottleneck with ~75% gross margin.",
      leak: "Fabs, packaging, and supply deals don't leak.",
      gaps: "It's ahead on chips, and TPUs and ASICs are catching up. Different race from models.",
      cycle: "The pick-and-shovel seller of the build-out. Margin normalizes later.",
      lab: "Labs buy from it. Google and Amazon build their own chips.",
      barbell: "Toyota of chips.",
    },
  },
];

export const BLANK: Reading = {
  chain: "apps",
  assets: [],
  domain: 0.5,
  timeDependence: 0.5,
  phase: "application",
  lab: [null, null, null, null],
  barbell: "middle",
};

/* ---------- verdicts ---------- */
export type Outcome = { good: boolean | null; text: string };

export function judge(r: Reading): Record<LensId, Outcome> {
  const rung = CHAIN.find((c) => c.id === r.chain)!;
  const holds = r.assets.filter((a) => !ASSETS.find((x) => x.id === a)!.leaks);
  const answered = r.lab.filter(Boolean).length;
  const yes = r.lab.filter((a) => a === "yes").length;

  return {
    chain: {
      good: rung.state === "scarce" ? true : rung.state === "commodity" ? false : null,
      text:
        rung.state === "scarce"
          ? `${rung.name} is a scarce rung.`
          : rung.state === "commodity"
            ? `${rung.name} is turning into a commodity.`
            : `${rung.name} is contested. It depends on who holds the customer.`,
    },
    leak: {
      good: r.assets.length === 0 ? null : holds.length > 0,
      text:
        r.assets.length === 0
          ? "Pick what it relies on."
          : holds.length > 0
            ? `Holds something that doesn't leak: ${holds.map((h) => ASSETS.find((a) => a.id === h)!.name.toLowerCase()).join(", ")}.`
            : "Everything it relies on leaks.",
    },
    gaps: {
      good: r.domain >= 0.6 ? true : r.domain < 0.3 && r.timeDependence > 0.6 ? false : null,
      text:
        r.domain >= 0.6
          ? "Protected by a domain gap that closes slowly."
          : r.timeDependence > 0.6
            ? "Lives off a time gap that keeps shrinking."
            : "Some protection, not much.",
    },
    cycle: {
      good: r.phase === "application" ? true : r.phase === "buildout" ? false : null,
      text:
        r.phase === "buildout"
          ? "Earns in the build-out. Exposed when the correction comes."
          : r.phase === "application"
            ? "Earns in the application era, which comes next."
            : r.phase === "correction"
              ? "Buys cheap infra in the correction."
              : "A bet on the next paradigm.",
    },
    lab: {
      good: answered < 4 ? null : yes <= 1,
      text: answered < 4 ? "Answer all four." : yes <= 1 ? "Hard for a lab to take." : yes >= 3 ? "A lab can take this spot." : "A window, not a moat.",
    },
    barbell: {
      good: r.barbell === "middle" ? false : true,
      text: r.barbell === "mass" ? "Toyota: mass scale." : r.barbell === "niche" ? "Ferrari: a true niche." : "Stuck in the middle.",
    },
  };
}

export function summary(o: Record<LensId, Outcome>): string {
  const good = Object.values(o).filter((x) => x.good === true).length;
  const bad = Object.values(o).filter((x) => x.good === false).length;
  if (good >= 4) return "Holds scarcity that doesn't leak. The hosts' lenses favor it.";
  if (bad >= 4) return "Its advantages leak or sit in the middle. The lenses say value flows past it.";
  return "Mixed. It has a window, but needs to own something scarce before the window closes.";
}
