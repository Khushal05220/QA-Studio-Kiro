import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { exportToJson, exportToCsv, exportToExcel } from '../services/export';
import { Icons } from '../components/ui/Icons';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';

const defaultUserStory = `As a user of an e-commerce website,
I want to be able to add multiple items to my shopping cart,
So that I can purchase them together in a single transaction.

Acceptance Criteria:
- A user can add an item to the cart from the product detail page.
- A user can add an item to the cart from the product listing page.
- The cart icon in the header should update with the correct number of items.
- If a user adds the same item multiple times, the quantity in the cart should update, not add a new line item.
- A user can view the items in their cart by clicking the cart icon.
- A user can remove an item from the cart.
- A user can change the quantity of an item in the cart.
- The cart should persist even if the user navigates away from the page and comes back later (session persistence).
- The cart subtotal, taxes, and total should be calculated and displayed correctly.
- The system should handle adding out-of-stock items gracefully (e.g., by displaying a message and not allowing the add-to-cart action).`;

export function TestCaseGenerator() {
  const { dispatch, addToast, saveToDatabase } = useApp();
  const [userStory, setUserStory] = useState(defaultUserStory);
  const [loading, setLoading] = useState(false);
  const [generatedCases, setGeneratedCases] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const handleGenerate = async () => {
    if (!userStory.trim()) {
      addToast('Please enter a user story or requirements', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.generateTestCases({
        userStory: userStory,
        title: '',
        epic: '',
        priority: 'Medium'
      });
      
      setGeneratedCases(result.testCases || []);
      addToast(`Generated ${result.testCases?.length || 0} test cases`, 'success');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => setUserStory('');

  const handleCellEdit = (testCaseId, field, value) => {
    setGeneratedCases(prev =>
      prev.map(tc => tc.id === testCaseId ? { ...tc, [field]: value } : tc)
    );
    setEditingCell(null);
  };

  const handleStepEdit = (testCaseId, stepIndex, value) => {
    setGeneratedCases(prev =>
      prev.map(tc => {
        if (tc.id === testCaseId) {
          const newSteps = [...(tc.steps || [])];
          newSteps[stepIndex] = { ...newSteps[stepIndex], action: value };
          return { ...tc, steps: newSteps };
        }
        return tc;
      })
    );
  };

  const handleExport = (format) => {
    if (generatedCases.length === 0) return;
    const filename = `test-cases-${Date.now()}`;
    switch (format) {
      case 'json': exportToJson(generatedCases, filename); break;
      case 'csv': exportToCsv(generatedCases, filename); break;
      case 'excel': exportToExcel(generatedCases, filename, 'Test Cases'); break;
    }
    addToast(`Exported ${generatedCases.length} test cases`, 'success');
  };

  const handleSaveClick = () => {
    if (generatedCases.length === 0) return;
    // Extract a default name from the first line of user story
    const firstLine = userStory.split('\n')[0].replace(/^As a.*?,?\s*/i, '').trim();
    setScenarioName(firstLine.slice(0, 50) || 'Test Cases');
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async () => {
    if (!scenarioName.trim()) {
      addToast('Please enter a scenario name', 'warning');
      return;
    }
    
    const timestamp = Date.now();
    const casesWithMeta = generatedCases.map((tc, index) => ({
      ...tc,
      id: `tc-${timestamp}-${index}`,
      scenarioTitle: scenarioName.trim(),
      generatedAt: new Date().toISOString()
    }));
    
    dispatch({ type: 'ADD_TEST_CASES', payload: casesWithMeta });
    
    try {
      const result = await saveToDatabase(casesWithMeta);
      if (result.success) {
        addToast(`Saved ${casesWithMeta.length} test cases to "${scenarioName}"`, 'success');
        setGeneratedCases([]);
        setShowSaveModal(false);
        setScenarioName('');
      }
    } catch (error) {
      addToast('Failed to save', 'error');
    }
  };

  const copyTable = () => {
    const text = generatedCases.map(tc => 
      `${tc.title}\n${tc.steps?.map(s => `  ${s.stepNo}. ${s.action}`).join('\n')}\nExpected: ${tc.expectedResult}`
    ).join('\n\n');
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard', 'success');
  };

  const positiveTests = generatedCases.filter(tc => {
    const category = tc.category?.toLowerCase() || '';
    return category.includes('functional') || 
           category.includes('positive') || 
           (!category.includes('negative') && !category.includes('error') && !category.includes('edge'));
  });
  
  const negativeTests = generatedCases.filter(tc => {
    const category = tc.category?.toLowerCase() || '';
    return category.includes('negative') || 
           category.includes('error') || 
           category.includes('edge');
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6 overflow-auto h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-2">AI Test Case Generator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Provide a detailed user story and acceptance criteria for more accurate and comprehensive test case generation.
        </p>
      </div>

      {/* Input Section */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white">User Story / Requirements</label>
          <button 
            onClick={handleClear} 
            className="text-xs hover:text-gray-300 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Clear
          </button>
        </div>
        
        <textarea
          value={userStory}
          onChange={e => setUserStory(e.target.value)}
          placeholder="Enter your user story or requirements here..."
          className="textarea min-h-[200px] font-mono text-sm"
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading || !userStory.trim()}
            className="btn-primary"
          >
            {loading ? <><Spinner size="sm" /> Generating...</> : <><Icons.Sparkles className="w-4 h-4" /> Generate Test Cases</>}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="card">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Generating test cases...</p>
            </div>
          </div>
        </div>
      ) : generatedCases.length === 0 ? (
        <div className="card">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                <Icons.ClipboardList className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-2">No test cases generated yet</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter a user story and click "Generate Test Cases"</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Generated Test Cases</h2>
              <span className="badge-primary">{generatedCases.length} total</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={copyTable} className="btn-ghost text-sm">
                <Icons.Copy className="w-4 h-4" /> Copy
              </button>
              <div className="relative group">
                <button className="btn-secondary text-sm">
                  <Icons.Download className="w-4 h-4" /> Export <Icons.ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[100px] overflow-hidden" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                  <button onClick={() => handleExport('json')} className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/5">JSON</button>
                  <button onClick={() => handleExport('csv')} className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/5">CSV</button>
                  <button onClick={() => handleExport('excel')} className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-white/5">Excel</button>
                </div>
              </div>
              <button onClick={handleSaveClick} className="btn-primary text-sm">
                <Icons.Save className="w-4 h-4" /> Save to Library
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg" style={{ background: 'var(--primary-light)', color: '#a5b4fc' }}>
            <Icons.Info className="w-4 h-4 flex-shrink-0" />
            <span>Click on any cell in the table below to edit its content.</span>
          </div>

          {/* Test Case Tables */}
          {positiveTests.length > 0 && (
            <TestCaseTable 
              title="Positive" 
              count={positiveTests.length}
              testCases={positiveTests}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              onCellEdit={handleCellEdit}
              onStepEdit={handleStepEdit}
            />
          )}

          {negativeTests.length > 0 && (
            <TestCaseTable 
              title="Negative" 
              count={negativeTests.length}
              testCases={negativeTests}
              editingCell={editingCell}
              setEditingCell={setEditingCell}
              onCellEdit={handleCellEdit}
              onStepEdit={handleStepEdit}
            />
          )}
        </div>
      )}

      {/* Save Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Test Cases"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Enter a name for this test scenario. This will help you organize and find these test cases in your library.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Scenario Name *</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g., User Login, Shopping Cart, Checkout Flow"
              className="input w-full"
              autoFocus
            />
          </div>
          <div className="text-sm text-gray-500">
            {generatedCases.length} test cases will be saved
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowSaveModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveConfirm} className="btn-primary">
              <Icons.Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TestCaseTable({ title, count, testCases, editingCell, setEditingCell, onCellEdit, onStepEdit }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card p-0 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white">{title}</span>
          <span className="badge-gray">{count}</span>
        </div>
        {expanded ? <Icons.ChevronUp className="w-5 h-5 text-gray-400" /> : <Icons.ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="overflow-x-auto" style={{ borderTop: '1px solid var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-28" style={{ color: 'var(--text-muted)' }}>ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-56" style={{ color: 'var(--text-muted)' }}>Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Steps</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-80" style={{ color: 'var(--text-muted)' }}>Expected Result</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc, index) => (
                <tr key={tc.id} className="hover:bg-white/5 transition-colors" style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-4 align-top">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      TC-{title.slice(0, 3).toUpperCase()}-{String(index + 1).padStart(3, '0')}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <EditableCell
                      value={tc.title}
                      isEditing={editingCell === `${tc.id}-title`}
                      onStartEdit={() => setEditingCell(`${tc.id}-title`)}
                      onSave={(value) => onCellEdit(tc.id, 'title', value)}
                      className="text-gray-200 font-medium"
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <ul className="space-y-1.5">
                      {tc.steps?.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex gap-2">
                          <span style={{ color: 'var(--text-muted)' }} className="flex-shrink-0">•</span>
                          <EditableCell
                            value={step.action}
                            isEditing={editingCell === `${tc.id}-step-${stepIndex}`}
                            onStartEdit={() => setEditingCell(`${tc.id}-step-${stepIndex}`)}
                            onSave={(value) => onStepEdit(tc.id, stepIndex, value)}
                            className="text-gray-300"
                          />
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <EditableCell
                      value={tc.expectedResult}
                      isEditing={editingCell === `${tc.id}-expected`}
                      onStartEdit={() => setEditingCell(`${tc.id}-expected`)}
                      onSave={(value) => onCellEdit(tc.id, 'expectedResult', value)}
                      className="text-gray-300"
                      multiline
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EditableCell({ value, isEditing, onStartEdit, onSave, className = '', multiline = false }) {
  const [editValue, setEditValue] = useState(value);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) onSave(editValue);
    if (e.key === 'Escape') { setEditValue(value); onSave(value); }
  };

  if (isEditing) {
    const inputStyle = { background: 'var(--bg-tertiary)', border: '1px solid var(--primary)', color: 'var(--text-primary)' };
    return multiline ? (
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => onSave(editValue)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full rounded px-2 py-1 text-sm focus:outline-none resize-none min-h-[80px]"
        style={inputStyle}
      />
    ) : (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => onSave(editValue)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full rounded px-2 py-1 text-sm focus:outline-none"
        style={inputStyle}
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className={`cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 py-0.5 transition-colors ${className}`}
      title="Click to edit"
    >
      {value || <span style={{ color: 'var(--text-muted)' }} className="italic">Click to add...</span>}
    </div>
  );
}
