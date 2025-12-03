import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { exportToJson, exportToCsv } from '../services/export';
import { Icons } from '../components/ui/Icons';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';

const statuses = ['New', 'Active', 'In Progress', 'Testing', 'Done', 'Closed'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];
const severities = ['Critical', 'Major', 'Minor', 'Trivial'];

export function StlcBacklog() {
  const { state, dispatch, addToast } = useApp();
  const [view, setView] = useState('kanban');
  const [activeTab, setActiveTab] = useState('stories');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('story');
  const [editingItem, setEditingItem] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [rawNotes, setRawNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Parse query params from hash - handle both #/stlc?create=story and #/stlc?create=bug
    const hash = window.location.hash;
    console.log('StlcBacklog: checking hash for create param:', hash);
    
    let createType = null;
    if (hash.includes('?')) {
      const queryString = hash.split('?')[1];
      const params = new URLSearchParams(queryString);
      createType = params.get('create');
    }
    
    console.log('StlcBacklog: createType:', createType);
    
    if (createType) {
      setModalType(createType === 'bug' ? 'bug' : 'story');
      setShowModal(true);
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname + '#/stlc');
    }
  }, []);

  const openCreate = (type) => { setModalType(type); setEditingItem(null); setShowModal(true); };
  const openEdit = (item, type) => { setModalType(type); setEditingItem(item); setShowModal(true); };

  const handleGenerateFromNotes = async () => {
    if (!rawNotes.trim()) { addToast('Please enter some notes', 'warning'); return; }
    setGenerating(true);
    try {
      const result = await apiService.generateFromNotes({ notes: rawNotes, type: modalType });
      setEditingItem(prev => ({ ...prev, ...result.generated }));
      addToast('Generated', 'success');
    } catch (error) { addToast(error.message, 'error'); }
    finally { setGenerating(false); }
  };

  const handleExport = (format, type) => {
    const data = type === 'stories' ? state.userStories : state.bugs;
    if (format === 'json') exportToJson(data, type + '-' + Date.now());
    else exportToCsv(data, type + '-' + Date.now());
    addToast('Exported', 'success');
  };

  const handleStatusChange = async (item, newStatus) => {
    console.log('=== STATUS CHANGE INITIATED ===');
    console.log('Item:', JSON.stringify(item, null, 2));
    console.log('New status:', newStatus);
    console.log('Type:', activeTab);
    
    const updatedItem = { ...item, status: newStatus };
    dispatch({ type: activeTab === 'stories' ? 'UPDATE_USER_STORY' : 'UPDATE_BUG', payload: updatedItem });
    
    try {
      const { supabaseService } = await import('../services/supabaseService');
      if (activeTab === 'stories') {
        console.log('Calling saveUserStories with:', updatedItem);
        const result = await supabaseService.saveUserStories([updatedItem]);
        console.log('Save result:', result);
      } else {
        console.log('Calling saveBugs with:', updatedItem);
        const result = await supabaseService.saveBugs([updatedItem]);
        console.log('Save result:', result);
      }
      console.log('Status change saved to Supabase');
      addToast('Status updated', 'success');
    } catch (error) {
      console.error('Failed to save status change:', error);
      addToast('Failed to save status change: ' + error.message, 'error');
    }
  };

  const handleDelete = async (item) => {
    console.log('=== DELETE INITIATED ===');
    console.log('Deleting item:', JSON.stringify(item, null, 2));
    console.log('Item ID:', item.id);
    console.log('Type:', activeTab);
    
    // Update local state first for immediate UI feedback
    dispatch({ type: activeTab === 'stories' ? 'DELETE_USER_STORY' : 'DELETE_BUG', payload: item.id });
    addToast('Deleting...', 'info');
    
    try {
      const { supabaseService } = await import('../services/supabaseService');
      if (activeTab === 'stories') {
        console.log('Calling deleteUserStories with ID:', item.id);
        const result = await supabaseService.deleteUserStories([item.id]);
        console.log('Delete result:', result);
      } else {
        console.log('Calling deleteBugs with ID:', item.id);
        const result = await supabaseService.deleteBugs([item.id]);
        console.log('Delete result:', result);
      }
      console.log('Supabase delete completed');
      addToast('Deleted successfully', 'success');
    } catch (error) {
      console.error('Delete failed:', error);
      addToast('Delete failed: ' + error.message, 'error');
      // Re-add the item if delete failed
      dispatch({ type: activeTab === 'stories' ? 'ADD_USER_STORY' : 'ADD_BUG', payload: item });
    }
  };

  const handleSave = async (item) => {
    const itemWithId = { ...item, id: item.id || Date.now().toString() };
    dispatch({ 
      type: modalType === 'story' 
        ? (editingItem?.id ? 'UPDATE_USER_STORY' : 'ADD_USER_STORY') 
        : (editingItem?.id ? 'UPDATE_BUG' : 'ADD_BUG'), 
      payload: itemWithId 
    });
    
    try {
      const { supabaseService } = await import('../services/supabaseService');
      if (modalType === 'story') {
        await supabaseService.saveUserStories([itemWithId]);
      } else {
        await supabaseService.saveBugs([itemWithId]);
      }
      addToast('Saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save:', error);
      addToast('Save failed: ' + error.message, 'error');
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const filteredStories = state.userStories.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBugs = state.bugs.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">STLC / Backlog</h1>
          <p className="text-gray-400">Manage user stories, bugs, and track testing lifecycle</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => openCreate('story')} className="btn-primary flex items-center gap-2"><Icons.Plus className="w-4 h-4" /> User Story</button>
          <button onClick={() => openCreate('bug')} className="btn-danger flex items-center gap-2"><Icons.Bug className="w-4 h-4" /> Bug</button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button onClick={() => setActiveTab('stories')} className={'px-4 py-1.5 rounded text-sm font-medium ' + (activeTab === 'stories' ? 'bg-teal-500 text-gray-900' : 'text-gray-400')}>Stories ({state.userStories.length})</button>
            <button onClick={() => setActiveTab('bugs')} className={'px-4 py-1.5 rounded text-sm font-medium ' + (activeTab === 'bugs' ? 'bg-red-500 text-white' : 'text-gray-400')}>Bugs ({state.bugs.length})</button>
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={'p-1.5 rounded ' + (view === 'kanban' ? 'bg-gray-700' : '')}><Icons.Kanban className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={'p-1.5 rounded ' + (view === 'list' ? 'bg-gray-700' : '')}><Icons.ClipboardList className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative"><Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input pl-9 w-64" /></div>
          <button onClick={() => handleExport('json', activeTab)} className="btn-secondary text-sm">JSON</button>
          <button onClick={() => handleExport('csv', activeTab)} className="btn-secondary text-sm">CSV</button>
        </div>
      </div>
      {view === 'kanban' ? (
        <KanbanBoard 
          items={activeTab === 'stories' ? filteredStories : filteredBugs} 
          type={activeTab === 'stories' ? 'story' : 'bug'} 
          onEdit={openEdit} 
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      ) : (
        <ListView 
          items={activeTab === 'stories' ? filteredStories : filteredBugs} 
          type={activeTab === 'stories' ? 'story' : 'bug'} 
          onEdit={openEdit} 
          onDelete={handleDelete} 
        />
      )}
      <ItemModal 
        isOpen={showModal} 
        onClose={() => { 
          setShowModal(false); 
          setEditingItem(null); 
          setRawNotes(''); 
        }} 
        type={modalType} 
        item={editingItem} 
        onSave={handleSave} 
        rawNotes={rawNotes} 
        setRawNotes={setRawNotes} 
        onGenerateFromNotes={handleGenerateFromNotes} 
        generating={generating} 
      />
    </div>
  );
}

