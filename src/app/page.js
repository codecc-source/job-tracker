"use client";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { Briefcase, Download, Settings, DatabaseBackup } from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { usePreferences } from "@/hooks/usePreferences";
import { buildBackup, exportBackup } from "@/lib/backup";
import { noteExported } from "@/lib/backupState";
import { sanitizePrefs } from "@/lib/preferences";
import { staleness } from "@/lib/stale";
import { applyFilters, sourcesOf, DEFAULT_FILTERS } from "@/lib/filter";
import QuickAdd from "@/components/QuickAdd";
import NeedsAttention from "@/components/NeedsAttention";
import ApplicationList from "@/components/ApplicationList";
import FiltersBar from "@/components/FiltersBar";
import JobDetails from "@/components/JobDetails";
import ApplicationDrawer from "@/components/ApplicationDrawer";
import SettingsDialog from "@/components/SettingsDialog";
import BackupPanel from "@/components/BackupPanel";
import BackupReminder from "@/components/BackupReminder";
import WelcomeDialog from "@/components/WelcomeDialog";
import Footer from "@/components/Footer";
import { btn, btnPrimary } from "@/components/ui";

const WELCOME_KEY = "jt:welcomeSeen";

export default function Home() {
  const { prefs, setPrefs, ready: prefsReady } = usePreferences();
  const { apps, all, ready, create, update, setStatus, logFollowUp, remove, importRows } = useApplications();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [welcome, setWelcome] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => { if (prefsReady) setTab(prefs.view); }, [prefsReady]);

  useEffect(() => {
    try { if (!localStorage.getItem(WELCOME_KEY)) setWelcome(true); } catch {}
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    setIosHint(ios && !standalone);
  }, []);

  const closeWelcome = () => {
    try { localStorage.setItem(WELCOME_KEY, "1"); } catch {}
    setWelcome(false);
  };

  const thresholds = prefs.staleDays;
  const filtered = filters.q || filters.status || filters.source;
  const urls = useMemo(() => apps.map((a) => a.url).filter(Boolean), [apps]);
  const shown = useMemo(
    () => applyFilters(apps, filters).filter((a) => tab === "all" || staleness(a, thresholds)),
    [apps, filters, tab, thresholds]
  );
  const viewing = apps.find((a) => a.id === viewingId);

  const add = async (input) => { await create(input); toast.success("Application added"); };
  const follow = async (id) => { await logFollowUp(id); toast.success("Follow-up logged"); };
  const del = async (id) => { await remove(id); toast("Application deleted"); };
  const save = async (id, patch, opts) => { await update(id, patch, opts); toast.success("Saved"); };

  const handlers = { onStatus: setStatus, onFollowUp: follow, onDelete: del, onEdit: setEditing, onView: (a) => setViewingId(a.id), thresholds };

  const exportNow = async () => {
    const r = await exportBackup(buildBackup(all, prefs));
    if (r !== "cancelled") { noteExported(); toast.success("Backup exported"); }
  };

  const doImport = async ({ rows, prefs: incoming }, mode) => {
    await importRows(rows, mode);
    if (mode === "replace" && incoming) setPrefs(sanitizePrefs(incoming));
  };

  const tabCls = (t) =>
    `rounded-md px-3 py-1 text-sm transition-colors ${tab === t ? "bg-accent text-white" : "text-muted hover:text-text"}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-white"><Briefcase size={18} /></span>
          Job Tracker
        </h1>
        <div className="flex gap-2">
          <button onClick={exportNow} className={btnPrimary}><Download size={15} />Export</button>
          <button onClick={() => setDialog("backup")} className={btn}><DatabaseBackup size={15} /><span className="hidden sm:inline">Backup</span></button>
          <button onClick={() => setDialog("settings")} className={btn} aria-label="Settings"><Settings size={15} /></button>
        </div>
      </header>

      <BackupReminder onExport={exportNow} />
      {iosHint && <p className="mb-4 text-xs text-muted">Add to Home Screen to keep your data safe.</p>}

      <QuickAdd onAdd={add} existingUrls={urls} defaultStatus={prefs.defaultStatus} />

      {ready && (
        <>
          {tab === "all" && !filtered && <NeedsAttention apps={apps} {...handlers} />}
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-muted">
              {filtered ? "Results" : tab === "all" ? "All applications" : "Needs attention"} ({shown.length})
            </h2>
            <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
              <button className={tabCls("all")} onClick={() => setTab("all")}>All</button>
              <button className={tabCls("attention")} onClick={() => setTab("attention")}>Needs attention</button>
            </div>
          </div>
          <FiltersBar filters={filters} onChange={setFilters} sources={sourcesOf(apps)} />
          <ApplicationList
            apps={shown}
            empty={filtered ? "No matches." : tab === "all" ? "No applications yet. Add your first one above." : "Nothing is overdue."}
            {...handlers}
          />
        </>
      )}

      <Footer onInfo={() => setWelcome(true)} />

      {viewing && (
        <JobDetails
          app={viewing}
          thresholds={thresholds}
          onEdit={() => { setEditing(viewing); setViewingId(null); }}
          onClose={() => setViewingId(null)}
        />
      )}
      {editing && <ApplicationDrawer key={editing.id} app={editing} urls={urls} onSave={save} onClose={() => setEditing(null)} />}
      {dialog === "settings" && <SettingsDialog prefs={prefs} setPrefs={setPrefs} onClose={() => setDialog(null)} />}
      {dialog === "backup" && (
        <BackupPanel all={all} apps={apps} prefs={prefs} onImport={doImport} onExported={noteExported} onClose={() => setDialog(null)} />
      )}
      {welcome && <WelcomeDialog onClose={closeWelcome} />}
      <Toaster theme={prefs.theme} position="bottom-right" />
    </main>
  );
}
