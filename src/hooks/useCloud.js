"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, cloudEnabled } from "@/lib/supabase";
import { syncApplications } from "@/lib/sync";

export function friendlyError(e) {
  const m = (e?.message || "").toLowerCase();
  if (m.includes("rate limit") || m.includes("too many")) return "Too many emails were sent. Please wait a few minutes and try again.";
  if (m.includes("expired") || m.includes("invalid")) return "That code didn't work. Check it, or ask for a new one.";
  if (m.includes("fetch") || m.includes("network")) return "No internet connection. Your changes are safe on this device and will sync later.";
  return e?.message || "Something went wrong. Please try again.";
}

export function useCloud({ rows, ready, applyRemote }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const busy = useRef(false);
  const again = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const sync = useCallback(async () => {
    if (!supabase || !user) return;
    if (busy.current) { again.current = true; return; }
    busy.current = true;
    setStatus("syncing");
    setError("");
    try {
      const res = await syncApplications(supabase, user.id, rowsRef.current);
      await applyRemote(res.merged);
      setLastSync(new Date());
      setStatus("ok");
    } catch (e) {
      setStatus("error");
      setError(friendlyError(e));
    } finally {
      busy.current = false;
      if (again.current) { again.current = false; sync(); }
    }
  }, [user, applyRemote]);

  useEffect(() => {
    if (!user || !ready) return;
    const t = setTimeout(sync, 2000);
    return () => clearTimeout(t);
  }, [rows, user, ready, sync]);

  useEffect(() => {
    if (!user) return;
    const onShow = () => document.visibilityState === "visible" && sync();
    document.addEventListener("visibilitychange", onShow);
    window.addEventListener("online", sync);
    return () => {
      document.removeEventListener("visibilitychange", onShow);
      window.removeEventListener("online", sync);
    };
  }, [user, sync]);

  const sendCode = async (email) => {
    const { error: e } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (e) throw e;
  };

  const verify = async (email, token) => {
    const { error: e } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (e) throw e;
  };

  const signOut = () => supabase.auth.signOut({ scope: "local" });

  const deleteAccount = async () => {
    const { error: e } = await supabase.rpc("delete_my_account");
    if (e) throw e;
    await supabase.auth.signOut({ scope: "local" });
  };

  return { enabled: cloudEnabled, user, status, error, lastSync, sync, sendCode, verify, signOut, deleteAccount };
}
