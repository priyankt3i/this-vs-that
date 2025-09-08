import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ProductInputForm from './components/ProductInputForm';
import ComparisonTable from './components/ComparisonTable';
import AiAnalysis from './components/AiAnalysis';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import { fetchComparison, generatePlaceholderImage } from './services/geminiService';
import { ComparisonData, WittyCategoryMismatchError } from './types';
import { getRandomIntro } from './utils/wittyIntros';

type Theme = 'light' | 'dark';

const useTheme = (): [Theme, () => void] => {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedTheme = window.localStorage.getItem('theme') as Theme;
            if (storedTheme) {
                return storedTheme;
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark'; // Default for SSR or environments without localStorage
    });

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return [theme, toggleTheme];
};


const ImageWithPlaceholder: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
    const [imageError, setImageError] = useState(false);

    const handleError = () => {
        setImageError(true);
    };

    useEffect(() => {
        setImageError(false);
    }, [src]);

    if (!src || imageError) {
        return (
            <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="aspect-square w-full object-contain bg-white dark:bg-white/5 rounded-xl p-2 md:p-4 border-2 border-slate-200 dark:border-slate-700"
            onError={handleError}
        />
    );
};

const ComparisonHeader: React.FC<{ data: ComparisonData }> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-4 md:gap-8">
            <div className="md:col-span-2 flex flex-col items-center text-center">
                <ImageWithPlaceholder src={data.productOneImageUrl} alt={data.productOneName} />
                <h2 className="mt-4 text-xl md:text-2xl font-bold text-sky-600 dark:text-sky-300">{data.productOneName}</h2>
            </div>
            
            <div className="hidden md:flex md:col-span-1 items-center justify-center">
                <span className="text-5xl font-black text-slate-300 dark:text-slate-600 tracking-widest">VS</span>
            </div>

            <div className="md:col-span-2 flex flex-col items-center text-center">
                <ImageWithPlaceholder src={data.productTwoImageUrl} alt={data.productTwoName} />
                <h2 className="mt-4 text-xl md:text-2xl font-bold text-amber-600 dark:text-amber-300">{data.productTwoName}</h2>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [productOne, setProductOne] = useState<string>('');
    const [productTwo, setProductTwo] = useState<string>('');
    const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isWittyError, setIsWittyError] = useState<boolean>(false);
    const [introMessage, setIntroMessage] = useState<string>('');
    const [theme, toggleTheme] = useTheme();

    useEffect(() => {
        setIntroMessage(getRandomIntro());
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productOne || !productTwo) return;

        setIsLoading(true);
        setError(null);
        setIsWittyError(false);
        setComparisonResult(null);

        try {
            const data = await fetchComparison(productOne, productTwo);

            const placeholderPromises = [];
            if (!data.productOneImageUrl) {
                placeholderPromises.push(
                    generatePlaceholderImage(data.productOneName).then(img => {
                        data.productOneImageUrl = img || undefined;
                    })
                );
            }
            if (!data.productTwoImageUrl) {
                placeholderPromises.push(
                    generatePlaceholderImage(data.productTwoName).then(img => {
                        data.productTwoImageUrl = img || undefined;
                    })
                );
            }

            if (placeholderPromises.length > 0) {
                await Promise.all(placeholderPromises);
            }

            setComparisonResult(data);
        } catch (err: unknown) {
            if (err instanceof WittyCategoryMismatchError) {
                setError(err.message);
                setIsWittyError(true);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [productOne, productTwo]);
    
    const InitialStateView: React.FC = () => {
        if (!introMessage) return null;

        const parts = introMessage.split(': ');
        const title = parts[0] ? `${parts[0]}:` : "Ready to Compare?";
        const subtitle = parts.length > 1 ? parts.slice(1).join(': ') : "Let's find out who wins.";

        return (
            <div className="text-center p-8 bg-slate-100/30 dark:bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 animate-fade-in">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">{title}</h2>
                <p className="text-amber-600 dark:text-amber-400 font-serif italic text-xl">{subtitle}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen text-slate-900 dark:text-white font-sans flex flex-col">
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Header theme={theme} toggleTheme={toggleTheme} />
                <div className="mt-8">
                    <ProductInputForm
                        productOne={productOne}
                        setProductOne={setProductOne}
                        productTwo={productTwo}
                        setProductTwo={setProductTwo}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
                <div className="mt-12 max-w-7xl mx-auto">
                    {isLoading && <Loader />}
                    {error && <ErrorDisplay message={error} isWitty={isWittyError} />}
                    {!isLoading && !error && !comparisonResult && <InitialStateView />}
                    {comparisonResult && (
                        <div className="space-y-8 animate-fade-in">
                            <ComparisonHeader data={comparisonResult} />
                            <ComparisonTable data={comparisonResult} />
                            <AiAnalysis analysis={comparisonResult.analysis} />
                        </div>
                    )}
                </div>
            </main>
            <footer className="text-center p-8 mt-12 text-slate-500 dark:text-slate-500 text-sm">
                <div className="space-y-2">
                    <div>
                        <a href="#" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors px-2">Privacy Policy</a>
                        <span className="text-slate-400 dark:text-slate-600">|</span>
                        <a href="#" className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors px-2">Copyright Notice</a>
                    </div>
                    <p>&copy; {new Date().getFullYear()} ThisVsThat. All Rights Reserved.</p>
                    <p className="pt-2 text-slate-400 dark:text-slate-600">Built by priyankt3i on Google AI Studio.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;