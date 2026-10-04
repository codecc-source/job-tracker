import ApplicationCard from "./ApplicationCard";

export default function ApplicationList({ apps, empty, ...handlers }) {
  if (!apps.length) {
    return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {apps.map((a) => <ApplicationCard key={a.id} app={a} {...handlers} />)}
    </ul>
  );
}
