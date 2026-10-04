"use client";
import { useState } from "react";
import Modal from "./Modal";
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
      <Field label="Theme">
        <select className={field} value={prefs.theme} onChange={(e) => setPrefs({ theme: e.target.value })}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </Field>
      <Field label="Default view">
        <select className={field} value={prefs.view} onChange={(e) => setPrefs({ view: e.target.value })}>
          <option value="all">All applications</option>
          <option value="attention">Needs attention</option>
        </select>
      </Field>
      <Field label="Default status for new applications">
        <select className={field} value={prefs.defaultStatus} onChange={(e) => setPrefs({ defaultStatus: e.target.value })}>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </Field>
      <div>
        <p className="mb-1 text-xs font-medium text-muted">Warn after (days without an update)</p>
        <div className="grid grid-cols-3 gap-2">
          {[["warn", "Yellow"], ["high", "Orange"], ["critical", "Red"]].map(([k, l]) => (
            <Field key={k} label={l}>
              <input type="number" min="1" className={field} value={d[k]} onChange={setT(k)} />
            </Field>
          ))}
        </div>
        {!ok && <p className="mt-1 text-xs text-danger">Each value must be a whole number larger than the one before.</p>}
      </div>
    </Modal>
  );
}
