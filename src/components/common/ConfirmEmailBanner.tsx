"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { describeAuthError, formatWait } from "@/lib/authErrors";

const DISMISS_KEY = "groundwork_confirm_banner_dismissed";

/**
 * Shown inside the app when someone is signed in but hasn't confirmed their
 * email yet. The point is that nobody is blocked from starting — they can do
 * Mission 1 now and confirm whenever. Only render this when the Supabase
 * project allows unconfirmed sessions; when confirmation is required there is
 * no session to render it in, and it simply never appears.
 */
export default function ConfirmEmailBanner() {
  const [email, setEmail] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      if (user.email_confirmed_at || !user.email) return;
      setEmail(user.email);
      try {
        setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
      } catch {
        setDismissed(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  async function resend() {
    if (!email || secondsLeft > 0) return;
    setStatus("sending");
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      const info = describeAuthError(error.message, "signup");
      setError(info.message);
      if (info.retryAfterSeconds) setSecondsLeft(info.retryAfterSeconds);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  }

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode */ }
  }

  if (!email || dismissed) return null;

  return (
    <div className="bg-gold/10 border-b border-gold/25">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-start gap-3 text-sm">
        <span aria-hidden="true" className="mt-0.5">✉️</span>
        <div className="flex-1 min-w-0">
          <p className="text-ink leading-snug">
            Confirm your email to keep your progress safe.{" "}
            <span className="text-ink-muted">
              Everything works in the meantime — this just means you won&apos;t lose it.
            </span>
          </p>
          {error && <p className="text-xs text-ink-muted mt-1">{error}</p>}
          <div className="flex items-center gap-4 mt-1">
            {status === "sent" ? (
              <span className="text-xs text-sage font-medium">Sent — check {email}.</span>
            ) : (
              <button
                onClick={resend}
                disabled={status === "sending" || secondsLeft > 0}
                className="text-xs font-medium text-teal hover:underline disabled:text-ink-muted/60 disabled:no-underline"
              >
                {secondsLeft > 0
                  ? `Resend in ${formatWait(secondsLeft)}`
                  : status === "sending"
                  ? "Sending…"
                  : "Resend the link"}
              </button>
            )}
            <button onClick={dismiss} className="text-xs text-ink-muted hover:text-ink">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
