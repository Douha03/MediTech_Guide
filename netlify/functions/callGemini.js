const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://meditechguide.netlify.app',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: 'Preflight OK',
        };
    }

    try {
        // Log the entire event for debugging
        console.log('Received event:', JSON.stringify(event, null, 2));

        // Parse request body
        let query;
        try {
            const body = JSON.parse(event.body || '{}');
            query = body.query;
            if (!query) {
                return {
                    statusCode: 400,
                    headers: {
                        'Access-Control-Allow-Origin': 'https://meditechguide.netlify.app',
                    },
                    body: JSON.stringify({ error: 'Query is required' }),
                };
            }
        } catch (parseError) {
            console.error('Error parsing event.body:', parseError.message);
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': 'https://meditechguide.netlify.app',
                },
                body: JSON.stringify({ error: 'Invalid request body' }),
            };
        }

        // Verify API key
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('GEMINI_API_KEY:', apiKey ? 'Set' : 'Not set');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        // Log the query being sent
        console.log('Requête envoyée à Gemini:', query);

        // Make API request to gemini-1.5-pro
        const response = await fetch(
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

        // Log response status and body
        console.log('Gemini API response status:', response.status);
        const responseText = await response.text();
        console.log('Gemini API response body:', responseText);

        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}: ${responseText}`);
        }

        // Parse response
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Error parsing Gemini API response:', parseError.message);
            throw new Error('Invalid response format from Gemini API');
        }

        // Extract text from response
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Aucune réponse disponible.';

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': 'https://meditechguide.netlify.app',
            },
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
        console.error('Erreur dans la fonction callGemini:', error.message);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://meditechguide.netlify.app',
            },
            body: JSON.stringify({
                error: 'Erreur lors de la communication avec l\'API.',
                details: error.message,
            }),
        };
    }
};
