"use client";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import {
  Plus, Download, Settings, DatabaseBackup, Info, CalendarPlus, Ellipsis, Cloud, CloudOff, RefreshCw,
  TriangleAlert, Hourglass, CalendarClock, Send, ChartColumn, ListChecks, X, Briefcase,
} from "lucide-react";
import { useApplications } from "@/hooks/useApplications";
import { usePreferences } from "@/hooks/usePreferences";
import { useCloud } from "@/hooks/useCloud";
import { buildBackup, exportBackup } from "@/lib/backup";
import { noteExported } from "@/lib/backupState";
import { sanitizePrefs } from "@/lib/preferences";
import { attentionFor } from "@/lib/attention";
import { buildStats } from "@/lib/stats";
import { upcomingEvents, downloadIcs } from "@/lib/calendar";
import { applyFilters, sourcesOf, DEFAULT_FILTERS } from "@/lib/filter";
import QuickAdd from "@/components/QuickAdd";
import NeedsAttention from "@/components/NeedsAttention";
import ApplicationList from "@/components/ApplicationList";
import FiltersBar from "@/components/FiltersBar";
import JobDetails from "@/components/JobDetails";
import ApplicationDrawer from "@/components/ApplicationDrawer";
import ReplyDialog from "@/components/ReplyDialog";
import CalendarDialog from "@/components/CalendarDialog";
import SettingsDialog from "@/components/SettingsDialog";
import BackupPanel from "@/components/BackupPanel";
import BackupReminder from "@/components/BackupReminder";
import AccountDialog from "@/components/AccountDialog";
import WelcomeDialog from "@/components/WelcomeDialog";
import StatsView from "@/components/StatsView";
import DropdownMenu from "@/components/DropdownMenu";
import Modal from "@/components/Modal";
import Footer from "@/components/Footer";
import { btn, btnPrimary } from "@/components/ui";

function Tile({ icon: Icon, label, value, color, onClick }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-line bg-surface p-3 text-left transition-colors hover:border-accent/50">
      <span className={`mb-2 grid size-8 place-items-center rounded-lg ${color}`}><Icon size={16} /></span>
      <span className="block text-2xl font-bold leading-none">{value}</span>
      <span className="mt-1 block text-xs text-muted">{label}</span>
    </button>
  );
}

