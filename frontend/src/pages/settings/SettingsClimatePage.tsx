import { useEffect, useMemo, useState } from "react";
import { Wind, Thermometer, Fan, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../../api/http";

type FanSpinnerProps = {
  speed: number;
};

function FanSpinner({ speed }: FanSpinnerProps) {
  const s = Math.max(0, Math.min(5, speed));

  const duration = (() => {
    if (s === 0) return 0;
    const map: Record<number, number> = {
      1: 1.6,
      2: 1.2,
      3: 0.8,
      4: 0.5,
      5: 0.35,
    };
    return map[s] ?? 1.2;
  })();

  return (
    <div className="flex flex-col items-center justify-center gap-2 mt-6">
      <img
        src="/assets/fan.png"
        alt="Fan"
        draggable={false}
        className="select-none"
        style={{
          width: 90,
          height: 90,
          animation: s === 0 ? "none" : `spin ${duration}s linear infinite`,
        }}
      />

      <div className="text-xs text-white/60">
        {s === 0 ? "Fan Off" : `Level ${s}`}
      </div>
    </div>
  );
}

type ClimateSettingsDto = {
  id: number;
  targetTemperatureC: number;
  fanSpeed: number;
  zoneDriver: boolean;
  zonePassenger: boolean;
  zoneRear: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SettingsClimatePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<ClimateSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const tempMin = 16;
  const tempMax = 30;

  const tempPercent = useMemo(() => {
    const t = data?.targetTemperatureC ?? 22;
    return ((clamp(t, tempMin, tempMax) - tempMin) / (tempMax - tempMin)) * 100;
  }, [data]);

  const dialStyle = useMemo(() => {
    return {
      background: `conic-gradient(from 210deg, rgba(59,130,246,0.95) ${tempPercent}%, rgba(255,255,255,0.10) 0%)`,
      transition: "background 300ms ease",
    } as React.CSSProperties;
  }, [tempPercent]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<ClimateSettingsDto>("/api/settings/climate");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          let message = "Failed to load climate settings.";

          if (e instanceof Error) {
            if (e.message.includes("404")) {
              message =
                "No climate settings record found. Are you sure you restored the database?";
            }
          }

          setMsg({
            type: "error",
            text: message,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setPartial = (patch: Partial<ClimateSettingsDto>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const bumpTemp = (delta: number) => {
    if (!data) return;
    setPartial({ targetTemperatureC: clamp(data.targetTemperatureC + delta, tempMin, tempMax) });
  };

  type ZoneKey = "zoneDriver" | "zonePassenger" | "zoneRear";

  const toggleZone = (key: ZoneKey) => {
    if (!data) return;
    setData((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: ClimateSettingsDto = {
        ...data,
        targetTemperatureC: clamp(data.targetTemperatureC, tempMin, tempMax),
        fanSpeed: clamp(Number(data.fanSpeed), 0, 5),
      };

      const updated = await api<ClimateSettingsDto>("/api/settings/climate", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(updated);
      setMsg({ type: "success", text: "Climate settings saved." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Save failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-xl font-semibold text-white">Climate Settings</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
          {msg?.text ?? "No data."}
        </div>
      </div>
    );
  }

  const zoneBtn = (active: boolean) =>
    [
      "rounded-xl px-4 py-3 text-sm font-medium transition",
      active
        ? "bg-blue-600/30 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
    ].join(" ");

  const fanBtn = (active: boolean) =>
    [
      "rounded-xl px-3 py-2 text-sm font-semibold transition",
      active
        ? "bg-blue-600 text-white shadow-[0_10px_30px_rgba(59,130,246,0.18)]"
        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/20 text-blue-300">
            <Wind size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Climate Settings</h1>
            <div className="text-sm text-white/60">
              Adjust temperature, zones, and fan speed.
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-white/80">
            <Thermometer size={16} />
            <span className="text-sm font-semibold">Temperature</span>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative grid h-64 w-64 place-items-center rounded-full p-3" style={dialStyle}>
              <div className="grid h-full w-full place-items-center rounded-full bg-[#0b1220]/80 backdrop-blur">
                <div className="text-center">
                  <div className="text-5xl font-bold text-white tracking-tight">
                    {data.targetTemperatureC}°
                  </div>
                  <div className="mt-1 text-sm text-white/60">Celsius</div>

                  <div className="mt-5 flex items-center justify-center gap-3">
                    <button
                      onClick={() => bumpTemp(-1)}
                      className="rounded-xl bg-white/5 px-4 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      −
                    </button>
                    <button
                      onClick={() => bumpTemp(+1)}
                      className="rounded-xl bg-white/5 px-4 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" />
            </div>
          </div>

          <div className="mt-4">
            <input
              type="range"
              min={tempMin}
              max={tempMax}
              value={data.targetTemperatureC}
              onChange={(e) => setPartial({ targetTemperatureC: Number(e.target.value) })}
              className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
            />
            <div className="mt-2 flex justify-between text-xs text-white/50">
              <span>{tempMin}°</span>
              <span>{tempMax}°</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 text-sm font-semibold text-white/80">Which zones are on?</div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button onClick={() => toggleZone("zoneDriver")} className={zoneBtn(data.zoneDriver)}>
                Driver
                <div className="mt-1 text-xs text-white/50">{data.zoneDriver ? "On" : "Off"}</div>
              </button>

              <button
                onClick={() => toggleZone("zonePassenger")}
                className={zoneBtn(data.zonePassenger)}
              >
                Passenger
                <div className="mt-1 text-xs text-white/50">
                  {data.zonePassenger ? "On" : "Off"}
                </div>
              </button>

              <button onClick={() => toggleZone("zoneRear")} className={zoneBtn(data.zoneRear)}>
                Rear
                <div className="mt-1 text-xs text-white/50">{data.zoneRear ? "On" : "Off"}</div>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-white/80">
              <Fan size={16} />
              <span className="text-sm font-semibold">Fan Speed</span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setPartial({ fanSpeed: v })}
                  className={fanBtn(Number(data.fanSpeed) === v)}
                >
                  {v === 0 ? "Off" : v}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs text-white/60">
                Level: <span className="text-white/80 font-semibold">{data.fanSpeed}</span>
              </label>

              <input
                type="range"
                min={0}
                max={5}
                value={Number(data.fanSpeed)}
                onChange={(e) => setPartial({ fanSpeed: Number(e.target.value) })}
                className="h-3 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-500"
              />
            </div>

            <FanSpinner speed={Number(data.fanSpeed)} />
          </div>
        </div>
      </div>
    </div>
  );
}
