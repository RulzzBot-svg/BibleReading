import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { chapterCount } from "../lib/books";
import { todayISO } from "../lib/dates";
import { chapterKey } from "../lib/keys";
import { flattenPlan, resolveDailyAssignment, sameAssignment } from "../lib/planner";
import { getPlan } from "../data/plans";
import { defaultState, exportPayload, loadState, saveState, stateFromImport } from "../lib/storage";
import type { Bookmark, ChapterRef, ThemeChoice, UserState } from "../lib/types";

type StoreValue = {
  state: UserState;
  now: Date;
  readSet: Set<string>;
  isRead: (bookId: string, chapter: number) => boolean;
  isBookmarked: (bookId: string, chapter: number, verse: number) => boolean;
  markRead: (refs: ChapterRef[]) => void;
  markUnread: (refs: ChapterRef[]) => void;
  toggleChapter: (ref: ChapterRef) => void;
  logToday: () => void;
  rememberPlace: (place: ChapterRef & { verse?: number }) => void;
  toggleBookmark: (bookmark: Bookmark) => void;
  startPlan: (planId: string) => void;
  restartPace: () => void;
  clearPlan: () => void;
  setChaptersPerDay: (count: number) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setReminderTime: (time: string) => void;
  setTheme: (theme: ThemeChoice) => void;
  setFontScale: (scale: number) => void;
  finishOnboarding: (choice: {
    planId: string | null;
    chaptersPerDay: number;
    reminderEnabled: boolean;
    reminderTime: string;
  }) => void;
  exportData: () => string;
  importData: (raw: string) => { ok: true } | { ok: false; error: string };
  resetProgress: () => void;
  resetAll: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>(() => loadState());
  const [now, setNow] = useState(() => new Date());
  const nowRef = useRef(now);
  nowRef.current = now;

  const update = useCallback((fn: (current: UserState) => UserState) => {
    setState((current) => {
      const next = fn(current);
      if (next === current) return current;
      saveState(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    const onVisible = () => setNow(new Date());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const today = todayISO(now);
  useEffect(() => {
    const plan = getPlan(state.activePlanId);
    const flat = plan ? flattenPlan(plan, chapterCount) : [];
    const next = resolveDailyAssignment(
      state.dailyAssignment,
      state.activePlanId,
      flat,
      new Set(state.readChapters),
      state.chaptersPerDay,
      today,
    );
    if (!sameAssignment(next, state.dailyAssignment)) {
      update((current) => ({ ...current, dailyAssignment: next }));
    }
  }, [state.activePlanId, state.chaptersPerDay, state.readChapters, state.dailyAssignment, today, update]);

  const readSet = useMemo(() => new Set(state.readChapters), [state.readChapters]);
  const bookmarkSet = useMemo(
    () => new Set(state.bookmarks.map((bookmark) => `${bookmark.bookId}:${bookmark.chapter}:${bookmark.verse}`)),
    [state.bookmarks],
  );

  const value = useMemo<StoreValue>(() => {
    const day = () => todayISO(nowRef.current);
    return {
      state,
      now,
      readSet,
      isRead: (bookId, chapter) => readSet.has(`${bookId}:${chapter}`),
      isBookmarked: (bookId, chapter, verse) => bookmarkSet.has(`${bookId}:${chapter}:${verse}`),
      markRead: (refs) => {
        update((current) => {
          const keys = refs.map(chapterKey).filter((key) => !current.readChapters.includes(key));
          if (!keys.length) return current;
          const todayKey = day();
          const last = refs[refs.length - 1];
          return {
            ...current,
            readChapters: [...current.readChapters, ...keys],
            readDays: current.readDays.includes(todayKey) ? current.readDays : [...current.readDays, todayKey],
            lastPosition: { bookId: last.bookId, chapter: last.chapter },
          };
        });
      },
      markUnread: (refs) => {
        const drop = new Set(refs.map(chapterKey));
        update((current) => ({
          ...current,
          readChapters: current.readChapters.filter((key) => !drop.has(key)),
        }));
      },
      toggleChapter: (ref) => {
        const key = chapterKey(ref);
        update((current) => {
          if (current.readChapters.includes(key)) {
            return { ...current, readChapters: current.readChapters.filter((item) => item !== key) };
          }
          const todayKey = day();
          return {
            ...current,
            readChapters: [...current.readChapters, key],
            readDays: current.readDays.includes(todayKey) ? current.readDays : [...current.readDays, todayKey],
            lastPosition: { bookId: ref.bookId, chapter: ref.chapter },
          };
        });
      },
      logToday: () => {
        update((current) => {
          const todayKey = day();
          if (current.readDays.includes(todayKey)) return current;
          return { ...current, readDays: [...current.readDays, todayKey] };
        });
      },
      rememberPlace: (place) => {
        update((current) => {
          const previous = current.lastPosition;
          if (
            previous &&
            previous.bookId === place.bookId &&
            previous.chapter === place.chapter &&
            previous.verse === place.verse
          ) {
            return current;
          }
          return { ...current, lastPosition: place };
        });
      },
      toggleBookmark: (bookmark) => {
        const key = `${bookmark.bookId}:${bookmark.chapter}:${bookmark.verse}`;
        update((current) => {
          const exists = current.bookmarks.some(
            (item) => `${item.bookId}:${item.chapter}:${item.verse}` === key,
          );
          return {
            ...current,
            bookmarks: exists
              ? current.bookmarks.filter((item) => `${item.bookId}:${item.chapter}:${item.verse}` !== key)
              : [...current.bookmarks, bookmark],
          };
        });
      },
      startPlan: (planId) => {
        update((current) => {
          if (current.activePlanId === planId) return current;
          return {
            ...current,
            activePlanId: planId,
            planStartDate: day(),
            dailyAssignment: null,
          };
        });
      },
      restartPace: () => {
        update((current) =>
          current.activePlanId ? { ...current, planStartDate: day(), dailyAssignment: null } : current,
        );
      },
      clearPlan: () => {
        update((current) => ({
          ...current,
          activePlanId: null,
          planStartDate: null,
          dailyAssignment: null,
        }));
      },
      setChaptersPerDay: (count) => {
        const chaptersPerDay = Math.min(20, Math.max(1, Math.round(count)));
        update((current) => (current.chaptersPerDay === chaptersPerDay ? current : { ...current, chaptersPerDay }));
      },
      setReminderEnabled: (reminderEnabled) => {
        update((current) => (current.reminderEnabled === reminderEnabled ? current : { ...current, reminderEnabled }));
      },
      setReminderTime: (reminderTime) => {
        update((current) => (current.reminderTime === reminderTime ? current : { ...current, reminderTime }));
      },
      setTheme: (theme) => {
        update((current) => (current.theme === theme ? current : { ...current, theme }));
      },
      setFontScale: (fontScale) => {
        const scale = Math.min(1.5, Math.max(0.85, fontScale));
        update((current) => (current.fontScale === scale ? current : { ...current, fontScale }));
      },
      finishOnboarding: (choice) => {
        update((current) => ({
          ...current,
          onboardingDone: true,
          activePlanId: choice.planId,
          planStartDate: choice.planId ? day() : null,
          dailyAssignment: null,
          chaptersPerDay: Math.min(20, Math.max(1, Math.round(choice.chaptersPerDay))),
          reminderEnabled: choice.reminderEnabled,
          reminderTime: choice.reminderTime,
        }));
      },
      exportData: () => exportPayload(state),
      importData: (raw) => {
        try {
          const next = stateFromImport(raw);
          if (!next) return { ok: false, error: "That file isn't a Folio backup." };
          update(() => next);
          return { ok: true };
        } catch {
          return { ok: false, error: "That file couldn't be read." };
        }
      },
      resetProgress: () => {
        update((current) => ({
          ...current,
          readChapters: [],
          readDays: [],
          bookmarks: [],
          lastPosition: null,
          dailyAssignment: null,
        }));
      },
      resetAll: () => {
        update(() => defaultState());
      },
    };
  }, [bookmarkSet, now, readSet, state, update]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used within StoreProvider");
  return value;
}
