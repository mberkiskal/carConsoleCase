import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import {
  Car,
  Save,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Bell,
  FoldHorizontal,
  Wrench,
  Gauge,
} from "lucide-react";

type VehicleSettingsDto = {
  id: number;
  autoLock: boolean;
  autoUnlockOnPark: boolean;
  doorLockSound: boolean;
  mirrorFoldOnLock: boolean;
  wipersServicePosition: boolean;
  tirePressureUnit: string;
  speedLimitWarningEnabled: boolean;
  speedLimitOffsetKmh: number;
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

export default function SettingsVehiclePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<VehicleSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<VehicleSettingsDto>("/api/settings/vehicle");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          let text = "Failed to load vehicle settings.";
          if (e instanceof Error && e.message.includes("404")) {
            text = "Vehicle settings record not found. Is there a VehicleSettings row in the database?";
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

  const setPartial = (patch: Partial<VehicleSettingsDto>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: VehicleSettingsDto = {
        ...data,
        speedLimitOffsetKmh: clamp(Number(data.speedLimitOffsetKmh), 0, 30),
      };

      const updated = await api<VehicleSettingsDto>("/api/settings/vehicle", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setData(updated);

      setMsg({ type: "success", text: "Vehicle settings saved." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Save failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setSaving(false);
    }
  };

  const unitLabel = useMemo(() => {
    if (!data) return "";
    return data.tirePressureUnit === "psi" ? "PSI" : "bar";
  }, [data]);

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
        <h1 className="text-xl font-semibold text-white">Vehicle Settings</h1>
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
            <Car size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Vehicle Settings</h1>
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <KeyRound size={16} />
            Locks
          </div>

          <div className="space-y-3">
            <Toggle
              value={data.autoLock}
              onChange={(v) => setPartial({ autoLock: v })}
              label="Auto Lock"
              desc="Automatically lock doors when moving."
            />
            <Toggle
              value={data.autoUnlockOnPark}
              onChange={(v) => setPartial({ autoUnlockOnPark: v })}
              label="Auto Unlock on Park"
              desc="Unlock doors when shifting to P."
            />
            <Toggle
              value={data.doorLockSound}
              onChange={(v) => setPartial({ doorLockSound: v })}
              label="Door Lock Sound"
              desc="Play sound on lock/unlock."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <FoldHorizontal size={16} />
            Mirrors
          </div>

          <div className="space-y-3">
            <Toggle
              value={data.mirrorFoldOnLock}
              onChange={(v) => setPartial({ mirrorFoldOnLock: v })}
              label="Fold Mirrors on Lock"
              desc="Fold mirrors when locking."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Wrench size={16} />
            Service
          </div>

          <div className="space-y-3">
            <Toggle
              value={data.wipersServicePosition}
              onChange={(v) => setPartial({ wipersServicePosition: v })}
              label="Wipers Service Position"
              desc="Move wipers to service position."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Bell size={16} />
            Speed Warning
          </div>

          <div className="space-y-3">
            <Toggle
              value={data.speedLimitWarningEnabled}
              onChange={(v) => setPartial({ speedLimitWarningEnabled: v })}
              label="Speed Limit Warning"
              desc="Warn when exceeding speed limit."
            />

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Offset</div>
                <div className="text-sm text-white/70">{data.speedLimitOffsetKmh} km/h</div>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={data.speedLimitOffsetKmh}
                onChange={(e) => setPartial({ speedLimitOffsetKmh: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="mt-2 text-xs text-white/60">Allowed range: 0–30 km/h</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/80">
            <Gauge size={16} />
            Tire Pressure Unit
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/70">Current unit</div>

            <div className="flex items-center gap-2">
              <button
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  unitLabel === "bar"
                    ? "bg-blue-600/30 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                onClick={() => setPartial({ tirePressureUnit: "bar" })}
              >
                BAR
              </button>
              <button
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  unitLabel === "PSI"
                    ? "bg-blue-600/30 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                ].join(" ")}
                onClick={() => setPartial({ tirePressureUnit: "psi" })}
              >
                PSI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
