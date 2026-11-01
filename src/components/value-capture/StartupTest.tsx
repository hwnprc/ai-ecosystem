"use client";

import { useState } from "react";
import { END_YEAR, PRESETS, QUESTIONS, START_YEAR, type Answer } from "@/data/valueCapture";
import { progress } from "./progress";
import styles from "./ValueCapture.module.css";

type Verdict = { title: string; text: string; openUntil: number | null };

function judge(name: string, answers: Answer[]): Verdict | null {
  if (answers.some((a) => a === null)) return null;
  const noCount = answers.filter((a) => a === "no").length;
  if (noCount === 4)
    return { title: `${name} is defensible.`, text: "The signal can't be bought, simulated, or taken over. This is where operators win.", openUntil: null };
  if (noCount >= 2)
    return { title: `${name} has a window, not a moat.`, text: "Some protection, but a lab can reach it in time.", openUntil: 2028 };
  return { title: `A lab can take ${name}'s spot.`, text: "The signal is buyable or replaceable.", openUntil: 2027 };
}

export default function StartupTest({ year }: { year: number }) {
  const [name, setName] = useState(PRESETS[3].name);
  const [answers, setAnswers] = useState<Answer[]>(PRESETS[3].answers);
  const [preset, setPreset] = useState<number | null>(3);

  const answered = answers.filter(Boolean).length;
  const verdict = judge(name.trim() || "This startup", answers);

  return (
    <section className={styles.sec} aria-labelledby="h-test">
      <span className={styles.eyebrow}>03</span>
      <h2 id="h-test" className={styles.h2}>Can a lab take your startup&apos;s spot?</h2>
      <p className={styles.lead}>Name a startup, or load one. A safe one answers no to all four.</p>
      <input
        id="startup"
        className={styles.nameField}
        type="text"
        placeholder="Startup name"
        autoComplete="off"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setPreset(null);
        }}
      />
      <div className={styles.presets}>
        {PRESETS.map((p, i) => (
          <button
            key={p.name}
            aria-pressed={i === preset}
            className={`${styles.chip} ${i === preset ? styles.chipOn : ""}`}
            onClick={() => {
              setName(p.name);
              setAnswers(p.answers);
              setPreset(i);
            }}
          >
            {p.name}
          </button>
        ))}
      </div>
      <div className={styles.questions}>
        {QUESTIONS.map((q, i) => (
          <div key={q.question} className={styles.question}>
            <p>
              {i + 1}. {q.question}
              <small>{q.hint}</small>
            </p>
            <div className={styles.yesNo} role="group" aria-label={`Answer ${i + 1}`}>
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  aria-pressed={answers[i] === v}
                  className={`${styles.chip} ${answers[i] === v ? styles.chipOn : ""}`}
                  onClick={() => {
                    setAnswers(answers.map((a, j) => (j === i ? v : a)));
                    setPreset(null);
                  }}
                >
                  {v === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.verdict} aria-live="polite">
        <b>{verdict ? verdict.title : `${answered} of 4 answered`}</b>
        <div className={styles.meter}>
          {answers.map((a, i) => (
            <i key={i} className={a === "no" ? styles.meterNo : a === "yes" ? styles.meterYes : ""} />
          ))}
        </div>
        <span>{verdict ? verdict.text : "Answer all four to see the verdict."}</span>
        {verdict && <StartupWindow year={year} openUntil={verdict.openUntil} />}
      </div>
    </section>
  );
}

function StartupWindow({ year, openUntil }: { year: number; openUntil: number | null }) {
  const end = openUntil ?? END_YEAR + 1;
  const width = Math.min(100, ((end - START_YEAR) / (END_YEAR - START_YEAR)) * 100);
  let label = "Open past 2030";
  if (openUntil !== null) label = year >= openUntil ? `Window closed in ${Math.floor(year)}` : `Window open until about ${openUntil}`;
  return (
    <div className={styles.window}>
      <div className={styles.windowTrack}>
        <i className={styles.gaugeFill} style={{ width: `${width}%` }} />
        <b className={styles.windowNow} style={{ left: `${progress(year) * 100}%` }} />
      </div>
      <div className={styles.windowLabels}>
        <span>{START_YEAR}</span>
        <span>{label}</span>
        <span>{END_YEAR}</span>
      </div>
    </div>
  );
}
