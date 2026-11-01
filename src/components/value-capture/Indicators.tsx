"use client";

import { useState } from "react";
import { INDICATORS } from "@/data/valueCapture";
import styles from "./ValueCapture.module.css";

export default function Indicators() {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section className={styles.sec} aria-labelledby="h-ind">
      <span className={styles.eyebrow}>Signals to watch</span>
      <h2 id="h-ind" className={styles.h2}>Seven indicators, as read on 23 Oct</h2>
      <p className={styles.lead}>Tap one to open it.</p>
      <div className={styles.indicators}>
        {INDICATORS.map((d, i) => (
          <button key={d.name} className={styles.indicator} aria-expanded={open.has(i)} onClick={() => toggle(i)}>
            <span className={styles.indicatorTop}>
              <span>
                <span className={`${styles.plus} ${open.has(i) ? styles.plusOpen : ""}`}>+</span> {d.name}
              </span>
              <span className={styles.pill}>{d.reading}</span>
            </span>
            {open.has(i) && <span className={styles.indicatorDetail}>{d.detail}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
