export default async function handler(req, res) {
  // Enable CORS
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
    console.log('Generate test cases request received');
    const { userStory, context } = req.body;
    console.log('User story:', userStory?.substring(0, 100));

    if (!userStory) {
      console.error('No user story provided');
      return res.status(400).json({ error: 'User story is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API key exists:', !!apiKey);
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not set');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Use direct REST API call instead of SDK
    const prompt = `You are a QA engineer. Generate comprehensive test cases for the following user story.

User Story:
${userStory}

${context ? `Additional Context:\n${context}` : ''}

Generate test cases in the following JSON format:
{
  "testCases": [
    {
      "id": "unique-id",
      "category": "Functional|Negative|Edge Case|Error Handling",
      "title": "Clear test case title",
      "priority": "Critical|High|Medium|Low",
      "preconditions": ["precondition 1", "precondition 2"],
      "steps": [
        {"step": 1, "action": "action description", "expectedResult": "expected result"}
      ],
      "expectedResult": "Overall expected result",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Generate a balanced mix of:
- Functional test cases (happy path)
- Negative test cases (invalid inputs, error conditions)
- Edge cases (boundary conditions, limits)
- Error handling test cases

Return ONLY valid JSON, no markdown formatting.`;

    console.log('Calling Gemini API via REST...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // Check for rate limit error
      if (response.status === 429 || errorText.includes('quota') || errorText.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait a moment and try again.',
          details: 'The Gemini API has a limit of 15 requests per minute on the free tier.'
        });
      }
      
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Gemini API responded successfully');
    
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No text in Gemini response');
    }
    
    console.log('Response text length:', text.length);

    // Clean up markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);
    console.log('Successfully parsed JSON, test cases:', data.testCases?.length);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating test cases:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to generate test cases',
      details: error.toString()
    });
  }
}
