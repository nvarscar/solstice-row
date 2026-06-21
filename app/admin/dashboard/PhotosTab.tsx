"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Trash2,
  Upload,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Camera,
  Users,
  Repeat2,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import type { PhotoSection } from "@/lib/db-photos";

interface TeamBasic {
  id: string;
  name: string;
}

interface EventPhoto {
  id: string;
  filename: string;
  description: string;
  sort_order: number;
  created_at: string;
}

interface TeamPhoto {
  id: string;
  team_id: string;
  filename: string;
  sort_order: number;
  created_at: string;
}

interface BeforeAfterPair {
  id: string;
  team_id: string;
  team_name?: string;
  before_id: string;
  after_id: string;
  shift_minutes: number | null;
  before_taken_at: string | null;
  after_taken_at: string | null;
  created_at: string;
}

interface PhotosConfig {
  sections: Record<PhotoSection, boolean>;
  eventPhotos: EventPhoto[];
  teamPhotos: TeamPhoto[];
  beforeAfterPairs: BeforeAfterPair[];
  timezone: string;
}

interface DraftPair {
  teamId: string;
  beforeId: string | null;
  beforeExifTs: number | null;
  beforeTime: string;       // HH:MM
  afterId: string | null;
  afterExifTs: number | null;
  afterTime: string;        // HH:MM
  shiftMinutes: string;
}

