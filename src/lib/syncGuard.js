const KEY = "jt:allow-delete";

export function permitMassDelete() {
  try { localStorage.setItem(KEY, "1"); } catch {}
}

export function isMassDeletePermitted() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function clearMassDeletePermit() {
  try { localStorage.removeItem(KEY); } catch {}
}
