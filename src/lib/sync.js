import { mergeApplications, normalizeApplication } from "./backup";

const PAGE = 1000;
const CHUNK = 200;
const OVERLAP_MS = 2 * 60 * 1000;
const FULL_EVERY_MS = 7 * 24 * 60 * 60 * 1000;
const BASE = "id, data, updated_at, deleted_at";

async function pull(sb, since) {
  let withCursor = true;
  let from = 0;
  const out = [];
  for (;;) {
    let q = sb.from("applications").select(withCursor ? `${BASE}, synced_at` : BASE);
    if (withCursor && since) q = q.gt("synced_at", since);
    q = (withCursor ? q.order("synced_at").order("id") : q.order("id")).range(from, from + PAGE - 1);
    const { data, error } = await q;
    if (error) {
      if (withCursor && /synced_at/i.test(error.message || "")) {
        withCursor = false;
        since = null;
        from = 0;
        out.length = 0;
        continue;
      }
      throw error;
    }
    out.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return { rows: out, withCursor, incremental: withCursor && !!since };
}

const toApp = (r) => normalizeApplication({ ...r.data, id: r.id, updated_at: r.updated_at, deleted_at: r.deleted_at });

export async function pullRemoteApplications(sb) {
  const { rows } = await pull(sb, null);
  return rows.map(toApp).filter(Boolean);
}

export async function syncApplications(sb, userId, local, { allowMassDelete = false, state = null, forceFull = false } = {}) {
  const wantFull = forceFull || !state || !state.cursor || local.length === 0 || Date.now() - (state.fullAt || 0) > FULL_EVERY_MS;
  const since = wantFull ? null : state.cursor;
  const { rows, withCursor, incremental } = await pull(sb, since);

  const remoteApps = rows.map(toApp).filter(Boolean);
  const pushed = incremental ? { ...state.pushed } : {};
  for (const r of remoteApps) pushed[r.id] = r.updated_at;

  const { merged, added, updated } = mergeApplications(local, remoteApps);
  const push = merged.filter((m) => {
    const p = pushed[m.id];
    return !p || new Date(m.updated_at) > new Date(p);
  });

  const deletes = push.filter((m) => m.deleted_at && pushed[m.id]).length;
  if (!allowMassDelete && deletes >= 3) {
    const { count, error } = await sb.from("applications").select("id", { count: "exact", head: true }).is("deleted_at", null);
    if (error) throw error;
    if (deletes * 2 > (count ?? 0)) {
      throw Object.assign(new Error("mass_delete"), { code: "MASS_DELETE", count: deletes });
    }
  }

  for (let i = 0; i < push.length; i += CHUNK) {
    const batch = push.slice(i, i + CHUNK).map((m) => ({
      user_id: userId, id: m.id, data: m, updated_at: m.updated_at, deleted_at: m.deleted_at,
    }));
    const { error } = await sb.from("applications").upsert(batch, { onConflict: "user_id,id" });
    if (error) throw error;
  }
  for (const m of push) pushed[m.id] = m.updated_at;

  const prevCursor = incremental ? state.cursor : null;
  let newest = prevCursor;
  for (const r of rows) {
    if (r.synced_at && (!newest || new Date(r.synced_at) > new Date(newest))) newest = r.synced_at;
  }
  let cursor = prevCursor;
  if (newest) {
    const capped = new Date(Math.min(new Date(newest).getTime(), Date.now() - OVERLAP_MS)).toISOString();
    cursor = prevCursor && new Date(prevCursor) > new Date(capped) ? prevCursor : capped;
  }
  const nextState = withCursor
    ? { cursor, fullAt: incremental ? state.fullAt : Date.now(), pushed }
    : null;

  return { merged, pulled: added + updated, pushed: push.length, state: nextState, incremental };
}

export async function syncSettings(sb, userId, local) {
  const { data, error } = await sb.from("user_settings").select("data, updated_at").maybeSingle();
  if (error) return { skipped: true };
  const remoteAt = data ? new Date(data.updated_at).getTime() : 0;
  if (data && remoteAt > local.at) return { apply: data.data, at: remoteAt };
  if (local.at > remoteAt) {
    const { error: e } = await sb.from("user_settings").upsert(
      { user_id: userId, data: local.data, updated_at: new Date(local.at).toISOString() },
      { onConflict: "user_id" }
    );
    return e ? { skipped: true } : { pushed: true };
  }
  return {};
}
