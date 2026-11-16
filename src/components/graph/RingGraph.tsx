"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useMotionValueEvent, useSpring } from "motion/react";
import type { Link } from "@/lib/types";
import {
  CENTER_R,
  HUB_COLOR,
  LAYER_STYLE,
  LINK_DASH,
  VIEW,
  edgeHalves,
  rotationToBottom,
  starburst,
  linkKey,
  type NodeShape,
  type PlacedNode,
  type Ring,
} from "@/lib/graphLayout";
import type { Focus } from "./focus";
import styles from "./Graph.module.css";

type Props = {
  rings: Ring[];
  nodes: PlacedNode[];
  links: Link[];
  focus: Focus;
  lit: Set<string> | null; // company ids to keep bright; null = everything
  hoverLink: string | null; // one link to pick out, from hovering its row in the panel
  onFocus: (f: Focus) => void;
};

// Show every name while the map is small. Past this, names appear on hover or when lit.
const LABEL_ALL_UNDER = 40;

const markerId = (color: string) => `arrow-${color.slice(1)}`;

export function NodeMark({ shape, size, color, fill }: { shape: NodeShape; size: number; color: string; fill: string }) {
  const common = { fill, stroke: color, strokeWidth: 1.6, className: styles.mark };
  const s = size;
  switch (shape) {
    case "circle":
      return <circle r={s} {...common} />;
    case "diamond":
      return <rect x={-s * 0.8} y={-s * 0.8} width={s * 1.6} height={s * 1.6} rx={2} transform="rotate(45)" {...common} />;
    case "square":
      return <rect x={-s} y={-s} width={s * 2} height={s * 2} rx={3} {...common} />;
    case "hexagon": {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const t = (Math.PI / 3) * i;
        return `${(s * Math.cos(t)).toFixed(1)},${(s * Math.sin(t)).toFixed(1)}`;
      }).join(" ");
      return <polygon points={pts} {...common} />;
    }
    case "triangle":
      return <polygon points={`0,${-s * 1.15} ${s},${s * 0.7} ${-s},${s * 0.7}`} strokeLinejoin="round" {...common} />;
  }
}

