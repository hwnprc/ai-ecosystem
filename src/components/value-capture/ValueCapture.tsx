"use client";

import { useState } from "react";
import Link from "next/link";
import { BLANK, COMPANIES, LENSES, judge, type LensId, type Reading } from "@/data/lenses";
import LensFrame from "./LensFrame";
import ChainLens from "./lenses/ChainLens";
import LeakLens from "./lenses/LeakLens";
import GapsLens from "./lenses/GapsLens";
import CycleLens from "./lenses/CycleLens";
import LabLens from "./lenses/LabLens";
import BarbellLens from "./lenses/BarbellLens";
import Verdict from "./Verdict";
import Scorecard from "./Scorecard";
import ScenarioMap from "./ScenarioMap";
import Indicators from "./Indicators";
import styles from "./ValueCapture.module.css";

export type LensProps = { reading: Reading; onChange: (r: Reading) => void };

const LENS_VIEWS: Record<LensId, (p: LensProps) => React.ReactNode> = {
  chain: ChainLens,
  leak: LeakLens,
  gaps: GapsLens,
  cycle: CycleLens,
  lab: LabLens,
  barbell: BarbellLens,
};

/**
 * One task: pick a company, run it through the six lenses the AI Frontier
 * hosts use, and see where value goes. Every lens is editable, so the reader
 * can disagree with a reading and watch the verdict change.
 */
export default function ValueCapture() {
  const [companyId, setCompanyId] = useState<string>(COMPANIES[0].id);
  const [readings, setReadings] = useState<Record<string, Reading>>(() =>
    Object.fromEntries([...COMPANIES.map((c) => [c.id, c.reading]), ["custom", BLANK]]),
  );
  const [customName, setCustomName] = useState("");

  const company = COMPANIES.find((c) => c.id === companyId) ?? null;
  const name = company ? company.name : customName.trim() || "Your startup";
  const reading = readings[companyId];
  const outcomes = judge(reading);
  const setReading = (r: Reading) => setReadings({ ...readings, [companyId]: r });
  const edited = company !== null && JSON.stringify(reading) !== JSON.stringify(company.reading);

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>
            <Link href="/" className={styles.back}>← Map</Link> · AI Frontier Korea, 24 Oct 2026
          </span>
          <h1 className={styles.h1}>Think like the hosts.</h1>
          <p className={styles.lead}>
            Pick a company. Run it through the six lenses 노정석 and 박종현 use to judge where AI value goes. You can
            change any answer if you disagree.
          </p>
        </header>

        <div className={styles.picker} role="tablist" aria-label="Company">
          {COMPANIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={c.id === companyId}
              className={`${styles.pick} ${c.id === companyId ? styles.pickOn : ""}`}
              onClick={() => setCompanyId(c.id)}
            >
              <b>{c.name}</b>
              <small>{c.oneLine}</small>
            </button>
          ))}
          <button
            role="tab"
            aria-selected={companyId === "custom"}
            className={`${styles.pick} ${companyId === "custom" ? styles.pickOn : ""}`}
            onClick={() => setCompanyId("custom")}
          >
            <b>+ Your own</b>
            <small>Start blank.</small>
          </button>
        </div>
        {companyId === "custom" && (
          <input
            className={styles.nameField}
            placeholder="Name the company"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            aria-label="Company name"
          />
        )}

        <Scorecard name={name} outcomes={outcomes} />

        {LENSES.map((lens, i) => {
          const View = LENS_VIEWS[lens.id];
          return (
            <LensFrame
              key={lens.id}
              index={i + 1}
              lens={lens}
              outcome={outcomes[lens.id]}
              why={company && !edited ? company.why[lens.id] : null}
            >
              <View reading={reading} onChange={setReading} />
            </LensFrame>
          );
        })}

        <Verdict
          name={name}
          outcomes={outcomes}
          edited={edited}
          onReset={company ? () => setReading(company.reading) : undefined}
        />

        <div className={styles.zoomHead}>
          <span className={styles.eyebrow}>Zoom out</span>
          <h2 className={styles.h2}>The whole market</h2>
          <p className={styles.lead}>The same hosts&apos; view of where the market as a whole could go.</p>
        </div>
        <ScenarioMap />
        <Indicators />

        <footer className={styles.foot}>
          <b>Read with care</b>
          <ul>
            <li>The six lenses are the hosts&apos;. The company readings are this project&apos;s own use of them, not the hosts&apos; views.</li>
            <li>Figures come from the deck and one fast news week. Check each against its original source before it goes on the map.</li>
          </ul>
          <span>
            Sources: AI Frontier Korea episode (recorded 24 Oct 2026) and the deck &quot;가치는 어디로 가는가&quot; (Chester, 23
            Oct 2026).
          </span>
        </footer>
      </main>
    </div>
  );
}
