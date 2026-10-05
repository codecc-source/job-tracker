import { mergeApplications, normalizeApplication } from "./backup";

const PAGE = 1000;
const CHUNK = 200;

async function pullAll(sb) {
  const out = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from("applications")
      .select("id, data, updated_at, deleted_at")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < PAGE) return out;
  }
}

export async function syncApplications(sb, userId, local) {
  const remote = await pullAll(sb);
  const remoteApps = remote
    .map((r) => normalizeApplication({ ...r.data, id: r.id, updated_at: r.updated_at, deleted_at: r.deleted_at }))
    .filter(Boolean);
  const remoteById = new Map(remoteApps.map((a) => [a.id, a]));

  const { merged, added, updated } = mergeApplications(local, remoteApps);
  const push = merged.filter((m) => {
    const r = remoteById.get(m.id);
    return !r || new Date(m.updated_at) > new Date(r.updated_at);
  });

  for (let i = 0; i < push.length; i += CHUNK) {
    const rows = push.slice(i, i + CHUNK).map((m) => ({
      user_id: userId, id: m.id, data: m, updated_at: m.updated_at, deleted_at: m.deleted_at,
    }));
    const { error } = await sb.from("applications").upsert(rows, { onConflict: "user_id,id" });
    if (error) throw error;
  }
  return { merged, pulled: added + updated, pushed: push.length };
}
