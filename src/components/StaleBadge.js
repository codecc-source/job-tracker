import { Clock } from "lucide-react";

const COLORS = {
  warn: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
  critical: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export default function StaleBadge({ stale }) {
  if (!stale) return null;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[stale.level]}`} title={stale.label}>
      <Clock size={12} />
      {stale.days} days no update
    </span>
  );
}
