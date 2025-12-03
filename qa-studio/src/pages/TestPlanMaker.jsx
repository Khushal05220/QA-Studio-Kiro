import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToPdf, exportToJson } from '../services/export';
import { Icons } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';

const testTypes = ['Functional', 'Regression', 'Performance', 'Security', 'Accessibility', 'Integration', 'E2E'];

const emptyPlan = {
  id: '',
  title: '',
  scope: '',
  objectives: '',
  entryCriteria: '',
  exitCriteria: '',
  testTypes: [],
  schedule: { startDate: '', endDate: '' },
  resources: '',
  risks: '',
  traceabilityMatrix: []
};

export function TestPlanMaker() {
  const { state, dispatch, addToast } = useApp();
  const [plan, setPlan] = useState(emptyPlan);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [selectedStories, setSelectedStories] = useState([]);

  const handleChange = (field, value) => {
    setPlan(prev => ({ ...prev, [field]: value }));
  };

  const toggleTestType = (type) => {
    setPlan(prev => ({
      ...prev,
      testTypes: prev.testTypes.includes(type)
        ? prev.testTypes.filter(t => t !== type)
        : [...prev.testTypes, type]
    }));
  };

  const handleSave = () => {
    if (!plan.title.trim()) {
      addToast('Please enter a title', 'warning');
      return;
    }

    const newPlan = {
      id: plan.id || Date.now().toString(),
      name: plan.title, // Database expects 'name' not 'title'
      description: plan.scope || plan.objectives || '',
      testCases: selectedTestCases, // Store just the IDs
      status: 'draft',
      // Store additional fields in a metadata object if needed
      metadata: {
        scope: plan.scope,
        objectives: plan.objectives,
        entryCriteria: plan.entryCriteria,
        exitCriteria: plan.exitCriteria,
        testTypes: plan.testTypes,
        schedule: plan.schedule,
        resources: plan.resources,
        risks: plan.risks,
        traceabilityMatrix: selectedTestCases.map(tcId => {
          const tc = state.testCases.find(t => t.id === tcId);
          return {
            testCaseId: tcId,
            testCaseTitle: tc?.title || '',
            linkedStories: selectedStories
          };
        })
      }
    };

    if (plan.id) {
      dispatch({ type: 'UPDATE_TEST_PLAN', payload: newPlan });
    } else {
      dispatch({ type: 'ADD_TEST_PLAN', payload: newPlan });
    }

    addToast('Test plan saved', 'success');
    setPlan(emptyPlan);
    setSelectedTestCases([]);
    setSelectedStories([]);
  };

  const handleExportPdf = () => {
    const sections = [
      { title: 'Scope', content: plan.scope },
      { title: 'Objectives', content: plan.objectives },
      { title: 'Entry Criteria', content: plan.entryCriteria },
      { title: 'Exit Criteria', content: plan.exitCriteria },
      { title: 'Test Types', content: plan.testTypes.join(', ') },
      { title: 'Schedule', content: `${plan.schedule.startDate} - ${plan.schedule.endDate}` },
      { title: 'Resources', content: plan.resources },
      { title: 'Risks', content: plan.risks }
    ];

    if (plan.traceabilityMatrix.length > 0) {
      sections.push({
        title: 'Traceability Matrix',
        content: plan.traceabilityMatrix.map(t => 
          `Test Case: ${t.testCaseTitle}\nLinked Stories: ${t.linkedStories.join(', ')}`
        ).join('\n\n')
      });
    }

    exportToPdf('', `test-plan-${plan.title.replace(/\s+/g, '-')}`, {
      title: plan.title,
      sections
    });
    addToast('PDF exported', 'success');
  };

  const handleExportJson = () => {
    exportToJson(plan, `test-plan-${plan.title.replace(/\s+/g, '-')}`);
    addToast('JSON exported', 'success');
  };

  const loadPlan = (p) => {
    // Convert database format back to component format
    const loadedPlan = {
      id: p.id,
      title: p.name || '',
      scope: p.metadata?.scope || '',
      objectives: p.metadata?.objectives || '',
      entryCriteria: p.metadata?.entryCriteria || '',
      exitCriteria: p.metadata?.exitCriteria || '',
      testTypes: p.metadata?.testTypes || [],
      schedule: p.metadata?.schedule || { startDate: '', endDate: '' },
      resources: p.metadata?.resources || '',
      risks: p.metadata?.risks || '',
      traceabilityMatrix: p.metadata?.traceabilityMatrix || []
    };
    
    setPlan(loadedPlan);
    setSelectedTestCases(p.testCases || []);
    setSelectedStories(p.metadata?.traceabilityMatrix?.[0]?.linkedStories || []);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Test Plan Maker</h1>
        <p className="text-gray-400">Create comprehensive test plans with traceability</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title *</label>
              <input
                type="text"
                value={plan.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="Test Plan Title"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Scope</label>
              <textarea
                value={plan.scope}
                onChange={e => handleChange('scope', e.target.value)}
                placeholder="Define the scope of testing..."
                className="textarea"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Objectives</label>
              <textarea
                value={plan.objectives}
                onChange={e => handleChange('objectives', e.target.value)}
                placeholder="List the testing objectives..."
                className="textarea"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Entry Criteria</label>
                <textarea
                  value={plan.entryCriteria}
                  onChange={e => handleChange('entryCriteria', e.target.value)}
                  placeholder="Conditions to start testing..."
                  className="textarea min-h-[100px]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Exit Criteria</label>
                <textarea
                  value={plan.exitCriteria}
                  onChange={e => handleChange('exitCriteria', e.target.value)}
                  placeholder="Conditions to complete testing..."
                  className="textarea min-h-[100px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Test Types</label>
              <div className="flex flex-wrap gap-2">
                {testTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleTestType(type)}
                    className={`badge cursor-pointer transition-colors ${
                      plan.testTypes.includes(type) ? 'badge-teal' : 'badge-gray hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={plan.schedule.startDate}
                  onChange={e => handleChange('schedule', { ...plan.schedule, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={plan.schedule.endDate}
                  onChange={e => handleChange('schedule', { ...plan.schedule, endDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Resources</label>
              <textarea
                value={plan.resources}
                onChange={e => handleChange('resources', e.target.value)}
                placeholder="Team members, tools, environments..."
                className="textarea"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Risks</label>
              <textarea
                value={plan.risks}
                onChange={e => handleChange('risks', e.target.value)}
                placeholder="Potential risks and mitigations..."
                className="textarea"
              />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Traceability Matrix</h3>
              <button onClick={() => setShowLinkModal(true)} className="btn-secondary text-sm">
                <Icons.Link className="w-4 h-4 inline mr-1" /> Link Items
              </button>
            </div>

            {selectedTestCases.length === 0 ? (
              <p className="text-sm text-gray-500">No test cases linked. Click "Link Items" to add traceability.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2 text-gray-400 font-medium">Test Case</th>
                      <th className="text-left py-2 text-gray-400 font-medium">Linked Stories</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTestCases.map(tcId => {
                      const tc = state.testCases.find(t => t.id === tcId);
                      return (
                        <tr key={tcId} className="border-b border-gray-800">
                          <td className="py-2 text-gray-300">{tc?.title || tcId}</td>
                          <td className="py-2">
                            {selectedStories.map(sId => {
                              const story = state.userStories.find(s => s.id === sId);
                              return (
                                <span key={sId} className="badge-blue mr-1">
                                  {story?.title || sId}
                                </span>
                              );
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={handleExportJson} className="btn-secondary">Export JSON</button>
            <button onClick={handleExportPdf} className="btn-secondary">Export PDF</button>
            <button onClick={handleSave} className="btn-primary">
              <Icons.Save className="w-4 h-4 inline mr-1" /> Save Plan
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-3">Saved Plans</h3>
            {state.testPlans.length === 0 ? (
              <p className="text-sm text-gray-500">No test plans yet</p>
            ) : (
              <div className="space-y-2">
                {state.testPlans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => loadPlan(p)}
                    className="w-full text-left p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <p className="font-medium text-gray-200">{p.name || p.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {p.metadata?.testTypes?.slice(0, 3).join(', ') || p.testTypes?.slice(0, 3).join(', ')}
                      {(p.metadata?.testTypes?.length > 3 || p.testTypes?.length > 3) && '...'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Link Test Cases & Stories"
        size="lg"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Test Cases</h4>
            {state.testCases.length === 0 ? (
              <p className="text-sm text-gray-500">No test cases available</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {state.testCases.map(tc => (
                  <label key={tc.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTestCases.includes(tc.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedTestCases(prev => [...prev, tc.id]);
                        } else {
                          setSelectedTestCases(prev => prev.filter(id => id !== tc.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                    />
                    <span className="text-sm text-gray-300">{tc.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-medium text-gray-300 mb-2">User Stories</h4>
            {state.userStories.length === 0 ? (
              <p className="text-sm text-gray-500">No user stories available</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto">
                {state.userStories.map(story => (
                  <label key={story.id} className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStories.includes(story.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedStories(prev => [...prev, story.id]);
                        } else {
                          setSelectedStories(prev => prev.filter(id => id !== story.id));
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                    />
                    <span className="text-sm text-gray-300">{story.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => setShowLinkModal(false)} className="btn-primary">Done</button>
        </div>
      </Modal>
    </div>
  );
}
