"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, cloudEnabled } from "@/lib/supabase";
import { syncApplications, syncSettings, pullRemoteApplications } from "@/lib/sync";
import { loadSyncState, saveSyncState, clearSyncState } from "@/lib/syncState";
import { isMassDeletePermitted, permitMassDelete, clearMassDeletePermit } from "@/lib/syncGuard";

const SYNC_EVERY_MS = 10 * 60 * 1000;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function friendlyError(e) {
  const m = (e?.message || "").toLowerCase();
  if (e?.code === "MASS_DELETE") return "Sync is paused because many jobs were deleted. Choose Restore or Delete in the box above, then try again.";
  if (m.includes("signups not allowed") || m.includes("user not found") || m.includes("not allowed for otp")) return "This app is invite-only. Ask the owner to add or confirm your email, then try again.";
  if (m.includes("captcha")) return "Please complete the security check and try again.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many emails were sent. Please wait a few minutes and try again.";
  if (m.includes("expired") || m.includes("invalid")) return "That code didn't work. Check it, or ask for a new one.";
  if (m.includes("fetch") || m.includes("network")) return "No internet connection. Your changes are safe on this device and will sync later.";
  return e?.message || "Something went wrong. Please try again.";
}

export function useCloud({ rows, ready, applyRemote, replaceWith, onSignedOut, onNotice, settings }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [blocked, setBlockedState] = useState(null);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const userRef = useRef(null);
  userRef.current = user;
  const cbs = useRef({});
  cbs.current = { applyRemote, replaceWith, onSignedOut, onNotice, settings };
  const settingsStamp = settings?.stamp ?? "";
  const busy = useRef(false);
  const again = useRef(false);
  const blockedRef = useRef(false);
  const userId = user?.id ?? null;

  const setBlocked = useCallback((b) => { blockedRef.current = !!b; setBlockedState(b); }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) setBlocked(null);
  }, [userId, setBlocked]);

  const runSync = useCallback(async (force = false) => {
    if (!supabase || !userRef.current) return;
    if (busy.current) { again.current = true; return; }
    busy.current = true;
    setStatus("syncing");
    setError("");
    try {
      const uid = userRef.current.id;
      const wasEmpty = rowsRef.current.length === 0;
      const state = await loadSyncState(uid);
      const res = await syncApplications(supabase, uid, rowsRef.current, {
        allowMassDelete: isMassDeletePermitted(), state, forceFull: force === true,
      });
      clearMassDeletePermit();
      setBlocked(null);
      const n = await cbs.current.applyRemote(res.merged);
      if (res.state) await saveSyncState(uid, res.state);
      if (wasEmpty && n) cbs.current.onNotice?.(`Restored ${n} job${n > 1 ? "s" : ""} from your account.`);
      const st = cbs.current.settings;
      if (st?.ready) {
        const r = await syncSettings(supabase, uid, st.get());
        if (r.apply) st.apply(r.apply, r.at);
      }
      setLastSync(new Date());
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      if (e?.code === "MASS_DELETE") {
        if (!blockedRef.current) cbs.current.onNotice?.("Sync paused to protect your data. Open the cloud icon to review.");
        setBlocked({ count: e.count });
        setError(`Sync paused to protect your data. ${e.count} jobs would be deleted from your account.`);
      } else {
        setError(friendlyError(e));
      }
    } finally {
      busy.current = false;
      if (again.current) {
        again.current = false;
        if (!blockedRef.current) runSync();
      }
    }
  }, [setBlocked]);

  const autoSync = useCallback(() => {
    if (blockedRef.current) return;
    return runSync();
  }, [runSync]);

  useEffect(() => {
    if (!userId || !ready) return;
    const t = setTimeout(autoSync, 2000);
    return () => clearTimeout(t);
  }, [rows, settingsStamp, userId, ready, autoSync]);

  useEffect(() => {
    if (!userId) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") autoSync();
    }, SYNC_EVERY_MS);
    return () => clearInterval(t);
  }, [userId, autoSync]);

  useEffect(() => {
    if (!userId) return;
    window.addEventListener("online", autoSync);
    return () => window.removeEventListener("online", autoSync);
  }, [userId, autoSync]);

  const sendCode = async (email, captchaToken) => {
    const { error: e } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: false, ...(captchaToken ? { captchaToken } : {}) },
    });
    if (e) throw e;
  };

  const verify = async (email, token) => {
    const { error: e } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (e) throw e;
  };

  const signOut = async () => {
    while (busy.current) await wait(100);
    busy.current = true;
    try {
      const u = userRef.current;
      if (u) {
        const state = await loadSyncState(u.id);
        await syncApplications(supabase, u.id, rowsRef.current, { allowMassDelete: isMassDeletePermitted(), state });
        const st = cbs.current.settings;
        if (st?.ready) await syncSettings(supabase, u.id, st.get());
      }
      const { error: e } = await supabase.auth.signOut({ scope: "local" });
      if (e) throw e;
      if (u) await clearSyncState(u.id);
      await cbs.current.onSignedOut?.();
    } catch (e) {
      if (e?.code === "MASS_DELETE") setBlocked({ count: e.count });
      throw e;
    } finally {
      again.current = false;
      busy.current = false;
    }
  };

  const deleteAccount = async () => {
    while (busy.current) await wait(100);
    busy.current = true;
    try {
      const u = userRef.current;
      const { error: e } = await supabase.rpc("delete_my_account");
      if (e) throw e;
      await supabase.auth.signOut({ scope: "local" });
      if (u) await clearSyncState(u.id);
      await cbs.current.onSignedOut?.();
    } finally {
      again.current = false;
      busy.current = false;
    }
  };

  const resolveBlocked = async (choice) => {
    while (busy.current) await wait(100);
    if (choice === "delete") {
      permitMassDelete();
      setBlocked(null);
      return runSync();
    }
    busy.current = true;
    try {
      const remote = await pullRemoteApplications(supabase);
      const local = rowsRef.current;
      const remoteById = new Map(remote.map((a) => [a.id, a]));
      const have = new Set(local.map((a) => a.id));
      const next = local.map((l) => {
        const r = remoteById.get(l.id);
        return r && l.deleted_at && !r.deleted_at ? r : l;
      });
      for (const r of remote) if (!have.has(r.id)) next.push(r);
      await cbs.current.replaceWith(next);
      if (userRef.current) await clearSyncState(userRef.current.id);
      clearMassDeletePermit();
      setBlocked(null);
    } finally {
      busy.current = false;
    }
    return runSync();
  };

  return {
    enabled: cloudEnabled, user, status, error, lastSync, blocked,
    sync: () => runSync(true), sendCode, verify, signOut, deleteAccount, resolveBlocked,
  };
}
