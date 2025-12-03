import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Extract tokens from URL hash
    const extractTokensFromUrl = () => {
      const hash = window.location.hash;
      const fullUrl = window.location.href;
      
      console.log('Checking URL for recovery token:', fullUrl);
      
      // Extract access_token and refresh_token from URL
      // Format: #/reset-password#access_token=...&expires_in=...&refresh_token=...&token_type=bearer&type=recovery
      const params = new URLSearchParams(hash.split('#').pop());
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      console.log('Extracted tokens:', { accessToken: accessToken ? 'present' : 'missing', refreshToken: refreshToken ? 'present' : 'missing', type });
      
      return { accessToken, refreshToken, type };
    };

    const { accessToken, refreshToken, type } = extractTokensFromUrl();
    const hasRecoveryToken = type === 'recovery';
    
    if (hasRecoveryToken) {
      console.log('Recovery token detected in URL!');
      setIsPasswordRecovery(true);
    }

    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', session);
      
      // Detect password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event received!');
        setIsPasswordRecovery(true);
        setUser(session?.user ?? null);
        setLoading(false);
      } else if (event === 'USER_UPDATED') {
        // Password was updated, clear recovery mode
        setIsPasswordRecovery(false);
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_IN') {
        console.log('SIGNED_IN event');
        // Check if this is a recovery sign-in
        if (hasRecoveryToken) {
          console.log('SIGNED_IN with recovery token - treating as recovery');
          setIsPasswordRecovery(true);
        }
        setUser(session?.user ?? null);
        setLoading(false);
      } else {
        setUser(session?.user ?? null);
      }
    });

    // Check session and handle recovery token exchange
    const initializeAuth = async () => {
      try {
        // If we have recovery tokens in URL, manually set the session
        if (hasRecoveryToken && accessToken && refreshToken) {
          console.log('Manually setting session from recovery tokens');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          console.log('Set session result:', data, 'Error:', error);
          
          if (data.session) {
            setUser(data.session.user);
            setIsPasswordRecovery(true);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname + '#/reset-password');
          }
        } else {
          // Get current session normally
          const { data: { session }, error } = await supabase.auth.getSession();
          console.log('Initial session:', session, 'Error:', error);
          
          setUser(session?.user ?? null);
          
          // If we have a session and detected recovery token, ensure recovery mode
          if (session && hasRecoveryToken) {
            console.log('Session exists with recovery token - enabling recovery mode');
            setIsPasswordRecovery(true);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  const resetPassword = async (email) => {
    // Use the full URL with hash routing
    const redirectUrl = `${window.location.origin}${window.location.pathname}#/reset-password`;
    console.log('Password reset redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    // Check if we have a session first
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Update password - current session:', session);
    
    if (!session) {
      throw new Error('Auth session missing! Please request a new password reset link.');
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  const value = {
    user,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearPasswordRecovery,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
