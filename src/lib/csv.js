import { statusLabel } from "./statuses";

const COLS = ["title", "company", "status", "applied_at", "last_update_at", "source", "location", "work_mode", "salary", "url", "notes"];

/* block formula injection */
const esc = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

export function buildCsv(apps) {
  const rows = apps.map((a) => COLS.map((c) => esc(c === "status" ? statusLabel(a.status) : a[c])).join(","));
  return [COLS.join(","), ...rows].join("\n");
}

export function downloadCsv(apps) {
  const blob = new Blob([buildCsv(apps)], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `job-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