function formatShift(min: number | null | undefined): string {
  if (!min || min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function SectionToggle({
  label,
  icon: Icon,
  enabled,
  onToggle,
  toggling,
}: {
  label: string;
  icon: React.ElementType;
  enabled: boolean;
  onToggle: () => void;
  toggling: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={toggling}
      className="flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
    >
      {toggling ? (
        <Loader2 className="w-5 h-5 animate-spin text-forest-400" />
      ) : enabled ? (
        <ToggleRight className="w-5 h-5 text-green-400" />
      ) : (
        <ToggleLeft className="w-5 h-5 text-forest-500" />
      )}
      <Icon className={clsx("w-4 h-4", enabled ? "text-solstice-gold" : "text-forest-500")} />
      <span className={enabled ? "text-white" : "text-forest-400"}>
        {label} — {enabled ? "Visible to public" : "Hidden from public"}
      </span>
    </button>
  );
}

function ThumbImage({ uuid }: { uuid: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/photos/${uuid}/thumb`}
      alt=""
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
}

export default function PhotosTab() {
  const [config, setConfig] = useState<PhotosConfig | null>(null);
  const [teams, setTeams] = useState<TeamBasic[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [toggling, setToggling] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<{ msg: string; type: "ok" | "err" | null }>({ msg: "", type: null });
  const [savingTz, setSavingTz] = useState(false);

  // Event upload form
  const [eventDesc, setEventDesc] = useState("");
  const [eventPreview, setEventPreview] = useState<string | null>(null);
  const eventFileRef = useRef<HTMLInputElement>(null);

  // Team upload form
  const [teamUploadId, setTeamUploadId] = useState("");
  const [teamPreview, setTeamPreview] = useState<string | null>(null);
  const teamFileRef = useRef<HTMLInputElement>(null);

  // Before/after draft
  const [draft, setDraft] = useState<DraftPair>({
    teamId: "",
    beforeId: null,
    beforeExifTs: null,
    beforeTime: "",
    afterId: null,
    afterExifTs: null,
    afterTime: "",
    shiftMinutes: "",
  });
  const beforeFileRef = useRef<HTMLInputElement>(null);
  const afterFileRef = useRef<HTMLInputElement>(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [committingPair, setCommittingPair] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [cfgRes, teamsRes] = await Promise.all([
        fetch("/api/photos/config"),
        fetch("/api/content/teams"),
      ]);
      if (cfgRes.ok) setConfig(await cfgRes.json());
      if (teamsRes.ok) {
        const data = await teamsRes.json();
        setTeams((data.teams ?? []).map((t: { id: string; name: string }) => ({ id: t.id, name: t.name })));
      }
      setLoaded(true);
    } catch {
      setStatus({ msg: "Failed to load photos data", type: "err" });
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function saveTimezone(tz: string) {
    setSavingTz(true);
    try {
      await fetch("/api/photos/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: tz }),
      });
      setConfig((prev) => prev ? { ...prev, timezone: tz } : prev);
    } catch { /* ignore */ }
    setSavingTz(false);
  }

  async function toggleSection(section: PhotoSection, current: boolean) {
    setToggling((p) => ({ ...p, [section]: true }));
    try {
      const res = await fetch("/api/photos/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, enabled: !current }),
      });
      if (res.ok) {
        setConfig((prev) =>
          prev ? { ...prev, sections: { ...prev.sections, [section]: !current } } : prev
        );
      } else {
        setStatus({ msg: "Failed to update visibility", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    setToggling((p) => ({ ...p, [section]: false }));
  }

  async function uploadEventPhoto() {
    const file = eventFileRef.current?.files?.[0];
    if (!file) return;
    setUploading((p) => ({ ...p, event: true }));
    try {
      const fd = new FormData();
      fd.append("type", "event");
      fd.append("file", file);
      fd.append("description", eventDesc);
      const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                eventPhotos: [
                  ...prev.eventPhotos,
                  {
                    id: data.id,
                    filename: data.filename,
                    description: eventDesc,
                    sort_order: prev.eventPhotos.length,
                    created_at: new Date().toISOString(),
                  },
                ],
              }
            : prev
        );
        setEventDesc("");
        setEventPreview(null);
        if (eventFileRef.current) eventFileRef.current.value = "";
        setStatus({ msg: "Photo uploaded!", type: "ok" });
        setTimeout(() => setStatus({ msg: "", type: null }), 3000);
      } else {
        setStatus({ msg: "Upload failed", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    setUploading((p) => ({ ...p, event: false }));
  }

  async function uploadTeamPhoto() {
    const file = teamFileRef.current?.files?.[0];
    if (!file || !teamUploadId) return;
    setUploading((p) => ({ ...p, team: true }));
    try {
      const fd = new FormData();
      fd.append("type", "team");
      fd.append("file", file);
      fd.append("teamId", teamUploadId);
      const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                teamPhotos: [
                  ...prev.teamPhotos,
                  {
                    id: data.id,
                    team_id: teamUploadId,
                    filename: data.filename,
                    sort_order: prev.teamPhotos.filter((p) => p.team_id === teamUploadId).length,
                    created_at: new Date().toISOString(),
                  },
                ],
              }
            : prev
        );
        setTeamPreview(null);
        if (teamFileRef.current) teamFileRef.current.value = "";
        setStatus({ msg: "Team photo uploaded!", type: "ok" });
        setTimeout(() => setStatus({ msg: "", type: null }), 3000);
      } else {
        setStatus({ msg: "Upload failed", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    setUploading((p) => ({ ...p, team: false }));
  }

  async function uploadBeforeAfterFile(role: "before" | "after") {
    const ref = role === "before" ? beforeFileRef : afterFileRef;
    const file = ref.current?.files?.[0];
    if (!file) return;
    if (role === "before") setUploadingBefore(true);
    else setUploadingAfter(true);
    try {
      const fd = new FormData();
      fd.append("type", "before_after_file");
      fd.append("file", file);
      fd.append("role", role);
      const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setDraft((prev) => {
          const next = { ...prev };
          if (role === "before") {
            next.beforeId = data.id;
            next.beforeExifTs = data.exifMinutes;
            if (data.exifTime) next.beforeTime = data.exifTime;
          } else {
            next.afterId = data.id;
            next.afterExifTs = data.exifMinutes;
            if (data.exifTime) next.afterTime = data.exifTime;
          }
          // Auto-compute shift from EXIF minutes if both are available
          const bTs = role === "before" ? data.exifMinutes : prev.beforeExifTs;
          const aTs = role === "after" ? data.exifMinutes : prev.afterExifTs;
          if (bTs != null && aTs != null) {
            const diff = Math.abs(aTs - bTs);
            if (diff > 0) next.shiftMinutes = String(diff);
          }
          return next;
        });
      } else {
        setStatus({ msg: `Failed to upload ${role} photo`, type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    if (role === "before") setUploadingBefore(false);
    else setUploadingAfter(false);
  }

  async function commitPair() {
    if (!draft.teamId || !draft.beforeId || !draft.afterId) return;
    setCommittingPair(true);
    try {
      const fd = new FormData();
      fd.append("type", "before_after_pair");
      fd.append("teamId", draft.teamId);
      fd.append("beforeId", draft.beforeId);
      fd.append("afterId", draft.afterId);
      if (draft.shiftMinutes) fd.append("shiftMinutes", draft.shiftMinutes);
      if (draft.beforeTime) fd.append("beforeTime", draft.beforeTime);
      if (draft.afterTime) fd.append("afterTime", draft.afterTime);
      const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        const teamName = teams.find((t) => t.id === draft.teamId)?.name;
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                beforeAfterPairs: [
                  ...prev.beforeAfterPairs,
                  {
                    id: data.id,
                    team_id: draft.teamId,
                    team_name: teamName,
                    before_id: draft.beforeId!,
                    after_id: draft.afterId!,
                    shift_minutes: draft.shiftMinutes ? parseInt(draft.shiftMinutes, 10) || null : null,
                    before_taken_at: draft.beforeTime || null,
                    after_taken_at: draft.afterTime || null,
                    created_at: new Date().toISOString(),
                  },
                ],
              }
            : prev
        );
        setDraft({ teamId: "", beforeId: null, beforeExifTs: null, beforeTime: "", afterId: null, afterExifTs: null, afterTime: "", shiftMinutes: "" });
        if (beforeFileRef.current) beforeFileRef.current.value = "";
        if (afterFileRef.current) afterFileRef.current.value = "";
        setStatus({ msg: "Before/after pair saved!", type: "ok" });
        setTimeout(() => setStatus({ msg: "", type: null }), 3000);
      } else {
        setStatus({ msg: "Failed to save pair", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    setCommittingPair(false);
  }

  async function deletePhoto(id: string) {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeleting((p) => ({ ...p, [id]: true }));
    try {
      const res = await fetch(`/api/photos/${id}/delete`, { method: "DELETE" });
      if (res.ok) {
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                eventPhotos: prev.eventPhotos.filter((p) => p.id !== id),
                teamPhotos: prev.teamPhotos.filter((p) => p.id !== id),
                beforeAfterPairs: prev.beforeAfterPairs.filter((p) => p.id !== id),
              }
            : prev
        );
      } else {
        setStatus({ msg: "Delete failed", type: "err" });
      }
    } catch {
      setStatus({ msg: "Network error", type: "err" });
    }
    setDeleting((p) => ({ ...p, [id]: false }));
  }

  const inputCls =
    "w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50";

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="card-glass rounded-xl p-6 text-center">
        <p className="text-red-400 text-sm">Failed to load photos config.</p>
      </div>
    );
  }

  // Group team photos by team_id for display
  const teamPhotoGroups: Record<string, TeamPhoto[]> = {};
  for (const p of config.teamPhotos) {
    if (!teamPhotoGroups[p.team_id]) teamPhotoGroups[p.team_id] = [];
    teamPhotoGroups[p.team_id].push(p);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-bold">Event Photos</h2>
        {status.msg && (
          <div
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
              status.type === "ok"
                ? "bg-green-500/20 border border-green-500/30 text-green-300"
                : "bg-red-500/20 border border-red-500/30 text-red-300"
            )}
          >
            {status.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.msg}
          </div>
        )}
      </div>

      {/* ── Event Photos ─────────────────────────────────────────────── */}
      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <SectionToggle
            label="Event Photos"
            icon={Camera}
            enabled={config.sections.event}
            onToggle={() => toggleSection("event", config.sections.event)}
            toggling={!!toggling.event}
          />
        </div>

        <div className="border-t border-white/10 pt-5 space-y-4">
          <p className="text-forest-300 text-sm font-semibold">Upload Event Photo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-forest-300 mb-1">Image file</label>
              <input
                ref={eventFileRef}
                type="file"
                accept="image/*"
                className="w-full text-sm text-forest-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs hover:file:bg-white/20 file:cursor-pointer cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setEventPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              {eventPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={eventPreview} alt="preview" className="mt-2 h-24 w-auto rounded-lg object-cover border border-white/10" />
              )}
            </div>
            <div>
              <label className="block text-xs text-forest-300 mb-1">Description</label>
              <input
                type="text"
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                placeholder="Caption for this photo…"
                className={inputCls}
              />
            </div>
          </div>
          <button
            onClick={uploadEventPhoto}
            disabled={!!uploading.event}
            className="flex items-center gap-2 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
          >
            {uploading.event ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Photo
          </button>
        </div>

        {config.eventPhotos.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-forest-400 text-xs mb-3">{config.eventPhotos.length} photo{config.eventPhotos.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {config.eventPhotos.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                  <ThumbImage uuid={photo.id} />
                  {photo.description && (
                    <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 text-white text-[10px] truncate hidden group-hover:block">
                      {photo.description}
                    </div>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    disabled={!!deleting[photo.id]}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    {deleting[photo.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Team Slideshows ───────────────────────────────────────────── */}
      <div className="card-glass rounded-2xl p-6 space-y-5">
        <SectionToggle
          label="Team Slideshows"
          icon={Users}
          enabled={config.sections.teams}
          onToggle={() => toggleSection("teams", config.sections.teams)}
          toggling={!!toggling.teams}
        />

        <div className="border-t border-white/10 pt-5 space-y-4">
          <p className="text-forest-300 text-sm font-semibold">Upload Team Photo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-forest-300 mb-1">Team</label>
              <select
                value={teamUploadId}
                onChange={(e) => setTeamUploadId(e.target.value)}
                className={inputCls}
              >
                <option value="" className="bg-forest-950">— Select team —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-forest-950">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-forest-300 mb-1">Image file</label>
              <input
                ref={teamFileRef}
                type="file"
                accept="image/*"
                className="w-full text-sm text-forest-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs hover:file:bg-white/20 file:cursor-pointer cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setTeamPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              {teamPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teamPreview} alt="preview" className="mt-2 h-24 w-auto rounded-lg object-cover border border-white/10" />
              )}
            </div>
          </div>
          <button
            onClick={uploadTeamPhoto}
            disabled={!!uploading.team || !teamUploadId}
            className="flex items-center gap-2 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
          >
            {uploading.team ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add to Slideshow
          </button>
        </div>

        {Object.keys(teamPhotoGroups).length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-4">
            {Object.entries(teamPhotoGroups).map(([teamId, photos]) => {
              const teamName = teams.find((t) => t.id === teamId)?.name ?? teamId;
              return (
                <div key={teamId}>
                  <p className="text-forest-300 text-xs font-semibold mb-2">
                    {teamName} — {photos.length} photo{photos.length !== 1 ? "s" : ""}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-white/5">
                        <ThumbImage uuid={photo.id} />
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          disabled={!!deleting[photo.id]}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          {deleting[photo.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Before & After ────────────────────────────────────────────── */}
      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionToggle
            label="Before & After"
            icon={Repeat2}
            enabled={config.sections.before_after}
            onToggle={() => toggleSection("before_after", config.sections.before_after)}
            toggling={!!toggling.before_after}
          />
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-forest-400 whitespace-nowrap">Event timezone</label>
            <select
              value={config.timezone}
              onChange={(e) => saveTimezone(e.target.value)}
              disabled={savingTz}
              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-solstice-gold/50 disabled:opacity-50"
            >
              <option value="America/Vancouver" className="bg-forest-950">America/Vancouver (PT)</option>
              <option value="America/Toronto" className="bg-forest-950">America/Toronto (ET)</option>
              <option value="America/Chicago" className="bg-forest-950">America/Chicago (CT)</option>
              <option value="America/Denver" className="bg-forest-950">America/Denver (MT)</option>
              <option value="America/New_York" className="bg-forest-950">America/New_York (ET)</option>
              <option value="America/Los_Angeles" className="bg-forest-950">America/Los_Angeles (PT)</option>
              <option value="Europe/London" className="bg-forest-950">Europe/London (GMT/BST)</option>
              <option value="Europe/Paris" className="bg-forest-950">Europe/Paris (CET)</option>
              <option value="UTC" className="bg-forest-950">UTC</option>
            </select>
            {savingTz && <Loader2 className="w-3 h-3 animate-spin text-forest-400" />}
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 space-y-4">
          <p className="text-forest-300 text-sm font-semibold">Add Before/After Pair</p>

          <div>
            <label className="block text-xs text-forest-300 mb-1">Team</label>
            <select
              value={draft.teamId}
              onChange={(e) => setDraft((p) => ({ ...p, teamId: e.target.value }))}
              className={inputCls}
            >
              <option value="" className="bg-forest-950">— Select team —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-forest-950">{t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="card-glass rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-forest-300 uppercase tracking-wide">Before Photo</p>
              <input
                ref={beforeFileRef}
                type="file"
                accept="image/*"
                className="w-full text-sm text-forest-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs hover:file:bg-white/20 file:cursor-pointer cursor-pointer"
                onChange={() => uploadBeforeAfterFile("before")}
              />
              {uploadingBefore && <Loader2 className="w-4 h-4 animate-spin text-forest-400" />}
              {draft.beforeId && !uploadingBefore && (
                <div className="aspect-square rounded-lg overflow-hidden bg-white/5 w-20">
                  <ThumbImage uuid={draft.beforeId} />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-forest-400 mb-1">
                  Time taken — {config.timezone.split("/").pop()?.replace("_", " ")}
                  {draft.beforeTime && draft.beforeExifTs !== null && <span className="ml-1 text-green-400">✓ EXIF</span>}
                </label>
                <input
                  type="time"
                  value={draft.beforeTime}
                  onChange={(e) => setDraft((p) => ({ ...p, beforeTime: e.target.value }))}
                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-solstice-gold/50"
                />
              </div>
            </div>

            {/* After */}
            <div className="card-glass rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-forest-300 uppercase tracking-wide">After Photo</p>
              <input
                ref={afterFileRef}
                type="file"
                accept="image/*"
                className="w-full text-sm text-forest-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs hover:file:bg-white/20 file:cursor-pointer cursor-pointer"
                onChange={() => uploadBeforeAfterFile("after")}
              />
              {uploadingAfter && <Loader2 className="w-4 h-4 animate-spin text-forest-400" />}
              {draft.afterId && !uploadingAfter && (
                <div className="aspect-square rounded-lg overflow-hidden bg-white/5 w-20">
                  <ThumbImage uuid={draft.afterId} />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-forest-400 mb-1">
                  Time taken — {config.timezone.split("/").pop()?.replace("_", " ")}
                  {draft.afterTime && draft.afterExifTs !== null && <span className="ml-1 text-green-400">✓ EXIF</span>}
                </label>
                <input
                  type="time"
                  value={draft.afterTime}
                  onChange={(e) => setDraft((p) => ({ ...p, afterTime: e.target.value }))}
                  className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-solstice-gold/50"
                />
              </div>
            </div>
          </div>

          {/* Shift duration */}
          <div>
            <label className="block text-xs text-forest-300 mb-1">
              Shift Duration (minutes)
              {draft.beforeExifTs !== null && draft.afterExifTs !== null && (
                <span className="ml-2 text-green-400">✓ auto-detected from EXIF</span>
              )}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={draft.shiftMinutes}
                onChange={(e) => setDraft((p) => ({ ...p, shiftMinutes: e.target.value }))}
                placeholder="e.g. 120"
                className="w-32 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-solstice-gold/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              {draft.shiftMinutes && (
                <span className="text-solstice-gold text-sm font-medium">
                  = {formatShift(parseInt(draft.shiftMinutes, 10))}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={commitPair}
            disabled={committingPair || !draft.teamId || !draft.beforeId || !draft.afterId}
            className="flex items-center gap-2 px-4 py-2 bg-solstice-gold text-forest-950 rounded-lg text-sm font-bold hover:bg-solstice-gold-light disabled:opacity-50 transition-colors"
          >
            {committingPair ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Pair
          </button>
        </div>

        {/* Existing pairs */}
        {config.beforeAfterPairs.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-forest-400 text-xs">{config.beforeAfterPairs.length} pair{config.beforeAfterPairs.length !== 1 ? "s" : ""}</p>
            {config.beforeAfterPairs.map((pair) => (
              <div key={pair.id} className="flex items-center gap-3 card-glass rounded-xl p-3">
                <div className="flex gap-2">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <ThumbImage uuid={pair.before_id} />
                  </div>
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                    <ThumbImage uuid={pair.after_id} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {pair.team_name ?? pair.team_id}
                  </p>
                  {pair.shift_minutes != null && (
                    <p className="text-forest-400 text-xs">{formatShift(pair.shift_minutes)} shift</p>
                  )}
                </div>
                <button
                  onClick={() => deletePhoto(pair.id)}
                  disabled={!!deleting[pair.id]}
                  className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting[pair.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
