import { ReactNode, useEffect } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
  cssVariables?: Record<string, string>;
}

export const ThemeProvider = ({ children, cssVariables }: ThemeProviderProps) => {
  useEffect(() => {
    if (cssVariables) {
      const root = document.documentElement;
      Object.entries(cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [cssVariables]);

  return <>{children}</>;
};
