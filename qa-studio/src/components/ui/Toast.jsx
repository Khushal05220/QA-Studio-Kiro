import { useApp } from '../../context/AppContext';
import { Icons } from './Icons';

const toastStyles = {
  success: { 
    bg: 'rgba(34, 197, 94, 0.15)', 
    border: 'rgba(34, 197, 94, 0.3)', 
    icon: Icons.CheckCircle, 
    iconColor: '#86efac' 
  },
  error: { 
    bg: 'rgba(239, 68, 68, 0.15)', 
    border: 'rgba(239, 68, 68, 0.3)', 
    icon: Icons.XCircle, 
    iconColor: '#fca5a5' 
  },
  warning: { 
    bg: 'rgba(234, 179, 8, 0.15)', 
    border: 'rgba(234, 179, 8, 0.3)', 
    icon: Icons.AlertCircle, 
    iconColor: '#fde047' 
  },
  info: { 
    bg: 'rgba(99, 102, 241, 0.15)', 
    border: 'rgba(99, 102, 241, 0.3)', 
    icon: Icons.Info, 
    iconColor: '#a5b4fc' 
  }
};

export function ToastContainer() {
  const { state, dispatch } = useApp();

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {state.toasts.map(toast => {
        const style = toastStyles[toast.type] || toastStyles.info;
        const Icon = style.icon;
        
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-in max-w-sm backdrop-blur-sm"
            style={{ 
              background: style.bg, 
              border: `1px solid ${style.border}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
            role="alert"
          >
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: style.iconColor }} />
            <p className="text-sm text-gray-100 flex-1">{toast.message}</p>
            <button
              onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
              className="transition-colors hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Dismiss notification"
            >
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