function KanbanBoard({ items, type, onEdit, onStatusChange, onDelete }) {
  const grouped = statuses.reduce((acc, s) => { acc[s] = items.filter(i => i.status === s); return acc; }, {});
  
  const handleDrop = (e, status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('itemId');
    console.log('=== DROP EVENT ===');
    console.log('Dropped item ID:', id);
    console.log('Target status:', status);
    const item = items.find(i => i.id === id);
    console.log('Found item:', item);
    if (item && item.status !== status) {
      console.log('Calling onStatusChange...');
      onStatusChange(item, status);
    } else {
      console.log('Status unchanged or item not found');
    }
  };
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map(status => (
        <div key={status} className="flex-shrink-0 w-72 bg-gray-900 rounded-xl" onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, status)}>
          <div className="p-3 border-b border-gray-800 flex items-center justify-between"><span className="font-medium text-gray-300">{status}</span><span className="badge-gray">{grouped[status]?.length || 0}</span></div>
          <div className="p-2 space-y-2 min-h-[200px]">
            {grouped[status]?.map(item => (
              <div key={item.id} draggable onDragStart={e => e.dataTransfer.setData('itemId', item.id)} className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 group">
                <div className="flex justify-between items-start">
                  <p onClick={() => onEdit(item, type)} className="font-medium text-gray-200 text-sm mb-2 flex-1">{item.title}</p>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item); }} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <Icons.Trash className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2"><span className={'badge text-xs ' + (item.priority === 'Critical' ? 'badge-red' : item.priority === 'High' ? 'badge-yellow' : 'badge-blue')}>{item.priority}</span>{type === 'bug' && item.severity && <span className="badge-red text-xs">{item.severity}</span>}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListView({ items, type, onEdit, onDelete }) {
  return (
    <div className="card p-0 overflow-hidden">
      <table className="w-full">
        <thead><tr className="border-b border-gray-800 bg-gray-800/50"><th className="text-left p-3 text-sm font-medium text-gray-400">ID</th><th className="text-left p-3 text-sm font-medium text-gray-400">Title</th><th className="text-left p-3 text-sm font-medium text-gray-400">Priority</th>{type === 'bug' && <th className="text-left p-3 text-sm font-medium text-gray-400">Severity</th>}<th className="text-left p-3 text-sm font-medium text-gray-400">Status</th><th className="text-left p-3 text-sm font-medium text-gray-400">Actions</th></tr></thead>
        <tbody>{items.map(item => (<tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/30"><td className="p-3 text-sm text-gray-500">{item.id.slice(-6)}</td><td className="p-3"><button onClick={() => onEdit(item, type)} className="text-sm text-gray-200 hover:text-teal-400">{item.title}</button></td><td className="p-3"><span className={'badge text-xs ' + (item.priority === 'Critical' ? 'badge-red' : 'badge-blue')}>{item.priority}</span></td>{type === 'bug' && <td className="p-3"><span className="badge-red text-xs">{item.severity}</span></td>}<td className="p-3"><span className="badge-gray text-xs">{item.status}</span></td><td className="p-3"><button onClick={() => onDelete(item)} className="text-red-400 hover:text-red-300"><Icons.Trash className="w-4 h-4" /></button></td></tr>))}</tbody>
      </table>
      {items.length === 0 && <p className="text-center text-gray-500 py-8">No items found</p>}
    </div>
  );
}

function ItemModal({ isOpen, onClose, type, item, onSave, rawNotes, setRawNotes, onGenerateFromNotes, generating }) {
  const [formData, setFormData] = useState(type === 'story' ? { title: '', description: '', acceptanceCriteria: '', storyPoints: '', priority: 'Medium', epic: '', status: 'New' } : { title: '', description: '', stepsToReproduce: [{ step: 1, description: '' }], severity: 'Major', priority: 'Medium', environment: '', status: 'New' });
  useEffect(() => { setFormData(item || (type === 'story' ? { title: '', description: '', acceptanceCriteria: '', storyPoints: '', priority: 'Medium', epic: '', status: 'New' } : { title: '', description: '', stepsToReproduce: [{ step: 1, description: '' }], severity: 'Major', priority: 'Medium', environment: '', status: 'New' })); }, [item, type, isOpen]);
  const handleChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));
  const addStep = () => setFormData(p => ({ ...p, stepsToReproduce: [...(p.stepsToReproduce || []), { step: (p.stepsToReproduce?.length || 0) + 1, description: '' }] }));
  const updateStep = (i, d) => setFormData(p => ({ ...p, stepsToReproduce: p.stepsToReproduce.map((s, idx) => idx === i ? { ...s, description: d } : s) }));
  const handleSubmit = (e) => { e.preventDefault(); if (formData.title?.trim()) onSave({ ...formData, id: item?.id }); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={(item ? 'Edit' : 'Create') + ' ' + (type === 'story' ? 'User Story' : 'Bug')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-gray-800 rounded-lg"><p className="text-sm text-gray-400 mb-2">Generate from AI</p><textarea placeholder="Paste raw notes..." value={rawNotes} onChange={e => setRawNotes(e.target.value)} className="textarea min-h-[60px] mb-2" /><button type="button" onClick={onGenerateFromNotes} disabled={generating || !rawNotes.trim()} className="btn-secondary text-sm flex items-center gap-2">{generating ? <Spinner size="sm" /> : <Icons.Sparkles className="w-4 h-4" />} Generate</button></div>
        <div><label className="block text-sm text-gray-400 mb-1">Title *</label><input type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="input" required /></div>
        <div><label className="block text-sm text-gray-400 mb-1">Description</label><textarea value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} className="textarea" /></div>
        {type === 'story' ? (<><div><label className="block text-sm text-gray-400 mb-1">Acceptance Criteria</label><textarea value={formData.acceptanceCriteria || ''} onChange={e => handleChange('acceptanceCriteria', e.target.value)} className="textarea" /></div><div className="grid grid-cols-3 gap-4"><div><label className="block text-sm text-gray-400 mb-1">Story Points</label><input type="number" value={formData.storyPoints || ''} onChange={e => handleChange('storyPoints', e.target.value)} className="input" /></div><div><label className="block text-sm text-gray-400 mb-1">Priority</label><select value={formData.priority} onChange={e => handleChange('priority', e.target.value)} className="select">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Epic</label><input type="text" value={formData.epic || ''} onChange={e => handleChange('epic', e.target.value)} className="input" /></div></div></>) : (<><div><label className="block text-sm text-gray-400 mb-1">Steps to Reproduce</label>{formData.stepsToReproduce?.map((s, i) => (<div key={i} className="flex gap-2 mb-2"><span className="text-gray-500 mt-2">{i + 1}.</span><input type="text" value={s.description} onChange={e => updateStep(i, e.target.value)} className="input flex-1" placeholder="Step" /></div>))}<button type="button" onClick={addStep} className="btn-ghost text-sm"><Icons.Plus className="w-4 h-4 inline" /> Add Step</button></div><div className="grid grid-cols-3 gap-4"><div><label className="block text-sm text-gray-400 mb-1">Severity</label><select value={formData.severity} onChange={e => handleChange('severity', e.target.value)} className="select">{severities.map(s => <option key={s} value={s}>{s}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Priority</label><select value={formData.priority} onChange={e => handleChange('priority', e.target.value)} className="select">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div><div><label className="block text-sm text-gray-400 mb-1">Environment</label><input type="text" value={formData.environment || ''} onChange={e => handleChange('environment', e.target.value)} className="input" /></div></div></>)}
        <div><label className="block text-sm text-gray-400 mb-1">Status</label><select value={formData.status} onChange={e => handleChange('status', e.target.value)} className="select">{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary"><Icons.Save className="w-4 h-4 inline mr-1" /> Save</button></div>
      </form>
    </Modal>
  );
}
