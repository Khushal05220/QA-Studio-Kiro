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
    const { method, url, headers, body } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const startTime = Date.now();

    const fetchOptions = {
      method: method || 'GET',
      headers: headers || {}
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const responseTime = Date.now() - startTime;

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody, null, 2),
      time: responseTime
    });
  } catch (error) {
    console.error('Error executing API request:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to execute request',
      details: error.toString()
    });
  }
}
