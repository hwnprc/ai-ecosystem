"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Company, CompanyKind, Layer } from "@/lib/types";
import styles from "./LayerMap.module.css";

type Props = {
  layers: Layer[];
  companies: Company[];
  isActive: (id: string, kind: CompanyKind) => boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type Time = "now" | "heading";

/**
 * The value chain stack from the AI Frontier deck: energy at the bottom, the
 * consumer on top. Closer to the person paying means more value capture.
 * Click a layer to open what the deck says about it. Switch "now" and
 * "where it's heading" to watch value move up the stack.
 */
export default function LayerMap({ layers, companies, isActive, selectedId, onSelect }: Props) {
  const [time, setTime] = useState<Time>("now");
  const [openId, setOpenId] = useState<string | null>("applications");
  const [money, setMoney] = useState(false);
  const stack = [...layers].reverse(); // applications on top

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.toggle} role="group" aria-label="Time">
          {(["now", "heading"] as Time[]).map((t) => (
            <button key={t} aria-pressed={time === t} className={time === t ? styles.on : ""} onClick={() => setTime(t)}>
              {t === "now" ? "Today" : "Where it's heading"}
            </button>
          ))}
        </div>
        <button className={`${styles.moneyBtn} ${money ? styles.on : ""}`} aria-pressed={money} onClick={() => setMoney(!money)}>
          {money ? "Hide" : "Follow"} the money
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.stack}>
          <div className={styles.consumer}>
            Consumer <span lang="ko">· 소비자</span>
            {money && <span className={styles.coin} aria-hidden="true" />}
          </div>

          {stack.map((layer, i) => {
            const state = layer[time];
            const open = openId === layer.id;
            const inLayer = companies.filter((c) => c.layer === layer.id);
            return (
              <motion.section
                key={layer.id}
                layout
                className={`${styles.layer} ${open ? styles.open : ""} ${layer.id === "applications" ? styles.tall : ""}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <button className={styles.head} aria-expanded={open} onClick={() => setOpenId(open ? null : layer.id)}>
                  <span className={styles.name}>{layer.name}</span>
                  <span className={styles.state}>
                    <motion.span key={state.label} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={styles.stateLabel}>
                      {state.label}
                    </motion.span>
                    <span className={styles.meter} aria-label={`Value capture ${state.level} of 3`}>
                      {[1, 2, 3].map((n) => (
                        <motion.i key={n} animate={{ opacity: n <= state.level ? 1 : 0.15 }} />
                      ))}
                    </span>
                  </span>
                </button>

                <div className={styles.companies}>
                  {inLayer.map((c) => {
                    const active = isActive(c.id, c.kind);
                    return (
                      <motion.button
                        key={c.id}
                        layout
                        className={`${styles.company} ${styles[c.kind]} ${selectedId === c.id ? styles.selected : ""}`}
                        animate={{ opacity: active ? 1 : 0.25 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onSelect(c.id)}
                      >
                        <span className={styles.cname}>{c.name}</span>
                        {c.tag && <span className={styles.tag}>{c.tag}</span>}
                      </motion.button>
                    );
                  })}
                  {inLayer.length === 0 && <span className={styles.empty}>No companies tracked yet.</span>}
                </div>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      className={styles.drawer}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p className={styles.def}>{layer.definition}</p>
                      <p>{layer.note}</p>
                      <Link href="/value-capture" className={styles.lensLink}>
                        Run a company through the hosts&apos; lenses →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            );
          })}
        </div>

        <div className={styles.arrows} aria-hidden="true">
          <div className={styles.up}>
            {money && <span className={styles.flowUp} />}
            <span>Closer to the person paying</span>
            <b>= value capture ↑</b>
          </div>
          <div className={styles.down}>
            <span>Infra players keep 10% at most</span>
            <small>AWS 35%</small>
            <b>Low margin</b>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {money && (
          <motion.p className={styles.moneyNote} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Money enters at the top, from the consumer, and flows down the stack. Each layer keeps a share. Scarce layers
            keep more. When a layer becomes a commodity, its share moves to whoever is closest to the consumer or holds a
            physical bottleneck. Filled squares show how much each layer keeps.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
