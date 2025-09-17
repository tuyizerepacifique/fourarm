import { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Create the context
const ThemeContext = createContext();

// Create a custom hook for using the context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Create the provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme; // Return the stored theme ('light' or 'dark')
    }
    
    // Fallback to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    // Store theme preference
    localStorage.setItem('theme', theme);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = useMemo(() => ({
    theme,
    isDark,
    toggleTheme
  }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export the context itself
export default ThemeContext;