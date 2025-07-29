const fetch = require('node-fetch');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://meditchguide.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
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

    console.log('Query:', query);

    // Optional: timeout fetch helper
    const fetchWithTimeout = (url, options, timeout = 10000) => {
      return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), timeout)
        ),
      ]);
    };

    const geminiResponse = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`,
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
                  text: `Réponds de façon concise et précise comme un ingenieur bimedical et technicien biomédical expert : … : ${query}`,
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
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Aucune réponse disponible.';

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
        error: "Erreur lors de la communication avec l'API.",
        details: error.message,
      }),
    };
  }
};
