"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { type ProcessingStyle, setProcessingStyle, tallyStyle } from "@/lib/processingStyle";

const STYLE_QUESTIONS: {
  id: string;
  question: string;
  options: { label: string; style: ProcessingStyle }[];
}[] = [
  {
    id: "q1",
    question: "When you're working something out...",
    options: [
      { label: "I like to dig in and understand it from all angles", style: "informational" },
      { label: "I find it easier with clear steps or someone to guide me", style: "normative" },
      { label: "I usually need to sit with it for a while first", style: "diffuse-avoidant" },
    ],
  },
  {
    id: "q2",
    question: "Starting new things feels...",
    options: [
      { label: "Interesting — I want to know why I'm doing it", style: "informational" },
      { label: "Better with structure — I like knowing the plan", style: "normative" },
      { label: "Hard sometimes — I can struggle to get going", style: "diffuse-avoidant" },
    ],
  },
  {
    id: "q3",
    question: "Be honest — coming here today...",
    options: [
      { label: "I'm genuinely curious to understand myself better", style: "informational" },
      { label: "I'm hoping there's a clear process I can follow", style: "normative" },
      { label: "Part of me isn't sure I'm ready to start", style: "diffuse-avoidant" },
    ],
  },
];

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
  {
    label: "Courage",
    description: "Acting despite fear, not in the absence of it. Whether it's speaking up in a room that disagrees with you, trying something you might fail at, or letting someone actually see how you feel.",
  },
  {
    label: "Kindness",
    description: "Choosing warmth and generosity, especially when it costs you something. It shows up in the small moments: the text you didn't have to send, the extra patience, the willingness to put someone else first.",
  },
  {
    label: "Honesty",
    description: "Telling the truth — to others and to yourself. It's more than not lying. It's the hard feedback you give, the uncomfortable things you admit, and not pretending everything's fine when it isn't.",
  },
  {
    label: "Creativity",
    description: "Finding new ways to see, solve, and express. You don't just accept the obvious answer — you ask what else is possible, and you're willing to make something imperfect rather than make nothing at all.",
  },
  {
    label: "Growth",
    description: "The belief that where you are now isn't where you have to stay. You're drawn to discomfort, feedback, and challenge — not because they're fun, but because they're how you actually move forward.",
  },
  {
    label: "Family",
    description: "The people closest to you — by blood or by bond — are at the centre of what you care about. Their wellbeing matters deeply, and your relationships with them shape a lot of who you are.",
  },
  {
    label: "Humour",
    description: "Finding the lightness in life, even in difficult moments. You use laughter to connect, to cope, and to keep perspective — and you believe that not taking everything too seriously is a kind of wisdom.",
  },
  {
    label: "Compassion",
    description: "Feeling what others feel, and being moved to do something about it. Not sympathy from a distance — a genuine pull toward people who are struggling, and the impulse to actually help.",
  },
  {
    label: "Curiosity",
    description: "A genuine hunger to understand — people, ideas, how things work, why the world is the way it is. You ask questions not to seem smart, but because you actually want to know the answers.",
  },
  {
    label: "Resilience",
    description: "Getting back up — not because the hard thing didn't hurt, but because you don't let it define you. You bend, you feel it fully, and then you find a way through. Again and again.",
  },
  {
    label: "Fairness",
    description: "The conviction that everyone deserves to be treated with equal dignity. When you see unfairness, it bothers you — and you believe it's worth speaking up, even when it isn't your fight.",
  },
  {
    label: "Authenticity",
    description: "Showing up as yourself, not a version shaped by what others expect. It means saying what you actually think, living by what you actually believe, and refusing to perform a role that isn't yours.",
  },
];

