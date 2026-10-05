import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SECTIONS } from "../data/books";
import { PLANS } from "../data/plans";
import { books, chapterCount, totalChapters } from "./books";
import { addDays, diffDays, isValidISODate } from "./dates";
import { chapterKey } from "./keys";
import { finishDate, flattenPlan, paceFor, resolveDailyAssignment } from "./planner";
import { aliasesFor, parseReference } from "./reference";
import { sanitizeState } from "./storage";
import { currentStreak, longestStreak } from "./streaks";

describe("bible text", () => {
  it("ships the public-domain King James text at the familiar verses", () => {
    const genesis = JSON.parse(readFileSync("public/bible/genesis.json", "utf8")) as { chapters: string[][] };
    const john = JSON.parse(readFileSync("public/bible/john.json", "utf8")) as { chapters: string[][] };
    const psalms = JSON.parse(readFileSync("public/bible/psalms.json", "utf8")) as { chapters: string[][] };
    expect(genesis.chapters).toHaveLength(50);
    expect(genesis.chapters[0][0]).toMatch(/^In the beginning God created/);
    expect(john.chapters[2][15]).toMatch(/For God so loved the world/);
    expect(psalms.chapters).toHaveLength(150);
    expect(psalms.chapters[22][0]).toMatch(/The LORD is my shepherd/);
    expect(psalms.chapters[118]).toHaveLength(176);
  });

  it("describes every book in the catalog", () => {
    expect(books).toHaveLength(66);
    expect(totalChapters()).toBe(1189);
    expect(books.reduce((sum, book) => sum + book.verses, 0)).toBe(31102);
    const sections = new Set(books.map((book) => book.section));
    expect(sections.size).toBe(SECTIONS.length);
  });
});

describe("reading orders", () => {
  it("covers the whole Bible exactly once in the full plans, and stays in range otherwise", () => {
    const everything = new Set<string>();
    for (const book of books) {
      for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
        everything.add(chapterKey({ bookId: book.id, chapter }));
      }
    }
    for (const plan of PLANS) {
      const flat = flattenPlan(plan, chapterCount);
      const keys = flat.map(chapterKey);
      expect(new Set(keys).size, plan.id).toBe(keys.length);
      if (plan.covers === "all") {
        expect(keys.length, plan.id).toBe(everything.size);
        expect(new Set(keys), plan.id).toEqual(everything);
      } else {
        expect(keys.length, plan.id).toBeGreaterThan(0);
        for (const key of keys) expect(everything.has(key), `${plan.id} ${key}`).toBe(true);
      }
    }
  });
});

describe("streaks", () => {
  it("keeps a streak alive through today or yesterday and resets after a gap", () => {
    expect(currentStreak(["2026-10-03", "2026-10-04", "2026-10-05"], "2026-10-05")).toBe(3);
    expect(currentStreak(["2026-10-03", "2026-10-04"], "2026-10-05")).toBe(2);
    expect(currentStreak(["2026-10-03"], "2026-10-05")).toBe(0);
    expect(longestStreak(["2026-10-01", "2026-10-02", "2026-10-04"])).toBe(2);
  });
});

describe("planner", () => {
  const flat = [
    { bookId: "mark", chapter: 1 },
    { bookId: "mark", chapter: 2 },
    { bookId: "mark", chapter: 3 },
    { bookId: "mark", chapter: 4 },
  ];

  it("locks today's chapters even after they are marked read", () => {
    const read = new Set<string>();
    const first = resolveDailyAssignment(null, "gospels", flat, read, 2, "2026-10-05");
    expect(first?.keys).toEqual(["mark:1", "mark:2"]);
    read.add("mark:1");
    read.add("mark:2");
    const sameDay = resolveDailyAssignment(first, "gospels", flat, read, 2, "2026-10-05");
    expect(sameDay?.keys).toEqual(["mark:1", "mark:2"]);
    const nextDay = resolveDailyAssignment(sameDay, "gospels", flat, read, 2, "2026-10-06");
    expect(nextDay?.keys).toEqual(["mark:3", "mark:4"]);
  });

  it("does not call you behind before the day is underway", () => {
    const pace = paceFor(flat, new Set(), "2026-10-05", 2, "2026-10-05");
    expect(pace.status).toBe("on-pace");
    expect(pace.behind).toBe(0);
    const behind = paceFor(flat, new Set(["mark:1"]), "2026-10-05", 2, "2026-10-07");
    expect(behind.status).toBe("behind");
    expect(behind.behind).toBe(3);
  });

  it("estimates a finish date from what is left", () => {
    expect(finishDate(4, 2, "2026-10-05")).toBe("2026-10-06");
    expect(diffDays("2026-10-05", addDays("2026-10-05", 10))).toBe(10);
    expect(isValidISODate("2026-02-31")).toBe(false);
  });
});

describe("references", () => {
  it("parses common citations", () => {
    expect(parseReference("John 3:16")).toEqual({ bookId: "john", chapter: 3, verse: 16 });
    expect(parseReference("jn 3:16")).toEqual({ bookId: "john", chapter: 3, verse: 16 });
    expect(parseReference("1 Cor. 13")).toEqual({ bookId: "1corinthians", chapter: 13 });
    expect(parseReference("Psalm 23")).toEqual({ bookId: "psalms", chapter: 23 });
    expect(parseReference("Song of Solomon 2:1")).toEqual({ bookId: "song", chapter: 2, verse: 1 });
    expect(parseReference("Genesis")).toEqual({ bookId: "genesis" });
    expect(parseReference("not a book")).toBeNull();
    expect(parseReference("John 99")).toBeNull();
  });

  it("does not give the same alias to two books", () => {
    const owner = new Map<string, string>();
    for (const book of books) {
      for (const alias of aliasesFor(book.id, book.name)) {
        expect(owner.get(alias) ?? book.id, alias).toBe(book.id);
        owner.set(alias, book.id);
      }
    }
  });
});

describe("saved progress", () => {
  it("drops chapters and plans that are not in this Bible", () => {
    const state = sanitizeState({
      onboardingDone: true,
      readChapters: ["genesis:1", "genesis:999", "nope:1"],
      readDays: ["2026-10-05", "yesterday"],
      activePlanId: "not-a-plan",
      chaptersPerDay: 99,
      theme: "dark",
    });
    expect(state?.readChapters).toEqual(["genesis:1"]);
    expect(state?.readDays).toEqual(["2026-10-05"]);
    expect(state?.activePlanId).toBeNull();
    expect(state?.chaptersPerDay).toBe(20);
    expect(state?.theme).toBe("dark");
    expect(state?.onboardingDone).toBe(true);
  });
});
