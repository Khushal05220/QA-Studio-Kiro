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
    const { response: apiResponse, framework } = req.body;

    if (!apiResponse) {
      return res.status(400).json({ error: 'API response is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Generate comprehensive test assertions for the following API response using ${framework || 'Postman'}:

Response:
${JSON.stringify(apiResponse, null, 2)}

Generate assertions to verify:
- Status code
- Response time
- Content-Type header
- Response structure
- Data types
- Required fields
- Value validations
- Array lengths
- Nested objects

Return assertions in this JSON format:
{
  "assertions": [
    {
      "type": "status|header|body|performance",
      "description": "What is being tested",
      "code": "Actual assertion code for ${framework || 'Postman'}"
    }
  ]
}

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text in Gemini response');
    }

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(text);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating assertions:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate assertions',
      details: error.toString()
    });
  }
}
