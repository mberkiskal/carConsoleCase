import { useEffect, useState } from "react";
import { Armchair, Save, AlertCircle, CheckCircle2, Flame, Snowflake } from "lucide-react";
import { api } from "../../api/http";

type SeatingSettingsDto = {
  id: number;
  driverSeatPreset: number;
  passengerSeatPreset: number;
  seatHeatingDriverLevel: number;
  seatHeatingPassengerLevel: number;
  seatVentDriverLevel: number;
  seatVentPassengerLevel: number;
  easyEntry: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SettingsSeatingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SeatingSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<SeatingSettingsDto>("/api/settings/seating");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          let text = "Failed to load seat settings.";
          if (e instanceof Error && e.message.includes("404")) {
            text =
              "Seat settings record not found. Is there a SeatingSettings row in the database?";
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

  const setPartial = (patch: Partial<SeatingSettingsDto>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: SeatingSettingsDto = {
        ...data,
        driverSeatPreset: clamp(data.driverSeatPreset, 1, 3),
        passengerSeatPreset: clamp(data.passengerSeatPreset, 1, 3),
        seatHeatingDriverLevel: clamp(data.seatHeatingDriverLevel, 0, 3),
        seatHeatingPassengerLevel: clamp(data.seatHeatingPassengerLevel, 0, 3),
        seatVentDriverLevel: clamp(data.seatVentDriverLevel, 0, 3),
        seatVentPassengerLevel: clamp(data.seatVentPassengerLevel, 0, 3),
      };

      const updated = await api<SeatingSettingsDto>("/api/settings/seating", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setData(updated);
      setMsg({ type: "success", text: "Seat settings saved." });
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
        <h1 className="text-xl font-semibold text-white">Seat Settings</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
          {msg?.text ?? "No data."}
        </div>
      </div>
    );
  }

  type Level = 0 | 1 | 2 | 3;

  function heatLevelBtn(active: boolean, level: Level) {
    const base = "rounded-xl px-3 py-2 text-sm font-semibold transition border";

    if (!active) {
      return `${base} border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white`;
    }

    if (level === 1)
      return `${base} border-yellow-400/30 bg-yellow-400/20 text-yellow-200 shadow-[0_10px_30px_rgba(250,204,21,0.18)]`;
    if (level === 2)
      return `${base} border-orange-400/30 bg-orange-400/20 text-orange-200 shadow-[0_10px_30px_rgba(251,146,60,0.18)]`;
    if (level === 3)
      return `${base} border-red-400/30 bg-red-400/20 text-red-200 shadow-[0_10px_30px_rgba(248,113,113,0.18)]`;

    return `${base} border-white/15 bg-white/8 text-white shadow-[0_10px_30px_rgba(255,255,255,0.06)]`;
  }

  function coolLevelBtn(active: boolean, level: Level) {
    const base = "rounded-xl px-3 py-2 text-sm font-semibold transition border";

    if (!active) {
      return `${base} border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white`;
    }

    if (level === 1)
      return `${base} border-sky-300/30 bg-sky-300/20 text-sky-100 shadow-[0_10px_30px_rgba(125,211,252,0.18)]`;
    if (level === 2)
      return `${base} border-blue-400/30 bg-blue-500/20 text-blue-100 shadow-[0_10px_30px_rgba(59,130,246,0.18)]`;
    if (level === 3)
      return `${base} border-indigo-400/30 bg-indigo-600/25 text-indigo-100 shadow-[0_10px_30px_rgba(99,102,241,0.18)]`;

    return `${base} border-white/15 bg-white/8 text-white shadow-[0_10px_30px_rgba(255,255,255,0.06)]`;
  }

  const presetBtn = (active: boolean) =>
    [
      "rounded-xl px-4 py-3 text-sm font-semibold transition",
      active
        ? "bg-blue-600/30 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600/20 text-blue-300">
            <Armchair size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Seat Settings</h1>
            <div className="text-sm text-white/60">
              Manage presets, heating/cooling, and Easy Entry settings.
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
          <div className="mb-3 text-sm font-semibold text-white/80">Preset Selection</div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/60">Driver Preset</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={presetBtn(data.driverSeatPreset === p)}
                    onClick={() => setPartial({ driverSeatPreset: p })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/60">Passenger Preset</div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={presetBtn(data.passengerSeatPreset === p)}
                    onClick={() => setPartial({ passengerSeatPreset: p })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm font-semibold text-white/80">Easy Entry</div>

          <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
            <div>
              <div className="text-sm font-semibold text-white">Easy Entry</div>
              <div className="text-xs text-white/60">
                Adjusts the seat position to make getting in and out easier.
              </div>
            </div>

            <button
              onClick={() => setPartial({ easyEntry: !data.easyEntry })}
              className={[
                "relative h-8 w-14 rounded-full border transition",
                data.easyEntry ? "border-blue-500/40 bg-blue-600/30" : "border-white/10 bg-white/5",
              ].join(" ")}
              aria-label="Easy Entry Toggle"
            >
              <span
                className={[
                  "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white transition",
                  data.easyEntry ? "left-7" : "left-1",
                ].join(" ")}
              />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-white/80">
            <Flame size={16} />
            <span className="text-sm font-semibold">Seat Heating</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/60">Driver</div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    className={heatLevelBtn(data.seatHeatingDriverLevel === v, v as Level)}
                    onClick={() => setPartial({ seatHeatingDriverLevel: v })}
                  >
                    {v === 0 ? "Off" : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/60">Passenger</div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    className={heatLevelBtn(data.seatHeatingPassengerLevel === v, v as Level)}
                    onClick={() => setPartial({ seatHeatingPassengerLevel: v })}
                  >
                    {v === 0 ? "Off" : v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-white/80">
            <Snowflake size={16} />
            <span className="text-sm font-semibold">Seat Ventilation</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/60">Driver</div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    className={coolLevelBtn(data.seatVentDriverLevel === v, v as Level)}
                    onClick={() => setPartial({ seatVentDriverLevel: v })}
                  >
                    {v === 0 ? "Off" : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-4">
              <div className="mb-2 text-xs text-white/60">Passenger</div>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    className={coolLevelBtn(data.seatVentPassengerLevel === v, v as Level)}
                    onClick={() => setPartial({ seatVentPassengerLevel: v })}
                  >
                    {v === 0 ? "Off" : v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
