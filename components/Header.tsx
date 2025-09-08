
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center p-4 md:p-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                This <span className="text-sky-400">vs.</span> That
            </h1>
            <p className="mt-2 text-lg text-slate-400">Compare Two Products - Powered by Google Gemini</p>
        </header>
    );
};

export default Header;
