import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, Colors } from '../theme/colors';

interface ThemeContextType {
    colors: Colors;
    isDark: boolean;
    setDarkMode: (value: boolean) => void;
    toggleTheme: () => void;
}

const STORAGE_KEY = 'burxia.theme'; // 'dark' | 'light'

const ThemeContext = createContext<ThemeContextType>({
    colors: darkColors,
    isDark: true,
    setDarkMode: () => { },
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(true); // por defecto oscuro

    // Recupera la preferencia guardada al arrancar.
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then((v) => { if (v === 'light') setIsDark(false); else if (v === 'dark') setIsDark(true); })
            .catch(() => { });
    }, []);

    const setDarkMode = (value: boolean) => {
        setIsDark(value);
        AsyncStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light').catch(() => { });
    };

    const theme: ThemeContextType = {
        colors: isDark ? darkColors : lightColors,
        isDark,
        setDarkMode,
        toggleTheme: () => setDarkMode(!isDark),
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
