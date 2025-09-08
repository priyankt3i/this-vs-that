
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ProductInputForm from './components/ProductInputForm';
import ComparisonTable from './components/ComparisonTable';
import AiAnalysis from './components/AiAnalysis';
import Loader from './components/Loader';
import ErrorDisplay from './components/ErrorDisplay';
import { fetchComparison } from './services/geminiService';
import { ComparisonData, WittyCategoryMismatchError } from './types';

const App: React.FC = () => {
    const [productOne, setProductOne] = useState<string>('');
    const [productTwo, setProductTwo] = useState<string>('');
    const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isWittyError, setIsWittyError] = useState<boolean>(false);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productOne || !productTwo) return;

        setIsLoading(true);
        setError(null);
        setIsWittyError(false);
        setComparisonResult(null);

        try {
            const data = await fetchComparison(productOne, productTwo);
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
    
    const InitialStateView: React.FC = () => (
      <div className="text-center p-8 bg-slate-800/30 rounded-lg border-2 border-dashed border-slate-600">
        <h2 className="text-2xl font-semibold text-white mb-2">Ready to Compare?</h2>
        <p className="text-slate-400">Enter two products above to see a detailed, side-by-side comparison powered by Google Gemini AI.</p>
      </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
            <main className="container mx-auto px-4 py-8 flex-grow">
                <Header />
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
                        <div className="space-y-8">
                            <ComparisonTable data={comparisonResult} />
                            <AiAnalysis analysis={comparisonResult.analysis} />
                        </div>
                    )}
                </div>
            </main>
            <footer className="text-center p-8 mt-12 text-slate-500 text-sm">
                <div className="space-y-2">
                    <div>
                        <a href="#" className="hover:text-sky-400 transition-colors px-2">Privacy Policy</a>
                        <span className="text-slate-600">|</span>
                        <a href="#" className="hover:text-sky-400 transition-colors px-2">Copyright Notice</a>
                    </div>
                    <p>&copy; {new Date().getFullYear()} ThisVsThat. All Rights Reserved.</p>
                    <p className="pt-2 text-slate-600">Built by priyankt3i on Google AI Studio.</p>
                </div>
            </footer>
        </div>
    );
};

export default App;
