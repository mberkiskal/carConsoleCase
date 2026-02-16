import { api } from "./http";

export type MenuLocation = "TabBar" | "SettingsSidebar";

export type MenuItemDto = {
  key: string;
  label: string;
  route: string;
  location?: MenuLocation;
};

export const menuApi = {
  get: (location?: MenuLocation) => {
    const qs = location ? `?location=${encodeURIComponent(location)}` : "";
    return api<MenuItemDto[]>(`/api/menu${qs}`);
  },
};
