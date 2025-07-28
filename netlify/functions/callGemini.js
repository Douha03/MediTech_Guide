const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { query } = JSON.parse(event.body || '{}');
        if (!query) {
            return {
                statusCode: 400,
                body: JSON.stringify({ response: 'Query is required' })
            };
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        const response = await fetch('/.netlify/functions/callGemini', { // Replace with actual Gemini API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Réponds comme un assistant médical expert en français, spécialisé dans les technologies médicales : ${query}` }]
                }]
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}`);
        }
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Aucune réponse disponible.';
        return {
            statusCode: 200,
            body: JSON.stringify({ response: text })
        };
    } catch (error) {
        console.error('Error in callGemini function:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ response: 'Erreur lors de la communication avec l\'API.' })
        };
    }
};
