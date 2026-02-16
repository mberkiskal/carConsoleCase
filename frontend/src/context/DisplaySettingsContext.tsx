import { createContext } from "react";
import type React from "react";

export type DisplaySettingsDto = {
  id: number;
  brightness: number;
  autoBrightness: boolean;
  theme: "dark" | "light";
  language: string;
  units: string;
  textSize: "Small" | "Medium" | "Large";
  screenTimeoutSeconds: number;
  reduceMotion: boolean;
};

export type DisplaySettingsCtx = {
  display: DisplaySettingsDto | null;
  setDisplay: React.Dispatch<React.SetStateAction<DisplaySettingsDto | null>>;
  applyDisplayToDom: (s: DisplaySettingsDto) => void;
};

export const DisplaySettingsContext = createContext<DisplaySettingsCtx | null>(null);
