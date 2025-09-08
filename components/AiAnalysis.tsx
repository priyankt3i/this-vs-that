
import React from 'react';

interface AiAnalysisProps {
    analysis: string;
}

const AiAnalysis: React.FC<AiAnalysisProps> = ({ analysis }) => {
    return (
        <div className="bg-slate-800/50 rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Analysis
            </h2>
            <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white max-w-none whitespace-pre-wrap">
                {analysis}
            </div>
        </div>
    );
};

export default AiAnalysis;
