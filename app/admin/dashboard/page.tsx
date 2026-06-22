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
  Calendar,
  Plus,
  Star,
  ChevronDown,
  Camera,
  Settings,
} from "lucide-react";
import clsx from "clsx";
import { TIER_COLORS } from "@/lib/sponsor-colors";
import PhotosTab from "./PhotosTab";

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

interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  category: string;
}

interface Sponsor {
  name: string;
  url: string;
  logo: string;
}

interface SponsorTier {
  name: string;
  color: string;
  sponsors: Sponsor[];
}

type Tab = "leaderboard" | "teams" | "schedule" | "sponsors" | "photos" | "settings" | "password";

interface EventConfig {
  siteUrl: string;
  name: string;
  tagline: string;
  edition: string;
  date: string;
  sunriseTime: string;
  sunsetTime: string;
  location: string;
  venue: string;
  address: string;
  description: string;
  heroSubtitle: string;
  cause: string;
  donationUrl: string;
  registrationOpen: boolean;
  registrationDeadline: string;
  contactEmail: string;
  contactPhone: string;
  prizes: string[];
  amenities: string[];
  format: string;
}

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
  onBlur,
  type = "text",
  required,
  placeholder,
  multiline,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
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
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
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
  const [membersDraft, setMembersDraft] = useState<string | null>(null);
  const [pledgeDraft, setPledgeDraft] = useState<string | null>(null);
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
          value={membersDraft ?? String(team.members)}
          onChange={(v) => setMembersDraft(v)}
          onBlur={() => { if (membersDraft !== null) { onChange("members", parseInt(membersDraft) || 1); setMembersDraft(null); } }}
          type="number"
        />
        <Field
          label="Pledge Rate ($ / km)"
          value={pledgeDraft ?? String(team.pledgePerKm)}
          onChange={(v) => setPledgeDraft(v)}
          onBlur={() => { if (pledgeDraft !== null) { onChange("pledgePerKm", parseFloat(pledgeDraft) || 0); setPledgeDraft(null); } }}
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

function TierColorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  const selected = TIER_COLORS.find((c) => c.id === value) ?? TIER_COLORS[1];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/15 transition-colors"
      >
        <span className={clsx("w-3.5 h-3.5 rounded-sm flex-shrink-0", selected.swatch)} />
        <span>{selected.label}</span>
        <ChevronDown className={clsx("w-3.5 h-3.5 text-forest-400 ml-0.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 card-glass border border-white/20 rounded-lg overflow-hidden shadow-xl py-1 min-w-[120px]">
          {TIER_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id); setOpen(false); }}
              className={clsx(
                "w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors",
                value === c.id
                  ? "bg-white/15 text-white"
                  : "text-forest-200 hover:bg-white/10"
              )}
            >
              <span className={clsx("w-3.5 h-3.5 rounded-sm flex-shrink-0", c.swatch)} />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SponsorCard({
  sponsor,
  onChange,
  onDelete,
}: {
  sponsor: Sponsor;
  onChange: (field: keyof Sponsor, value: string) => void;
  onDelete: () => void;
}) {
  const inputCls =
    "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50";
  return (
    <div className="card-glass rounded-xl p-3">
      <div className="flex gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-xs text-forest-300 mb-1">
              Name<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={sponsor.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="Sponsor name"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-forest-300 mb-1">URL</label>
            <input
              type="url"
              value={sponsor.url}
              onChange={(e) => onChange("url", e.target.value)}
              placeholder="https://"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-forest-300 mb-1">Logo URL</label>
            <input
              type="url"
              value={sponsor.logo}
              onChange={(e) => onChange("logo", e.target.value)}
              placeholder="https://… (optional)"
              className={inputCls}
            />
          </div>
        </div>
        <div className="flex-shrink-0 pt-5">
          <button
            onClick={onDelete}
            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const SCHEDULE_CATEGORIES = ["row", "milestone", "logistics", "social", "race"] as const;

function ScheduleItemCard({
  item,
  onChange,
  onDelete,
}: {
  item: ScheduleItem;
  onChange: (field: keyof ScheduleItem, value: string) => void;
  onDelete: () => void;
}) {
  const inputCls =
    "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50";
  return (
    <div className="card-glass rounded-2xl p-4">
      <div className="flex gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-forest-300 mb-1">
              Time<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={item.time}
              onChange={(e) => onChange("time", e.target.value)}
              placeholder="e.g. 5:00 AM"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs text-forest-300 mb-1">Category</label>
            <select
              value={item.category}
              onChange={(e) => onChange("category", e.target.value)}
              className={inputCls}
            >
              {SCHEDULE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-forest-950 text-white capitalize">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-forest-300 mb-1">
              Title<span className="text-red-400 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onChange("title", e.target.value)}
              placeholder="Event title"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-forest-300 mb-1">Description</label>
            <textarea
              value={item.description}
              onChange={(e) => onChange("description", e.target.value)}
              placeholder="Event description"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
        <div className="flex-shrink-0 pt-5">
          <button
            onClick={onDelete}
            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
  const anyDirtyRef = useRef(false);
  const [dirtyTeamIds, setDirtyTeamIdsState] = useState(new Set<string>());
  const [savingTeamIds, setSavingTeamIds] = useState(new Set<string>());
  const [teamSaveStatus, setTeamSaveStatus] = useState<Record<string, "ok" | "err">>({});

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleDirty, setScheduleDirty] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({ msg: "", type: null });

  const [sponsorTiers, setSponsorTiers] = useState<SponsorTier[]>([]);
  const [sponsorsLoaded, setSponsorsLoaded] = useState(false);
  const [sponsorsSaving, setSponsorsSaving] = useState(false);
  const [sponsorsDirty, setSponsorsDirty] = useState(false);
  const [sponsorsStatus, setSponsorsStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({ msg: "", type: null });

  const [eventDraft, setEventDraft] = useState<EventConfig | null>(null);
  const [eventLoaded, setEventLoaded] = useState(false);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventDirty, setEventDirty] = useState(false);
  const [eventStatus, setEventStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({ msg: "", type: null });

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

  function handleTabChange(newTab: Tab) {
    if (newTab === tab) return;
    const dirty: string[] = [];
    if (dirtyTeamIds.size > 0) dirty.push(`${dirtyTeamIds.size} team${dirtyTeamIds.size > 1 ? "s" : ""}`);
    if (scheduleDirty) dirty.push("schedule");
    if (sponsorsDirty) dirty.push("sponsors");
    if (eventDirty) dirty.push("event settings");
    if (dirty.length > 0) {
      const joined =
        dirty.length === 1
          ? dirty[0]
          : `${dirty.slice(0, -1).join(", ")} and ${dirty[dirty.length - 1]}`;
      if (!confirm(`You have unsaved changes to ${joined}. Switch tabs and discard these changes?`)) return;
      if (dirtyTeamIds.size > 0) { clearAllDirty(); setMetricsDraft({}); setAddDelta({}); }
      if (scheduleDirty) { setScheduleDirty(false); setScheduleLoaded(false); }
      if (sponsorsDirty) { setSponsorsDirty(false); setSponsorsLoaded(false); }
      if (eventDirty) { setEventDirty(false); setEventLoaded(false); }
    }
    setTab(newTab);
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
      setMetricsDraft({});
      setAddDelta({});
    } catch {
      setStatus({ msg: "Failed to load teams data", type: "err" });
    }
  }, [router]);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/content/schedule");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setScheduleItems(data.items ?? []);
      setScheduleLoaded(true);
      setScheduleDirty(false);
    } catch {
      setScheduleStatus({ msg: "Failed to load schedule", type: "err" });
    }
  }, [router]);

  const loadSponsors = useCallback(async () => {
    try {
      const res = await fetch("/api/content/sponsors");
      if (res.status === 401) { router.push("/admin/login"); return; }
      const data = await res.json();
      setSponsorTiers(data.tiers ?? []);
      setSponsorsLoaded(true);
      setSponsorsDirty(false);
    } catch {
      setSponsorsStatus({ msg: "Failed to load sponsors", type: "err" });
    }
  }, [router]);

  const loadEventConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/content/event");
      if (res.status === 401) { router.push("/admin/login"); return; }
      setEventDraft(await res.json());
      setEventLoaded(true);
      setEventDirty(false);
    } catch {
      setEventStatus({ msg: "Failed to load event settings", type: "err" });
    }
  }, [router]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  useEffect(() => {
    if (tab === "schedule" && !scheduleLoaded) loadSchedule();
  }, [tab, scheduleLoaded, loadSchedule]);

  useEffect(() => {
    if (tab === "sponsors" && !sponsorsLoaded) loadSponsors();
  }, [tab, sponsorsLoaded, loadSponsors]);

  useEffect(() => {
    if (tab === "settings" && !eventLoaded) loadEventConfig();
  }, [tab, eventLoaded, loadEventConfig]);

  useEffect(() => { setStatus({ msg: "", type: null }); }, [tab]);

  useEffect(() => {
    anyDirtyRef.current = dirtyTeamIds.size > 0 || scheduleDirty || sponsorsDirty || eventDirty;
  }, [dirtyTeamIds, scheduleDirty, sponsorsDirty, eventDirty]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (anyDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function updateMeters(id: string, field: "boatM" | "ergM", raw: string) {
    setMetricsDraft((prev) => ({ ...prev, [id]: { ...prev[id], [field]: raw } }));
    markDirty(id);
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
    const draft = metricsDraft[id];
    const effectiveTeam = draft
      ? {
          ...team,
          boatM: draft.boatM !== undefined ? Math.max(0, parseFloat(draft.boatM) || 0) : team.boatM,
          ergM: draft.ergM !== undefined ? Math.max(0, parseFloat(draft.ergM) || 0) : team.ergM,
        }
      : team;
    setSavingTeamIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/content/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(effectiveTeam),
      });
      if (res.ok) {
        setTeamsData((prev) =>
          prev ? { ...prev, teams: prev.teams.map((t) => (t.id === id ? effectiveTeam : t)) } : prev
        );
        setMetricsDraft((prev) => { const next = { ...prev }; delete next[id]; return next; });
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

  function updateEventDraft<K extends keyof EventConfig>(field: K, value: EventConfig[K]) {
    setEventDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    setEventDirty(true);
    setEventStatus({ msg: "", type: null });
  }

  async function toggleRegistration() {
    if (!eventDraft) return;
    const next = { ...eventDraft, registrationOpen: !eventDraft.registrationOpen };
    setEventDraft(next);
    setEventSaving(true);
    setEventStatus({ msg: "", type: null });
    try {
      const res = await fetch("/api/content/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setEventDirty(false);
        setEventStatus({
          msg: next.registrationOpen ? "Registration opened!" : "Registration closed.",
          type: "ok",
        });
        setTimeout(() => setEventStatus({ msg: "", type: null }), 3000);
      } else {
        setEventStatus({ msg: "Failed to save setting", type: "err" });
      }
    } catch {
      setEventStatus({ msg: "Network error", type: "err" });
    }
    setEventSaving(false);
  }

  async function saveEventDraft() {
    if (!eventDraft) return;
    const cleaned = {
      ...eventDraft,
      prizes: eventDraft.prizes.filter((s) => s.trim() !== ""),
      amenities: eventDraft.amenities.filter((s) => s.trim() !== ""),
    };
    setEventSaving(true);
    setEventStatus({ msg: "", type: null });
    try {
      const res = await fetch("/api/content/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleaned),
      });
      if (res.ok) {
        setEventDraft(cleaned);
        setEventDirty(false);
        setEventStatus({ msg: "Event settings saved!", type: "ok" });
        setTimeout(() => setEventStatus({ msg: "", type: null }), 3000);
      } else {
        setEventStatus({ msg: "Failed to save event settings", type: "err" });
      }
    } catch {
      setEventStatus({ msg: "Network error", type: "err" });
    }
    setEventSaving(false);
  }

  async function handleSaveSponsors() {
    setSponsorsSaving(true);
    setSponsorsStatus({ msg: "", type: null });
    try {
      const res = await fetch("/api/content/sponsors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers: sponsorTiers }),
      });
      if (!res.ok) {
        setSponsorsStatus({ msg: "Failed to save sponsors", type: "err" });
      } else {
        const data = await res.json();
        setSponsorTiers(data.tiers ?? sponsorTiers);
        setSponsorsDirty(false);
        setSponsorsStatus({ msg: "Sponsors saved!", type: "ok" });
        setTimeout(() => setSponsorsStatus({ msg: "", type: null }), 3000);
      }
    } catch {
      setSponsorsStatus({ msg: "Network error", type: "err" });
    }
    setSponsorsSaving(false);
  }

  async function saveSchedule() {
    setScheduleSaving(true);
    setScheduleStatus({ msg: "", type: null });
    try {
      const res = await fetch("/api/content/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: scheduleItems }),
      });
      if (!res.ok) {
        setScheduleStatus({ msg: "Failed to save schedule", type: "err" });
      } else {
        const data = await res.json();
        setScheduleItems(data.items ?? scheduleItems);
        setScheduleDirty(false);
        setScheduleStatus({ msg: "Schedule saved and sorted by time!", type: "ok" });
        setTimeout(() => setScheduleStatus({ msg: "", type: null }), 3000);
      }
    } catch {
      setScheduleStatus({ msg: "Network error", type: "err" });
    }
    setScheduleSaving(false);
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
              { id: "schedule", label: "Schedule", icon: Calendar },
              { id: "sponsors", label: "Sponsors", icon: Star },
              { id: "photos", label: "Photos", icon: Camera },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "password", label: "Change Password", icon: Key },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
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
                  <button onClick={() => handleTabChange("teams")} className="text-solstice-gold underline">
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
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={metricsDraft[team.id]?.[field] !== undefined ? metricsDraft[team.id][field] : String(team[field])}
                              onChange={(e) => updateMeters(team.id, field, e.target.value)}
                              onBlur={() => commitMeters(team.id, field)}
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-solstice-gold/50"
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

        {/* ── Schedule Tab ── */}
        {tab === "schedule" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-white text-xl font-bold">Event Schedule</h2>
                <p className="text-forest-400 text-xs mt-0.5">
                  {scheduleItems.length} event{scheduleItems.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (scheduleDirty && !confirm("You have unsaved schedule changes. Reload and discard them?")) return;
                    setScheduleLoaded(false); loadSchedule();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 card-glass rounded-lg text-forest-200 text-sm hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
                {scheduleDirty && (
                  <button
                    onClick={saveSchedule}
                    disabled={scheduleSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
                  >
                    {scheduleSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Timeline
                  </button>
                )}
              </div>
            </div>

            {scheduleStatus.msg && <StatusBadge msg={scheduleStatus.msg} type={scheduleStatus.type} />}

            {!scheduleLoaded ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {scheduleItems.map((item, i) => (
                    <ScheduleItemCard
                      key={i}
                      item={item}
                      onChange={(field, value) => {
                        const next = [...scheduleItems];
                        next[i] = { ...next[i], [field]: value };
                        setScheduleItems(next);
                        setScheduleDirty(true);
                      }}
                      onDelete={() => {
                        setScheduleItems(scheduleItems.filter((_, idx) => idx !== i));
                        setScheduleDirty(true);
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setScheduleItems([
                      ...scheduleItems,
                      { time: "", title: "", description: "", category: "row" },
                    ]);
                    setScheduleDirty(true);
                  }}
                  className="w-full py-3 card-glass rounded-xl border border-dashed border-white/20 text-forest-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>

                <p className="text-forest-500 text-xs text-center">
                  Events are automatically sorted by start time when saved.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Sponsors Tab ── */}
        {tab === "sponsors" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-white text-xl font-bold">Sponsors</h2>
                <p className="text-forest-400 text-xs mt-0.5">
                  {sponsorTiers.reduce((n, t) => n + t.sponsors.length, 0)} sponsor
                  {sponsorTiers.reduce((n, t) => n + t.sponsors.length, 0) !== 1 ? "s" : ""} across{" "}
                  {sponsorTiers.length} tier{sponsorTiers.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (sponsorsDirty && !confirm("You have unsaved sponsor changes. Reload and discard them?")) return;
                    setSponsorsLoaded(false); loadSponsors();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 card-glass rounded-lg text-forest-200 text-sm hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
                {sponsorsDirty && (
                  <button
                    onClick={handleSaveSponsors}
                    disabled={sponsorsSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
                  >
                    {sponsorsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Sponsors
                  </button>
                )}
              </div>
            </div>

            {sponsorsStatus.msg && <StatusBadge msg={sponsorsStatus.msg} type={sponsorsStatus.type} />}

            {!sponsorsLoaded ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {sponsorTiers.map((tier, ti) => (
                    <div key={ti} className="space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => {
                            const next = [...sponsorTiers];
                            next[ti] = { ...next[ti], name: e.target.value };
                            setSponsorTiers(next);
                            setSponsorsDirty(true);
                          }}
                          placeholder="Tier name (e.g. Gold)"
                          className="flex-1 min-w-[140px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm font-semibold placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50"
                        />
                        <TierColorSelect
                          value={tier.color}
                          onChange={(id) => {
                            const next = [...sponsorTiers];
                            next[ti] = { ...next[ti], color: id };
                            setSponsorTiers(next);
                            setSponsorsDirty(true);
                          }}
                        />
                        <span className="text-forest-400 text-xs whitespace-nowrap">
                          {tier.sponsors.length} sponsor{tier.sponsors.length !== 1 ? "s" : ""}
                        </span>
                        <button
                          onClick={() => {
                            setSponsorTiers(sponsorTiers.filter((_, i) => i !== ti));
                            setSponsorsDirty(true);
                          }}
                          className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 pl-2">
                        {tier.sponsors.map((sponsor, si) => (
                          <SponsorCard
                            key={si}
                            sponsor={sponsor}
                            onChange={(field, value) => {
                              const next = [...sponsorTiers];
                              const newSponsors = [...next[ti].sponsors];
                              newSponsors[si] = { ...newSponsors[si], [field]: value };
                              next[ti] = { ...next[ti], sponsors: newSponsors };
                              setSponsorTiers(next);
                              setSponsorsDirty(true);
                            }}
                            onDelete={() => {
                              const next = [...sponsorTiers];
                              next[ti] = {
                                ...next[ti],
                                sponsors: next[ti].sponsors.filter((_, i) => i !== si),
                              };
                              setSponsorTiers(next);
                              setSponsorsDirty(true);
                            }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const next = [...sponsorTiers];
                          next[ti] = {
                            ...next[ti],
                            sponsors: [...next[ti].sponsors, { name: "", url: "", logo: "" }],
                          };
                          setSponsorTiers(next);
                          setSponsorsDirty(true);
                        }}
                        className="w-full py-2 card-glass rounded-xl border border-dashed border-white/20 text-forest-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Sponsor to {tier.name || "Tier"}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setSponsorTiers([...sponsorTiers, { name: "", color: "silver", sponsors: [] }]);
                    setSponsorsDirty(true);
                  }}
                  className="w-full py-3 card-glass rounded-xl border border-dashed border-white/20 text-forest-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Tier
                </button>

                <p className="text-forest-500 text-xs text-center">
                  Tiers and sponsors appear in the order listed here.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── Photos Tab ── */}
        {tab === "photos" && <PhotosTab />}

        {/* ── Settings Tab ── */}
        {tab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-white text-xl font-bold">Event Settings</h2>
                <p className="text-forest-400 text-xs mt-0.5">Registration, event details, and content</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (eventDirty && !confirm("You have unsaved event settings changes. Reload and discard them?")) return;
                    setEventLoaded(false); loadEventConfig();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 card-glass rounded-lg text-forest-200 text-sm hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload
                </button>
                {eventDirty && (
                  <button
                    onClick={saveEventDraft}
                    disabled={eventSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
                  >
                    {eventSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {eventStatus.msg && <StatusBadge msg={eventStatus.msg} type={eventStatus.type} />}

            {!eventLoaded ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
              </div>
            ) : eventDraft && (
              <div className="space-y-6">

                {/* Registration */}
                <div className="card-glass rounded-2xl p-6 space-y-4">
                  <h3 className="text-forest-300 text-xs font-semibold uppercase tracking-wide">Registration</h3>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold text-sm">Accept Registrations</p>
                      <p className="text-forest-400 text-xs mt-0.5">
                        {eventDraft.registrationOpen
                          ? "Open — register button visible on site"
                          : "Closed — register button hidden from site"}
                      </p>
                    </div>
                    <button
                      onClick={toggleRegistration}
                      disabled={eventSaving}
                      aria-label="Toggle registration"
                      className={clsx(
                        "relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none disabled:opacity-50",
                        eventDraft.registrationOpen
                          ? "bg-green-500 border-green-500"
                          : "bg-white/20 border-white/20"
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                          eventDraft.registrationOpen ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                  <Field
                    label="Registration Deadline"
                    value={eventDraft.registrationDeadline}
                    onChange={(v) => updateEventDraft("registrationDeadline", v)}
                    placeholder="e.g. June 18, 2026"
                  />
                </div>

                {/* Event Info */}
                <div className="card-glass rounded-2xl p-6 space-y-4">
                  <h3 className="text-forest-300 text-xs font-semibold uppercase tracking-wide">Event Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Event Name" value={eventDraft.name} onChange={(v) => updateEventDraft("name", v)} required />
                    <Field label="Edition / Year" value={eventDraft.edition} onChange={(v) => updateEventDraft("edition", v)} />
                    <Field label="Tagline" value={eventDraft.tagline} onChange={(v) => updateEventDraft("tagline", v)} />
                    <Field label="Date" value={eventDraft.date} onChange={(v) => updateEventDraft("date", v)} placeholder="e.g. June 21, 2026" />
                    <Field label="Sunrise Time" value={eventDraft.sunriseTime} onChange={(v) => updateEventDraft("sunriseTime", v)} placeholder="e.g. 5:11 AM" />
                    <Field label="Sunset Time" value={eventDraft.sunsetTime} onChange={(v) => updateEventDraft("sunsetTime", v)} placeholder="e.g. 9:18 PM" />
                    <Field label="Venue" value={eventDraft.venue} onChange={(v) => updateEventDraft("venue", v)} />
                    <Field label="Location" value={eventDraft.location} onChange={(v) => updateEventDraft("location", v)} />
                    <div className="sm:col-span-2">
                      <Field label="Address" value={eventDraft.address} onChange={(v) => updateEventDraft("address", v)} />
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Hero Subtitle" value={eventDraft.heroSubtitle} onChange={(v) => updateEventDraft("heroSubtitle", v)} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="card-glass rounded-2xl p-6 space-y-4">
                  <h3 className="text-forest-300 text-xs font-semibold uppercase tracking-wide">Content</h3>
                  <Field label="Description" value={eventDraft.description} onChange={(v) => updateEventDraft("description", v)} multiline rows={4} />
                  <Field label="Cause" value={eventDraft.cause} onChange={(v) => updateEventDraft("cause", v)} />
                  <Field label="Format / Rules" value={eventDraft.format} onChange={(v) => updateEventDraft("format", v)} multiline rows={4} />
                </div>

                {/* Links & Contact */}
                <div className="card-glass rounded-2xl p-6 space-y-4">
                  <h3 className="text-forest-300 text-xs font-semibold uppercase tracking-wide">Links &amp; Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Donation URL" value={eventDraft.donationUrl} onChange={(v) => updateEventDraft("donationUrl", v)} type="url" placeholder="https://" />
                    <Field label="Site URL" value={eventDraft.siteUrl} onChange={(v) => updateEventDraft("siteUrl", v)} type="url" placeholder="https://" />
                    <Field label="Contact Email" value={eventDraft.contactEmail} onChange={(v) => updateEventDraft("contactEmail", v)} type="email" />
                    <Field label="Contact Phone" value={eventDraft.contactPhone} onChange={(v) => updateEventDraft("contactPhone", v)} type="tel" />
                  </div>
                </div>

                {/* Awards & Amenities */}
                <div className="card-glass rounded-2xl p-6 space-y-4">
                  <h3 className="text-forest-300 text-xs font-semibold uppercase tracking-wide">Awards &amp; Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-forest-300 mb-1">Prizes (one per line)</label>
                      <textarea
                        value={eventDraft.prizes.join("\n")}
                        onChange={(e) => updateEventDraft("prizes", e.target.value.split("\n"))}
                        rows={4}
                        placeholder={"Best Team Name\nMost Kilometers\nMost Money Raised"}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-forest-300 mb-1">Amenities (one per line)</label>
                      <textarea
                        value={eventDraft.amenities.join("\n")}
                        onChange={(e) => updateEventDraft("amenities", e.target.value.split("\n"))}
                        rows={4}
                        placeholder={"Hourly Raffles\n50/50 Draw\nMusic"}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-forest-500 text-xs text-center">
                  The registration toggle saves immediately. All other changes require clicking Save Changes.
                </p>
              </div>
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
