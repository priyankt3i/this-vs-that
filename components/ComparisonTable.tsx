
import React from 'react';
import { ComparisonData } from '../types';

interface ComparisonTableProps {
    data: ComparisonData;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
    // Defensive check to prevent runtime errors if the comparison array is missing or empty.
    if (!data || !Array.isArray(data.comparison) || data.comparison.length === 0) {
        return (
            <div className="bg-slate-800/50 rounded-xl p-6 text-center text-slate-400 border border-slate-700">
                <p>No detailed comparison data is available for these products.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-800/50 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-white uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 w-1/4">
                                Feature
                            </th>
                            <th scope="col" className="px-6 py-4 w-3/8 text-sky-300">
                                {data.productOneName}
                            </th>
                            <th scope="col" className="px-6 py-4 w-3/8 text-amber-300">
                                {data.productTwoName}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.comparison.map((category, catIndex) => (
                            <React.Fragment key={catIndex}>
                                <tr className="bg-slate-900/70">
                                    <th colSpan={3} className="px-6 py-3 text-base font-semibold text-white">
                                        {category.category}
                                    </th>
                                </tr>
                                {category.features.map((feature, featIndex) => (
                                    <tr key={featIndex} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors duration-200">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span>{feature.featureName}</span>
                                                {feature.learnMoreUrl && (
                                                    <a
                                                        href={feature.learnMoreUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Learn more about this feature"
                                                        className="text-slate-500 hover:text-sky-400 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">
                                            {feature.productOneValue}
                                        </td>
                                        <td className="px-6 py-4">
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