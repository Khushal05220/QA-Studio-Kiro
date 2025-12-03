import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { exportToJson, exportToPostman, exportToCsv } from '../services/export';
import { Icons } from '../components/ui/Icons';
import { Spinner } from '../components/ui/Spinner';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('json', json);

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const authTypes = ['None', 'Bearer', 'Basic'];

export function ApiTesting() {
  const { state, dispatch, addToast } = useApp();
  const { user } = useAuth();
  const [request, setRequest] = useState({
    name: '',
    method: 'GET',
    url: '',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    authType: 'None',
    authValue: '',
    bodyType: 'json',
    body: '',
    graphql: false,
    query: ''
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assertions, setAssertions] = useState([]);
  const [generatingAssertions, setGeneratingAssertions] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [activeTab, setActiveTab] = useState('body');
  const [collections, setCollections] = useState(state.apiCollections || []);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const responseRef = useRef(null);
  
  // Sync collections with state
  useEffect(() => {
    setCollections(state.apiCollections || []);
  }, [state.apiCollections]);

  useEffect(() => {
    if (responseRef.current && response?.body) {
      try {
        const formatted = JSON.stringify(JSON.parse(response.body), null, 2);
        responseRef.current.innerHTML = hljs.highlight(formatted, { language: 'json' }).value;
      } catch {
        responseRef.current.textContent = response.body;
      }
    }
  }, [response]);

  const handleSend = async () => {
    if (!request.url.trim()) {
      addToast('Please enter a URL', 'warning');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const headers = {};
      request.headers.forEach(h => {
        if (h.key && h.value) headers[h.key] = h.value;
      });

      if (request.authType === 'Bearer' && request.authValue) {
        headers['Authorization'] = `Bearer ${request.authValue}`;
      } else if (request.authType === 'Basic' && request.authValue) {
        headers['Authorization'] = `Basic ${btoa(request.authValue)}`;
      }

      const result = await apiService.executeApiRequest({
        method: request.method,
        url: request.url,
        headers,
        body: request.graphql ? { query: request.query } : request.body
      });

      setResponse(result);
      addToast(`${result.status} ${result.statusText}`, result.status < 400 ? 'success' : 'warning');
    } catch (error) {
      setResponse({ status: 0, statusText: 'Error', body: error.message, time: 0 });
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssertions = async () => {
    if (!response) {
      addToast('Send a request first', 'warning');
      return;
    }

    setGeneratingAssertions(true);
    try {
      const result = await apiService.generateAssertions({
        request: { method: request.method, url: request.url },
        response: { status: response.status, body: response.body }
      });
      setAssertions(result.assertions || []);
      addToast('Assertions generated', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setGeneratingAssertions(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!response) {
      addToast('Send a request first', 'warning');
      return;
    }

    setGeneratingScript(true);
    setGeneratedScript('');

    try {
      const stream = apiService.streamGenerateScript({
        framework: 'playwright',
        language: 'typescript',
        scenario: `API test for ${request.method} ${request.url}`,
        apiRequest: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body
        },
        assertions
      }, 'api-script');

      for await (const chunk of stream) {
        if (chunk.text) {
          setGeneratedScript(prev => prev + chunk.text);
        }
      }
      addToast('Script generated', 'success');
    } catch (error) {
      if (error.name !== 'AbortError') {
        addToast(error.message, 'error');
      }
    } finally {
      setGeneratingScript(false);
    }
  };

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '' }]
    }));
  };

  const updateHeader = (index, field, value) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.map((h, i) => i === index ? { ...h, [field]: value } : h)
    }));
  };

  const removeHeader = (index) => {
    setRequest(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index)
    }));
  };

  const saveToCollection = async () => {
    // Check if user is logged in
    if (!user) {
      addToast('Please log in to save collections', 'error');
      window.location.hash = '#/login';
      return;
    }

    if (!request.name.trim()) {
      addToast('Please enter a request name first', 'warning');
      return;
    }

    // If no collection selected and no name entered, show modal
    if (!selectedCollection && !newCollectionName.trim()) {
      setShowNewCollectionModal(true);
      return;
    }

    const requestToSave = { 
      ...request, 
      id: `req-${Date.now()}`,
      savedAt: new Date().toISOString()
    };

    try {
      if (!selectedCollection && newCollectionName.trim()) {
        // Create new collection with the request
        const newCollection = {
          id: `col-${Date.now()}`,
          name: newCollectionName.trim(),
          requests: [requestToSave]
        };
        
        // Save to Supabase
        await supabaseService.saveApiCollection(newCollection);
        
        const updatedCollections = [...collections, newCollection];
        setCollections(updatedCollections);
        setSelectedCollection(newCollection.id);
        
        // Save to AppContext
        dispatch({ type: 'ADD_API_COLLECTION', payload: newCollection });
        addToast(`Created collection "${newCollectionName}" and saved request`, 'success');
        
        // Reset modal and name
        setNewCollectionName('');
        setShowNewCollectionModal(false);
      } else if (selectedCollection) {
        // Check if request already exists in collection (prevent duplicates)
        const collection = collections.find(c => c.id === selectedCollection);
        const isDuplicate = collection?.requests?.some(r => 
          r.name === request.name && r.url === request.url && r.method === request.method
        );
        
        if (isDuplicate) {
          addToast('This request already exists in the collection', 'warning');
          return;
        }
        
        // Add to existing collection
        const updatedCollections = collections.map(c =>
          c.id === selectedCollection
            ? { ...c, requests: [...(c.requests || []), requestToSave] }
            : c
        );
        
        const updatedCollection = updatedCollections.find(c => c.id === selectedCollection);
        
        // Save to Supabase
        await supabaseService.updateApiCollection(updatedCollection);
        
        setCollections(updatedCollections);
        
        // Update in AppContext
        dispatch({ type: 'UPDATE_API_COLLECTION', payload: updatedCollection });
        addToast('Request saved to collection', 'success');
      }
    } catch (error) {
      console.error('Save collection error:', error);
      addToast(`Failed to save: ${error.message}`, 'error');
    }
  };

  const exportCollection = () => {
    const collection = collections.find(c => c.id === selectedCollection);
    if (collection) {
      exportToPostman(collection, `${collection.name}-postman`);
      addToast('Exported as Postman collection', 'success');
    }
  };

  const methodColors = {
    GET: 'text-green-400',
    POST: 'text-blue-400',
    PUT: 'text-yellow-400',
    PATCH: 'text-orange-400',
    DELETE: 'text-red-400'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">API Testing</h1>
        <p className="text-gray-400">Test REST and GraphQL APIs with AI-powered assertions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-4">
            {/* Request Name */}
            <input
              type="text"
              placeholder="Request name (e.g., Get Users, Create Post)"
              value={request.name}
              onChange={e => setRequest(prev => ({ ...prev, name: e.target.value }))}
              className="input w-full"
              aria-label="Request name"
            />
            
            {/* Method + URL + Send */}
            <div className="flex gap-2">
              <select
                value={request.method}
                onChange={e => setRequest(prev => ({ ...prev, method: e.target.value }))}
                className={`select w-28 font-medium ${methodColors[request.method]}`}
                aria-label="HTTP method"
              >
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="text"
                placeholder="Enter URL (e.g., https://api.example.com/users)"
                value={request.url}
                onChange={e => setRequest(prev => ({ ...prev, url: e.target.value }))}
                className="input flex-1"
                aria-label="Request URL"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? <Spinner size="sm" /> : <Icons.Send className="w-4 h-4" />}
                Send
              </button>
            </div>

            <div className="flex items-center gap-4 border-b border-gray-800">
              {['body', 'headers', 'auth', 'graphql'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-teal-400 text-teal-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'body' && (
              <textarea
                placeholder='{"key": "value"}'
                value={request.body}
                onChange={e => setRequest(prev => ({ ...prev, body: e.target.value }))}
                className="textarea font-mono text-sm min-h-[150px]"
                aria-label="Request body"
              />
            )}

            {activeTab === 'headers' && (
              <div className="space-y-2">
                {request.headers.map((header, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={header.key}
                      onChange={e => updateHeader(i, 'key', e.target.value)}
                      className="input flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={header.value}
                      onChange={e => updateHeader(i, 'value', e.target.value)}
                      className="input flex-1"
                    />
                    <button onClick={() => removeHeader(i)} className="btn-ghost p-2">
                      <Icons.Trash className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
                <button onClick={addHeader} className="btn-ghost text-sm">
                  <Icons.Plus className="w-4 h-4 inline mr-1" /> Add Header
                </button>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-4">
                <select
                  value={request.authType}
                  onChange={e => setRequest(prev => ({ ...prev, authType: e.target.value }))}
                  className="select w-48"
                  aria-label="Authentication type"
                >
                  {authTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {request.authType !== 'None' && (
                  <input
                    type="text"
                    placeholder={request.authType === 'Bearer' ? 'Token' : 'username:password'}
                    value={request.authValue}
                    onChange={e => setRequest(prev => ({ ...prev, authValue: e.target.value }))}
                    className="input"
                    aria-label="Authentication value"
                  />
                )}
              </div>
            )}

            {activeTab === 'graphql' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={request.graphql}
                    onChange={e => setRequest(prev => ({ ...prev, graphql: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500"
                  />
                  <span className="text-sm text-gray-300">Enable GraphQL mode</span>
                </label>
                {request.graphql && (
                  <textarea
                    placeholder="query { users { id name } }"
                    value={request.query}
                    onChange={e => setRequest(prev => ({ ...prev, query: e.target.value }))}
                    className="textarea font-mono text-sm min-h-[150px]"
                    aria-label="GraphQL query"
                  />
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={saveToCollection} className="btn-secondary text-sm">
                <Icons.Save className="w-4 h-4 inline mr-1" /> Save
              </button>
            </div>
          </div>

          {response && (
            <div className="card p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-4">
                  <span className={`font-medium ${response.status < 400 ? 'text-green-400' : 'text-red-400'}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-gray-500">{response.time}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateAssertions}
                    disabled={generatingAssertions}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    {generatingAssertions ? <Spinner size="sm" /> : <Icons.Sparkles className="w-4 h-4" />}
                    Generate Assertions
                  </button>
                </div>
              </div>
              <div className="border-b border-gray-800">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('response-body')}
                    className={`px-4 py-2 text-sm ${activeTab === 'response-body' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400'}`}
                  >
                    Body
                  </button>
                  <button
                    onClick={() => setActiveTab('response-headers')}
                    className={`px-4 py-2 text-sm ${activeTab === 'response-headers' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400'}`}
                  >
                    Headers ({Object.keys(response.headers || {}).length})
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-950 max-h-80 overflow-auto">
                {activeTab === 'response-headers' ? (
                  <div className="space-y-1">
                    {Object.entries(response.headers || {}).map(([key, value]) => (
                      <div key={key} className="flex text-sm">
                        <span className="text-teal-400 w-48 flex-shrink-0">{key}:</span>
                        <span className="text-gray-300 break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="text-sm">
                    <code ref={responseRef} className="hljs">{response.body}</code>
                  </pre>
                )}
              </div>
            </div>
          )}

          {assertions.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-3">Generated Assertions</h3>
              <div className="space-y-2">
                {assertions.map((a, i) => (
                  <div key={i} className="p-3 bg-gray-800 rounded space-y-2">
                    <div className="flex items-center gap-2">
                      <Icons.Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">{a.description || a}</span>
                    </div>
                    {a.code && (
                      <pre className="text-xs text-teal-400 bg-gray-900 p-2 rounded overflow-x-auto">
                        <code>{a.code}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedScript && (
            <div className="card p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-sm font-medium text-gray-300">Generated Test Script</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedScript)}
                  className="btn-ghost p-2"
                >
                  <Icons.Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-gray-950 max-h-80 overflow-auto">
                <pre className="text-sm text-gray-300">{generatedScript}</pre>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Collections</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => setShowNewCollectionModal(true)} 
                  className="btn-ghost p-1" 
                  title="New Collection"
                >
                  <Icons.Plus className="w-4 h-4" />
                </button>
                {selectedCollection && (
                  <button onClick={exportCollection} className="btn-ghost p-1" title="Export to Postman">
                    <Icons.Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {collections.length === 0 ? (
              <p className="text-sm text-gray-500">No collections yet. Save a request to create one.</p>
            ) : (
              <div className="space-y-2">
                {collections.map(c => (
                  <div key={c.id} className="space-y-1">
                    <button
                      onClick={() => setSelectedCollection(selectedCollection === c.id ? null : c.id)}
                      className={`w-full text-left p-2 rounded transition-colors flex items-center justify-between ${
                        selectedCollection === c.id ? 'bg-teal-500/20 text-teal-400' : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <span>
                        <Icons.Folder className="w-4 h-4 inline mr-2" />
                        {c.name}
                      </span>
                      <span className="text-xs text-gray-500">{c.requests?.length || 0}</span>
                    </button>
                    {selectedCollection === c.id && c.requests?.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {c.requests.map(req => (
                          <button
                            key={req.id}
                            onClick={() => {
                              setRequest(req);
                              addToast(`Loaded "${req.name}"`, 'info');
                            }}
                            className="w-full text-left p-2 text-sm rounded hover:bg-gray-800 text-gray-400 flex items-center gap-2"
                          >
                            <span className={`text-xs font-medium ${methodColors[req.method]}`}>{req.method}</span>
                            <span className="truncate">{req.name || req.url}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Collection</h3>
            <input
              type="text"
              placeholder="Collection name (e.g., My API Tests)"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && newCollectionName.trim()) {
                  await saveToCollection();
                }
              }}
              className="input w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowNewCollectionModal(false);
                  setNewCollectionName('');
                }} 
                className="btn-ghost"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!newCollectionName.trim()) {
                    addToast('Please enter a collection name', 'warning');
                    return;
                  }
                  await saveToCollection();
                }}
                disabled={!newCollectionName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
