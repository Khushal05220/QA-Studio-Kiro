import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Icons } from '../ui/Icons';
import { Spinner } from '../ui/Spinner';

export function ApiStatusModal() {
  const { state, dispatch, checkApiStatus } = useApp();
  const { status, lastModel, lastCheck, errors } = state.apiStatus;
  const [checking, setChecking] = React.useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    await checkApiStatus();
    setChecking(false);
  };

  const copyError = (error) => {
    navigator.clipboard.writeText(JSON.stringify(error, null, 2));
  };

  return (
    <Modal
      isOpen={state.modals.apiStatus}
      onClose={() => dispatch({ type: 'CLOSE_MODAL', payload: 'apiStatus' })}
      title="Gemini API Connection"
      size="md"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'connected' ? 'bg-green-500' :
              status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <div>
              <p className="font-medium text-gray-200">
                {status === 'connected' ? 'Connected' :
                 status === 'degraded' ? 'Degraded' : 'Disconnected'}
              </p>
              {lastModel && <p className="text-sm text-gray-400">Model: {lastModel}</p>}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="btn-secondary flex items-center gap-2"
          >
            {checking ? <Spinner size="sm" /> : <Icons.Refresh className="w-4 h-4" />}
            Refresh
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Connection Details</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Backend URL</dt>
              <dd className="text-gray-300">{state.settings.backendUrl}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Default Model</dt>
              <dd className="text-gray-300">{state.settings.defaultModel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Last Check</dt>
              <dd className="text-gray-300">
                {lastCheck ? new Date(lastCheck).toLocaleTimeString() : 'Never'}
              </dd>
            </div>
          </dl>
        </div>

        {errors.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Recent Errors</h3>
            <div className="space-y-2 max-h-48 overflow-auto">
              {errors.map((error, i) => (
                <div key={i} className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-red-300">{error.message}</p>
                    <button
                      onClick={() => copyError(error)}
                      className="text-gray-400 hover:text-gray-200"
                      aria-label="Copy error"
                    >
                      <Icons.Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(error.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-800/50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Troubleshooting</h3>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>Ensure the backend server is running on the configured URL</li>
            <li>Verify your Gemini API key is set in the server environment</li>
            <li>Check server logs for detailed error messages</li>
            <li>Confirm network connectivity to the backend</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
