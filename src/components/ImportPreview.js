import { btn, btnPrimary, btnDanger } from "./ui";

export default function ImportPreview({ preview, localCount, onMerge, onReplace, onCancel }) {
  const { counts, rows, skipped } = preview;
  return (
    <div className="space-y-3 rounded-xl border border-accent/40 bg-accent/5 p-3 text-sm">
      <p className="font-medium">{counts.added} new, {counts.updated} updated, {counts.unchanged} unchanged</p>
      {skipped > 0 && <p className="text-amber-600 dark:text-amber-300">{skipped} invalid entries skipped.</p>}
      <div className="flex flex-wrap gap-2">
        <button onClick={onMerge} className={btnPrimary}>Merge</button>
        <button
          onClick={() => confirm(`Replace your ${localCount} applications with the ${rows.length} in this file?`) && onReplace()}
          className={btnDanger}
        >
          Replace everything
        </button>
        <button onClick={onCancel} className={btn}>Cancel</button>
      </div>
    </div>
  );
}
