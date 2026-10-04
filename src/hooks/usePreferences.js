"use client";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFS, loadPrefs, savePrefs, sanitizePrefs, applyTheme } from "@/lib/preferences";

export function usePreferences() {
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => { setPrefsState(loadPrefs()); setReady(true); }, []);

  useEffect(() => {
    if (!ready) return;
    applyTheme(prefs.theme);
    if (prefs.theme !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [ready, prefs.theme]);

  const setPrefs = useCallback((patch) => {
    setPrefsState((p) => {
      const next = sanitizePrefs({ ...p, ...patch });
      savePrefs(next);
      return next;
    });
  }, []);

  return { prefs, setPrefs, ready };
}
