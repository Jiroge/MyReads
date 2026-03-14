/**
 * App.js — Root component
 *
 * Sets up React Router and wraps the whole tree in context providers:
 *   AuthProvider     → username / login / logout
 *   SettingsProvider → theme (color) + mode (light/dark)
 *
 * Route structure:
 *   /login          → LoginPage   (public)
 *   /               → HomePage    (protected, inside SidebarLayout)
 *   /settings       → SettingPage (protected, inside SidebarLayout)
 *   /search         → SearchPage  (protected, full-screen — no sidebar)
 */
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/contexts/Auth";
import { SettingsProvider } from "./components/contexts/Settings";
import SidebarLayout from "./components/layouts/SidebarLayout";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import LoginPage from "./pages/LoginPage";
import SettingPage from "./pages/SettingPage";

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Renders <Outlet /> so nested routes can use it as a wrapper.
 */
function ProtectedRoute() {
  const { username } = useAuth();
  return username ? <Outlet /> : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="app">
      <Router>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<SidebarLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/settings" element={<SettingPage />} />
                </Route>
                <Route path="/search" element={<SearchPage />} />
              </Route>
            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
