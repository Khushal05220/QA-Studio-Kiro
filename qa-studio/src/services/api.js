const BASE_URL = '/api';

class ApiService {
  constructor() {
    this.abortControllers = new Map();
  }

  async request(endpoint, options = {}) {
    const { retries = 3, backoff = 1000, ...fetchOptions } = options;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
          ...fetchOptions
        });
        
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 5;
          throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
        }
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        return response.json();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(r => setTimeout(r, backoff * Math.pow(2, attempt)));
      }
    }
  }

  async *streamRequest(endpoint, body, requestId) {
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);
    
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
        
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            yield JSON.parse(data);
          } catch (e) {
            yield { text: data };
          }
        }
      }
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  stopStream(requestId) {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  async healthCheck() {
    return this.request('/health');
  }

  async generateTestCases(input) {
    return this.request('/ai/generate-testcases', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  streamGenerateScript(input, requestId) {
    return this.streamRequest('/ai/generate-script', input, requestId);
  }

  async auditAccessibility(input) {
    return this.request('/ai/audit-accessibility', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async summarize(input) {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async generateAssertions(input) {
    return this.request('/ai/generate-assertions', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async elaborateText(input) {
    return this.request('/ai/elaborate', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async generateFromNotes(input) {
    return this.request('/ai/generate-from-notes', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async executeApiRequest(request) {
    return this.request('/proxy/execute', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  // CRUD operations
  async saveTestCases(testCases) {
    return this.request('/data/test-cases', {
      method: 'POST',
      body: JSON.stringify({ testCases })
    });
  }

  async getTestCases() {
    return this.request('/data/test-cases');
  }

  async saveUserStories(stories) {
    return this.request('/data/user-stories', {
      method: 'POST',
      body: JSON.stringify({ stories })
    });
  }

  async getUserStories() {
    return this.request('/data/user-stories');
  }

  async saveBugs(bugs) {
    return this.request('/data/bugs', {
      method: 'POST',
      body: JSON.stringify({ bugs })
    });
  }

  async getBugs() {
    return this.request('/data/bugs');
  }

  async saveTestPlans(plans) {
    return this.request('/data/test-plans', {
      method: 'POST',
      body: JSON.stringify({ plans })
    });
  }

  async getTestPlans() {
    return this.request('/data/test-plans');
  }

  async saveApiCollections(collections) {
    return this.request('/data/api-collections', {
      method: 'POST',
      body: JSON.stringify({ collections })
    });
  }

  async getApiCollections() {
    return this.request('/data/api-collections');
  }
}

export const apiService = new ApiService();
