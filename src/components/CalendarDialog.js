"use client";
import { useState } from "react";
import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import Modal from "./Modal";
import { btn, btnPrimary, field, Field } from "./ui";
import { eventsFor, downloadIcs, googleUrl, addDays } from "@/lib/calendar";
import { fmtDate, isoDay } from "@/lib/dates";

export default function CalendarDialog({ app, onClose }) {
  const hasDates = !!(app.next_step_date || app.deadline);
  const [withFollow, setWithFollow] = useState(!hasDates);
  const [follow, setFollow] = useState(() => {
    const d = addDays(app.applied_at || isoDay(), 7);
    return d < isoDay() ? addDays(isoDay(), 1) : d;
  });
  const events = eventsFor(app, withFollow ? follow : "");
  const link = "inline-flex items-center gap-1 text-accent hover:underline";

  return (
    <Modal title="Add to calendar" onClose={onClose}>
      <p className="text-sm text-muted">
        {app.title || "This job"}{app.company ? ` at ${app.company}` : ""}. Each calendar event includes the job link, contact person, notes and a reminder the day before and on the day at 9 AM.
      </p>

      {events.length > 0 ? (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.kind} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3 text-sm">
              <span>
                <span className="block font-medium">{e.label}</span>
                <span className="text-muted">{fmtDate(e.date, "EEEE, d MMM yyyy")}</span>
              </span>
              <a href={googleUrl(e)} target="_blank" rel="noopener noreferrer" className={link}>
                Google Calendar<ExternalLink size={13} />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-3 text-sm text-muted">
          This job has no dates yet. Add an interview date or deadline with Edit, or add a follow-up reminder below.
        </p>
      )}

      <div className="space-y-2 rounded-xl border border-line p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={withFollow} onChange={(e) => setWithFollow(e.target.checked)} className="size-4 accent-[var(--accent)]" />
          Also remind me to follow up
        </label>
        {withFollow && (
          <Field label="Follow up on" hint="A week after applying is a good time to check in.">
            <input type="date" className={field} value={follow} onChange={(e) => setFollow(e.target.value)} />
          </Field>
        )}
      </div>

      <div className="space-y-2">
        <button disabled={!events.length} onClick={() => downloadIcs(events, `job-${(app.company || "event").replace(/[^\w]+/g, "-").toLowerCase()}`)} className={btnPrimary + " w-full justify-center"}>
          <Download size={15} />Download calendar file (.ics)
        </button>
        <p className="text-xs text-muted">Open the file after it downloads and your calendar app will ask to add it. Works with Apple Calendar, Google Calendar and Outlook, on phones and laptops.</p>
      </div>
      <button onClick={onClose} className={btn}>Close</button>
    </Modal>
  );
}
