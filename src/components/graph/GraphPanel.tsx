"use client";

import { useState } from "react";
import type { MapData } from "@/lib/data";
import type { Company, Link, LinkType, SignalType } from "@/lib/types";
import { LAYER_STYLE, LINK_DASH, LINK_LABELS, LINK_SHORT, RING_ORDER, linkKey } from "@/lib/graphLayout";
import { NodeMark } from "./RingGraph";
import type { Focus } from "./focus";
import styles from "./Graph.module.css";

type ViewProps = {
  data: MapData;
  onFocus: (f: Focus) => void;
  linkType: LinkType | null; // filter shared with the graph
  setLinkType: (t: LinkType | null) => void;
  setHoverLink: (key: string | null) => void; // lights one arrow on the graph
};

type Props = ViewProps & { focus: Focus };

const SIGNAL_LABELS: Record<SignalType, string> = {
  money: "Money",
  hiring: "Hiring",
  launch: "Launches",
  language: "Language",
};

function kindLabel(c: Company) {
  if (c.kind === "bigtech") return "Big tech";
  return c.stage === "early" ? "Early-stage startup" : "Startup";
}

// The same mark the graph uses: shape and color from the layer, fill from big tech vs startup.
function Mark({ layer, kind, early }: { layer: Company["layer"]; kind: Company["kind"]; early?: boolean }) {
  const st = LAYER_STYLE[layer];
  const size = kind === "bigtech" ? 6.5 : early ? 4.5 : 5.5;
  return (
    <svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true" className={styles.markIcon}>
      <NodeMark shape={st.shape} size={size} color={st.color} fill={kind === "bigtech" ? `${st.color}38` : "var(--graph-node)"} />
    </svg>
  );
}

function Shape({ c }: { c: Company }) {
  return <Mark layer={c.layer} kind={c.kind} early={c.stage === "early"} />;
}

function CompanyRow({ c, sub, onFocus }: { c: Company; sub?: string; onFocus: (f: Focus) => void }) {
  return (
    <li>
      <button className={styles.row} onClick={() => onFocus({ kind: "company", id: c.id })}>
        <Shape c={c} />
        <span>
          {c.name}
          {sub && <span className={styles.rowSub}>{sub}</span>}
        </span>
      </button>
    </li>
  );
}

