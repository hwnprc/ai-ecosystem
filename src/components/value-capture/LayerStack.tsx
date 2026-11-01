"use client";

import { useRef, useState } from "react";
import { LATE_YEAR, LAYERS } from "@/data/valueCapture";
import styles from "./ValueCapture.module.css";

export default function LayerStack({ year }: { year: number }) {
  const [active, setActive] = useState(4); // Applications
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const late = year >= LATE_YEAR;
  const layer = LAYERS[active];
  const status = late ? layer.later : layer.now;

  const move = (to: number) => {
    const next = Math.max(0, Math.min(LAYERS.length - 1, to));
    setActive(next);
    buttons.current[next]?.focus();
  };

  return (
    <section className={styles.sec} aria-labelledby="h-layers">
      <span className={styles.eyebrow}>01</span>
      <h2 id="h-layers" className={styles.h2}>Who keeps the margin on each layer?</h2>
      <p className={styles.lead}>Hover or use the arrow keys. Watch the labels change as the year moves.</p>
      {/* column-reverse puts chips at the bottom, like the map */}
      <div className={styles.stack} role="listbox" aria-label="Layers">
        {LAYERS.map((l, i) => {
          const s = late ? l.later : l.now;
          return (
            <button
              key={l.id}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              role="option"
              aria-selected={i === active}
              className={`${styles.layer} ${i === active ? styles.layerOn : ""}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") { e.preventDefault(); move(i + 1); }
                if (e.key === "ArrowDown") { e.preventDefault(); move(i - 1); }
              }}
            >
              <span>{l.name}</span>
              <span className={`${styles.pill} ${s.winning ? styles.pillOn : ""}`}>{s.label}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.panel} aria-live="polite">
        <div className={styles.panelHead}>
          <h3 className={styles.h3}>{layer.name}</h3>
          <span className={`${styles.pill} ${status.winning ? styles.pillOn : ""}`}>{status.label}</span>
        </div>
        <dl>
          <div><dt>{late ? "By 2030" : "Today"}</dt><dd>{late ? layer.future : layer.today}</dd></div>
          <div><dt>Examples</dt><dd>{layer.examples}</dd></div>
          <div><dt>For your map</dt><dd>{layer.forMap}</dd></div>
        </dl>
      </div>
    </section>
  );
}
