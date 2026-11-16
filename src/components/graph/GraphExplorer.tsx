"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapData } from "@/lib/data";
import type { LinkType } from "@/lib/types";
import { layoutGraph } from "@/lib/graphLayout";
import RingGraph from "./RingGraph";
import ViewSwitch from "../ViewSwitch";
import GraphPanel, { Mark } from "./GraphPanel";
import { HOME, focusToParam, paramToFocus, sameFocus, type Focus } from "./focus";
import { buildTour, type TourStep } from "./tour";
import styles from "./Graph.module.css";

type History = { stack: Focus[]; at: number };

export default function GraphExplorer({ data }: { data: MapData }) {
  const { rings, nodes } = useMemo(() => layoutGraph(data.layers, data.companies), [data]);
  const [history, setHistory] = useState<History>({ stack: [HOME], at: 0 });
  const focus = history.stack[history.at];
  const [linkType, setLinkType] = useState<LinkType | null>(null);
  const [hoverLink, setHoverLink] = useState<string | null>(null);
  // Only links of the chosen type count, on the graph and in the panel.
  const links = useMemo(
    () => (linkType ? data.links.filter((l) => l.type === linkType) : data.links),
    [data.links, linkType],
  );

  // The guided tour: a few findings, one step at a time. null = not touring.
  const steps = useMemo(() => buildTour(data, nodes), [data, nodes]);
  const [tourAt, setTourAt] = useState<number | null>(null);
  const step = tourAt === null ? null : steps[tourAt];

  // Open the view named in the URL, if any. "?tour=1" opens the tour at its first step.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t = Number(q.get("tour"));
    if (t >= 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL only works after mount
      setTourAt(Math.min(t, steps.length) - 1);
      return;
    }
    const start = paramToFocus(q.get("n"));
    if (start.kind !== "home") setHistory({ stack: [HOME, start], at: 1 });
  }, [steps.length]);

  // Keep the URL in step so a view can be shared.
  useEffect(() => {
    const p = focusToParam(focus);
    const url =
      tourAt !== null ? `?tour=${tourAt + 1}` : p ? `?n=${encodeURIComponent(p)}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [focus, tourAt]);

  const go = useCallback((f: Focus) => {
    setLinkType(null);
    setHoverLink(null);
    setHistory((h) => {
      if (sameFocus(h.stack[h.at], f)) return h;
      const stack = [...h.stack.slice(0, h.at + 1), f];
      return { stack, at: stack.length - 1 };
    });
  }, []);
  const startTour = () => {
    setLinkType(null);
    setHoverLink(null);
    setHistory((h) => ({ stack: [...h.stack.slice(0, h.at + 1), HOME], at: h.at + 1 }));
    setTourAt(0);
  };
  const exitTour = useCallback(() => setTourAt(null), []);
  const nextStep = useCallback(
    () => setTourAt((i) => (i === null ? i : i + 1 < steps.length ? i + 1 : null)),
    [steps.length],
  );
  const prevStep = useCallback(() => setTourAt((i) => (i === null ? i : Math.max(0, i - 1))), []);

  // Arrow keys move through the tour. Escape leaves it.
  useEffect(() => {
    if (tourAt === null) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.tagName === "INPUT" || t?.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") nextStep();
      else if (e.key === "ArrowLeft") prevStep();
      else if (e.key === "Escape") exitTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourAt, nextStep, prevStep, exitTour]);

  const back = () => {
    setLinkType(null);
    setHistory((h) => ({ ...h, at: Math.max(0, h.at - 1) }));
  };
  const forward = () => {
    setLinkType(null);
    setHistory((h) => ({ ...h, at: Math.min(h.stack.length - 1, h.at + 1) }));
  };

  // Which companies stay bright for the current view.
  const lit = useMemo<Set<string> | null>(() => {
    switch (focus.kind) {
      case "home":
        return null;
      case "agi":
        return new Set(data.companies.filter((c) => c.layer === "models").map((c) => c.id));
      case "layer":
        return new Set(data.companies.filter((c) => c.layer === focus.id).map((c) => c.id));
      case "direction":
        return new Set(data.directions.find((d) => d.id === focus.id)?.companies ?? []);
      case "company": {
        const ids = new Set([focus.id]);
        for (const l of links) {
          if (l.from === focus.id) ids.add(l.to);
          if (l.to === focus.id) ids.add(l.from);
        }
        return ids;
      }
    }
  }, [focus, data, links]);

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
    <div className={`${styles.page} ${step ? styles.touring : ""}`}>
      {step && tourAt !== null ? (
        <aside className={styles.panel}>
          <TourCard
            step={step}
            at={tourAt}
            count={steps.length}
            onBack={prevStep}
            onNext={nextStep}
            onExit={exitTour}
            onJump={setTourAt}
          />
        </aside>
      ) : (
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
          <GraphPanel
            data={data}
            focus={focus}
            onFocus={go}
            linkType={linkType}
            setLinkType={setLinkType}
            setHoverLink={setHoverLink}
          />
        </div>
      </aside>
      )}

      <section className={styles.stage}>
        {!step && (
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
        )}

        <RingGraph
          rings={rings}
          nodes={nodes}
          links={step ? data.links : links}
          focus={step ? HOME : focus}
          lit={step ? step.lit : lit}
          hoverLink={step ? null : hoverLink}
          tour={step}
          onFocus={(f) => {
            // During the tour, a stray click on the background does nothing. A company opens it.
            if (step && f.kind === "home") return;
            if (step) setTourAt(null);
            go(f);
          }}
        />

        {!step && (
          <>
            <button className={styles.tourButton} onClick={startTour}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 1.5 L10.5 6 L3 10.5 Z" fill="currentColor" />
              </svg>
              Take the tour
            </button>
            <ViewSwitch current="graph" className={styles.switch} />
          </>
        )}
      </section>
    </div>
  );
}

// Search every company by name, problem, or layer. Arrow keys move, Enter opens, "/" focuses.
function Search({ data, onPick }: { data: MapData; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const layerName = useMemo(
    () => new Map(data.layers.map((l) => [l.id, l.name.replace(/ \(.*\)$/, "")])),
    [data.layers],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "/" && t?.tagName !== "INPUT" && t?.tagName !== "TEXTAREA") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const score = (c: MapData["companies"][number]) => {
      const name = c.name.toLowerCase();
      if (name.startsWith(term)) return 0;
      if (name.split(/[\s(]+/).some((w) => w.startsWith(term))) return 1;
      if (name.includes(term)) return 2;
      if (c.problem.toLowerCase().includes(term) || (c.tag ?? "").toLowerCase().includes(term)) return 3;
      if ((layerName.get(c.layer) ?? "").toLowerCase().includes(term)) return 4;
      return 9;
    };
    return data.companies
      .map((c) => ({ c, s: score(c) }))
      .filter((h) => h.s < 9)
      .sort((a, b) => a.s - b.s || a.c.name.localeCompare(b.c.name))
      .slice(0, 12)
      .map((h) => h.c);
  }, [q, data.companies, layerName]);

  const pick = (id: string) => {
    onPick(id);
    setQ("");
    setOpen(false);
    input.current?.blur();
  };

  return (
    <div className={styles.search}>
      <label className={styles.searchBox}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <input
          ref={input}
          value={q}
          placeholder={`Search ${data.companies.length} companies`}
          aria-label="Search companies"
          role="combobox"
          aria-expanded={open && q.trim() !== ""}
          aria-controls="company-results"
          onChange={(e) => {
            setQ(e.target.value);
            setAt(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAt((i) => Math.min(hits.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAt((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && hits[at]) {
              pick(hits[at].id);
            } else if (e.key === "Escape") {
              setQ("");
              setOpen(false);
              input.current?.blur();
            }
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {!q && <kbd aria-hidden="true">/</kbd>}
      </label>
      {open && q.trim() !== "" && (
        <ul className={styles.searchResults} id="company-results" role="listbox">
          {hits.length === 0 && <li className={styles.searchEmpty}>No company matches &ldquo;{q.trim()}&rdquo;.</li>}
          {hits.map((c, i) => (
            <li key={c.id}>
              <button
                role="option"
                aria-selected={i === at}
                onMouseEnter={() => setAt(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c.id)}
              >
                <Mark layer={c.layer} kind={c.kind} small={c.tier === "wide"} />
                <span>
                  <span className={styles.searchName}>{c.name}</span>
                  <span className={styles.searchSub}>
                    {layerName.get(c.layer)} · {c.problem}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// The caption card for one tour step, with Back / Next / Exit.
function TourCard({
  step,
  at,
  count,
  onBack,
  onNext,
  onExit,
  onJump,
}: {
  step: TourStep;
  at: number;
  count: number;
  onBack: () => void;
  onNext: () => void;
  onExit: () => void;
  onJump: (i: number) => void;
}) {
  const last = at === count - 1;
  return (
    <div className={styles.tourCard} role="region" aria-label="Guided tour" aria-live="polite">
      <div className={styles.tourHead}>
        <span className={styles.kicker}>
          Guided tour · {at + 1} of {count}
        </span>
        <button className={styles.tourExit} onClick={onExit} aria-label="Exit the tour">
          ✕
        </button>
      </div>
      <div key={step.id} className={styles.tourText}>
        <h2>{step.title}</h2>
        {step.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <div className={styles.tourNav}>
        <div className={styles.tourDots}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === at ? "step" : undefined}
              onClick={() => onJump(i)}
            />
          ))}
        </div>
        <button onClick={onBack} disabled={at === 0}>
          Back
        </button>
        <button className={styles.tourNext} onClick={onNext}>
          {last ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
