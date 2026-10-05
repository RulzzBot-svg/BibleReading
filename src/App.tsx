import { useEffect, useRef, useState } from "react";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { msUntil, todayISO } from "./lib/dates";
import { scheduleSystemReminder, showReadingNotification } from "./lib/reminders";
import { BibleHome } from "./screens/BibleHome";
import { BookAbout } from "./screens/BookAbout";
import { Chapters } from "./screens/Chapters";
import { Guide } from "./screens/Guide";
import { Onboarding } from "./screens/Onboarding";
import { PlanDetail } from "./screens/PlanDetail";
import { Reader } from "./screens/Reader";
import { Today } from "./screens/Today";
import { You } from "./screens/You";
import { StoreProvider, useStore } from "./state/Store";

export function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <ThemeSync />
        <ReminderClock />
        <AppRoutes />
      </HashRouter>
    </StoreProvider>
  );
}

function AppRoutes() {
  const { state } = useStore();
  if (!state.onboardingDone) return <Onboarding />;
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Today />} />
        <Route path="/bible" element={<BibleHome />} />
        <Route path="/bible/:bookId" element={<Chapters />} />
        <Route path="/bible/:bookId/:chapter" element={<Reader />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/guide/:planId" element={<PlanDetail />} />
        <Route path="/books/:bookId" element={<BookAbout />} />
        <Route path="/you" element={<You />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <div className="screen">
      <h1>That page isn't in Folio</h1>
      <Link to="/">Back to today</Link>
    </div>
  );
}

function ThemeSync() {
  const { state } = useStore();
  const [systemDark, setSystemDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const resolved = state.theme === "system" ? (systemDark ? "dark" : "light") : state.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.setProperty("--reading-scale", String(state.fontScale));
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#100e0c" : "#e9e1d1");
  }, [resolved, state.fontScale]);

  return null;
}

function ReminderClock() {
  const { state } = useStore();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!state.reminderEnabled) return;
    let cancelled = false;
    let timer = 0;
    const arm = () => {
      const wait = msUntil(stateRef.current.reminderTime);
      const intended = Date.now() + wait;
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const current = stateRef.current;
        const late = Date.now() - intended;
        if (late < 3 * 60 * 60 * 1000 && !current.readDays.includes(todayISO())) {
          showReadingNotification("Your reading is waiting.");
        }
        arm();
      }, wait);
    };
    arm();
    void scheduleSystemReminder(state.reminderTime, "Your reading is waiting.");
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [state.reminderEnabled, state.reminderTime]);

  return null;
}
