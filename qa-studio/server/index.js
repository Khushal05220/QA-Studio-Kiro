import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory storage (replace with database in production)
const storage = {
  testCases: [],
  userStories: [],
  bugs: [],
  testPlans: [],
  apiCollections: []
};

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Initialize Gemini
let genAI = null;
let model = null;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function initializeGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set. AI features will be unavailable.');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log(`Gemini initialized with model: ${MODEL_NAME}`);
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error.message);
    return false;
  }
}

initializeGemini();

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const geminiConnected = !!model;
  res.json({
    status: 'ok',
    geminiConnected,
    model: geminiConnected ? MODEL_NAME : null,
    timestamp: new Date().toISOString()
  });
});

// System prompts
const systemPrompts = {
  testCases: `You are an expert QA engineer. Generate comprehensive test cases from the provided user story or requirements. 
Return ONLY a valid JSON array of test case objects with this exact structure:
[{
  "id": "TC-001",
  "category": "Functional",
  "title": "Test case title",
  "priority": "High",
  "preconditions": ["Precondition 1"],
  "steps": [{"stepNo": 1, "action": "Action description", "data": "optional test data"}],
  "expectedResult": "Expected outcome",
  "tags": ["tag1", "tag2"],
  "estimatedTimeMinutes": 5
}]

IMPORTANT: Generate a balanced mix of test cases with these categories:
- "Functional" - Happy path, positive scenarios (3-4 test cases)
- "Negative" - Invalid inputs, error handling, failure scenarios (2-3 test cases)
- "Edge Case" - Boundary conditions, limits, unusual scenarios (2-3 test cases)
- "Error Handling" - System errors, validation errors (1-2 test cases)

Generate 8-12 test cases total. Make sure to include BOTH positive AND negative test cases.`,

  script: {
    playwright: `Generate ONLY the code. No explanations, no markdown, no comments outside the code. Return clean, production-ready Playwright test code that can be copied and run directly. Use page.getByRole, getByLabel for locators. Include setup/teardown and meaningful assertions.`,
    cypress: `Generate ONLY the code. No explanations, no markdown, no comments outside the code. Return clean, production-ready Cypress test code that can be copied and run directly. Use cy.get with data-testid selectors. Include beforeEach/afterEach hooks.`,
    selenium: `Generate ONLY the code. No explanations, no markdown, no comments outside the code. Return clean, production-ready Selenium test code that can be copied and run directly. Use explicit waits and proper locator strategies.`,
    robot: `Generate ONLY the code. No explanations, no markdown, no comments outside the code. Return clean, production-ready Robot Framework test code that can be copied and run directly.`
  },

  accessibility: `You are an accessibility expert. Analyze the provided content and return a JSON object:
{
  "score": 0-100,
  "summary": "Brief summary of accessibility status",
  "findings": [{
    "id": "A11Y-001",
    "title": "Issue title",
    "wcagGuideline": "WCAG 2.1 guideline reference",
    "severity": "Error" or "Warning",
    "snippet": "<html snippet>",
    "selector": "CSS selector",
    "suggestedFix": "How to fix this issue"
  }]
}`,

  assertions: `Generate sensible API test assertions based on the request and response. Return a JSON array of assertion strings that can be used in test code.`,

  elaborate: `Elaborate and improve the provided text while maintaining its meaning. Make it more detailed and professional.`,

  generateFromNotes: `Parse the provided notes and generate a structured item. For user stories, include title, description, acceptanceCriteria, priority, and tags. For bugs, include title, description, stepsToReproduce, severity, priority, and environment. Return as JSON.`
};

