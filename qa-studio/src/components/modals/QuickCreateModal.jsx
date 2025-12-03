import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Icons } from '../ui/Icons';
import { navigate } from '../../router/Router';

export function QuickCreateModal() {
  const { state, dispatch, addToast } = useApp();
  const [type, setType] = useState('story');

  const handleCreate = (createType) => {
    dispatch({ type: 'CLOSE_MODAL', payload: 'quickCreate' });
    // Navigate to STLC page with create parameter
    window.location.hash = `#/stlc?create=${createType}`;
    addToast(`Creating new ${createType === 'story' ? 'User Story' : 'Bug'}`, 'info');
  };

  return (
    <Modal
      isOpen={state.modals.quickCreate}
      onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'quickCreate' })}
      title="Quick Create"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-gray-400 text-sm">What would you like to create?</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleCreate('story')}
            className="flex flex-col items-center gap-3 p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 hover:border-teal-500"
          >
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <Icons.FileText className="w-6 h-6 text-teal-400" />
            </div>
            <span className="font-medium text-gray-200">User Story</span>
          </button>
          
          <button
            onClick={() => handleCreate('bug')}
            className="flex flex-col items-center gap-3 p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors border border-gray-700 hover:border-red-500"
          >
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <Icons.Bug className="w-6 h-6 text-red-400" />
            </div>
            <span className="font-medium text-gray-200">Bug Report</span>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-3">Or jump to:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                dispatch({ type: 'CLOSE_MODAL', payload: 'quickCreate' });
                navigate('/test-cases');
              }}
              className="btn-ghost text-sm"
            >
              Test Cases
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'CLOSE_MODAL', payload: 'quickCreate' });
                navigate('/test-scripts');
              }}
              className="btn-ghost text-sm"
            >
              Test Scripts
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'CLOSE_MODAL', payload: 'quickCreate' });
                navigate('/api-testing');
              }}
              className="btn-ghost text-sm"
            >
              API Request
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
