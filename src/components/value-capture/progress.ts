import { END_YEAR, START_YEAR } from "@/data/valueCapture";

/** 0 at the start year, 1 at the end year. */
export function progress(year: number): number {
  return (year - START_YEAR) / (END_YEAR - START_YEAR);
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}
