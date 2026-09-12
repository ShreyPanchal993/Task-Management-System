import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
    theme: 'light',
    isDark: false,
    toggleTheme: () => {},
    setTheme: () => {},
});

const THEME_STORAGE_KEY = 'trackora-theme';

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        try {
            const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme === 'light' || savedTheme === 'dark') {
                return savedTheme;
            }
        } catch (e) {
            // localStorage not available
        }
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    const isDark = theme === 'dark';

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.style.colorScheme = 'dark';
        } else {
            root.classList.remove('dark');
            root.style.colorScheme = 'light';
        }

        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
            // localStorage error
        }
    }, [theme, isDark]);

    // Listen for OS color scheme changes if user hasn't explicitly set a preference
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const hasManualChoice = (() => {
                try {
                    return Boolean(localStorage.getItem(THEME_STORAGE_KEY));
                } catch {
                    return false;
                }
            })();

            if (!hasManualChoice) {
                setThemeState(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setTheme = (newTheme) => {
        if (newTheme === 'dark' || newTheme === 'light') {
            setThemeState(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
