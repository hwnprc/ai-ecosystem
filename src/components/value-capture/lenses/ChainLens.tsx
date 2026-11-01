import { CHAIN } from "@/data/lenses";
import type { LensProps } from "../ValueCapture";
import styles from "../ValueCapture.module.css";

const LABEL = { scarce: "scarce", contested: "contested", commodity: "commodity" } as const;

/**
 * The stack from the deck: energy at the bottom, the consumer on top.
 * Up the stack = closer to the person paying = more value capture.
 * Click a layer to place the company.
 */
export default function ChainLens({ reading, onChange }: LensProps) {
  return (
    <div className={styles.chainWrap}>
      <div className={styles.chain} role="radiogroup" aria-label="Where it sits in the value chain">
        <div className={styles.consumer}>Consumer · 소비자</div>
        {CHAIN.map((rung) => {
          const on = reading.chain === rung.id;
          return (
            <button
              key={rung.id}
              role="radio"
              aria-checked={on}
              className={`${styles.rung} ${rung.id === "apps" ? styles.rungTall : ""} ${on ? styles.rungOn : ""}`}
              onClick={() => onChange({ ...reading, chain: rung.id })}
            >
              <span className={styles.rungName}>
                {rung.name}
                <small>{rung.note}</small>
              </span>
              <span className={`${styles.rungTag} ${rung.state === "scarce" ? styles.tagScarce : rung.state === "commodity" ? styles.tagCommodity : ""}`}>
                {LABEL[rung.state]}
              </span>
              {on && <span className={styles.here}>● here</span>}
            </button>
          );
        })}
      </div>
      <div className={styles.chainArrows} aria-hidden="true">
        <div className={styles.arrowUp}>
          <span>Closer to the person paying</span>
          <b>= value capture ↑</b>
        </div>
        <div className={styles.arrowDown}>
          <span>Infra players keep 10% at most</span>
          <small>AWS 35%</small>
          <b>Low margin</b>
        </div>
      </div>
    </div>
  );
}
