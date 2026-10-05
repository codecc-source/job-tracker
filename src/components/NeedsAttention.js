import { TriangleAlert } from "lucide-react";
import ApplicationList from "./ApplicationList";

export default function NeedsAttention({ apps, attn, ...handlers }) {
  const items = apps
    .filter((a) => attn.get(a.id)?.reasons.length)
    .sort((a, b) => attn.get(b.id).score - attn.get(a.id).score);

  if (!items.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-300">
        <TriangleAlert size={16} />Needs your attention ({items.length})
      </h2>
      <ApplicationList apps={items} attn={attn} empty="" {...handlers} />
    </section>
  );
}
