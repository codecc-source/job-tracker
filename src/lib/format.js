import { PERIODS } from "./fields";

export function cleanNumber(s) {
  const c = String(s ?? "").replace(/[^\d.]/g, "");
  const [i, ...rest] = c.split(".");
  return rest.length ? `${i}.${rest.join("").slice(0, 2)}` : i;
}

export function withCommas(s) {
  const [i, d] = String(s ?? "").split(".");
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return d === undefined ? int : `${int}.${d}`;
}

export function formatSalary(a) {
  const { salary_currency: cur, salary_min: lo, salary_max: hi, salary_period: per } = a;
  if (!lo && !hi) return a.salary || "";
  const range = lo && hi ? `${withCommas(lo)} – ${withCommas(hi)}` : withCommas(lo || hi);
  const prefix = !lo ? "up to " : !hi ? "from " : "";
  const label = PERIODS.find((p) => p.id === per)?.label;
  return `${cur ? cur + " " : ""}${prefix}${range}${label ? " " + label : ""}`;
}
