import { Link } from "react-router-dom";
import { PLANS } from "../data/plans";
import { chapterCount } from "../lib/books";
import { durationLabel, flattenPlan } from "../lib/planner";
import { useStore } from "../state/Store";

const PATHS = ["first-time", "spine", "chronological", "canonical", "nt-first"];
const SHORT = ["gospels", "torah", "wisdom", "letters"];

export function Guide() {
  const { state } = useStore();
  return (
    <div className="screen">
      <p className="eyebrow">Reading orders</p>
      <h1>Guide</h1>
      <div className="prose">
        <p>
          The Bible is a library. Law, history, songs, prophecy, four gospels, and a stack of letters were written across
          centuries and bound together later. The printed order is a good shelf. It is not always the best first path.
        </p>
        <p>
          Pick an order. Folio hands you the next unread chapters each day and tells you what each book is doing. Miss a
          day and the missed chapters do not pile onto tomorrow. The plan waits at the next unread page. The streak is
          separate: it is simply how many days in a row you have shown up.
        </p>
      </div>
      <PlanGroup title="Ways through" ids={PATHS} perDay={state.chaptersPerDay} activeId={state.activePlanId} />
      <PlanGroup title="Shorter paths" ids={SHORT} perDay={state.chaptersPerDay} activeId={state.activePlanId} />
    </div>
  );
}

function PlanGroup({
  title,
  ids,
  perDay,
  activeId,
}: {
  title: string;
  ids: string[];
  perDay: number;
  activeId: string | null;
}) {
  const plans = ids.map((id) => PLANS.find((plan) => plan.id === id)).filter((plan) => plan != null);
  return (
    <section className="plan-group">
      <h2>{title}</h2>
      <ul className="plan-list">
        {plans.map((plan) => {
          const count = flattenPlan(plan, chapterCount).length;
          return (
            <li key={plan.id}>
              <Link to={`/guide/${plan.id}`} className={activeId === plan.id ? "plan-card is-active" : "plan-card"}>
                <span className="kicker">
                  {plan.kicker}
                  {activeId === plan.id ? " · current" : ""}
                </span>
                <strong>{plan.title}</strong>
                <span>{plan.summary}</span>
                <span className="plan-meta">{durationLabel(count, perDay)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
