import { get, set, del } from "idb-keyval";

const key = (uid) => `jt:sync:${uid}`;

export const loadSyncState = async (uid) => (await get(key(uid))) ?? null;
export const saveSyncState = (uid, state) => set(key(uid), state);
export const clearSyncState = (uid) => del(key(uid));
