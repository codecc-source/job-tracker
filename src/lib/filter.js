import { daysQuiet } from "./stale";

export const SORTS = [
  { id: "attention", label: "Needs attention first" },
  { id: "deadline", label: "Deadline soonest" },
  { id: "priority", label: "Highest priority" },
  { id: "applied", label: "Newest applied" },
  { id: "updated", label: "Recently updated" },
  { id: "company", label: "Company A–Z" },
];

export const DEFAULT_FILTERS = { q: "", status: "", source: "", sort: "attention" };

const FAR = "9999-12-31";

export function applyFilters(apps, { q, status, source, sort }, attn) {
  const needle = q.trim().toLowerCase();
  const out = apps.filter((a) =>
    (!status || a.status === status) &&
    (!source || a.source === source) &&
    (!needle || `${a.title} ${a.company}`.toLowerCase().includes(needle))
  );
  const recent = (a, b) => new Date(b.last_update_at) - new Date(a.last_update_at);
  const by = {
    attention: (a, b) => (attn.get(b.id)?.score ?? 0) - (attn.get(a.id)?.score ?? 0) || recent(a, b),
    deadline: (a, b) => (a.deadline || FAR).localeCompare(b.deadline || FAR),
    priority: (a, b) => (b.priority || 0) - (a.priority || 0) || recent(a, b),
    applied: (a, b) => new Date(b.applied_at) - new Date(a.applied_at),
    updated: recent,
    company: (a, b) => a.company.localeCompare(b.company),
  }[sort];
  return [...out].sort(by);
}

export const sourcesOf = (apps) => [...new Set(apps.map((a) => a.source).filter(Boolean))].sort();
