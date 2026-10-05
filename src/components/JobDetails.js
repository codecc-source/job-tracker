"use client";
import { Pencil, ExternalLink, Mail, Phone } from "lucide-react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import StaleBadge from "./StaleBadge";
import { Stars } from "./StarRating";
import { btnPrimary } from "./ui";
import { staleness } from "@/lib/stale";
import { fmtDate } from "@/lib/dates";
import { formatSalary } from "@/lib/format";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="break-words text-sm">{children}</dd>
    </div>
  );
}

function Block({ label, text }) {
  if (!text) return null;
  return (
    <div>
      <h3 className="mb-1 text-xs text-muted">{label}</h3>
      <p className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-line bg-surface-2 p-3 text-sm">{text}</p>
    </div>
  );
}

export default function JobDetails({ app, thresholds, onEdit, onClose }) {
  const stale = staleness(app, thresholds);
  const safeUrl = /^https?:\/\//i.test(app.url);
  const phone = (app.contact_phone || "").replace(/[^\d+]/g, "");
  const hasContact = app.contact_name || app.contact_email || app.contact_phone;

  return (
    <Modal title={app.title || "Untitled role"} onClose={onClose} wide>
      <p className="-mt-2 text-sm text-muted">{app.company || "Unknown company"}</p>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={app.status} />
        <StaleBadge stale={stale} />
        <Stars value={app.priority} size={15} />
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <Row label="Applied">{fmtDate(app.applied_at)}</Row>
        <Row label="Last update">{fmtDate(app.last_update_at)}</Row>
        <Row label="Application deadline">{fmtDate(app.deadline)}</Row>
        <Row label="Interview or next step date">{fmtDate(app.next_step_date)}</Row>
        <Row label="Where you found it">{app.source}</Row>
        <Row label="Location">{app.location}</Row>
        <Row label="Work setup">{app.work_mode}</Row>
        <Row label="Job type">{app.job_type}</Row>
        <Row label="Salary">{formatSalary(app)}</Row>
        <Row label="Resume or cover letter">{app.resume_version}</Row>
      </dl>

      {safeUrl && (
        <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all text-sm text-accent hover:underline">
          <ExternalLink size={14} />{app.url}
        </a>
      )}

      {hasContact && (
        <div className="space-y-1 rounded-lg border border-line p-3 text-sm">
          <p className="text-xs text-muted">Contact person</p>
          {app.contact_name && <p className="font-medium">{app.contact_name}</p>}
          {EMAIL.test(app.contact_email) && (
            <a href={`mailto:${app.contact_email}`} className="flex items-center gap-1.5 text-accent hover:underline"><Mail size={14} />{app.contact_email}</a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1.5 text-accent hover:underline"><Phone size={14} />{app.contact_phone}</a>
          )}
        </div>
      )}

      <Block label="What they said" text={app.next_step} />
      <Block label="Notes" text={app.notes} />
      <Block label="Job description" text={app.job_description} />
      {app.status === "rejected" && <Block label="Rejection reason or feedback" text={app.rejection_reason} />}

      <button onClick={onEdit} className={btnPrimary}><Pencil size={14} />Edit</button>
    </Modal>
  );
}
