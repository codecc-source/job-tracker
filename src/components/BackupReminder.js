"use client";
import { useEffect, useState } from "react";
import { HardDriveDownload } from "lucide-react";
import { readState, shouldRemind, snoozeReminder } from "@/lib/backupState";
import { btn, btnPrimary } from "./ui";

export default function BackupReminder({ onExport }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => setShow(shouldRemind(readState()));
    check();
    window.addEventListener("jt:backup", check);
    return () => window.removeEventListener("jt:backup", check);
  }, []);

  if (!show) return null;
  return (
    <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
      <HardDriveDownload size={18} className="shrink-0" />
      <span className="flex-1">Time for a backup. Your data only lives on this device.</span>
      <button onClick={onExport} className={btnPrimary}>Export now</button>
      <button onClick={() => snoozeReminder(1)} className={btn}>Later</button>
    </div>
  );
}
