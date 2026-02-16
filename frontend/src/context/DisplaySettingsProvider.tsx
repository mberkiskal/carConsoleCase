import React, { useEffect, useMemo, useState } from "react";
import { DisplaySettingsContext } from "./DisplaySettingsContext";
import type { DisplaySettingsCtx, DisplaySettingsDto } from "./DisplaySettingsContext";

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").toString().trim();

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getFontScale(textSize: DisplaySettingsDto["textSize"]) {
  if (textSize === "Small") return 0.92;
  if (textSize === "Large") return 1.12;
  return 1.0;
}

export function DisplaySettingsProvider({ children }: { children: React.ReactNode }) {
  const [display, setDisplay] = useState<DisplaySettingsDto | null>(null);

  const applyDisplayToDom = (s: DisplaySettingsDto) => {
    const root = document.documentElement;

    root.style.setProperty("--app-font-scale", String(getFontScale(s.textSize)));
    root.classList.toggle("reduce-motion", !!s.reduceMotion);
    root.style.setProperty("--app-brightness", String(clamp(s.brightness, 0, 100)));
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
        if (!API_BASE) return;

        const res = await fetch(`${API_BASE}/api/settings/display`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) return;

        const dto = (await res.json()) as DisplaySettingsDto;
        if (cancelled) return;

        setDisplay(dto);
        applyDisplayToDom(dto);
      
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (display) applyDisplayToDom(display);
  }, [display]);

  const value = useMemo<DisplaySettingsCtx>(() => ({ display, setDisplay, applyDisplayToDom }), [display]);

  return <DisplaySettingsContext.Provider value={value}>{children}</DisplaySettingsContext.Provider>;
}
