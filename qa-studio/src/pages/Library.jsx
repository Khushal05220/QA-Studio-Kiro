import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Icons } from '../components/ui/Icons';
import { exportToJson, exportToCsv, exportToExcel } from '../services/export';
import { supabaseService } from '../services/supabaseService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Library Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-red-800 rounded-lg p-6 bg-red-900/20">
          <h3 className="text-red-400 font-semibold mb-2">Something went wrong</h3>
          <p className="text-red-300 text-sm mb-2">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const tabs = [
  { id: 'test-cases', label: 'Test Cases', icon: 'ClipboardList' },
  { id: 'user-stories', label: 'User Stories', icon: 'FileText' },
  { id: 'bugs', label: 'Bugs', icon: 'Bug' },
  { id: 'test-plans', label: 'Test Plans', icon: 'Document' },
  { id: 'api-collections', label: 'API Collections', icon: 'Server' }
];

export function Library() {
  const { state, dispatch, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('test-cases');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const getActiveData = () => {
    let data;
    switch (activeTab) {
      case 'test-cases': data = state.testCases; break;
      case 'user-stories': data = state.userStories; break;
      case 'bugs': data = state.bugs; break;
      case 'test-plans': data = state.testPlans; break;
      case 'api-collections': data = state.apiCollections; break;
      default: data = [];
    }
    
    // Ensure we always return an array
    if (!Array.isArray(data)) {
      console.error(`Invalid data for ${activeTab}:`, data);
      return [];
    }
    
    return data;
  };

  const filteredData = getActiveData().filter(item => {
    if (!item) return false;
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(item => item.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) {
      addToast('No items selected', 'warning');
      return;
    }
    
    const itemType = activeTab.replace(/-/g, ' ');
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} ${itemType}?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    const deleteCount = selectedIds.size;
    const idsToDelete = Array.from(selectedIds);
    
    try {
      switch (activeTab) {
        case 'test-cases':
          // Delete from Supabase first
          await supabaseService.deleteTestCases(idsToDelete);
          // Then update local state
          dispatch({ type: 'DELETE_TEST_CASES', payload: idsToDelete });
          break;
        case 'user-stories':
          // Delete from Supabase first
          await supabaseService.deleteUserStories(idsToDelete);
          // Then update local state
          selectedIds.forEach(id => dispatch({ type: 'DELETE_USER_STORY', payload: id }));
          break;
        case 'bugs':
          // Delete from Supabase first
          await supabaseService.deleteBugs(idsToDelete);
          // Then update local state
          selectedIds.forEach(id => dispatch({ type: 'DELETE_BUG', payload: id }));
          break;
        case 'test-plans':
          // Delete from Supabase first
          await supabaseService.deleteTestPlans(idsToDelete);
          // Then update local state
          selectedIds.forEach(id => dispatch({ type: 'DELETE_TEST_PLAN', payload: id }));
          break;
        default:
          addToast('Delete not supported for this item type', 'error');
          return;
      }
      
      setSelectedIds(new Set());
      addToast(`Deleted ${deleteCount} ${itemType}`, 'success');
    } catch (error) {
      console.error('Delete error:', error);
      addToast(`Failed to delete: ${error.message}`, 'error');
    }
  };

  const handleExport = (format) => {
    // Require selection for export
    if (selectedIds.size === 0) {
      addToast('Please select items to export', 'warning');
      return;
    }

    const data = filteredData.filter(item => selectedIds.has(item.id));
    
    if (data.length === 0) {
      addToast('No items selected for export', 'warning');
      return;
    }

    const filename = `${activeTab}-${Date.now()}`;
    
    try {
      switch (format) {
        case 'json': exportToJson(data, filename); break;
        case 'csv': exportToCsv(data, filename); break;
        case 'excel': exportToExcel(data, filename, activeTab); break;
        default: 
          addToast('Invalid export format', 'error');
          return;
      }
      
      addToast(`Exported ${data.length} selected item(s) as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addToast(`Export failed: ${error.message}`, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6 overflow-auto h-full scrollbar-thin">
      <div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Library</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage all your saved test artifacts</p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex overflow-x-auto scrollbar-thin">
            {tabs.map(tab => {
              const Icon = Icons[tab.icon];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedIds(new Set());
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent hover:text-gray-300'
                  }`}
                  style={{ color: activeTab === tab.id ? '#a5b4fc' : 'var(--text-muted)' }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              {filteredData.length > 0 && (
                <>
                  <button onClick={selectAll} className="btn-ghost text-sm">
                    {selectedIds.size === filteredData.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedIds.size > 0 && (
                    <>
                      <button onClick={handleDelete} className="btn-danger text-sm flex items-center gap-1">
                        <Icons.Trash className="w-4 h-4" /> Delete ({selectedIds.size})
                      </button>
                      <div className="h-6 w-px bg-gray-700" />
                    </>
                  )}
                  <button 
                    onClick={() => handleExport('json')} 
                    disabled={selectedIds.size === 0}
                    className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedIds.size > 0 ? `Export ${selectedIds.size} selected items as JSON` : 'Select items to export'}
                  >
                    <Icons.Download className="w-3 h-3" /> JSON
                  </button>
                  <button 
                    onClick={() => handleExport('csv')} 
                    disabled={selectedIds.size === 0}
                    className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedIds.size > 0 ? `Export ${selectedIds.size} selected items as CSV` : 'Select items to export'}
                  >
                    <Icons.Download className="w-3 h-3" /> CSV
                  </button>
                  <button 
                    onClick={() => handleExport('excel')} 
                    disabled={selectedIds.size === 0}
                    className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedIds.size > 0 ? `Export ${selectedIds.size} selected items as Excel` : 'Select items to export'}
                  >
                    <Icons.Download className="w-3 h-3" /> Excel
                  </button>
                </>
              )}
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.createElement(Icons[tabs.find(t => t.id === activeTab)?.icon || 'FileText'], {
                  className: 'w-8 h-8 text-gray-600'
                })}
              </div>
              <p className="text-gray-500 mb-2">No {activeTab.replace(/-/g, ' ')} found</p>
              <p className="text-sm text-gray-600">
                {searchQuery ? 'Try a different search term' : 'Start creating to see items here'}
              </p>
            </div>
          ) : (
            <ErrorBoundary>
              <div className="space-y-2">
                {activeTab === 'test-cases' && <TestCasesList items={filteredData} selectedIds={selectedIds} onToggle={toggleSelect} setSelectedIds={setSelectedIds} />}
                {activeTab === 'user-stories' && <UserStoriesList items={filteredData} selectedIds={selectedIds} onToggle={toggleSelect} />}
                {activeTab === 'bugs' && <BugsList items={filteredData} selectedIds={selectedIds} onToggle={toggleSelect} />}
                {activeTab === 'test-plans' && <TestPlansList items={filteredData} selectedIds={selectedIds} onToggle={toggleSelect} />}
                {activeTab === 'api-collections' && <ApiCollectionsList items={filteredData} selectedIds={selectedIds} onToggle={toggleSelect} />}
              </div>
            </ErrorBoundary>
          )}
        </div>
      </div>
    </div>
  );
}

