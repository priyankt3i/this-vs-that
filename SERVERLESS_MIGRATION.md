# Serverless API Migration Guide

To secure your Google Gemini API Key in a production environment (like Vercel), you must stop making API calls directly from the browser (Client-Side) and switch to the Serverless Functions created in the `api/` folder.

## 1. Environment Variables

Ensure your Vercel project has the `API_KEY` environment variable set.
- Go to Vercel Project Settings > Environment Variables.
- Add `API_KEY` with your Google Gemini API key value.

## 2. Update `services/geminiService.ts`

Replace the entire content of `services/geminiService.ts` with the code below. This switches the logic from calling `@google/genai` directly to calling your new API endpoints.

```typescript
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
```

## 3. Install Dependencies for Server

Ensure your `package.json` includes `@google/genai`. Vercel will automatically install this when deploying your serverless functions.

```bash
npm install @google/genai
```

## 4. Deploy

Push your code to your git repository connected to Vercel. Vercel will automatically detect the `api/` folder and deploy them as serverless functions.
