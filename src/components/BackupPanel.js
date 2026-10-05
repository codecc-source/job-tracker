"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Download, ClipboardCopy, FileSpreadsheet, Upload, Trash2 } from "lucide-react";
import Modal from "./Modal";
import ImportPreview from "./ImportPreview";
import { field, btn, btnDanger } from "./ui";
import { buildBackup, downloadBackup, readBackupFile, parseBackupText, normalizeApplications, mergeApplications } from "@/lib/backup";
import { downloadCsv } from "@/lib/csv";
import { copyText } from "@/lib/clipboard";

export default function BackupPanel({ all, apps, prefs, onImport, onExported, onClear, signedIn, onClose }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [paste, setPaste] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const stage = (data) => {
    const { rows, skipped } = normalizeApplications(data.applications);
    if (!rows.some((r) => !r.deleted_at)) throw new Error("This backup has no jobs in it, so there is nothing to restore.");
    setPreview({ rows, skipped, prefs: data.preferences, counts: mergeApplications(all, rows.filter((r) => !r.deleted_at)) });
  };

  const run = async (fn) => {
    setError("");
    try { stage(await fn()); } catch (e) { setError(e.message); }
  };

  const download = () => {
    downloadBackup(buildBackup(all, prefs));
    onExported();
    toast.success("Backup file saved. Move it to a safe folder.");
  };

  const copy = async () => {
    setError("");
    if (await copyText(JSON.stringify(buildBackup(all, prefs)))) {
      onExported();
      toast.success("Backup copied. Paste it into a note or email to yourself.");
    } else setError("Copying didn't work on this device. Use Save backup file instead.");
  };

  const doImport = async (mode) => {
    await onImport(preview, mode);
    setPreview(null); setPaste("");
    toast.success(mode === "replace" ? "Your list was replaced" : "Backup added to your list");
  };

  return (
    <Modal title="Backup and restore" onClose={onClose}>
      <p className="text-sm text-muted">Your list is saved on this device only. A backup is a small file that keeps a copy safe, or moves your list to another device.</p>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Save a backup</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Tap <b className="text-text">Save backup file</b>.</li>
          <li>Keep the file in a folder you can easily find again, like Documents on a laptop or the Files app on a phone.</li>
          <li>For extra safety, also upload it to Google Drive or iCloud, or email it to yourself.</li>
        </ol>
        <div className="flex flex-wrap gap-2 pt-1">
          <button onClick={download} className={btn}><Download size={14} />Save backup file</button>
          <button onClick={copy} className={btn}><ClipboardCopy size={14} />Copy backup</button>
          <button onClick={() => (apps.length ? downloadCsv(apps) : toast("You have no jobs to export yet."))} className={btn}><FileSpreadsheet size={14} />Save as spreadsheet</button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Restore from a backup</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
          <li>Tap <b className="text-text">Choose file</b> and pick your saved backup file.</li>
          <li>Check the numbers shown, then choose how to add it.</li>
        </ol>
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
        <details className="text-sm">
          <summary className="cursor-pointer text-muted">Can't pick a file? Paste your backup instead</summary>
          <div className="mt-2 space-y-2">
            <textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste your backup here" className={field} />
            <button disabled={!paste.trim()} onClick={() => run(async () => parseBackupText(paste))} className={btn}>
              <Upload size={14} />Use pasted backup
            </button>
          </div>
        </details>
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

      <section className="space-y-2 rounded-xl border border-danger/30 p-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-danger"><Trash2 size={14} />Clear all data</h3>
        <p className="text-sm text-muted">
          {signedIn ? "Deletes every job from this device and from your online copy, so you can start fresh. This can't be undone." : "Deletes every job from this device so you can start fresh. This can't be undone."}
        </p>
        {!confirmClear ? (
          <button onClick={() => setConfirmClear(true)} className={btnDanger}>Clear all data</button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Are you sure? Save a backup first if you might want your list back.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={download} className={btn}>Save backup first</button>
              <button onClick={onClear} className={btnDanger}>Yes, delete everything</button>
              <button onClick={() => setConfirmClear(false)} className={btn}>Cancel</button>
            </div>
          </div>
        )}
      </section>
    </Modal>
  );
}
