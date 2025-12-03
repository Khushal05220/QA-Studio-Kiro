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
    const { url, scope } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Perform a WCAG 2.1 AA accessibility audit for the website: ${url}

Analyze for accessibility issues and return results in this exact JSON format:
{
  "score": 75,
  "summary": "Brief summary of overall accessibility status",
  "findings": [
    {
      "id": "finding-1",
      "severity": "Error",
      "wcagGuideline": "1.1.1 Non-text Content",
      "title": "Images missing alt text",
      "description": "Several images on the page lack alternative text descriptions",
      "selector": "img.hero-image",
      "suggestedFix": "Add descriptive alt attributes to all images",
      "snippet": "<img src='hero.jpg' class='hero-image'>"
    }
  ]
}

IMPORTANT:
- severity MUST be either "Error" or "Warning" (not Critical/High/Medium/Low)
- Generate 5-10 realistic findings based on common accessibility issues
- Include a mix of Error and Warning severities
- Score should be 0-100 based on severity of issues found

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
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(text);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error auditing accessibility:', error);
    res.status(500).json({ error: error.message || 'Failed to audit accessibility' });
  }
}
