
import React from 'react';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-slate-500 hover:text-sky-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700 focus:outline-none transition-all duration-300"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
        <div className="relative w-6 h-6">
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
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-700/60 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-sky-500 text-white p-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        This <span className="text-sky-500 dark:text-sky-400">vs.</span> That
                    </h1>
                </div>
                
                <div className="flex items-center gap-4">
                     <span className="hidden md:block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        AI Product Comparator
                    </span>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
        </header>
    );
};

export default Header;
