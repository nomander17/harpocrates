import { useState, useEffect, useRef } from "react";
import { Palette } from "lucide-react";
import { themes, applyTheme } from "../utils/themes";
import "./ThemeSwitcher.css";

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleThemeChange = (themeName) => {
    applyTheme(themeName);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "tomorrow";
    applyTheme(savedTheme);
  }, []);

  return (
    <div className="theme-switcher" ref={dropdownRef}>
      <button
        className="theme-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change theme"
      >
        <Palette />
      </button>
      {isOpen && (
        <div className="theme-dropdown">
          {Object.entries(themes).map(([themeKey, theme]) => (
            <button key={themeKey} onClick={() => handleThemeChange(themeKey)}>
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
