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

    if (!testCase) {
      res.write(`data: ${JSON.stringify({ error: 'Test case is required' })}\n\n`);
      res.end();
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: 'Gemini API key not configured' })}\n\n`);
      res.end();
      return;
    }

    const prompt = `Generate a ${framework || 'Playwright'} test script in ${language || 'JavaScript'} for the following test case:

Title: ${testCase.title || 'Test'}
Description: ${testCase.description || ''}
Preconditions: ${testCase.preconditions?.join(', ') || 'None'}

Steps:
${testCase.steps?.map((s, i) => `${i + 1}. ${s.action} - Expected: ${s.expectedResult}`).join('\n') || ''}

Expected Result: ${testCase.expectedResult || ''}

Generate a complete, runnable test script with:
- Proper imports and setup
- Clear comments
- Best practices for ${framework || 'Playwright'}
- Assertions for each step
- Proper cleanup

Return ONLY the code, no markdown formatting.`;

    // Use non-streaming for now to avoid complexity
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.write(`data: ${JSON.stringify({ error: `Gemini API error: ${response.status}` })}\n\n`);
      res.end();
      return;
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      res.write(`data: ${JSON.stringify({ error: 'No response from Gemini' })}\n\n`);
      res.end();
      return;
    }

    // Send the complete text as a stream
    const chunks = text.match(/.{1,100}/g) || [text];
    for (const chunk of chunks) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error generating script:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
