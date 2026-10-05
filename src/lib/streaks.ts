import { addDays } from "./dates";

export function currentStreak(days: string[], today: string): number {
  const set = new Set(days);
  let cursor = today;
  if (!set.has(cursor)) {
    cursor = addDays(today, -1);
    if (!set.has(cursor)) return 0;
  }
  let count = 0;
  while (set.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function longestStreak(days: string[]): number {
  const unique = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let previous = "";
  for (const day of unique) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    if (run > best) best = run;
    previous = day;
  }
  return best;
}
