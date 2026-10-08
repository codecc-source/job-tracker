const TRACKING = /^(utm_.+|fbclid|gclid|msclkid|mc_cid|mc_eid|trk|trackingid|refid)$/i;

export function cleanUrl(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) && !/^[^\s/:]+:\d+/.test(raw);
  if (hasScheme && !/^https?:\/\//i.test(raw)) return "";
  const candidate = hasScheme ? raw : `https://${raw.replace(/^\/\//, "")}`;
  let u;
  try { u = new URL(candidate); } catch { return ""; }
  if (!/^https?:$/.test(u.protocol) || !u.hostname.includes(".")) return "";
  for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
  return u.toString();
}
