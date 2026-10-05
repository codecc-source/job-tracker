"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, RefreshCw, LogOut, Trash2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import Modal from "./Modal";
import { field, btn, btnPrimary, btnDanger, Field } from "./ui";
import { friendlyError } from "@/hooks/useCloud";

export default function AccountDialog({ cloud, onClose }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (fn, after) => {
    setBusy(true); setError("");
    try { await fn(); after?.(); } catch (e) { setError(friendlyError(e)); }
    setBusy(false);
  };

  const send = (e) => { e.preventDefault(); run(() => cloud.sendCode(email.trim()), () => setStep("code")); };
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
            <button disabled={busy} className={btnPrimary + " w-full justify-center"}><Mail size={15} />{busy ? "Sending..." : "Email me a sign-in code"}</button>
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
        <button onClick={async () => { await cloud.signOut(); toast("Signed out. Your list stays on this device."); onClose(); }} className={btn}><LogOut size={14} />Sign out</button>
      </div>

      <section className="space-y-2 rounded-xl border border-danger/30 p-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-danger"><Trash2 size={14} />Delete my account</h3>
        <p className="text-sm text-muted">Deletes your account and the copy of your list stored online. The list on this device stays until you clear it.</p>
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
