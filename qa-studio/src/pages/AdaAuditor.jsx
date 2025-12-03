import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { exportToJson, exportToPdf, exportToMarkdown } from '../services/export';
import { Icons } from '../components/ui/Icons';
import { Spinner, SkeletonCard } from '../components/ui/Spinner';

export function AdaAuditor() {
  const { addToast } = useApp();
  const [url, setUrl] = useState('');
  const [scope, setScope] = useState('single');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [results, setResults] = useState(null);
  const [keyPoints, setKeyPoints] = useState(null);
  const [expandedFindings, setExpandedFindings] = useState(new Set());

  const handleAudit = async () => {
    if (!url.trim()) {
      addToast('Please enter a URL to audit', 'warning');
      return;
    }

    setLoading(true);
    setResults(null);
    setKeyPoints(null);

    try {
      const result = await apiService.auditAccessibility({ url, scope });
      setResults(result);
      setExpandedFindings(new Set(result.findings?.slice(0, 3).map(f => f.id) || []));
      addToast('Audit completed', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGetKeyPoints = async () => {
    if (!results) return;
    
    setSummarizing(true);
    try {
      const result = await apiService.summarize({
        content: results,
        type: 'accessibility-audit'
      });
      setKeyPoints(result.summary);
      addToast('Key points generated', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSummarizing(false);
    }
  };

  const handleExportPdf = () => {
    if (!results) return;
    
    const sections = [
      { title: 'Summary', content: results.summary },
      ...(keyPoints ? [{ title: 'Key Points', content: keyPoints }] : []),
      ...results.findings.map(f => ({
        title: `${f.severity}: ${f.title}`,
        content: `WCAG: ${f.wcagGuideline}\nSelector: ${f.selector}\nSuggested Fix: ${f.suggestedFix}\n\nCode Snippet:\n${f.snippet}`
      }))
    ];
    
    exportToPdf('', `accessibility-audit-${Date.now()}`, {
      title: `Accessibility Audit Report - Score: ${results.score}/100`,
      sections
    });
    addToast('PDF report generated', 'success');
  };

  const handleExportJson = () => {
    if (!results) return;
    exportToJson(results, `accessibility-audit-${Date.now()}`);
    addToast('Exported as JSON', 'success');
  };

  const handleExportMarkdown = () => {
    if (!results) return;
    
    let md = `# Accessibility Audit Report\n\n`;
    md += `**URL:** ${url}\n`;
    md += `**Score:** ${results.score}/100\n\n`;
    md += `## Summary\n\n${results.summary}\n\n`;
    
    if (keyPoints) {
      md += `## Key Points\n\n${keyPoints}\n\n`;
    }
    
    md += `## Findings\n\n`;
    results.findings.forEach(f => {
      md += `### ${f.severity}: ${f.title}\n\n`;
      md += `- **WCAG Guideline:** ${f.wcagGuideline}\n`;
      md += `- **Selector:** \`${f.selector}\`\n`;
      md += `- **Suggested Fix:** ${f.suggestedFix}\n\n`;
      md += `\`\`\`html\n${f.snippet}\n\`\`\`\n\n`;
    });
    
    exportToMarkdown(md, `accessibility-audit-${Date.now()}`);
    addToast('Exported as Markdown', 'success');
  };

  const toggleFinding = (id) => {
    setExpandedFindings(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyFix = async (fix) => {
    await navigator.clipboard.writeText(fix);
    addToast('Fix copied to clipboard', 'success');
  };

  const errors = results?.findings?.filter(f => f.severity === 'Error') || [];
  const warnings = results?.findings?.filter(f => f.severity === 'Warning') || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">AI Accessibility Auditor</h1>
        <p className="text-gray-400">Analyze web pages for WCAG compliance and accessibility issues</p>
      </div>

      <div className="card space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">URL to Audit</label>
            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input"
              aria-label="URL to audit"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm text-gray-400 mb-1">Scope</label>
            <select
              value={scope}
              onChange={e => setScope(e.target.value)}
              className="select"
              aria-label="Audit scope"
            >
              <option value="single">Single Page</option>
              <option value="shallow">Shallow Crawl (depth 1)</option>
              <option value="deep">Deep Crawl (depth 2)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleAudit}
            disabled={loading || !url.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? <Spinner size="sm" /> : <Icons.Eye className="w-4 h-4" />}
            Run Audit
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && results && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card flex items-center justify-center">
              <ScoreGauge score={results.score} />
            </div>
            
            <div className="card md:col-span-2">
              <h2 className="font-semibold text-white mb-3">Summary</h2>
              <p className="text-gray-300">{results.summary}</p>
              
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-400">{errors.length} Errors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-gray-400">{warnings.length} Warnings</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleGetKeyPoints}
              disabled={summarizing}
              className="btn-secondary flex items-center gap-2"
            >
              {summarizing ? <Spinner size="sm" /> : <Icons.Sparkles className="w-4 h-4" />}
              Get Key Points
            </button>
            
            <div className="flex items-center gap-2">
              <button onClick={handleExportJson} className="btn-secondary text-sm">JSON</button>
              <button onClick={handleExportMarkdown} className="btn-secondary text-sm">Markdown</button>
              <button onClick={handleExportPdf} className="btn-accent text-sm flex items-center gap-1">
                <Icons.Download className="w-4 h-4" /> PDF Report
              </button>
            </div>
          </div>

          {keyPoints && (
            <div className="card bg-teal-500/10 border-teal-500/30">
              <h3 className="font-semibold text-teal-400 mb-2">Key Points</h3>
              <p className="text-gray-300 whitespace-pre-line">{keyPoints}</p>
            </div>
          )}

          {errors.length > 0 && (
            <div>
              <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                <Icons.XCircle className="w-5 h-5" /> Errors ({errors.length})
              </h3>
              <div className="space-y-2">
                {errors.map(finding => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    expanded={expandedFindings.has(finding.id)}
                    onToggle={() => toggleFinding(finding.id)}
                    onCopyFix={() => copyFix(finding.suggestedFix)}
                  />
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <Icons.AlertCircle className="w-5 h-5" /> Warnings ({warnings.length})
              </h3>
              <div className="space-y-2">
                {warnings.map(finding => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    expanded={expandedFindings.has(finding.id)}
                    onToggle={() => toggleFinding(finding.id)}
                    onCopyFix={() => copyFix(finding.suggestedFix)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreGauge({ score }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#eab308' : score >= 50 ? '#f97316' : '#ef4444';

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="12"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-sm text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

function FindingCard({ finding, expanded, onToggle, onCopyFix }) {
  const isError = finding.severity === 'Error';
  
  return (
    <div className={`card p-0 overflow-hidden border ${isError ? 'border-red-800' : 'border-yellow-800'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          {expanded ? <Icons.ChevronDown className="w-4 h-4 text-gray-400" /> : <Icons.ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className="font-medium text-gray-200">{finding.title}</span>
          <span className="badge-gray text-xs">{finding.wcagGuideline}</span>
        </div>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Selector</p>
            <code className="text-sm text-teal-400 bg-gray-800 px-2 py-1 rounded">{finding.selector}</code>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Code Snippet</p>
            <pre className="text-sm text-gray-300 bg-gray-950 p-3 rounded overflow-x-auto">
              <code>{finding.snippet}</code>
            </pre>
          </div>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Suggested Fix</p>
              <p className="text-sm text-gray-300">{finding.suggestedFix}</p>
            </div>
            <button
              onClick={onCopyFix}
              className="btn-ghost p-2 flex-shrink-0"
              title="Copy fix"
              aria-label="Copy suggested fix"
            >
              <Icons.Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
