import { useMemo } from "react";
import { useDisplaySettings } from "../context/useDisplaySettings";

export default function BrightnessOverlay() {
  const { display } = useDisplaySettings();

  const alpha = useMemo(() => {
    const brightness = display?.brightness ?? 100;
    const clamped = Math.max(0, Math.min(100, brightness));
    const darknessRatio = 1 - clamped / 100;
    return Math.min(0.75, darknessRatio * 0.75);
  }, [display?.brightness]);

  if (alpha <= 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ backgroundColor: `rgba(0,0,0,${alpha})` }}
    />
  );
}
