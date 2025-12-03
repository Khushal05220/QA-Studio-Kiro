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

    // Validate URL format
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!urlPattern.test(url)) {
      return res.status(400).json({ error: 'Please enter a valid URL (e.g., https://example.com)' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Try to fetch the actual website to verify it exists
    let pageContent = '';
    try {
      const pageResponse = await fetch(url, { 
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AccessibilityAudit/1.0)' },
        signal: AbortSignal.timeout(5000)
      });
      if (!pageResponse.ok) {
        return res.status(400).json({ error: `Cannot access URL: ${pageResponse.status} ${pageResponse.statusText}` });
      }
      pageContent = await pageResponse.text();
      pageContent = pageContent.substring(0, 10000); // Limit content size
    } catch (fetchError) {
      return res.status(400).json({ error: `Cannot access URL: ${fetchError.message}` });
    }

    const prompt = `Analyze this real webpage HTML for WCAG 2.1 AA accessibility issues:

URL: ${url}
HTML Content (first 10000 chars):
${pageContent}

Return accessibility audit results in this exact JSON format:
{
  "score": 75,
  "summary": "Brief summary based on actual HTML analysis",
  "findings": [
    {
      "id": "finding-1",
      "severity": "Error",
      "wcagGuideline": "1.1.1 Non-text Content",
      "title": "Specific issue found in the HTML",
      "description": "Description of the actual issue",
      "selector": "actual CSS selector from the HTML",
      "suggestedFix": "How to fix this specific issue",
      "snippet": "actual HTML snippet from the page"
    }
  ]
}

IMPORTANT:
- Analyze the ACTUAL HTML content provided
- severity MUST be "Error" or "Warning" only
- Include real selectors and snippets from the HTML
- Score 0-100 based on actual issues found

Return ONLY valid JSON.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    if (!response.ok) {
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
