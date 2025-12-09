
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ProductInputForm from './components/ProductInputForm';
import ComparisonTable from './components/ComparisonTable';
import AiAnalysis from './components/AiAnalysis';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import WinnerCard from './components/WinnerCard';
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
        return 'dark'; 
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
            <div className="aspect-square w-full max-w-[240px] bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className="aspect-square w-full max-w-[240px] object-contain bg-white dark:bg-white rounded-2xl p-4 shadow-lg border border-slate-100 dark:border-slate-700"
            onError={handleError}
        />
    );
};

const ComparisonHeader: React.FC<{ data: ComparisonData }> = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-8 mb-8">
            <div className="md:col-span-2 flex flex-col items-center text-center animate-fade-in-left">
                <ImageWithPlaceholder src={data.productOneImageUrl} alt={data.productOneName} />
                <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white leading-tight">{data.productOneName}</h2>
                <div className="mt-2 h-1 w-12 bg-sky-500 rounded-full"></div>
            </div>
            
            <div className="hidden md:flex md:col-span-1 items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 font-black text-xl border-4 border-white dark:border-slate-900 shadow-inner">
                    VS
                </div>
            </div>

            <div className="md:col-span-2 flex flex-col items-center text-center animate-fade-in-right">
                <ImageWithPlaceholder src={data.productTwoImageUrl} alt={data.productTwoName} />
                <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white leading-tight">{data.productTwoName}</h2>
                <div className="mt-2 h-1 w-12 bg-amber-500 rounded-full"></div>
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

            // Parallel image generation/fetching if URL missing
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
            <div className="text-center p-12 animate-fade-in mt-12">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">{title}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xl font-light">{subtitle}</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans flex flex-col transition-colors duration-300 selection:bg-sky-500/30 selection:text-sky-900 dark:selection:text-sky-100">
            {/* Background Decorations */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-50 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-50 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-50 animate-blob animation-delay-4000"></div>
            </div>

            <Header theme={theme} toggleTheme={toggleTheme} />
            
            <main className="container mx-auto px-4 py-8 flex-grow relative z-10 flex flex-col items-center">
                <div className="w-full mt-6 md:mt-12">
                    <ProductInputForm
                        productOne={productOne}
                        setProductOne={setProductOne}
                        productTwo={productTwo}
                        setProductTwo={setProductTwo}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>
                
                <div className="w-full max-w-7xl mt-12">
                    {isLoading && <Loader />}
                    {error && <div className="mt-8"><ErrorDisplay message={error} isWitty={isWittyError} /></div>}
                    {!isLoading && !error && !comparisonResult && <InitialStateView />}
                    {comparisonResult && (
                        <div className="space-y-12 animate-fade-in pb-12">
                            <ComparisonHeader data={comparisonResult} />
                            <ComparisonTable data={comparisonResult} />
                            <AiAnalysis analysis={comparisonResult.analysis} />
                            {comparisonResult.winnerInfo && <WinnerCard data={comparisonResult.winnerInfo} />}
                        </div>
                    )}
                </div>
            </main>

            <footer className="relative z-10 text-center py-8 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} ThisVsThat. AI-Powered Product Analysis.</p>
                <div className="mt-2 flex justify-center space-x-4">
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</a>
                </div>
            </footer>
        </div>
    );
};

export default App;