export default function RingGraph({ rings, nodes, links, focus, lit, hoverLink, onFocus }: Props) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Turn the whole graph so the selected company sits at the bottom, like a dial.
  const target = useRef(0);
  const rotation = useSpring(0, { stiffness: 70, damping: 20 });
  useEffect(() => {
    if (focus.kind !== "company") return;
    const node = byId.get(focus.id);
    if (!node) return;
    target.current = rotationToBottom(node.angle, target.current);
    rotation.set(target.current);
  }, [focus, byId, rotation]);
  // Write the angle straight onto the SVG, so a turn does not re-render React every frame.
  const turnRef = useRef<SVGGElement>(null);
  const applyTurn = useCallback((r: number) => {
    const g = turnRef.current;
    if (!g) return;
    g.setAttribute("transform", `rotate(${r})`);
    // Keep shapes and names upright while the dial turns.
    g.querySelectorAll("[data-upright]").forEach((el) => el.setAttribute("transform", `rotate(${-r})`));
  }, []);
  useMotionValueEvent(rotation, "change", applyTurn);
  // React re-renders reset the upright groups, so put the current angle back after each render.
  useLayoutEffect(() => applyTurn(rotation.get()));

  const selectedId = focus.kind === "company" ? focus.id : null;
  const activeLink = (l: Link) =>
    selectedId ? l.from === selectedId || l.to === selectedId : lit ? lit.has(l.from) && lit.has(l.to) : false;
  // Draw order: faint links first, lit ones on top, the hovered one last.
  const rank = (l: Link) => (hoverLink === linkKey(l) ? 2 : activeLink(l) ? 1 : 0);
  const dim = (id: string) => lit !== null && !lit.has(id);
  const showAllLabels = nodes.length < LABEL_ALL_UNDER;
  const agiOn = focus.kind === "agi";
  const colors = [HUB_COLOR, ...Object.values(LAYER_STYLE).map((s) => s.color)];

  return (
    <svg
      className={styles.svg}
      viewBox={`${-VIEW / 2} ${-VIEW / 2} ${VIEW} ${VIEW}`}
      role="img"
      aria-label="The AI ecosystem as rings around AGI, the direction everyone is heading. Each ring is one layer. Arrows show who invests in, runs on, builds on, or buys power from whom."
      onClick={() => onFocus({ kind: "home" })}
    >
      <defs>
        {colors.map((c) => (
          <marker
            key={c}
            id={markerId(c)}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 L3,5 Z" fill={c} />
          </marker>
        ))}
      </defs>

      {/* Rings, one per layer, each in its own color */}
      {rings.map((ring) => {
        const on = focus.kind === "layer" && focus.id === ring.layer.id;
        return (
          <circle
            key={ring.layer.id}
            r={ring.r}
            stroke={LAYER_STYLE[ring.layer.id].color}
            className={`${styles.ring} ${on ? styles.ringOn : ""}`}
          />
        );
      })}

      <g ref={turnRef}>
        {/* The model labs head straight for AGI: arrows from their ring in to the hub. */}
        {nodes
          .filter((n) => n.layer === "models")
          .map((n) => {
            const len = Math.hypot(n.x, n.y);
            const sx = (n.x / len) * (CENTER_R + 6);
            const sy = (n.y / len) * (CENTER_R + 6);
            const mx = (sx + n.x) / 2;
            const my = (sy + n.y) / 2;
            return (
              <g key={`spoke-${n.id}`} className={`${styles.spoke} ${agiOn ? styles.spokeOn : ""}`} stroke={HUB_COLOR}>
                <line x1={n.x} y1={n.y} x2={mx} y2={my} markerEnd={`url(#${markerId(HUB_COLOR)})`} />
                <line x1={mx} y1={my} x2={sx} y2={sy} />
              </g>
            );
          })}

        {/* Links: dim ones first, lit ones on top. Colored by the layer they start from. */}
        {[...links]
          .sort((a, b) => rank(a) - rank(b))
          .map((l) => {
            const a = byId.get(l.from);
            const b = byId.get(l.to);
            if (!a || !b) return null;
            const hot = hoverLink === linkKey(l);
            const on = hot || activeLink(l);
            const faded = !on && (selectedId !== null || lit !== null || hoverLink !== null);
            const color = LAYER_STYLE[a.layer].color;
            const [first, second] = edgeHalves(a, b);
            return (
              <g
                key={`${l.from}-${l.type}-${l.to}`}
                stroke={color}
                strokeDasharray={LINK_DASH[l.type]}
                className={`${styles.edge} ${on ? styles.edgeOn : ""} ${hot ? styles.edgeHot : ""} ${faded ? styles.edgeFaded : ""}`}
              >
                <path d={first} markerEnd={`url(#${markerId(color)})`} />
                <path d={second} />
              </g>
            );
          })}

        {/* Companies sit on their layer's ring */}
        {nodes.map((n) => {
          const selected = n.id === selectedId;
          const hovered = hoverId === n.id;
          const style = LAYER_STYLE[n.layer];
          const size = n.kind === "bigtech" ? 13 : n.stage === "early" ? 8 : 10.5;
          const fill = selected ? style.color : n.kind === "bigtech" ? `${style.color}38` : "var(--graph-node)";
          const showLabel =
            selected || hovered || (lit !== null ? lit.has(n.id) : showAllLabels);
          return (
            <g
              key={n.id}
              transform={`translate(${n.x},${n.y})`}
              className={`${styles.node} ${dim(n.id) ? styles.nodeDim : ""} ${selected ? styles.nodeSelected : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${n.name}, ${n.kind === "bigtech" ? "big tech" : n.stage === "early" ? "early-stage startup" : "startup"}`}
              onClick={(e) => {
                e.stopPropagation();
                onFocus({ kind: "company", id: n.id });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onFocus({ kind: "company", id: n.id });
                }
              }}
              onMouseEnter={() => setHoverId(n.id)}
              onMouseLeave={() => setHoverId(null)}
            >
              <g data-upright="">
                <circle r={20} className={styles.hit} />
                <NodeMark shape={style.shape} size={size} color={style.color} fill={fill} />
                {showLabel && (
                  <text
                    y={size + 16}
                    fill={style.color}
                    className={`${styles.label} ${selected ? styles.labelSelected : ""}`}
                  >
                    {n.name}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </g>

      {/* Ring names sit outside the turning group so they stay put */}
      {rings.map((ring) => (
        <text
          key={`name-${ring.layer.id}`}
          y={-ring.r - 8}
          fill={LAYER_STYLE[ring.layer.id].color}
          className={styles.ringName}
          onClick={(e) => {
            e.stopPropagation();
            onFocus({ kind: "layer", id: ring.layer.id });
          }}
        >
          {ring.layer.name.replace(/ \(.*\)$/, "").toUpperCase()}
        </text>
      ))}

      {/* AGI, in the middle */}
      <g
        className={`${styles.center} ${agiOn ? styles.centerOn : ""}`}
        role="button"
        tabIndex={0}
        aria-label="AGI"
        onClick={(e) => {
          e.stopPropagation();
          onFocus({ kind: "agi" });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") onFocus({ kind: "agi" });
        }}
      >
        <path d={starburst(CENTER_R)} fill="var(--graph-bg)" />
        <path d={starburst(CENTER_R)} fill={agiOn ? HUB_COLOR : `${HUB_COLOR}40`} stroke={HUB_COLOR} strokeWidth={1.6} />
        <text y={7} fill={agiOn ? "#fff" : HUB_COLOR} className={styles.hubText}>
          AGI
        </text>
      </g>
    </svg>
  );
}
