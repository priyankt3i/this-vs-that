import React from 'react';

interface ErrorDisplayProps {
    message: string;
    isWitty?: boolean;
}

const WittyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-6 text-amber-500 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);


const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, isWitty = false }) => {
    const parts = message.split('\n');
    const title = parts[0];
    const subtext = parts.length > 1 ? parts.slice(1).join('\n') : null;

    const baseClasses = "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border-2 animate-fade-in";
    
    const errorClasses = "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/50 text-red-800 dark:text-red-300";
    const wittyClasses = "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-500/50 text-amber-800 dark:text-amber-200";
    
    const titleClasses = "text-2xl md:text-3xl font-bold block";
    const subtextClasses = "block mt-3 text-lg text-slate-600 dark:text-slate-300 max-w-prose";

    return (
        <div className={`${baseClasses} ${isWitty ? wittyClasses : errorClasses}`} role="alert">
            {isWitty ? <WittyIcon /> : <ErrorIcon />}
            <strong className={titleClasses}>{title}</strong>
            {subtext && <span className={subtextClasses}>{subtext}</span>}
        </div>
    );
};

export default ErrorDisplay;