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
            // Only update suggestions if the input is still active, to prevent race conditions
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 animate-fade-in-down">
                <ul className="py-1 max-h-60 overflow-y-auto">
                    {loadingSuggestions && <li className="px-4 py-2 text-slate-500 dark:text-slate-400">Loading...</li>}
                    {!loadingSuggestions && suggestions.map((suggestion, index) => (
                        <li 
                            key={index} 
                            className="px-4 py-2 text-slate-800 dark:text-white hover:bg-sky-100 dark:hover:bg-sky-700 cursor-pointer transition-colors duration-150"
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseDown={(e) => e.preventDefault()} // Prevents input blur on click
                        >
                            {suggestion}
                        </li>
                    ))}
                    {!loadingSuggestions && !hasSuggestions && <li className="px-4 py-2 text-slate-500 dark:text-slate-400">No suggestions found</li>}
                </ul>
            </div>
        );
    };

    return (
        <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto" ref={formRef} noValidate>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative w-full">
                    <input
                        type="text"
                        value={productOne}
                        onChange={(e) => handleInputChange(e.target.value, setProductOne, 'one')}
                        onFocus={() => setActiveInput('one')}
                        placeholder="e.g., iPhone 15 Pro"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    {activeInput === 'one' && renderSuggestions()}
                </div>

                <span className="text-slate-500 dark:text-slate-400 font-bold text-2xl">vs</span>

                <div className="relative w-full">
                    <input
                        type="text"
                        value={productTwo}
                        onChange={(e) => handleInputChange(e.target.value, setProductTwo, 'two')}
                        onFocus={() => setActiveInput('two')}
                        placeholder="e.g., Samsung Galaxy S24 Ultra"
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    {activeInput === 'two' && renderSuggestions()}
                </div>
                
                <button
                    type="submit"
                    disabled={isLoading || !productOne || !productTwo}
                    className="w-full md:w-auto px-8 py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition duration-200 disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed shrink-0"
                >
                    Compare
                </button>
            </div>
        </form>
    );
};

export default ProductInputForm;