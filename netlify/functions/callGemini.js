const fetch = require('node-fetch');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://meditechguide.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'false'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: 'Preflight OK',
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const query = body.query;

        if (!query) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Query is required' }),
            };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Réponds comme un assistant médical expert en français, spécialisé dans les technologies médicales : ${query}`,
                                },
                            ],
                        },
                    ],
                }),
            }
        );

        const responseText = await geminiResponse.text();
        if (!geminiResponse.ok) {
            throw new Error(`Gemini API returned status ${geminiResponse.status}: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Aucune réponse disponible.';

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                candidates: [
                    {
                        content: {
                            parts: [{ text }],
                        },
                    },
                ],
            }),
        };
    } catch (error) {
        console.error('Erreur dans callGemini:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erreur lors de la communication avec l\'API.',
                details: error.message,
            }),
        };
    }
};
