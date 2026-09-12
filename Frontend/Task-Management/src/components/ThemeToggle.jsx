import React from 'react';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`theme-toggle-btn ${className}`}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        >
            <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
                <LuSun
                    className={`absolute text-xl transition-all duration-300 transform ${
                        isDark
                            ? 'rotate-90 scale-0 opacity-0'
                            : 'rotate-0 scale-100 opacity-100 text-amber-500'
                    }`}
                />
                <LuMoon
                    className={`absolute text-xl transition-all duration-300 transform ${
                        isDark
                            ? 'rotate-0 scale-100 opacity-100 text-amber-300'
                            : '-rotate-90 scale-0 opacity-0'
                    }`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
