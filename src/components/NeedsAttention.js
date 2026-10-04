import { TriangleAlert } from "lucide-react";
import { staleness, daysQuiet } from "@/lib/stale";
import ApplicationList from "./ApplicationList";

export default function NeedsAttention({ apps, thresholds, ...handlers }) {
  const stale = apps
    .filter((a) => staleness(a, thresholds))
    .sort((a, b) => daysQuiet(b) - daysQuiet(a));

  if (!stale.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-300">
        <TriangleAlert size={16} />Needs attention ({stale.length})
      </h2>
      <ApplicationList apps={stale} thresholds={thresholds} empty="" {...handlers} />
    </section>
  );
}
