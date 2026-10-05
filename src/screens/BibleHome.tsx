import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { chapterPath } from "../lib/bible";
import { books, sectionsWithBooks } from "../lib/books";
import { parseReference, referenceLabel } from "../lib/reference";
import { percentOf } from "../lib/stats";
import { useStore } from "../state/Store";
import { getBook } from "../lib/books";

export function BibleHome() {
  const { isRead } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const sections = sectionsWithBooks();
  const parsed = parseReference(query);
  const parsedBook = parsed ? getBook(parsed.bookId) : undefined;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || (parsed && parsed.chapter)) return sections;
    return sections
      .map((section) => ({
        ...section,
        books: section.books.filter((book) => book.name.toLowerCase().includes(q)),
      }))
      .filter((section) => section.books.length > 0);
  }, [parsed, query, sections]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!parsed) return;
    if (parsed.chapter) navigate(chapterPath(parsed.bookId, parsed.chapter, parsed.verse));
    else navigate(`/bible/${parsed.bookId}`);
  }

  const nothing = visible.length === 0;

  return (
    <div className="screen">
      <p className="eyebrow">King James Version</p>
      <h1>Bible</h1>
      <form className="search" onSubmit={onSubmit}>
        <label htmlFor="bible-search">Find a book or a reference</label>
        <input
          id="bible-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="John 3:16 or Psalms"
          enterKeyHint="go"
          autoCapitalize="off"
          autoCorrect="off"
        />
      </form>

      {parsed && parsed.chapter && parsedBook && (
        <Link className="jump" to={chapterPath(parsed.bookId, parsed.chapter, parsed.verse)}>
          Open {referenceLabel(parsedBook.name, parsed.chapter, parsed.verse)}
        </Link>
      )}

      {nothing && <p className="muted">No book by that name. Try a reference like “Romans 8”.</p>}

      {visible.map((section, index) => {
        const previous = visible[index - 1];
        const showTestament = !previous || previous.testament !== section.testament;
        return (
          <section key={section.id} className="book-section">
            {showTestament && <h2 className="testament">{section.testament}</h2>}
            <header className="section-head">
              <h3>{section.label}</h3>
              <p>{section.blurb}</p>
            </header>
            <ul className="book-list">
              {section.books.map((book) => {
                let read = 0;
                for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
                  if (isRead(book.id, chapter)) read += 1;
                }
                return (
                  <li key={book.id}>
                    <Link to={`/bible/${book.id}`} className="book-row">
                      <span className="book-name">{book.name}</span>
                      <span className="book-idea">{book.idea}</span>
                      <span className="book-meta">
                        {read}/{book.chapters}
                      </span>
                      <span className="meter" aria-hidden="true">
                        <span style={{ width: `${percentOf(read, book.chapters)}%` }} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className="fine-print">
        {books.length} books · public-domain King James text. Descriptions in Folio are a reading guide, not a commentary.
      </p>
    </div>
  );
}
