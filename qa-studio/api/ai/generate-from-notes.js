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
    const { notes, type } = req.body;

    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    let prompt = '';
    
    if (type === 'user-story') {
      prompt = `Convert the following notes into a well-formatted user story:

Notes:
${notes}

Return in this JSON format:
{
  "title": "Brief title",
  "asA": "User role",
  "iWant": "Feature/action",
  "soThat": "Benefit/value",
  "acceptanceCriteria": ["criterion 1", "criterion 2"],
  "priority": "Critical|High|Medium|Low",
  "tags": ["tag1", "tag2"]
}

Return ONLY valid JSON, no markdown formatting.`;
    } else if (type === 'bug') {
      prompt = `Convert the following notes into a well-formatted bug report:

Notes:
${notes}

Return in this JSON format:
{
  "title": "Brief bug title",
  "description": "Detailed description",
  "stepsToReproduce": ["step 1", "step 2"],
  "expectedBehavior": "What should happen",
  "actualBehavior": "What actually happens",
  "severity": "Critical|Major|Minor|Trivial",
  "priority": "Critical|High|Medium|Low",
  "environment": "Browser/OS/version",
  "tags": ["tag1", "tag2"]
}

Return ONLY valid JSON, no markdown formatting.`;
    } else {
      prompt = `Convert the following notes into structured content:

Notes:
${notes}

Provide a clear, organized version of the content.`;
    }

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

    if (type === 'user-story' || type === 'bug') {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const data = JSON.parse(text);
      res.status(200).json(data);
    } else {
      res.status(200).json({ content: text.trim() });
    }
  } catch (error) {
    console.error('Error generating from notes:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate from notes',
      details: error.toString()
    });
  }
}
