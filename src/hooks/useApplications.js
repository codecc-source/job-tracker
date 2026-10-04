"use client";
import { useCallback, useEffect, useState } from "react";
import { localStore } from "@/lib/store/localStore";
import { uuid } from "@/lib/uuid";
import { mergeApplications } from "@/lib/backup";
import { initBackupState, noteCreated, noteChanged } from "@/lib/backupState";

const today = () => new Date().toISOString().slice(0, 10);

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
      status: "applied", applied_at: today(),
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

  const setStatus = (id, status) => update(id, { status }, { touch: true });
  const logFollowUp = (id) => update(id, {}, { touch: true });

  const remove = useCallback(async (id) => {
    await localStore.remove(id);
    const now = new Date().toISOString();
    setRows((r) => r.map((x) => (x.id === id ? { ...x, deleted_at: now, updated_at: now } : x)));
    noteChanged();
  }, []);

  const importRows = useCallback(async (incoming, mode) => {
    const next = mode === "replace" ? incoming : mergeApplications(rows, incoming).merged;
    await localStore.replaceAll(next);
    setRows(next);
    noteChanged();
  }, [rows]);

  const visible = rows.filter((r) => !r.deleted_at);
  return { apps: visible, all: rows, ready, create, update, setStatus, logFollowUp, remove, importRows };
}
