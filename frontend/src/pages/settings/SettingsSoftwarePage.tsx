import { useEffect, useMemo, useState } from "react";
import {
  Cpu,
  Save,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  Shield,
  FlaskConical
} from "lucide-react";
import { api } from "../../api/http";

type SoftwareSettingsDto = {
  id: number;
  currentVersion: string;
  updateChannel: string;
  autoUpdateEnabled: boolean;
  updateCheckIntervalHours: number;
  lastUpdateCheckAt: string;
  allowBetaFeatures: boolean;
  diagnosticsShareEnabled: boolean;
  rebootRequired: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function Toggle({
  value,
  onChange,
  label,
  desc,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        {desc && <div className="text-xs text-white/60">{desc}</div>}
      </div>

      <button
        onClick={() => onChange(!value)}
        className={[
          "relative h-8 w-14 rounded-full border transition",
          value ? "border-blue-500/40 bg-blue-600/30" : "border-white/10 bg-white/5",
        ].join(" ")}
        aria-label={`${label} Toggle`}
      >
        <span
          className={[
            "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white transition",
            value ? "left-7" : "left-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

export default function SettingsSoftwarePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [data, setData] = useState<SoftwareSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<SoftwareSettingsDto>("/api/settings/software");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          let text = "Failed to load software settings.";
          if (e instanceof Error && e.message.includes("404")) {
            text = "SoftwareSettings record not found. Is there a row in the database?";
          }
          setMsg({ type: "error", text });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setPartial = (patch: Partial<SoftwareSettingsDto>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: SoftwareSettingsDto = {
        ...data,
        updateChannel: data.updateChannel === "Beta" ? "Beta" : "Stable",
        updateCheckIntervalHours: clamp(Number(data.updateCheckIntervalHours), 1, 168),
        currentVersion: (data.currentVersion ?? "").toString().trim(),
      };

      const updated = await api<SoftwareSettingsDto>("/api/settings/software", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(updated);

      setMsg({ type: "success", text: "Software settings saved." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Save failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setSaving(false);
    }
  };

  const handleCheckNow = async () => {
    if (!data) return;

    try {
      setChecking(true);
      setMsg(null);

      const payload: SoftwareSettingsDto = {
        ...data,
        lastUpdateCheckAt: new Date().toISOString(),
      };

      const updated = await api<SoftwareSettingsDto>("/api/settings/software", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(updated);

      setMsg({ type: "success", text: "Update check completed." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Check failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setChecking(false);
    }
  };

  const lastCheckLabel = useMemo(() => {
    if (!data?.lastUpdateCheckAt) return "-";
    const d = new Date(data.lastUpdateCheckAt);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("en-US");
  }, [data?.lastUpdateCheckAt]);

  const chip = (active: boolean) =>
    [
      "rounded-xl px-4 py-3 text-sm font-semibold transition",
      active
        ? "bg-blue-600/30 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
    ].join(" ");

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white/80">
        Loading...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-white">Software Settings</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
          {msg?.text ?? "No data."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/20 text-blue-300">
            <Cpu size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Software Settings</h1>
            <div className="text-sm text-white/60">
              Update channel, automatic updates, and diagnostics permissions.
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className={[
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
            saving ? "bg-white/10 text-white/60" : "bg-blue-600 text-white hover:bg-blue-500",
          ].join(" ")}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {msg && (
        <div
          className={[
            "flex items-start gap-2 rounded-xl border p-3 text-sm",
            msg.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-200"
              : "border-red-500/30 bg-red-500/10 text-red-200",
          ].join(" ")}
        >
          {msg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="text-sm font-semibold text-white/80">Version & Channel</div>

          <div className="rounded-xl bg-white/5 p-4">
            <label className="mb-2 block text-xs text-white/60">Current Version</label>
            <input
              type="text"
              value={data.currentVersion}
              onChange={(e) => setPartial({ currentVersion: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-blue-500/40"
              placeholder="e.g., v1.2.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              className={chip(data.updateChannel === "Stable")}
              onClick={() => setPartial({ updateChannel: "Stable" })}
            >
              <span className="inline-flex items-center gap-2">
                <Shield size={16} /> Stable
              </span>
            </button>
            <button
              className={chip(data.updateChannel === "Beta")}
              onClick={() => setPartial({ updateChannel: "Beta" })}
            >
              <span className="inline-flex items-center gap-2">
                <FlaskConical size={16} /> Beta
              </span>
            </button>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <label className="mb-2 block text-xs text-white/60">
              Check Interval (hours):{" "}
              <span className="font-semibold text-white/80">{data.updateCheckIntervalHours}</span>
            </label>
            <input
              type="range"
              min={1}
              max={168}
              step={1}
              value={data.updateCheckIntervalHours}
              onChange={(e) => setPartial({ updateCheckIntervalHours: Number(e.target.value) })}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
            />
            <div className="mt-2 flex justify-between text-xs text-white/50">
              <span>1</span>
              <span>168</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="text-sm font-semibold text-white/80">Updates & Privacy</div>

          <Toggle
            value={data.autoUpdateEnabled}
            onChange={(v) => setPartial({ autoUpdateEnabled: v })}
            label="Auto Update"
            desc="New versions can be downloaded automatically."
          />

          <Toggle
            value={data.allowBetaFeatures}
            onChange={(v) => setPartial({ allowBetaFeatures: v })}
            label="Beta Features"
            desc="Enables experimental features."
          />

          <Toggle
            value={data.diagnosticsShareEnabled}
            onChange={(v) => setPartial({ diagnosticsShareEnabled: v })}
            label="Diagnostics Sharing"
            desc="Permission to share error/telemetry data."
          />

          <Toggle
            value={data.rebootRequired}
            onChange={(v) => setPartial({ rebootRequired: v })}
            label="Reboot Required"
            desc="A reboot is required after the update."
          />

          <div className="rounded-xl bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/80">
                <RefreshCcw size={16} />
                Last check
              </div>
              <div className="text-xs text-white/60">{lastCheckLabel}</div>
            </div>

            <button
              onClick={handleCheckNow}
              disabled={checking}
              className={[
                "w-full rounded-xl px-4 py-2 text-sm font-semibold transition",
                checking ? "bg-white/10 text-white/60" : "bg-blue-600 text-white hover:bg-blue-500",
              ].join(" ")}
            >
              {checking ? "Checking..." : "Check Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
