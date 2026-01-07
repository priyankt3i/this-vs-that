
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ComparisonData, WittyCategoryMismatchError } from '../types';

// Initialize the Gemini Client
// We use the client-side SDK directly here so the app works immediately.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- Schemas ---

const comparisonSchema = {
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

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

// --- API Functions ---

export const fetchComparison = async (productOne: string, productTwo: string): Promise<ComparisonData> => {
    const prompt = `
        You are an expert product comparison AI named 'ThisVsThat'. Your goal is to provide a detailed, side-by-side technical comparison make sure to include every and all technical, physical, specifications side by side, even small nuanced one. Basically the comparision should be detailed, however if one or the other product's details wasnt found mention it with a funny comical one liner like Here are several ways to phrase it, categorized by the "flavor" of the jab:

        The "Questionable Design" Jabs
        These are perfect if the product has a design quirk (like a hidden power switch or a weird layout) that makes it harder to use than it should be.

        "Data not found. It’s probably hidden in the same place as the 'Off' switch."

        "404: Even the internet can’t figure out how this thing is supposed to work."

        "No results. It seems the web is as confused by this design as I am."

        "Data missing. Maybe it's hiding under a keycap somewhere?"

        "This search returned nothing—kind of like the logic used in the design meeting."

        The "Corporate Logic" Jabs
        These take a shot at the company's priorities or their tendency to call a bug a "feature."

        "No data found. The makers probably consider this an 'enhanced mystery feature.'"

        "The internet is silent. Apparently, the devs spent the whole budget on the logo."

        "Error: Results missing. It likely requires a $50 proprietary dongle to see them."

        "Data not found. It must have been 'streamlined' out of existence."

        "Search failed. The product team is currently 'pivoting' away from providing answers."

        The "Brutally Honest" One-Liners
        Short, punchy, and a little bit salty.

        "Zero results. Even Google is ghosting this product."

        "The web is as empty as the user manual."

        "No data. It looks like the engineers forgot to finish this part, too."

        "404: Common sense not found (in the product or the search results)."

        "Searching... actually, let's just blame the manufacturer and call it a day."

        The "Punny" Route
        "This search was a mistake—much like the product’s UI."

        "We’re out of luck and the makers are out of ideas."

        "No data detected. Perhaps the designers were deflected by something shiny?"

        The user wants to compare: "${productOne}" and "${productTwo}".

        **Step 1: Sanity Check & Witty Remark**
        - If they are from completely different, incomparable categories (e.g., 'Smartphone' vs 'Banana'), set 'isMismatch' to true and generate a funny 'wittyRemark'. STOP there.
        - If they are comparable, set 'isMismatch' to false.

        **Step 2: Comparison (if not mismatch)**
        - Identify shared category.
        - Generate comprehensive features list.
        - Find high-quality image URLs if possible (or empty string).
        - Be nuanced and details in pointing out small differences pros and cons.
        -While Suggesting pros and cons, do mention who the product is for and if it would suite the user's use case.
        - Write a funny but detailed 'analysis'.

        **Step 3: Winner**
        - Decide a definitive winner.
        - Write a short, brutal, funny 'winningReason' (e.g., "Product A wins because Product B belongs in a museum."). while keeping in mind to critisize the loosing product only if it deserves too get shit on! Else keep you brutal remake more sportmanship.
    `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });

        const text = result.text;
        if (!text) throw new Error("Empty response from AI");
        
        const data = JSON.parse(text) as ComparisonData;

        if (data.categoryMismatch?.isMismatch) {
            throw new WittyCategoryMismatchError(
                data.categoryMismatch.wittyRemark || "These items are not comparable!"
            );
        }

        return data;
    } catch (error) {
        if (error instanceof WittyCategoryMismatchError) throw error;
        console.error("Comparison Error:", error);
        throw new Error("Failed to generate comparison. Please try again.");
    }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.trim().length < 2) return [];

    const prompt = `
        Auto-complete suggestions for product comparison.
        User input: "${query}".
        Provide up to 5 precise product names.
        Prioritize direct completions (e.g., "iPhone" -> "iPhone 15", "iPhone 14").
        Return JSON array of strings.
    `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const text = result.text;
        return text ? JSON.parse(text) : [];
    } catch (error) {
        console.error("Suggestion Error:", error);
        return [];
    }
};

export const generatePlaceholderImage = async (productName: string): Promise<string | null> => {
    const prompt = `
        Create a funny, child-like hand drawing of: "${productName}".
        Style: Crayon drawing by a 5-year-old. Simple, colorful, silly.
        Text requirement: You MUST write ":P Google didn't let me use Google Search for images" clearly on the drawing.
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        // Loop through parts to find the image
        for (const part of result.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Image Gen Error:", error);
        return null;
    }
};

export const sendChatMessage = async (
    message: string, 
    history: ChatMessage[], 
    contextData: ComparisonData
): Promise<string> => {
    const systemInstruction = `
        You are an expert product consultant helper for "This vs. That".
        
        CONTEXT:
        Comparison between "${contextData.productOneName}" and "${contextData.productTwoName}".
        Data: ${JSON.stringify(contextData)}
        
        ROLE:
        Answer follow-up questions based on this specific data.
        Be concise, witty, and helpful. Use the specs provided.
    `;

    // Format history for the SDK
    const formattedHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const chat = ai.chats.create({
            model: "gemini-3-flash-preview",
            config: { systemInstruction },
            history: formattedHistory
        });

        const result = await chat.sendMessage({ message });
        return result.text || "I'm speechless!";
    } catch (error) {
        console.error("Chat Error:", error);
        throw new Error("Failed to get chat response.");
    }
};
