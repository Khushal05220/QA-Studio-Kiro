import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    let geminiConnected = false;
    let model = null;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        model = 'gemini-2.5-flash';
        geminiConnected = true;
      } catch (error) {
        console.error('Gemini connection failed:', error);
      }
    }

    res.status(200).json({
      status: 'ok',
      geminiConnected,
      model: geminiConnected ? model : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
