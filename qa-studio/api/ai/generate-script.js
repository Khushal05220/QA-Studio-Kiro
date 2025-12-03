export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testCase, framework, language } = req.body;

    if (!testCase || !framework) {
      return res.status(400).json({ error: 'Test case and framework are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `Generate a ${framework} test script in ${language || 'JavaScript'} for the following test case:

Title: ${testCase.title}
Description: ${testCase.description || ''}
Preconditions: ${testCase.preconditions?.join(', ') || 'None'}

Steps:
${testCase.steps?.map((s, i) => `${i + 1}. ${s.action} - Expected: ${s.expectedResult}`).join('\n') || ''}

Expected Result: ${testCase.expectedResult}

Generate a complete, runnable test script with:
- Proper imports and setup
- Clear comments
- Best practices for ${framework}
- Assertions for each step
- Proper cleanup

Return ONLY the code, no markdown formatting.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`, {
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error generating script:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
