"use client";
import { MapPin, Laptop, Briefcase, Banknote, CalendarDays, CalendarClock, Hourglass, Clock, RotateCcw, ExternalLink, Pencil, Eye, Trash2, Send, MessageSquareReply, CalendarPlus, Ellipsis } from "lucide-react";
import { STATUSES } from "@/lib/statuses";
import { hasOpenNextStep, nextStepLevel } from "@/lib/attention";
import { daysUntil, fmtDate, when } from "@/lib/dates";
import { formatSalary } from "@/lib/format";
import { btn, selectSm, LEVEL, LEVEL_BAR } from "./ui";
import StatusBadge from "./StatusBadge";
import DropdownMenu from "./DropdownMenu";
import { Stars } from "./StarRating";

const ICONS = { next: CalendarClock, deadline: Hourglass, stale: Clock, reapply: RotateCcw };
const CAN_REPLY = ["saved", "applied", "contacted", "interview"];

export default function ApplicationCard({ app, info, onStatus, onFollowUp, onDelete, onEdit, onView, onReply, onReapply, onDismiss, onCalendar }) {
  const salary = formatSalary(app);
  const meta = [
    app.location && [MapPin, app.location],
    app.work_mode && [Laptop, app.work_mode],
    app.job_type && [Briefcase, app.job_type],
    salary && [Banknote, salary],
  ].filter(Boolean);
  const safeUrl = /^https?:\/\//i.test(app.url);
  const reasons = (info?.reasons ?? []).filter((r) => !(r.kind === "next" && !r.action));

  let nextBox = null;
  if (hasOpenNextStep(app)) {
    const d = app.next_step_date ? daysUntil(app.next_step_date) : null;
    const label = app.status === "interview" ? "Interview" : "Next step";
    const head = d === null ? label : `${label} on ${fmtDate(app.next_step_date)} · ${d < 0 ? `${-d} days ago` : when(d)}`;
    nextBox = { level: d === null ? "info" : nextStepLevel(d), head };
  }

  return (
    <li className={`rounded-2xl border border-l-4 border-line bg-surface p-4 shadow-md shadow-black/20 transition-colors hover:border-accent/40 ${LEVEL_BAR[info?.level] ?? "border-l-line"}`}>
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
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={app.status} />
          <Stars value={app.priority} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {meta.map(([Icon, text]) => (
          <span key={text} className="inline-flex items-center gap-1"><Icon size={13} />{text}</span>
        ))}
        <span className="inline-flex items-center gap-1"><CalendarDays size={13} />Applied {fmtDate(app.applied_at)}</span>
        <span>Last update {fmtDate(app.last_update_at, "d MMM")}</span>
      </div>

      {nextBox && (
        <div className={`mt-3 flex items-start gap-2 rounded-lg p-2.5 text-sm ${LEVEL[nextBox.level]}`}>
          <CalendarClock size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{nextBox.head}</p>
            {app.next_step && <p className="opacity-90">{app.next_step}</p>}
          </div>
        </div>
      )}

      {app.ghosted_auto && app.status === "ghosted" && (
        <p className="mt-3 text-xs text-muted">Marked as Ghosted automatically because nothing had happened on this job for a long time.</p>
      )}

      {reasons.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {reasons.map((r) => {
            const Icon = ICONS[r.kind];
            return (
              <li key={r.kind} className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2.5 py-1.5 text-sm ${LEVEL[r.level]}`}>
                <Icon size={15} className="shrink-0" />
                <span className="min-w-0 flex-1">{r.text}</span>
                {r.action === "ghost" && <button className="font-semibold underline" onClick={() => onStatus(app.id, "ghosted")}>Mark as Ghosted</button>}
                {r.action === "reply" && <button className="font-semibold underline" onClick={() => onReply(app)}>Add update</button>}
                {r.action === "reapply" && (
                  <span className="flex gap-3">
                    <button className="font-semibold underline" onClick={() => onReapply(app.id)}>Apply again</button>
                    <button className="underline" onClick={() => onDismiss(app.id)}>Not now</button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <select aria-label="Status" value={app.status} onChange={(e) => onStatus(app.id, e.target.value)} className={selectSm}>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        {CAN_REPLY.includes(app.status) && (
          <button onClick={() => onReply(app)} className={btn} title="They emailed, messaged or called you"><MessageSquareReply size={14} />Got a reply?</button>
        )}
        <button onClick={() => onView(app)} className={btn}><Eye size={14} />View job details</button>
        <button onClick={() => onEdit(app)} className={btn}><Pencil size={14} />Edit</button>
        <span className="ml-auto flex items-center gap-1">
          {safeUrl && (
            <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label="Open job post" className="rounded-lg p-2 text-muted hover:bg-line/60 hover:text-accent">
              <ExternalLink size={16} />
            </a>
          )}
          <DropdownMenu
            label="More actions"
            className="rounded-lg p-2 text-muted hover:bg-line/60 hover:text-text"
            button={<Ellipsis size={18} />}
            items={[
              { label: "I followed up", desc: "Tap this after you emailed or called them. It restarts the \"no news\" count.", icon: Send, onClick: () => onFollowUp(app.id) },
              { label: "Add to calendar", desc: "Interview, deadline or a follow-up reminder", icon: CalendarPlus, onClick: () => onCalendar(app) },
              { label: "Delete", icon: Trash2, danger: true, onClick: () => confirm("Delete this job from your list?") && onDelete(app.id) },
            ]}
          />
        </span>
      </div>
    </li>
  );
}