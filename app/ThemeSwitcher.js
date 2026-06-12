"use client";

import { useEffect, useState } from "react";

const storageKey = "jpspare-theme-mode";

function resolveTheme(mode) {
  if (mode === "light" || mode === "dark") return mode;
  return "light";
}

function applyTheme(mode) {
  const resolvedTheme = resolveTheme(mode);
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = resolvedTheme;
  return resolvedTheme;
}

function ThemeIcon({ name, className = "size-4" }) {
  if (name === "moon") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 13.4A8 8 0 1 1 10.6 3 6.4 6.4 0 0 0 21 13.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export default function ThemeSwitcher() {
  const [mode, setMode] = useState("light");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const storedMode = window.localStorage.getItem(storageKey);
    const initialMode = storedMode === "light" || storedMode === "dark" ? storedMode : "light";
    setMode(initialMode);
    setResolvedTheme(applyTheme(initialMode));
  }, []);

  function toggleTheme() {
    const nextMode = isDark ? "light" : "dark";
    setMode(nextMode);
    setResolvedTheme(nextMode);
    window.localStorage.setItem(storageKey, nextMode);
    applyTheme(nextMode);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-300 ${
        isDark
          ? "text-[#9ca3af] hover:bg-white/8 hover:text-[#f7d95f]"
          : "text-[#9ca3af] hover:bg-white/8 hover:text-[#f7d95f]"
      }`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      aria-pressed={isDark}
      title={`Theme: ${mode}`}
    >
      <ThemeIcon name={isDark ? "moon" : "sun"} className="size-[21px]" />
    </button>
  );
}
