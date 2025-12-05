import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: async () => {},
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // 解析实际主题
  const resolvedTheme: "dark" | "light" =
    theme === "system" ? (systemColorScheme || "light") : theme;

  useEffect(() => {
    // 加载保存的主题
    AsyncStorage.getItem(storageKey).then((savedTheme) => {
      if (savedTheme && (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system")) {
        setThemeState(savedTheme as Theme);
      }
    });
  }, [storageKey]);

  const setTheme = async (newTheme: Theme) => {
    await AsyncStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const value: ThemeProviderState = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