export default function GraphPanel(props: Props) {
  const { data, focus, onFocus } = props;
  const byId = new Map(data.companies.map((c) => [c.id, c]));
  const layerOf = (id: string) => data.layers.find((l) => l.id === id);

  if (focus.kind === "company") {
    const c = byId.get(focus.id);
    if (c) return <CompanyView key={c.id} c={c} {...props} />;
  }

  if (focus.kind === "layer") {
    const layer = layerOf(focus.id);
    if (layer) {
      const members = data.companies.filter((c) => c.layer === layer.id);
      return (
        <div className={styles.panelBody}>
          <p className={styles.kicker}>Layer {RING_ORDER.indexOf(layer.id) + 1} of 5, counting out from AGI</p>
          <h2>{layer.name}</h2>
          <p>{layer.definition}</p>
          <dl className={styles.states}>
            <dt>Value today</dt>
            <dd>{layer.now.label}</dd>
            <dt>Value later</dt>
            <dd>{layer.heading.label}</dd>
          </dl>
          <p className={styles.muted}>{layer.note}</p>
          <h3>Companies ({members.length})</h3>
          <ul className={styles.list}>
            {members.map((c) => (
              <CompanyRow key={c.id} c={c} sub={kindLabel(c)} onFocus={onFocus} />
            ))}
          </ul>
        </div>
      );
    }
  }

  if (focus.kind === "direction") {
    const d = data.directions.find((x) => x.id === focus.id);
    if (d) {
      const career = data.careers.find((r) => r.direction === d.id);
      return (
        <div className={styles.panelBody}>
          <p className={styles.kicker}>Direction{d.status === "guess" ? " · still a guess" : ""}</p>
          <h2>{d.title}</h2>
          <p>{d.summary}</p>
          <h3>Companies it cuts across</h3>
          <ul className={styles.list}>
            {d.companies.map((id) => {
              const c = byId.get(id);
              return c ? <CompanyRow key={id} c={c} sub={layerOf(c.layer)?.name} onFocus={onFocus} /> : null;
            })}
          </ul>
          {career && (
            <>
              <h3>What it means for my career</h3>
              <p className={styles.muted}>Startup: {career.startup}</p>
              <p className={styles.muted}>Big tech: {career.bigtech}</p>
            </>
          )}
        </div>
      );
    }
  }

  if (focus.kind === "agi") {
    const labs = data.companies.filter((c) => c.layer === "models");
    return (
      <div className={styles.panelBody}>
        <p className={styles.kicker}>The center</p>
        <h2>AGI</h2>
        <p>The direction many AI companies say they are heading: AI that can do most work a person can.</p>
        <p className={styles.muted}>
          Each ring sits at some distance from it. Model labs are closest. Infrastructure, chips, and energy feed
          them. Applications sit on the outside and turn progress into products.
        </p>
        <h3>Racing toward it directly</h3>
        <ul className={styles.list}>
          {labs.map((c) => (
            <CompanyRow key={c.id} c={c} sub={kindLabel(c)} onFocus={onFocus} />
          ))}
        </ul>
      </div>
    );
  }

  // Home: what this is, the directions to explore, and how to read the picture.
  const sourced = data.links.filter((l) => l.source).length;
  const toCheck = data.links.filter((l) => l.confidence && l.confidence !== "high").length;
  return (
    <div className={styles.panelBody}>
      <h2>Where is AI heading?</h2>
      <p className={styles.muted}>
        What problems are big tech companies and AI startups each solving today, and where are they all heading?
      </p>

      <h3>Directions</h3>
      <div className={styles.chips}>
        {data.directions.map((d) => (
          <button key={d.id} className={styles.chip} onClick={() => onFocus({ kind: "direction", id: d.id })}>
            {d.title}
          </button>
        ))}
      </div>

      <h3>Layers, from AGI out</h3>
      <ul className={styles.list}>
        {RING_ORDER.map((id) => {
          const l = layerOf(id);
          if (!l) return null;
          return (
            <li key={id}>
              <button className={styles.row} onClick={() => onFocus({ kind: "layer", id })}>
                <Mark layer={id} kind="startup" />
                <span>
                  {l.name}
                  <span className={styles.rowSub}>{l.definition}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <h3>How to read it</h3>
      <p className={styles.note}>
        AGI is in the center. Each ring is one layer, with its own shape and color. Arrows show how companies connect across layers.
        Click any company, ring name, or the center.
      </p>
      <ul className={styles.legend}>
        <li>
          <Mark layer="models" kind="bigtech" /> Big tech: large and tinted
        </li>
        <li>
          <Mark layer="models" kind="startup" /> Startup: white
        </li>
        <li>
          <Mark layer="models" kind="startup" early /> Early-stage startup: small
        </li>
        {(Object.keys(LINK_LABELS) as Link["type"][]).map((t) => (
          <li key={t}>
            <svg width="28" height="8" aria-hidden="true">
              <line x1="0" y1="4" x2="28" y2="4" strokeDasharray={LINK_DASH[t]} className={styles.legendLine} />
            </svg>
            {LINK_LABELS[t].out}
          </li>
        ))}
      </ul>
      <p className={styles.note}>
        {data.companies.length} companies and {data.links.length} links. {sourced} links have a source. {toCheck}{" "}
        are marked &quot;to check&quot;.
      </p>
    </div>
  );
}

// Where a source link points, shown instead of a bare "Source".
function siteOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function CompanyView({ c, data, onFocus, linkType, setLinkType, setHoverLink }: { c: Company } & ViewProps) {
  const [tab, setTab] = useState<"signals" | "connected">("connected");
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const byId = new Map(data.companies.map((x) => [x.id, x]));
  const layer = data.layers.find((l) => l.id === c.layer);
  const signals = data.signals.filter((s) => s.company === c.id).sort((a, b) => b.date.localeCompare(a.date));
  const directions = data.directions.filter((d) => d.companies.includes(c.id));

  const mine = data.links.filter((l) => (l.from === c.id || l.to === c.id) && byId.has(l.from) && byId.has(l.to));
  const counts = new Map<LinkType, number>();
  for (const l of mine) counts.set(l.type, (counts.get(l.type) ?? 0) + 1);
  const shown = linkType ? mine.filter((l) => l.type === linkType) : mine;

  // Group by how each link reads from this company's side, e.g. "Backed by", "Runs on".
  // Newest first inside a group. Groups follow the order of LINK_LABELS.
  const groups = new Map<string, { other: Company; link: Link }[]>();
  for (const t of Object.keys(LINK_LABELS) as LinkType[]) {
    for (const dir of ["out", "in"] as const) {
      const items = shown
        .filter((l) => l.type === t && (dir === "out" ? l.from === c.id : l.to === c.id && l.from !== c.id))
        .map((l) => ({ link: l, other: byId.get(dir === "out" ? l.to : l.from)! }))
        .sort((a, b) => (b.link.date ?? "").localeCompare(a.link.date ?? ""));
      if (items.length === 0) continue;
      const label = LINK_LABELS[t][dir];
      groups.set(label, [...(groups.get(label) ?? []), ...items]);
    }
  }
  const toggle = (label: string) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  return (
    <div className={styles.panelBody}>
      <p className={styles.kicker}>
        {layer?.name} · {kindLabel(c)}
        {c.tag ? ` · ${c.tag}` : ""}
      </p>
      <h2>{c.name}</h2>
      <p>{c.problem}</p>
      {!c.verified && <p className={styles.note}>Not yet checked by hand.</p>}

      <div className={styles.tabs} role="tablist">
        <button role="tab" aria-selected={tab === "connected"} onClick={() => setTab("connected")}>
          Who&apos;s connected? <span className={styles.count}>{mine.length}</span>
        </button>
        <button role="tab" aria-selected={tab === "signals"} onClick={() => setTab("signals")}>
          News <span className={styles.count}>{signals.length}</span>
        </button>
      </div>

      {tab === "connected" ? (
        <>
          {mine.length === 0 && <p className={styles.note}>No links logged yet.</p>}
          {mine.length > 0 && (
            <div className={styles.filters} role="group" aria-label="Filter by link type">
              <button aria-pressed={linkType === null} onClick={() => setLinkType(null)}>
                All <span className={styles.count}>{mine.length}</span>
              </button>
              {(Object.keys(LINK_SHORT) as LinkType[])
                .filter((t) => counts.has(t))
                .map((t) => (
                  <button key={t} aria-pressed={linkType === t} onClick={() => setLinkType(linkType === t ? null : t)}>
                    <svg width="16" height="6" aria-hidden="true">
                      <line x1="0" y1="3" x2="16" y2="3" strokeDasharray={LINK_DASH[t]} className={styles.legendLine} />
                    </svg>
                    {LINK_SHORT[t]} <span className={styles.count}>{counts.get(t)}</span>
                  </button>
                ))}
            </div>
          )}
          {[...groups].map(([label, items]) => {
            const open = !closed.has(label);
            return (
              <section key={label} className={styles.group}>
                <button className={styles.groupHead} aria-expanded={open} onClick={() => toggle(label)}>
                  <span>{label}</span>
                  <span className={styles.count}>{items.length}</span>
                  <span className={styles.caret} aria-hidden="true">
                    {open ? "−" : "+"}
                  </span>
                </button>
                {open && (
                  <ul className={styles.list}>
                    {items.map(({ other, link }) => (
                      <li
                        key={linkKey(link)}
                        className={styles.linkRow}
                        onMouseEnter={() => setHoverLink(linkKey(link))}
                        onMouseLeave={() => setHoverLink(null)}
                      >
                        <div className={styles.linkTop}>
                          <button className={styles.row} onClick={() => onFocus({ kind: "company", id: other.id })}>
                            <Shape c={other} />
                            <span>{other.name}</span>
                          </button>
                          {link.date && <time className={styles.date}>{link.date.slice(0, 7)}</time>}
                        </div>
                        <p className={styles.linkNote}>
                          {link.note}{" "}
                          {link.source ? (
                            <a href={link.source} target="_blank" rel="noopener noreferrer">
                              {siteOf(link.source)} ↗
                            </a>
                          ) : (
                            "(No source yet.)"
                          )}
                          {link.confidence && link.confidence !== "high" && (
                            <span className={styles.check} title={link.check ?? "Reported by one outlet. Worth checking."}>
                              to check
                            </span>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
          {directions.length > 0 && (
            <section>
              <h3>Shares a direction</h3>
              <div className={styles.chips}>
                {directions.map((d) => (
                  <button key={d.id} className={styles.chip} onClick={() => onFocus({ kind: "direction", id: d.id })}>
                    {d.title}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      ) : signals.length === 0 ? (
        <p className={styles.note}>No news logged yet.</p>
      ) : (
        <ul className={styles.list}>
          {signals.map((s) => (
            <li key={s.source + s.date} className={styles.linkRow}>
              <div className={styles.linkTop}>
                <span className={styles.signalType}>{SIGNAL_LABELS[s.type]}</span>
                <time className={styles.date}>{s.date}</time>
              </div>
              <p className={styles.signalText}>
                {s.summary}{" "}
                <a href={s.source} target="_blank" rel="noopener noreferrer">
                  {siteOf(s.source)} ↗
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
