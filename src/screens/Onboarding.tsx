import { useMemo, useState } from "react";
import { Mark } from "../components/Icons";
import { getPlan } from "../data/plans";
import { chapterCount, totalChapters } from "../lib/books";
import { formatMediumDate, todayISO } from "../lib/dates";
import { finishDate, flattenPlan } from "../lib/planner";
import { requestNotificationPermission } from "../lib/reminders";
import { useStore } from "../state/Store";

const FEATURED = ["first-time", "spine", "canonical"];

export function Onboarding() {
  const { finishOnboarding } = useStore();
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState<string>("first-time");
  const [perDay, setPerDay] = useState(3);
  const [remind, setRemind] = useState(true);
  const [time, setTime] = useState("08:00");
  const [pending, setPending] = useState(false);

  const plan = planId ? getPlan(planId) : undefined;
  const chapterTotal = useMemo(() => (plan ? flattenPlan(plan, chapterCount).length : totalChapters()), [plan]);
  const finish = formatMediumDate(finishDate(chapterTotal, perDay, todayISO()));
  const yearPace = Math.max(1, Math.ceil(chapterTotal / 365));

  async function finishSetup() {
    if (pending) return;
    setPending(true);
    if (remind) await requestNotificationPermission();
    finishOnboarding({
      planId: planId || null,
      chaptersPerDay: perDay,
      reminderEnabled: remind,
      reminderTime: time,
    });
  }

  return (
    <div className="onboard">
      <div className="onboard-progress" aria-hidden="true">
        {[0, 1, 2, 3].map((dot) => (
          <span key={dot} className={dot === step ? "is-on" : dot < step ? "is-done" : ""} />
        ))}
      </div>

      {step === 0 && (
        <section className="onboard-body">
          <Mark />
          <p className="eyebrow">Bible reading</p>
          <h1>Folio</h1>
          <p className="lede">
            A quiet place to read the Bible, keep your place, and come back tomorrow. Your progress stays on this phone.
          </p>
          <ul className="plain-list">
            <li>An order through the books, with the idea of each one.</li>
            <li>A daily portion that does not pile up when you miss a day.</li>
            <li>A streak for the days you actually show up.</li>
          </ul>
        </section>
      )}

      {step === 1 && (
        <section className="onboard-body">
          <p className="eyebrow">Reading order</p>
          <h1>Where do you want to start?</h1>
          <p className="lede">You can change this later. Chapters you mark read stay read.</p>
          <div className="choice-list">
            {FEATURED.map((id) => {
              const item = getPlan(id);
              if (!item) return null;
              return (
                <button
                  key={id}
                  type="button"
                  className={planId === id ? "choice is-on" : "choice"}
                  aria-pressed={planId === id}
                  onClick={() => setPlanId(id)}
                >
                  <span className="kicker">{item.kicker}</span>
                  <strong>{item.title}</strong>
                  <span>{item.fit}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="btn-text" onClick={() => setPlanId("")}>
            {planId === "" ? "No plan selected. You can choose one in the guide." : "I'll choose an order later"}
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="onboard-body">
          <p className="eyebrow">Daily portion</p>
          <h1>How much is a day?</h1>
          <p className="lede">
            {plan
              ? `${plan.title} is ${chapterTotal.toLocaleString()} chapters. At this pace you would finish on ${finish}.`
              : `The whole Bible is ${totalChapters().toLocaleString()} chapters. At this pace, once you pick an order, you would finish around ${finish}.`}
          </p>
          <div className="stepper" aria-label="Chapters per day">
            <button type="button" onClick={() => setPerDay((value) => Math.max(1, value - 1))} aria-label="Fewer chapters">
              −
            </button>
            <strong>
              {perDay}
              <span>{perDay === 1 ? "chapter" : "chapters"}</span>
            </strong>
            <button type="button" onClick={() => setPerDay((value) => Math.min(20, value + 1))} aria-label="More chapters">
              +
            </button>
          </div>
          <div className="chip-row">
            <button type="button" className={perDay === 1 ? "chip is-on" : "chip"} onClick={() => setPerDay(1)}>
              One a day
            </button>
            <button type="button" className={perDay === yearPace ? "chip is-on" : "chip"} onClick={() => setPerDay(yearPace)}>
              A year ({yearPace}/day)
            </button>
            <button type="button" className={perDay === 3 ? "chip is-on" : "chip"} onClick={() => setPerDay(3)}>
              Steady (3)
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="onboard-body">
          <p className="eyebrow">Reminder</p>
          <h1>A time to come back</h1>
          <p className="lede">
            Folio will point at today's reading when you open it after this time. On Android, an installed Folio can also
            send a notification. On iPhone, a Clock alarm is the reliable nudge.
          </p>
          <label className="toggle">
            <input type="checkbox" checked={remind} onChange={(event) => setRemind(event.target.checked)} />
            <span>Remind me</span>
          </label>
          <label className="field">
            <span>Time</span>
            <input type="time" value={time} onChange={(event) => setTime(event.target.value || "08:00")} />
          </label>
        </section>
      )}

      <footer className="onboard-foot">
        {step > 0 ? (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((value) => value - 1)}>
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button type="button" className="btn" onClick={() => setStep((value) => value + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => void finishSetup()} disabled={pending}>
            {pending ? "Starting…" : "Start reading"}
          </button>
        )}
      </footer>
    </div>
  );
}
