import { toDate, daysUntil } from "./dates";

const HEARD = ["contacted", "interview", "offer", "rejected"];
const INTERVIEW = ["interview", "offer"];
const CLOSED = ["rejected", "withdrawn", "ghosted", "offer"];

export function weekStart(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

const tally = (list) => ({
  total: list.length,
  heard: list.filter((a) => HEARD.includes(a.status)).length,
  interviews: list.filter((a) => INTERVIEW.includes(a.status)).length,
});

function group(list, key) {
  const map = new Map();
  for (const a of list) {
    const k = (a[key] || "").trim();
    if (k) map.set(k, [...(map.get(k) ?? []), a]);
  }
  return [...map].map(([name, rows]) => ({ name, ...tally(rows) })).sort((a, b) => b.total - a.total);
}

export function buildStats(apps, now = new Date()) {
  const sent = apps.filter((a) => a.status !== "saved");
  const ws = weekStart(now);
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date(ws);
    start.setDate(start.getDate() - 7 * (7 - i));
    return { start, count: 0 };
  });
  for (const a of sent) {
    const t = weekStart(toDate(a.applied_at)).getTime();
    const w = weeks.find((x) => x.start.getTime() === t);
    if (w) w.count++;
  }
  const byStatus = {};
  for (const a of apps) byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;

  return {
    weeks,
    thisWeek: weeks[7].count,
    lastWeek: weeks[6].count,
    waiting: sent.filter((a) => a.status === "applied").length,
    interviews: apps.filter((a) => a.status === "interview").length,
    upcoming: apps.filter((a) => a.next_step_date && !CLOSED.includes(a.status) && daysUntil(a.next_step_date, now) >= 0 && daysUntil(a.next_step_date, now) <= 7).length,
    overall: tally(sent),
    bySource: group(sent, "source"),
    byResume: group(sent, "resume_version"),
    byStatus,
  };
}
