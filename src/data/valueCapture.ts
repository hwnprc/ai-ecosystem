// Content for /value-capture: a reading of the AI Frontier deck
// "가치는 어디로 가는가" (Chester, 23 Oct 2026). All figures are as reported
// in the deck and have not been checked against original sources.

export const START_YEAR = 2026;
export const END_YEAR = 2030;
/** The page switches layer text from "today" to "by 2030" at this year. */
export const LATE_YEAR = 2028;

export type Status = { label: string; winning: boolean };

export type Layer = {
  id: string;
  name: string;
  now: Status;
  later: Status;
  today: string;
  future: string;
  examples: string;
  forMap: string;
};

export const LAYERS: Layer[] = [
  {
    id: "compute",
    name: "Compute and chips",
    now: { label: "Physical scarcity", winning: true },
    later: { label: "Normalizing", winning: false },
    today:
      "Chip gross margin is about 75%. Power is the strongest moat. Contracts are priced in gigawatts, because chips get swapped every two years but power stays.",
    future:
      "Margin normalizes as work spreads to ASICs and TPUs. Power still matters, but it will become regulated.",
    examples: "Nvidia, Broadcom, TPU and Trainium programs, power and site owners.",
    forMap: "Tag power, land, and packaging companies as physical bottlenecks.",
  },
  {
    id: "cloud",
    name: "Cloud",
    now: { label: "Spread business", winning: false },
    later: { label: "Loses in every scenario", winning: false },
    today:
      "Neoclouds borrow to buy GPUs and rent them out. CoreWeave has a $104B backlog but needs about $35B of new debt a year. Its 5-year CDS spread hit 1,195bp on 15 Oct.",
    future:
      "Likely end is acquisition or debt restructuring around 2027 to 2028. The GPUs keep running. The middleman's equity disappears.",
    examples: "CoreWeave, Lambda, Crusoe, Nebius. Hyperscalers sit safer, with more cash.",
    forMap: "Show where each cloud company sits, from cash-rich to refinancing-dependent.",
  },
  {
    id: "models",
    name: "Foundation models",
    now: { label: "Frontier premium", winning: true },
    later: { label: "Utility", winning: false },
    today:
      "The two big labs rent their compute. Only xAI owns its own. Anthropic's S-1 shows $450B of non-cancellable compute commitments. Growth slowed from +147% to +45%.",
    future:
      "Two or three labs become utilities. They compete on cheapest intelligence per watt and try per-outcome pricing, like Claude Code per task or seat.",
    examples: "Anthropic, OpenAI, Google, xAI. Open near-frontier labs win on ownership, such as sovereign AI.",
    forMap: "Mark labs as utility-bound unless the gap stays open.",
  },
  {
    id: "tools",
    name: "Infrastructure and tools",
    now: { label: "Cost fight", winning: false },
    later: { label: "Squeezed", winning: false },
    today: "Inference platforms compete with the labs on cost. API resellers have near-zero margin.",
    future: 'The deck calls moving from GPUs to inference "not an escape, just a move." Labs win the cost fight.',
    examples: "Together, Fireworks, Baseten.",
    forMap: "Flag tool startups whose only edge is price or routing.",
  },
  {
    id: "apps",
    name: "Applications",
    now: { label: "Not here yet", winning: false },
    later: { label: "Wins if it owns the outcome", winning: true },
    today:
      "Spending is very concentrated. The top 1% of users bring 20% of revenue and only 4.5% pay. No AI-native winner yet in shopping, social, or entertainment.",
    future:
      "Biggest winner of price deflation, if the app defines and checks the outcome. B2B builds loops inside a customer's operations. B2C owns the checkout.",
    examples: "Palantir-style forward-deployed engineering in B2B. Vertical agents that close the sale in B2C.",
    forMap: "Your main startup layer. Tag each app by whether it owns an outcome signal.",
  },
  {
    id: "physical",
    name: "Physical AI",
    now: { label: "Physical scarcity", winning: true },
    later: { label: "Strongest position", winning: true },
    today: "Physical and regulated work is last in the labs' queue, because the data cannot be bought.",
    future:
      "The setup the deck fully backs: compute, model, and a physical operation in one company. Driving and launch data do not exist outside the operation.",
    examples: "Tesla, xAI, SpaceX. Lab-owned wet labs like Periodic Labs and Lila.",
    forMap: "Look for startups that run the physical operation themselves.",
  },
];

export type Domain = {
  name: string;
  /** Illustrative year a lab reaches it. The deck gives order only. null = still open in 2030. */
  takenIn: number | null;
  note: string;
};

export type Zone = { title: string; subtitle: string; domains: Domain[] };

