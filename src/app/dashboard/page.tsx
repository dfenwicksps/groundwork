import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch user profile
  const { data: _profileRaw } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = _profileRaw as import("@/types/database").UserProfile | null;

  if (!profile?.onboarding_complete) {
    redirect("/onboarding");
  }

  // Fetch mission progress
  const { data: progress } = await supabase
    .from("mission_progress")
    .select("*")
    .eq("user_id", user.id);

  // Fetch active challenge
  const { data: _challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("user_id", user.id)
    .is("completed_at", null)
    .order("issued_at", { ascending: false })
    .limit(1)
    .single();
  const challenge = _challenge as import("@/types/database").Challenge | null;

  // Fetch recent journal entries (last 3, titles only)
  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select("id, mission_id, activity_id, prompt, created_at, is_milestone")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch support circle
  const { data: supportCircle } = await supabase
    .from("support_circle")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: true });

  return (
    <DashboardClient
      profile={profile}
      progress={progress || []}
      challenge={challenge || null}
      recentEntries={recentEntries || []}
      supportCircle={supportCircle || []}
    />
  );
}
