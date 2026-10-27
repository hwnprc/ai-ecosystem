"use client";

import { motion } from "motion/react";
import type { Company, CompanyKind, Layer } from "@/lib/types";
import styles from "./LayerMap.module.css";

type Props = {
  layers: Layer[];
  companies: Company[];
  isActive: (id: string, kind: CompanyKind) => boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// Layers are stacked bottom-up: chips at the bottom, physical AI on top.
export default function LayerMap({ layers, companies, isActive, selectedId, onSelect }: Props) {
  const stack = [...layers].reverse();

  return (
    <div className={styles.stack}>
      {stack.map((layer, i) => (
        <motion.section
          key={layer.id}
          className={styles.layer}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (stack.length - 1 - i) * 0.08 }}
        >
          <div className={styles.label}>
            <h2>{layer.name}</h2>
            <p>{layer.definition}</p>
          </div>
          <div className={styles.companies}>
            {companies
              .filter((c) => c.layer === layer.id)
              .map((c) => {
                const active = isActive(c.id, c.kind);
                return (
                  <motion.button
                    key={c.id}
                    layout
                    className={`${styles.company} ${styles[c.kind]} ${
                      selectedId === c.id ? styles.selected : ""
                    }`}
                    animate={{ opacity: active ? 1 : 0.25, scale: active ? 1 : 0.96 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelect(c.id)}
                  >
                    <span className={styles.name}>{c.name}</span>
                    <span className={styles.meta}>
                      {c.kind === "bigtech" ? "Big tech" : c.stage === "early" ? "Early-stage startup" : "Startup"}
                    </span>
                  </motion.button>
                );
              })}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
