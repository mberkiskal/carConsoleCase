import { useEffect, useMemo, useRef, useState } from "react";
import { routesApi } from "../api/routes";
import { api } from "../api/http";
import type { RoutePoint } from "../api/types";
import NavigationMap from "../components/NavigationMap";

type SimState = "idle" | "running" | "paused" | "finished";
type ThemeMode = "dark" | "light";

export default function NavigationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [theme, setTheme] = useState<ThemeMode>("dark");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [simState, setSimState] = useState<SimState>("idle");

  const timerRef = useRef<number | null>(null);

  const routeRefreshSeconds = 2;
  const mapDefaultZoom = 16;

  const ms = useMemo(() => Math.max(1, routeRefreshSeconds) * 1000, [routeRefreshSeconds]);

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const tick = () => {
    setCurrentIndex((i) => {
      const next = i + 1;
      if (next >= points.length - 1) {
        stopTimer();
        setSimState("finished");
        return points.length - 1;
      }
      return next;
    });
  };

  const start = () => {
    if (points.length < 2) return;
    stopTimer();
    setCurrentIndex(0);
    setSimState("running");
    timerRef.current = window.setInterval(tick, ms);
  };

  const pause = () => {
    if (simState !== "running") return;
    stopTimer();
    setSimState("paused");
  };

  const resume = () => {
    if (points.length < 2) return;
    if (simState !== "paused") return;
    stopTimer();
    setSimState("running");
    timerRef.current = window.setInterval(tick, ms);
  };

  const reset = () => {
    stopTimer();
    setCurrentIndex(0);
    setSimState("idle");
  };

  useEffect(() => {
    (async () => {
      try {
        setError(null);

        const [route, nav] = await Promise.all([
          routesApi.getDefault(),
          api<{ theme: string }>("/api/settings/navigation"),
        ]);

        const sorted = route.sort((a, b) => a.sequence - b.sequence);
        setPoints(sorted);

        const t = String(nav?.theme ?? "dark").toLowerCase();
        setTheme(t === "light" ? "light" : "dark");

        setCurrentIndex(0);
        setSimState("idle");
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
      } finally {
        setLoading(false);
      }
    })();

    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (simState !== "running") return;
    if (points.length < 2) return;

    stopTimer();
    timerRef.current = window.setInterval(tick, ms);

    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);

  if (loading) return <div className="text-white/80">Loading...</div>;

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Navigation</h1>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200">
          {error}
        </div>
      )}

      {points.length >= 2 ? (
        <div className="flex h-[calc(100vh-80px)] flex-col">
          <NavigationMap theme={theme} zoom={mapDefaultZoom} points={points} currentIndex={currentIndex} />
          <div className="absolute left-3 top-3 z-10">
            <div className="flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 backdrop-blur sm:p-3">
              <button
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50 sm:py-1.5 sm:text-sm"
                onClick={start}
                disabled={simState === "running"}
              >
                Start
              </button>

              <button
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50 sm:py-1.5 sm:text-sm"
                onClick={pause}
                disabled={simState !== "running"}
              >
                Pause
              </button>

              <button
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50 sm:py-1.5 sm:text-sm"
                onClick={resume}
                disabled={simState !== "paused"}
              >
                Resume
              </button>

              <button
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 sm:py-1.5 sm:text-sm"
                onClick={reset}
              >
                Reset
              </button>

              <div className="w-full text-xs text-white/70 sm:ml-auto sm:w-auto sm:text-sm">
                {simState === "idle" && "Ready"}
                {simState === "running" && "Running"}
                {simState === "paused" && "Paused"}
                {simState === "finished" && "Finished"}
                <span className="mx-2 text-white/30">|</span>
                {currentIndex + 1}/{points.length}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white/70">Not enough route points (need at least 2).</div>
      )}
    </div>
  );
}