function TestCasesList({ items, selectedIds, onToggle, setSelectedIds }) {
  const [expandedScenarios, setExpandedScenarios] = useState(new Set());
  const [expandedTestCases, setExpandedTestCases] = useState(new Set());

  // Group test cases by scenario (epic or a generated scenario key)
  const groupedByScenario = items.reduce((acc, tc) => {
    const scenarioKey = tc.epic || tc.scenarioTitle || 'Ungrouped Test Cases';
    if (!acc[scenarioKey]) {
      acc[scenarioKey] = [];
    }
    acc[scenarioKey].push(tc);
    return acc;
  }, {});

  const toggleScenario = (scenario) => {
    setExpandedScenarios(prev => {
      const next = new Set(prev);
      if (next.has(scenario)) next.delete(scenario);
      else next.add(scenario);
      return next;
    });
  };

  const toggleTestCase = (id) => {
    setExpandedTestCases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllInScenario = (testCases, e) => {
    e.stopPropagation();
    const allSelected = testCases.every(tc => selectedIds.has(tc.id));
    
    setSelectedIds(prev => {
      const next = new Set(prev);
      testCases.forEach(tc => {
        if (allSelected) {
          next.delete(tc.id);
        } else {
          next.add(tc.id);
        }
      });
      return next;
    });
  };

  return Object.entries(groupedByScenario).map(([scenario, testCases]) => {
    const allSelected = testCases.every(tc => selectedIds.has(tc.id));
    const someSelected = testCases.some(tc => selectedIds.has(tc.id));
    const isIndeterminate = someSelected && !allSelected;
    
    return <div key={scenario} className="border border-gray-800 rounded-lg overflow-hidden">
      {/* Scenario Header */}
      <div className="bg-gray-800/50 border-b border-gray-800">
        <div className="flex items-center gap-4 p-4">
          <input
            type="checkbox"
            checked={allSelected}
            ref={el => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onChange={(e) => selectAllInScenario(testCases, e)}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            title="Select all test cases in this scenario"
          />
          <button
            onClick={() => toggleScenario(scenario)}
            className="flex-1 flex items-center gap-3 text-left"
          >
            {expandedScenarios.has(scenario) 
              ? <Icons.ChevronDown className="w-5 h-5 text-gray-400" />
              : <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
            }
            <Icons.Folder className="w-5 h-5 text-teal-400" />
            <span className="font-semibold text-white">{scenario}</span>
            <span className="badge-teal ml-auto">{testCases.length} test case{testCases.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>

      {/* Test Cases under this scenario */}
      {expandedScenarios.has(scenario) && (
        <div className="divide-y divide-gray-800">
          {testCases.map(tc => (
            <div key={tc.id} className="bg-gray-900/20">
              <div className="flex items-center gap-4 p-4 pl-12">
                <input
                  type="checkbox"
                  checked={selectedIds.has(tc.id)}
                  onChange={() => onToggle(tc.id)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                />
                <button
                  onClick={() => toggleTestCase(tc.id)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  {expandedTestCases.has(tc.id) 
                    ? <Icons.ChevronDown className="w-4 h-4 text-gray-400" />
                    : <Icons.ChevronRight className="w-4 h-4 text-gray-400" />
                  }
                  <span className="font-medium text-white">{tc.title}</span>
                  {tc.category && <span className="badge-gray">{tc.category}</span>}
                  <span className={`badge ml-auto ${
                    tc.priority === 'Critical' ? 'badge-red' :
                    tc.priority === 'High' ? 'badge-yellow' :
                    tc.priority === 'Medium' ? 'badge-blue' : 'badge-gray'
                  }`}>
                    {tc.priority}
                  </span>
                </button>
              </div>
              {expandedTestCases.has(tc.id) && (
                <div className="p-4 pl-16 space-y-3 bg-gray-900/40">
                  {tc.preconditions?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Preconditions:</p>
                      <ul className="text-sm text-gray-400 list-disc list-inside">
                        {tc.preconditions.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Steps:</p>
                    <ol className="text-sm text-gray-300 space-y-1">
                      {tc.steps?.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-gray-500">{step.stepNo}.</span>
                          <span>{step.action}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expected Result:</p>
                    <p className="text-sm text-gray-300">{tc.expectedResult}</p>
                  </div>
                  {tc.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tc.tags.map((tag, i) => (
                        <span key={i} className="badge-teal">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  });
}

function UserStoriesList({ items, selectedIds, onToggle }) {
  if (!items || items.length === 0) return null;
  
  return items.map(story => {
    if (!story || !story.id) return null;
    
    return (
      <div key={story.id} className="border border-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={selectedIds.has(story.id)}
            onChange={() => onToggle(story.id)}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium text-white">{story.title || 'Untitled Story'}</h3>
              <div className="flex items-center gap-2">
                {story.status && <span className="badge-blue">{story.status}</span>}
                {story.priority && (
                  <span className={`badge ${
                    story.priority === 'Critical' ? 'badge-red' :
                    story.priority === 'High' ? 'badge-yellow' :
                    story.priority === 'Medium' ? 'badge-blue' : 'badge-gray'
                  }`}>
                    {story.priority}
                  </span>
                )}
              </div>
            </div>
            {story.description && <p className="text-sm text-gray-400">{story.description}</p>}
            {Array.isArray(story.acceptanceCriteria) && story.acceptanceCriteria.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Acceptance Criteria:</p>
                <ul className="text-sm text-gray-400 list-disc list-inside">
                  {story.acceptanceCriteria.map((ac, i) => <li key={i}>{ac}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(story.tags) && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {story.tags.map((tag, i) => (
                  <span key={i} className="badge-teal">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });
}

function BugsList({ items, selectedIds, onToggle }) {
  if (!items || items.length === 0) return null;
  
  try {
    return items.map((bug, index) => {
      if (!bug || !bug.id) {
        console.warn(`Invalid bug at index ${index}:`, bug);
        return null;
      }
      
      return (
        <div key={bug.id} className="border border-gray-800 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={selectedIds.has(bug.id)}
              onChange={() => onToggle(bug.id)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-medium text-white">{bug.title || 'Untitled Bug'}</h3>
                <div className="flex items-center gap-2">
                  {bug.status && <span className="badge-blue">{bug.status}</span>}
                  {bug.severity && (
                    <span className={`badge ${
                      bug.severity === 'Critical' ? 'badge-red' :
                      bug.severity === 'High' ? 'badge-yellow' :
                      bug.severity === 'Medium' ? 'badge-blue' : 'badge-gray'
                    }`}>
                      {bug.severity}
                    </span>
                  )}
                </div>
              </div>
              {bug.description && <p className="text-sm text-gray-400">{bug.description}</p>}
              {Array.isArray(bug.stepsToReproduce) && bug.stepsToReproduce.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Steps to Reproduce:</p>
                  <ol className="text-sm text-gray-400 list-decimal list-inside">
                    {bug.stepsToReproduce.map((step, i) => (
                      <li key={i}>
                        {typeof step === 'string' ? step : step.description || step.step || JSON.stringify(step)}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {bug.environment && (
                <p className="text-xs text-gray-500">Environment: <span className="text-gray-400">{bug.environment}</span></p>
              )}
            </div>
          </div>
        </div>
      );
    });
  } catch (error) {
    console.error('Error rendering bugs list:', error);
    return (
      <div className="border border-red-800 rounded-lg p-4 bg-red-900/20">
        <p className="text-red-400">Error loading bugs. Check console for details.</p>
      </div>
    );
  }
}

function TestPlansList({ items, selectedIds, onToggle }) {
  if (!items || items.length === 0) return null;
  
  return items.map(plan => {
    if (!plan || !plan.id) return null;
    
    return (
      <div key={plan.id} className="border border-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={selectedIds.has(plan.id)}
            onChange={() => onToggle(plan.id)}
            className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
          />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-medium text-white">{plan.name || 'Untitled Plan'}</h3>
              {plan.status && <span className="badge-blue">{plan.status}</span>}
            </div>
            {plan.description && <p className="text-sm text-gray-400">{plan.description}</p>}
            {Array.isArray(plan.testCases) && plan.testCases.length > 0 && (
              <p className="text-xs text-gray-500">
                {plan.testCases.length} test case{plan.testCases.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  });
}

function ApiCollectionsList({ items, selectedIds, onToggle }) {
  return items.map(collection => (
    <div key={collection.id} className="border border-gray-800 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={selectedIds.has(collection.id)}
          onChange={() => onToggle(collection.id)}
          className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
        />
        <div className="flex-1 space-y-2">
          <h3 className="font-medium text-white">{collection.name}</h3>
          {collection.requests?.length > 0 && (
            <p className="text-xs text-gray-500">
              {collection.requests.length} request{collection.requests.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  ));
}
