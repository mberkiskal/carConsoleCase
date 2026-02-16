import { useEffect, useMemo, useRef } from "react";
import maplibregl, { GeoJSONSource, Map, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, LineString } from "geojson";

import { getRasterStyle, type ThemeMode } from "../map/mapStyles";
import { calculateBearing } from "../map/geo";
import type { RoutePoint } from "../api/types";

type Props = {
  theme: ThemeMode;
  zoom: number;
  points: RoutePoint[];
  currentIndex: number;
  transitionMs?: number;
};

const SRC_PASSED = "route-passed";
const SRC_REMAINING = "route-remaining";
const LYR_PASSED = "route-passed-line";
const LYR_REMAINING = "route-remaining-line";

export default function NavigationMap({ theme, zoom, points, currentIndex, transitionMs }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);


  const coords = useMemo(
    () => points.map((p) => [p.longitude, p.latitude] as [number, number]),
    [points]
  );

  const coordsKey = useMemo(
    () => coords.map((c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`).join(";"),
    [coords]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch {
        //error
      } finally {
        mapRef.current = null;
        markerRef.current = null;
      }
    }


    const first = coords[0] ?? [29.0, 41.0];

    const map = new maplibregl.Map({
      container,
      style: getRasterStyle(theme),
      center: first,
      zoom: zoom ?? 16,
      pitch: 60,
      bearing: 0,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true, showCompass: true }),
      "top-right"
    );

    const ro = new ResizeObserver(() => {
      map.resize();
    });
    ro.observe(container);

    const raf1 = requestAnimationFrame(() => {
      map.resize();
    });
    const t1 = window.setTimeout(() => {
      map.resize();

    }, 60);

    map.on("load", () => {
      if (!map.getSource(SRC_PASSED)) {
        map.addSource(SRC_PASSED, { type: "geojson", data: lineFeature([]) });
      }
      if (!map.getSource(SRC_REMAINING)) {
        map.addSource(SRC_REMAINING, { type: "geojson", data: lineFeature([]) });
      }

      if (!map.getLayer(LYR_PASSED)) {
        map.addLayer({
          id: LYR_PASSED,
          type: "line",
          source: SRC_PASSED,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-width": 6,
            "line-opacity": 0.55,
            "line-color": "#9ca3af",
            "line-dasharray": [2, 2],
          },
        });
      }

      if (!map.getLayer(LYR_REMAINING)) {
        map.addLayer({
          id: LYR_REMAINING,
          type: "line",
          source: SRC_REMAINING,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-width": 8,
            "line-opacity": 0.9,
            "line-color": "#60a5fa",
          },
        });
      }

      const el = buildVehicleMarkerElement();
      markerRef.current = new maplibregl.Marker({ element: el, rotationAlignment: "map" })
        .setLngLat(first)
        .addTo(map);

      if (coords.length >= 2) updateRouteSources(map, coords, 0);

      requestAnimationFrame(() => {
        map.resize();

      });
    });

    return () => {
      ro.disconnect();

      cancelAnimationFrame(raf1);
      window.clearTimeout(t1);

      if (mapRef.current === map) {
        mapRef.current = null;
        markerRef.current = null;
      }
      map.remove();

    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, coordsKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;
    if (coords.length < 2) return;

    updateRouteSources(map, coords, currentIndex);

    const idx = clamp(currentIndex, 0, coords.length - 1);
    const current = coords[idx];
    const next = coords[Math.min(idx + 1, coords.length - 1)];

    const bearing = calculateBearing(
      { lat: current[1], lon: current[0] },
      { lat: next[1], lon: next[0] }
    );

    markerRef.current?.setLngLat(current);
    markerRef.current?.setRotation(bearing);

    const duration = typeof transitionMs === "number" ? Math.max(0, transitionMs) : 450;

    map.easeTo({
      center: current,
      bearing,
      pitch: 60,
      duration,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, coordsKey, transitionMs]);

  return <div ref={containerRef} className="w-full h-full" />;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function lineFeature(coordinates: [number, number][]): Feature<LineString> {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates },
    properties: {},
  };
}

function updateRouteSources(map: Map, coords: [number, number][], currentIndex: number) {
  const passedSrc = map.getSource(SRC_PASSED) as GeoJSONSource | undefined;
  const remainingSrc = map.getSource(SRC_REMAINING) as GeoJSONSource | undefined;
  if (!passedSrc || !remainingSrc) return;

  const idx = clamp(currentIndex, 0, coords.length - 1);
  const passed = coords.slice(0, idx + 1);
  const remaining = coords.slice(idx);

  passedSrc.setData(lineFeature(passed));
  remainingSrc.setData(lineFeature(remaining));
}

function buildVehicleMarkerElement() {
  const el = document.createElement("div");
  el.style.width = "44px";
  el.style.height = "44px";
  el.style.borderRadius = "999px";
  el.style.position = "relative";

  const styleId = "vehicle-pulse-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes pulse {
        0% { transform: scale(0.95); opacity: .65; }
        70% { transform: scale(1.25); opacity: .15; }
        100% { transform: scale(0.95); opacity: .65; }
      }
    `;
    document.head.appendChild(style);
  }

  el.innerHTML = `
    <div style="
      position:absolute; inset:0;
      border-radius:999px;
      background: radial-gradient(circle, rgba(96,165,250,.45) 0%, rgba(96,165,250,0) 65%);
      animation: pulse 1.6s ease-in-out infinite;
    "></div>
    <div style="
      position:absolute; left:50%; top:50%;
      width:16px; height:16px;
      transform: translate(-50%,-50%);
      background: rgba(17,24,39,.9);
      border: 2px solid rgba(96,165,250,.95);
      border-radius: 999px;
      box-shadow: 0 0 12px rgba(96,165,250,.35);
    "></div>
    <div style="
      position:absolute; left:50%; top:6px;
      width:0; height:0;
      transform: translateX(-50%);
      border-left:6px solid transparent;
      border-right:6px solid transparent;
      border-bottom:10px solid rgba(96,165,250,.95);
      filter: drop-shadow(0 2px 3px rgba(0,0,0,.25));
    "></div>
  `;
  return el;
}
