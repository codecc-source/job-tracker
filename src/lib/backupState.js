export const REMIND_AFTER_DAYS = 5;
export const REMIND_AFTER_ADDED = 10;

const K = {
  first: "jt:firstUseAt", last: "jt:lastExportAt", added: "jt:addedSinceExport",
  dirty: "jt:dirty", snooze: "jt:remindSnoozedUntil",
};

const get = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const del = (k) => { try { localStorage.removeItem(k); } catch {} };
const emit = () => window.dispatchEvent(new Event("jt:backup"));

export function readState() {
  return {
    firstUseAt: get(K.first),
    lastExportAt: get(K.last),
    addedSinceExport: Number(get(K.added)) || 0,
    dirty: get(K.dirty) === "1",
    snoozedUntil: get(K.snooze),
  };
}

export function initBackupState() {
  if (!get(K.first)) set(K.first, new Date().toISOString());
}

export function noteCreated() {
  set(K.added, String((Number(get(K.added)) || 0) + 1));
  set(K.dirty, "1");
  emit();
}

export function noteChanged() { set(K.dirty, "1"); emit(); }

export function noteExported() {
  set(K.last, new Date().toISOString());
  set(K.added, "0");
  set(K.dirty, "0");
  del(K.snooze);
  emit();
}

export function snoozeReminder(days = 1) {
  set(K.snooze, new Date(Date.now() + days * 86400000).toISOString());
  emit();
}

export function shouldRemind({ firstUseAt, lastExportAt, addedSinceExport, dirty, snoozedUntil }, now = new Date()) {
  if (snoozedUntil && now < new Date(snoozedUntil)) return false;
  if (addedSinceExport >= REMIND_AFTER_ADDED) return true;
  if (!dirty) return false;
  const base = new Date(lastExportAt ?? firstUseAt);
  return (now - base) / 86400000 >= REMIND_AFTER_DAYS;
}
