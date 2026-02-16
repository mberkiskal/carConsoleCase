import { api } from "./http";
import type { RoutePoint } from "./types";

export const routesApi = {
  getDefault: () => api<RoutePoint[]>("/api/routes/default"),
};
