
import React from 'react';
import { WinnerInfo } from '../types';

interface WinnerCardProps {
    data: WinnerInfo;
}

const TrophyIcon: React.FC = () => (
    <div className="relative">
        <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-40 rounded-full animate-pulse"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="relative h-16 w-16 text-yellow-300 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.28 2.28a1 1 0 00.72.3h3a1 1 0 011 1v3c0 .27.11.52.3.72L21 11m-3 10v-4m2 2h-4m-3 4l-2.28-2.28a1 1 0 00-.72-.3h-3a1 1 0 01-1-1v-3c0-.27-.11-.52-.3-.72L3 13" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" transform="rotate(45 12 12)" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-3 3-3-3" />
        </svg>
    </div>
);


const WinnerCard: React.FC<WinnerCardProps> = ({ data }) => {
    return (
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/20 my-8 group">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

            <div className="relative bg-slate-900/90 m-1 rounded-[1.3rem] p-8 md:p-12 text-center text-white backdrop-blur-md">
                <div className="flex flex-col items-center">
                    <TrophyIcon />
                    
                    <h2 className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
                        Official Verdict
                    </h2>
                    
                    <p className="mt-3 text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 drop-shadow-sm">
                        {data.winnerName}
                    </p>
                    
                    <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-rose-500 rounded-full my-8"></div>
                    
                    <blockquote className="max-w-3xl text-xl md:text-2xl font-medium leading-relaxed text-slate-200 font-serif italic">
                        "{data.winningReason}"
                    </blockquote>
                </div>
            </div>
        </div>
    );
};

export default WinnerCard;
