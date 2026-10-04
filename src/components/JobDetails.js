"use client";
import { format } from "date-fns";
import { Pencil, ExternalLink } from "lucide-react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import StaleBadge from "./StaleBadge";
import { btnPrimary } from "./ui";
import { staleness } from "@/lib/stale";

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

  return (
    <Modal title={app.title || "Untitled role"} onClose={onClose} wide>
      <p className="-mt-2 text-sm text-muted">{app.company || "Unknown company"}</p>
      <div className="flex flex-wrap gap-1.5">
        <StatusBadge status={app.status} />
        <StaleBadge stale={stale} />
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Row label="Applied">{format(new Date(app.applied_at), "d MMM yyyy")}</Row>
        <Row label="Last update">{format(new Date(app.last_update_at), "d MMM yyyy")}</Row>
        <Row label="Source">{app.source}</Row>
        <Row label="Location">{app.location}</Row>
        <Row label="Work mode">{app.work_mode}</Row>
        <Row label="Salary range">{app.salary}</Row>
      </dl>
      {safeUrl && (
        <a href={app.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all text-sm text-accent hover:underline">
          <ExternalLink size={14} />{app.url}
        </a>
      )}
      <Block label="Notes" text={app.notes} />
      <Block label="Job description" text={app.job_description} />
      <button onClick={onEdit} className={btnPrimary}><Pencil size={14} />Edit</button>
    </Modal>
  );
}
