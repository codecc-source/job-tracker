"use client";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Priority">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="rounded p-0.5 text-yellow-500 transition-transform hover:scale-110"
        >
          <Star size={22} className={n <= value ? "fill-current" : "text-muted/40"} />
        </button>
      ))}
      <span className="ml-1 text-xs text-muted">{value ? `${value} of 5` : "Not rated"}</span>
    </div>
  );
}

export function Stars({ value = 0, size = 13 }) {
  if (!value) return null;
  return (
    <span className="inline-flex gap-0.5 text-yellow-500" aria-label={`Priority ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? "fill-current" : "text-muted/30"} />
      ))}
    </span>
  );
}
