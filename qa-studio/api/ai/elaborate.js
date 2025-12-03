export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Elaborate on the following text with more details and context:

${text}

${context ? `Context: ${context}` : ''}

Provide a detailed, comprehensive explanation that expands on the key points.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const elaborated = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!elaborated) {
      throw new Error('No text in Gemini response');
    }
    
    res.status(200).json({ elaborated: elaborated.trim() });
  } catch (error) {
    console.error('Error elaborating:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to elaborate',
      details: error.toString()
    });
  }
}
