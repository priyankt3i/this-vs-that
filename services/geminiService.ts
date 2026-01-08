
import { ComparisonData, WittyCategoryMismatchError } from '../types';

// Helper to make API calls
const fetchFromApi = async (endpoint: string, body: any) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return response.json();
};

export const fetchComparison = async (productOne: string, productTwo: string): Promise<ComparisonData> => {
    try {
        const data: ComparisonData = await fetchFromApi('/api/compare', { productOne, productTwo });

        if (data.categoryMismatch?.isMismatch) {
            throw new WittyCategoryMismatchError(
                data.categoryMismatch.wittyRemark || "These items are not comparable, and the AI is speechless!"
            );
        }

        return data;
    } catch (error) {
        if (error instanceof WittyCategoryMismatchError) {
            throw error;
        }
        console.error("Error fetching comparison:", error);
        throw new Error("Failed to get a valid comparison from the server. Please try different products.");
    }
};

export const generatePlaceholderImage = async (productName: string): Promise<string | null> => {
    try {
        const data = await fetchFromApi('/api/placeholder', { productName });
        return data.imageUrl || null;
    } catch (error) {
        console.error(`Error generating placeholder image for ${productName}:`, error);
        return null;
    }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const data = await fetchFromApi('/api/suggestions', { query });
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};

export const sendChatMessage = async (
    message: string,
    history: { role: 'user' | 'model'; text: string }[],
    contextData: ComparisonData
): Promise<string> => {
    try {
        const data = await fetchFromApi('/api/chat', { message, history, contextData });
        return data.text || "I'm speechless!";
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw new Error('Failed to send chat message');
    }
};
