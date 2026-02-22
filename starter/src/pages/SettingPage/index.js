import { useSettings } from "../../components/contexts/Settings";
import "./index.css";

function SettingPage() {
  const { theme, mode, colors, changeTheme, changeMode } = useSettings();

  return (
    <div className="setting-page">
      <h2>Settings</h2>

      {/* Color theme — one circle per available palette */}
      <div className="setting-section">
        <h3>Color</h3>
        <div className="theme-circles">
          {Object.entries(colors).map(([name, c]) => (
            <button
              key={name}
              className={`theme-circle${theme === name ? " theme-circle--active" : ""}`}
              style={{ background: c.primary }}
              onClick={() => changeTheme(name)}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* Display mode — light / dark */}
      <div className="setting-section">
        <h3>Mode</h3>
        <div className="mode-toggles">
          <button
            className={`mode-btn${mode === "light" ? " mode-btn--active" : ""}`}
            onClick={() => changeMode("light")}
          >
            Light
          </button>
          <button
            className={`mode-btn${mode === "dark" ? " mode-btn--active" : ""}`}
            onClick={() => changeMode("dark")}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingPage;
