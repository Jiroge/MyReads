import { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useSettings } from "../../contexts/Settings";
import { useAuth } from "../../contexts/Auth";
import { useBooklist } from "../../contexts/Booklist";
import "./index.css";

/**
 * Converts a hex colour string (e.g. "#2e7c31") to an rgba() string.
 * Used to derive semi-transparent glow colours from the theme's primary
 * colour without hardcoding rgba values for each theme.
 */
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function SidebarLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, mode, colors, modes } = useSettings();
  const { username, logout } = useAuth();
  const { clearBooklists } = useBooklist();
  const navigate = useNavigate();

  /**
   * Booklists are user-specific, so clear them before logging out
   * to prevent them from showing up for the next user on the same device.
   * Auth.logout() handles the rest of localStorage cleanup.
   */
  const handleLogout = useCallback(() => {
    clearBooklists();
    logout();
    navigate("/login");
  }, [clearBooklists, logout, navigate]);

  /**
   * Inject theme and mode values as CSS custom properties on :root.
   * This lets every CSS file use var(--color-primary), var(--color-bg), etc.
   * without knowing which theme is active.
   *
   * Glass glow intensity differs between light and dark mode to keep the
   * ambient gradient subtle on light backgrounds.
   */
  useEffect(() => {
    const c = colors[theme];
    const m = modes[mode];
    const el = document.documentElement;
    if (c) {
      el.style.setProperty("--color-primary", c.primary);
      el.style.setProperty("--color-dark", c.dark);
      el.style.setProperty("--color-accent", c.accent);
      // Glass gradient colors — adapt to current theme color and mode
      const a1 = mode === "dark" ? 0.09 : 0.05;
      const a2 = mode === "dark" ? 0.04 : 0.02;
      el.style.setProperty("--glass-glow-1", hexToRgba(c.primary, a1));
      el.style.setProperty("--glass-glow-2", hexToRgba(c.primary, a2));
    }
    if (m) {
      // --color-base-* are a parallel set of variables that are never
      // overridden by glass component scopes.  Overlays (modals, shelf
      // menus) use them to restore opaque, readable colours even when
      // rendered inside a glass panel that has re-scoped --color-*.
      el.style.setProperty("--color-base-surface", m.surface);
      el.style.setProperty("--color-base-surface-alt", m.surfaceAlt);
      el.style.setProperty("--color-base-text", m.text);
      el.style.setProperty("--color-base-text-secondary", m.textSecondary);
      el.style.setProperty("--color-base-text-muted", m.textMuted);
      el.style.setProperty("--color-base-border", m.border);
      el.style.setProperty("--color-base-hover-bg-subtle", m.hoverBgSubtle);
      el.style.setProperty("--color-bg", m.bg);
      el.style.setProperty("--color-surface", m.surface);
      el.style.setProperty("--color-surface-alt", m.surfaceAlt);
      el.style.setProperty("--color-text", m.text);
      el.style.setProperty("--color-text-secondary", m.textSecondary);
      el.style.setProperty("--color-text-muted", m.textMuted);
      el.style.setProperty("--color-border", m.border);
      el.style.setProperty("--color-hover-bg", m.hoverBg);
      el.style.setProperty("--color-hover-bg-subtle", m.hoverBgSubtle);
      el.style.setProperty("--color-hover-bg-danger", m.hoverBgDanger);
    }
  }, [theme, mode, colors, modes]);

  return (
    <div className="sidebar-layout" data-mode={mode}>
      {/* Backdrop — clicking it closes the mobile sidebar */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " sidebar-overlay--open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar-top">
          <div className="sidebar-user">
            {/* Avatar shows the first letter of the username */}
            <div className="sidebar-user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="sidebar-user-name" title={username}>{username}</span>
          </div>

          <div>
            <h3>MyReads</h3>
            <nav>
              {/* `end` prevents the "/" route from also matching "/settings" */}
              <NavLink to="/" end onClick={() => setSidebarOpen(false)}>
                My Booklist
              </NavLink>
              <NavLink to="/settings" onClick={() => setSidebarOpen(false)}>
                Settings
              </NavLink>
            </nav>
          </div>
        </div>

        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <div className="sidebar-layout-content">
        {/* Topbar is hidden on desktop; visible on mobile to show hamburger */}
        <div className="sidebar-layout-topbar">
          <button
            className="sidebar-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            &#9776;
          </button>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default SidebarLayout;
