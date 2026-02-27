import React, { createContext, useContext } from 'react';
import { darkColors, Colors } from '../theme/colors';

interface ThemeContextType {
    colors: Colors;
    isDark: boolean;
    setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    colors: darkColors,
    isDark: true,
    setDarkMode: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Always use dark mode
    const theme = {
        colors: darkColors,
        isDark: true,
        setDarkMode: () => { }, // No-op function since theme cannot be changed
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
