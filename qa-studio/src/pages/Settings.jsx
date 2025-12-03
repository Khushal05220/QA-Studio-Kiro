import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/ui/Icons';

const defaultSystemPrompts = {
  playwright: `You are an expert Playwright test automation engineer. Generate production-ready test code following these best practices:
- Use page.getByRole, getByLabel, getByText for locators (prefer accessibility-based selectors)
- Include proper setup and teardown
- Add meaningful assertions with clear error messages
- Parameterize test data when applicable
- Include comments explaining complex logic
- Use async/await properly
- Handle waits appropriately (avoid arbitrary timeouts)`,

  cypress: `You are an expert Cypress test automation engineer. Generate production-ready test code following these best practices:
- Use cy.get with data-testid or accessibility selectors
- Chain commands properly
- Include proper beforeEach/afterEach hooks
- Add meaningful assertions
- Use fixtures for test data
- Handle async operations correctly
- Include comments for clarity`,

  selenium: `You are an expert Selenium test automation engineer. Generate production-ready test code following these best practices:
- Use explicit waits instead of implicit waits
- Implement Page Object Model pattern
- Use proper locator strategies (prefer ID, name, CSS over XPath)
- Include proper setup and teardown
- Add meaningful assertions
- Handle exceptions gracefully
- Include comments explaining the test flow`,

  robot: `You are an expert Robot Framework test automation engineer. Generate production-ready test code following these best practices:
- Use keyword-driven approach
- Create reusable keywords
- Use proper resource files structure
- Include meaningful documentation
- Use variables for test data
- Follow Robot Framework naming conventions
- Add proper tags for test organization`,

  accessibility: `You are an expert accessibility auditor. Analyze the provided HTML and identify WCAG 2.1 compliance issues. For each issue:
- Identify the specific WCAG guideline violated
- Classify severity as Error (must fix) or Warning (should fix)
- Provide the exact HTML snippet causing the issue
- Suggest a specific fix with code example
Focus on: color contrast, keyboard navigation, ARIA labels, form labels, image alt text, heading hierarchy, focus indicators.`,

  testCases: `You are an expert QA engineer. Generate comprehensive test cases from the provided user story or requirements. Each test case must include:
- Unique ID
- Category (Functional, UI, Security, Performance, etc.)
- Clear title
- Priority (Critical, High, Medium, Low)
- Preconditions as an array
- Steps with stepNo, action, and optional data
- Expected result
- Relevant tags
- Estimated time in minutes
Return as a JSON array of test case objects.`
};

export function Settings() {
  const { state, dispatch, addToast, checkApiStatus } = useApp();
  const [settings, setSettings] = useState(state.settings);
  const [activePrompt, setActivePrompt] = useState('playwright');

  const handleSave = () => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
    addToast('Settings saved', 'success');
  };

  const handleReset = () => {
    setSettings({
      ...settings,
      systemPrompts: defaultSystemPrompts
    });
    addToast('System prompts reset to defaults', 'info');
  };

  const updatePrompt = (key, value) => {
    setSettings(prev => ({
      ...prev,
      systemPrompts: {
        ...prev.systemPrompts,
        [key]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6 overflow-auto h-full scrollbar-thin">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure backend endpoints, AI models, and system prompts</p>
      </div>

      <div className="card space-y-6">
        <h2 className="text-lg font-semibold text-white">Backend Configuration</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Backend URL</label>
            <input
              type="text"
              value={settings.backendUrl}
              onChange={e => setSettings(prev => ({ ...prev, backendUrl: e.target.value }))}
              className="input"
              placeholder="/api"
            />
            <p className="text-xs text-gray-500 mt-1">Base URL for API requests</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Default Model</label>
            <select
              value={settings.defaultModel}
              onChange={e => setSettings(prev => ({ ...prev, defaultModel: e.target.value }))}
              className="select"
            >
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.streamingEnabled}
              onChange={e => setSettings(prev => ({ ...prev, streamingEnabled: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            />
            <span className="text-sm text-gray-300">Enable streaming responses</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={checkApiStatus} className="btn-secondary flex items-center gap-2">
            <Icons.Refresh className="w-4 h-4" /> Test Connection
          </button>
          <span className={`text-sm ${
            state.apiStatus.status === 'connected' ? 'text-green-400' :
            state.apiStatus.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {state.apiStatus.status === 'connected' ? 'Connected' :
             state.apiStatus.status === 'degraded' ? 'Degraded' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">System Prompts</h2>
          <button onClick={handleReset} className="btn-ghost text-sm">
            <Icons.Refresh className="w-4 h-4 inline mr-1" /> Reset to Defaults
          </button>
        </div>
        
        <p className="text-sm text-gray-400">
          Customize the AI system prompts for different features. These prompts guide the AI's behavior and output format.
        </p>

        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
          {Object.keys(defaultSystemPrompts).map(key => (
            <button
              key={key}
              onClick={() => setActivePrompt(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePrompt === key
                  ? 'bg-teal-500/20 text-teal-400'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            {activePrompt.charAt(0).toUpperCase() + activePrompt.slice(1)} System Prompt
          </label>
          <textarea
            value={settings.systemPrompts?.[activePrompt] || defaultSystemPrompts[activePrompt]}
            onChange={e => updatePrompt(activePrompt, e.target.value)}
            className="textarea min-h-[300px] font-mono text-sm"
            placeholder="Enter system prompt..."
          />
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">Export Preferences</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              checked={settings.exportIncludeTimestamp !== false}
              onChange={e => setSettings(prev => ({ ...prev, exportIncludeTimestamp: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            />
            <span className="text-sm text-gray-300">Include timestamp in filenames</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              checked={settings.exportPrettyJson !== false}
              onChange={e => setSettings(prev => ({ ...prev, exportPrettyJson: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            />
            <span className="text-sm text-gray-300">Pretty print JSON exports</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-800 rounded-lg">
            <input
              type="checkbox"
              checked={settings.exportIncludeMetadata !== false}
              onChange={e => setSettings(prev => ({ ...prev, exportIncludeMetadata: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            />
            <span className="text-sm text-gray-300">Include metadata in exports</span>
          </label>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-white">Application Info</h2>
        
        <dl className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-800 rounded-lg">
            <dt className="text-gray-500">Version</dt>
            <dd className="text-gray-200 font-medium">1.0.0</dd>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <dt className="text-gray-500">Default Model</dt>
            <dd className="text-gray-200 font-medium">{settings.defaultModel}</dd>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <dt className="text-gray-500">API Status</dt>
            <dd className={`font-medium ${
              state.apiStatus.status === 'connected' ? 'text-green-400' : 'text-red-400'
            }`}>
              {state.apiStatus.status}
            </dd>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <dt className="text-gray-500">Last Model Used</dt>
            <dd className="text-gray-200 font-medium">{state.apiStatus.lastModel || 'N/A'}</dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setSettings(state.settings)}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button onClick={handleSave} className="btn-primary">
          <Icons.Save className="w-4 h-4 inline mr-1" /> Save Settings
        </button>
      </div>
    </div>
  );
}
