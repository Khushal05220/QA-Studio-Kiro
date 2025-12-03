/**
 * Kiro Hook: Auto-generate API test assertions
 * 
 * Trigger: After API request is executed successfully
 * Action: Suggest relevant assertions based on response
 * 
 * This hook helps QA engineers by automatically suggesting
 * appropriate test assertions for API responses.
 */

module.exports = {
  name: 'Generate API Assertions',
  description: 'Automatically suggest assertions after API request execution',
  
  trigger: {
    type: 'api-response',
    condition: 'status === 200'
  },
  
  async execute(context) {
    const { response, request } = context;
    const suggestions = [];
    
    // Status code assertion
    suggestions.push({
      type: 'status',
      assertion: `expect(response.status).toBe(${response.status})`,
      description: 'Verify response status code'
    });
    
    // Response time assertion
    if (response.time < 1000) {
      suggestions.push({
        type: 'performance',
        assertion: `expect(response.time).toBeLessThan(1000)`,
        description: 'Verify response time is under 1 second'
      });
    }
    
    // Content-Type assertion
    if (response.headers['content-type']) {
      suggestions.push({
        type: 'header',
        assertion: `expect(response.headers['content-type']).toContain('application/json')`,
        description: 'Verify content type'
      });
    }
    
    // Body structure assertions (if JSON)
    if (typeof response.data === 'object') {
      const keys = Object.keys(response.data);
      suggestions.push({
        type: 'structure',
        assertion: `expect(response.data).toHaveProperty('${keys[0]}')`,
        description: 'Verify response structure'
      });
    }
    
    // Array length assertion
    if (Array.isArray(response.data)) {
      suggestions.push({
        type: 'data',
        assertion: `expect(response.data.length).toBeGreaterThan(0)`,
        description: 'Verify data is not empty'
      });
    }
    
    return {
      success: true,
      suggestions,
      message: `Generated ${suggestions.length} assertion suggestions`
    };
  }
};
