const fetch = require('node-fetch');

exports.handler = async (event) => {
    try {
        const { query } = JSON.parse(event.body || '{}');
        if (!query) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Query is required' })
            };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        console.log('Requête envoyée à Gemini:', query); // Log pour débogage

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `Réponds comme un assistant médical expert en français, spécialisé dans les technologies médicales : ${query}` }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Aucune réponse disponible.';

        console.log('Réponse reçue de Gemini:', text); // Log pour débogage

        return {
            statusCode: 200,
            body: JSON.stringify({
                candidates: [{
                    content: {
                        parts: [{ text }]
                    }
                }]
            })
        };
    } catch (error) {
        console.error('Erreur dans la fonction callGemini:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Erreur lors de la communication avec l\'API.',
                details: error.message
            })
        };
    }
};

