import ApplicationCard from "./ApplicationCard";

export default function ApplicationList({ apps, attn, empty, selection, onSelect, ...handlers }) {
  if (!apps.length) {
    return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {apps.map((a) => <ApplicationCard key={a.id} app={a} info={attn?.get(a.id)} {...handlers} selecting={!!selection} selected={!!selection?.has(a.id)} onSelect={onSelect} />)}
    </ul>
  );
}
