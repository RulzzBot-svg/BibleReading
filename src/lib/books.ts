import catalog from "../data/catalog.json";
import { BOOK_META, SECTIONS, type BookMeta, type SectionId } from "../data/books";

export type Book = BookMeta & {
  chapters: number;
  verseCounts: number[];
  verses: number;
};

const metaById = new Map(BOOK_META.map((book) => [book.id, book]));

export const books: Book[] = catalog.books.map((entry) => {
  const meta = metaById.get(entry.id);
  if (!meta) throw new Error(`Missing description for ${entry.id}`);
  return {
    ...meta,
    chapters: entry.chapters,
    verseCounts: entry.verseCounts,
    verses: entry.verseCounts.reduce((sum, count) => sum + count, 0),
  };
});

const byId = new Map(books.map((book) => [book.id, book]));

export function getBook(id: string | undefined): Book | undefined {
  if (!id) return undefined;
  return byId.get(id);
}

export function chapterCount(bookId: string): number {
  return byId.get(bookId)?.chapters ?? 0;
}

export function bookOrder(): string[] {
  return books.map((book) => book.id);
}

export function sectionsWithBooks(): Array<(typeof SECTIONS)[number] & { books: Book[] }> {
  return SECTIONS.map((section) => ({
    ...section,
    books: books.filter((book) => book.section === section.id),
  }));
}

export function totalChapters(): number {
  return books.reduce((sum, book) => sum + book.chapters, 0);
}

export type { SectionId };
