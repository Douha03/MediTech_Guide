// /netlify/functions/callGemini.js

export async function handler(event) {
  try {
    const { query } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY; // récupère la clé depuis Netlify
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: query }]
            }
          ]
        })
      }
    );

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Aucune réponse générée.';

    return {
      statusCode: 200,
      body: JSON.stringify({ response: text })
    };
  } catch (error) {
    console.error('Erreur dans la fonction serverless Gemini :', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur lors de l\'appel Gemini.' })
    };
  }
}
