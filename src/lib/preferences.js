import { STATUSES } from "./statuses";

export const PREFS_KEY = "jt:prefs";

export const DEFAULT_PREFS = {
  theme: "dark",
  view: "all",
  defaultStatus: "applied",
  staleDays: { warn: 7, high: 14, critical: 30 },
};

export function validThresholds(t) {
  return !!t && [t.warn, t.high, t.critical].every((n) => Number.isInteger(n) && n >= 1 && n <= 3650)
    && t.warn < t.high && t.high < t.critical;
}

/* drop unknown keys, fix bad values */
export function sanitizePrefs(p) {
  const s = p && typeof p === "object" ? p : {};
  const d = DEFAULT_PREFS;
  return {
    theme: ["light", "dark", "system"].includes(s.theme) ? s.theme : d.theme,
    view: ["all", "attention"].includes(s.view) ? s.view : d.view,
    defaultStatus: STATUSES.some((x) => x.id === s.defaultStatus) ? s.defaultStatus : d.defaultStatus,
    staleDays: validThresholds(s.staleDays)
      ? { warn: s.staleDays.warn, high: s.staleDays.high, critical: s.staleDays.critical }
      : d.staleDays,
  };
}

export function loadPrefs() {
  try { return sanitizePrefs(JSON.parse(localStorage.getItem(PREFS_KEY) || "{}")); }
  catch { return DEFAULT_PREFS; }
}

export function savePrefs(p) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
}

export function applyTheme(theme) {
  const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/* runs in <head>, before paint */
export const THEME_INIT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");var t=p.theme||"dark";if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;
