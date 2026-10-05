import { toDate, isoDay } from "./dates";
import { formatSalary } from "./format";
import { statusLabel } from "./statuses";

const CLOSED = ["rejected", "withdrawn", "ghosted", "offer"];
const isHttp = (u) => /^https?:\/\//i.test(u || "");
const esc = (s) => String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (s) => s.replaceAll("-", "");
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function addDays(s, n) {
  const d = toDate(s);
  d.setDate(d.getDate() + n);
  return isoDay(d);
}

function fold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 70) { out.push(rest.slice(0, 70)); rest = " " + rest.slice(70); }
  out.push(rest);
  return out.join("\r\n");
}

function details(app) {
  const salary = formatSalary(app);
  return [
    `${app.title || "Job"}${app.company ? ` at ${app.company}` : ""}`,
    `Status: ${statusLabel(app.status)}`,
    app.next_step && `What they said: ${app.next_step}`,
    app.contact_name && `Contact: ${app.contact_name}`,
    app.contact_email && `Email: ${app.contact_email}`,
    app.contact_phone && `Phone: ${app.contact_phone}`,
    app.location && `Location: ${app.location}`,
    app.work_mode && `Work setup: ${app.work_mode}`,
    app.job_type && `Job type: ${app.job_type}`,
    salary && `Salary: ${salary}`,
    app.resume_version && `Resume or cover letter: ${app.resume_version}`,
    isHttp(app.url) && `Job post: ${app.url}`,
    app.notes && `Notes: ${app.notes.slice(0, 500)}`,
  ].filter(Boolean).join("\n");
}

export function eventsFor(app, followUp = "") {
  const name = `${app.title || "Job"}${app.company ? ` at ${app.company}` : ""}`;
  const base = { app, details: details(app), location: app.location || "", url: isHttp(app.url) ? app.url : "" };
  const out = [];
  if (app.next_step_date) {
    out.push({ ...base, kind: "next", date: app.next_step_date, label: app.status === "interview" ? "Interview" : "Next step", title: `${app.status === "interview" ? "Interview" : "Next step"}: ${name}` });
  }
  if (app.deadline) out.push({ ...base, kind: "deadline", date: app.deadline, label: "Application deadline", title: `Application deadline: ${name}` });
  if (followUp) out.push({ ...base, kind: "followup", date: followUp, label: "Follow-up reminder", title: `Follow up: ${name}` });
  return out;
}

export function upcomingEvents(apps) {
  const today = isoDay();
  return apps.flatMap((a) => eventsFor(a))
    .filter((e) => e.date >= today && (e.kind !== "next" || !CLOSED.includes(e.app.status)) && (e.kind !== "deadline" || e.app.status === "saved"))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildIcs(events) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Job Tracker//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.app.id}-${e.kind}@job-tracker`,
      `DTSTAMP:${stamp()}`,
      `DTSTART;VALUE=DATE:${ymd(e.date)}`,
      `DTEND;VALUE=DATE:${ymd(addDays(e.date, 1))}`,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(e.details)}`,
    );
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.url) lines.push(`URL:${e.url.replace(/\s/g, "")}`);
    for (const t of ["-PT15H", "PT9H"]) {
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.title)}`, `TRIGGER:${t}`, "END:VALARM");
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(events, name = "job-tracker-calendar") {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function googleUrl(e) {
  const p = new URLSearchParams({
    action: "TEMPLATE", text: e.title, dates: `${ymd(e.date)}/${ymd(addDays(e.date, 1))}`,
    details: e.details, location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
