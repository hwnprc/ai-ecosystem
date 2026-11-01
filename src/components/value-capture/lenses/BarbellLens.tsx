import type { Barbell } from "@/data/lenses";
import type { LensProps } from "../ValueCapture";
import styles from "../ValueCapture.module.css";

const SPOTS: { id: Barbell; x: number; title: string; sub: string }[] = [
  { id: "mass", x: 90, title: "Toyota", sub: "Mass scale: a frontier lab" },
  { id: "middle", x: 300, title: "The middle", sub: "Squeezed from both sides" },
  { id: "niche", x: 510, title: "Ferrari", sub: "True niche: owns an operation loop" },
];

/** A barbell: weight at both ends, nothing in the middle. Click where the company sits. */
export default function BarbellLens({ reading, onChange }: LensProps) {
  return (
    <svg viewBox="0 0 600 200" className={styles.plot} role="radiogroup" aria-label="Toyota or Ferrari">
      <line x1="60" y1="70" x2="540" y2="70" className={styles.bar} />
      <rect x="40" y="30" width="36" height="80" className={styles.weight} />
      <rect x="80" y="40" width="22" height="60" className={styles.weight} />
      <rect x="524" y="30" width="36" height="80" className={styles.weight} />
      <rect x="498" y="40" width="22" height="60" className={styles.weight} />
      {SPOTS.map((s) => {
        const on = reading.barbell === s.id;
        return (
          <g
            key={s.id}
            role="radio"
            aria-checked={on}
            aria-label={s.title}
            tabIndex={0}
            className={styles.band}
            onClick={() => onChange({ ...reading, barbell: s.id })}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange({ ...reading, barbell: s.id })}
          >
            <rect x={s.x - 95} y="0" width="190" height="200" fill="transparent" />
            {on && <circle cx={s.x} cy="70" r="11" className={styles.point} />}
            {!on && <circle cx={s.x} cy="70" r="6" className={styles.slot} />}
            <text x={s.x} y="145" textAnchor="middle" className={on ? styles.bandLabelOn : styles.bandLabel}>{s.title}</text>
            <text x={s.x} y="165" textAnchor="middle" className={styles.tick}>{s.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}
