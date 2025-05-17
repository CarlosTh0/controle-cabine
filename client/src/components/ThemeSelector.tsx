import React, { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeSelector: React.FC = () => {
  // Estado para controlar o tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verifica se há preferência salva no localStorage
    const savedTheme = localStorage.getItem("theme");
    // Verifica se o navegador prefere modo escuro
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    return savedTheme ? savedTheme === "dark" : prefersDark;
  });

  // Aplica o tema quando o componente é carregado e quando muda
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    } else {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    }
    
    // Salva a preferência no localStorage
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9"
      aria-label="Alternar tema"
      title={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDarkMode ? (
        <SunIcon className="h-5 w-5 text-yellow-300" />
      ) : (
        <MoonIcon className="h-5 w-5 text-blue-100" />
      )}
    </Button>
  );
};

export default ThemeSelector;