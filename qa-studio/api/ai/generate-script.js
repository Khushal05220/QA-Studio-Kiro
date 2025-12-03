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
    res.write(`data: ${JSON.stringify({ error: 'Method not allowed' })}\n\n`);
    res.end();
    return;
  }

  try {
    const { scenario, testCase, framework, language, browser, headless, useFixtures, testData } = req.body;

    // Support both scenario (from TestScriptGenerator) and testCase (from ApiTesting)
    const inputScenario = scenario || (testCase ? `${testCase.title}: ${testCase.description || ''}\nSteps: ${testCase.steps?.map(s => s.action).join(', ')}` : null);

    if (!inputScenario) {
      res.write(`data: ${JSON.stringify({ error: 'Scenario or test case is required' })}\n\n`);
      res.end();
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ error: 'Gemini API key not configured' })}\n\n`);
      res.end();
      return;
    }

    const prompt = `Generate a ${framework || 'Playwright'} test script in ${language || 'typescript'} for the following test scenario:

Scenario: ${inputScenario}

Configuration:
- Framework: ${framework || 'Playwright'}
- Language: ${language || 'typescript'}
- Browser: ${browser || 'chromium'}
- Headless: ${headless !== false}
- Use Fixtures: ${useFixtures !== false}
${testData ? `- Test Data:\n${testData}` : ''}

Generate a complete, runnable test script with:
- Proper imports and setup for ${framework || 'Playwright'}
- Clear comments explaining each step
- Best practices and patterns for ${framework || 'Playwright'}
- Proper assertions
- Error handling
- Cleanup/teardown

Return ONLY the code without any markdown formatting or code blocks.`;

    console.log('Calling Gemini API for script generation...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      res.write(`data: ${JSON.stringify({ error: `Gemini API error: ${response.status}` })}\n\n`);
      res.end();
      return;
    }

    const result = await response.json();
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      res.write(`data: ${JSON.stringify({ error: 'No response from Gemini' })}\n\n`);
      res.end();
      return;
    }

    // Clean up any markdown code blocks
    text = text.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();

    console.log('Script generated, length:', text.length);

    // Stream the response in chunks
    const chunkSize = 50;
    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(i, i + chunkSize);
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
