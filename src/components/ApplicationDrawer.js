"use client";
import { useState } from "react";
import Modal from "./Modal";
import JobFields from "./JobFields";
import { field, btnPrimary, btn, Field } from "./ui";
import { EDITABLE } from "@/lib/fields";
import { cleanUrl } from "@/lib/url";

const build = (app) => Object.fromEntries(EDITABLE.map((k) => [k, app[k] ?? (k === "priority" ? 0 : "")]));

export default function ApplicationDrawer({ app, urls, onSave, onClose }) {
  const [init] = useState(() => build(app));
  const [f, setF] = useState(init);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const urlText = f.url.trim();
  const cleaned = cleanUrl(urlText);
  const badUrl = !!urlText && !cleaned;
  const dupe = !!cleaned && cleaned !== cleanUrl(app.url) && urls.some((u) => cleanUrl(u) === cleaned);

  const save = async (e) => {
    e.preventDefault();
    if (badUrl) return;
    const out = { ...f, url: cleaned };
    const changed = EDITABLE.some((k) => String(out[k]) !== String(init[k]));
    if (changed) await onSave(app.id, out, { touch: true });
    onClose();
  };

  return (
    <Modal title="Edit application" onClose={onClose} side>
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-3">
          <Field label="Job title"><input className={field} value={f.title} onChange={set("title")} /></Field>
          <Field label="Company"><input className={field} value={f.company} onChange={set("company")} /></Field>
          <Field label="Link to the job post">
            <input className={field} value={f.url} onChange={set("url")} onBlur={() => cleaned && setF((p) => ({ ...p, url: cleaned }))} />
            {badUrl && <span className="mt-1 block text-danger" role="alert">Enter a full web address, like https://example.com/job</span>}
            {dupe && <span className="mt-1 block text-amber-600 dark:text-amber-300">You already added this link.</span>}
          </Field>
          <Field label="Date you applied"><input type="date" className={field} value={f.applied_at} onChange={set("applied_at")} /></Field>
        </div>

        <JobFields f={f} set={set} setF={setF} edit />

        <div className="sticky bottom-0 -mx-5 space-y-2 border-t border-line bg-surface px-5 py-3">
          <div className="flex gap-2">
            <button className={btnPrimary}>Save</button>
            <button type="button" onClick={onClose} className={btn}>Cancel</button>
          </div>
          <p className="text-xs text-muted">Saving counts as activity on this job, so it won't be flagged as "no news" for a while.</p>
        </div>
      </form>
    </Modal>
  );
}
