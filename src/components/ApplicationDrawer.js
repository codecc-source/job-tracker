"use client";
import { useState } from "react";
import Modal from "./Modal";
import { field, btnPrimary, btn, Field } from "./ui";

const MODES = ["", "Remote", "Hybrid", "On-site"];

export default function ApplicationDrawer({ app, urls, onSave, onClose }) {
  const [f, setF] = useState({
    title: app.title, company: app.company, url: app.url, source: app.source,
    applied_at: app.applied_at, location: app.location ?? "", work_mode: app.work_mode ?? "",
    salary: app.salary ?? "", notes: app.notes ?? "", job_description: app.job_description ?? "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const dupe = f.url.trim() && f.url.trim() !== app.url && urls.includes(f.url.trim());

  const save = async (e) => {
    e.preventDefault();
    const changed = Object.keys(f).some((k) => (f[k] ?? "") !== (app[k] ?? ""));
    if (changed) await onSave(app.id, f, { touch: true }); /* save counts as an update */
    onClose();
  };

  return (
    <Modal title="Edit application" onClose={onClose} side>
      <form onSubmit={save} className="space-y-3">
        <Field label="Job title"><input className={field} value={f.title} onChange={set("title")} /></Field>
        <Field label="Company"><input className={field} value={f.company} onChange={set("company")} /></Field>
        <Field label="Link">
          <input className={field} value={f.url} onChange={set("url")} />
          {dupe && <span className="mt-1 block text-amber-600 dark:text-amber-300">This link is already in your list.</span>}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source"><input className={field} value={f.source} onChange={set("source")} /></Field>
          <Field label="Date applied"><input type="date" className={field} value={f.applied_at} onChange={set("applied_at")} /></Field>
          <Field label="Location"><input className={field} value={f.location} onChange={set("location")} /></Field>
          <Field label="Work mode">
            <select className={field} value={f.work_mode} onChange={set("work_mode")}>
              {MODES.map((m) => <option key={m} value={m}>{m || "—"}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Salary range"><input className={field} value={f.salary} onChange={set("salary")} /></Field>
        <Field label="Notes"><textarea rows={4} className={field} value={f.notes} onChange={set("notes")} /></Field>
        <Field label="Job description (saved copy)"><textarea rows={8} className={field} value={f.job_description} onChange={set("job_description")} /></Field>

        <div className="sticky bottom-0 -mx-5 space-y-2 border-t border-line bg-surface px-5 py-3">
          <div className="flex gap-2">
            <button className={btnPrimary}>Save</button>
            <button type="button" onClick={onClose} className={btn}>Cancel</button>
          </div>
          <p className="text-xs text-muted">Saving changes counts as an update and resets the quiet timer.</p>
        </div>
      </form>
    </Modal>
  );
}
