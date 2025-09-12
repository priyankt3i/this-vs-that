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
        winnerInfo: {
            type: Type.OBJECT,
            properties: {
                winnerName: { type: Type.STRING, description: "The name of the winning product." },
                winningReason: { type: Type.STRING, description: "A short, brutal, and funny reason why the winner was chosen over the loser." }
            }
        },
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

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { productOne, productTwo, action, query, productName } = req.body;

    if (action === 'fetchComparison') {
        try {
            const data = await fetchComparison(productOne, productTwo);
            return res.status(200).json(data);
        } catch (error: any) {
            if (error instanceof WittyCategoryMismatchError) {
                return res.status(400).json({ message: error.message, isMismatch: true });
            }
            return res.status(500).json({ message: error.message });
        }
    } else if (action === 'generatePlaceholderImage') {
        try {
            const imageUrl = await generatePlaceholderImage(productName);
            return res.status(200).json({ imageUrl });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    } else if (action === 'fetchSuggestions') {
        try {
            const suggestions = await fetchSuggestions(query);
            return res.status(200).json(suggestions);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    } else {
        return res.status(400).json({ message: 'Invalid action' });
    }
}

const fetchComparison = async (productOne: string, productTwo: string): Promise<ComparisonData> => {
    const prompt = `
        You are an expert product comparison AI named 'ThisVsThat'. Your goal is to provide a detailed, side-by-side technical comparison of two products provided by the user, followed by a contextual analysis, and finally, declare a winner.

        The user wants to compare: "${productOne}" and "${productTwo}".

        **Step 1: Sanity Check & Witty Remark**
        First, determine if these two products are in remotely comparable categories.
        - If they are from completely different, incomparable categories (e.g., a 'Smartphone' and a 'Car'), set 'isMismatch' to true, identify each product's category, and generate a short, funny, contextual 'wittyRemark' explaining why the comparison is absurd. If a mismatch is detected, STOP. Do not generate a comparison or analysis.
        - If they are comparable, set 'isMismatch' to false and proceed.

        **Step 2: Comparison Generation (only if not a mismatch)**
        Identify the shared product category. Generate a comprehensive list of relevant specifications for comparison. Find a high-quality, publicly accessible image URL for each product ('productOneImageUrl' and 'productTwoImageUrl'). If you cannot find an image, return an empty string for the URL. The analysis should be a funny, quirky but detailed summary explaining the key differences, pros, and cons.

        **Step 3: Declare a Winner (The Final Verdict)**
        After the analysis, you MUST choose a definitive winner between the two products.
        - Populate the 'winnerInfo' object.
        - 'winnerName' must be the exact name of the winning product.
        - 'winningReason' is the most important part. Write a short, brutal, and funny reason for your choice. It should decisively state why the winner is better by highlighting a key strength of the winner or a glaring weakness of the loser. Be opinionated and entertaining. For example: "The iPhone 15 Pro wins because its camera makes the Galaxy S24's photos look like they were taken with a potato."

        Your final output MUST be a single JSON object. Do not include any text outside of the JSON object.
    `;

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
};

const generatePlaceholderImage = async (productName: string): Promise<string | null> => {
    const prompt = `
        Create a funny, child-like hand drawing of the product: "${productName}".
        The drawing style should look like it was made by a 5-year-old with crayons. It should be simple, colorful, and slightly silly, but still recognizable as the product.
        Crucially, you MUST include the following text phrase written somewhere clearly on the image, in a hand-written style that fits the drawing:
        ":P Google didn't let me use Google Search for images"
    `;

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
};

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

const fetchSuggestions = async (query: string): Promise<string[]> => {
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
};
