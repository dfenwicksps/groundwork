"use client";

import Link from "next/link";
import { MISSIONS } from "@/lib/missions";
import { formatRelativeDate, truncate } from "@/lib/utils";
import type {
  UserProfile,
  MissionProgress,
  Challenge,
  JournalEntry,
  SupportContact,
} from "@/types/database";
import AppShell from "@/components/layout/AppShell";

interface Props {
  profile: UserProfile;
  progress: MissionProgress[];
  challenge: Challenge | null;
  recentEntries: Partial<JournalEntry>[];
  supportCircle: SupportContact[];
}

function getMissionProgress(
  missionId: number,
  progress: MissionProgress[]
): number {
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return 0;
  const totalActivities = mission.activities.filter((a) => !a.locked).length;
  const completed = progress.filter(
    (p) => p.mission_id === missionId
  ).length;
  return Math.round((completed / totalActivities) * 100);
}

const MISSION_ACTIVITY_LABELS: Record<string, string> = {
  "strengths-mapping": "Strengths Mapping",
  "values-clarifier": "Values Clarifier",
  "mask-check": "The Mask Check",
  "identity-letter": "Identity Letter",
  "weekly-challenge": "Weekly Challenge",
  "what-matters": "What Matters",
  belonging: "Where You Belong",
  "future-self": "Future Self",
};

export default function DashboardClient({
  profile,
  progress,
  challenge,
  recentEntries,
  supportCircle,
}: Props) {
  const firstName = profile.display_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeMission = MISSIONS.find((m) => m.id === profile.active_mission) || MISSIONS[0];
  const activeMissionProgress = getMissionProgress(profile.active_mission, progress);

  const totalCompleted = progress.length;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div data-animate="1">
          <p className="text-sm text-ink-muted mb-1">{greeting}</p>
          <h1
            className="text-3xl text-navy"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            {firstName}.
          </h1>
        </div>

        {/* Active Mission Card */}
        <div data-animate="2">
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden"
            style={{ background: activeMission.colour }}
          >
            {/* Background decoration */}
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
              style={{
                background: "white",
                transform: "translate(30%, -30%)",
              }}
            />
            <div
              className="absolute bottom-0 right-8 w-24 h-24 rounded-full opacity-10"
              style={{
                background: "white",
                transform: "translate(0, 40%)",
              }}
            />

            <div className="relative">
              <div className="text-xs font-medium opacity-70 mb-1">
                {activeMission.subtitle} — Active
              </div>
              <h2
                className="text-2xl mb-1"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 400,
                  fontStyle: "italic",
                }}
              >
                {activeMission.question}
              </h2>

              <div className="mt-4 mb-2">
                <div className="flex items-center justify-between text-xs mb-1.5 opacity-80">
                  <span>Progress</span>
                  <span>{activeMissionProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${activeMissionProgress}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/missions/${profile.active_mission}`}
                className="inline-flex items-center gap-2 mt-4 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
              >
                Continue mission
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Active Challenge */}
        {challenge && (
          <div data-animate="3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
              This week&apos;s challenge
            </h2>
            <div className="card p-5 border-l-4" style={{ borderLeftColor: "#C8982A" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink mb-1">
                    {challenge.challenge_text}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Started {formatRelativeDate(challenge.issued_at)}
                  </p>
                </div>
                <Link
                  href={`/missions/${challenge.mission_id}/activities/weekly-challenge`}
                  className="flex-shrink-0 bg-gold/10 text-gold hover:bg-gold/20 transition-colors px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  Check in
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mission Map */}
        <div data-animate="3">
          <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Mission map
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MISSIONS.map((mission) => {
              const mProgress = getMissionProgress(mission.id, progress);
              const isActive = mission.id === profile.active_mission;
              const isLocked = mission.id > profile.active_mission;

              return (
                <Link
                  key={mission.id}
                  href={`/missions/${mission.id}`}
                  className={`card p-4 transition-all hover:shadow-card group ${
                    isLocked ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
                      style={{ background: mission.colour }}
                    >
                      {mission.id}
                    </div>
                    {isActive && (
                      <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                    {mProgress === 100 && (
                      <span className="text-xs font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">
                        Done ✓
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-ink-muted">🔒</span>
                    )}
                  </div>
                  <div
                    className="text-sm font-semibold text-navy mb-0.5"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {mission.title}
                  </div>
                  <div className="text-xs text-ink-muted/70 mb-0.5">
                    {mission.phaseLabel}
                  </div>
                  <div className="text-xs text-ink-muted mb-3 line-clamp-1" style={{ fontStyle: "italic" }}>
                    {mission.question}
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${mProgress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Reflections */}
        {recentEntries.length > 0 && (
          <div data-animate="4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Recent reflections
              </h2>
              <Link
                href="/journal"
                className="text-xs text-teal hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/journal`}
                  className="card p-4 flex items-center justify-between group hover:shadow-card transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background:
                          MISSIONS.find((m) => m.id === entry.mission_id)
                            ?.colour || "#1B3A5C",
                      }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">
                        {entry.activity_id
                          ? MISSION_ACTIVITY_LABELS[entry.activity_id] ||
                            entry.activity_id
                          : "Reflection"}
                        {entry.is_milestone && (
                          <span className="ml-2 text-xs text-gold bg-gold/10 px-1.5 py-0.5 rounded">
                            ★ Milestone
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {entry.created_at
                          ? formatRelativeDate(entry.created_at)
                          : ""}
                      </div>
                    </div>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-ink-muted/40 group-hover:text-ink-muted flex-shrink-0 ml-3 transition-colors"
                  >
                    <path
                      d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Support Circle Widget */}
        <div data-animate="5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Your support circle
            </h2>
            <Link href="/support" className="text-xs text-teal hover:underline">
              Manage
            </Link>
          </div>

          {supportCircle.length > 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-muted mb-3">
                The people in your corner:
              </p>
              <div className="flex flex-wrap gap-2">
                {supportCircle.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-2 bg-surface-muted rounded-lg px-3 py-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-navy/10 flex items-center justify-center text-xs font-semibold text-navy">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {contact.name}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {contact.relationship}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-4 leading-relaxed">
                If things ever feel too hard, reach out to one of these people.
                Real conversations matter more than anything on this app.
              </p>
            </div>
          ) : (
            <Link href="/support" className="card p-5 block hover:shadow-card transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal/10 flex items-center justify-center text-lg flex-shrink-0">
                  🤝
                </div>
                <div>
                  <p className="text-sm font-medium text-ink mb-1">
                    Add a trusted person
                  </p>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Groundwork works best alongside real relationships. Add
                    someone you could talk to if things get hard.
                  </p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Stats row */}
        {totalCompleted > 0 && (
          <div data-animate="6" className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Activities done",
                value: totalCompleted,
                color: "#1B3A5C",
              },
              {
                label: "Missions started",
                value: MISSIONS.filter((m) =>
                  progress.some((p) => p.mission_id === m.id)
                ).length,
                color: "#2E7D8C",
              },
              {
                label: "Days active",
                value: Math.max(
                  1,
                  Math.ceil(
                    (new Date().getTime() -
                      new Date(profile.created_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                ),
                color: "#4A7C59",
              },
            ].map((stat) => (
              <div key={stat.label} className="card p-4 text-center">
                <div
                  className="text-2xl font-semibold mb-1"
                  style={{
                    fontFamily: "'Fraunces', serif",
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-ink-muted leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
