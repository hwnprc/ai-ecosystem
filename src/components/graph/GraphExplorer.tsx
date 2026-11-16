"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MapData } from "@/lib/data";
import { layoutGraph } from "@/lib/graphLayout";
import RingGraph from "./RingGraph";
import GraphPanel from "./GraphPanel";
import { HOME, focusToParam, paramToFocus, sameFocus, type Focus } from "./focus";
import styles from "./Graph.module.css";

type History = { stack: Focus[]; at: number };

export default function GraphExplorer({ data }: { data: MapData }) {
  const { rings, nodes } = useMemo(() => layoutGraph(data.layers, data.companies), [data]);
  const [history, setHistory] = useState<History>({ stack: [HOME], at: 0 });
  const focus = history.stack[history.at];

  // Open the view named in the URL, if any.
  useEffect(() => {
    const start = paramToFocus(new URLSearchParams(window.location.search).get("n"));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL only works after mount
    if (start.kind !== "home") setHistory({ stack: [HOME, start], at: 1 });
  }, []);

  // Keep the URL in step so a view can be shared.
  useEffect(() => {
    const p = focusToParam(focus);
    const url = p ? `?n=${encodeURIComponent(p)}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [focus]);

  const go = useCallback((f: Focus) => {
    setHistory((h) => {
      if (sameFocus(h.stack[h.at], f)) return h;
      const stack = [...h.stack.slice(0, h.at + 1), f];
      return { stack, at: stack.length - 1 };
    });
  }, []);
  const back = () => setHistory((h) => ({ ...h, at: Math.max(0, h.at - 1) }));
  const forward = () => setHistory((h) => ({ ...h, at: Math.min(h.stack.length - 1, h.at + 1) }));

  // Which companies stay bright for the current view.
  const lit = useMemo<Set<string> | null>(() => {
    switch (focus.kind) {
      case "home":
        return null;
      case "customer":
        return new Set(data.companies.filter((c) => c.layer === "applications").map((c) => c.id));
      case "layer":
        return new Set(data.companies.filter((c) => c.layer === focus.id).map((c) => c.id));
      case "direction":
        return new Set(data.directions.find((d) => d.id === focus.id)?.companies ?? []);
      case "company": {
        const ids = new Set([focus.id]);
        for (const l of data.links) {
          if (l.from === focus.id) ids.add(l.to);
          if (l.to === focus.id) ids.add(l.from);
        }
        return ids;
      }
    }
  }, [focus, data]);

  // Breadcrumb: AI ecosystem / layer / company
  const crumbs: { label: string; to: Focus }[] = [];
  if (focus.kind === "company") {
    const c = data.companies.find((x) => x.id === focus.id);
    const l = data.layers.find((x) => x.id === c?.layer);
    if (l) crumbs.push({ label: l.name.replace(/ \(.*\)$/, ""), to: { kind: "layer", id: l.id } });
  } else if (focus.kind === "direction") {
    crumbs.push({ label: "Directions", to: HOME });
  }

  return (
    <div className={styles.page}>
      <aside className={styles.panel}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <button onClick={() => go(HOME)}>AI ecosystem</button>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className={styles.sep}>/</span>
              <button onClick={() => go(c.to)}>{c.label}</button>
            </span>
          ))}
        </nav>
        <div className={styles.panelCard}>
          <GraphPanel data={data} focus={focus} onFocus={go} />
        </div>
      </aside>

      <section className={styles.stage}>
        <div className={styles.topbar}>
          <Search data={data} onPick={(id) => go({ kind: "company", id })} />
          <div className={styles.arrows}>
            <button onClick={back} disabled={history.at === 0} aria-label="Back">
              ‹
            </button>
            <button onClick={forward} disabled={history.at === history.stack.length - 1} aria-label="Forward">
              ›
            </button>
          </div>
        </div>

        <RingGraph rings={rings} nodes={nodes} links={data.links} focus={focus} lit={lit} onFocus={go} />

        <div className={styles.switch}>
          <span className={styles.switchOn}>Graph</span>
          <Link href="/">Layer map</Link>
        </div>
      </section>
    </div>
  );
}

function Search({ data, onPick }: { data: MapData; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const hits = q.trim()
    ? data.companies.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : [];
  const pick = (id: string) => {
    onPick(id);
    setQ("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button className={styles.searchBtn} onClick={() => setOpen(true)} aria-label="Search companies">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    );
  }
  return (
    <div className={styles.search}>
      <input
        autoFocus
        value={q}
        placeholder="Search companies"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && hits[0]) pick(hits[0].id);
          if (e.key === "Escape") setOpen(false);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {hits.length > 0 && (
        <ul>
          {hits.map((c) => (
            <li key={c.id}>
              <button onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c.id)}>
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
