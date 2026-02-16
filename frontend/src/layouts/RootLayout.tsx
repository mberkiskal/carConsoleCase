import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/dashboard", label: "DASHBOARD" },
  { to: "/quick-controls", label: "QUICK CONTROLS" },
  { to: "/navigation", label: "NAVIGATION" },
  { to: "/phone", label: "PHONE" },
  { to: "/media", label: "MEDIA" },
  { to: "/settings", label: "SETTINGS" },
];

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-6">
        <Outlet />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3 py-2 text-xs tracking-wide",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white",
                ].join(" ")
              }
            >
              {t.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