// AI endpoint: Generate test cases
app.post('/api/ai/generate-testcases', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { userStory, title, epic, priority } = req.body;
    const prompt = `${systemPrompts.testCases}

User Story: ${userStory}
${title ? `Title: ${title}` : ''}
${epic ? `Epic: ${epic}` : ''}
${priority ? `Default Priority: ${priority}` : ''}

Generate test cases as a JSON array:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse test cases from AI response');
    }
    
    const testCases = JSON.parse(jsonMatch[0]);
    res.json({ testCases, model: MODEL_NAME });
  } catch (error) {
    console.error('Generate test cases error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI endpoint: Generate script (streaming)
app.post('/api/ai/generate-script', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { framework, language, browser, headless, useFixtures, scenario, testData, apiRequest } = req.body;
    
    const frameworkPrompt = systemPrompts.script[framework] || systemPrompts.script.playwright;
    
    let prompt = `${frameworkPrompt}

IMPORTANT: Return ONLY the code. No markdown code blocks, no explanations before or after, no "Here's the code" text. Just the raw code that can be copied directly into a file.

Framework: ${framework}
Language: ${language}
Browser: ${browser}
Headless: ${headless}
Use Fixtures: ${useFixtures}

Test Scenario:
${scenario}
${testData ? `\nTest Data (CSV):\n${testData}` : ''}
${apiRequest ? `\nAPI Request:\n${JSON.stringify(apiRequest, null, 2)}` : ''}

Output the code now:`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Generate script error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// AI endpoint: Accessibility audit
app.post('/api/ai/audit-accessibility', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { url, scope } = req.body;
    
    const prompt = `${systemPrompts.accessibility}

Analyze the accessibility of a webpage at: ${url}
Scope: ${scope}

Since I cannot actually fetch the webpage, generate a realistic accessibility audit report based on common issues found on typical websites. Include 5-8 findings with a mix of errors and warnings.

Return the JSON object:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse audit results');
    }
    
    const auditResult = JSON.parse(jsonMatch[0]);
    res.json(auditResult);
  } catch (error) {
    console.error('Accessibility audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI endpoint: Summarize
app.post('/api/ai/summarize', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { content, type } = req.body;
    
    const prompt = `Summarize the following ${type || 'content'} into clear, actionable bullet points:

${JSON.stringify(content)}

Provide a concise summary with key points:`;

    const result = await model.generateContent(prompt);
    res.json({ summary: result.response.text() });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI endpoint: Generate assertions
app.post('/api/ai/generate-assertions', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { request, response } = req.body;
    
    const prompt = `${systemPrompts.assertions}

Request: ${request.method} ${request.url}
Response Status: ${response.status}
Response Body: ${response.body}

Generate assertions as a JSON array of strings:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const assertions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    
    res.json({ assertions });
  } catch (error) {
    console.error('Generate assertions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI endpoint: Elaborate text
app.post('/api/ai/elaborate', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { text, context, field } = req.body;
    
    const prompt = `${systemPrompts.elaborate}

Context: ${context}
Field: ${field}
Original text: ${text}

Elaborated version:`;

    const result = await model.generateContent(prompt);
    res.json({ elaborated: result.response.text() });
  } catch (error) {
    console.error('Elaborate error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI endpoint: Generate from notes
app.post('/api/ai/generate-from-notes', async (req, res) => {
  if (!model) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }

  try {
    const { notes, type } = req.body;
    
    const prompt = `${systemPrompts.generateFromNotes}

Type: ${type}
Notes:
${notes}

Generate the structured ${type} as JSON:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse generated content');
    }
    
    res.json({ generated: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    console.error('Generate from notes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for API testing
app.post('/api/proxy/execute', async (req, res) => {
  try {
    const { method, url, headers, body } = req.body;
    const start = Date.now();
    
    const fetchOptions = {
      method,
      headers: headers || {}
    };
    
    if (body && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);
    const responseBody = await response.text();
    
    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: responseBody,
      time: Date.now() - start
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      statusText: 'Error',
      body: error.message,
      time: 0
    });
  }
});

// Data CRUD endpoints
app.get('/api/data/test-cases', (req, res) => res.json(storage.testCases));
app.post('/api/data/test-cases', (req, res) => {
  storage.testCases = req.body.testCases || [];
  res.json({ success: true });
});

app.get('/api/data/user-stories', (req, res) => res.json(storage.userStories));
app.post('/api/data/user-stories', (req, res) => {
  storage.userStories = req.body.stories || [];
  res.json({ success: true });
});

app.get('/api/data/bugs', (req, res) => res.json(storage.bugs));
app.post('/api/data/bugs', (req, res) => {
  storage.bugs = req.body.bugs || [];
  res.json({ success: true });
});

app.get('/api/data/test-plans', (req, res) => res.json(storage.testPlans));
app.post('/api/data/test-plans', (req, res) => {
  storage.testPlans = req.body.plans || [];
  res.json({ success: true });
});

app.get('/api/data/api-collections', (req, res) => res.json(storage.apiCollections));
app.post('/api/data/api-collections', (req, res) => {
  storage.apiCollections = req.body.collections || [];
  res.json({ success: true });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`QA Studio server running on http://localhost:${PORT}`);
  console.log(`Gemini API: ${model ? 'Connected' : 'Not configured'}`);
});
