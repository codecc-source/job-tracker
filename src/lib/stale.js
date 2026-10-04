import { isActive } from "./statuses";

const DAY = 86400000;

export function staleness(app, t = { warn: 7, high: 14, critical: 30 }, now = new Date()) {
  if (!isActive(app.status)) return null;
  const days = Math.floor((now - new Date(app.last_update_at)) / DAY);
  if (days >= t.critical) return { level: "critical", days, label: "No update in over a month" };
  if (days >= t.high)     return { level: "high",     days, label: "No update in over 2 weeks" };
  if (days >= t.warn)     return { level: "warn",     days, label: "No update in over a week" };
  return null;
}

export const daysQuiet = (app, now = new Date()) =>
  Math.max(0, Math.floor((now - new Date(app.last_update_at)) / DAY));
