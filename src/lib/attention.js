import { staleness, daysQuiet } from "./stale";
import { daysUntil, fmtDate, plural, when } from "./dates";

const CLOSED = ["rejected", "withdrawn", "ghosted", "offer"];

export const hasOpenNextStep = (app) => !CLOSED.includes(app.status) && !!(app.next_step_date || app.next_step);

export const nextStepLevel = (d) => (d < 0 ? "high" : d <= 1 ? "critical" : d <= 3 ? "high" : d <= 7 ? "warn" : "info");

export function attentionFor(app, prefs, now = new Date()) {
  const reasons = [];
  const add = (kind, level, score, text, action) => reasons.push({ kind, level, score, text, action });

  if (app.next_step_date && !CLOSED.includes(app.status)) {
    const d = daysUntil(app.next_step_date, now);
    const label = app.status === "interview" ? "Interview" : "Next step";
    if (d >= 0 && d <= 7) {
      add("next", nextStepLevel(d), 400 - d * 20, `${label} ${when(d)} (${fmtDate(app.next_step_date, "d MMM")})`);
    } else if (d < 0 && d >= -14) {
      add("next", "high", 250, `${label} was ${plural(-d, "day")} ago. How did it go?`, "reply");
    }
  }

  if (app.deadline && app.status === "saved") {
    const d = daysUntil(app.deadline, now);
    if (d < 0) add("deadline", "critical", 350, `Deadline passed ${plural(-d, "day")} ago`);
    else if (d <= 14) {
      add("deadline", d <= 2 ? "critical" : d <= 5 ? "high" : "warn", 350 - d * 15, `Apply by ${fmtDate(app.deadline, "d MMM")} (${when(d)})`);
    }
  }

  const s = staleness(app, prefs.staleDays, now);
  if (s) {
    const base = { critical: 280, high: 180, warn: 90 }[s.level];
    add("stale", s.level, base + s.days / 100, `No news for ${s.days} days`, s.level === "critical" ? "ghost" : undefined);
  }

  if (["rejected", "ghosted"].includes(app.status) && !app.reapply_dismissed) {
    const months = daysQuiet(app, now) / 30;
    if (months >= prefs.reapplyMonths) {
      const what = app.status === "rejected" ? "Rejected" : "No reply";
      add("reapply", "info", 10 + months, `${what} ${Math.floor(months)} months ago. You can apply again if you're still interested.`, "reapply");
    }
  }

  reasons.sort((a, b) => b.score - a.score);
  return { reasons, level: reasons[0]?.level ?? null, score: reasons[0]?.score ?? 0 };
}

const GHOST_ACTIVE = ["applied", "contacted", "interview"];

export function shouldAutoGhost(app, days, now = new Date()) {
  if (app.status === "saved") return !!app.deadline && -daysUntil(app.deadline, now) > days;
  if (!GHOST_ACTIVE.includes(app.status)) return false;
  const dates = [app.applied_at, app.deadline, app.next_step_date, app.activity_at].filter(Boolean);
  if (!dates.length) return false;
  return Math.min(...dates.map((d) => -daysUntil(d, now))) > days;
}
