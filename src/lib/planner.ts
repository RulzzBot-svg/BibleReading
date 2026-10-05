import { diffDays, addDays } from "./dates";
import { chapterKey } from "./keys";
import type { ChapterRef, DailyAssignment, Plan, Segment } from "./types";

export function flattenPlan(plan: Plan, chaptersIn: (bookId: string) => number): ChapterRef[] {
  const chapters: ChapterRef[] = [];
  for (const step of plan.steps) {
    const max = chaptersIn(step.bookId);
    if (!max) throw new Error(`Unknown book ${step.bookId} in plan ${plan.id}`);
    const from = step.from ?? 1;
    const to = step.to ?? max;
    if (from < 1 || to > max || from > to) {
      throw new Error(`Bad range ${step.bookId} ${from}-${to} in ${plan.id}`);
    }
    for (let chapter = from; chapter <= to; chapter += 1) {
      chapters.push({ bookId: step.bookId, chapter });
    }
  }
  return chapters;
}

export function stepFor(plan: Plan, ref: ChapterRef, chaptersIn: (bookId: string) => number): Segment | undefined {
  return plan.steps.find((step) => {
    if (step.bookId !== ref.bookId) return false;
    const max = chaptersIn(step.bookId);
    const from = step.from ?? 1;
    const to = step.to ?? max;
    return ref.chapter >= from && ref.chapter <= to;
  });
}

export type Pace = {
  dayNumber: number;
  readInPlan: number;
  total: number;
  behind: number;
  ahead: number;
  status: "behind" | "on-pace" | "ahead" | "done";
  remaining: number;
};

export function paceFor(
  flat: ChapterRef[],
  read: Set<string>,
  startDate: string,
  perDay: number,
  today: string,
): Pace {
  const total = flat.length;
  const readInPlan = flat.filter((chapter) => read.has(chapterKey(chapter))).length;
  const remaining = total - readInPlan;
  const dayNumber = Math.max(1, diffDays(startDate, today) + 1);
  if (remaining <= 0) {
    return { dayNumber, readInPlan, total, behind: 0, ahead: 0, status: "done", remaining: 0 };
  }
  const dueByYesterday = Math.min(total, Math.max(0, dayNumber - 1) * perDay);
  const dueByToday = Math.min(total, dayNumber * perDay);
  if (readInPlan < dueByYesterday) {
    return {
      dayNumber,
      readInPlan,
      total,
      behind: dueByYesterday - readInPlan,
      ahead: 0,
      status: "behind",
      remaining,
    };
  }
  if (readInPlan > dueByToday) {
    return {
      dayNumber,
      readInPlan,
      total,
      behind: 0,
      ahead: readInPlan - dueByToday,
      status: "ahead",
      remaining,
    };
  }
  return { dayNumber, readInPlan, total, behind: 0, ahead: 0, status: "on-pace", remaining };
}

export function finishDate(remaining: number, perDay: number, today: string): string {
  if (remaining <= 0) return today;
  const safePace = Math.max(1, perDay);
  return addDays(today, Math.ceil(remaining / safePace) - 1);
}

export function resolveDailyAssignment(
  current: DailyAssignment | null,
  planId: string | null,
  flat: ChapterRef[],
  read: Set<string>,
  perDay: number,
  today: string,
): DailyAssignment | null {
  if (!planId) return null;
  const unreadLeft = flat.some((chapter) => !read.has(chapterKey(chapter)));
  if (current && current.date === today && current.planId === planId) {
    if (current.keys.length > 0 || !unreadLeft) return current;
  }
  const keys: string[] = [];
  for (const chapter of flat) {
    if (keys.length >= perDay) break;
    const key = chapterKey(chapter);
    if (!read.has(key)) keys.push(key);
  }
  return { date: today, planId, keys };
}

export function sameAssignment(a: DailyAssignment | null, b: DailyAssignment | null): boolean {
  if (a === b) return true;
  if (!a || !b) return !a && !b;
  if (a.date !== b.date || a.planId !== b.planId || a.keys.length !== b.keys.length) return false;
  return a.keys.every((key, index) => key === b.keys[index]);
}

export function canonicalNeighbor(
  order: ChapterRef["bookId"][],
  chaptersIn: (bookId: string) => number,
  bookId: string,
  chapter: number,
  direction: -1 | 1,
): ChapterRef | null {
  const index = order.indexOf(bookId);
  if (index < 0) return null;
  const max = chaptersIn(bookId);
  const nextChapter = chapter + direction;
  if (nextChapter >= 1 && nextChapter <= max) return { bookId, chapter: nextChapter };
  const nextBook = order[index + direction];
  if (!nextBook) return null;
  const nextMax = chaptersIn(nextBook);
  return { bookId: nextBook, chapter: direction === 1 ? 1 : nextMax };
}

export function planNeighbor(flat: ChapterRef[], bookId: string, chapter: number, direction: -1 | 1): ChapterRef | null {
  const index = flat.findIndex((item) => item.bookId === bookId && item.chapter === chapter);
  if (index < 0) return null;
  return flat[index + direction] ?? null;
}

export function durationLabel(chapterCount: number, perDay: number): string {
  const pace = Math.max(1, perDay);
  const days = Math.ceil(chapterCount / pace);
  const amount = `${chapterCount.toLocaleString()} chapter${chapterCount === 1 ? "" : "s"}`;
  if (days <= 21) return `${amount} · about ${days} day${days === 1 ? "" : "s"} at ${pace} a day`;
  if (days < 70) return `${amount} · about ${Math.round(days / 7)} weeks at ${pace} a day`;
  const months = Math.max(1, Math.round(days / 30));
  return `${amount} · about ${months} month${months === 1 ? "" : "s"} at ${pace} a day`;
}
