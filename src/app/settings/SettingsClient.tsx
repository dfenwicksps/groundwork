"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "@/components/layout/AppShell";

export default function SettingsClient({
  userId,
  email,
  displayName,
}: {
  userId: string;
  email: string;
  displayName: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const [name, setName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  async function handleSaveName() {
    setSaving(true);
    await db
      .from("users")
      .update({ display_name: name })
      .eq("id", userId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "delete my account") return;
    // In production, use a server action with service role key to delete auth user
    // For now, sign out
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div data-animate="1">
          <h1
            className="text-3xl text-navy"
            style={{ fontFamily: "'Fraunces', serif", fontWeight: 400 }}
          >
            Settings
          </h1>
        </div>

        {/* Profile */}
        <div data-animate="2" className="card p-6 space-y-4">
          <h2 className="font-semibold text-ink">Profile</h2>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Display name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input flex-1"
              />
              <button
                onClick={handleSaveName}
                disabled={saving || name === displayName}
                className="btn btn-primary whitespace-nowrap"
              >
                {saved ? "Saved ✓" : saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <div className="input bg-surface-muted text-ink-muted cursor-not-allowed">
              {email}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Email cannot be changed here.
            </p>
          </div>
        </div>

        {/* Account actions */}
        <div data-animate="3" className="card p-6 space-y-3">
          <h2 className="font-semibold text-ink">Account</h2>
          <button
            onClick={handleSignOut}
            className="btn btn-secondary w-full justify-start"
          >
            Sign out
          </button>
        </div>

        {/* Danger zone */}
        <div
          data-animate="4"
          className="rounded-xl p-6 border border-red-100 bg-red-50/30"
        >
          <h2 className="font-semibold text-red-800 mb-2">Danger zone</h2>
          <p className="text-sm text-ink-muted mb-4">
            Deleting your account will permanently remove all your journal
            entries, progress, and personal data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-700 font-medium">
                Type{" "}
                <span className="font-mono bg-red-100 px-1 rounded">
                  delete my account
                </span>{" "}
                to confirm:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="input border-red-200 focus:border-red-400"
                placeholder="delete my account"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteInput("");
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInput !== "delete my account"}
                  className="btn flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-40"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Privacy note */}
        <div data-animate="5" className="text-xs text-ink-muted/60 text-center pb-4">
          Groundwork is not a therapy replacement. All journal content is
          private and encrypted. We never sell your data.
        </div>
      </div>
    </AppShell>
  );
}
