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
    const { request, response } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Generate test assertions for this API response:

Request: ${request?.method || 'GET'} ${request?.url || ''}
Status: ${response.status}
Response Body:
${typeof response.body === 'string' ? response.body.substring(0, 2000) : JSON.stringify(response.body, null, 2).substring(0, 2000)}

Generate assertions in this exact JSON format:
{
  "assertions": [
    {
      "type": "status",
      "description": "Status code should be 200",
      "code": "pm.test('Status code is 200', function() { pm.response.to.have.status(200); });"
    },
    {
      "type": "body",
      "description": "Response should have required fields",
      "code": "pm.test('Has required fields', function() { var json = pm.response.json(); pm.expect(json).to.have.property('id'); });"
    }
  ]
}

Generate 5-8 meaningful assertions covering:
- Status code validation
- Response structure
- Data type checks
- Required field presence
- Value validations

Return ONLY valid JSON, no markdown formatting.`;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`Gemini API error: ${apiResponse.status}`);
    }

    const result = await apiResponse.json();
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(text);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating assertions:', error);
    res.status(500).json({ error: error.message || 'Failed to generate assertions' });
  }
}
