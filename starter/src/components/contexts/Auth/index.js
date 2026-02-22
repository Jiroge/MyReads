/**
 * Auth context — manages the logged-in user session.
 *
 * State:  username  (string, empty string = logged out)
 * Storage: localStorage key "username" — survives page refresh.
 *
 * logout() calls localStorage.clear() to wipe ALL stored data
 * (shelves, booklists, theme) so a new user starts from a clean state.
 */
import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Rehydrate from localStorage so the session persists across refreshes.
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");

  const login = useCallback((name) => {
    localStorage.setItem("username", name);
    setUsername(name);
  }, []);

  /** Clears all localStorage data so the next user starts fresh. */
  const logout = useCallback(() => {
    localStorage.clear();
    setUsername("");
  }, []);

  return (
    <AuthContext.Provider value={{ username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
