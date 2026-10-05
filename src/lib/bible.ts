const cache = new Map<string, string[][]>();

export async function loadBook(bookId: string): Promise<string[][]> {
  const cached = cache.get(bookId);
  if (cached) return cached;
  const base = import.meta.env.BASE_URL || "/";
  const response = await fetch(`${base}bible/${bookId}.json`);
  if (!response.ok) throw new Error(`Could not load ${bookId}`);
  const data = (await response.json()) as { chapters: string[][] };
  cache.set(bookId, data.chapters);
  return data.chapters;
}

export function chapterPath(bookId: string, chapter: number, verse?: number): string {
  const path = `/bible/${bookId}/${chapter}`;
  return verse ? `${path}?v=${verse}` : path;
}

export function segmentLabel(bookName: string, from?: number, to?: number, chapters?: number): string {
  const start = from ?? 1;
  const end = to ?? chapters ?? start;
  if (!from && !to) return bookName;
  if (start === end) return `${bookName} ${start}`;
  return `${bookName} ${start}–${end}`;
}
