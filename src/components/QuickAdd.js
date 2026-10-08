"use client";
import { useEffect, useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { STATUSES } from "@/lib/statuses";
import { parsePaste } from "@/lib/parse";
import { isoDay } from "@/lib/dates";
import { emptyFields } from "@/lib/fields";
import { cleanUrl } from "@/lib/url";
import { field, btnPrimary, Field } from "./ui";
import JobFields from "./JobFields";

const blank = (status, currency) => ({ ...emptyFields(), applied_at: isoDay(), status, salary_currency: currency });

export default function QuickAdd({ onAdd, onDone, existingUrls = [], defaultStatus = "applied", defaultCurrency = "USD" }) {
  const [f, setF] = useState(() => blank(defaultStatus, defaultCurrency));
  const [srcTouched, setSrcTouched] = useState(false);

  useEffect(() => {
    setF((p) => ({ ...p, status: defaultStatus, salary_currency: p.salary_min || p.salary_max ? p.salary_currency : defaultCurrency }));
  }, [defaultStatus, defaultCurrency]);

  const urlText = f.url.trim();
  const cleaned = cleanUrl(urlText);
  const badUrl = !!urlText && !cleaned;
  const dupe = !!cleaned && existingUrls.some((u) => cleanUrl(u) === cleaned);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  /* autofill source from link */
  const onUrl = (e) => {
    const url = e.target.value;
    setF((p) => ({ ...p, url, ...(srcTouched ? {} : { source: parsePaste(cleanUrl(url) || url).source }) }));
  };
  const onSource = (e) => { setSrcTouched(true); set("source")(e); };

  const submit = async (e) => {
    e.preventDefault();
    if (badUrl) return;
    if (!f.title.trim() && !f.company.trim() && !cleaned) return;
    await onAdd({ ...f, title: f.title.trim(), company: f.company.trim(), url: cleaned });
    setF(blank(defaultStatus, defaultCurrency));
    setSrcTouched(false);
    onDone?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Job title"><input className={field} placeholder="Frontend Developer" value={f.title} onChange={set("title")} /></Field>
        <Field label="Company"><input className={field} placeholder="Acme" value={f.company} onChange={set("company")} /></Field>
        <Field label="Link to the job post"><input className={field} placeholder="https://..." value={f.url} onChange={onUrl} onBlur={() => cleaned && setF((p) => ({ ...p, url: cleaned }))} /></Field>
      </div>
      {badUrl && <p className="text-sm text-danger" role="alert">Enter a full web address, like https://example.com/job</p>}
      {dupe && <p className="text-sm text-amber-600 dark:text-amber-300">You already added this link.</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date you applied"><input type="date" className={field} value={f.applied_at} onChange={set("applied_at")} /></Field>
        <Field label="Where are you in the process?">
          <select className={field} value={f.status} onChange={set("status")}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
      </div>

      <details className="group rounded-xl border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-medium">
          <span>More details <span className="font-normal text-muted">(salary, deadline, contact person, notes...)</span></span>
          <ChevronDown size={16} className="text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-line p-3">
          <JobFields f={f} set={set} setF={setF} onSource={onSource} />
        </div>
      </details>

      <button className={btnPrimary}><Plus size={15} />Add to my list</button>
    </form>
  );
}
