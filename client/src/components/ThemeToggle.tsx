import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9"
      aria-label="Alternar tema"
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5 text-blue-100" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-300" />
      )}
    </Button>
  );
};

export default ThemeToggle;