"use client";
import { useCallback, useEffect, useState } from "react";
import { localStore } from "@/lib/store/localStore";
import { uuid } from "@/lib/uuid";
import { isoDay } from "@/lib/dates";
import { shouldAutoGhost } from "@/lib/attention";
import { mergeApplications } from "@/lib/backup";
import { makeTombstone } from "@/lib/fields";
import { initBackupState, noteCreated, noteChanged, noteCleared } from "@/lib/backupState";

export function useApplications() {
  const [rows, setRows] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initBackupState();
    localStore.list().then((r) => { setRows(r); setReady(true); });
    navigator.storage?.persist?.();
  }, []);

  const create = useCallback(async (input) => {
    const now = new Date().toISOString();
    const app = {
      id: uuid(),
      title: "", company: "", url: "", source: "",
      status: "applied", applied_at: isoDay(),
      notes: "", job_description: "",
      ...input,
      last_update_at: now, updated_at: now, deleted_at: null,
    };
    await localStore.create(app);
    setRows((r) => [app, ...r]);
    noteCreated();
  }, []);

  const update = useCallback(async (id, patch, { touch = false } = {}) => {
    const now = new Date().toISOString();
    const full = { ...patch, updated_at: now, ...(touch ? { last_update_at: now } : {}) };
    const next = await localStore.update(id, full);
    setRows((r) => r.map((x) => (x.id === id ? next : x)));
    noteChanged();
  }, []);

  const setStatus = (id, status) => update(id, { status, ghosted_auto: false }, { touch: true });
  const logFollowUp = (id) => update(id, {}, { touch: true });
  const dismissReapply = (id) => update(id, { reapply_dismissed: true });

  const reapply = (id) =>
    update(id, {
      status: "applied", applied_at: isoDay(), next_step: "", next_step_date: "",
      ghosted_auto: false, reapply_dismissed: false,
    }, { touch: true });

  const remove = useCallback(async (id) => {
    await localStore.remove(id);
    setRows((r) => r.map((x) => (x.id === id ? makeTombstone(id) : x)));
    noteChanged();
  }, []);

  const importRows = useCallback(async (incoming, mode) => {
    let next;
    if (mode === "replace") {
      const now = new Date().toISOString();
      const keep = incoming.map((r) => ({ ...r, updated_at: now }));
      const ids = new Set(keep.map((r) => r.id));
      next = [...keep, ...rows.filter((r) => !ids.has(r.id)).map((r) => makeTombstone(r.id))];
    } else {
      next = mergeApplications(rows, incoming).merged;
    }
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
  }, [rows]);

  const autoGhost = useCallback(async (days) => {
    const hit = new Set(rows.filter((a) => !a.deleted_at && shouldAutoGhost(a, days)).map((a) => a.id));
    if (!hit.size) return 0;
    const now = new Date().toISOString();
    const next = rows.map((a) => (hit.has(a.id) ? { ...a, status: "ghosted", ghosted_auto: true, updated_at: now } : a));
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
    return hit.size;
  }, [rows]);

  const clearAll = useCallback(async ({ keepTombstones = false } = {}) => {
    const cur = await localStore.list();
    const next = keepTombstones ? cur.map((r) => makeTombstone(r.id)) : [];
    await localStore.replaceAll(next);
    setRows(next);
    noteCleared();
  }, []);

  const applyRemote = useCallback(async (incoming) => {
    const cur = await localStore.list();
    const { merged, added, updated } = mergeApplications(cur, incoming);
    if (!added && !updated) return 0;
    await localStore.replaceAll(merged);
    setRows(merged);
    return added + updated;
  }, []);

  const visible = rows.filter((r) => !r.deleted_at);
  return {
    apps: visible, all: rows, ready, create, update, setStatus, logFollowUp, remove,
    importRows, autoGhost, reapply, dismissReapply, clearAll, applyRemote,
  };
}
