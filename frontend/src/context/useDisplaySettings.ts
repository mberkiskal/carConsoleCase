import { useContext } from "react";
import { DisplaySettingsContext } from "./DisplaySettingsContext";
import type { DisplaySettingsCtx } from "./DisplaySettingsContext";

export function useDisplaySettings(): DisplaySettingsCtx {
  const ctx = useContext(DisplaySettingsContext);
  if (!ctx) throw new Error("useDisplaySettings must be used inside DisplaySettingsProvider");
  return ctx;
}
