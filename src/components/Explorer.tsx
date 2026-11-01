"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import type { MapData } from "@/lib/data";
import type { CompanyKind } from "@/lib/types";
import LayerMap from "./LayerMap";
import ConnectionsView from "./ConnectionsView";
import CompanyPanel from "./CompanyPanel";
import styles from "./Explorer.module.css";

type View = "map" | "connections";
type Filter = "all" | CompanyKind;

export default function Explorer({ data }: { data: MapData }) {
  const [view, setView] = useState<View>("map");
  const [filter, setFilter] = useState<Filter>("all");
  const [directionId, setDirectionId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const direction = data.directions.find((d) => d.id === directionId) ?? null;
  const company = data.companies.find((c) => c.id === companyId) ?? null;

  // A company is highlighted when it passes the kind filter and belongs to the active direction.
  const isActive = (id: string, kind: CompanyKind) =>
    (filter === "all" || filter === kind) &&
    (!direction || direction.companies.includes(id));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Where is AI heading?</h1>
        <p className={styles.question}>
          What problems are big tech companies and AI startups each solving
          today, and where are they all heading?
        </p>
      </header>

      <div className={styles.controls}>
        <div className={styles.group} role="tablist" aria-label="View">
          {(["map", "connections"] as View[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              className={view === v ? styles.on : ""}
              onClick={() => setView(v)}
            >
              {v === "map" ? "Layer map" : "Connections"}
            </button>
          ))}
        </div>

        <div className={styles.group} aria-label="Company type">
          {(["all", "bigtech", "startup"] as Filter[]).map((f) => (
            <button
              key={f}
              aria-pressed={filter === f}
              className={filter === f ? styles.on : ""}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "bigtech" ? "Big tech" : "Startups"}
            </button>
          ))}
        </div>

        <div className={styles.group} aria-label="Direction">
          {data.directions.map((d) => (
            <button
              key={d.id}
              aria-pressed={directionId === d.id}
              className={directionId === d.id ? styles.onAccent : ""}
              onClick={() => setDirectionId(directionId === d.id ? null : d.id)}
            >
              {d.title}
              {d.status === "guess" && <span className={styles.tag}>guess</span>}
            </button>
          ))}
        </div>
      </div>

      {direction && <p className={styles.directionNote}>{direction.summary}</p>}

      <main className={styles.main}>
        {view === "map" ? (
          <LayerMap
            layers={data.layers}
            companies={data.companies}
            isActive={isActive}
            selectedId={companyId}
            onSelect={setCompanyId}
          />
        ) : (
          <ConnectionsView
            layers={data.layers}
            companies={data.companies}
            directions={data.directions}
            isActive={isActive}
            activeDirectionId={directionId}
            onSelect={setCompanyId}
          />
        )}
      </main>

      <AnimatePresence>
        {company && (
          <CompanyPanel
            key={company.id}
            company={company}
            layer={data.layers.find((l) => l.id === company.layer)!}
            signals={data.signals.filter((s) => s.company === company.id)}
            directions={data.directions.filter((d) =>
              d.companies.includes(company.id),
            )}
            onClose={() => setCompanyId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
