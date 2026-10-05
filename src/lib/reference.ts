import { getBook, books } from "./books";

const EXTRA: Record<string, string[]> = {
  genesis: ["gen", "ge", "gn"],
  exodus: ["exod", "exo", "ex"],
  leviticus: ["lev", "lv"],
  numbers: ["num", "nm"],
  deuteronomy: ["deut", "dt"],
  joshua: ["josh", "jos"],
  judges: ["judg", "jdg"],
  ruth: ["ru"],
  "1samuel": ["1 sam", "1 sa"],
  "2samuel": ["2 sam", "2 sa"],
  "1kings": ["1 kgs", "1 ki"],
  "2kings": ["2 kgs", "2 ki"],
  "1chronicles": ["1 chr", "1 ch"],
  "2chronicles": ["2 chr", "2 ch"],
  ezra: ["ezr"],
  nehemiah: ["neh"],
  esther: ["esth", "est"],
  job: ["jb"],
  psalms: ["psalm", "ps", "psa"],
  proverbs: ["prov", "prv"],
  ecclesiastes: ["eccl", "ecc"],
  song: ["song of songs", "song of sol", "canticles", "sos"],
  isaiah: ["isa", "is"],
  jeremiah: ["jer"],
  lamentations: ["lam"],
  ezekiel: ["ezek"],
  daniel: ["dan", "da"],
  hosea: ["hos"],
  joel: ["jl"],
  amos: ["am"],
  obadiah: ["obad", "ob"],
  jonah: ["jon"],
  micah: ["mic"],
  nahum: ["nah"],
  habakkuk: ["hab"],
  zephaniah: ["zeph"],
  haggai: ["hag"],
  zechariah: ["zech"],
  malachi: ["mal"],
  matthew: ["matt", "mt"],
  mark: ["mk"],
  luke: ["lk"],
  john: ["jn", "joh"],
  acts: ["ac"],
  romans: ["rom", "ro"],
  "1corinthians": ["1 cor", "1 co"],
  "2corinthians": ["2 cor", "2 co"],
  galatians: ["gal"],
  ephesians: ["eph"],
  philippians: ["phil", "php"],
  colossians: ["col"],
  "1thessalonians": ["1 thess", "1 th"],
  "2thessalonians": ["2 thess", "2 th"],
  "1timothy": ["1 tim", "1 ti"],
  "2timothy": ["2 tim", "2 ti"],
  titus: ["tit"],
  philemon: ["philem", "phm"],
  hebrews: ["heb"],
  james: ["jas"],
  "1peter": ["1 pet", "1 pe"],
  "2peter": ["2 pet", "2 pe"],
  "1john": ["1 jn"],
  "2john": ["2 jn"],
  "3john": ["3 jn"],
  jude: ["jud"],
  revelation: ["rev", "apocalypse"],
};

const ORDINALS: Record<string, string[]> = {
  "1": ["i", "1st", "first"],
  "2": ["ii", "2nd", "second"],
  "3": ["iii", "3rd", "third"],
};

export type ParsedRef = {
  bookId: string;
  chapter?: number;
  verse?: number;
};

export function aliasesFor(bookId: string, name: string): string[] {
  const aliases = new Set<string>([name.toLowerCase(), bookId]);
  for (const extra of EXTRA[bookId] ?? []) aliases.add(extra);
  const numbered = /^(\d)\s+(.+)$/.exec(name.toLowerCase());
  if (numbered) {
    const [, digit, rest] = numbered;
    aliases.add(`${digit}${rest}`);
    aliases.add(`${digit} ${rest}`);
    for (const word of ORDINALS[digit] ?? []) aliases.add(`${word} ${rest}`);
  }
  return [...aliases];
}

function matchesAlias(input: string, alias: string): boolean {
  if (!input.startsWith(alias)) return false;
  if (input.length === alias.length) return true;
  const next = input[alias.length];
  return next === " " || (next >= "0" && next <= "9");
}

export function parseReference(raw: string): ParsedRef | null {
  const input = raw
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!input) return null;

  let best: { bookId: string; alias: string } | null = null;
  for (const book of books) {
    for (const alias of aliasesFor(book.id, book.name)) {
      if (!matchesAlias(input, alias)) continue;
      if (!best || alias.length > best.alias.length) best = { bookId: book.id, alias };
    }
  }
  if (!best) return null;

  const rest = input.slice(best.alias.length).trim();
  if (!rest) return { bookId: best.bookId };
  const match = /^(\d+)(?:\s*[: ]\s*(\d+))?$/.exec(rest);
  if (!match) return null;
  const chapter = Number(match[1]);
  const verse = match[2] ? Number(match[2]) : undefined;
  const book = getBook(best.bookId);
  if (!book || chapter < 1 || chapter > book.chapters) return null;
  if (verse) {
    const count = book.verseCounts[chapter - 1] ?? 0;
    if (verse < 1 || verse > count) return null;
  }
  return { bookId: best.bookId, chapter, verse };
}

export function referenceLabel(bookName: string, chapter?: number, verse?: number): string {
  if (!chapter) return bookName;
  return verse ? `${bookName} ${chapter}:${verse}` : `${bookName} ${chapter}`;
}
