
import React from 'react';

const SkeletonPulse: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-700/50 rounded ${className}`}></div>
);

const Loader: React.FC = () => {
    return (
        <div className="w-full space-y-8 animate-fade-in mt-8">
             {/* Header Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-8">
                <div className="md:col-span-2 flex flex-col items-center">
                    <SkeletonPulse className="w-full aspect-square max-w-[200px] rounded-xl mb-4" />
                    <SkeletonPulse className="h-8 w-1/2" />
                </div>
                <div className="hidden md:flex justify-center">
                    <SkeletonPulse className="w-16 h-16 rounded-full" />
                </div>
                <div className="md:col-span-2 flex flex-col items-center">
                     <SkeletonPulse className="w-full aspect-square max-w-[200px] rounded-xl mb-4" />
                    <SkeletonPulse className="h-8 w-1/2" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800">
                {/* Header Row */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                    <div className="w-1/3"><SkeletonPulse className="h-5 w-1/3" /></div>
                    <div className="w-1/3"><SkeletonPulse className="h-5 w-1/3" /></div>
                    <div className="w-1/3"><SkeletonPulse className="h-5 w-1/3" /></div>
                </div>
                {/* Rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex border-b border-slate-100 dark:border-slate-700/50 p-4">
                        <div className="w-1/3 pr-4"><SkeletonPulse className="h-4 w-3/4" /></div>
                        <div className="w-1/3 px-4"><SkeletonPulse className="h-4 w-full" /></div>
                        <div className="w-1/3 pl-4"><SkeletonPulse className="h-4 w-full" /></div>
                    </div>
                ))}
            </div>
            
            {/* Analysis Skeleton */}
            <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                 <SkeletonPulse className="h-8 w-48 mb-6" />
                 <div className="space-y-3">
                    <SkeletonPulse className="h-4 w-full" />
                    <SkeletonPulse className="h-4 w-full" />
                    <SkeletonPulse className="h-4 w-11/12" />
                    <SkeletonPulse className="h-4 w-full" />
                    <SkeletonPulse className="h-4 w-4/5" />
                 </div>
            </div>
        </div>
    );
};

export default Loader;
