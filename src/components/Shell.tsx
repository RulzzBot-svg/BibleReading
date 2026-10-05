import { NavLink, Outlet, useMatch } from "react-router-dom";
import { todayISO } from "../lib/dates";
import { currentStreak } from "../lib/streaks";
import { useStore } from "../state/Store";
import { Icon } from "./Icons";

const TABS = [
  { to: "/", label: "Today", icon: "today" as const, end: true },
  { to: "/bible", label: "Bible", icon: "bible" as const, end: false },
  { to: "/guide", label: "Guide", icon: "guide" as const, end: false },
  { to: "/you", label: "You", icon: "you" as const, end: false },
];

export function Shell() {
  const reading = useMatch("/bible/:bookId/:chapter");
  const { state, now } = useStore();
  if (reading) return <Outlet />;

  const streak = currentStreak(state.readDays, todayISO(now));

  return (
    <div className="shell">
      <nav className="tabbar" aria-label="Primary">
        <NavLink to="/" className="brand" end>
          Folio
        </NavLink>
        <div className="tabs">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => (isActive ? "tab is-active" : "tab")}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
        <p className="tab-foot">
          <strong>{streak}</strong>
          <span>{streak === 1 ? "day in a row" : "days in a row"}</span>
        </p>
      </nav>
      <main id="main" tabIndex={-1} className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
