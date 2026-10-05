import { getBook } from "./books";
import { isValidISODate, todayISO } from "./dates";
import { parseChapterKey } from "./keys";
import { isPlanId } from "../data/plans";
import type { Bookmark, DailyAssignment, ThemeChoice, UserState } from "./types";

export const STORAGE_KEY = "folio.v1";

export const FONT_SCALES = [0.92, 1, 1.12, 1.28, 1.44];

export function defaultState(): UserState {
  return {
    version: 1,
    readChapters: [],
    readDays: [],
    bookmarks: [],
    lastPosition: null,
    activePlanId: null,
    planStartDate: null,
    chaptersPerDay: 3,
    reminderEnabled: false,
    reminderTime: "08:00",
    fontScale: 1,
    theme: "system",
    onboardingDone: false,
    dailyAssignment: null,
  };
}

function validChapterKey(key: string): boolean {
  const ref = parseChapterKey(key);
  if (!ref) return false;
  const book = getBook(ref.bookId);
  return Boolean(book && ref.chapter >= 1 && ref.chapter <= book.chapters);
}

function clampPace(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 3;
  return Math.min(20, Math.max(1, Math.round(number)));
}

function themeOf(value: unknown): ThemeChoice {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}

function timeOf(value: unknown): string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "08:00";
}

function fontOf(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 1;
  return Math.min(1.5, Math.max(0.85, number));
}

function bookmarksOf(value: unknown): Bookmark[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const bookmarks: Bookmark[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const bookId = (item as Bookmark).bookId;
    const chapter = (item as Bookmark).chapter;
    const verse = (item as Bookmark).verse;
    if (typeof bookId !== "string" || typeof chapter !== "number" || typeof verse !== "number") continue;
    const book = getBook(bookId);
    if (!book || chapter < 1 || chapter > book.chapters) continue;
    const count = book.verseCounts[chapter - 1] ?? 0;
    if (verse < 1 || verse > count) continue;
    const key = `${bookId}:${chapter}:${verse}`;
    if (seen.has(key)) continue;
    seen.add(key);
    bookmarks.push({ bookId, chapter, verse });
    if (bookmarks.length >= 400) break;
  }
  return bookmarks;
}

function assignmentOf(value: unknown, planId: string | null): DailyAssignment | null {
  if (!planId || !value || typeof value !== "object") return null;
  const record = value as DailyAssignment;
  if (record.planId !== planId || !isValidISODate(record.date) || !Array.isArray(record.keys)) return null;
  const keys = record.keys.filter((key) => typeof key === "string" && validChapterKey(key));
  return { date: record.date, planId, keys };
}

export function sanitizeState(input: unknown): UserState | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<UserState>;
  const base = defaultState();
  const readChapters = Array.isArray(raw.readChapters)
    ? [...new Set(raw.readChapters.filter((key): key is string => typeof key === "string" && validChapterKey(key)))]
    : [];
  const readDays = Array.isArray(raw.readDays)
    ? [...new Set(raw.readDays.filter((day): day is string => typeof day === "string" && isValidISODate(day)))].sort()
    : [];
  const activePlanId = typeof raw.activePlanId === "string" && isPlanId(raw.activePlanId) ? raw.activePlanId : null;
  let planStartDate = typeof raw.planStartDate === "string" && isValidISODate(raw.planStartDate) ? raw.planStartDate : null;
  if (activePlanId && !planStartDate) planStartDate = todayISO();
  if (!activePlanId) planStartDate = null;

  let lastPosition: UserState["lastPosition"] = null;
  if (raw.lastPosition && typeof raw.lastPosition === "object") {
    const book = getBook(raw.lastPosition.bookId);
    const chapter = raw.lastPosition.chapter;
    if (book && typeof chapter === "number" && chapter >= 1 && chapter <= book.chapters) {
      const verse = raw.lastPosition.verse;
      const count = book.verseCounts[chapter - 1] ?? 0;
      lastPosition = {
        bookId: book.id,
        chapter,
        verse: typeof verse === "number" && verse >= 1 && verse <= count ? verse : undefined,
      };
    }
  }

  return {
    ...base,
    readChapters,
    readDays,
    bookmarks: bookmarksOf(raw.bookmarks),
    lastPosition,
    activePlanId,
    planStartDate,
    chaptersPerDay: clampPace(raw.chaptersPerDay),
    reminderEnabled: raw.reminderEnabled === true,
    reminderTime: timeOf(raw.reminderTime),
    fontScale: fontOf(raw.fontScale),
    theme: themeOf(raw.theme),
    onboardingDone: raw.onboardingDone === true,
    dailyAssignment: assignmentOf(raw.dailyAssignment, activePlanId),
  };
}

export function loadState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return sanitizeState(JSON.parse(raw)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

export function saveState(state: UserState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportPayload(state: UserState): string {
  return JSON.stringify(
    {
      app: "folio",
      exportedAt: new Date().toISOString(),
      state,
    },
    null,
    2,
  );
}

export function stateFromImport(raw: string): UserState | null {
  if (raw.length > 2_000_000) return null;
  const parsed = JSON.parse(raw) as { app?: string; state?: unknown };
  const payload = parsed && parsed.app === "folio" ? parsed.state : parsed;
  return sanitizeState(payload);
}
