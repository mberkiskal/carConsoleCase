import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import SettingsLayout from "./layouts/SettingsLayout";
import NavigationPage from "./pages/NavigationPage";
import SettingsClimatePage from "./pages/settings/SettingsClimatePage";
import SettingsLightPage from "./pages/settings/SettingsLightPage";
import SettingsDisplayPage from "./pages/settings/SettingsDisplayPage";
import SettingsVehiclePage from "./pages/settings/SettingsVehiclePage";
import SettingsServicePage from "./pages/settings/SettingsServicePage";
import SettingsDrivingPage from "./pages/settings/SettingsDrivingPage";
import SettingsSoftwarePage from "./pages/settings/SettingsSoftwarePage";
import SettingsSeatingPage from "./pages/settings/SettingsSeatingPage";
import BrightnessOverlay from "./components/BrightnessOverlay";

export default function App() {
  return (
    <>
      <BrightnessOverlay />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/settings" replace />} />
          <Route path="/navigation" element={<NavigationPage />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="display" replace />} />
            <Route path="display" element={<SettingsDisplayPage />} />
            <Route path="vehicle" element={<SettingsVehiclePage />} />
            <Route path="climate" element={<SettingsClimatePage />} />
            <Route path="service" element={<SettingsServicePage />} />
            <Route path="driving" element={<SettingsDrivingPage />} />
            <Route path="software" element={<SettingsSoftwarePage />} />
            <Route path="lights" element={<SettingsLightPage />} />
            <Route path="seating" element={<SettingsSeatingPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/settings" replace />} />
        </Route>
      </Routes>
    </>
  );
}
