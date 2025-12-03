import { useApp } from '../../context/AppContext';

const statusConfig = {
  connected: { color: '#22c55e', label: 'Connected', pulse: false },
  degraded: { color: '#eab308', label: 'Degraded', pulse: true },
  failed: { color: '#ef4444', label: 'Disconnected', pulse: true },
  checking: { color: '#6b7280', label: 'Checking...', pulse: true }
};

export function ApiStatusIndicator({ onClick }) {
  const { state } = useApp();
  const { status, lastModel } = state.apiStatus;
  const config = statusConfig[status] || statusConfig.checking;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-white/5"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
      aria-label={`Gemini API status: ${config.label}`}
    >
      <span className="relative flex h-2 w-2">
        {config.pulse && (
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: config.color }}
          />
        )}
        <span 
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: config.color }}
        />
      </span>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {config.label}
        {lastModel && status === 'connected' && (
          <span style={{ color: 'var(--text-muted)' }} className="ml-1">({lastModel})</span>
        )}
      </span>
    </button>
  );
}
