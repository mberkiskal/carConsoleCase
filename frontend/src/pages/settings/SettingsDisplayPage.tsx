import { useEffect, useMemo, useState } from "react";
import { Monitor, Save, AlertCircle, CheckCircle2, Sun, Moon, Languages, Timer } from "lucide-react";

import type { DisplaySettingsDto } from "../../context/DisplaySettingsContext";
import { useDisplaySettings } from "../../context/useDisplaySettings";
import { api } from "../../api/http";

const NAV_THEME_GET = "/api/settings/navigation";
const NAV_THEME_PUT = "/api/settings/navigation";

type MapTheme = "dark" | "light";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeMapTheme(v: unknown): MapTheme {
  const s = String(v ?? "").toLowerCase();
  return s === "light" ? "light" : "dark";
}

function normalizeDisplayDto(dto: DisplaySettingsDto): DisplaySettingsDto {
  const textSize = dto.textSize === "Small" || dto.textSize === "Large" ? dto.textSize : "Medium";

  return {
    ...dto,
    textSize,
    brightness: clamp(Number(dto.brightness), 0, 100),
    screenTimeoutSeconds: clamp(Number(dto.screenTimeoutSeconds), 30, 600),
  };
}

export default function SettingsDisplayPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [data, setData] = useState<DisplaySettingsDto | null>(null);
  const [mapTheme, setMapTheme] = useState<MapTheme>("dark");

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { setDisplay } = useDisplaySettings();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);

        const [displayDto, navThemeDto] = await Promise.all([
          api<DisplaySettingsDto>("/api/settings/display"),
          api<{ theme?: string }>(NAV_THEME_GET),
        ]);

        if (cancelled) return;

        const normalized = normalizeDisplayDto(displayDto);
        setData(normalized);
        setDisplay(normalized);

        setMapTheme(normalizeMapTheme(navThemeDto?.theme));
      } catch (e: unknown) {
        if (!cancelled) {
          const text = e instanceof Error ? e.message : "Failed to load settings.";
          setMsg({ type: "error", text });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setDisplay]);

  const setPartial = (patch: Partial<DisplaySettingsDto>) => {
    setData((prev) => {
      if (!prev) return prev;
      return normalizeDisplayDto({ ...prev, ...patch } as DisplaySettingsDto);
    });
  };

  useEffect(() => {
    if (data) setDisplay(data);
  }, [data, setDisplay]);

  const setMapThemeAndPersist = async (t: MapTheme) => {
    setMapTheme(t);
    try {
      await api<{ theme: string }>(NAV_THEME_PUT, { method: "PUT", body: JSON.stringify({ theme: t }) });
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Failed to save navigation theme.";
      setMsg({ type: "error", text: errText });
    }
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: DisplaySettingsDto = {
        ...data,
        brightness: clamp(data.brightness, 0, 100),
        screenTimeoutSeconds: clamp(data.screenTimeoutSeconds, 30, 600),
      };

      const updated = await api<DisplaySettingsDto>("/api/settings/display", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const normalized = normalizeDisplayDto(updated);

      setData(normalized);
      setDisplay(normalized);

      setMsg({ type: "success", text: "Display settings saved." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Save failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setSaving(false);
    }
  };

  const timeoutLabel = useMemo(() => {
    if (!data) return "";
    const s = data.screenTimeoutSeconds;
    if (s < 60) return `${s} second`;
    return `${Math.round(s / 60)} minute`;
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
        <h1 className="text-xl font-semibold text-white">Display Settings</h1>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
          {msg?.text ?? "No data."}
        </div>
      </div>
    );
  }

  const chip = (active: boolean) =>
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
            <Monitor size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Display Settings</h1>
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
          <div className="mb-3 text-sm font-semibold text-white/80">Brightness</div>

          <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
            <div className="text-sm text-white/70">Auto Brightness</div>
            <button
              onClick={() => setPartial({ autoBrightness: !data.autoBrightness })}
              className={[
                "relative h-8 w-14 rounded-full border transition",
                data.autoBrightness ? "border-blue-500/40 bg-blue-600/30" : "border-white/10 bg-white/5",
              ].join(" ")}
              aria-label="Auto Brightness Toggle"
            >
              <span
                className={[
                  "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white transition",
                  data.autoBrightness ? "left-7" : "left-1",
                ].join(" ")}
              />
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs text-white/60">
              Brightness: <span className="font-semibold text-white/80">{data.brightness}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={data.brightness}
              onChange={(e) => setPartial({ brightness: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm font-semibold text-white/80">Theme</div>

          <div className="grid grid-cols-2 gap-3">
            <button className={chip(mapTheme === "dark")} onClick={() => setMapThemeAndPersist("dark")}>
              <div className="flex items-center gap-2">
                <Moon size={16} />
                <span>Dark</span>
              </div>
              <div className="mt-1 text-xs font-normal text-white/60">Map theme</div>
            </button>

            <button className={chip(mapTheme === "light")} onClick={() => setMapThemeAndPersist("light")}>
              <div className="flex items-center gap-2">
                <Sun size={16} />
                <span>Light</span>
              </div>
              <div className="mt-1 text-xs font-normal text-white/60">Map theme</div>
            </button>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
              <Languages size={16} />
              Language
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["en", "tr", "ar"].map((l) => (
                <button
                  key={l}
                  className={chip(data.language === l)}
                  onClick={() => setPartial({ language: l })}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/80">
              <Timer size={16} />
              Screen Timeout
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
              <div className="text-sm text-white/70">{timeoutLabel}</div>
              <input
                type="range"
                min={30}
                max={600}
                step={30}
                value={data.screenTimeoutSeconds}
                onChange={(e) => setPartial({ screenTimeoutSeconds: Number(e.target.value) })}
                className="w-48 accent-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 lg:col-span-2">
          <div className="mb-3 text-sm font-semibold text-white/80">Text Size</div>

          <div className="grid grid-cols-3 gap-3">
            {(["Small", "Medium", "Large"] as const).map((s) => (
              <button
                key={s}
                className={chip(data.textSize === s)}
                onClick={() => setPartial({ textSize: s })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
