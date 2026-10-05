import type { ChapterRef } from "./types";

export function chapterKey(ref: ChapterRef): string {
  return `${ref.bookId}:${ref.chapter}`;
}

export function parseChapterKey(key: string): ChapterRef | null {
  const match = /^([a-z0-9]+):(\d+)$/.exec(key);
  if (!match) return null;
  return { bookId: match[1], chapter: Number(match[2]) };
}

export function bookmarkKey(bookId: string, chapter: number, verse: number): string {
  return `${bookId}:${chapter}:${verse}`;
}