const TOTAL_STEPS = 4;

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [whyHere, setWhyHere] = useState("");

  // Step 2
  const [styleAnswers, setStyleAnswers] = useState<Record<string, ProcessingStyle>>({});

  // Step 3
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [openValue, setOpenValue] = useState<string | null>(null);
  const [blockedValue, setBlockedValue] = useState<string | null>(null);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 4
  const [supportName, setSupportName] = useState("");
  const [supportRelationship, setSupportRelationship] = useState("");

  // Carry the name from signup so nobody types it twice — still editable, which
  // quietly makes the point that you can go by whatever you like here.
  useEffect(() => {
    const db = createClient();
    db.auth.getUser().then(({ data: { user } }) => {
      const fromSignup =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined);
      if (fromSignup) setName(fromSignup.split(" ")[0]);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (blockedTimer.current) clearTimeout(blockedTimer.current);
    };
  }, []);

  function toggleValue(val: string) {
    if (selectedValues.includes(val)) {
      setSelectedValues(selectedValues.filter((v) => v !== val));
      return;
    }
    if (selectedValues.length >= 3) {
      // Say why nothing happened, rather than leaving a dead-looking button.
      setBlockedValue(val);
      if (blockedTimer.current) clearTimeout(blockedTimer.current);
      blockedTimer.current = setTimeout(() => setBlockedValue(null), 1800);
      return;
    }
    setSelectedValues([...selectedValues, val]);
  }

  const openValueData = QUICK_VALUES.find((v) => v.label === openValue);

  async function handleFinish(skip: boolean = false) {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any;
    const { data: { user } } = await db.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Detect and persist processing style from the 3 style questions
    const votes = Object.values(styleAnswers);
    if (votes.length > 0) {
      setProcessingStyle(tallyStyle(votes));
    }

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

  const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;
  const styleAnswered = Object.keys(styleAnswers).length;

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
          <span>Getting started</span>
          <span>{step} of {TOTAL_STEPS}</span>
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

      {/* Step 1 — who you are, and why you're here */}
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
              Two questions here, then three quick ones about how you like to
              work, then values and one optional detail. Four short screens in
              total.
            </p>

            <div className="space-y-5">
              <div>
                <label htmlFor="ob-name" className="block text-sm font-medium text-ink mb-1.5">
                  What should we call you?
                </label>
                <input
                  id="ob-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  className="input"
                />
                <p className="text-xs text-ink-muted mt-1.5">
                  A nickname is fine — this is just what the app calls you.
                </p>
              </div>

              <div>
                <span className="block text-sm font-medium text-ink mb-3">
                  What brings you here?
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {WHY_OPTIONS.map((opt) => {
                    const selected = whyHere === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWhyHere(opt.value)}
                        aria-pressed={selected}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-1.5 transition-all",
                          "flex items-center gap-3",
                          selected
                            ? "border-teal bg-teal/5 ring-1 ring-teal"
                            : "border-surface-border bg-white hover:border-teal/40"
                        )}
                        style={{ borderWidth: "1.5px" }}
                      >
                        <span className="text-xl flex-shrink-0" aria-hidden="true">{opt.icon}</span>
                        <span>
                          <span className="block font-medium text-ink text-sm">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-ink-muted mt-0.5">
                            {opt.sub}
                          </span>
                        </span>
                        {/* Tick marks selection independently of colour. */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border",
                            selected
                              ? "bg-teal border-teal"
                              : "border-surface-border"
                          )}
                        >
                          {selected && (
                            <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path
                                d="M1.5 4L3 5.5L6.5 2"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
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

      {/* Step 2 — how you like to work */}
      {step === 2 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              Three quick ones.
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              These change how much guidance each activity gives you — never what
              the activities are. You can change it later in settings.
            </p>

            <div className="space-y-5">
              {STYLE_QUESTIONS.map((q) => (
                <fieldset key={q.id}>
                  <legend className="block text-sm font-medium text-ink mb-2">
                    {q.question}
                  </legend>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const selected = styleAnswers[q.id] === opt.style;
                      return (
                        <button
                          key={opt.style}
                          type="button"
                          onClick={() =>
                            setStyleAnswers((prev) => ({ ...prev, [q.id]: opt.style }))
                          }
                          aria-pressed={selected}
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm",
                            "flex items-start gap-2.5",
                            selected
                              ? "border-teal bg-teal/5 ring-1 ring-teal text-ink"
                              : "border-surface-border bg-white text-ink-muted hover:border-teal/40"
                          )}
                          style={{ borderWidth: "1.5px" }}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5",
                              selected
                                ? "bg-teal border-teal text-white"
                                : "border-surface-border text-transparent"
                            )}
                          >
                            ✓
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={styleAnswered < STYLE_QUESTIONS.length}
                className="btn btn-primary flex-[2]"
              >
                {styleAnswered < STYLE_QUESTIONS.length
                  ? `${styleAnswered} of ${STYLE_QUESTIONS.length} answered`
                  : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — values */}
      {step === 3 && (
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
              the ones you think you should have. Tap the{" "}
              <span className="font-medium">i</span> on any value to read what it
              means.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {QUICK_VALUES.map(({ label }) => {
                const selected = selectedValues.includes(label);
                const atLimit = !selected && selectedValues.length >= 3;
                const nudging = blockedValue === label;
                const expanded = openValue === label;
                return (
                  <div key={label} className="relative">
                    <button
                      type="button"
                      onClick={() => toggleValue(label)}
                      aria-pressed={selected}
                      className={cn(
                        "w-full h-full p-3 pr-6 rounded-xl text-sm font-medium transition-all border text-left",
                        nudging && "animate-nudge",
                        selected
                          ? "bg-navy text-white border-navy"
                          : atLimit
                          ? "bg-white text-ink-muted border-surface-border hover:border-navy/20"
                          : "bg-white text-ink border-surface-border hover:border-navy/30"
                      )}
                    >
                      {/* Selection is marked by a tick as well as by colour. */}
                      {selected && <span aria-hidden="true" className="mr-1">✓</span>}
                      {label}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenValue(expanded ? null : label)}
                      aria-expanded={expanded}
                      aria-label={`What ${label} means`}
                      className={cn(
                        "absolute top-1 right-1 w-[18px] h-[18px] rounded-full border",
                        "text-[11px] font-semibold leading-none",
                        "flex items-center justify-center transition-colors",
                        selected
                          ? "border-white/50 text-white/90 hover:bg-white/20"
                          : "border-ink-muted/35 text-ink-muted hover:border-navy hover:text-navy"
                      )}
                    >
                      i
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Definition / feedback area — fixed height prevents layout shift */}
            <div className="mb-4 min-h-[5.5rem] flex items-start">
              {blockedValue ? (
                <div role="status" className="w-full rounded-xl bg-gold/10 border border-gold/30 px-4 py-3 text-sm text-ink">
                  You&apos;ve got three. Tap one of them to swap it out first.
                </div>
              ) : openValueData ? (
                <div className="w-full rounded-xl bg-teal/5 border border-teal/20 px-4 py-3 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">{openValueData.label}: </span>
                  {openValueData.description}
                </div>
              ) : (
                <p className="text-xs text-ink-muted/50 px-1 pt-1">
                  Not sure what one means? Tap its <span className="font-medium">i</span>.
                </p>
              )}
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
                onClick={() => setStep(2)}
                className="btn btn-secondary flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={selectedValues.length < 3}
                className="btn btn-primary flex-[2]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4 — a trusted person */}
      {step === 4 && (
        <div className="w-full max-w-md animate-fade-up">
          <div className="card p-8">
            <h1
              className="text-2xl text-navy mb-2"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
            >
              One last thing.
            </h1>
            <p className="text-ink-muted text-sm mb-6">
              Groundwork works best alongside real people. If you have someone you could talk to when things get heavy — a parent, a coach, an older sibling, anyone — it&apos;s worth keeping them in mind.
            </p>

            <div className="bg-surface-muted rounded-xl p-4 mb-6 border border-surface-border space-y-2">
              <p className="text-sm text-ink font-medium">
                We never contact them. This stays between you and the app.
              </p>
              <p className="text-sm text-ink-muted">
                It&apos;s completely optional — just a name to think of if you
                ever need it. Add or change it any time.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="ob-support-name" className="block text-sm font-medium text-ink mb-1.5">
                  Their name{" "}
                  <span className="text-ink-muted font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="ob-support-name"
                  type="text"
                  value={supportName}
                  onChange={(e) => setSupportName(e.target.value)}
                  placeholder="e.g. Mum, Coach Ben, Mrs Thompson"
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="ob-support-rel" className="block text-sm font-medium text-ink mb-1.5">
                  Relationship{" "}
                  <span className="text-ink-muted font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  id="ob-support-rel"
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
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(3)}
                  disabled={loading}
                  className="text-sm text-ink-muted hover:text-ink transition-colors py-1"
                >
                  Back
                </button>
                <button
                  onClick={() => handleFinish(true)}
                  disabled={loading}
                  className="text-sm text-ink-muted hover:text-ink transition-colors py-1"
                >
                  Skip for now
                </button>
              </div>
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
