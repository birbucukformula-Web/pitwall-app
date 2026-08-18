import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import "./ThemeToggle.css";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  const savedTheme =
    localStorage.getItem("pitwall-theme");

  if (
    savedTheme === "light" ||
    savedTheme === "dark"
  ) {
    return savedTheme;
  }

  return "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] =
    useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme,
    );

    localStorage.setItem(
      "pitwall-theme",
      theme,
    );
  }, [theme]);

  function toggleTheme() {
    setTheme((current) =>
      current === "light"
        ? "dark"
        : "light",
    );
  }

  return (
    <button
      className={`theme-toggle ${
        theme === "dark" ? "dark" : "light"
      }`}
      onClick={toggleTheme}
      aria-label="Tema değiştir"
      title={
        theme === "light"
          ? "Dark moda geç"
          : "Light moda geç"
      }
    >
      <span className="theme-toggle-slider" />

      <span className="theme-icon theme-icon-sun">
        <Sun size={15} />
      </span>

      <span className="theme-icon theme-icon-moon">
        <Moon size={15} />
      </span>
    </button>
  );
}