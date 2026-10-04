"use client";
import { format } from "date-fns";
import { MapPin, Laptop, Banknote, CalendarDays, ExternalLink, Pencil, Eye, Trash2, Send } from "lucide-react";
import { STATUSES } from "@/lib/statuses";
import { staleness } from "@/lib/stale";
import { btn, selectSm } from "./ui";
import StatusBadge from "./StatusBadge";
import StaleBadge from "./StaleBadge";

const BAR = { warn: "border-l-yellow-500", high: "border-l-orange-500", critical: "border-l-red-500" };

export default function ApplicationCard({ app, onStatus, onFollowUp, onDelete, onEdit, onView, thresholds }) {
  const stale = staleness(app, thresholds);
  const meta = [
    app.location && [MapPin, app.location],
    app.work_mode && [Laptop, app.work_mode],
    app.salary && [Banknote, app.salary],
  ].filter(Boolean);
  const safeUrl = /^https?:\/\//i.test(app.url);

  return (
    <li className={`rounded-2xl border border-l-4 border-line bg-surface p-4 shadow-md shadow-black/20 transition-colors hover:border-accent/40 ${BAR[stale?.level] ?? "border-l-line"}`}>
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-sm font-semibold text-accent">
          {(app.company || app.title || "?")[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{app.title || "Untitled role"}</h3>
          <p className="truncate text-sm text-muted">
            {app.company || "Unknown company"}
            {app.source && ` · ${app.source}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={app.status} />
          <StaleBadge stale={stale} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {meta.map(([Icon, text]) => (
          <span key={text} className="inline-flex items-center gap-1"><Icon size={13} />{text}</span>
        ))}
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={13} />Applied {format(new Date(app.applied_at), "d MMM yyyy")}
        </span>
        <span>Last update {format(new Date(app.last_update_at), "d MMM")}</span>
      </div>

      {stale?.level === "critical" && (
        <p className="mt-3 rounded-lg bg-danger/10 p-2 text-sm text-danger">
          No reply in a month. Mark as Ghosted?{" "}
          <button className="font-semibold underline" onClick={() => onStatus(app.id, "ghosted")}>Yes</button>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <select aria-label="Status" value={app.status} onChange={(e) => onStatus(app.id, e.target.value)} className={selectSm}>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button onClick={() => onFollowUp(app.id)} className={btn} title="You emailed or checked in. Resets the quiet timer.">
          <Send size={14} />Log follow-up
        </button>
        <button onClick={() => onView(app)} className={btn}><Eye size={14} />View job details</button>
        <button onClick={() => onEdit(app)} className={btn}><Pencil size={14} />Edit</button>
        <span className="ml-auto flex items-center gap-1">
          {safeUrl && (
            <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label="Open job link" className="rounded-lg p-2 text-muted hover:bg-line/60 hover:text-accent">
              <ExternalLink size={16} />
            </a>
          )}
          <button
            aria-label="Delete"
            onClick={() => confirm("Delete this application?") && onDelete(app.id)}
            className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </span>
      </div>
    </li>
  );
}
