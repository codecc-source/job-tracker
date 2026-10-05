import { format } from "date-fns";

export function toDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s);
}

export const fmtDate = (s, pattern = "d MMM yyyy") => (s ? format(toDate(s), pattern) : "");

export function daysUntil(s, now = new Date()) {
  const a = toDate(s);
  const t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(a.getFullYear(), a.getMonth(), a.getDate()) - t) / 86400000);
}

export const isoDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const when = (d) => (d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`);
