"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, RefreshCw, LogOut, Trash2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import Modal from "./Modal";
import { field, btn, btnPrimary, btnDanger, Field } from "./ui";
import { friendlyError } from "@/hooks/useCloud";
import Turnstile, { TURNSTILE_SITE_KEY } from "./Turnstile";

const SEND_COOLDOWN_S = 60;
let lastSentAt = 0;
const secondsLeft = () => Math.max(0, Math.ceil((lastSentAt + SEND_COOLDOWN_S * 1000 - Date.now()) / 1000));

export default function AccountDialog({ cloud, onClose }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [hp, setHp] = useState(""); // honeypot
  const [token, setToken] = useState(null);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [left, setLeft] = useState(secondsLeft);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(secondsLeft()), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const run = async (fn, after) => {
    setBusy(true); setError("");
    try { await fn(); after?.(); } catch (e) { setError(friendlyError(e)); }
    setBusy(false);
  };

  const send = (e) => {
    e.preventDefault();
    if (hp) { setStep("code"); return; } // bot filled the honeypot
    if (left > 0) return;
    run(
      async () => {
        try { await cloud.sendCode(email.trim(), token); }
        finally { setToken(null); setCaptchaReset((n) => n + 1); } // single-use token
      },
      () => { lastSentAt = Date.now(); setLeft(secondsLeft()); setStep("code"); }
    );
  };
  const verify = (e) => { e.preventDefault(); run(() => cloud.verify(email.trim(), code.trim()), () => { toast.success("You're signed in"); onClose(); }); };

  const statusText = {
    idle: "Not synced yet",
    syncing: "Syncing...",
    ok: cloud.lastSync ? `All synced at ${format(cloud.lastSync, "h:mm a")}` : "All synced",
    error: cloud.error || "Sync problem",
  }[cloud.status];

  if (!cloud.user) {
    return (
      <Modal title="Sync across devices" onClose={onClose}>
        <p className="text-sm text-muted">
          Sign in to see the same list on your phone and laptop, and to keep a safe copy online. It's free and optional. The app works without an account.
        </p>
        {step === "email" ? (
          <form onSubmit={send} className="space-y-3">
            <Field label="Your email">
              <input type="email" required autoFocus className={field} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <input
              type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              value={hp} onChange={(e) => setHp(e.target.value)}
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            <Turnstile onToken={setToken} resetSignal={captchaReset} />
            <button disabled={busy || left > 0 || (!!TURNSTILE_SITE_KEY && !token)} className={btnPrimary + " w-full justify-center"}>
              <Mail size={15} />{busy ? "Sending..." : left > 0 ? `Wait ${left}s to send again` : "Email me a sign-in code"}
            </button>
            <p className="text-xs text-muted">No password needed. We'll email you a short code.</p>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-3">
            <p className="rounded-lg bg-accent/10 p-3 text-sm">We sent a code to <b>{email}</b>. Type it below to sign in. Check your spam folder if you don't see it.</p>
            <Field label="Code from the email">
              <input inputMode="numeric" autoComplete="one-time-code" autoFocus className={field} value={code} onChange={(e) => setCode(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button disabled={busy || !code.trim()} className={btnPrimary}>{busy ? "Checking..." : "Sign in"}</button>
              <button type="button" className={btn} onClick={() => { setStep("email"); setCode(""); setError(""); }}>Use a different email</button>
            </div>
          </form>
        )}
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        <p className="flex gap-2 text-xs text-muted"><ShieldCheck size={14} className="mt-0.5 shrink-0" />Your jobs are stored securely online and only your account can read them.</p>
      </Modal>
    );
  }

  return (
    <Modal title="Your account" onClose={onClose}>
      <div className="rounded-xl border border-line p-3 text-sm">
        <p className="font-medium">{cloud.user.email}</p>
        <p className={cloud.status === "error" ? "text-danger" : "text-muted"}>{statusText}</p>
      </div>
      <p className="text-sm text-muted">Your list syncs automatically. It also syncs when you come back to this page.</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={cloud.sync} className={btn}><RefreshCw size={14} className={cloud.status === "syncing" ? "animate-spin" : ""} />Sync now</button>
        <button disabled={busy} onClick={() => setConfirmSignOut(true)} className={btn}><LogOut size={14} />Sign out</button>
      </div>

      {confirmSignOut && (
        <div className="space-y-2 rounded-xl border border-danger/30 p-3" role="alertdialog">
          <p className="text-sm font-semibold text-danger">Sign out and clear this device?</p>
          <p className="text-sm text-muted">Your job list will be removed from this browser when you sign out. It stays safe in your account, and signing back in restores it. Any recent changes are synced first. If that can't be done, you'll stay signed in.</p>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run(() => cloud.signOut(), () => { toast("Signed out. Your list is saved to your account and was removed from this device."); onClose(); })} className={btnDanger}>Yes, sign out</button>
            <button disabled={busy} onClick={() => setConfirmSignOut(false)} className={btn}>Cancel</button>
          </div>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
        </div>
      )}

      <section className="space-y-2 rounded-xl border border-danger/30 p-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-danger"><Trash2 size={14} />Delete my account</h3>
        <p className="text-sm text-muted">Deletes your account, the copy of your list stored online, and the list on this device.</p>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className={btnDanger}>Delete my account</button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run(() => cloud.deleteAccount(), () => { toast("Account deleted"); onClose(); })} className={btnDanger}>Yes, delete it</button>
            <button onClick={() => setConfirmDelete(false)} className={btn}>Cancel</button>
          </div>
        )}
        {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      </section>
    </Modal>
  );
}