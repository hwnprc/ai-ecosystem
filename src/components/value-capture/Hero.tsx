import Link from "next/link";
import { LATE_YEAR } from "@/data/valueCapture";
import { lerp, progress } from "./progress";
import styles from "./ValueCapture.module.css";

export default function Hero({ year }: { year: number }) {
  const t = progress(year);
  const late = year >= LATE_YEAR;
  return (
    <header className={styles.hero}>
      <span className={styles.eyebrow}>
        <Link href="/" className={styles.back}>← Map</Link> · 23 Oct 2026
      </span>
      <h1 className={styles.h1}>Value goes to scarcity that does not leak.</h1>
      <p className={styles.lead}>
        A reading of the AI Frontier deck &quot;가치는 어디로 가는가&quot; for the US AI ecosystem map. Drag the year at the
        top. The whole page moves with it.
      </p>
      <div className={styles.twin}>
        <div className={styles.scar}>
          <b>Physical bottlenecks</b>
          <span>Power, land, HBM, packaging, chips.</span>
          <div className={styles.gauge}>
            <i className={styles.gaugeFill} style={{ width: `${lerp(80, 45, t)}%` }} />
          </div>
          <small>{late ? "Still scarce, but power gets regulated." : "Pays now, during the build-out."}</small>
        </div>
        <div className={styles.scar}>
          <b>Operation signals</b>
          <span>Outcomes that only show up in real life. Did they buy again?</span>
          <div className={styles.gauge}>
            <i className={styles.gaugeFill} style={{ width: `${lerp(12, 85, t)}%` }} />
          </div>
          <small>{late ? "Where most of the margin lands." : "Small today. Pays after the build-out."}</small>
        </div>
      </div>
      <p className={styles.leakline}>
        <strong>Everything else leaks.</strong> Open models trail the frontier by about 4 months. The same capability
        gets about 10x cheaper each year.
      </p>
    </header>
  );
}
