import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icons";
import { getPlan } from "../data/plans";
import { chapterPath, segmentLabel } from "../lib/bible";
import { chapterCount, getBook } from "../lib/books";
import { durationLabel, flattenPlan } from "../lib/planner";
import { useStore } from "../state/Store";

export function PlanDetail() {
  const { planId = "" } = useParams();
  const plan = getPlan(planId);
  const navigate = useNavigate();
  const { state, startPlan, restartPace, isRead } = useStore();
  if (!plan) {
    return (
      <div className="screen">
        <h1>That reading order isn't here</h1>
        <Link to="/guide">Back to the guide</Link>
      </div>
    );
  }

  const flat = flattenPlan(plan, chapterCount);
  const active = state.activePlanId === plan.id;
  let done = 0;
  for (const ref of flat) if (isRead(ref.bookId, ref.chapter)) done += 1;

  return (
    <div className="screen">
      <Link className="back" to="/guide">
        <Icon name="back" /> Guide
      </Link>
      <p className="eyebrow">{plan.kicker}</p>
      <h1>{plan.title}</h1>
      <p className="lede">{plan.summary}</p>
      <p className="fit">{plan.fit}</p>
      <p className="muted">
        {durationLabel(flat.length, state.chaptersPerDay)}
        {done > 0 ? ` · ${done} already read` : ""}
      </p>
      {active ? (
        <div className="action-stack">
          <Link className="btn btn-block" to="/">
            Continue this plan
          </Link>
          <button type="button" className="btn-text" onClick={restartPace}>
            Restart the pace from today
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-block"
          onClick={() => {
            startPlan(plan.id);
            navigate("/");
          }}
        >
          Read in this order
        </button>
      )}
      <ol className="step-list">
        {plan.steps.map((step, index) => {
          const book = getBook(step.bookId);
          if (!book) return null;
          const partial = Boolean(step.from || step.to);
          const from = step.from ?? 1;
          const to = step.to ?? book.chapters;
          let complete = true;
          for (let chapter = from; chapter <= to; chapter += 1) {
            if (!isRead(book.id, chapter)) {
              complete = false;
              break;
            }
          }
          return (
            <li key={`${step.bookId}-${from}-${to}-${index}`} className={complete ? "is-done" : ""}>
              <Link to={chapterPath(book.id, from)}>
                <span className="step-index">{index + 1}</span>
                <span>
                  <strong>{segmentLabel(book.name, step.from, step.to, book.chapters)}</strong>
                  <span className="idea">{partial ? step.why : book.idea}</span>
                  {!partial && step.why ? <span className="placement">{step.why}</span> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
