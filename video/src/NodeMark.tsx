import type { NodeShape } from "@/lib/graphLayout";

// The same node shapes as the site's graph (src/components/graph/RingGraph.tsx),
// without the site's CSS so the video can draw them on its own.
export function NodeMark({ shape, size: s, color, fill, strokeWidth = 1.6 }: { shape: NodeShape; size: number; color: string; fill: string; strokeWidth?: number }) {
  const common = { fill, stroke: color, strokeWidth };
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
