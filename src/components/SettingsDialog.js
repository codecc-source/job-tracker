"use client";
import { useState } from "react";
import Modal from "./Modal";
import CurrencyInput from "./CurrencyInput";
import { STATUSES } from "@/lib/statuses";
import { validThresholds } from "@/lib/preferences";
import { field, Field } from "./ui";

export default function SettingsDialog({ prefs, setPrefs, onClose }) {
  const [d, setD] = useState({ ...prefs.staleDays });
  const parse = (x) => ({ warn: parseInt(x.warn, 10), high: parseInt(x.high, 10), critical: parseInt(x.critical, 10) });
  const ok = validThresholds(parse(d));

  const setT = (k) => (e) => {
    const next = { ...d, [k]: e.target.value };
    setD(next);
    if (validThresholds(parse(next))) setPrefs({ staleDays: parse(next) });
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <Field label="Look">
        <select className={field} value={prefs.theme} onChange={(e) => setPrefs({ theme: e.target.value })}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">Same as my device</option>
        </select>
      </Field>
      <Field label="What to show first">
        <select className={field} value={prefs.view} onChange={(e) => setPrefs({ view: e.target.value })}>
          <option value="all">All my jobs</option>
          <option value="attention">Only jobs that need attention</option>
        </select>
      </Field>
      <Field label="Starting status for new jobs">
        <select className={field} value={prefs.defaultStatus} onChange={(e) => setPrefs({ defaultStatus: e.target.value })}>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>
      <Field label="Usual currency for salaries" plain>
        <CurrencyInput value={prefs.defaultCurrency} onChange={(v) => setPrefs({ defaultCurrency: v })} />
      </Field>

      <div>
        <p className="mb-1 text-xs font-medium text-muted">Remind me when there is no news for this many days</p>
        <div className="grid grid-cols-3 gap-2">
          {[["warn", "Yellow"], ["high", "Orange"], ["critical", "Red"]].map(([k, l]) => (
            <Field key={k} label={l}>
              <input type="number" min="1" className={field} value={d[k]} onChange={setT(k)} />
            </Field>
          ))}
        </div>
        {!ok && <p className="mt-1 text-xs text-danger">Each number must be bigger than the one before it.</p>}
      </div>

      <Field label="Mark as Ghosted when nothing has happened for">
        <select className={field} value={prefs.ghostAfterDays} onChange={(e) => setPrefs({ ghostAfterDays: Number(e.target.value) })}>
          <option value={30}>1 month</option>
          <option value={60}>2 months</option>
          <option value={90}>3 months</option>
        </select>
      </Field>
      <Field label="Suggest applying again after a rejection or no reply, after">
        <select className={field} value={prefs.reapplyMonths} onChange={(e) => setPrefs({ reapplyMonths: Number(e.target.value) })}>
          <option value={3}>3 months</option>
          <option value={6}>6 months</option>
        </select>
      </Field>
    </Modal>
  );
}
