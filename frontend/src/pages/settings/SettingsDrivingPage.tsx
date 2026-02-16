import { useEffect, useMemo, useState } from "react";
import {
  Gauge,
  Save,
  AlertCircle,
  CheckCircle2,
  Route,
  ShieldAlert,
  ParkingSquare
} from "lucide-react";
import { api } from "../../api/http";

type DrivingSettingsDto = {
  id: number;
  driveMode: string;
  regenLevel: number;
  laneAssistEnabled: boolean;
  laneAssistIntensity: number;
  cruiseDefaultKmh: number;
  trafficSignRecognition: boolean;
  parkingSensorsEnabled: boolean;
  collisionWarningEnabled: boolean;
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

export default function SettingsDrivingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<DrivingSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<DrivingSettingsDto>("/api/settings/driving");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          let text = "Failed to load driving settings.";
          if (e instanceof Error && e.message.includes("404")) {
            text = "DrivingSettings record not found. Is there a row in the database?";
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

  const setPartial = (patch: Partial<DrivingSettingsDto>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: DrivingSettingsDto = {
        ...data,
        driveMode: ["Eco", "Normal", "Sport"].includes(data.driveMode) ? data.driveMode : "Normal",
        regenLevel: clamp(Number(data.regenLevel), 0, 3),
        laneAssistIntensity: clamp(Number(data.laneAssistIntensity), 0, 3),
        cruiseDefaultKmh: clamp(Number(data.cruiseDefaultKmh), 0, 200),
      };

      const updated = await api<DrivingSettingsDto>("/api/settings/driving", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(updated);

      setMsg({ type: "success", text: "Driving settings saved." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Save failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setSaving(false);
    }
  };

  const cruiseLabel = useMemo(() => {
    if (!data) return "";
    return `${data.cruiseDefaultKmh} km/h`;
  }, [data]);

  const chip = (active: boolean) =>
    [
      "rounded-xl px-4 py-3 text-sm font-semibold transition",
      active
        ? "bg-blue-600/30 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const regenBtn = (active: boolean) =>
    [
      "rounded-xl px-3 py-2 text-sm font-semibold transition",
      active
        ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.18)]"
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
        <h1 className="text-xl font-semibold text-white">Driving Settings</h1>
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
            <Gauge size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Driving Settings</h1>
            <div className="text-sm text-white/60">
              Drive mode, regeneration, lane assist, and safety options.
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-white/80">
            <Route size={16} />
            <span className="text-sm font-semibold">Drive Mode</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {["Eco", "Normal", "Sport"].map((m) => (
              <button
                key={m}
                className={chip(data.driveMode === m)}
                onClick={() => setPartial({ driveMode: m })}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-white/5 p-4">
            <label className="mb-2 block text-xs text-white/60">
              Cruise Default: <span className="font-semibold text-white/80">{cruiseLabel}</span>
            </label>
            <input
              type="range"
              min={0}
              max={200}
              step={5}
              value={data.cruiseDefaultKmh}
              onChange={(e) => setPartial({ cruiseDefaultKmh: Number(e.target.value) })}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
            />
            <div className="mt-2 flex justify-between text-xs text-white/50">
              <span>0</span>
              <span>200</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="text-sm font-semibold text-white/80">Energy & Lane</div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="mb-2 text-xs text-white/60">Regeneration Level</div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((v) => (
                <button
                  key={v}
                  className={regenBtn(data.regenLevel === v)}
                  onClick={() => setPartial({ regenLevel: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <Toggle
            value={data.laneAssistEnabled}
            onChange={(v) => setPartial({ laneAssistEnabled: v })}
            label="Lane Assist"
            desc="Helps you stay within the lane."
          />

          <div className="rounded-xl bg-white/5 p-4">
            <label className="mb-2 block text-xs text-white/60">
              Lane Assist Sensitivity:{" "}
              <span className="font-semibold text-white/80">{data.laneAssistIntensity}</span>
            </label>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={data.laneAssistIntensity}
              onChange={(e) => setPartial({ laneAssistIntensity: Number(e.target.value) })}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
              disabled={!data.laneAssistEnabled}
            />
            <div className="mt-2 flex justify-between text-xs text-white/50">
              <span>0</span>
              <span>3</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="mb-1 flex items-center gap-2 text-white/80">
            <ShieldAlert size={16} />
            <span className="text-sm font-semibold">Safety</span>
          </div>

          <Toggle
            value={data.collisionWarningEnabled}
            onChange={(v) => setPartial({ collisionWarningEnabled: v })}
            label="Collision Warning"
            desc="Warns you when there is a potential collision risk."
          />

          <Toggle
            value={data.trafficSignRecognition}
            onChange={(v) => setPartial({ trafficSignRecognition: v })}
            label="Traffic Sign Recognition"
            desc="Can detect speed limits and traffic signs."
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <div className="mb-1 flex items-center gap-2 text-white/80">
            <ParkingSquare size={16} />
            <span className="text-sm font-semibold">Parking</span>
          </div>

          <Toggle
            value={data.parkingSensorsEnabled}
            onChange={(v) => setPartial({ parkingSensorsEnabled: v })}
            label="Parking Sensors"
            desc="Provides alerts for nearby obstacles."
          />
        </div>
      </div>
    </div>
  );
}
