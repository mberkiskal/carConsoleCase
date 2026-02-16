import { useEffect, useMemo, useState } from "react";
import { Wrench, Save, AlertCircle, CheckCircle2, CalendarDays, MapPin } from "lucide-react";
import { api } from "../../api/http";

type ServiceSettingsDto = {
  id: number;
  serviceReminderEnabled: boolean;
  serviceIntervalKm: number;
  serviceIntervalMonths: number;
  lastServiceAtKm: number;
  lastServiceDate: string;
  preferredServiceCenter: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toInputDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromInputDate(value: string): string {
  const [y, m, d] = value.split("-").map((x) => Number(x));
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0);
  return dt.toISOString();
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

export default function SettingsServicePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ServiceSettingsDto | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setMsg(null);
        const dto = await api<ServiceSettingsDto>("/api/settings/service");
        if (!cancelled) setData(dto);
      } catch (e: unknown) {
        if (!cancelled) {
          let text = "Failed to load service settings.";
          if (e instanceof Error && e.message.includes("404")) {
            text = "ServiceSettings record not found. Is there a row in the database?";
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

  const setPartial = (patch: Partial<ServiceSettingsDto>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!data) return;

    try {
      setSaving(true);
      setMsg(null);

      const payload: ServiceSettingsDto = {
        ...data,
        serviceIntervalKm: clamp(Number(data.serviceIntervalKm), 5000, 30000),
        serviceIntervalMonths: clamp(Number(data.serviceIntervalMonths), 3, 24),
        lastServiceAtKm: Math.max(0, Number(data.lastServiceAtKm)),
        preferredServiceCenter: (data.preferredServiceCenter ?? "").toString(),
      };

      const updated = await api<ServiceSettingsDto>("/api/settings/service", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setData(updated);

      setMsg({ type: "success", text: "Service settings saved." });
      setTimeout(() => setMsg(null), 2500);
    } catch (e: unknown) {
      const errText = e instanceof Error ? e.message : "Save failed.";
      setMsg({ type: "error", text: errText });
    } finally {
      setSaving(false);
    }
  };

  const lastServiceDateInput = useMemo(
    () => toInputDate(data?.lastServiceDate ?? ""),
    [data?.lastServiceDate]
  );

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
        <h1 className="text-xl font-semibold text-white">Service Settings</h1>
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
            <Wrench size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Service Settings</h1>
            <div className="text-sm text-white/60">
              Scheduled maintenance reminders and service details.
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
          <Toggle
            value={data.serviceReminderEnabled}
            onChange={(v) => setPartial({ serviceReminderEnabled: v })}
            label="Service Reminder"
            desc="Shows a notification when the maintenance time is approaching."
          />

          <div className="rounded-xl bg-white/5 p-4">
            <div className="text-sm font-semibold text-white/80">Service Interval</div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs text-white/60">
                  Mileage (5000–30000)
                </label>
                <input
                  type="number"
                  value={data.serviceIntervalKm}
                  min={5000}
                  max={30000}
                  onChange={(e) => setPartial({ serviceIntervalKm: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-white/60">Months (3–24)</label>
                <input
                  type="number"
                  value={data.serviceIntervalMonths}
                  min={3}
                  max={24}
                  onChange={(e) => setPartial({ serviceIntervalMonths: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-500/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <div className="flex items-center gap-2 text-white/80">
            <CalendarDays size={16} />
            <span className="text-sm font-semibold">Last Service</span>
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <label className="mb-2 block text-xs text-white/60">Last Service Date</label>
            <input
              type="date"
              value={lastServiceDateInput}
              onChange={(e) => setPartial({ lastServiceDate: fromInputDate(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-500/40"
            />
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <label className="mb-2 block text-xs text-white/60">Last Service Odometer (km)</label>
            <input
              type="number"
              value={data.lastServiceAtKm}
              min={0}
              onChange={(e) => setPartial({ lastServiceAtKm: Number(e.target.value) })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-500/40"
            />
          </div>

          <div className="rounded-xl bg-white/5 p-4">
            <div className="mb-2 flex items-center gap-2 text-white/80">
              <MapPin size={16} />
              <span className="text-sm font-semibold">Preferred Service Center</span>
            </div>

            <input
              type="text"
              value={data.preferredServiceCenter ?? ""}
              onChange={(e) => setPartial({ preferredServiceCenter: e.target.value })}
              placeholder="e.g., Authorized Service - Konya"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none placeholder:text-white/30 focus:border-blue-500/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
