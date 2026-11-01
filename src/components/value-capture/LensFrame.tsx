import type { Lens, Outcome } from "@/data/lenses";
import styles from "./ValueCapture.module.css";

type Props = { index: number; lens: Lens; outcome: Outcome; why: string | null; children: React.ReactNode };

export function Mark({ good }: { good: boolean | null }) {
  return (
    <span className={`${styles.mark} ${good === true ? styles.markGood : good === false ? styles.markBad : ""}`} aria-hidden="true">
      {good === true ? "●" : good === false ? "×" : "◐"}
    </span>
  );
}

export default function LensFrame({ index, lens, outcome, why, children }: Props) {
  return (
    <section className={styles.lens} id={`lens-${lens.id}`} aria-labelledby={`h-${lens.id}`}>
      <div className={styles.lensHead}>
        <span className={styles.eyebrow}>Lens {index} of 6</span>
        <h2 id={`h-${lens.id}`} className={styles.h2}>{lens.title}</h2>
        <p className={styles.question}>{lens.question}</p>
      </div>
      <p className={styles.idea}>{lens.quoteEn}</p>
      <div className={styles.diagram}>{children}</div>
      <div className={styles.outcome} aria-live="polite">
        <Mark good={outcome.good} />
        <div>
          <b>{outcome.text}</b>
          {why && <p className={styles.why}>{why}</p>}
        </div>
      </div>
    </section>
  );
}
