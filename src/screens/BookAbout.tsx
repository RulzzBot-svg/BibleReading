import { Link, useParams } from "react-router-dom";
import { Icon } from "../components/Icons";
import { PLANS } from "../data/plans";
import { SECTIONS } from "../data/books";
import { chapterPath } from "../lib/bible";
import { getBook } from "../lib/books";
import { useStore } from "../state/Store";

export function BookAbout() {
  const { bookId = "" } = useParams();
  const book = getBook(bookId);
  const { isRead } = useStore();
  if (!book) {
    return (
      <div className="screen">
        <h1>That book isn't here</h1>
        <Link to="/bible">Back to the Bible</Link>
      </div>
    );
  }

  const section = SECTIONS.find((item) => item.id === book.section);
  let start = 1;
  for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
    if (!isRead(book.id, chapter)) {
      start = chapter;
      break;
    }
  }
  const appearances = PLANS.filter((plan) => plan.steps.some((step) => step.bookId === book.id));

  return (
    <div className="screen">
      <Link className="back" to={`/bible/${book.id}`}>
        <Icon name="back" /> {book.name}
      </Link>
      <p className="eyebrow">{section ? `${section.testament} · ${section.label}` : ""}</p>
      <h1>{book.name}</h1>
      <p className="lede">{book.idea}</p>
      <p className="about">{book.about}</p>
      <p className="muted">
        {book.chapters} {book.chapters === 1 ? "chapter" : "chapters"} · {book.verses.toLocaleString()} verses
      </p>
      <Link className="btn btn-block" to={chapterPath(book.id, start)}>
        Read {book.name} {start}
      </Link>
      {appearances.length > 0 && (
        <section>
          <h2>Where it sits</h2>
          <ul className="mention-list">
            {appearances.map((plan) => (
              <li key={plan.id}>
                <Link to={`/guide/${plan.id}`}>
                  <strong>{plan.title}</strong>
                  <span>{plan.kicker}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
