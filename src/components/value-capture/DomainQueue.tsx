"use client";

import { useState } from "react";
import { ZONES } from "@/data/valueCapture";
import styles from "./ValueCapture.module.css";

export default function DomainQueue({ year }: { year: number }) {
  const [selected, setSelected] = useState("Physical work");
  const all = ZONES.flatMap((z) => z.domains);
  const isTaken = (takenIn: number | null) => takenIn !== null && year >= takenIn;
  const taken = all.filter((d) => isTaken(d.takenIn)).length;
  const current = all.find((d) => d.name === selected)!;

  let when: string;
  if (current.takenIn === null) when = "Still open in 2030.";
  else if (isTaken(current.takenIn)) when = `Labs reach it around ${Math.floor(current.takenIn)}.`;
  else when = `Window open until about ${Math.floor(current.takenIn)}.`;

  return (
    <section className={styles.sec} aria-labelledby="h-queue">
      <span className={styles.eyebrow}>02</span>
      <h2 id="h-queue" className={styles.h2}>Which domains will the big labs take next?</h2>
      <p className={styles.lead}>
        In {Math.floor(year)}, labs have reached {taken} of {all.length} domains. Crossed-out means a lab can now do it.
      </p>
      <div className={styles.queue}>
        {ZONES.map((z) => (
          <div key={z.title} className={styles.zone}>
            <header>
              <b>{z.title}</b>
              <small>{z.subtitle}</small>
            </header>
            <div className={styles.chips}>
              {z.domains.map((d) => (
                <button
                  key={d.name}
                  aria-pressed={d.name === selected}
                  className={[styles.chip, d.name === selected && styles.chipOn, isTaken(d.takenIn) && styles.chipGone]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelected(d.name)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.arrow}>
        <span>Labs arrive first</span>
        <span>Startup window lasts longer →</span>
      </div>
      <div className={styles.note} aria-live="polite">
        <b>{current.name}.</b> {current.note} <span className={styles.dim}>{when}</span>
      </div>
      <p className={styles.caption}>The deck gives the order, not dates. Years here are illustrative.</p>
    </section>
  );
}
