import { MARGINS } from "@/data/valueCapture";
import { lerp, progress } from "./progress";
import styles from "./ValueCapture.module.css";

export default function MarginBars({ year }: { year: number }) {
  const t = progress(year);
  return (
    <section className={styles.sec} aria-labelledby="h-margin">
      <span className={styles.eyebrow}>04</span>
      <h2 id="h-margin" className={styles.h2}>As tokens get cheaper, who gains?</h2>
      <p className={styles.lead}>Whoever prices per outcome keeps the falling token cost as margin.</p>
      <div className={styles.bars}>
        {MARGINS.map((m) => (
          <div key={m.name} className={styles.bar}>
            <span className={styles.barLabel}>{m.name}</span>
            <div className={styles.track}>
              <i className={styles.gaugeFill} style={{ width: `${lerp(m.now, m.later, t)}%` }} />
            </div>
            <span className={styles.barValue}>{t < 0.5 ? m.nowLabel : m.laterLabel}</span>
          </div>
        ))}
      </div>
      <p className={styles.caption}>
        Today: chip gross margin about 75%, lab inference margin about 70%. Everything else shows direction only.
      </p>
    </section>
  );
}
