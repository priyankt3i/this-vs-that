import React from 'react';
import { WinnerInfo } from '../types';

interface WinnerCardProps {
    data: WinnerInfo;
}

const TrophyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.28 2.28a1 1 0 00.72.3h3a1 1 0 011 1v3c0 .27.11.52.3.72L21 11m-3 10v-4m2 2h-4m-3 4l-2.28-2.28a1 1 0 00-.72-.3h-3a1 1 0 01-1-1v-3c0-.27-.11-.52-.3-.72L3 13" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" transform="rotate(45 12 12)" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-3 3-3-3" />
    </svg>
);


const WinnerCard: React.FC<WinnerCardProps> = ({ data }) => {
    return (
        <div className="relative rounded-2xl overflow-hidden p-1 shadow-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500">
            <div className="bg-slate-800/90 dark:bg-slate-900/95 rounded-xl p-8 text-center text-white backdrop-blur-sm">
                <div className="flex flex-col items-center">
                    <TrophyIcon />
                    <h2 className="mt-4 text-sm font-bold uppercase tracking-widest text-amber-300">And The Winner Is...</h2>
                    <p className="mt-2 text-3xl md:text-4xl font-extrabold text-white">{data.winnerName}</p>
                    <div className="w-24 h-0.5 bg-amber-400/50 my-6"></div>
                    <blockquote className="max-w-2xl text-lg italic text-slate-300">
                        "{data.winningReason}"
                    </blockquote>
                </div>
            </div>
        </div>
    );
};

export default WinnerCard;
