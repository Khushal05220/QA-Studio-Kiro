import { useEffect } from 'react';
import { navigate } from '../router/Router';

export function useKeyboardShortcuts(dispatch) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + K: Open command palette / quick create
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: 'OPEN_MODAL', payload: 'quickCreate' });
        return;
      }

      // Ctrl/Cmd + Shift + T: Go to test cases
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        navigate('/test-cases');
        return;
      }

      // Ctrl/Cmd + Shift + S: Go to scripts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        navigate('/test-scripts');
        return;
      }

      // Ctrl/Cmd + Shift + A: Go to API testing
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/api-testing');
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        dispatch({ type: 'CLOSE_MODAL', payload: 'quickCreate' });
        dispatch({ type: 'CLOSE_MODAL', payload: 'apiStatus' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
}
