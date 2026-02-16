import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { menuApi, type MenuItemDto } from "../api/menu";
import {
  Car,
  Gauge,
  Armchair,
  Wind,
  Lightbulb,
  Monitor,
  Settings ,
  Cpu,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  driving: Gauge,
  seating: Armchair,
  lights: Lightbulb,
  display: Monitor,
  service: Settings ,
  software: Cpu,
  vehicle: Car,
  climate: Wind
};

const fallbackSidebar: MenuItemDto[] = [
  { key: "display", label: "Display", route: "/settings/display" },
  { key: "vehicle", label: "Vehicle", route: "/settings/vehicle" },
  { key: "climate", label: "Climate", route: "/settings/climate" },
  { key: "service", label: "Service", route: "/settings/service" },
  { key: "driving", label: "Driving", route: "/settings/driving" },
  { key: "software", label: "Software", route: "/settings/software" },
  { key: "lights", label: "Lights", route: "/settings/lights" },
  { key: "seating", label: "Seating", route: "/settings/seating" },
];

export default function SettingsLayout() {
  const [items, setItems] = useState<MenuItemDto[]>(fallbackSidebar);

  useEffect(() => {
    let cancelled = false;

    (async () => {
        const data = await menuApi.get("SettingsSidebar");
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          const cleaned = data.filter((x) => typeof x.route === "string" && x.route.length > 0);
          if (cleaned.length > 0) setItems(cleaned);
        }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[240px_1fr]">
      <aside className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/6 to-white/3 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="px-2 pb-2 pt-2 text-sm font-semibold text-white/85">
          Settings
        </div>

        <nav className="mt-1 space-y-1">
          {items.map((i) => {
            const Icon = iconMap[i.key] ?? Monitor;

            return (
              <NavLink key={i.key} to={i.route} end>
                {({ isActive }) => (
                  <div
                    className={[
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 transition",
                      isActive
                        ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_30px_rgba(59,130,246,0.12)]"
                        : "text-white/70 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "absolute left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full transition",
                        isActive ? "bg-blue-500" : "bg-transparent group-hover:bg-white/20",
                      ].join(" ")}
                    />

                    <Icon
                      size={18}
                      className={[
                        "ml-2 shrink-0 transition",
                        isActive ? "text-white" : "text-white/60 group-hover:text-white/80",
                      ].join(" ")}
                    />

                    <span className="text-sm font-medium tracking-wide">
                      {i.label}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="min-h-[calc(100vh-200px)] rounded-2xl border border-white/10 bg-white/5 p-4">
        <Outlet />
      </main>
    </div>
  );
}
