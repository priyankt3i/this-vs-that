
import { GoogleGenAI, Modality } from "@google/genai";

let ai;
const getAi = () => {
    if (!ai) {
        if (!process.env.API_KEY) throw new Error('Server missing API key');
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        console.error('Server missing API_KEY env var.');
        return response.status(500).json({ error: 'Server configuration error' });
    }

    const { productName } = request.body;

    if (!productName) {
        return response.status(400).json({ error: 'Missing product name' });
    }

    const prompt = `
        Create a funny, child-like hand drawing of the product: "${productName}".
        The drawing style should look like it was made by a 5-year-old with crayons. It should be simple, colorful, and slightly silly, but still recognizable as the product.
        Crucially, you MUST include the following text phrase written somewhere clearly on the image, in a hand-written style that fits the drawing:
        ":P Google didn't let me use Google Search for images"
    `;

    try {
        const result = await getAi().models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of result.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                const imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
                return response.status(200).json({ imageUrl });
            }
        }
        
        return response.status(404).json({ error: 'No image generated' });
    } catch (error) {
        console.error(`Error generating placeholder image for ${productName}:`, error);
        return response.status(500).json({ error: 'Failed to generate image' });
    }
}
