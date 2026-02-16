export type RoutePoint = {
  id: number;
  sequence: number;
  latitude: number;
  longitude: number;
};

export type NavigationSettingsDto = {
  theme: "dark" | "light";
};
