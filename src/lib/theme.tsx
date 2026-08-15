import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ReadingTheme = "light" | "dark" | "sepia";
export type ReadingSize = "small" | "medium" | "large";

const THEME_KEY = "dr-theme";
const SIZE_KEY = "dr-size";

type ThemeContextValue = {
  theme: ReadingTheme;
  size: ReadingSize;
  setTheme: (t: ReadingTheme) => void;
  setSize: (s: ReadingSize) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}")||"light";var s=localStorage.getItem("${SIZE_KEY}")||"medium";var e=document.documentElement;e.classList.remove("dark","sepia");if(t!=="light")e.classList.add(t);e.setAttribute("data-reading-size",s);}catch(_){}})();`;

function apply(theme: ReadingTheme, size: ReadingSize) {
  const el = document.documentElement;
  el.classList.remove("dark", "sepia");
  if (theme !== "light") el.classList.add(theme);
  el.setAttribute("data-reading-size", size);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ReadingTheme>("light");
  const [size, setSizeState] = useState<ReadingSize>("medium");

  useEffect(() => {
    const t = (localStorage.getItem(THEME_KEY) as ReadingTheme | null) ?? "light";
    const s = (localStorage.getItem(SIZE_KEY) as ReadingSize | null) ?? "medium";
    setThemeState(t);
    setSizeState(s);
    apply(t, s);
  }, []);

  const setTheme = useCallback(
    (t: ReadingTheme) => {
      setThemeState(t);
      localStorage.setItem(THEME_KEY, t);
      apply(t, size);
    },
    [size],
  );

  const setSize = useCallback(
    (s: ReadingSize) => {
      setSizeState(s);
      localStorage.setItem(SIZE_KEY, s);
      apply(theme, s);
    },
    [theme],
  );

  return (
    <ThemeContext.Provider value={{ theme, size, setTheme, setSize }}>{children}</ThemeContext.Provider>
  );
}

export function useReadingTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useReadingTheme must be used within ThemeProvider");
  return ctx;
}