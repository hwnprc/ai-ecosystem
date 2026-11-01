import { END_YEAR, START_YEAR } from "@/data/valueCapture";
import styles from "./ValueCapture.module.css";

type Props = {
  year: number;
  playing: boolean;
  onYear: (year: number) => void;
  onTogglePlay: () => void;
};

/** Same capability gets about 10x cheaper each year. */
function tokenCost(year: number): string {
  const cost = Math.pow(10, -(year - START_YEAR));
  if (cost >= 0.1) return `${Number(cost.toFixed(2))}×`;
  return `1/${Math.round(1 / cost).toLocaleString("en-US")}×`;
}

export default function YearBar({ year, playing, onYear, onTogglePlay }: Props) {
  return (
    <div className={styles.timebar}>
      <div className={styles.timebarInner}>
        <button className={styles.play} onClick={onTogglePlay} aria-label={playing ? "Pause" : "Play the years"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <label htmlFor="year" className={styles.year}>
          {Math.floor(year)}
        </label>
        <input
          id="year"
          className={styles.range}
          type="range"
          min={START_YEAR}
          max={END_YEAR}
          step={0.05}
          value={year}
          onChange={(e) => onYear(Number(e.target.value))}
          aria-label="Year"
        />
        <span className={styles.tokenRead}>token cost {tokenCost(year)}</span>
      </div>
    </div>
  );
}
