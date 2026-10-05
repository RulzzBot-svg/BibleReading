import { msUntil } from "./dates";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

type TriggerWindow = Window & { TimestampTrigger?: new (timestamp: number) => unknown };

export async function scheduleSystemReminder(time: string, body: string): Promise<void> {
  const Trigger = (window as TriggerWindow).TimestampTrigger;
  if (!Trigger || !("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const when = Date.now() + msUntil(time);
    await registration.showNotification("Folio", {
      body,
      tag: "folio-next",
      showTrigger: new Trigger(when),
    } as NotificationOptions);
  } catch {
    // Scheduled notifications are optional. The in-app reminder still works.
  }
}

export function showReadingNotification(body: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    new Notification("Folio", { body, tag: "folio-reminder" });
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}

export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
