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
    const { content, text, type } = req.body;
    const inputText = content || text;

    if (!inputText) {
      return res.status(400).json({ error: 'Content or text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    let prompt = '';
    
    if (type === 'accessibility-audit') {
      prompt = `Summarize this accessibility audit into key points:

${JSON.stringify(inputText, null, 2)}

Provide 3-5 bullet points highlighting:
- Most critical issues to fix
- Quick wins for improvement
- Overall accessibility status

Keep it concise and actionable.`;
    } else {
      prompt = `Summarize the following content concisely:

${typeof inputText === 'string' ? inputText : JSON.stringify(inputText, null, 2)}

Provide a clear, concise summary that captures the key points.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const summary = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!summary) {
      throw new Error('No response from Gemini');
    }
    
    res.status(200).json({ summary: summary.trim() });
  } catch (error) {
    console.error('Error summarizing:', error);
    res.status(500).json({ error: error.message || 'Failed to summarize' });
  }
}
