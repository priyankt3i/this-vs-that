import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ComparisonData, WittyCategoryMismatchError } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        productOneName: { type: Type.STRING },
        productTwoName: { type: Type.STRING },
        productOneImageUrl: { type: Type.STRING, description: "A URL for a high-quality image of the first product." },
        productTwoImageUrl: { type: Type.STRING, description: "A URL for a high-quality image of the second product." },
        comparison: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    features: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                featureName: { type: Type.STRING },
                                productOneValue: { type: Type.STRING },
                                productTwoValue: { type: Type.STRING },
                                learnMoreUrl: { type: Type.STRING, description: "A URL to an external resource explaining this specific feature." }
                            },
                        },
                    },
                },
            },
        },
        analysis: { type: Type.STRING },
        categoryMismatch: {
            type: Type.OBJECT,
            properties: {
                isMismatch: { type: Type.BOOLEAN },
                productOneCategory: { type: Type.STRING },
                productTwoCategory: { type: Type.STRING },
                wittyRemark: { type: Type.STRING, description: "A witty, contextual remark generated if the products are incomparable." }
            }
        }
    },
};

export const fetchComparison = async (productOne: string, productTwo: string): Promise<ComparisonData> => {
    const prompt = `
        You are an expert product comparison AI named 'ThisVsThat'. Your goal is to provide a detailed, side-by-side technical comparison of two products provided by the user, followed by a contextual analysis.

        The user wants to compare: "${productOne}" and "${productTwo}".

        **Step 1: Sanity Check & Witty Remark**
        First, determine if these two products are in remotely comparable categories.
        - If they are from completely different, incomparable categories (e.g., a 'Smartphone' and a 'Car', or 'My Mom' vs 'My Dad'), set 'isMismatch' to true, identify each product's category, and generate a short, funny, contextual 'wittyRemark' explaining why the comparison is absurd. The remark should be tailored to the specific inputs and have a title and subtext separated by a newline. For example, for "My Mom" vs "My Dad", a good remark would be "This is Above My Pay Grade\\nMaybe try asking your therapist for a comparison chart?". If a mismatch is detected, STOP. Do not generate a comparison or analysis.
        - If they are comparable (e.g., two smartphones, two electric scooters), set 'isMismatch' to false, leave 'wittyRemark' as an empty string, and proceed to Step 2.

        **Step 2: Comparison Generation (only if not a mismatch)**
        Identify the shared product category (e.g., Electric Scooter, Smartphone, etc.).
        Based on the category, generate a comprehensive list of relevant specifications and features for comparison. For each feature, you MUST try to find and include a 'learnMoreUrl'. This should be a direct link to a high-quality, reputable external resource (like a manufacturer's page, a Wikipedia article, or a technical glossary) that explains the feature in more detail. If a relevant link cannot be found for a specific feature, omit the 'learnMoreUrl' field for that feature.
        Crucially, you must also find and provide a high-quality, publicly accessible image URL for each product. The fields for these must be 'productOneImageUrl' and 'productTwoImageUrl'. If you cannot find a suitable image for a product, return an empty string for its corresponding URL.
        The analysis should be a funny, quirky but detailed and should have contextual summary explaining the key differences, pros, and cons of each product. Conclude with a recommendation based on potential user needs. Keep is funny!

        Your final output MUST be a single JSON object. Do not include any text outside of the JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const data: ComparisonData = JSON.parse(jsonText);

        if (data.categoryMismatch?.isMismatch) {
            throw new WittyCategoryMismatchError(
                data.categoryMismatch.wittyRemark || "These items are not comparable, and the AI is speechless!"
            );
        }

        return data;
    } catch (error) {
        if (error instanceof WittyCategoryMismatchError) {
            throw error; // Re-throw the specific error for the frontend to catch
        }
        console.error("Error fetching comparison from Gemini API:", error);
        throw new Error("Failed to get a valid comparison from the AI. Please try different products or rephrase your request.");
    }
};

export const generatePlaceholderImage = async (productName: string): Promise<string | null> => {
    const prompt = `
        Create a funny, child-like hand drawing of the product: "${productName}".
        The drawing style should look like it was made by a 5-year-old with crayons. It should be simple, colorful, and slightly silly, but still recognizable as the product.
        Crucially, you MUST include the following text phrase written somewhere clearly on the image, in a hand-written style that fits the drawing:
        ":P Google didn't let me use Google Search for images"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error(`Error generating placeholder image for ${productName}:`, error);
        return null; 
    }
};

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const prompt = `
        You are an intelligent auto-complete service for a product comparison tool. Your goal is to help the user quickly find the exact product they are looking for.

        Based on the user's partial input: "${query}", provide a list of up to 5 precise product name suggestions that complete their query.

        Follow these rules:
        1.  **Prioritize direct completions:** The suggestions should start with the user's input if possible. For example, if the input is "iPhone 15", suggest "iPhone 15", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15 Pro Max".
        2.  **Include close variations:** If direct completions are limited, suggest very close variations or newer models of the same product line. For example, for "Segway Ninebot E2", suggest "Segway Ninebot E2 Pro", "Segway Ninebot E2 Plus".
        3.  **Avoid competitors:** Do NOT suggest products from different brands unless the user's query is very generic (e.g., "phone"). The primary goal is auto-completion, not discovery of alternatives.
        4.  **Format:** Return the suggestions as a JSON array of strings. If no relevant suggestions are found, return an empty array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const data: string[] = JSON.parse(jsonText);
        return data;
    } catch (error) {
        console.error("Error fetching suggestions from Gemini API:", error);
        // Return empty array on error to not break the UI
        return [];
    }
};