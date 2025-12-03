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
    const { url, html, wcagLevel } = req.body;

    if (!url && !html) {
      return res.status(400).json({ error: 'URL or HTML is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Perform a WCAG ${wcagLevel || '2.1 AA'} accessibility audit for the following URL:

${url || 'Website'}

Analyze for accessibility issues and return results in this JSON format:
{
  "score": number (0-100),
  "summary": "Brief summary of overall accessibility",
  "findings": [
    {
      "id": "unique-id",
      "severity": "Critical|High|Medium|Low",
      "wcagGuideline": "1.1.1 Non-text Content",
      "title": "Issue title",
      "description": "Detailed description",
      "selector": "CSS selector or element description",
      "suggestedFix": "How to fix this issue",
      "snippet": "Code example showing the issue"
    }
  ]
}

Focus on:
- Keyboard navigation
- Screen reader compatibility
- Color contrast (4.5:1 minimum)
- Alt text for images
- Form labels and ARIA
- Heading hierarchy
- Focus indicators
- Semantic HTML

Generate at least 5-10 realistic findings. Return ONLY valid JSON, no markdown formatting.`;

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
    console.error('Error auditing accessibility:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to audit accessibility',
      details: error.toString()
    });
  }
}
