import React, { createContext, useContext } from 'react';

const darkTheme = {
  background: '#1e1e2f',
  surface: '#2a2d47',
  primary: '#ffa057',
  secondary: '#b8bcc8',
  text: '#ffffff',
  textSecondary: '#b8bcc8',
  border: '#3a3d5a',
  cardBackground: '#2a2d47',
  inputBackground: '#1e1e2f',
  accent: '#28a745',
  error: '#dc3545',
  shadow: 'rgba(0, 0, 0, 0.3)'
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  return (
    <div data-theme="dark">
      <ThemeContext.Provider value={{ theme: darkTheme, themeName: 'dark' }}>
        {children}
      </ThemeContext.Provider>
    </div>
  );
};