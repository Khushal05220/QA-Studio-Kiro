import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { Icons } from '../components/ui/Icons';
import { Spinner } from '../components/ui/Spinner';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);

const frameworks = [
  { id: 'playwright', name: 'Playwright', languages: ['typescript', 'python', 'java'] },
  { id: 'cypress', name: 'Cypress', languages: ['typescript', 'javascript'] },
  { id: 'selenium', name: 'Selenium', languages: ['python', 'java', 'javascript'] },
  { id: 'robot', name: 'Robot Framework', languages: ['robot'] }
];

const browsers = ['chromium', 'firefox', 'webkit'];

export function TestScriptGenerator() {
  const { addToast, state } = useApp();
  const [config, setConfig] = useState({
    framework: 'playwright',
    language: 'typescript',
    browser: 'chromium',
    headless: true,
    useFixtures: true,
    includeTestData: false
  });
  const [scenario, setScenario] = useState('');
  const [testData, setTestData] = useState('');
  const [code, setCode] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const codeRef = useRef(null);

  const selectedFramework = frameworks.find(f => f.id === config.framework);

  useEffect(() => {
    if (codeRef.current && code) {
      const lang = config.language === 'robot' ? 'plaintext' : config.language;
      try {
        codeRef.current.innerHTML = hljs.highlight(code, { language: lang }).value;
      } catch {
        codeRef.current.textContent = code;
      }
    }
  }, [code, config.language]);

  const handleGenerate = async () => {
    if (!scenario.trim()) {
      addToast('Please enter a test scenario', 'warning');
      return;
    }

    const id = Date.now().toString();
    setRequestId(id);
    setStreaming(true);
    setCode('');

    try {
      const stream = apiService.streamGenerateScript({
        framework: config.framework,
        language: config.language,
        browser: config.browser,
        headless: config.headless,
        useFixtures: config.useFixtures,
        scenario,
        testData: config.includeTestData ? testData : undefined
      }, id);

      for await (const chunk of stream) {
        if (chunk.text) {
          setCode(prev => prev + chunk.text);
        }
      }
      addToast('Script generated successfully', 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        addToast(error.message, 'error');
      }
    } finally {
      setStreaming(false);
      setRequestId(null);
    }
  };

  const handleStop = () => {
    if (requestId) {
      apiService.stopStream(requestId);
      setStreaming(false);
      addToast('Generation stopped', 'info');
    }
  };

  const handleRegenerate = () => {
    setCode('');
    handleGenerate();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    addToast('Copied to clipboard', 'success');
  };

  const handleDownload = () => {
    const extensions = { typescript: 'ts', javascript: 'js', python: 'py', java: 'java', robot: 'robot' };
    const ext = extensions[config.language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-script.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Script downloaded', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 overflow-auto h-full">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-2">AI Test Script Generator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Generate automation scripts with best practices for your framework</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Configuration</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Framework</label>
                <select
                  value={config.framework}
                  onChange={e => {
                    const fw = frameworks.find(f => f.id === e.target.value);
                    setConfig(prev => ({
                      ...prev,
                      framework: e.target.value,
                      language: fw?.languages[0] || 'typescript'
                    }));
                  }}
                  className="select"
                >
                  {frameworks.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Language</label>
                <select
                  value={config.language}
                  onChange={e => setConfig(prev => ({ ...prev, language: e.target.value }))}
                  className="select"
                >
                  {selectedFramework?.languages.map(l => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Browser</label>
                <select
                  value={config.browser}
                  onChange={e => setConfig(prev => ({ ...prev, browser: e.target.value }))}
                  className="select"
                >
                  {browsers.map(b => (
                    <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.headless}
                    onChange={e => setConfig(prev => ({ ...prev, headless: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                  />
                  <span className="text-sm text-gray-300">Headless</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.useFixtures}
                    onChange={e => setConfig(prev => ({ ...prev, useFixtures: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                  />
                  <span className="text-sm text-gray-300">Fixtures</span>
                </label>
              </div>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Test Scenario</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Write down the steps you want to automate in plain English. The more specific you are, the better the generated code will be.
            </p>
            <textarea
              placeholder="Go to google.com, search for 'Playwright framework', and assert the title contains 'Playwright'."
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              className="textarea min-h-[180px]"
              aria-label="Test scenario description"
            />
            
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Or try an example:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setScenario("Go to google.com, search for 'Playwright framework', and assert the title contains 'Playwright'.")}
                  className="btn-ghost text-xs px-3 py-1.5"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  Go to google.com...
                </button>
                <button
                  onClick={() => setScenario("Navigate to the Playwright website, click on 'Docs', and verify the page loads successfully.")}
                  className="btn-ghost text-xs px-3 py-1.5"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  Navigate to the Playwright website...
                </button>
                <button
                  onClick={() => setScenario("Visit example.com, fill in a login form with username 'testuser' and password 'password123', click submit, and verify successful login.")}
                  className="btn-ghost text-xs px-3 py-1.5"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  Visit example.com...
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeTestData}
                onChange={e => setConfig(prev => ({ ...prev, includeTestData: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
              />
              <span className="text-sm text-gray-300">Include test data (CSV format)</span>
            </label>

            {config.includeTestData && (
              <textarea
                placeholder="username,password,expected&#10;user1,pass123,success&#10;user2,wrongpass,failure"
                value={testData}
                onChange={e => setTestData(e.target.value)}
                className="textarea min-h-[100px] font-mono text-sm"
                aria-label="Test data in CSV format"
              />
            )}

            <div className="flex justify-end gap-2">
              {streaming ? (
                <button onClick={handleStop} className="btn-danger flex items-center gap-2">
                  <Icons.Stop className="w-4 h-4" /> Stop
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!scenario.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Icons.Sparkles className="w-4 h-4" /> Generate Script
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col min-h-[500px] rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                <Icons.Code className="w-4 h-4" style={{ color: '#a5b4fc' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {config.framework.charAt(0).toUpperCase() + config.framework.slice(1)}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {config.language}
                </span>
              </div>
              {streaming && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Spinner size="sm" />
                  <span>Generating...</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                disabled={!code}
                className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
                title="Copy code"
                aria-label="Copy code to clipboard"
              >
                <Icons.Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                disabled={!code}
                className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
                title="Download"
                aria-label="Download script file"
              >
                <Icons.Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleRegenerate}
                disabled={streaming || !scenario.trim()}
                className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                style={{ color: 'var(--text-secondary)' }}
                title="Regenerate"
                aria-label="Regenerate script"
              >
                <Icons.Refresh className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6" style={{ background: 'var(--bg-primary)' }}>
            {code ? (
              <pre className="text-sm leading-relaxed" style={{ margin: 0 }}>
                <code ref={codeRef} className="hljs" style={{ background: 'transparent', padding: 0 }}>{code}</code>
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                    <Icons.Code className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }} className="mb-2">Code will appear here</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Describe a test case, choose your framework, and click "Generate Code" to see the magic happen.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