export const ZONES: Zone[] = [
  {
    title: "Closed",
    subtitle: "verifiable, digital",
    domains: [
      { name: "Coding", takenIn: 2026, note: "Closed without buying data. An open model came within about 6 weeks of Opus 5.5 on a coding-agent benchmark." },
      { name: "Math", takenIn: 2026, note: "Verifiable and digital. The deck says these domains are already past AGI level." },
      { name: "Physics", takenIn: 2026, note: "Verifiable and digital, so labs reached it early." },
    ],
  },
  {
    title: "Closing",
    subtitle: "labs buy expert data",
    domains: [
      { name: "Finance", takenIn: 2027.3, note: "Labs hire experts to build training environments. The signal is buyable, so the gap closes." },
      { name: "Law", takenIn: 2027.6, note: "Legal documents can be judged on screen by a third party. That makes the signal buyable." },
      { name: "Biology (digital)", takenIn: 2028.5, note: "Closed sector by sector with purchased data. Slower than coding." },
    ],
  },
  {
    title: "Open",
    subtitle: "data can't be bought",
    domains: [
      { name: "Physical work", takenIn: null, note: "Repairs, factories, logistics. The outcome only shows in the real world over time." },
      { name: "Wet-lab bio", takenIn: 2029.6, note: "Labs try to become the operator here, like Periodic Labs and Lila. A fragmented operator market is the defense." },
      { name: "Regulated domains", takenIn: null, note: "License and liability block labs from operating. Big, slow, messy. The mess is the moat." },
    ],
  },
];

export type Answer = "yes" | "no" | null;

export const QUESTIONS: { question: string; hint: string }[] = [
  { question: "Can the label exist outside the operation?", hint: "Could a third party judge the result on a screen?" },
  { question: "Can a lab become the operator itself?", hint: "Physical work, liability, or licenses block this." },
  { question: "Can simulation replace the real signal?", hint: "Images could be judged and synthesized, so Midjourney lost ground." },
  { question: "Is the operator market easy to buy up?", hint: "Fragmented markets, or partners too big to swallow, are safer." },
];

export const PRESETS: { name: string; answers: Answer[] }[] = [
  { name: "AI contract review", answers: ["yes", "no", "yes", "yes"] },
  { name: "Image generator", answers: ["yes", "yes", "yes", "yes"] },
  { name: "API reseller", answers: ["yes", "yes", "yes", "yes"] },
  { name: "Hospital outcome loop", answers: ["no", "no", "no", "no"] },
  { name: "Robot repair fleet", answers: ["no", "no", "no", "yes"] },
];

/** Bar lengths are relative. Only the chip and lab "now" values are reported figures. */
export const MARGINS = [
  { name: "Chips", now: 75, later: 45, nowLabel: "gross margin ~75%", laterLabel: "normalizing" },
  { name: "Labs", now: 70, later: 35, nowLabel: "inference margin ~70%", laterLabel: "utility pricing" },
  { name: "Search ads", now: 55, later: 30, nowLabel: "intent margin", laterLabel: "shrinking" },
  { name: "Neoclouds", now: 20, later: 5, nowLabel: "thin and levered", laterLabel: "near zero" },
  { name: "Operators with signal", now: 12, later: 80, nowLabel: "small", laterLabel: "biggest gain" },
];

export const INDICATORS = [
  { name: "Spot vs. contract GPU price", reading: "Not yet", detail: "The price war starts the day 1-year reserved prices for the newest chips begin to fall. CoreWeave raised prices 25% in July and 10% in October." },
  { name: "Payback period", reading: "Watch", detail: "Longer payback is a correction signal. CoreWeave about 2.5 years. SpaceX about 1 year." },
  { name: "Paid revenue vs. depreciation + interest", reading: "Leaning worse", detail: "Separates a local correction from a shake-out. Meta free cash flow was -$2.1B. Hyperscaler capex is about 100% of operating cash flow (UBS)." },
  { name: "Open vs. frontier gap", reading: "Closing", detail: "Over 12 months means a few labs keep a monopoly. Now about 4 months overall and about 6 weeks in coding." },
  { name: "Domains outside coding with clear success criteria", reading: "No reading", detail: "Shows where the operator era starts. A good number for your map to count." },
  { name: "Per-outcome vs. per-token revenue share", reading: "No reading", detail: "Shows who keeps the margin. More per-task or per-seat pricing means value is moving up." },
  { name: "First sign of self-improving AI", reading: "Not yet", detail: "A new frontier model that is smaller yet better. If it comes before 2027 to 2028, labs win bigger. Proxy for now: METR task length." },
];

export type ScenarioId = "S1" | "S2" | "S3" | "S4";

export const SCENARIOS: Record<ScenarioId, { name: string; odds: string; text: string }> = {
  S1: { name: "Local correction", odds: "~50%", text: "Only marginal builders get cleaned up. Infra becomes a utility. Value moves to operators." },
  S3: { name: "Intelligence oligopoly", odds: "10–20%", text: "Two or three labs keep a capability premium for a long time. The correction stays small." },
  S2: { name: "Credit crunch", odds: "~25%", text: "Debt vehicles unwind and parent companies restructure. Operators then build on cheap infra, sooner than in S1." },
  S4: { name: "Single winner", odds: "<10%", text: "Only the lab with the cheapest capital survives. The most destructive case." },
};

/** Scenario axes. Gap in months (12+ means the gap stays open); ratio of paid revenue to depreciation plus interest (1+ means revenue wins). */
export const GAP_MAX = 18;
export const GAP_THRESHOLD = 12;
export const RATIO_MIN = 0.5;
export const RATIO_MAX = 1.5;
/** The author's 23 Oct reading, placed by hand. */
export const OCT_READING = { gap: 4, ratio: 1.05 };

export function scenarioFor(gap: number, ratio: number): ScenarioId {
  if (ratio >= 1) return gap < GAP_THRESHOLD ? "S1" : "S3";
  return gap < GAP_THRESHOLD ? "S2" : "S4";
}
