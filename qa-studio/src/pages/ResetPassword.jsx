import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Icons } from '../components/ui/Icons';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Extract tokens from URL
        const hash = window.location.hash;
        const fullUrl = window.location.href;
        
        console.log('ResetPassword: Checking URL:', fullUrl);
        
        // Parse tokens from URL - handle double hash format
        // Format: #/reset-password#access_token=...&refresh_token=...&type=recovery
        let tokenPart = '';
        if (hash.includes('#access_token=')) {
          tokenPart = hash.split('#access_token=')[1];
          tokenPart = 'access_token=' + tokenPart;
        } else if (fullUrl.includes('#access_token=')) {
          tokenPart = fullUrl.split('#access_token=')[1];
          tokenPart = 'access_token=' + tokenPart;
        }
        
        const params = new URLSearchParams(tokenPart);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        
        console.log('ResetPassword: Tokens found:', { 
          accessToken: accessToken ? 'yes' : 'no', 
          refreshToken: refreshToken ? 'yes' : 'no', 
          type 
        });

        if (accessToken && refreshToken && type === 'recovery') {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          console.log('ResetPassword: setSession result:', { data, error });
          
          if (data.session) {
            setSessionReady(true);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname + '#/reset-password');
          } else if (error) {
            setError('Invalid or expired reset link. Please request a new one.');
          }
        } else {
          // Check if we already have a session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setSessionReady(true);
          } else {
            setError('No valid reset token found. Please request a new password reset link.');
          }
        }
      } catch (err) {
        console.error('ResetPassword: Error:', err);
        setError('An error occurred. Please try again.');
      } finally {
        setInitializing(false);
      }
    };

    initSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setMessage('Password updated successfully! Redirecting to login...');
      
      // Sign out and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.hash = '#/login';
      }, 2000);
    } catch (err) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)' }}>
            <Icons.Beaker className="w-8 h-8 text-white" />
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)' }}>
            <Icons.Beaker className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">QA Studio</h1>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Set New Password</h2>

          {!sessionReady ? (
            <div className="text-center">
              <div className="px-4 py-3 rounded-lg text-sm text-red-300 mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                {error || 'Unable to verify reset link'}
              </div>
              <button onClick={() => window.location.hash = '#/login'} className="btn-primary w-full py-3">
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                  {error}
                </div>
              )}

              {message && (
                <div className="px-4 py-3 rounded-lg text-sm text-green-300" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                  {message}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => window.location.hash = '#/login'} className="text-sm" style={{ color: '#a5b4fc' }}>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
