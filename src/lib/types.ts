export type ChapterRef = {
  bookId: string;
  chapter: number;
};

export type Bookmark = {
  bookId: string;
  chapter: number;
  verse: number;
};

export type DailyAssignment = {
  date: string;
  planId: string;
  keys: string[];
};

export type ThemeChoice = "system" | "light" | "dark";

export type UserState = {
  version: 1;
  readChapters: string[];
  readDays: string[];
  bookmarks: Bookmark[];
  lastPosition: (ChapterRef & { verse?: number }) | null;
  activePlanId: string | null;
  planStartDate: string | null;
  chaptersPerDay: number;
  reminderEnabled: boolean;
  reminderTime: string;
  fontScale: number;
  theme: ThemeChoice;
  onboardingDone: boolean;
  dailyAssignment: DailyAssignment | null;
};

export type Segment = {
  bookId: string;
  from?: number;
  to?: number;
  why?: string;
};

export type Plan = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  fit: string;
  covers: "all" | "part";
  steps: Segment[];
};
