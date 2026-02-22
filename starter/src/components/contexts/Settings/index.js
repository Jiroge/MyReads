/**
 * Settings context — manages the active color theme and light/dark mode.
 *
 * theme : keyof colors  ("green" | "blue" | "purple" | "yellow")
 * mode  : "light" | "dark"
 *
 * Both values are persisted in localStorage so the user's preference
 * survives refreshes.
 *
 * `colors` and `modes` from themes/index.js are passed through the
 * context so SidebarLayout can read them in its useEffect and write
 * the corresponding CSS variables to :root.
 */
import { createContext, useContext, useState, useCallback } from "react";
import { colors, modes } from "../../../themes";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "green");
  const [mode, setMode] = useState(() => localStorage.getItem("mode") || "dark");

  const changeTheme = useCallback((t) => {
    localStorage.setItem("theme", t);
    setTheme(t);
  }, []);

  const changeMode = useCallback((m) => {
    localStorage.setItem("mode", m);
    setMode(m);
  }, []);

  return (
    <SettingsContext.Provider value={{ theme, mode, colors, modes, changeTheme, changeMode }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
