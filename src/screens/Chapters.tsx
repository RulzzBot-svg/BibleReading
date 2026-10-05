import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icons";
import { chapterPath } from "../lib/bible";
import { getBook } from "../lib/books";
import { percentOf } from "../lib/stats";
import { useStore } from "../state/Store";

export function Chapters() {
  const { bookId = "" } = useParams();
  const book = getBook(bookId);
  const { isRead, state } = useStore();
  if (!book) {
    return (
      <div className="screen">
        <h1>That book isn't here</h1>
        <Link to="/bible">Back to the Bible</Link>
      </div>
    );
  }

  let read = 0;
  for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
    if (isRead(book.id, chapter)) read += 1;
  }
  const here = state.lastPosition?.bookId === book.id ? state.lastPosition.chapter : undefined;
  const groups: number[][] = [];
  for (let start = 1; start <= book.chapters; start += 10) {
    const row: number[] = [];
    for (let chapter = start; chapter < start + 10 && chapter <= book.chapters; chapter += 1) row.push(chapter);
    groups.push(row);
  }

  return (
    <div className="screen">
      <Link className="back" to="/bible">
        <Icon name="back" /> Bible
      </Link>
      <p className="eyebrow">{book.testament === "ot" ? "Old Testament" : "New Testament"}</p>
      <h1>{book.name}</h1>
      <p className="lede">{book.idea}</p>
      <p className="muted">
        {read} of {book.chapters} chapters read
        {read > 0 ? ` · ${percentOf(read, book.chapters)}%` : ""}
      </p>
      <Link className="btn-text" to={`/books/${book.id}`}>
        What this book is
      </Link>
      <div className="chapter-wrap">
        {groups.map((group) => (
          <div key={group[0]} className="chapter-group">
            {book.chapters > 40 && (
              <p className="chapter-range">
                {group[0]}–{group[group.length - 1]}
              </p>
            )}
            <div className="chapter-grid">
              {group.map((chapter) => (
                <Link
                  key={chapter}
                  to={chapterPath(book.id, chapter)}
                  className={[
                    "chapter-cell",
                    isRead(book.id, chapter) ? "is-read" : "",
                    here === chapter ? "is-here" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={`${book.name} ${chapter}${isRead(book.id, chapter) ? ", read" : ""}`}
                >
                  {chapter}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
