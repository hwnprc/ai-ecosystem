import { ASSETS, type Asset } from "@/data/lenses";
import type { LensProps } from "../ValueCapture";
import styles from "../ValueCapture.module.css";

function Vessel({ leaks }: { leaks: boolean }) {
  return (
    <svg viewBox="0 0 40 48" className={styles.vessel} aria-hidden="true">
      <path d="M6 6 L34 6 L30 34 L10 34 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d={leaks ? "M10.6 22 L29.4 22 L30 34 L10 34 Z" : "M8.4 14 L31.6 14 L30 34 L10 34 Z"} fill="currentColor" opacity="0.85" />
      {leaks ? (
        <g className={styles.drips} fill="currentColor">
          <circle cx="20" cy="39" r="1.6" />
          <circle cx="20" cy="45" r="1.2" />
        </g>
      ) : (
        <path d="M4 6 L36 6" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}

/** Four kinds of advantage. Two leak, two don't. Tick what the company relies on. */
export default function LeakLens({ reading, onChange }: LensProps) {
  const toggle = (a: Asset) =>
    onChange({
      ...reading,
      assets: reading.assets.includes(a) ? reading.assets.filter((x) => x !== a) : [...reading.assets, a],
    });
  return (
    <div>
      <p className={styles.hint}>Tick what it relies on.</p>
      <div className={styles.tiles}>
        {ASSETS.map((a) => {
          const on = reading.assets.includes(a.id);
          return (
            <button
              key={a.id}
              role="checkbox"
              aria-checked={on}
              className={`${styles.tile} ${on ? styles.tileOn : ""}`}
              onClick={() => toggle(a.id)}
            >
              <Vessel leaks={a.leaks} />
              <b>{a.name}</b>
              <small>{a.leaks ? "Leaks" : "Doesn't leak"} · {a.how}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
