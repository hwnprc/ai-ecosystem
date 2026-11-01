"use client";

import { useMemo } from "react";
import { Background, Controls, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Company, CompanyKind, Direction, Layer } from "@/lib/types";
import styles from "./ConnectionsView.module.css";

type Props = {
  layers: Layer[];
  companies: Company[];
  directions: Direction[];
  isActive: (id: string, kind: CompanyKind) => boolean;
  activeDirectionId: string | null;
  onSelect: (id: string) => void;
};

const ROW = 110;
const COL = 170;
const COMPANY_X = 220;

// Companies sit in their layer's row (applications on top). Directions sit on the right
// with an edge to every company they cut across, so cross-layer reach is visible at a glance.
export default function ConnectionsView({
  layers,
  companies,
  directions,
  isActive,
  activeDirectionId,
  onSelect,
}: Props) {
  const { nodes, edges } = useMemo(() => {
    const stack = [...layers].reverse();
    const nodes: Node[] = [];
    const widest = Math.max(...layers.map((l) => companies.filter((c) => c.layer === l.id).length));
    const DIRECTION_X = COMPANY_X + COL * widest + 120;

    stack.forEach((layer, row) => {
      nodes.push({
        id: `layer-${layer.id}`,
        position: { x: 0, y: row * ROW },
        data: { label: layer.name },
        className: styles.layerNode,
        draggable: false,
        selectable: false,
        connectable: false,
      });
      companies
        .filter((c) => c.layer === layer.id)
        .forEach((c, col) => {
          nodes.push({
            id: c.id,
            position: { x: COMPANY_X + col * COL, y: row * ROW },
            data: { label: c.name },
            type: "output",
            targetPosition: Position.Right,
            className: `${styles.companyNode} ${styles[c.kind]}`,
            style: { opacity: isActive(c.id, c.kind) ? 1 : 0.25 },
            connectable: false,
          });
        });
    });

    const span = (stack.length - 1) * ROW;
    directions.forEach((d, i) => {
      nodes.push({
        id: `direction-${d.id}`,
        position: { x: DIRECTION_X, y: ((i + 1) * span) / (directions.length + 1) },
        data: { label: d.title },
        type: "input",
        sourcePosition: Position.Left,
        className: styles.directionNode,
        style: { opacity: !activeDirectionId || activeDirectionId === d.id ? 1 : 0.3 },
        connectable: false,
      });
    });

    const edges: Edge[] = directions.flatMap((d) =>
      d.companies.map((cid) => {
        const on = activeDirectionId === d.id;
        return {
          id: `${d.id}-${cid}`,
          source: `direction-${d.id}`,
          target: cid,
          animated: on,
          style: {
            stroke: "var(--accent)",
            strokeWidth: on ? 2 : 1,
            opacity: !activeDirectionId || on ? 0.8 : 0.1,
          },
        };
      }),
    );

    return { nodes, edges };
  }, [layers, companies, directions, isActive, activeDirectionId]);

  return (
    <div className={styles.canvas}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesConnectable={false}
        onNodeClick={(_, node) => {
          if (companies.some((c) => c.id === node.id)) onSelect(node.id);
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
