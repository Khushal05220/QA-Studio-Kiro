import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/ui/Icons';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, resetPassword, updatePassword, isPasswordRecovery, clearPasswordRecovery } = useAuth();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      await updatePassword(newPassword);
      setMessage('Password updated successfully! Redirecting...');
      
      setTimeout(() => {
        setNewPassword('');
        setConfirmNewPassword('');
        window.location.hash = '#/';
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
      } else if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const { data } = await signUp(email, password);
        
        if (data?.user && !data.session) {
          setMessage('Account created! Check your email to verify.');
        } else {
          setMessage('Account created! You can now sign in.');
          setIsSignUp(false);
        }
      } else {
        await signIn(email, password);
        window.location.hash = '#/';
      }
    } catch (err) {
      if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email first.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Form
  if (isPasswordRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)' }}>
              <Icons.Beaker className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">QA Studio</h1>
          </div>

          <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-semibold text-white mb-6 text-center">Set New Password</h2>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" required minLength={6} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input" placeholder="••••••••" required />
              </div>

              {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>{error}</div>}
              {message && <div className="px-4 py-3 rounded-lg text-sm text-green-300" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>{message}</div>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => { clearPasswordRecovery(); window.location.hash = '#/login'; }} className="text-sm" style={{ color: '#a5b4fc' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Login Form
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)' }}>
            <Icons.Beaker className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">QA Studio</h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-powered testing workflow automation</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
            </div>

            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                  {!isSignUp && <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs" style={{ color: '#a5b4fc' }}>Forgot password?</button>}
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input" placeholder="••••••••" required />
              </div>
            )}

            {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>{error}</div>}
            {message && <div className="px-4 py-3 rounded-lg text-sm text-green-300" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>{message}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <button onClick={() => setIsForgotPassword(false)} className="text-sm" style={{ color: '#a5b4fc' }}>Back to Sign In</button>
            ) : (
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm" style={{ color: '#a5b4fc' }}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
