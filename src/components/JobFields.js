"use client";
import { field, Field } from "./ui";
import StarRating from "./StarRating";
import CurrencyInput from "./CurrencyInput";
import { MODES, JOB_TYPES, PERIODS } from "@/lib/fields";
import { cleanNumber, withCommas } from "@/lib/format";

function Group({ title, children }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-line p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function JobFields({ f, set, setF, onSource, edit = false }) {
  const money = (k) => (e) => setF((p) => ({ ...p, [k]: cleanNumber(e.target.value) }));

  return (
    <div className="space-y-4">
      <Group title="About the job">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Where did you find it?" hint="LinkedIn, a friend, the company website...">
            <input className={field} placeholder="LinkedIn" value={f.source} onChange={onSource ?? set("source")} />
          </Field>
          <Field label="Location">
            <input className={field} placeholder="Philippines" value={f.location} onChange={set("location")} />
          </Field>
          <Field label="Work setup">
            <select className={field} value={f.work_mode} onChange={set("work_mode")}>
              <option value="">—</option>
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Job type">
            <select className={field} value={f.job_type} onChange={set("job_type")}>
              <option value="">—</option>
              {JOB_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium text-muted">Salary</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Currency">
              <CurrencyInput value={f.salary_currency} onChange={(v) => setF((p) => ({ ...p, salary_currency: v }))} />
            </Field>
            <Field label="From">
              <input className={field} inputMode="decimal" placeholder="50,000" value={withCommas(f.salary_min)} onChange={money("salary_min")} />
            </Field>
            <Field label="To">
              <input className={field} inputMode="decimal" placeholder="70,000" value={withCommas(f.salary_max)} onChange={money("salary_max")} />
            </Field>
          </div>
          <Field label="Paid">
            <select className={field} value={f.salary_period} onChange={set("salary_period")}>
              <option value="">—</option>
              {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Application deadline" hint="The last day to apply">
            <input type="date" className={field} value={f.deadline} onChange={set("deadline")} />
          </Field>
          <Field label="How much do you want this job?" plain>
            <StarRating value={f.priority} onChange={(n) => setF((p) => ({ ...p, priority: n }))} />
          </Field>
        </div>
      </Group>

      <Group title="Contact person">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name (recruiter or hiring manager)">
            <input className={field} value={f.contact_name} onChange={set("contact_name")} />
          </Field>
          <Field label="Phone">
            <input className={field} inputMode="tel" value={f.contact_phone} onChange={set("contact_phone")} />
          </Field>
        </div>
        <Field label="Email">
          <input className={field} type="email" value={f.contact_email} onChange={set("contact_email")} />
        </Field>
      </Group>

      <Group title="What you sent">
        <Field label="Resume or cover letter version" hint="So you know which one went where. Example: Resume v3">
          <input className={field} value={f.resume_version} onChange={set("resume_version")} />
        </Field>
      </Group>

      {edit && (
        <Group title="Next step">
          <Field label="What did they say?" hint="Example: HR will call me on Friday">
            <input className={field} value={f.next_step} onChange={set("next_step")} />
          </Field>
          <Field label="Interview or next step date" hint="Leave empty if you don't have a date yet">
            <input type="date" className={field} value={f.next_step_date} onChange={set("next_step_date")} />
          </Field>
        </Group>

      )}

      <Group title="Notes">
        <Field label="Your notes"><textarea rows={3} className={field} value={f.notes} onChange={set("notes")} /></Field>
        <Field label="Job description" hint="Paste a copy here. Job posts often disappear.">
          <textarea rows={4} className={field} value={f.job_description} onChange={set("job_description")} />
        </Field>
        {edit && (
          <Field label="If you were rejected: reason or feedback (optional)">
            <textarea rows={2} className={field} value={f.rejection_reason} onChange={set("rejection_reason")} />
          </Field>
        )}
      </Group>
    </div>
  );
}
