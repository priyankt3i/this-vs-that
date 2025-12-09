
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { fetchSuggestions } from '../services/geminiService';

interface ProductInputFormProps {
    productOne: string;
    setProductOne: (value: string) => void;
    productTwo: string;
    setProductTwo: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
}

const ProductInputForm: React.FC<ProductInputFormProps> = ({
    productOne,
    setProductOne,
    productTwo,
    setProductTwo,
    onSubmit,
    isLoading
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [activeInput, setActiveInput] = useState<'one' | 'two' | null>(null);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    
    const debounceTimeout = useRef<number | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const getSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        setLoadingSuggestions(true);
        try {
            const result = await fetchSuggestions(query);
            if (activeInput !== null) {
                setSuggestions(result);
            }
        } catch (error) {
            console.error(error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    }, [activeInput]);

    const handleInputChange = (
        value: string,
        setter: (val: string) => void,
        inputIdentifier: 'one' | 'two'
    ) => {
        setter(value);
        setActiveInput(inputIdentifier);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.length < 2) {
            setSuggestions([]);
            return;
        }

        debounceTimeout.current = window.setTimeout(() => {
            getSuggestions(value);
        }, 500);
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        if (activeInput === 'one') {
            setProductOne(suggestion);
        } else if (activeInput === 'two') {
            setProductTwo(suggestion);
        }
        setSuggestions([]);
        setActiveInput(null);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                setActiveInput(null);
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderSuggestions = () => {
        const hasSuggestions = suggestions.length > 0;
        const showBox = loadingSuggestions || hasSuggestions;
        
        if (!activeInput || !showBox) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in-down">
                <ul className="py-1 max-h-60 overflow-y-auto">
                    {loadingSuggestions && <li className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">Loading suggestions...</li>}
                    {!loadingSuggestions && suggestions.map((suggestion, index) => (
                        <li 
                            key={index} 
                            className="px-4 py-3 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-150 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {suggestion}
                        </li>
                    ))}
                    {!loadingSuggestions && !hasSuggestions && <li className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm">No suggestions found</li>}
                </ul>
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl mx-auto relative z-10">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 md:p-8 border border-slate-100 dark:border-slate-700/50">
                <form onSubmit={onSubmit} className="flex flex-col gap-8" ref={formRef} noValidate>
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 relative">
                        {/* Input 1 */}
                        <div className="relative w-full group">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider ml-1">
                                First Contender
                            </label>
                            <input
                                type="text"
                                value={productOne}
                                onChange={(e) => handleInputChange(e.target.value, setProductOne, 'one')}
                                onFocus={() => setActiveInput('one')}
                                placeholder="e.g., iPhone 15 Pro"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-lg font-medium text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 placeholder:text-slate-400"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            {activeInput === 'one' && renderSuggestions()}
                        </div>

                        {/* VS Badge */}
                        <div className="shrink-0 relative z-10 -my-4 md:my-0 md:pt-6">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-sky-500 dark:to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg border-4 border-white dark:border-slate-800 transform transition-transform group-hover:scale-110">
                                VS
                            </div>
                        </div>

                        {/* Input 2 */}
                        <div className="relative w-full group">
                            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider ml-1">
                                Second Contender
                            </label>
                            <input
                                type="text"
                                value={productTwo}
                                onChange={(e) => handleInputChange(e.target.value, setProductTwo, 'two')}
                                onFocus={() => setActiveInput('two')}
                                placeholder="e.g., Galaxy S24 Ultra"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 text-lg font-medium text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 placeholder:text-slate-400"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            {activeInput === 'two' && renderSuggestions()}
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading || !productOne || !productTwo}
                        className="w-full md:w-auto md:self-center px-10 py-4 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-sky-500/30 focus:outline-none focus:ring-4 focus:ring-sky-500/40 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing Contenders...
                            </span>
                        ) : 'Start Comparison'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductInputForm;
