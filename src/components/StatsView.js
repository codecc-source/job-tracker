"use client";
import { useMemo } from "react";
import { Send, Hourglass, CalendarClock, Percent } from "lucide-react";
import { buildStats } from "@/lib/stats";
import { format } from "date-fns";
import { STATUSES } from "@/lib/statuses";
import StatusBadge from "./StatusBadge";

const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : "–");

function Card({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <span className={`mb-2 grid size-8 place-items-center rounded-lg ${color}`}><Icon size={16} /></span>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted/80">{sub}</p>}
    </div>
  );
}

function Breakdown({ title, rows }) {
  if (!rows.length) return null;
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Applied</th><th className="pb-2 font-medium">Heard back</th><th className="pb-2 font-medium">Interviews</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-t border-line">
                <td className="py-2 pr-3">{r.name}</td>
                <td className="py-2 pr-3">{r.total}</td>
                <td className="py-2 pr-3">{r.heard} <span className="text-muted">({pct(r.heard, r.total)})</span></td>
                <td className="py-2">{r.interviews} <span className="text-muted">({pct(r.interviews, r.total)})</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StatsView({ apps }) {
  const s = useMemo(() => buildStats(apps), [apps]);
  const max = Math.max(1, ...s.weeks.map((w) => w.count));
  const diff = s.thisWeek - s.lastWeek;
  const vs = diff === 0 ? "Same as last week" : `${diff > 0 ? "+" : ""}${diff} compared to last week`;

  if (!s.overall.total) {
    return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">Your stats will show up here once you add jobs you applied to.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card icon={Send} label="Applied this week" value={s.thisWeek} sub={vs} color="bg-blue-500/15 text-blue-600 dark:text-blue-300" />
        <Card icon={Hourglass} label="Waiting for a reply" value={s.waiting} color="bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" />
        <Card icon={CalendarClock} label="Interviews" value={s.interviews} sub={s.upcoming ? `${s.upcoming} in the next 7 days` : ""} color="bg-purple-500/15 text-purple-700 dark:text-purple-300" />
        <Card icon={Percent} label="Heard back" value={pct(s.overall.heard, s.overall.total)} sub={`${s.overall.heard} of ${s.overall.total} jobs`} color="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" />
      </div>

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-4 text-sm font-semibold">Applications per week</h3>
        <div className="flex h-36 items-end gap-2">
          {s.weeks.map((w, i) => (
            <div key={w.start.getTime()} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs text-muted">{w.count}</span>
              <div
                className={`w-full rounded-t-md ${i === 7 ? "bg-accent" : "bg-accent/40"}`}
                style={{ height: `${Math.max(4, (w.count / max) * 100)}%` }}
              />
              <span className="text-[10px] text-muted">{format(w.start, "d MMM")}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Weeks start on Monday. The blue bar is this week.</p>
      </section>

      <Breakdown title="Where you found the job" rows={s.bySource} />
      <Breakdown title="Which resume or cover letter version" rows={s.byResume} />

      <section className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold">All your jobs by status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUSES.filter((x) => s.byStatus[x.id]).map((x) => (
            <span key={x.id} className="inline-flex items-center gap-2 text-sm"><StatusBadge status={x.id} /><b>{s.byStatus[x.id]}</b></span>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted">"Heard back" counts jobs that are now at Response received, Interview, Offer or Rejected. Numbers use each job's current status.</p>
    </div>
  );
}
