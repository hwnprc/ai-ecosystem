import { AI_NOW, PHASES } from "@/data/lenses";
import type { LensProps } from "../ValueCapture";
import styles from "../ValueCapture.module.css";

const W = 600;
const H = 240;
const T = 20;
const B = 180;
const seg = W / PHASES.length;

// Infra spending: rises, overshoots, falls back. App value: flat, then takes off.
const infra = `M0 ${B} C ${seg * 0.6} ${B - 10}, ${seg * 0.8} ${T + 10}, ${seg * 1.05} ${T + 20} S ${seg * 1.6} ${B - 50}, ${seg * 2.2} ${B - 60} S ${W} ${B - 70}, ${W} ${B - 70}`;
const apps = `M0 ${B - 4} C ${seg * 1.2} ${B - 6}, ${seg * 1.8} ${B - 20}, ${seg * 2.3} ${B - 90} S ${seg * 3.1} ${T + 10}, ${W} ${T}`;

/** The pattern the hosts borrow from railroads, telecom, and mobile. Click the phase where the company earns. */
export default function CycleLens({ reading, onChange }: LensProps) {
  return (
    <div>
      <p className={styles.hint}>Click the phase where it makes its money.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.plot} role="radiogroup" aria-label="Phase of the cycle">
        {PHASES.map((p, i) => {
          const on = reading.phase === p.id;
          return (
            <g
              key={p.id}
              role="radio"
              aria-checked={on}
              aria-label={p.name}
              tabIndex={0}
              className={styles.band}
              onClick={() => onChange({ ...reading, phase: p.id })}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange({ ...reading, phase: p.id })}
            >
              <rect x={i * seg} y={0} width={seg} height={B} className={on ? styles.bandOn : styles.bandOff} />
              <text x={i * seg + seg / 2} y={B + 22} textAnchor="middle" className={on ? styles.bandLabelOn : styles.bandLabel}>
                {p.name}
              </text>
              <text x={i * seg + seg / 2} y={B + 40} textAnchor="middle" className={styles.tick}>
                {p.past}
              </text>
            </g>
          );
        })}
        <path d={infra} className={styles.lineInfra} />
        <path d={apps} className={styles.lineApps} />
        <text x={seg * 1.1} y={T + 10} className={styles.lineLabel}>Infra spending</text>
        <text x={W - 6} y={T + 24} textAnchor="end" className={styles.lineLabel}>App value</text>
        <line x1={W * AI_NOW} y1={T - 8} x2={W * AI_NOW} y2={B} className={styles.nowLine} />
        <text x={W * AI_NOW - 6} y={T + 6} textAnchor="end" className={styles.nowText}>AI is here</text>
      </svg>
      <p className={styles.caption}>The hosts place AI at the tail end of the build-out. Investors usually lose at the correction. Builders on top gain.</p>
    </div>
  );
}
