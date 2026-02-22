/**
 * themes/index.js — Static theme data
 *
 * `colors`  — one entry per selectable color theme.
 *   Each entry is injected into CSS via SidebarLayout's useEffect:
 *     --color-primary, --color-dark, --color-accent
 *
 * `modes`   — light / dark display mode values.
 *   Each entry drives a full set of CSS variables:
 *     --color-bg, --color-surface, --color-text, --color-border, etc.
 *   SidebarLayout reads the active mode and writes every key to :root
 *   so the entire UI responds to a single mode change.
 */

export const colors = {
  green: {
    primary: "#2e7c31",
    dark: "#256428",
    accent: "#60ac5d",
  },
  blue: {
    primary: "#1565c0",
    dark: "#0d47a1",
    accent: "#42a5f5",
  },
  purple: {
    primary: "#6a1b9a",
    dark: "#4a148c",
    accent: "#ab47bc",
  },
  yellow: {
    primary: "#f9a825",
    dark: "#f57f17",
    accent: "#fdd835",
  },
};

export const modes = {
  light: {
    bg: "#f5f5f7",
    surface: "#ffffff",
    surfaceAlt: "#f9f9fb",
    text: "#1d1d1f",
    textSecondary: "#6e6e73",
    textMuted: "#a1a1a6",
    border: "#e5e5ea",
    hoverBg: "#e8e8ed",
    hoverBgSubtle: "#f2f2f7",
    hoverBgDanger: "#fdecea",
  },
  dark: {
    bg: "#0f0f0f",
    surface: "#1c1c1e",
    surfaceAlt: "#2c2c2e",
    text: "#f5f5f7",
    textSecondary: "#a1a1a6",
    textMuted: "#6e6e73",
    border: "#38383a",
    hoverBg: "#3a3a3c",
    hoverBgSubtle: "#2c2c2e",
    hoverBgDanger: "#4a1c1c",
  },
};