export default function Home() {
  const { prefs, setPrefs, ready: prefsReady } = usePreferences();
  const {
    apps, all, ready, create, update, setStatus, logFollowUp, remove, importRows,
    autoGhost, reapply, dismissReapply, clearAll, applyRemote,
  } = useApplications();
  const cloud = useCloud({ rows: all, ready, applyRemote, onSignedOut: () => clearAll() });

  const [view, setView] = useState("jobs");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [tab, setTab] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [replyingId, setReplyingId] = useState(null);
  const [calendarId, setCalendarId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [welcome, setWelcome] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => { if (prefsReady) setTab(prefs.view); }, [prefsReady]);

  useEffect(() => {
    setWelcome(true);
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    setIosHint(ios && !standalone);
  }, []);

  useEffect(() => {
    if (!ready || !prefsReady) return;
    const span = { 30: "a month", 60: "2 months", 90: "3 months" }[prefs.ghostAfterDays];
    autoGhost(prefs.ghostAfterDays).then((n) => {
      if (n) toast(`${n} job${n > 1 ? "s" : ""} marked as Ghosted. Nothing had happened for over ${span}.`);
    });
  }, [ready, prefsReady, all, prefs.ghostAfterDays, autoGhost]);

  const filtered = !!(filters.q || filters.status || filters.source);
  const urls = useMemo(() => apps.map((a) => a.url).filter(Boolean), [apps]);
  const attn = useMemo(() => new Map(apps.map((a) => [a.id, attentionFor(a, prefs)])), [apps, prefs]);
  const stats = useMemo(() => buildStats(apps), [apps]);
  const needCount = useMemo(() => apps.filter((a) => attn.get(a.id).reasons.length).length, [apps, attn]);
  const shown = useMemo(
    () => applyFilters(apps, filters, attn).filter((a) => tab === "all" || attn.get(a.id).reasons.length),
    [apps, filters, tab, attn]
  );
  const viewing = apps.find((a) => a.id === viewingId);
  const replying = apps.find((a) => a.id === replyingId);
  const calendarApp = apps.find((a) => a.id === calendarId);

  const add = async (input) => { await create(input); toast.success("Added to your list"); };
  const follow = async (id) => { await logFollowUp(id); toast.success("Follow-up noted"); };
  const del = async (id) => { await remove(id); toast("Job deleted"); };
  const save = async (id, patch, opts) => { await update(id, patch, opts); toast.success("Saved"); };
  const reply = async (id, patch) => { await update(id, patch, { touch: true }); toast.success("Update saved"); };

  const handlers = {
    onStatus: setStatus, onFollowUp: follow, onDelete: del, onEdit: setEditing,
    onView: (a) => setViewingId(a.id), onReply: (a) => setReplyingId(a.id), onCalendar: (a) => setCalendarId(a.id),
    onReapply: async (id) => { await reapply(id); toast.success("Moved back to Applied"); },
    onDismiss: dismissReapply,
  };

  const exportNow = async () => {
    const r = await exportBackup(buildBackup(all, prefs));
    if (r !== "cancelled") { noteExported(); toast.success("Backup saved. Keep the file in a safe folder."); }
  };

  const doImport = async ({ rows, prefs: incoming }, mode) => {
    await importRows(rows, mode);
    if (mode === "replace" && incoming) setPrefs(sanitizePrefs(incoming));
  };

  const doClear = async () => {
    await clearAll({ keepTombstones: !!cloud.user });
    setDialog(null);
    toast("All data cleared");
  };

  const calendarAll = () => {
    const events = upcomingEvents(apps);
    if (!events.length) return toast("No upcoming interviews or deadlines yet.");
    downloadIcs(events, "job-tracker-upcoming");
    toast.success(`${events.length} event${events.length > 1 ? "s" : ""} saved. Open the file to add them.`);
  };

  const go = (patch, nextTab = "all") => { setView("jobs"); setTab(nextTab); setFilters({ ...DEFAULT_FILTERS, ...patch }); };

  const tabBtn = (id, Icon, label) => (
    <button
      onClick={() => setView(id)}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${view === id ? "bg-accent text-white" : "text-muted hover:text-text"}`}
    >
      <Icon size={16} />{label}
    </button>
  );
  const segCls = (t) => `rounded-md px-3 py-1 text-sm transition-colors ${tab === t ? "bg-accent text-white" : "text-muted hover:text-text"}`;
  const CloudIcon = cloud.status === "syncing" ? RefreshCw : cloud.status === "error" ? CloudOff : Cloud;

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <header className="mb-5 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-xl font-bold">
          <span className="grid size-10 place-items-center rounded-xl bg-white p-1">
            <img src="/job.png" alt="" className="size-full" />
          </span>
          Job Tracker
        </h1>
        <div className="flex items-center gap-2">
          {ready && apps.length > 0 && (
            <div className="hidden sm:block">
              <button onClick={() => setAdding(true)} className={btnPrimary}><Plus size={16} />Add a job</button>
            </div>
          )}
          {cloud.enabled && (
            <button onClick={() => setDialog("account")} className={btn + " relative"} aria-label="Sync and account" title={cloud.user ? "Synced account" : "Sign in to sync"}>
              <CloudIcon size={16} className={cloud.status === "syncing" ? "animate-spin" : ""} />
              {cloud.user && cloud.status === "ok" && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-emerald-500" />}
            </button>
          )}
          <DropdownMenu
            label="Menu"
            className={btn}
            button={<Ellipsis size={16} />}
            items={[
              { label: "Save backup", desc: "Keep a copy of your list as a file", icon: Download, onClick: exportNow },
              { label: "Backup and restore", desc: "Move your list to another device", icon: DatabaseBackup, onClick: () => setDialog("backup") },
              { label: "Add upcoming dates to calendar", desc: "Interviews and deadlines in one file", icon: CalendarPlus, onClick: calendarAll },
              { label: "Settings", icon: Settings, onClick: () => setDialog("settings") },
              { label: "How your data is saved", icon: Info, onClick: () => setWelcome(true) },
            ]}
          />
        </div>
      </header>

      <nav className="mb-5 inline-flex gap-1 rounded-xl border border-line bg-surface p-1">
        {tabBtn("jobs", ListChecks, "My jobs")}
        {tabBtn("stats", ChartColumn, "Weekly stats")}
      </nav>

      <BackupReminder onExport={exportNow} />
      {iosHint && <p className="mb-4 text-xs text-muted">Tip: tap Share, then Add to Home Screen, so your phone keeps your data.</p>}

      {view === "stats" ? (
        <StatsView apps={apps} />
      ) : ready && apps.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent/15 text-accent"><Briefcase size={26} /></span>
          <h2 className="text-lg font-semibold">Add your first job</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Keep every job you applied to in one place. We'll remind you when it's time to follow up.</p>
          <button onClick={() => setAdding(true)} className={btnPrimary + " mt-5"}><Plus size={16} />Add a job</button>
        </section>
      ) : (
        ready && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Tile icon={TriangleAlert} label="Need attention" value={needCount} color="bg-orange-500/15 text-orange-600 dark:text-orange-300" onClick={() => go({}, "attention")} />
              <Tile icon={Hourglass} label="Waiting for a reply" value={stats.waiting} color="bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" onClick={() => go({ status: "applied" })} />
              <Tile icon={CalendarClock} label="Interviews" value={stats.interviews} color="bg-purple-500/15 text-purple-700 dark:text-purple-300" onClick={() => go({ status: "interview" })} />
              <Tile icon={Send} label="Applied this week" value={stats.thisWeek} color="bg-blue-500/15 text-blue-600 dark:text-blue-300" onClick={() => setView("stats")} />
            </div>

            {tab === "all" && !filtered && <NeedsAttention apps={apps} attn={attn} {...handlers} />}

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-muted">
                {filtered ? "Results" : tab === "all" ? "All my jobs" : "Needs attention"} ({shown.length})
              </h2>
              <div className="flex items-center gap-2">
                {filtered && (
                  <button onClick={() => setFilters(DEFAULT_FILTERS)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-text"><X size={13} />Clear filters</button>
                )}
                <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
                  <button className={segCls("all")} onClick={() => setTab("all")}>All</button>
                  <button className={segCls("attention")} onClick={() => setTab("attention")}>Needs attention</button>
                </div>
              </div>
            </div>
            <FiltersBar filters={filters} onChange={setFilters} sources={sourcesOf(apps)} />
            <ApplicationList
              apps={shown}
              attn={attn}
              empty={filtered ? "No matches." : tab === "all" ? "Nothing here yet." : "Nothing needs your attention right now."}
              {...handlers}
            />
          </>
        )
      )}

      <Footer onInfo={() => setWelcome(true)} />

      <button
        onClick={() => setAdding(true)}
        aria-label="Add a job"
        className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-accent text-white shadow-xl shadow-black/40 transition-colors hover:bg-accent-hover sm:hidden"
      >
        <Plus size={26} />
      </button>

      {adding && (
        <Modal title="Add a job" onClose={() => setAdding(false)} wide>
          <QuickAdd onAdd={add} onDone={() => setAdding(false)} existingUrls={urls} defaultStatus={prefs.defaultStatus} defaultCurrency={prefs.defaultCurrency} />
        </Modal>
      )}
      {viewing && (
        <JobDetails
          app={viewing}
          thresholds={prefs.staleDays}
          onEdit={() => { setEditing(viewing); setViewingId(null); }}
          onClose={() => setViewingId(null)}
        />
      )}
      {editing && <ApplicationDrawer key={editing.id} app={editing} urls={urls} onSave={save} onClose={() => setEditing(null)} />}
      {replying && <ReplyDialog key={replying.id} app={replying} onSave={reply} onClose={() => setReplyingId(null)} />}
      {calendarApp && <CalendarDialog key={calendarApp.id} app={calendarApp} onClose={() => setCalendarId(null)} />}
      {dialog === "settings" && <SettingsDialog prefs={prefs} setPrefs={setPrefs} onClose={() => setDialog(null)} />}
      {dialog === "account" && <AccountDialog cloud={cloud} onClose={() => setDialog(null)} />}
      {dialog === "backup" && (
        <BackupPanel
          all={all} apps={apps} prefs={prefs} signedIn={!!cloud.user}
          onImport={doImport} onExported={noteExported} onClear={doClear} onClose={() => setDialog(null)}
        />
      )}
      {welcome && (
        <WelcomeDialog
          onClose={() => setWelcome(false)}
          onSignIn={cloud.enabled && !cloud.user ? () => { setWelcome(false); setDialog("account"); } : undefined}
        />
      )}
      <Toaster theme={prefs.theme} position="top-center" />
    </main>
  );
}
