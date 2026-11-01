import { LENSES, type LensId, type Outcome } from "@/data/lenses";
import { Mark } from "./LensFrame";
import styles from "./ValueCapture.module.css";

/** Sticky strip: the company name and one mark per lens. Click a mark to jump. */
export default function Scorecard({ name, outcomes }: { name: string; outcomes: Record<LensId, Outcome> }) {
  return (
    <nav className={styles.scorecard} aria-label="Lens results">
      <span className={styles.scoreName}>{name}</span>
      <span className={styles.scoreMarks}>
        {LENSES.map((l, i) => (
          <a key={l.id} href={`#lens-${l.id}`} title={`${i + 1}. ${l.title}: ${outcomes[l.id].text}`}>
            <Mark good={outcomes[l.id].good} />
            <span className={styles.scoreLabel}>{l.title}</span>
          </a>
        ))}
        <a href="#verdict" className={styles.scoreVerdict}>Verdict ↓</a>
      </span>
    </nav>
  );
}
