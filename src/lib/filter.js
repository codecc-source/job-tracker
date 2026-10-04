import { daysQuiet } from "./stale";

export const SORTS = [
  { id: "quiet",   label: "Longest quiet" },
  { id: "applied", label: "Newest applied" },
  { id: "updated", label: "Recently updated" },
  { id: "company", label: "Company A–Z" },
];

export const DEFAULT_FILTERS = { q: "", status: "", source: "", sort: "quiet" };

export function applyFilters(apps, { q, status, source, sort }) {
  const needle = q.trim().toLowerCase();
  const out = apps.filter((a) =>
    (!status || a.status === status) &&
    (!source || a.source === source) &&
    (!needle || `${a.title} ${a.company}`.toLowerCase().includes(needle))
  );
  const by = {
    quiet: (a, b) => daysQuiet(b) - daysQuiet(a),
    applied: (a, b) => new Date(b.applied_at) - new Date(a.applied_at),
    updated: (a, b) => new Date(b.last_update_at) - new Date(a.last_update_at),
    company: (a, b) => a.company.localeCompare(b.company),
  }[sort];
  return [...out].sort(by);
}

export const sourcesOf = (apps) => [...new Set(apps.map((a) => a.source).filter(Boolean))].sort();
