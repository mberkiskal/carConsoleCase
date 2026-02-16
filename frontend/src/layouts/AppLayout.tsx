import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
  LayoutGrid,
  SlidersHorizontal,
  Navigation as NavIcon,
  Smartphone,
  Play,
  Car,
} from "lucide-react";

import { menuApi, type MenuItemDto } from "../api/menu";

type Tab = MenuItemDto & {
  Icon: React.ComponentType<{ size?: number }>;
};

const iconMap: Record<string, Tab["Icon"]> = {
  dashboard: LayoutGrid,
  quick_controls: SlidersHorizontal,
  navigation: NavIcon,
  phone: Smartphone,
  media: Play,
  settings: Car,
};

export default function AppLayout() {
  const [menu, setMenu] = useState<MenuItemDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
        const data = await menuApi.get("TabBar");
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setMenu(data);
        }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const tabs: Tab[] = useMemo(() => {
    return menu.map((m) => ({
      ...m,
      Icon: iconMap[m.key] ?? Car,
    }));
  }, [menu]);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white">
      <div className="w-full p-4 pb-24">
        <Outlet />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto grid w-full max-w-none grid-cols-6 px-2 py-2">
          {tabs.map(({ key, label, route, Icon }) => (
            <NavLink key={key} to={route}>
              {({ isActive }) => (
                <div
                  className={[
                    "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 transition",
                    isActive ? "text-white" : "text-white/55 hover:text-white/80",
                  ].join(" ")}
                >
                  <Icon size={22} />
                  <span className="text-[10px] tracking-wide">{label}</span>
                  <span
                    className={[
                      "mt-1 h-1 w-10 rounded-full transition",
                      isActive ? "bg-blue-500" : "bg-transparent",
                    ].join(" ")}
                  />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
