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
    
    if (type === 'story') {
      prompt = `Convert these notes into a user story:

Notes: ${notes}

Return in this exact JSON format:
{
  "generated": {
    "title": "Brief descriptive title",
    "description": "Detailed description of the user story",
    "acceptanceCriteria": "- Criterion 1\\n- Criterion 2\\n- Criterion 3",
    "storyPoints": "3",
    "priority": "Medium",
    "epic": "Feature Area",
    "status": "New"
  }
}

Return ONLY valid JSON, no markdown formatting.`;
    } else if (type === 'bug') {
      prompt = `Convert these notes into a bug report:

Notes: ${notes}

Return in this exact JSON format:
{
  "generated": {
    "title": "Brief bug title",
    "description": "Detailed description of the bug",
    "stepsToReproduce": [
      {"step": 1, "description": "First step"},
      {"step": 2, "description": "Second step"},
      {"step": 3, "description": "Third step"}
    ],
    "severity": "Major",
    "priority": "High",
    "environment": "Chrome 120, Windows 11",
    "status": "New"
  }
}

Return ONLY valid JSON, no markdown formatting.`;
    } else {
      return res.status(400).json({ error: 'Type must be "story" or "bug"' });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
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
    console.error('Error generating from notes:', error);
    res.status(500).json({ error: error.message || 'Failed to generate from notes' });
  }
}
