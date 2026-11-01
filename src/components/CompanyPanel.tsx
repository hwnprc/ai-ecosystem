"use client";

import { motion } from "motion/react";
import type { Company, Direction, Layer, Signal, SignalType } from "@/lib/types";
import styles from "./CompanyPanel.module.css";

const SIGNAL_LABELS: Record<SignalType, string> = {
  money: "Money",
  hiring: "Hiring",
  launch: "Launches",
  language: "Language",
};

type Props = {
  company: Company;
  layer: Layer;
  signals: Signal[];
  directions: Direction[];
  onClose: () => void;
};

export default function CompanyPanel({ company, layer, signals, directions, onClose }: Props) {
  return (
    <motion.aside
      className={styles.panel}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      aria-label={`${company.name} details`}
    >
      <button className={styles.close} onClick={onClose} aria-label="Close">
        ×
      </button>
      <p className={styles.kicker}>
        {layer.name} · {company.kind === "bigtech" ? "Big tech" : company.stage === "early" ? "Early-stage startup" : "Startup"}
      </p>
      <h2>{company.name}</h2>
      <p className={styles.problem}>{company.problem}</p>
      {!company.verified && <p className={styles.unverified}>Not yet checked against sources.</p>}

      {(Object.keys(SIGNAL_LABELS) as SignalType[]).map((type) => {
        const list = signals.filter((s) => s.type === type);
        return (
          <section key={type} className={styles.section}>
            <h3>{SIGNAL_LABELS[type]}</h3>
            {list.length === 0 ? (
              <p className={styles.empty}>No signals logged yet.</p>
            ) : (
              <ul>
                {list.map((s) => (
                  <li key={s.source + s.date}>
                    <time>{s.date}</time> {s.summary}{" "}
                    <a href={s.source} target="_blank" rel="noopener noreferrer">
                      Source
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {directions.length > 0 && (
        <section className={styles.section}>
          <h3>Part of these directions</h3>
          <ul>
            {directions.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
          </ul>
        </section>
      )}
    </motion.aside>
  );
}
