import { useMemo } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { graphData } from "@/lib/data";
import {
  CENTER_R,
  HUB_COLOR,
  LAYER_STYLE,
  LINK_DASH,
  edgeHalves,
  layoutGraph,
  ringLabel,
  ringTagWidth,
  rotationToBottom,
  starburst,
  type PlacedNode,
} from "@/lib/graphLayout";
import { NodeMark } from "./NodeMark";
import { script, sec } from "./script";

// IBM Plex Sans, the site's font, bundled in public/fonts so renders work offline.
const fontFamily = "IBM Plex Sans";
for (const weight of ["400", "500", "600"]) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/ibm-plex-sans-latin-${weight}-normal.woff2`), weight });
}

// Same warm paper palette as the website (light mode).
const BG = "#f5f3ef";
const NODE_FILL = "#ffffff";
const TEXT = "#1f1c18";
const MUTED = "#6e675f";

export type Layout = "square" | "wide";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.inOut(Easing.cubic);

function useGraph() {
  return useMemo(() => {
    const { rings, nodes } = layoutGraph(graphData.layers, graphData.companies);
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links = graphData.links.filter((l) => byId.has(l.from) && byId.has(l.to));
    return { rings, nodes, byId, links };
  }, []);
}

export function Promo({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const { rings, nodes, byId, links } = useGraph();

  // Where the graph sits in the frame, and how many pixels the full map gets.
  const square = layout === "square";
  const cx = square ? width / 2 : width * 0.68;
  const cy = square ? height * 0.565 : height / 2;
  const fit = square ? 450 : 470;

  // ---------- Timing ----------
  const ringStart = (i: number) => sec(script.rings.start + i * script.rings.perRing);
  const ringIndex = new Map(rings.map((r, i) => [r.layer.id, i]));
  // Each company pops in as a sweep goes round its ring, clockwise from the top.
  const appearAt = (n: PlacedNode) => {
    const i = ringIndex.get(n.layer) ?? 0;
    const sweep = ((n.angle + 90 + 360) % 360) / 360;
    return ringStart(i) + Math.round(sweep * script.rings.perRing * 0.55 * fps);
  };
  const appear = (at: number) => spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 140 } });

  const tLinks = sec(script.links.start);
  const tSpot = sec(script.spotlight.start);
  const tOutro = sec(script.outro.start);

  // ---------- Camera ----------
  // Start close on AGI, then pull out so each new ring fills the frame as it arrives.
  // The hook: the whole map is on screen from the first frame, then the camera dives into AGI.
  const hookEnd = sec(script.hook.end);
  const diveEnd = sec(script.hook.end + script.hook.dive);
  const hook = interpolate(frame, [hookEnd, diveEnd], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });
  const keys: [number, number][] = [
    [0, fit / 500],
    [hookEnd, fit / 470],
    [diveEnd, fit / 120],
    [ringStart(0) - 6, fit / 112],
    ...rings.map((r, i): [number, number] => [ringStart(i) + Math.round(script.rings.perRing * (i === 0 ? 0.35 : 0.75) * fps), fit / (r.r + 62)]),
    [tOutro, fit / 490],
    [tOutro + 24, fit / 620],
  ];
  const scale = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), { ...clamp, easing: smooth });
  // Move the map down a little for the closing card, to make room for its text.
  const outroShift = interpolate(frame, [tOutro, tOutro + 24], [0, square ? 16 : 0], { ...clamp, easing: smooth });

  // ---------- Spotlight ----------
  const spotId = script.spotlight.company;
  const spotNode = byId.get(spotId);
  const spotLinks = links.filter((l) => l.from === spotId || l.to === spotId);
  const lit = new Set([spotId, ...spotLinks.flatMap((l) => [l.from, l.to])]);
  const spotIn = spring({ frame: frame - tSpot, fps, config: { damping: 200 }, durationInFrames: 24 });
  const spotOut = spring({ frame: frame - tOutro, fps, config: { damping: 200 }, durationInFrames: 24 });
  const spot = spotIn - spotOut;
  // Turn the dial so the spotlit company comes round to the bottom, as on the site.
  const turnTo = spotNode ? rotationToBottom(spotNode.angle, 0) : 0;
  const rotation =
    turnTo * spring({ frame: frame - tSpot, fps, config: { damping: 26, stiffness: 40 } }) +
    interpolate(frame, [tOutro, sec(script.duration)], [0, 8], clamp); // a slow drift at the end

  // ---------- Links ----------
  // A short swell when every connection shows at once.
  const swell = interpolate(frame, [tLinks, tLinks + 15, tSpot - 10, tSpot + 10], [0, 1, 1, 0], clamp);
  const linkBase = 0.2 + 0.22 * Math.max(swell, hook);

  // ---------- Hub ----------
  const hubPulse = 1 + 0.04 * Math.sin(frame / 9);
  const hubOn = interpolate(frame, [tOutro, tOutro + 20], [0, 1], clamp);
  const spokesIn = Math.max(appear(ringStart(0) + 10), hook);

  const mix = (a: number, b: number, t: number) => a + (b - a) * t;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily }}>
      <Backdrop cx={cx} cy={cy + outroShift} scale={scale} />

      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          {[HUB_COLOR, ...Object.values(LAYER_STYLE).map((s) => s.color)].map((c) => (
            <marker key={c} id={`arrow-${c.slice(1)}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 L3,5 Z" fill={c} />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${cx},${cy + outroShift}) scale(${scale})`}>
          {/* Rings */}
          {rings.map((ring, i) => {
            const a = Math.max(appear(ringStart(i) - 4), hook);
            return (
              <circle
                key={ring.layer.id}
                r={ring.r * mix(0.85, 1, a)}
                fill="none"
                stroke={LAYER_STYLE[ring.layer.id].color}
                strokeWidth={1.2 / Math.min(scale, 1.6)}
                strokeDasharray="4 4"
                opacity={0.8 * Math.min(a, 1) * mix(1, 0.45, spot)}
              />
            );
          })}

          <g transform={`rotate(${rotation})`}>
            {/* Spokes: the model labs head straight for AGI. They flow inward at the end. */}
            {nodes
              .filter((n) => n.layer === "models" && n.tier !== "wide")
              .map((n) => {
                const len = Math.hypot(n.x, n.y);
                const sx = (n.x / len) * (CENTER_R + 6);
                const sy = (n.y / len) * (CENTER_R + 6);
                const mx = (sx + n.x) / 2;
                const my = (sy + n.y) / 2;
                const op = Math.min(spokesIn, 1) * mix(0.35, 1, hubOn) * mix(1, 0.2, spot);
                return (
                  <g key={`spoke-${n.id}`} stroke={HUB_COLOR} strokeWidth={mix(1.2, 2, hubOn)} opacity={op}>
                    <line x1={n.x} y1={n.y} x2={mx} y2={my} markerEnd={`url(#arrow-${HUB_COLOR.slice(1)})`} />
                    <line
                      x1={mx}
                      y1={my}
                      x2={sx}
                      y2={sy}
                      strokeDasharray={hubOn > 0 ? "5 5" : undefined}
                      strokeDashoffset={-frame * 0.8}
                    />
                  </g>
                );
              })}

            {/* Links appear once both ends are on the map */}
            {links.map((l) => {
              const a = byId.get(l.from)!;
              const b = byId.get(l.to)!;
              const at = Math.max(appearAt(a), appearAt(b)) + 8;
              const shown = Math.max(interpolate(frame, [at, at + 14], [0, 1], clamp), hook);
              if (shown === 0) return null;
              const mine = l.from === spotId || l.to === spotId;
              const op = shown * mix(linkBase, mine ? 0.95 : 0.03, spot);
              const color = LAYER_STYLE[a.layer].color;
              const [first, second] = edgeHalves(a, b);
              return (
                <g
                  key={`${l.from}-${l.type}-${l.to}`}
                  stroke={color}
                  strokeDasharray={LINK_DASH[l.type]}
                  fill="none"
                  strokeWidth={mine ? mix(1, 1.8, spot) : 1}
                  opacity={op}
                >
                  <path d={first} markerEnd={`url(#arrow-${color.slice(1)})`} />
                  <path d={second} />
                </g>
              );
            })}

            {/* Companies */}
            {nodes.map((n) => {
              const a = Math.max(appear(appearAt(n)), hook);
              if (a <= 0.001) return null;
              const style = LAYER_STYLE[n.layer];
              const wide = n.tier === "wide";
              const isSpot = n.id === spotId;
              const size = (n.kind === "bigtech" ? 13 : wide ? 5 : 10.5) * (isSpot ? mix(1, 1.5, spot) : 1);
              const fill = isSpot && spot > 0.5 ? style.color : n.kind === "bigtech" ? `${style.color}38` : NODE_FILL;
              const op = mix(1, lit.has(n.id) ? 1 : 0.1, spot);
              const showLabel = !wide && (spot < 0.5 || lit.has(n.id));
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`} opacity={op}>
                  <g transform={`rotate(${-rotation}) scale(${a})`}>
                    <NodeMark shape={style.shape} size={size} color={style.color} fill={fill} strokeWidth={wide ? 1.2 : isSpot ? 2.6 : 1.6} />
                    {showLabel && (
                      <text
                        y={size + (isSpot ? 24 : 16)}
                        fill={style.color}
                        fontSize={isSpot ? mix(12, 24, spot) : 12}
                        fontWeight={isSpot ? 600 : 500}
                        textAnchor="middle"
                        paintOrder="stroke"
                        stroke={BG}
                        strokeWidth={4}
                      >
                        {n.name}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* Ring name tags, at the top of each ring */}
          {rings.map((ring, i) => {
            const a = Math.max(appear(ringStart(i) + 4), hook);
            const name = ringLabel(ring.layer);
            const w = ringTagWidth(name);
            const color = LAYER_STYLE[ring.layer.id].color;
            return (
              <g key={`tag-${ring.layer.id}`} transform={`translate(0,${-ring.r}) scale(${a})`} opacity={Math.min(a, 1) * mix(1, 0.4, spot)}>
                <rect x={-w / 2} y={-11} width={w} height={22} rx={11} fill={BG} stroke={color} strokeWidth={1} />
                <text y={4.5} fill={color} fontSize={12} fontWeight={600} letterSpacing="0.08em" textAnchor="middle">
                  {name}
                </text>
              </g>
            );
          })}

          {/* AGI in the middle */}
          <g transform={`scale(${hubPulse}) rotate(${frame * 0.25})`}>
            <path d={starburst(CENTER_R)} fill={BG} />
            <path d={starburst(CENTER_R)} fill={hubOn > 0.5 ? HUB_COLOR : `${HUB_COLOR}40`} stroke={HUB_COLOR} strokeWidth={1.6} />
          </g>
          <text y={7} fill={hubOn > 0.5 ? "#fff" : HUB_COLOR} fontSize={22} fontWeight={500} letterSpacing="0.04em" textAnchor="middle">
            AGI
          </text>
        </g>
      </svg>

      <Captions layout={layout} />
    </AbsoluteFill>
  );
}

// A soft orange glow behind AGI and a faint dot grid, like the site.
function Backdrop({ cx, cy, scale }: { cx: number; cy: number; scale: number }) {
  const r = Math.min(260 * Math.max(scale, 0.8), 420);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(60,50,40,0.09) 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224,122,58,0.16) 0%, rgba(224,122,58,0) 70%)",
        }}
      />
    </AbsoluteFill>
  );
}

// ---------- Text on screen ----------

type Card = { from: number; to: number; title: string; sub?: string; kicker?: string; kickerColor?: string };

function useCards(): Card[] {
  const { rings, links, nodes } = useGraph();
  const s = script;
  const fill = (t: string) => t.replace("{companies}", String(nodes.length)).replace("{links}", String(links.length));
  const spotCount = links.filter((l) => l.from === s.spotlight.company || l.to === s.spotlight.company).length;
  const cards: Card[] = [
    {
      from: 0,
      to: sec(s.hook.end) + 4,
      title: fill(s.hook.title),
      sub: fill(s.hook.sub),
    },
    { from: sec(s.intro.start), to: sec(s.rings.start), title: s.intro.title, sub: s.intro.sub },
    ...rings.map((ring, i) => ({
      from: sec(s.rings.start + i * s.rings.perRing),
      to: sec(s.rings.start + (i + 1) * s.rings.perRing),
      kicker: (s.rings.names[ring.layer.id] ?? ring.layer.name).toUpperCase(),
      kickerColor: LAYER_STYLE[ring.layer.id].color,
      title: s.rings.overrides[ring.layer.id] ?? ring.layer.definition,
    })),
    {
      from: sec(s.links.start),
      to: sec(s.spotlight.start),
      title: fill(s.links.title),
      sub: fill(s.links.sub),
    },
    {
      from: sec(s.spotlight.start),
      to: sec(s.outro.start),
      title: s.spotlight.title.replace("{count}", String(spotCount)),
      sub: s.spotlight.sub,
    },
    { from: sec(s.outro.start), to: sec(s.duration) + 30, title: s.outro.title, sub: s.outro.sub },
  ];
  return cards;
}

function Captions({ layout }: { layout: Layout }) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const cards = useCards();
  const square = layout === "square";
  const tOutro = sec(script.outro.start);
  const footerIn = interpolate(frame, [tOutro + 20, tOutro + 35], [0, 1], clamp);

  const box: React.CSSProperties = square
    ? { position: "absolute", left: 64, right: 64, top: 52 }
    : { position: "absolute", left: 110, width: width * 0.36, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" };

  return (
    <AbsoluteFill>
      {/* A soft fade behind the text, so the map never runs into it */}
      <div
        style={
          square
            ? { position: "absolute", left: 0, right: 0, top: 0, height: 250, background: `linear-gradient(${BG} 55%, ${BG}00)` }
            : { position: "absolute", left: 0, top: 0, bottom: 0, width: width * 0.45, background: `linear-gradient(90deg, ${BG} 70%, ${BG}00)` }
        }
      />
      {cards.map((c, i) => {
        if (frame < c.from - 2 || frame > c.to + 2) return null;
        // The first card is on screen from frame 0, so the post's thumbnail has the text.
        const inP = c.from === 0 ? 1 : spring({ frame: frame - c.from, fps, config: { damping: 200 }, durationInFrames: 12 });
        const outP = interpolate(frame, [c.to - 8, c.to], [0, 1], clamp);
        const op = inP * (1 - outP);
        const y = (1 - inP) * 18 - outP * 10;
        return (
          <div key={i} style={{ ...box, opacity: op, transform: `translateY(${y}px)` }}>
            {c.kicker && (
              <div style={{ color: c.kickerColor, fontSize: square ? 30 : 32, fontWeight: 600, letterSpacing: "0.14em", marginBottom: 10 }}>
                {c.kicker}
              </div>
            )}
            <div style={{ color: TEXT, fontSize: c.kicker ? (square ? 46 : 52) : square ? 60 : 60, fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.01em" }}>
              {c.title}
            </div>
            {c.sub && (
              <div style={{ color: MUTED, fontSize: square ? 32 : 36, fontWeight: 400, lineHeight: 1.3, marginTop: 14, whiteSpace: "pre-line" }}>
                {c.sub}
              </div>
            )}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: square ? 0 : 110,
          right: square ? 0 : undefined,
          bottom: square ? 40 : 80,
          textAlign: square ? "center" : "left",
          color: MUTED,
          fontSize: 28,
          opacity: footerIn,
        }}
      >
        {script.outro.footer}
      </div>
    </AbsoluteFill>
  );
}
