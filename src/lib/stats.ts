import type { Book } from "./books";
import { chapterKey } from "./keys";

export type ReadingStats = {
  chapters: number;
  readChapters: number;
  booksDone: number;
  bookCount: number;
  sections: Record<string, { read: number; total: number }>;
};

export function readingStats(read: Set<string>, library: Book[]): ReadingStats {
  let chapters = 0;
  let readChapters = 0;
  let booksDone = 0;
  const sections: ReadingStats["sections"] = {};
  for (const book of library) {
    chapters += book.chapters;
    let bookRead = 0;
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      if (read.has(chapterKey({ bookId: book.id, chapter }))) bookRead += 1;
    }
    readChapters += bookRead;
    if (bookRead === book.chapters) booksDone += 1;
    const section = sections[book.section] ?? { read: 0, total: 0 };
    section.read += bookRead;
    section.total += book.chapters;
    sections[book.section] = section;
  }
  return { chapters, readChapters, booksDone, bookCount: library.length, sections };
}

export function percentOf(part: number, whole: number): number {
  if (whole <= 0 || part <= 0) return 0;
  if (part >= whole) return 100;
  return Math.max(1, Math.min(99, Math.round((part / whole) * 100)));
}
