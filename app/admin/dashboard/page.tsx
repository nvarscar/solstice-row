"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  LogOut,
  RefreshCw,
  Save,
  Key,
  ChevronUp,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import clsx from "clsx";

interface Team {
  id: string;
  name: string;
  captain: string;
  members: number;
  boatKm: number;
  ergKm: number;
  club: string;
  pledgePerKm: number;
}

interface TeamsData {
  eventYear: string;
  eventDate: string;
  lastUpdated: string;
  teams: Team[];
}

type Tab = "teams" | "password";

function StatusBadge({ msg, type }: { msg: string; type: "ok" | "err" | null }) {
  if (!msg) return null;
  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm",
        type === "ok"
          ? "bg-green-500/20 border border-green-500/30 text-green-300"
          : "bg-red-500/20 border border-red-500/30 text-red-300"
      )}
    >
      {type === "ok" ? (
        <CheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {msg}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("teams");
  const [teamsData, setTeamsData] = useState<TeamsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({
    msg: "",
    type: null,
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<{
    msg: string;
    type: "ok" | "err" | null;
  }>({ msg: "", type: null });

  const loadTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/content/teams");
      if (res.status === 401) { router.push("/admin/login"); return; }
      setTeamsData(await res.json());
    } catch {
      setStatus({ msg: "Failed to load teams data", type: "err" });
    }
  }, [router]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  function updateKm(id: string, field: "boatKm" | "ergKm", raw: string) {
    if (!teamsData) return;
    const val = parseFloat(raw) || 0;
    setTeamsData({
      ...teamsData,
      teams: teamsData.teams.map((t) =>
        t.id === id ? { ...t, [field]: Math.max(0, val) } : t
      ),
    });
  }

  function nudgeKm(id: string, field: "boatKm" | "ergKm", delta: number) {
    if (!teamsData) return;
    setTeamsData({
      ...teamsData,
      teams: teamsData.teams.map((t) =>
        t.id === id
          ? { ...t, [field]: Math.max(0, parseFloat((t[field] + delta).toFixed(2))) }
          : t
      ),
    });
  }

  async function saveTeams() {
    if (!teamsData) return;
    setSaving(true);
    setStatus({ msg: "", type: null });
    try {
      const payload = {
        ...teamsData,
        lastUpdated: new Date().toISOString(),
      };
      const res = await fetch("/api/content/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setTeamsData(payload);
        setStatus({ msg: "Saved — leaderboard updated!", type: "ok" });
      } else {
        const d = await res.json();
        setStatus({ msg: d.error || "Save failed", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    setSaving(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwStatus({ msg: "New passwords do not match", type: "err" });
      return;
    }
    setPwSaving(true);
    setPwStatus({ msg: "", type: null });
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ msg: "Password changed successfully!", type: "ok" });
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPwStatus({ msg: data.error || "Failed to change password", type: "err" });
      }
    } catch {
      setPwStatus({ msg: "Network error", type: "err" });
    }
    setPwSaving(false);
  }

  const sorted = teamsData
    ? [...teamsData.teams].sort(
        (a, b) => b.boatKm + b.ergKm - (a.boatKm + a.ergKm)
      )
    : [];

  return (
    <div className="min-h-screen admin-bg">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🚣</span>
            <div>
              <h1 className="text-white font-bold leading-tight">Solstice Row Admin</h1>
              <p className="text-forest-400 text-xs">Victoria City Rowing Club</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-forest-300 text-sm hover:text-white transition-colors hidden sm:block"
            >
              View Site →
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-forest-200 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(
            [
              { id: "teams", label: "Team Leaderboard", icon: Users },
              { id: "password", label: "Change Password", icon: Key },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                tab === id
                  ? "bg-solstice-gold text-forest-950"
                  : "card-glass text-forest-200 hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Teams Tab ── */}
        {tab === "teams" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">Live Km Leaderboard</h2>
                {teamsData && (
                  <p className="text-forest-400 text-xs mt-0.5">
                    Last saved:{" "}
                    {new Date(teamsData.lastUpdated).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadTeams}
                  className="flex items-center gap-1.5 px-3 py-2 card-glass rounded-lg text-forest-200 text-sm hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
                <button
                  onClick={saveTeams}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save &amp; Publish
                </button>
              </div>
            </div>

            {status.msg && (
              <StatusBadge msg={status.msg} type={status.type} />
            )}

            {!teamsData ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {sorted.map((team, rank) => {
                  const total = team.boatKm + team.ergKm;
                  return (
                    <div key={team.id} className="card-glass rounded-2xl p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-solstice-gold/20 border border-solstice-gold/30">
                          {rank === 0 ? (
                            <Trophy className="w-4 h-4 text-solstice-gold" />
                          ) : (
                            <span className="text-solstice-gold font-bold text-sm">
                              {rank + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h3 className="text-white font-bold">{team.name}</h3>
                            <span className="text-forest-400 text-xs">{team.club}</span>
                          </div>
                          <p className="text-forest-300 text-sm">
                            Captain: {team.captain} · {team.members} members
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-solstice-gold font-bold text-lg">
                            {total.toFixed(2)} km
                          </p>
                          <p className="text-forest-400 text-xs">total</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {(
                          [
                            { field: "boatKm", label: "🚣 Boat (km)" },
                            { field: "ergKm", label: "⚙️ Erg (km)" },
                          ] as const
                        ).map(({ field, label }) => (
                          <div key={field}>
                            <label className="block text-xs text-forest-300 mb-1">
                              {label}
                            </label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => nudgeKm(team.id, field, -0.5)}
                                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label={`Decrease ${field}`}
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={team[field]}
                                onChange={(e) =>
                                  updateKm(team.id, field, e.target.value)
                                }
                                className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-1 focus:ring-solstice-gold/50"
                              />
                              <button
                                onClick={() => nudgeKm(team.id, field, 0.5)}
                                className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                                aria-label={`Increase ${field}`}
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-forest-400">
                        <span>
                          Pledge rate:{" "}
                          <span className="text-forest-200">
                            ${team.pledgePerKm.toFixed(2)}/km
                          </span>
                        </span>
                        <span>
                          Est. raised:{" "}
                          <span className="text-solstice-gold font-medium">
                            ${(total * team.pledgePerKm).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-forest-500 text-xs text-center">
              Tip: Click &quot;Save &amp; Publish&quot; to update the live leaderboard on the
              website. The page reloads automatically in the browser.
            </p>
          </div>
        )}

        {/* ── Password Tab ── */}
        {tab === "password" && (
          <div className="max-w-md">
            <h2 className="text-white text-xl font-bold mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="card-glass rounded-2xl p-6 space-y-4">
              {(
                [
                  {
                    name: "currentPassword",
                    label: "Current Password",
                    placeholder: "Enter current password",
                  },
                  {
                    name: "newPassword",
                    label: "New Password",
                    placeholder: "Min. 8 characters",
                  },
                  {
                    name: "confirmPassword",
                    label: "Confirm New Password",
                    placeholder: "Repeat new password",
                  },
                ] as const
              ).map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-forest-200 mb-1.5">
                    {label}
                  </label>
                  <input
                    type="password"
                    value={pwForm[name]}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, [name]: e.target.value })
                    }
                    placeholder={placeholder}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all"
                  />
                </div>
              ))}

              {pwStatus.msg && (
                <StatusBadge msg={pwStatus.msg} type={pwStatus.type} />
              )}

              <button
                type="submit"
                disabled={pwSaving}
                className="w-full py-3 bg-solstice-gold text-forest-950 font-bold rounded-lg hover:bg-solstice-gold-light disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {pwSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Password
              </button>
            </form>
            <p className="text-forest-500 text-xs mt-3">
              Password is stored in the Docker persistent volume
              (<code className="text-forest-300">solstice_data:/data/auth/</code>).
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
