export default function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Do NOT return the key itself. Just show presence for debugging.
    return response.status(200).json({ apiKeyPresent: !!process.env.API_KEY });
}
