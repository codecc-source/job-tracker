import { statusLabel } from "./statuses";
import { formatSalary } from "./format";

const COLS = [
  "title", "company", "status", "applied_at", "last_update_at", "deadline", "next_step_date", "next_step",
  "source", "location", "work_mode", "job_type", "salary", "priority",
  "contact_name", "contact_email", "contact_phone", "resume_version", "url", "notes", "rejection_reason",
];

/* block formula injection */
const esc = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

const cell = (a, c) => (c === "status" ? statusLabel(a.status) : c === "salary" ? formatSalary(a) : a[c]);

export function buildCsv(apps) {
  const rows = apps.map((a) => COLS.map((c) => esc(cell(a, c))).join(","));
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
