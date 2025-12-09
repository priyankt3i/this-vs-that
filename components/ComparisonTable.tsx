
import React from 'react';
import { ComparisonData } from '../types';

interface ComparisonTableProps {
    data: ComparisonData;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
    // Defensive check
    if (!data || !Array.isArray(data.comparison) || data.comparison.length === 0) {
        return (
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700">
                <p>No comparison data generated.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-black/30 border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300 border-collapse">
                    <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th scope="col" className="px-6 py-5 w-1/4 font-bold border-b border-slate-200 dark:border-slate-700">
                                Feature
                            </th>
                            <th scope="col" className="px-6 py-5 w-3/8 text-sky-600 dark:text-sky-400 font-extrabold text-base border-b border-l border-slate-200 dark:border-slate-700">
                                {data.productOneName}
                            </th>
                            <th scope="col" className="px-6 py-5 w-3/8 text-amber-600 dark:text-amber-400 font-extrabold text-base border-b border-l border-slate-200 dark:border-slate-700">
                                {data.productTwoName}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.comparison.map((category, catIndex) => (
                            <React.Fragment key={catIndex}>
                                <tr className="bg-slate-100/50 dark:bg-slate-900/50">
                                    <th colSpan={3} className="px-6 py-3 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                        {category.category}
                                    </th>
                                </tr>
                                {category.features.map((feature, featIndex) => (
                                    <tr key={featIndex} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-700/50 align-top">
                                            <div className="flex items-center gap-2">
                                                <span>{feature.featureName}</span>
                                                {feature.learnMoreUrl && (
                                                    <a
                                                        href={feature.learnMoreUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Learn more"
                                                        className="text-slate-300 hover:text-sky-500 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </th>
                                        <td className="px-6 py-4 border-b border-l border-slate-100 dark:border-slate-700/50 dark:border-l-slate-700 text-base align-top">
                                            {feature.productOneValue}
                                        </td>
                                        <td className="px-6 py-4 border-b border-l border-slate-100 dark:border-slate-700/50 dark:border-l-slate-700 text-base align-top">
                                            {feature.productTwoValue}
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonTable;
