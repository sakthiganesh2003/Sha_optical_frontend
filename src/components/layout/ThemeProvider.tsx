'use client';

import * as React from 'react';

type Theme = 'light' | 'dark';

const Ctx = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {},
});

export function ThemeProvider({
  children,
  storageKey = 'optical-theme',
}: {
  children: React.ReactNode;
  storageKey?: string;
}) {
  const [theme, setTheme] = React.useState<Theme>('dark');

  // Hydrate from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    const resolved: Theme = stored === 'light' ? 'light' : 'dark';
    setTheme(resolved);
  }, [storageKey]);

  // Apply class to <html>
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(storageKey, next);
      return next;
    });
  };

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => React.useContext(Ctx);
