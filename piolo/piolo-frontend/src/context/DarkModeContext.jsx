// src/context/DarkModeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext(null);

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('piolo-dark-mode');
    // Only respect saved value if user has explicitly toggled (piolo-dark-toggled flag)
    if (saved !== null && localStorage.getItem('piolo-dark-toggled') === 'true') return saved === 'true';
    // Default: light mode always
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('piolo-dark-mode', String(dark));
  }, [dark]);

  const toggleDark = () => {
    setDark(prev => {
      const next = !prev;
      localStorage.setItem('piolo-dark-mode', String(next));
      localStorage.setItem('piolo-dark-toggled', 'true');
      return next;
    });
  };

  return (
    <DarkModeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode doit être utilisé dans <DarkModeProvider>');
  return ctx;
}
