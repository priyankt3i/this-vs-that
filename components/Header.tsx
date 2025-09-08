
import React from 'react';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-all duration-300"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        <div className="relative w-6 h-6">
            {/* Sun Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute inset-0 w-6 h-6 transition-transform duration-500 ease-in-out ${
                    theme === 'dark' ? 'transform rotate-90 scale-0' : 'transform rotate-0 scale-100'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {/* Moon Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`absolute inset-0 w-6 h-6 transition-transform duration-500 ease-in-out ${
                    theme === 'light' ? 'transform -rotate-90 scale-0' : 'transform rotate-0 scale-100'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </div>
    </button>
);


interface HeaderProps {
    theme: Theme;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
    return (
        <header className="relative text-center p-4 md:p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                This <span className="text-sky-500 dark:text-sky-400">vs.</span> That
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Compare Two Products - Powered by Google Gemini</p>
             <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
        </header>
    );
};

export default Header;