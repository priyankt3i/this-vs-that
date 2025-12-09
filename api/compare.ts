import { GoogleGenAI, Type } from "@google/genai";

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

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { productOne, productTwo } = request.body;

    if (!productOne || !productTwo) {
        return response.status(400).json({ error: 'Missing product names' });
    }

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

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const data = JSON.parse(result.text.trim());
        return response.status(200).json(data);
    } catch (error) {
        console.error("API Error:", error);
        return response.status(500).json({ error: 'Failed to generate comparison' });
    }
}