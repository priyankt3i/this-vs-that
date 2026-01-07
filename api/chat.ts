
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, history, contextData } = request.body;

    if (!message || !contextData) {
        return response.status(400).json({ error: 'Missing message or context data' });
    }

    // Prepare system instruction with the comparison context
    const systemInstruction = `
        You are an expert product consultant helper for the "This vs. That" application.
        
        CONTEXT:
        The user has just generated a comparison between two products: "${contextData.productOneName}" and "${contextData.productTwoName}".
        
        Here is the detailed data from that comparison (JSON format):
        ${JSON.stringify(contextData)}
        
        YOUR ROLE:
        Answer the user's follow-up questions specifically based on the data provided above. 
        - Be concise, witty, and helpful. 
        - Use the specific specs provided in the 'comparison' array to back up your answers.
        - If the user asks about the winner, refer to the 'winnerInfo'.
        - Keep responses relatively short (under 100 words) unless a detailed explanation is requested.
        - If the user asks something completely unrelated to these products, gently steer them back to the comparison.
    `;

    // Map frontend history format to Gemini history format
    // Frontend: { role: 'user' | 'model', text: string }
    // Gemini: { role: 'user' | 'model', parts: [{ text: string }] }
    const formattedHistory = (history || []).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const chat = ai.chats.create({
            model: "gemini-3-flash-preview",
            config: {
                systemInstruction: systemInstruction,
            },
            history: formattedHistory
        });

        const result = await chat.sendMessage({
            message: message
        });

        return response.status(200).json({ text: result.text });

    } catch (error) {
        console.error("Chat API Error:", error);
        return response.status(500).json({ error: 'Failed to generate chat response' });
    }
}
