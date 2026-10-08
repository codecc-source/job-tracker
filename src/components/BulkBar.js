"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { STATUSES } from "@/lib/statuses";
import { btn, btnDanger, selectSm } from "./ui";

export default function BulkBar({ count, total, onSelectAll, onClear, onStatus, onDelete, onDone }) {
  const [confirming, setConfirming] = useState(false);
  const plural = count === 1 ? "" : "s";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{count} selected</span>
        <button onClick={onSelectAll} className="text-xs text-muted underline hover:text-text">Select all ({total})</button>
        {count > 0 && <button onClick={onClear} className="text-xs text-muted underline hover:text-text">Clear</button>}
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {confirming ? (
            <>
              <span className="text-sm text-danger">Delete {count} job{plural}?</span>
              <button onClick={() => { setConfirming(false); onDelete(); }} className={btnDanger}>Yes, delete</button>
              <button onClick={() => setConfirming(false)} className={btn}>Cancel</button>
            </>
          ) : (
            <>
              <select
                aria-label="Change status"
                disabled={!count}
                value=""
                onChange={(e) => e.target.value && onStatus(e.target.value)}
                className={selectSm + " disabled:opacity-50"}
              >
                <option value="">Change status to...</option>
                {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <button disabled={!count} onClick={() => setConfirming(true)} className={btnDanger + " disabled:opacity-50"}>
                <Trash2 size={14} />Delete
              </button>
              <button onClick={onDone} className={btn}>Done</button>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
