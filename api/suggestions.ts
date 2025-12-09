import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.STRING
    }
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { query } = request.body;

    if (!query || query.trim().length < 2) {
        return response.status(200).json([]);
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
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const data = JSON.parse(result.text.trim());
        return response.status(200).json(data);
    } catch (error) {
        console.error("API Error:", error);
        // Return empty array on error to keep UI resilient
        return response.status(200).json([]);
    }
}