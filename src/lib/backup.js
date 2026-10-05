import { STATUSES } from "./statuses";
import { MODES, JOB_TYPES, PERIODS } from "./fields";

export const BACKUP_VERSION = 1;
const MAX_BYTES = 10 * 1024 * 1024;
const PURGE_AFTER_DAYS = 90;

export function buildBackup(applications, preferences = {}) {
  const cutoff = Date.now() - PURGE_AFTER_DAYS * 86400000;
  const kept = applications.filter((a) => !a.deleted_at || new Date(a.deleted_at) > cutoff);
  return { app: "job-tracker", version: BACKUP_VERSION, exportedAt: new Date().toISOString(), preferences, applications: kept };
}

export function downloadBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `job-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function shareBackup(data) {
  const file = new File([JSON.stringify(data, null, 2)], "job-tracker-backup.json", { type: "application/json" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "Job tracker backup" });
    return true;
  }
  return false; /* caller falls back to download */
}

/* share on touch, download elsewhere */
export async function exportBackup(data) {
  if (matchMedia("(pointer: coarse)").matches) {
    try { if (await shareBackup(data)) return "shared"; }
    catch (e) { if (e?.name === "AbortError") return "cancelled"; }
  }
  downloadBackup(data);
  return "downloaded";
}

export function validateBackup(data) {
  if (data?.app !== "job-tracker") throw new Error("This is not a Job Tracker backup file.");
  if (typeof data.version !== "number" || data.version > BACKUP_VERSION) throw new Error("This backup was made by a newer version.");
  if (!Array.isArray(data.applications)) throw new Error("The backup has no applications list.");
  return data; /* migrations go here */
}

export function parseBackupText(text) {
  if (text.length > MAX_BYTES) throw new Error("The backup is too large.");
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("That is not valid JSON."); }
  return validateBackup(data);
}

export async function readBackupFile(file) {
  if (file.size > MAX_BYTES) throw new Error("The file is too large.");
  return parseBackupText(await file.text());
}

const day = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v)) ? v : "");
const num = (v) => (typeof v === "string" && /^\d+(\.\d{1,2})?$/.test(v) ? v : "");
const pick = (v, list) => (list.includes(v) ? v : "");
const str = (v) => (typeof v === "string" ? v : "");
const iso = (v, fallback) => (typeof v === "string" && !isNaN(new Date(v)) ? v : fallback);

export function normalizeApplication(a) {
  if (!a || typeof a !== "object" || typeof a.id !== "string" || !a.id) return null;
  const now = new Date().toISOString();
  return {
    id: a.id.slice(0, 100),
    title: str(a.title), company: str(a.company),
    url: /^https?:\/\//i.test(str(a.url)) ? a.url : "",
    source: str(a.source), location: str(a.location), work_mode: pick(a.work_mode, MODES), salary: str(a.salary),
    job_type: pick(a.job_type, JOB_TYPES),
    salary_currency: str(a.salary_currency).slice(0, 12), salary_min: num(a.salary_min), salary_max: num(a.salary_max),
    salary_period: pick(a.salary_period, PERIODS.map((p) => p.id)),
    deadline: day(a.deadline), next_step_date: day(a.next_step_date), next_step: str(a.next_step),
    priority: Number.isInteger(a.priority) && a.priority >= 0 && a.priority <= 5 ? a.priority : 0,
    contact_name: str(a.contact_name), contact_email: str(a.contact_email), contact_phone: str(a.contact_phone),
    resume_version: str(a.resume_version), rejection_reason: str(a.rejection_reason),
    ghosted_auto: a.ghosted_auto === true, reapply_dismissed: a.reapply_dismissed === true,
    notes: str(a.notes), job_description: str(a.job_description),
    status: STATUSES.some((s) => s.id === a.status) ? a.status : "applied",
    applied_at: iso(a.applied_at, now.slice(0, 10)),
    last_update_at: iso(a.last_update_at, now),
    updated_at: iso(a.updated_at, now),
    deleted_at: a.deleted_at ? iso(a.deleted_at, now) : null,
  };
}

export function normalizeApplications(list) {
  const rows = list.map(normalizeApplication).filter(Boolean);
  return { rows, skipped: list.length - rows.length };
}

export function mergeApplications(local, incoming) {
  const map = new Map(local.map((a) => [a.id, a]));
  let added = 0, updated = 0;
  for (const inc of incoming) {
    const cur = map.get(inc.id);
    if (!cur) { map.set(inc.id, inc); added++; }
    else if (new Date(inc.updated_at) > new Date(cur.updated_at)) { map.set(inc.id, inc); updated++; }
  }
  return { merged: [...map.values()], added, updated, unchanged: incoming.length - added - updated };
}
