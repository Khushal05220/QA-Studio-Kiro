import { Router } from './router/Router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { QuickCreateModal } from './components/modals/QuickCreateModal';
import { ApiStatusModal } from './components/modals/ApiStatusModal';
import { ToastContainer } from './components/ui/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import { Icons } from './components/ui/Icons';

function AppContent() {
  const { dispatch } = useApp();
  const { user, loading, isPasswordRecovery } = useAuth();
  useKeyboardShortcuts(dispatch);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Icons.Beaker className="w-8 h-8 text-white" />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading QA Studio...</p>
        </div>
      </div>
    );
  }

  // Check if this is a reset password route (allow without auth)
  const currentHash = window.location.hash;
  const isResetPasswordRoute = currentHash.startsWith('#/reset-password') || currentHash.includes('type=recovery');
  
  if (isResetPasswordRoute) {
    return <ResetPassword />;
  }

  // Show password reset form if in recovery mode
  if (isPasswordRecovery) {
    return <Login />;
  }

  const isLoginRoute = window.location.hash === '#/login' || window.location.hash === '';
  
  if (!user && !isLoginRoute) {
    window.location.hash = '#/login';
    return null;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Router />
        </main>
      </div>
      <QuickCreateModal />
      <ApiStatusModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
