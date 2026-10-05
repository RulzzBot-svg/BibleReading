import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog } from "../components/Dialog";
import { SECTIONS } from "../data/books";
import { getPlan } from "../data/plans";
import { chapterPath } from "../lib/bible";
import { books, getBook } from "../lib/books";
import { formatClock, formatMediumDate, todayISO } from "../lib/dates";
import { isIos, isStandalone, requestNotificationPermission } from "../lib/reminders";
import { currentStreak, longestStreak } from "../lib/streaks";
import { percentOf, readingStats } from "../lib/stats";
import { FONT_SCALES } from "../lib/storage";
import { useStore } from "../state/Store";

type InstallPrompt = Event & { prompt: () => Promise<void> };

export function You() {
  const store = useStore();
  const { state, now, readSet, setChaptersPerDay, setReminderEnabled, setReminderTime, setTheme, setFontScale } = store;
  const today = todayISO(now);
  const stats = readingStats(readSet, books);
  const streak = currentStreak(state.readDays, today);
  const longest = longestStreak(state.readDays);
  const plan = getPlan(state.activePlanId);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState("");
  const [dialog, setDialog] = useState<"progress" | "all" | null>(null);
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPrompt);
    };
    const onInstalled = () => setStandalone(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const year = now.getFullYear();
  const month = now.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Date(2024, 0, 7 + index).toLocaleDateString(undefined, { weekday: "narrow" }),
  );

  async function onReminder(enabled: boolean) {
    if (enabled) await requestNotificationPermission();
    setReminderEnabled(enabled);
  }

  function download() {
    const blob = new Blob([store.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `folio-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded. Keep that file if you change phones.");
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    const result = store.importData(text);
    setMessage(result.ok ? "Backup restored on this phone." : result.error);
  }

  return (
    <div className="screen">
      <p className="eyebrow">On this phone</p>
      <h1>You</h1>

      <div className="stat-grid">
        <p>
          <strong>{streak}</strong>
          <span>day streak</span>
        </p>
        <p>
          <strong>{longest}</strong>
          <span>longest</span>
        </p>
        <p>
          <strong>{percentOf(stats.readChapters, stats.chapters)}%</strong>
          <span>of the Bible</span>
        </p>
        <p>
          <strong>
            {stats.readChapters}
            <small>/{stats.chapters}</small>
          </strong>
          <span>chapters</span>
        </p>
      </div>
      <p className="muted">
        {stats.booksDone} of {stats.bookCount} books finished · {state.readDays.length}{" "}
        {state.readDays.length === 1 ? "day" : "days"} with a reading
      </p>

      <section>
        <h2>{monthLabel}</h2>
        <div className="cal" aria-label={`Reading days in ${monthLabel}`}>
          {weekdayLabels.map((label, index) => (
            <span key={`${label}-${index}`} className="cal-label">
              {label}
            </span>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`pad-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const on = state.readDays.includes(iso);
            const isToday = iso === today;
            return (
              <span key={iso} className={on ? "cal-day is-on" : isToday ? "cal-day is-today" : "cal-day"}>
                {day}
              </span>
            );
          })}
        </div>
      </section>

      <section className="stack">
        <h2>Plan and pace</h2>
        {plan ? (
          <p>
            Reading <Link to={`/guide/${plan.id}`}>{plan.title}</Link>
            {state.planStartDate ? ` since ${formatMediumDate(state.planStartDate)}` : ""}.
          </p>
        ) : (
          <p>
            No order selected. <Link to="/guide">Choose one in the guide.</Link>
          </p>
        )}
        <div className="stepper" aria-label="Chapters per day">
          <button type="button" onClick={() => setChaptersPerDay(state.chaptersPerDay - 1)} aria-label="Fewer chapters">
            −
          </button>
          <strong>
            {state.chaptersPerDay}
            <span>a day</span>
          </strong>
          <button type="button" onClick={() => setChaptersPerDay(state.chaptersPerDay + 1)} aria-label="More chapters">
            +
          </button>
        </div>
        <p className="muted">Today's list stays as it is. Tomorrow uses the new amount. Changing the number does not erase what you've read.</p>
        {plan && (
          <button type="button" className="btn-text" onClick={store.clearPlan}>
            Stop this plan
          </button>
        )}
      </section>

      <section className="stack">
        <h2>Reminder</h2>
        <label className="toggle">
          <input type="checkbox" checked={state.reminderEnabled} onChange={(event) => void onReminder(event.target.checked)} />
          <span>Remind me at {formatClock(state.reminderTime)}</span>
        </label>
        <label className="field">
          <span>Time</span>
          <input type="time" value={state.reminderTime} onChange={(event) => setReminderTime(event.target.value || "08:00")} />
        </label>
        <p className="muted">
          Open Folio after that time and today's reading is waiting at the top. A closed-app alert works on some Android
          browsers once Folio is installed. iPhone does not allow a website to schedule its own alarms, so pair this with
          the Clock app if you want a hard nudge.
        </p>
      </section>

      <section className="stack">
        <h2>On your phone</h2>
        {standalone ? (
          <p>Folio is installed on this device.</p>
        ) : install ? (
          <button
            type="button"
            className="btn"
            onClick={() => {
              void install.prompt();
              setInstall(null);
            }}
          >
            Install Folio
          </button>
        ) : isIos() ? (
          <p>In Safari, tap Share, then Add to Home Screen. Folio then opens like an app, full screen.</p>
        ) : (
          <p>In your phone's browser, use the menu and choose Install app or Add to Home Screen.</p>
        )}
      </section>

      <section className="stack">
        <h2>Reading text</h2>
        <div className="font-controls inline">
          <button type="button" onClick={() => stepFont(state.fontScale, -1, setFontScale)} aria-label="Smaller text">
            A−
          </button>
          <button type="button" onClick={() => stepFont(state.fontScale, 1, setFontScale)} aria-label="Larger text">
            A+
          </button>
        </div>
        <p className="sample">In the beginning God created the heaven and the earth.</p>
        <div className="seg" role="group" aria-label="Theme">
          {(["system", "light", "dark"] as const).map((theme) => (
            <button key={theme} type="button" className={state.theme === theme ? "is-on" : ""} onClick={() => setTheme(theme)}>
              {theme === "system" ? "System" : theme === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>By section</h2>
        <ul className="section-stats">
          {SECTIONS.map((section) => {
            const stat = stats.sections[section.id] ?? { read: 0, total: 0 };
            return (
              <li key={section.id}>
                <span>{section.label}</span>
                <span className="meter" aria-hidden="true">
                  <span style={{ width: `${percentOf(stat.read, stat.total)}%` }} />
                </span>
                <span className="book-meta">
                  {stat.read}/{stat.total}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {state.bookmarks.length > 0 && (
        <section>
          <h2>Bookmarks</h2>
          <ul className="mention-list">
            {state.bookmarks.map((bookmark) => {
              const book = getBook(bookmark.bookId);
              if (!book) return null;
              return (
                <li key={`${bookmark.bookId}:${bookmark.chapter}:${bookmark.verse}`}>
                  <Link to={chapterPath(bookmark.bookId, bookmark.chapter, bookmark.verse)}>
                    <strong>
                      {book.name} {bookmark.chapter}:{bookmark.verse}
                    </strong>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="stack">
        <h2>Your data</h2>
        <p className="muted">
          Nothing here is uploaded. Clearing the browser, or opening Folio on another phone, starts empty unless you
          bring a backup.
        </p>
        <button type="button" className="btn btn-ghost" onClick={download}>
          Download a backup
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
          Restore a backup
        </button>
        <input
          ref={fileRef}
          className="sr-only"
          type="file"
          accept="application/json,.json"
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {message && (
          <p className="banner" role="status">
            {message}
          </p>
        )}
        <button type="button" className="btn-text" onClick={() => setDialog("progress")}>
          Erase reading progress
        </button>
        <button type="button" className="btn-text" onClick={() => setDialog("all")}>
          Erase everything on this phone
        </button>
      </section>

      <section className="about-block">
        <h2>About the text</h2>
        <p>
          Scripture in Folio is the King James Version, which is in the public domain. The chapter files were prepared
          from the community compilation of that text. Book introductions are original to Folio: a reading guide, not a
          study Bible.
        </p>
        <p className="muted">Modern translations such as the NIV, ESV, and NLT are copyrighted and are not included.</p>
      </section>

      {dialog && (
        <Dialog
          title={dialog === "progress" ? "Erase reading progress?" : "Erase everything?"}
          body={
            dialog === "progress"
              ? "This clears chapters read, streaks, and bookmarks on this phone. Your plan, reminder, and text size stay."
              : "This clears the reading, the plan, and the reminder, and shows the introduction again. Download a backup first if you might want it back."
          }
          confirmLabel={dialog === "progress" ? "Erase progress" : "Erase everything"}
          onClose={() => setDialog(null)}
          onConfirm={() => {
            if (dialog === "progress") store.resetProgress();
            else store.resetAll();
            setDialog(null);
            setMessage(dialog === "progress" ? "Reading progress erased." : "");
          }}
        />
      )}
    </div>
  );
}

function stepFont(current: number, direction: -1 | 1, setFontScale: (scale: number) => void) {
  const index = FONT_SCALES.findIndex((scale) => Math.abs(scale - current) < 0.03);
  const start = index === -1 ? 1 : index;
  setFontScale(FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, start + direction))]);
}
