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

    let responseBody = response.body;
    if (typeof responseBody === 'string' && responseBody.length > 1500) {
      responseBody = responseBody.substring(0, 1500) + '...';
    }

    const prompt = `Generate Postman test assertions for this API response:

Status: ${response.status}
Body: ${responseBody}

Return JSON:
{"assertions":[{"type":"status","description":"Status is ${response.status}","code":"pm.test('Status is ${response.status}', () => pm.response.to.have.status(${response.status}));"},{"type":"body","description":"Response is JSON","code":"pm.test('Response is JSON', () => pm.response.to.be.json);"}]}

Add 3-5 more relevant assertions. Return ONLY valid JSON.`;

    const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
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
