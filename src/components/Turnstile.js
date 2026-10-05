"use client";
import { useEffect, useRef } from "react";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading = null;
function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SRC; s.async = true; s.defer = true;
      s.onload = () => resolve(window.turnstile);
      s.onerror = () => { loading = null; reject(new Error("captcha script failed to load")); };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/* Cloudflare Turnstile */
export default function Turnstile({ onToken, resetSignal = 0 }) {
  const box = useRef(null);
  const widget = useRef(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let dead = false;
    loadScript()
      .then((ts) => {
        if (dead || !box.current) return;
        widget.current = ts.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (t) => cb.current(t),
          "expired-callback": () => cb.current(null),
          "error-callback": () => cb.current(null),
        });
      })
      .catch(() => cb.current(null));
    return () => {
      dead = true;
      if (widget.current != null) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, []);

  useEffect(() => {
    if (widget.current != null) window.turnstile?.reset(widget.current);
  }, [resetSignal]);

  return TURNSTILE_SITE_KEY ? <div ref={box} className="min-h-[65px]" /> : null;
}
