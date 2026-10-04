"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Download, ClipboardCopy, FileSpreadsheet, Upload } from "lucide-react";
import Modal from "./Modal";
import ImportPreview from "./ImportPreview";
import { field, btn } from "./ui";
import { buildBackup, downloadBackup, readBackupFile, parseBackupText, normalizeApplications, mergeApplications } from "@/lib/backup";
import { downloadCsv } from "@/lib/csv";

export default function BackupPanel({ all, apps, prefs, onImport, onExported, onClose }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");

  const stage = (data) => {
    const { rows, skipped } = normalizeApplications(data.applications);
    setPreview({ rows, skipped, prefs: data.preferences, counts: mergeApplications(all, rows) });
  };

  const run = async (fn) => {
    setError("");
    try { stage(await fn()); } catch (e) { setError(e.message); }
  };

  const download = () => { downloadBackup(buildBackup(all, prefs)); onExported(); toast.success("Backup downloaded"); };

  const copy = async () => {
    setError("");
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildBackup(all, prefs)));
      onExported();
      toast.success("Backup copied to clipboard");
    } catch { setError("Clipboard not available here."); }
  };

  const doImport = async (mode) => {
    await onImport(preview, mode);
    setPreview(null); setPaste("");
    toast.success(mode === "replace" ? "Data replaced" : "Backup merged");
  };

  return (
    <Modal title="Backup and transfer" onClose={onClose}>
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Export</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={download} className={btn}><Download size={14} />Download file</button>
          <button onClick={copy} className={btn}><ClipboardCopy size={14} />Copy to clipboard</button>
          <button onClick={() => downloadCsv(apps)} className={btn}><FileSpreadsheet size={14} />CSV</button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Import</h3>
        <input
          type="file"
          accept="application/json,.json"
          aria-label="Backup file"
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-text"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) run(() => readBackupFile(file));
          }}
        />
        <textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Or paste a backup here" className={field} />
        <button disabled={!paste.trim()} onClick={() => run(async () => parseBackupText(paste))} className={btn}>
          <Upload size={14} />Import pasted backup
        </button>
      </section>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      {preview && (
        <ImportPreview
          preview={preview}
          localCount={all.filter((a) => !a.deleted_at).length}
          onMerge={() => doImport("merge")}
          onReplace={() => doImport("replace")}
          onCancel={() => setPreview(null)}
        />
      )}
    </Modal>
  );
}
