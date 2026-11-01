// Market-level content for the "Zoom out" part of /value-capture: the seven
// indicators and four scenarios from the AI Frontier deck "Value Capture in AI Market Dynamics"
// (Chester, 23 Oct 2026). Figures are as reported in the deck and have not been
// checked against original sources.

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
