"use client";

import { useState } from "react";
import type { MapData } from "@/lib/data";
import type { Company, Link, SignalType } from "@/lib/types";
import { LAYER_STYLE, LINK_DASH, LINK_LABELS, RING_ORDER } from "@/lib/graphLayout";
import { NodeMark } from "./RingGraph";
import type { Focus } from "./focus";
import styles from "./Graph.module.css";

type Props = {
  data: MapData;
  focus: Focus;
  onFocus: (f: Focus) => void;
};

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

export default function GraphPanel({ data, focus, onFocus }: Props) {
  const byId = new Map(data.companies.map((c) => [c.id, c]));
  const layerOf = (id: string) => data.layers.find((l) => l.id === id);

  if (focus.kind === "company") {
    const c = byId.get(focus.id);
    if (c) return <CompanyView key={c.id} c={c} data={data} onFocus={onFocus} />;
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
  const sourced = data.links.filter((l) => l.verified).length;
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
        {data.companies.length} companies and {data.links.length} links. {sourced} of the links are checked
        against sources so far.
      </p>
    </div>
  );
}

function CompanyView({ c, data, onFocus }: { c: Company; data: MapData; onFocus: (f: Focus) => void }) {
  const [tab, setTab] = useState<"signals" | "connected">("connected");
  const byId = new Map(data.companies.map((x) => [x.id, x]));
  const layer = data.layers.find((l) => l.id === c.layer);
  const signals = data.signals.filter((s) => s.company === c.id);
  const directions = data.directions.filter((d) => d.companies.includes(c.id));

  // Group this company's links by how they read from its side.
  const groups = new Map<string, { other: Company; link: Link }[]>();
  for (const l of data.links) {
    const out = l.from === c.id;
    if (!out && l.to !== c.id) continue;
    const other = byId.get(out ? l.to : l.from);
    if (!other) continue;
    const label = out ? LINK_LABELS[l.type].out : LINK_LABELS[l.type].in;
    groups.set(label, [...(groups.get(label) ?? []), { other, link: l }]);
  }

  return (
    <div className={styles.panelBody}>
      <p className={styles.kicker}>
        {layer?.name} · {kindLabel(c)}
        {c.tag ? ` · ${c.tag}` : ""}
      </p>
      <h2>{c.name}</h2>
      <p>{c.problem}</p>
      {!c.verified && <p className={styles.note}>Not yet checked against sources.</p>}

      <div className={styles.tabs} role="tablist">
        <button role="tab" aria-selected={tab === "connected"} onClick={() => setTab("connected")}>
          Who&apos;s connected?
        </button>
        <button role="tab" aria-selected={tab === "signals"} onClick={() => setTab("signals")}>
          Signals
        </button>
      </div>

      {tab === "connected" ? (
        <>
          {groups.size === 0 && <p className={styles.note}>No links logged yet.</p>}
          {[...groups].map(([label, items]) => (
            <section key={label}>
              <h3>{label}</h3>
              <ul className={styles.list}>
                {items.map(({ other, link }) => (
                  <li key={other.id + link.type}>
                    <button className={styles.row} onClick={() => onFocus({ kind: "company", id: other.id })}>
                      <Shape c={other} />
                      <span>{other.name}</span>
                    </button>
                    <p className={styles.linkNote}>
                      {link.note}{" "}
                      {link.source ? (
                        <a href={link.source} target="_blank" rel="noopener noreferrer">
                          Source
                        </a>
                      ) : (
                        "(No source yet.)"
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
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
      ) : (
        (Object.keys(SIGNAL_LABELS) as SignalType[]).map((type) => {
          const list = signals.filter((s) => s.type === type);
          return (
            <section key={type}>
              <h3>{SIGNAL_LABELS[type]}</h3>
              {list.length === 0 ? (
                <p className={styles.note}>No signals logged yet.</p>
              ) : (
                <ul className={styles.list}>
                  {list.map((s) => (
                    <li key={s.source + s.date} className={styles.signal}>
                      <time>{s.date}</time> {s.summary}{" "}
                      <a href={s.source} target="_blank" rel="noopener noreferrer">
                        Source
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
