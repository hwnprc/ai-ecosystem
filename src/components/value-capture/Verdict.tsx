import { LENSES, summary, type LensId, type Outcome } from "@/data/lenses";
import { Mark } from "./LensFrame";
import styles from "./ValueCapture.module.css";

type Props = { name: string; outcomes: Record<LensId, Outcome>; edited: boolean; onReset?: () => void };

export default function Verdict({ name, outcomes, edited, onReset }: Props) {
  return (
    <section className={styles.verdict} id="verdict" aria-labelledby="h-verdict">
      <span className={styles.eyebrow}>Verdict</span>
      <h2 id="h-verdict" className={styles.h2}>{name}</h2>
      <p className={styles.verdictLine}>{summary(outcomes)}</p>
      <ol className={styles.verdictList}>
        {LENSES.map((l) => (
          <li key={l.id}>
            <Mark good={outcomes[l.id].good} />
            <span className={styles.dim}>{l.title}</span>
            <span>{outcomes[l.id].text}</span>
          </li>
        ))}
      </ol>
      {edited && onReset && (
        <button className={styles.reset} onClick={onReset}>
          You changed some answers. Reset to the original reading
        </button>
      )}
    </section>
  );
}
