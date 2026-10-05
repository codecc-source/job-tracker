export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0";
    const host = document.activeElement?.closest?.("[role=dialog]") ?? document.body;
    host.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    host.removeChild(ta);
    return ok;
  } catch { return false; }
}
