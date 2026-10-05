import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../components/Icons";
import { chapterPath, loadBook } from "../lib/bible";
import { bookOrder, chapterCount, getBook } from "../lib/books";
import { canonicalNeighbor } from "../lib/planner";
import { FONT_SCALES } from "../lib/storage";
import { useStore } from "../state/Store";

export function Reader() {
  const { bookId = "", chapter: chapterParam = "" } = useParams();
  const [search] = useSearchParams();
  const chapter = Number(chapterParam);
  const verseParam = Number(search.get("v") || "");
  const book = getBook(bookId);
  const navigate = useNavigate();
  const { state, isRead, isBookmarked, markRead, markUnread, rememberPlace, toggleBookmark, setFontScale } = useStore();
  const [verses, setVerses] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [openVerse, setOpenVerse] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const scroller = useRef<HTMLDivElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const valid = Boolean(book && Number.isInteger(chapter) && chapter >= 1 && chapter <= (book?.chapters ?? 0));

  const placeRef = useRef(rememberPlace);
  placeRef.current = rememberPlace;

  useEffect(() => {
    if (!book || !valid) return;
    let cancel = false;
    setVerses(null);
    setError("");
    setOpenVerse(null);
    loadBook(book.id)
      .then((chapters) => {
        if (!cancel) setVerses(chapters[chapter - 1] ?? null);
      })
      .catch(() => {
        if (!cancel) setError("This chapter didn't load. If you're offline, open it once while connected and it will stay on the phone.");
      });
    return () => {
      cancel = true;
    };
  }, [attempt, book, chapter, valid]);

  useEffect(() => {
    if (!book || !valid) return;
    placeRef.current({
      bookId: book.id,
      chapter,
      verse: Number.isInteger(verseParam) && verseParam > 0 ? verseParam : undefined,
    });
  }, [book, chapter, valid, verseParam]);

  useEffect(() => {
    if (!verses) return;
    if (Number.isInteger(verseParam) && verseParam > 0) {
      document.getElementById(`v-${verseParam}`)?.scrollIntoView({ block: "center" });
    } else {
      scroller.current?.scrollTo(0, 0);
    }
  }, [verses, verseParam, bookId, chapter]);

  useEffect(() => {
    if (!book || !valid) return;
    const current = book;
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = canonicalNeighbor(bookOrder(), chapterCount, current.id, chapter, direction);
      if (next) navigate(chapterPath(next.bookId, next.chapter));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [book, chapter, navigate, valid]);

  if (!book || !valid) {
    return (
      <div className="screen">
        <h1>That chapter isn't in this Bible</h1>
        <Link to="/bible">Back to the Bible</Link>
      </div>
    );
  }

  const current = book;
  const read = isRead(current.id, chapter);
  const continueTarget = canonicalNeighbor(bookOrder(), chapterCount, current.id, chapter, 1);

  function moveCanonical(direction: -1 | 1) {
    const next = canonicalNeighbor(bookOrder(), chapterCount, current.id, chapter, direction);
    if (next) navigate(chapterPath(next.bookId, next.chapter));
  }

  function continueReading() {
    if (!read) markRead([{ bookId: current.id, chapter }]);
    if (continueTarget) navigate(chapterPath(continueTarget.bookId, continueTarget.chapter));
  }

  function onScroll() {
    const element = scroller.current;
    if (!element) return;
    const max = element.scrollHeight - element.clientHeight;
    setProgress(max <= 0 ? 1 : element.scrollTop / max);
  }

  function scaleBy(direction: -1 | 1) {
    const index = FONT_SCALES.findIndex((scale) => Math.abs(scale - state.fontScale) < 0.03);
    const start = index === -1 ? 1 : index;
    const next = FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, start + direction))];
    setFontScale(next);
  }

  async function copyVerse(verse: number, text: string) {
    const line = `${current.name} ${chapter}:${verse} (KJV) ${text}`;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(verse);
      window.setTimeout(() => setCopied((current) => (current === verse ? null : current)), 1600);
    } catch {
      setCopied(null);
      setError("This browser didn't allow copying. You can still select the verse.");
    }
  }

  return (
    <article className="reader">
      <header className="reader-top">
        <Link to={`/bible/${book.id}`} className="icon-btn" aria-label={`Chapters in ${book.name}`}>
          <Icon name="back" />
        </Link>
        <div className="reader-title">
          <Link to={`/books/${book.id}`}>{book.name}</Link>
          <h1>Chapter {chapter}</h1>
        </div>
        <div className="font-controls">
          <button type="button" onClick={() => scaleBy(-1)} aria-label="Smaller text">
            A−
          </button>
          <button type="button" onClick={() => scaleBy(1)} aria-label="Larger text">
            A+
          </button>
        </div>
        <span className="read-progress" style={{ transform: `scaleX(${progress})` }} />
      </header>

      <div
        className="reader-scroll"
        ref={scroller}
        onScroll={onScroll}
        onTouchStart={(event) => {
          const point = event.changedTouches[0];
          touch.current = { x: point.clientX, y: point.clientY };
        }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const point = event.changedTouches[0];
          const dx = point.clientX - touch.current.x;
          const dy = point.clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) < 72 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
          moveCanonical(dx < 0 ? 1 : -1);
        }}
      >
        <p className="reader-idea">{book.idea}</p>
        {error && (
          <div className="banner">
            <p>{error}</p>
            <button type="button" className="btn-text" onClick={() => setAttempt((value) => value + 1)}>
              Try again
            </button>
          </div>
        )}
        {verses && (
          <ol className="verses">
            {verses.map((text, index) => {
              const verse = index + 1;
              const open = openVerse === verse;
              const marked = isBookmarked(book.id, chapter, verse);
              return (
                <li key={verse} id={`v-${verse}`} className={verse === verseParam ? "is-target" : ""}>
                  <button type="button" className={open ? "verse is-open" : "verse"} onClick={() => setOpenVerse(open ? null : verse)}>
                    <span className="verse-no">{verse}</span>
                    <span className="verse-text">{text}</span>
                  </button>
                  {open && (
                    <div className="verse-actions">
                      <button type="button" onClick={() => toggleBookmark({ bookId: book.id, chapter, verse })}>
                        {marked ? "Remove bookmark" : "Bookmark"}
                      </button>
                      <button type="button" onClick={() => void copyVerse(verse, text)}>
                        {copied === verse ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        {!verses && !error && <p className="muted reader-wait">Opening the chapter…</p>}
        {read && (
          <button type="button" className="btn-text unread" onClick={() => markUnread([{ bookId: book.id, chapter }])}>
            Mark chapter unread
          </button>
        )}
      </div>

      <footer className="reader-actions">
        <button type="button" className="icon-btn" onClick={() => moveCanonical(-1)} aria-label="Previous chapter" disabled={chapter === 1 && bookOrder()[0] === book.id}>
          <Icon name="prev" />
        </button>
        <button type="button" className="btn" onClick={continueReading} disabled={read && !continueTarget}>
          {read ? (continueTarget ? "Continue" : "End of the Bible") : continueTarget ? "Mark & continue" : "Mark read"}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => moveCanonical(1)}
          aria-label="Next chapter"
          disabled={chapter === book.chapters && bookOrder().at(-1) === book.id}
        >
          <Icon name="next" />
        </button>
      </footer>
    </article>
  );
}
