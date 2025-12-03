import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const { userStory, context } = req.body;

    if (!userStory) {
      return res.status(400).json({ error: 'User story is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up markdown formatting
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const data = JSON.parse(text);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error generating test cases:', error);
    res.status(500).json({ error: error.message || 'Failed to generate test cases' });
  }
}
