import { get, set } from "idb-keyval";

const KEY = "jt:data";

const readAll = async () => (await get(KEY)) ?? [];
const writeAll = (rows) => set(KEY, rows);

/* swappable store interface */
export const localStore = {
  list: readAll,
  async create(app) {
    const rows = await readAll();
    await writeAll([app, ...rows]);
    return app;
  },
  async update(id, patch) {
    const rows = await readAll();
    const next = rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
    await writeAll(next);
    return next.find((r) => r.id === id);
  },
  async remove(id) {
    const rows = await readAll();
    const now = new Date().toISOString();
    await writeAll(rows.map((r) => (r.id === id ? { ...r, deleted_at: now, updated_at: now } : r)));
  },
  replaceAll: writeAll,
};
