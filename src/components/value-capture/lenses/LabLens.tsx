import { LAB_QUESTIONS } from "@/data/lenses";
import type { LensProps } from "../ValueCapture";
import styles from "../ValueCapture.module.css";

/** Each "yes" moves the lab closer to the company. */
export default function LabLens({ reading, onChange }: LensProps) {
  const yes = reading.lab.filter((a) => a === "yes").length;
  const gap = 100 - yes * 22;
  return (
    <div>
      <div className={styles.approach} aria-hidden="true">
        <span className={styles.labDot} style={{ left: `${100 - gap}%` }}>Lab</span>
        <span className={styles.approachTrack} />
        <span className={styles.coDot}>It</span>
      </div>
      <div className={styles.labQs}>
        {LAB_QUESTIONS.map((q, i) => (
          <div key={q} className={styles.labQ}>
            <span>{q}</span>
            <span className={styles.yesNo} role="group" aria-label={q}>
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={reading.lab[i] === v}
                  className={`${styles.chip} ${reading.lab[i] === v ? styles.chipOn : ""}`}
                  onClick={() => onChange({ ...reading, lab: reading.lab.map((a, j) => (j === i ? v : a)) })}
                >
                  {v === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </span>
          </div>
        ))}
      </div>
      <p className={styles.caption}>Labs come in three ways: buy the data, become the operator, or simulate the signal away.</p>
    </div>
  );
}
