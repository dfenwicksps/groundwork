"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const WHY_OPTIONS = [
  {
    value: "exploring",
    label: "Exploring myself",
    icon: "🧭",
    sub: "Curious about who I am and what I value",
  },
  {
    value: "lost",
    label: "Feeling a bit lost",
    icon: "🌊",
    sub: "Not sure where I'm headed right now",
  },
  {
    value: "direction",
    label: "Wanting more direction",
    icon: "🎯",
    sub: "I know what I want — I need help getting there",
  },
  {
    value: "curious",
    label: "Just curious",
    icon: "✨",
    sub: "Saw this and thought it looked interesting",
  },
];

const QUICK_VALUES = [
  "Courage",
  "Kindness",
  "Honesty",
  "Creativity",
  "Growth",
  "Family",
  "Humour",
  "Compassion",
  "Curiosity",
  "Resilience",
  "Fairness",
  "Authenticity",
];

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [whyHere, setWhyHere] = useState("");

  // Step 2
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Step 3
  const [supportName, setSupportName] = useState("");
  const [supportRelationship, setSupportRelationship] = useState("");

  function toggleValue(val: string) {
    if (selectedValues.includes(val)) {
      setSelectedValues(selectedValues.filter((v) => v !== val));
    } else if (selectedValues.length < 3) {
      setSelectedValues([...selectedValues, val]);
    }
  }

  async function handleFinish(skip: boolean = false) {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any;
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;

    // Update display name
    if (name) {
      await db.from("users").update({ display_name: name }).eq("id", user.id);
    }

    // Save onboarding results
    await db.from("onboarding_results").insert({
      user_id: user.id,
      why_here: whyHere,
      values: selectedValues,
    });

    // Save support circle contact if provided
    if (!skip && supportName && supportRelationship) {
      await db.from("support_circle").insert({
        user_id: user.id,
        name: supportName,
        relationship: supportRelationship,
      });
    }

    // Mark onboarding complete
    await db
      .from("users")
      .update({ onboarding_complete: true })
      .eq("id", user.id);

    router.push("/dashboard");
  }

  const progressWidth = `${(step / 3) * 100}%`;

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
          <span>Getting started</span>
          <span>{step} of 3</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: progressWidth }} />
        </div>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-semibold">G</span>
        </div>
        <span
          className="font-semibold text-navy text-lg"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Groundwork
        </span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              Let&apos;s start with you.
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Just a couple of quick things before we get into it.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-3">
                  What brings you here?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {WHY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setWhyHere(opt.value)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-1.5 transition-all",
                        "flex items-center gap-3",
                        whyHere === opt.value
                          ? "border-teal bg-teal/5 ring-1 ring-teal"
                          : "border-surface-border bg-white hover:border-teal/40"
                      )}
                      style={{ borderWidth: "1.5px" }}
                    >
                      <span className="text-xl flex-shrink-0">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-ink text-sm">
                          {opt.label}
                        </div>
                        <div className="text-xs text-ink-muted mt-0.5">
                          {opt.sub}
                        </div>
                      </div>
                      {whyHere === opt.value && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 8 8"
                            fill="none"
                          >
                            <path
                              d="M1.5 4L3 5.5L6.5 2"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!whyHere}
              className="btn btn-primary w-full mt-6"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              What matters most to you?
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Choose 3 values that feel genuinely true for you right now — not
              the ones you think you should have.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {QUICK_VALUES.map((val) => {
                const selected = selectedValues.includes(val);
                const disabled = !selected && selectedValues.length >= 3;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleValue(val)}
                    disabled={disabled}
                    className={cn(
                      "p-3 rounded-xl text-sm font-medium transition-all border",
                      selected
                        ? "bg-navy text-white border-navy"
                        : disabled
                        ? "bg-surface-muted text-ink-muted/50 border-surface-border cursor-not-allowed"
                        : "bg-white text-ink border-surface-border hover:border-navy/30"
                    )}
                  >
                    {val}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-ink-muted mb-6">
              <span>{selectedValues.length} of 3 selected</span>
              {selectedValues.length > 0 && (
                <button
                  onClick={() => setSelectedValues([])}
                  className="text-teal hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedValues.length < 3}
                className="btn btn-primary flex-[2]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              One important question.
            </h1>
            <p className="text-ink-muted text-sm mb-2">
              Groundwork is about honest reflection. Sometimes that can bring up
              hard feelings.
            </p>
            <p className="text-sm text-ink mb-6 font-medium">
              Is there a trusted adult in your life you could talk to if things
              get difficult?
            </p>

            <div className="bg-teal/5 border border-teal/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-teal-dark/80">
                This could be a parent, older sibling, teacher, coach, or
                anyone you trust. Adding their name is optional — it&apos;s
                just a reminder that real people matter more than any app.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Their name{" "}
                  <span className="text-ink-muted font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  placeholder="e.g. Mum, Coach Ben, Mrs Thompson"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  Relationship{" "}
                  <span className="text-ink-muted font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={supportRelationship}
                  onChange={(e) => setSupportRelationship(e.target.value)}
                  placeholder="e.g. Parent, Teacher, Older sibling"
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => handleFinish(false)}
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? "Setting up your account…" : "Start Mission 1"}
              </button>
              <button
                onClick={() => handleFinish(true)}
                disabled={loading}
                className="text-sm text-ink-muted hover:text-ink transition-colors text-center py-1"
              >
                Skip for now
              </button>
            </div>

            <p className="text-xs text-ink-muted/60 text-center mt-4">
              If you ever need more support, Kids Helpline is available 24/7
              on 1800 55 1800.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
