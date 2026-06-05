"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  LogOut,
  RefreshCw,
  Save,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";

interface Team {
  id: string;
  name: string;
  captain: string;
  captainEmail: string;
  captainPhone: string;
  members: number;
  boatM: number;
  ergM: number;
  club: string;
  pledgePerKm: number;
  notes: string;
  status: "pending" | "approved";
  registeredAt: string;
}

interface TeamsData {
  eventYear: string;
  eventDate: string;
  lastUpdated: string;
  teams: Team[];
}

type Tab = "leaderboard" | "teams" | "password";

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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50";
  return (
    <div>
      <label className="block text-xs text-forest-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function TeamEditCard({
  team,
  isDirty,
  isSaving,
  saveStatus,
  onSave,
  onChange,
  onApprove,
  onRevoke,
  onDelete,
}: {
  team: Team;
  isDirty: boolean;
  isSaving: boolean;
  saveStatus: "ok" | "err" | null;
  onSave: () => void;
  onChange: (field: keyof Team, value: string | number) => void;
  onApprove?: () => void;
  onRevoke?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card-glass rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={clsx(
              "text-xs px-2 py-0.5 rounded-full font-medium border",
              team.status === "pending"
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                : "bg-green-500/20 text-green-300 border-green-500/30"
            )}
          >
            {team.status === "pending" ? "Pending" : "Approved"}
          </span>
          <span className="text-forest-400 text-xs">
            Registered {new Date(team.registeredAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {onApprove && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600/80 hover:bg-green-500/80 text-white text-xs rounded-lg transition-colors"
            >
              <Check className="w-3 h-3" />
              Approve
            </button>
          )}
          {onRevoke && (
            <button
              onClick={onRevoke}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-forest-200 text-xs rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Unapprove
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex items-center gap-1 px-2 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs rounded-lg transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          {saveStatus === "ok" && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              Saved
            </span>
          )}
          {saveStatus === "err" && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle className="w-3 h-3" />
              Failed
            </span>
          )}
          {isDirty && (
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-1.5 bg-solstice-gold text-forest-950 text-xs font-bold rounded-lg hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label="Team Name"
          value={team.name}
          onChange={(v) => onChange("name", v)}
          required
        />
        <Field
          label="Club / Organization"
          value={team.club}
          onChange={(v) => onChange("club", v)}
        />
        <Field
          label="Captain Name"
          value={team.captain}
          onChange={(v) => onChange("captain", v)}
          required
        />
        <Field
          label="Captain Email"
          value={team.captainEmail}
          onChange={(v) => onChange("captainEmail", v)}
          type="email"
        />
        <Field
          label="Captain Phone"
          value={team.captainPhone}
          onChange={(v) => onChange("captainPhone", v)}
          type="tel"
        />
        <Field
          label="Number of Members"
          value={String(team.members)}
          onChange={(v) => onChange("members", parseInt(v) || 1)}
          type="number"
        />
        <Field
          label="Pledge Rate ($ / km)"
          value={String(team.pledgePerKm)}
          onChange={(v) => onChange("pledgePerKm", parseFloat(v) || 0)}
          type="number"
          placeholder="0.00"
        />
        <Field
          label="Notes"
          value={team.notes}
          onChange={(v) => onChange("notes", v)}
          placeholder="Any special notes…"
          multiline
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [teamsData, setTeamsData] = useState<TeamsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({
    msg: "",
    type: null,
  });
  const [addDelta, setAddDelta] = useState<Record<string, { boatM: string; ergM: string }>>({});
  const [metricsDraft, setMetricsDraft] = useState<Record<string, { boatM?: string; ergM?: string }>>({});
  const [sortBy, setSortBy] = useState<"name" | "distance">("name");
  const dirtyRef = useRef(new Set<string>());
  const [dirtyTeamIds, setDirtyTeamIdsState] = useState(new Set<string>());
  const [savingTeamIds, setSavingTeamIds] = useState(new Set<string>());
  const [teamSaveStatus, setTeamSaveStatus] = useState<Record<string, "ok" | "err">>({});

  function markDirty(id: string) {
    dirtyRef.current = new Set(dirtyRef.current).add(id);
    setDirtyTeamIdsState(new Set(dirtyRef.current));
    setStatus({ msg: "", type: null });
  }
  function clearDirty(id: string) {
    const next = new Set(dirtyRef.current);
    next.delete(id);
    dirtyRef.current = next;
    setDirtyTeamIdsState(new Set(next));
  }
  function clearAllDirty() {
    dirtyRef.current = new Set();
    setDirtyTeamIdsState(new Set());
  }

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({
    msg: "",
    type: null,
  });

  const loadTeams = useCallback(async () => {
    if (dirtyRef.current.size > 0) {
      if (!confirm(`You have unsaved changes on ${dirtyRef.current.size} team(s). Reload and lose them?`)) return;
    }
    try {
      const res = await fetch("/api/content/teams");
      if (res.status === 401) { router.push("/admin/login"); return; }
      setTeamsData(await res.json());
      clearAllDirty();
    } catch {
      setStatus({ msg: "Failed to load teams data", type: "err" });
    }
  }, [router]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  useEffect(() => { setStatus({ msg: "", type: null }); }, [tab]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current.size > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function updateMeters(id: string, field: "boatM" | "ergM", raw: string) {
    setMetricsDraft((prev) => ({ ...prev, [id]: { ...prev[id], [field]: raw } }));
  }

  function commitMeters(id: string, field: "boatM" | "ergM") {
    if (!teamsData) return;
    const raw = metricsDraft[id]?.[field];
    if (raw === undefined) return;
    const val = parseFloat(raw);
    const committed = isNaN(val) ? 0 : Math.max(0, val);
    setTeamsData({
      ...teamsData,
      teams: teamsData.teams.map((t) =>
        t.id === id ? { ...t, [field]: committed } : t
      ),
    });
    setMetricsDraft((prev) => { const next = { ...prev }; if (next[id]) delete next[id][field]; return next; });
    markDirty(id);
  }

  function addMeters(id: string, field: "boatM" | "ergM") {
    if (!teamsData) return;
    const delta = parseFloat(addDelta[id]?.[field] || "0") || 0;
    if (!delta) return;
    setTeamsData({
      ...teamsData,
      teams: teamsData.teams.map((t) =>
        t.id === id ? { ...t, [field]: Math.max(0, t[field] + delta) } : t
      ),
    });
    setAddDelta((prev) => ({ ...prev, [id]: { ...prev[id], [field]: "" } }));
    markDirty(id);
  }

  function updateTeamField(id: string, field: keyof Team, value: string | number) {
    if (!teamsData) return;
    setTeamsData({
      ...teamsData,
      teams: teamsData.teams.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
    markDirty(id);
  }

  async function approveTeam(id: string) {
    try {
      const res = await fetch(`/api/content/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (res.ok) {
        setTeamsData((prev) =>
          prev ? { ...prev, teams: prev.teams.map((t) => t.id === id ? { ...t, status: "approved" as const } : t) } : prev
        );
      } else {
        setStatus({ msg: "Failed to approve team", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
  }

  async function pendingTeam(id: string) {
    try {
      const res = await fetch(`/api/content/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      if (res.ok) {
        setTeamsData((prev) =>
          prev ? { ...prev, teams: prev.teams.map((t) => t.id === id ? { ...t, status: "pending" as const } : t) } : prev
        );
      } else {
        setStatus({ msg: "Failed to unapprove team", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
  }

  async function deleteTeam(id: string) {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/content/teams/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeamsData((prev) =>
          prev ? { ...prev, teams: prev.teams.filter((t) => t.id !== id) } : prev
        );
        clearDirty(id);
      } else {
        setStatus({ msg: "Failed to delete team", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error deleting team", type: "err" });
    }
  }

  async function saveTeam(id: string) {
    if (!teamsData) return;
    const team = teamsData.teams.find((t) => t.id === id);
    if (!team) return;
    setSavingTeamIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/content/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(team),
      });
      if (res.ok) {
        clearDirty(id);
        setTeamSaveStatus((prev) => ({ ...prev, [id]: "ok" }));
        setTimeout(() => setTeamSaveStatus((prev) => { const next = { ...prev }; delete next[id]; return next; }), 2000);
      } else {
        setTeamSaveStatus((prev) => ({ ...prev, [id]: "err" }));
      }
    } catch {
      setTeamSaveStatus((prev) => ({ ...prev, [id]: "err" }));
    }
    setSavingTeamIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  async function saveAllDirty() {
    if (dirtyRef.current.size === 0) return;
    setSaving(true);
    setStatus({ msg: "", type: null });
    await Promise.all(Array.from(dirtyRef.current).map((id) => saveTeam(id)));
    setSaving(false);
    if (dirtyRef.current.size === 0) setStatus({ msg: "All changes saved!", type: "ok" });
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

  const approvedTeams = teamsData
    ? [...teamsData.teams]
        .filter((t) => t.status === "approved")
        .sort((a, b) =>
          sortBy === "distance"
            ? b.boatM + b.ergM - (a.boatM + a.ergM)
            : a.name.localeCompare(b.name)
        )
    : [];
  const pendingTeams = teamsData
    ? teamsData.teams.filter((t) => t.status === "pending")
    : [];

  const SaveBtn = ({ label }: { label: string }) => dirtyTeamIds.size > 0 ? (
    <button
      onClick={saveAllDirty}
      disabled={saving}
      className="flex items-center gap-1.5 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  ) : null;

  const ReloadBtn = () => (
    <button
      onClick={loadTeams}
      className="flex items-center gap-1.5 px-3 py-2 card-glass rounded-lg text-forest-200 text-sm hover:bg-white/10 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      Reload
    </button>
  );

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
        <div className="flex gap-2 mb-8 flex-wrap">
          {(
            [
              { id: "leaderboard", label: "Leaderboard", icon: Trophy },
              {
                id: "teams",
                label: `Teams${pendingTeams.length ? ` (${pendingTeams.length})` : ""}`,
                icon: ClipboardList,
              },
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

        {/* ── Leaderboard Tab ── */}
        {tab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-white text-xl font-bold">Live Leaderboard</h2>
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
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-forest-400 text-xs">Sort:</span>
                  <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                    {(["name", "distance"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSortBy(s)}
                        className={clsx(
                          "px-3 py-1 rounded text-xs font-medium transition-colors",
                          sortBy === s
                            ? "bg-white/15 text-white"
                            : "text-forest-400 hover:text-forest-200"
                        )}
                      >
                        {s === "name" ? "A\u2013Z" : "Distance"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <ReloadBtn />
                  <SaveBtn label="Save &amp; Publish" />
                </div>
              </div>
            </div>

            {status.msg && <StatusBadge msg={status.msg} type={status.type} />}

            {!teamsData ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
              </div>
            ) : approvedTeams.length === 0 ? (
              <div className="card-glass rounded-2xl p-12 text-center">
                <p className="text-forest-300">
                  No approved teams yet. Approve teams in the{" "}
                  <button onClick={() => setTab("teams")} className="text-solstice-gold underline">
                    Teams tab
                  </button>
                  .
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedTeams.map((team, rank) => {
                  const total = team.boatM + team.ergM;
                  return (
                    <div key={team.id} className="card-glass rounded-2xl p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-solstice-gold/20 border border-solstice-gold/30">
                          {rank === 0 ? (
                            <Trophy className="w-4 h-4 text-solstice-gold" />
                          ) : (
                            <span className="text-solstice-gold font-bold text-sm">{rank + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h3 className="text-white font-bold">{team.name}</h3>
                            <span className="text-forest-400 text-xs">{team.club}</span>
                          </div>
                          <p className="text-forest-300 text-sm">
                            {team.captain} · {team.members} members
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-solstice-gold font-bold text-lg">
                            {total.toLocaleString()} m
                          </p>
                          <p className="text-forest-400 text-xs">total</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {(
                          [
                            { field: "boatM", label: "🚣 Boat (m)" },
                            { field: "ergM", label: "⚙️ Erg (m)" },
                          ] as const
                        ).map(({ field, label }) => (
                          <div key={field}>
                            <label className="block text-xs text-forest-300 mb-1">{label}</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={metricsDraft[team.id]?.[field] !== undefined ? metricsDraft[team.id][field] : team[field]}
                              onChange={(e) => updateMeters(team.id, field, e.target.value)}
                              onBlur={() => commitMeters(team.id, field)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-solstice-gold/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <div className="flex gap-1.5 mt-1.5">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="add meters…"
                                value={addDelta[team.id]?.[field] ?? ""}
                                onChange={(e) =>
                                  setAddDelta((prev) => ({
                                    ...prev,
                                    [team.id]: { ...prev[team.id], [field]: e.target.value },
                                  }))
                                }
                                onKeyDown={(e) => { if (e.key === "Enter") addMeters(team.id, field); }}
                                className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-solstice-gold/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                onClick={() => addMeters(team.id, field)}
                                className="px-2.5 py-1.5 bg-white/10 hover:bg-solstice-gold/20 hover:text-solstice-gold text-forest-200 text-xs rounded-lg transition-colors whitespace-nowrap font-medium"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-forest-400">
                        <span>
                          Pledge rate:{" "}
                          <span className="text-forest-200">${team.pledgePerKm.toFixed(2)}/km</span>
                        </span>
                        <span>
                          Est. raised:{" "}
                          <span className="text-solstice-gold font-medium">
                            ${((total / 1000) * team.pledgePerKm).toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-forest-500 text-xs text-center">
              Edit values directly or type in &quot;+ Add&quot; to increment. Press Enter or click &quot;+ Add&quot; to apply.
            </p>
          </div>
        )}

        {/* ── Teams Tab ── */}
        {tab === "teams" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-bold">Team Registrations</h2>
              <div className="flex gap-2">
                <ReloadBtn />
                <SaveBtn label="Save Changes" />
              </div>
            </div>

            {status.msg && <StatusBadge msg={status.msg} type={status.type} />}

            {!teamsData ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-forest-300 text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                    Pending Review
                    {pendingTeams.length > 0 && (
                      <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full">
                        {pendingTeams.length}
                      </span>
                    )}
                  </h3>
                  {pendingTeams.length === 0 ? (
                    <div className="card-glass rounded-xl p-6 text-center">
                      <p className="text-forest-400 text-sm">No pending registrations.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingTeams.map((team) => (
                        <TeamEditCard
                          key={team.id}
                          team={team}
                          isDirty={dirtyTeamIds.has(team.id)}
                          isSaving={savingTeamIds.has(team.id)}
                          saveStatus={teamSaveStatus[team.id] ?? null}
                          onSave={() => saveTeam(team.id)}
                          onChange={(field, value) => updateTeamField(team.id, field, value)}
                          onApprove={() => approveTeam(team.id)}
                          onDelete={() => deleteTeam(team.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-forest-300 text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                    Approved Teams
                    <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs px-2 py-0.5 rounded-full">
                      {approvedTeams.length}
                    </span>
                  </h3>
                  {approvedTeams.length === 0 ? (
                    <div className="card-glass rounded-xl p-6 text-center">
                      <p className="text-forest-400 text-sm">No approved teams yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {approvedTeams.map((team) => (
                        <TeamEditCard
                          key={team.id}
                          team={team}
                          isDirty={dirtyTeamIds.has(team.id)}
                          isSaving={savingTeamIds.has(team.id)}
                          saveStatus={teamSaveStatus[team.id] ?? null}
                          onSave={() => saveTeam(team.id)}
                          onChange={(field, value) => updateTeamField(team.id, field, value)}
                          onRevoke={() => pendingTeam(team.id)}
                          onDelete={() => deleteTeam(team.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Password Tab ── */}
        {tab === "password" && (
          <div className="max-w-md">
            <h2 className="text-white text-xl font-bold mb-6">Change Password</h2>
            <form onSubmit={handleChangePassword} className="card-glass rounded-2xl p-6 space-y-4">
              {(
                [
                  { name: "currentPassword", label: "Current Password", placeholder: "Enter current password" },
                  { name: "newPassword", label: "New Password", placeholder: "Min. 8 characters" },
                  { name: "confirmPassword", label: "Confirm New Password", placeholder: "Repeat new password" },
                ] as const
              ).map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-forest-200 mb-1.5">{label}</label>
                  <input
                    type="password"
                    value={pwForm[name]}
                    onChange={(e) => setPwForm({ ...pwForm, [name]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-solstice-gold/50 focus:border-solstice-gold/50 transition-all"
                  />
                </div>
              ))}

              {pwStatus.msg && <StatusBadge msg={pwStatus.msg} type={pwStatus.type} />}

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
