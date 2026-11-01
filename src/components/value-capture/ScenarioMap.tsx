"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  GAP_MAX,
  GAP_THRESHOLD,
  OCT_READING,
  RATIO_MAX,
  RATIO_MIN,
  SCENARIOS,
  scenarioFor,
  type ScenarioId,
} from "@/data/valueCapture";
import styles from "./ValueCapture.module.css";

const toX = (gap: number) => (gap / GAP_MAX) * 100;
const toY = (ratio: number) => (1 - (ratio - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100;

/** Grid order: top row is "revenue beats costs", left column is "gap closes". */
const QUADS: { id: ScenarioId; classes: string[] }[] = [
  { id: "S1", classes: [styles.quadTop, styles.quadLeft] },
  { id: "S3", classes: [styles.quadTop, styles.quadRight] },
  { id: "S2", classes: [styles.quadLeft] },
  { id: "S4", classes: [styles.quadRight] },
];

export default function ScenarioMap() {
  const [gap, setGap] = useState(OCT_READING.gap);
  const [ratio, setRatio] = useState(OCT_READING.ratio);
  const dragging = useRef(false);
  const active = scenarioFor(gap, ratio);

  const moveTo = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const fy = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setGap(Math.round(fx * GAP_MAX * 2) / 2);
    setRatio(Number((RATIO_MAX - fy * (RATIO_MAX - RATIO_MIN)).toFixed(2)));
  };

  return (
    <section className={styles.sec} aria-labelledby="h-scn">
      <span className={styles.eyebrow}>Scenarios</span>
      <h2 id="h-scn" className={styles.h2}>Where could the next three years go?</h2>
      <p className={styles.lead}>Drag the dot. Two numbers decide the scenario. The odds are the author&apos;s personal guess.</p>
      <div
        className={styles.plane}
        aria-hidden="true"
        style={{
          gridTemplateColumns: `${toX(GAP_THRESHOLD)}% 1fr`,
          gridTemplateRows: `${toY(1)}% 1fr`,
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          moveTo(e);
        }}
        onPointerMove={(e) => dragging.current && moveTo(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {QUADS.map((q) => (
          <div key={q.id} className={[styles.quad, ...q.classes, q.id === active && styles.quadOn].filter(Boolean).join(" ")}>
            <span className={styles.odds}>{SCENARIOS[q.id].odds}</span>
            <b>
              {q.id} · {SCENARIOS[q.id].name}
            </b>
          </div>
        ))}
        <span className={styles.ghost} style={{ left: `${toX(OCT_READING.gap)}%`, top: `${toY(OCT_READING.ratio)}%` }} />
        <span className={styles.dot} style={{ left: `${toX(gap)}%`, top: `${toY(ratio)}%` }} />
      </div>
      <div className={styles.sliders}>
        <label htmlFor="gap">
          Open vs. frontier gap <span>{Number(gap.toFixed(1))} months</span>
        </label>
        <input id="gap" className={styles.range} type="range" min={0} max={GAP_MAX} step={0.5} value={gap} onChange={(e) => setGap(Number(e.target.value))} />
        <label htmlFor="ratio">
          Paid revenue ÷ depreciation and interest <span>{ratio.toFixed(2)}×</span>
        </label>
        <input id="ratio" className={styles.range} type="range" min={RATIO_MIN} max={RATIO_MAX} step={0.01} value={ratio} onChange={(e) => setRatio(Number(e.target.value))} />
      </div>
      <div className={styles.note} aria-live="polite">
        <b>
          {active} · {SCENARIOS[active].name}.
        </b>{" "}
        {SCENARIOS[active].text}{" "}
        <span className={styles.dim}>In every scenario, spread businesses lose and operators with real-world signals survive.</span>
      </div>
      <button
        className={styles.reset}
        onClick={() => {
          setGap(OCT_READING.gap);
          setRatio(OCT_READING.ratio);
        }}
      >
        Back to the 23 Oct reading
      </button>
    </section>
  );
}
