"use client";
import { Search } from "lucide-react";
import { STATUSES } from "@/lib/statuses";
import { SORTS } from "@/lib/filter";
import { field, selectSm } from "./ui";

export default function FiltersBar({ filters, onChange, sources }) {
  const set = (k) => (e) => onChange({ ...filters, [k]: e.target.value });
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="relative min-w-44 flex-1">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className={field + " pl-9"} placeholder="Search company or title" value={filters.q} onChange={set("q")} />
      </div>
      <select aria-label="Status filter" className={selectSm} value={filters.status} onChange={set("status")}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
      <select aria-label="Source filter" className={selectSm} value={filters.source} onChange={set("source")}>
        <option value="">All sources</option>
        {sources.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select aria-label="Sort" className={selectSm} value={filters.sort} onChange={set("sort")}>
        {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
    </div>
  );
}
