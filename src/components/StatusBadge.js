import { statusLabel } from "@/lib/statuses";

const COLORS = {
  saved: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  applied: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  contacted: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  interview: "bg-purple-500/15 text-purple-700 dark:text-purple-300",
  offer: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-300",
  withdrawn: "bg-slate-500/15 text-slate-600 dark:text-slate-400",
  ghosted: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status] ?? COLORS.saved}`}>
      {statusLabel(status)}
    </span>
  );
}
