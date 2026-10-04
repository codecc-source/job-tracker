"use client";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { STATUSES } from "@/lib/statuses";
import { parsePaste } from "@/lib/parse";
import { field, btnPrimary, Field } from "./ui";

const MODES = ["", "Remote", "Hybrid", "On-site"];
const today = () => new Date().toISOString().slice(0, 10);
const blank = (status) => ({
  title: "", company: "", url: "", source: "", applied_at: today(), status,
  location: "", work_mode: "", salary: "", notes: "", job_description: "",
});

export default function QuickAdd({ onAdd, existingUrls = [], defaultStatus = "applied" }) {
  const [f, setF] = useState(() => blank(defaultStatus));
  const [srcTouched, setSrcTouched] = useState(false);

  useEffect(() => { setF((p) => ({ ...p, status: defaultStatus })); }, [defaultStatus]);

  const dupe = f.url && existingUrls.includes(f.url.trim());
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  /* autofill source from link */
  const onUrl = (e) => {
    const url = e.target.value;
    setF((p) => ({ ...p, url, ...(srcTouched ? {} : { source: parsePaste(url).source }) }));
  };
  const onSource = (e) => { setSrcTouched(true); set("source")(e); };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.title.trim() && !f.company.trim() && !f.url.trim()) return;
    await onAdd({ ...f, title: f.title.trim(), company: f.company.trim(), url: f.url.trim() });
    setF(blank(defaultStatus));
    setSrcTouched(false);
  };

  return (
    <form onSubmit={submit} className="mb-8 space-y-4 rounded-2xl border border-line bg-surface p-5 shadow-lg shadow-black/20">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Plus size={16} className="text-accent" />Add application</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Job title"><input className={field} placeholder="Frontend Developer" value={f.title} onChange={set("title")} /></Field>
        <Field label="Company"><input className={field} placeholder="Acme" value={f.company} onChange={set("company")} /></Field>
        <Field label="Link"><input className={field} placeholder="https://..." value={f.url} onChange={onUrl} /></Field>
      </div>
      {dupe && <p className="text-sm text-amber-600 dark:text-amber-300">This link is already in your list.</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Source"><input className={field} placeholder="LinkedIn" value={f.source} onChange={onSource} /></Field>
        <Field label="Location"><input className={field} placeholder="Philippines" value={f.location} onChange={set("location")} /></Field>
        <Field label="Work mode">
          <select className={field} value={f.work_mode} onChange={set("work_mode")}>
            {MODES.map((m) => <option key={m} value={m}>{m || "—"}</option>)}
          </select>
        </Field>
        <Field label="Salary range"><input className={field} placeholder="60–80k PHP" value={f.salary} onChange={set("salary")} /></Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Notes"><textarea rows={3} className={field} value={f.notes} onChange={set("notes")} /></Field>
        <Field label="Job description (keep a copy)"><textarea rows={3} className={field} value={f.job_description} onChange={set("job_description")} /></Field>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Date applied"><input type="date" className={field} value={f.applied_at} onChange={set("applied_at")} /></Field>
        <Field label="Status">
          <select className={field} value={f.status} onChange={set("status")}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <button className={btnPrimary + " ml-auto"}><Plus size={15} />Add</button>
      </div>
    </form>
  );
}
