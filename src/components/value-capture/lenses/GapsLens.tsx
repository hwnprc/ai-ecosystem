"use client";

import { useRef } from "react";
import { COMPANIES } from "@/data/lenses";
import type { LensProps } from "../ValueCapture";
import styles from "../ValueCapture.module.css";

const W = 600;
const H = 340;
const PAD = { l: 44, r: 16, t: 16, b: 52 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;
const x = (d: number) => PAD.l + d * PW;
const y = (t: number) => PAD.t + (1 - t) * PH;

const DOMAINS = [
  { at: 0.05, name: "Coding" },
  { at: 0.3, name: "Finance, law" },
  { at: 0.55, name: "Bio" },
  { at: 0.85, name: "Physical, regulated" },
];

/** Drag the dot. Left = domains labs already closed. Up = only safe while ahead of followers. */
export default function GapsLens({ reading, onChange }: LensProps) {
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const move = (clientX: number, clientY: number) => {
    const r = svg.current!.getBoundingClientRect();
    const sx = ((clientX - r.left) / r.width) * W;
    const sy = ((clientY - r.top) / r.height) * H;
    const domain = Math.min(1, Math.max(0, (sx - PAD.l) / PW));
    const timeDependence = Math.min(1, Math.max(0, 1 - (sy - PAD.t) / PH));
    onChange({ ...reading, domain: Number(domain.toFixed(2)), timeDependence: Number(timeDependence.toFixed(2)) });
  };

  return (
    <div>
      <p className={styles.hint}>Drag the dot. Grey dots are the other companies.</p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className={styles.plot}
        role="img"
        aria-label={`Domain ${Math.round(reading.domain * 100)} of 100, time-gap dependence ${Math.round(reading.timeDependence * 100)} of 100`}
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          move(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => dragging.current && move(e.clientX, e.clientY)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* zones */}
        <rect x={x(0)} y={y(1)} width={x(0.3) - x(0)} height={PH} className={styles.zoneBad} />
        <rect x={x(0.6)} y={y(1)} width={x(1) - x(0.6)} height={PH} className={styles.zoneGood} />
        <text x={x(0.15)} y={y(0.93)} textAnchor="middle" className={styles.zoneText}>Labs are here</text>
        <text x={x(0.8)} y={y(0.93)} textAnchor="middle" className={styles.zoneText}>Domain gap protects</text>
        {/* axes */}
        <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(0)} className={styles.axisLine} />
        <line x1={x(0)} y1={y(0)} x2={x(0)} y2={y(1)} className={styles.axisLine} />
        {DOMAINS.map((d) => (
          <text key={d.name} x={x(d.at)} y={y(0) + 20} textAnchor="middle" className={styles.tick}>{d.name}</text>
        ))}
        <text x={x(0.5)} y={H - 6} textAnchor="middle" className={styles.axisText}>Domain gap: closes fast → closes slowly</text>
        <text transform={`translate(14 ${y(0.5)}) rotate(-90)`} textAnchor="middle" className={styles.axisText}>Needs to stay ahead →</text>
        {/* others */}
        {COMPANIES.filter(
          (c) => c.reading.domain !== reading.domain || c.reading.timeDependence !== reading.timeDependence,
        ).map((c) => {
          const right = c.reading.domain > 0.7;
          return (
            <g key={c.id} className={styles.ghostPoint}>
              <circle cx={x(c.reading.domain)} cy={y(c.reading.timeDependence)} r="4" />
              <text
                x={x(c.reading.domain) + (right ? -8 : 8)}
                y={y(c.reading.timeDependence) + 4}
                textAnchor={right ? "end" : "start"}
              >
                {c.name}
              </text>
            </g>
          );
        })}
        <circle cx={x(reading.domain)} cy={y(reading.timeDependence)} r="16" className={styles.halo} />
        <circle cx={x(reading.domain)} cy={y(reading.timeDependence)} r="8" className={styles.point} />
      </svg>
      <p className={styles.caption}>Time gap today: about 4 months overall, about 6 weeks in coding.</p>
    </div>
  );
}
