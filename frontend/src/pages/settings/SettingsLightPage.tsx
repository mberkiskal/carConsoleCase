import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Save, AlertCircle, CheckCircle2, Car } from "lucide-react";
import { api } from "../../api/http";

type LightSettingsDto = {
  id: number;
  headlightMode: "Off" | "Parking" | "On" | "Auto";
  fogLightMode: "Off" | "Front" | "Back" | "Both";
  brightness: number;
  angle: number;
  autoHighBeam: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function chip(active: boolean) {
  return [
    "rounded-2xl px-4 py-2 text-sm font-semibold transition",
    active
      ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.22)]"
      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
      <div className="text-sm font-semibold text-white/85">{label}</div>
      <button
        onClick={() => onChange(!value)}
        className={[
          "relative h-8 w-14 rounded-full border transition",
          value ? "border-blue-500/40 bg-blue-600/30" : "border-white/10 bg-white/5",
        ].join(" ")}
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

export default function SettingsLightsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<LightSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<LightSettingsDto>("/api/settings/lights");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          const text =
            e instanceof Error && e.message.includes("not found")
              ? "No LightSettings record found. Run the database script."
              : "Failed to load light settings.";
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

  const setPartial = (patch: Partial<LightSettingsDto>) => {
    setData((p) => (p ? { ...p, ...patch } : p));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: LightSettingsDto = {
        ...data,
        brightness: clamp(Number(data.brightness), 0, 100),
        angle: clamp(Number(data.angle), -5, 5),
      };

      const updated = await api<LightSettingsDto>("/api/settings/lights", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(updated);

      setMsg({ type: "success", text: "Headlight settings saved." });
      setTimeout(() => setMsg(null), 2000);
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  const beamOpacity = useMemo(() => {
    if (!data) return 0;
    if (data.headlightMode === "Off") return 0;
    const base = data.headlightMode === "Parking" ? 0.25 : 1;
    return base * (clamp(data.brightness, 0, 100) / 100);
  }, [data]);

  const beamRotationDeg = useMemo(() => {
    if (!data) return 0;
    return -data.angle * 2.2;
  }, [data]);

  const fogFrontOn = data?.fogLightMode === "Front" || data?.fogLightMode === "Both";
  const fogBackOn = data?.fogLightMode === "Back" || data?.fogLightMode === "Both";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-white/80">Loading...</div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold text-white">Lights</h1>
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
            <Lightbulb size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Lights</h1>
            <div className="text-sm text-white/60">Headlights + Fog + Angle + Brightness</div>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-white/80">Headlights</div>
            <div className="flex flex-wrap gap-2">
              {(["Off", "Parking", "On", "Auto"] as const).map((m) => (
                <button
                  key={m}
                  className={chip(data.headlightMode === m)}
                  onClick={() => setPartial({ headlightMode: m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white/80">Fog Lights</div>
            <div className="flex flex-wrap gap-2">
              {(["Off", "Front", "Back", "Both"] as const).map((m) => (
                <button
                  key={m}
                  className={chip(data.fogLightMode === m)}
                  onClick={() => setPartial({ fogLightMode: m })}
                >
                  {m === "Front" ? "Front Fog" : m === "Back" ? "Rear Fog" : m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-white/80">
              Brightness: <span className="text-white">{data.brightness}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.brightness}
              onChange={(e) => setPartial({ brightness: Number(e.target.value) })}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-white/80">
              Angle: <span className="text-white">{data.angle}°</span>
            </div>
            <input
              type="range"
              min={-5}
              max={5}
              step={1}
              value={data.angle}
              onChange={(e) => setPartial({ angle: Number(e.target.value) })}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
            />
          </div>

          <Toggle
            value={data.autoHighBeam}
            onChange={(v) => setPartial({ autoHighBeam: v })}
            label="Auto High Beam"
          />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/6 to-white/3 px-5 pb-0 pt-5">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/80">
            <Car size={16} />
            Vehicle View
          </div>

          <div className="relative mx-auto aspect-square h-[320px] w-full max-w-[420px]">
            <svg
              className="pointer-events-none absolute inset-0 z-20 h-full w-full mix-blend-screen"
              viewBox="0 -50 512 620"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="beamL">
                  <stop offset="0%" stopColor="#FFF59D" stopOpacity={beamOpacity * 0.9} />
                  <stop offset="55%" stopColor="#FFD54F" stopOpacity={beamOpacity * 0.35} />
                  <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="beamR">
                  <stop offset="0%" stopColor="#FFF59D" stopOpacity={beamOpacity * 0.9} />
                  <stop offset="55%" stopColor="#FFD54F" stopOpacity={beamOpacity * 0.35} />
                  <stop offset="100%" stopColor="#FFB300" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="fogFront">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity={fogFrontOn ? 0.55 : 0} />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="fogBack">
                  <stop offset="0%" stopColor="#FCA5A5" stopOpacity={fogBackOn ? 0.45 : 0} />
                  <stop offset="100%" stopColor="#F87171" stopOpacity="0" />
                </radialGradient>
              </defs>

              <g
                style={{
                  transformOrigin: "256px 80px",
                  transform: `rotate(${beamRotationDeg}deg)`,
                  transition: "transform 200ms ease",
                }}
              >
                <polygon points="182,108 70,0 250,0" fill="url(#beamL)" />
                <polygon points="330,108 262,0 442,0" fill="url(#beamR)" />
              </g>

              {beamOpacity > 0 && (
                <>
                  <circle cx="182" cy="80" r={14 + data.brightness * 0.06} fill="url(#beamL)" />
                  <circle cx="330" cy="80" r={14 + data.brightness * 0.06} fill="url(#beamR)" />
                </>
              )}

              <ellipse cx="256" cy="65" rx="240" ry="62" fill="url(#fogFront)" />
              <ellipse cx="256" cy="550" rx="240" ry="62" fill="url(#fogBack)" />
            </svg>

            <div className="absolute inset-0 z-10 flex translate-y-[20px] items-center justify-center">
              <img
                src="/assets/car-top.png"
                alt="Car Top View"
                className="h-[75%] w-auto select-none object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
