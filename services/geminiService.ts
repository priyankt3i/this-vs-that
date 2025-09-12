import { ComparisonData, WittyCategoryMismatchError } from '../types';

const callApi = async (action: string, body: Record<string, any>) => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...body }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.isMismatch) {
            throw new WittyCategoryMismatchError(errorData.message);
        }
        throw new Error(errorData.message || 'An unknown error occurred');
    }

    return response.json();
};

export const fetchComparison = async (productOne: string, productTwo: string): Promise<ComparisonData> => {
    return callApi('fetchComparison', { productOne, productTwo });
};

export const generatePlaceholderImage = async (productName: string): Promise<string | null> => {
    try {
        const data = await callApi('generatePlaceholderImage', { productName });
        return data.imageUrl;
    } catch (error) {
        console.error(`Error generating placeholder image for ${productName}:`, error);
        return null;
    }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.trim().length < 2) {
        return [];
    }
    try {
        return await callApi('fetchSuggestions', { query });
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};
