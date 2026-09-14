import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${isDark ? "theme-dark" : "theme-light"} ${className}`}
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      id="customer-theme-toggle-btn"
    >
      <div className="theme-toggle-icon-wrap">
        {isDark ? (
          <FiSun className="theme-icon icon-sun" />
        ) : (
          <FiMoon className="theme-icon icon-moon" />
        )}
      </div>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
