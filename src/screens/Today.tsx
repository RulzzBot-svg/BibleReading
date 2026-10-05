import { Link } from "react-router-dom";
import { getPlan } from "../data/plans";
import { chapterPath, segmentLabel } from "../lib/bible";
import { chapterCount, getBook } from "../lib/books";
import { formatLongDate, isAfterReminder, recentDays, todayISO, weekdayNarrow, formatMediumDate } from "../lib/dates";
import { parseChapterKey } from "../lib/keys";
import { finishDate, flattenPlan, paceFor, stepFor } from "../lib/planner";
import { currentStreak, longestStreak } from "../lib/streaks";
import { percentOf } from "../lib/stats";
import { useStore } from "../state/Store";

export function Today() {
  const { state, now, readSet, isRead, markRead, toggleChapter, logToday } = useStore();
  const today = todayISO(now);
  const streak = currentStreak(state.readDays, today);
  const longest = longestStreak(state.readDays);
  const readToday = state.readDays.includes(today);
  const plan = getPlan(state.activePlanId);
  const flat = plan ? flattenPlan(plan, chapterCount) : [];
  const assignment = (state.dailyAssignment?.keys ?? [])
    .map((key) => parseChapterKey(key))
    .filter((ref): ref is NonNullable<typeof ref> => Boolean(ref));
  const remaining = assignment.filter((ref) => !isRead(ref.bookId, ref.chapter));
  const allDone = plan ? assignment.length > 0 && remaining.length === 0 : false;
  const planFinished = plan ? flat.every((ref) => readSet.has(`${ref.bookId}:${ref.chapter}`)) : false;
  const pace = plan && state.planStartDate ? paceFor(flat, readSet, state.planStartDate, state.chaptersPerDay, today) : null;
  const showReminder = state.reminderEnabled && isAfterReminder(state.reminderTime, now) && !readToday;
  const days = recentDays(today, 7);

  const continueRef = state.lastPosition;
  const continueBook = continueRef ? getBook(continueRef.bookId) : undefined;
  const continueVerse =
    state.lastPosition &&
    continueRef &&
    state.lastPosition.bookId === continueRef.bookId &&
    state.lastPosition.chapter === continueRef.chapter
      ? state.lastPosition.verse
      : undefined;

  return (
    <div className="screen">
      <p className="eyebrow">{formatLongDate(now)}</p>
      <div className="today-head">
        <h1>Today</h1>
        <p className="streak-pill" aria-label={`${streak} day streak. Longest is ${longest}.`}>
          <strong>{streak}</strong>
          <span>{streak === 1 ? "day" : "days"}</span>
        </p>
      </div>

      {showReminder && (
        <p className="banner">This is the time you set aside. Today's reading is just below.</p>
      )}

      {plan && planFinished && (
        <section className="card">
          <p className="kicker">{plan.title}</p>
          <h2>You've read every chapter in this plan.</h2>
          <p className="muted">The streak still counts any day you mark a chapter, or count the day below.</p>
          <Link className="btn btn-block" to="/guide">
            Choose another order
          </Link>
        </section>
      )}

      {plan && !planFinished && (
        <section className="card">
          <div className="card-kicker">
            <p className="kicker">{plan.title}</p>
            <p className="muted">{percentOf(pace?.readInPlan ?? 0, flat.length)}% of this plan</p>
          </div>
          <h2>{assignment.length === 0 ? "Nothing left unread" : allDone ? "That's today's reading" : "Today's reading"}</h2>
          <ol className="assign-list">
            {assignment.map((ref, index) => {
              const book = getBook(ref.bookId);
              if (!book) return null;
              const read = isRead(ref.bookId, ref.chapter);
              const step = stepFor(plan, ref, chapterCount);
              const label = segmentLabel(book.name, ref.chapter, ref.chapter);
              const partial = Boolean(step?.from || step?.to);
              const previous = assignment[index - 1];
              const continues = Boolean(previous && previous.bookId === ref.bookId && previous.chapter + 1 === ref.chapter);
              const note = continues ? "Continues" : partial ? step?.why : book.idea;
              return (
                <li key={`${ref.bookId}:${ref.chapter}`} className={read ? "is-read" : ""}>
                  <button
                    type="button"
                    className={read ? "check is-on" : "check"}
                    aria-label={read ? `Mark ${label} unread` : `Mark ${label} read`}
                    aria-pressed={read}
                    onClick={() => toggleChapter(ref)}
                  >
                    <span />
                  </button>
                  <Link to={chapterPath(ref.bookId, ref.chapter)}>
                    <strong>{label}</strong>
                    <span>{note}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          {remaining.length > 0 && (
            <button type="button" className="btn btn-block" onClick={() => markRead(remaining)}>
              Mark these read
            </button>
          )}
          {allDone && !readToday && (
            <button type="button" className="btn btn-block" onClick={logToday}>
              Count today toward your streak
            </button>
          )}
          {pace && <p className="pace">{paceSentence(pace)}</p>}
          {pace && pace.remaining > 0 && (
            <p className="muted finish">
              At {state.chaptersPerDay} a day, the last chapter is {formatMediumDate(finishDate(pace.remaining, state.chaptersPerDay, today))}.
            </p>
          )}
        </section>
      )}

      {!plan && (
        <section className="card">
          <p className="kicker">No reading order yet</p>
          <h2>Pick a way through the library.</h2>
          <p className="muted">
            The guide tells you which book comes next, and what that book is trying to do. You can also just open Genesis.
          </p>
          <Link className="btn btn-block" to="/guide">
            Open the guide
          </Link>
          <Link className="btn btn-ghost btn-block" to="/bible/genesis/1">
            Start at Genesis 1
          </Link>
        </section>
      )}

      {continueBook && continueRef && (
        <Link className="continue" to={chapterPath(continueRef.bookId, continueRef.chapter, continueVerse)}>
          <span className="kicker">Continue</span>
          <strong>
            {continueBook.name} {continueRef.chapter}
          </strong>
          <span>{continueBook.idea}</span>
        </Link>
      )}

      <section className="week-block" aria-label="This week">
        <h2>Last 7 days</h2>
        <ol className="week">
          {days.map((day) => {
            const on = state.readDays.includes(day);
            return (
              <li key={day} className={day === today ? "is-today" : ""}>
                <span>{weekdayNarrow(day)}</span>
                <span className={on ? "dot is-on" : "dot"} aria-label={on ? `${day} read` : `${day} not read`} />
              </li>
            );
          })}
        </ol>
        {longest > 0 && <p className="muted">Longest streak: {longest} {longest === 1 ? "day" : "days"}.</p>}
      </section>
    </div>
  );
}

function paceSentence(pace: { status: string; behind: number; ahead: number }): string {
  if (pace.status === "done") return "You have finished this plan.";
  if (pace.status === "behind") {
    const noun = pace.behind === 1 ? "chapter" : "chapters";
    return `You are ${pace.behind} ${noun} behind the pace you set. Today's list is only the next unread, so missed days do not pile up.`;
  }
  if (pace.status === "ahead") {
    const noun = pace.ahead === 1 ? "chapter" : "chapters";
    return `You are ${pace.ahead} ${noun} ahead of the pace you set.`;
  }
  return "On the pace you set.";
}
