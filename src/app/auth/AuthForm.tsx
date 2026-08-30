"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { describeAuthError, formatWait } from "@/lib/authErrors";

type Mode = "login" | "signup";
type Method = "password" | "link";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [method, setMethod] = useState<Method>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set when we've sent something to the inbox and are waiting on the user.
  const [sent, setSent] = useState<null | { kind: "confirm" | "link" | "reset"; email: string }>(null);

  // Epoch ms until which a rate limit blocks retries; drives the live countdown.
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const supabase = createClient();
  const supabaseRef = useRef(supabase);

  useEffect(() => {
    supabaseRef.current.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });
  }, [router]);

  // Live countdown so the wait is visible rather than guessed at.
  useEffect(() => {
    if (retryAt === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setRetryAt(null);
        setError(null);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [retryAt]);

  function handleError(rawMessage: string, forMode: "login" | "signup" | "magic") {
    const info = describeAuthError(rawMessage, forMode);
    setError(info.message);
    if (info.retryAfterSeconds) {
      setRetryAt(Date.now() + info.retryAfterSeconds * 1000);
    }
  }

  async function routeAfterSignIn() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("users")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();
    const profile = data as { onboarding_complete: boolean } | null;
    router.push(profile?.onboarding_complete ? "/dashboard" : "/onboarding");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (secondsLeft > 0) return;
    setLoading(true);
    setError(null);

    if (method === "link") {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === "signup",
          data: mode === "signup" ? { full_name: name } : undefined,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) handleError(error.message, "magic");
      else setSent({ kind: "link", email });
    } else if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        handleError(error.message, "signup");
      } else if (data.session) {
        // Email confirmation is off — start the programme immediately and
        // nudge for confirmation later from inside the app.
        router.push("/onboarding");
        return;
      } else {
        setSent({ kind: "confirm", email });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) handleError(error.message, "login");
      else {
        await routeAfterSignIn();
        return;
      }
    }
    setLoading(false);
  }

  async function handleResend() {
    if (!sent || secondsLeft > 0) return;
    setLoading(true);
    setError(null);
    if (sent.kind === "confirm") {
      const { error } = await supabase.auth.resend({ type: "signup", email: sent.email });
      if (error) handleError(error.message, "signup");
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email: sent.email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) handleError(error.message, "magic");
    }
    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email above first, then tap this again.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) handleError(error.message, "login");
    else setSent({ kind: "reset", email });
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { handleError(error.message, mode); setLoading(false); }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setSent(null);
  }

  const blocked = secondsLeft > 0;

  const sentCopy = sent
    ? {
        confirm: {
          title: "Check your inbox",
          body: `We sent a confirmation link to ${sent.email}. Open it and you'll land straight in Mission 1 — nothing you do is lost in the meantime.`,
        },
        link: {
          title: "Link on its way",
          body: `We sent a one-tap sign-in link to ${sent.email}. No password needed — just open the email on this device.`,
        },
        reset: {
          title: "Check your inbox",
          body: `We sent a password reset link to ${sent.email}.`,
        },
      }[sent.kind]
    : null;

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-60" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-semibold">G</span>
            </div>
            <span className="font-semibold text-navy text-xl" style={{ fontFamily: "'Fraunces', serif" }}>
              Groundwork
            </span>
          </div>
          <h1 className="text-2xl text-navy mt-4" style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}>
            {mode === "login" ? "Welcome back" : "Start your journey"}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {mode === "login"
              ? "Sign in to continue where you left off."
              : "Create a free account to begin Mission 1."}
          </p>
        </div>

        <div className="card p-8">
          {sentCopy ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3" aria-hidden="true">✉️</div>
              <p className="text-sage font-medium mb-2">{sentCopy.title}</p>
              <p className="text-sm text-ink-muted">{sentCopy.body}</p>

              {error && (
                <div className="mt-4 text-sm text-ink bg-surface-muted border border-surface-border rounded-lg px-4 py-3 text-left">
                  {error}
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={loading || blocked || sent?.kind === "reset"}
                className="mt-5 text-sm text-teal hover:underline disabled:text-ink-muted/50 disabled:no-underline"
              >
                {blocked
                  ? `You can resend in ${formatWait(secondsLeft)}`
                  : loading
                  ? "Sending…"
                  : "Didn't arrive? Send it again"}
              </button>

              <button
                onClick={() => { setSent(null); setError(null); }}
                className="mt-4 btn btn-secondary w-full"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label htmlFor="auth-name" className="block text-sm font-medium text-ink mb-1.5">First name</label>
                  <input id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Your name" className="input" required autoComplete="given-name" />
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
                <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" className="input" required autoComplete="email" />
              </div>

              {method === "password" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="auth-password" className="block text-sm font-medium text-ink">Password</label>
                    {mode === "login" && (
                      <button type="button" onClick={handleForgotPassword}
                        className="text-xs text-teal hover:text-teal-dark transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
                    className="input" required minLength={mode === "signup" ? 8 : undefined}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </div>
              )}

              {error && (
                <div role="alert" className="text-sm text-ink bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  {error}
                  {blocked && (
                    <div className="mt-1 text-xs text-ink-muted">
                      Ready again in {formatWait(secondsLeft)}.
                    </div>
                  )}
                </div>
              )}

              <button type="submit" disabled={loading || blocked} className="btn btn-primary w-full mt-2 disabled:opacity-60">
                {blocked
                  ? `Try again in ${formatWait(secondsLeft)}`
                  : loading
                  ? "One moment…"
                  : method === "link"
                  ? "Email me a sign-in link"
                  : mode === "login"
                  ? "Sign in"
                  : "Create account"}
              </button>

              <button
                type="button"
                onClick={() => { setMethod(method === "link" ? "password" : "link"); setError(null); }}
                className="w-full text-center text-sm text-teal hover:underline pt-1"
              >
                {method === "link"
                  ? "Use a password instead"
                  : "Skip the password — email me a link"}
              </button>
            </form>
          )}

          {!sentCopy && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-xs text-ink-muted">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>
              <button onClick={handleGoogleSignIn} disabled={loading} className="btn btn-secondary w-full gap-3">
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        {!sentCopy && (
          <p className="text-center text-sm text-ink-muted mt-5">
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => switchMode("signup")} className="text-teal font-medium hover:underline">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => switchMode("login")} className="text-teal font-medium hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        )}

        <p className="text-center text-xs text-ink-muted/70 mt-6 leading-relaxed">
          By making an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-ink-muted">terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline hover:text-ink-muted">privacy policy</Link>.
          <br />
          Plain English, and short — we checked.
        </p>
      </div>
    </div>
  );
}
