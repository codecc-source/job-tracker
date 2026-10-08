"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_PREFS, loadPrefs, savePrefs, sanitizePrefs, applyTheme, pickSynced, loadPrefsAt, savePrefsAt,
} from "@/lib/preferences";

export function usePreferences() {
  const [prefs, setPrefsState] = useState(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

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
      if (JSON.stringify(pickSynced(next)) !== JSON.stringify(pickSynced(p))) savePrefsAt(Date.now());
      return next;
    });
  }, []);

  const getSyncable = useCallback(() => ({ data: pickSynced(prefsRef.current), at: loadPrefsAt() }), []);

  const applyRemotePrefs = useCallback((data, at) => {
    setPrefsState((p) => {
      const next = sanitizePrefs({ ...p, ...pickSynced(sanitizePrefs(data)) });
      savePrefs(next);
      return next;
    });
    savePrefsAt(at);
  }, []);

  return { prefs, setPrefs, ready, getSyncable, applyRemotePrefs };
}
