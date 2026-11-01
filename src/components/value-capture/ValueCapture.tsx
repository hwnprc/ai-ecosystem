"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { END_YEAR, START_YEAR } from "@/data/valueCapture";
import YearBar from "./YearBar";
import Hero from "./Hero";
import LayerStack from "./LayerStack";
import DomainQueue from "./DomainQueue";
import StartupTest from "./StartupTest";
import MarginBars from "./MarginBars";
import Indicators from "./Indicators";
import ScenarioMap from "./ScenarioMap";
import styles from "./ValueCapture.module.css";

/** Years the play button advances per second. */
const PLAY_SPEED = 0.6;

/**
 * The page owns one piece of shared state: the year (2026 to 2030).
 * Every section reads it, so dragging the year bar moves the whole page.
 */
export default function ValueCapture() {
  const [year, setYear] = useState(START_YEAR);
  const [playing, setPlaying] = useState(false);
  const frame = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setYear(END_YEAR);
      return;
    }
    let current = year >= END_YEAR ? START_YEAR : year;
    let last = performance.now();
    setPlaying(true);
    const step = (now: number) => {
      current = Math.min(END_YEAR, current + ((now - last) / 1000) * PLAY_SPEED);
      last = now;
      setYear(current);
      if (current >= END_YEAR) {
        stop();
        return;
      }
      frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }, [year, stop]);

  useEffect(() => stop, [stop]);

  return (
    <div className={styles.page}>
      <YearBar
        year={year}
        playing={playing}
        onYear={(y) => {
          stop();
          setYear(y);
        }}
        onTogglePlay={() => (playing ? stop() : play())}
      />
      <main className={styles.wrap}>
        <Hero year={year} />
        <LayerStack year={year} />
        <DomainQueue year={year} />
        <StartupTest year={year} />
        <MarginBars year={year} />
        <Indicators />
        <ScenarioMap />
        <footer className={styles.foot}>
          <b>Read with care</b>
          <ul>
            <li>This is one person&apos;s thesis from a Korean VC-style podcast. The author says his odds rest on thin data.</li>
            <li>Many numbers come from one fast news week (Reuters, FT, ORTEX, UBS, SemiAnalysis). Check each against its original source before it goes on the map.</li>
            <li>The deck is about finance and big players. It says little about early-stage startups, so the YC data still has to fill that gap.</li>
          </ul>
          <span>
            Sources: AI Frontier deck &quot;가치는 어디로 가는가&quot; (Chester, 23 Oct 2026, 57 slides) and the AI Frontier
            Korea episode transcript (recorded 24 Oct 2026).
          </span>
        </footer>
      </main>
    </div>
  );
}
