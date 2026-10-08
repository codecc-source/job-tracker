"use client";
import { useCallback, useEffect, useState } from "react";
import { localStore } from "@/lib/store/localStore";
import { uuid } from "@/lib/uuid";
import { isoDay } from "@/lib/dates";
import { shouldAutoGhost } from "@/lib/attention";
import { mergeApplications } from "@/lib/backup";
import { makeTombstone } from "@/lib/fields";
import { cleanUrl } from "@/lib/url";
import { permitMassDelete } from "@/lib/syncGuard";
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
      url: cleanUrl(input?.url),
      last_update_at: now, updated_at: now, deleted_at: null,
    };
    await localStore.create(app);
    setRows((r) => [app, ...r]);
    noteCreated();
  }, []);

  const update = useCallback(async (id, patch, { touch = false } = {}) => {
    const now = new Date().toISOString();
    const clean = "url" in patch ? { ...patch, url: cleanUrl(patch.url) } : patch;
    const full = { ...clean, updated_at: now, ...(touch ? { last_update_at: now, activity_at: isoDay() } : {}) };
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

  const updateMany = useCallback(async (ids, patch, { touch = false } = {}) => {
    const set = new Set(ids);
    const now = new Date().toISOString();
    const cur = await localStore.list();
    const next = cur.map((a) => (
      set.has(a.id) && !a.deleted_at
        ? { ...a, ...patch, updated_at: now, ...(touch ? { last_update_at: now, activity_at: isoDay() } : {}) }
        : a
    ));
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
  }, []);

  const removeMany = useCallback(async (ids) => {
    const set = new Set(ids);
    const cur = await localStore.list();
    const prev = cur.filter((a) => set.has(a.id) && !a.deleted_at);
    if (!prev.length) return [];
    const next = cur.map((a) => (set.has(a.id) && !a.deleted_at ? makeTombstone(a.id) : a));
    if (prev.length >= 3) permitMassDelete();
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
    return prev;
  }, []);

  const restoreMany = useCallback(async (prevRows) => {
    if (!prevRows?.length) return;
    const byId = new Map(prevRows.map((p) => [p.id, p]));
    const now = new Date().toISOString();
    const cur = await localStore.list();
    const next = cur.map((a) => (byId.has(a.id) ? { ...byId.get(a.id), deleted_at: null, updated_at: now } : a));
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
  }, []);

  const remove = useCallback(async (id) => (await removeMany([id]))[0] ?? null, [removeMany]);
  const restore = useCallback((prev) => restoreMany(prev ? [prev] : []), [restoreMany]);
  const bulkStatus = useCallback(
    (ids, status) => updateMany(ids, { status, ghosted_auto: false }, { touch: true }),
    [updateMany]
  );

  const importRows = useCallback(async (incoming, mode) => {
    let next;
    if (mode === "replace") {
      const now = new Date().toISOString();
      const keep = incoming.map((r) => ({ ...r, updated_at: now }));
      const ids = new Set(keep.map((r) => r.id));
      next = [...keep, ...rows.filter((r) => !ids.has(r.id)).map((r) => makeTombstone(r.id))];
      permitMassDelete();
    } else {
      next = mergeApplications(rows, incoming).merged;
    }
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
  }, [rows]);

  const autoGhost = useCallback(async (days) => {
    const cur = await localStore.list();
    const hit = new Set(cur.filter((a) => !a.deleted_at && shouldAutoGhost(a, days)).map((a) => a.id));
    if (!hit.size) return 0;
    const now = new Date().toISOString();
    const next = cur.map((a) => (hit.has(a.id) ? { ...a, status: "ghosted", ghosted_auto: true, updated_at: now } : a));
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
    return hit.size;
  }, []);

  const clearAll = useCallback(async ({ keepTombstones = false } = {}) => {
    const cur = await localStore.list();
    const next = keepTombstones ? cur.map((r) => makeTombstone(r.id)) : [];
    if (keepTombstones) permitMassDelete();
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

  const replaceWith = useCallback(async (next) => {
    await localStore.replaceAll(next);
    setRows(next);
  }, []);

  const visible = rows.filter((r) => !r.deleted_at);
  return {
    apps: visible, all: rows, ready, create, update, setStatus, logFollowUp, remove, restore,
    removeMany, restoreMany, bulkStatus, importRows, autoGhost, reapply, dismissReapply, clearAll, applyRemote, replaceWith,
  };
}
