import { btn, btnPrimary, btnDanger } from "./ui";

export default function ImportPreview({ preview, localCount, onMerge, onReplace, onCancel }) {
  const { counts, rows, skipped } = preview;
  return (
    <div className="space-y-3 rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm">
      <p className="font-medium">Found in this file: {counts.added} new, {counts.updated} changed, {counts.unchanged} already in your list.</p>
      {skipped > 0 && <p className="text-amber-600 dark:text-amber-300">{skipped} items could not be read and were skipped.</p>}
      <p className="text-muted">Choose how to add them:</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={onMerge} className={btnPrimary}>Add to my list (recommended)</button>
        <button
          onClick={() => confirm(`This replaces your ${localCount} jobs with the ${rows.length} in the file. Continue?`) && onReplace()}
          className={btnDanger}
        >
          Replace my list
        </button>
        <button onClick={onCancel} className={btn}>Cancel</button>
      </div>
    </div>
  );
}
