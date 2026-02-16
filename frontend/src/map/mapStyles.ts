import type { StyleSpecification } from "maplibre-gl";
export type ThemeMode = "dark" | "light";

export function getRasterStyle(theme: ThemeMode): StyleSpecification {
  const tiles =
    theme === "dark"
      ? [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        ]
      : [
          "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        ];

  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles,
        tileSize: 256,
        attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      },
    },
    layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19,
      paint:
        theme === "dark"
          ? {
              "raster-saturation": -0.35,
              "raster-contrast": 0.15,
              "raster-brightness-min": 0.12,
              "raster-brightness-max": 0.85,
            }
          : {
              "raster-saturation": -0.15,
              "raster-contrast": 0.05,
            },
    },
  ],
  };
}
