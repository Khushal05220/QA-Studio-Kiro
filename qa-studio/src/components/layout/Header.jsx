import React from 'react';
import { useApp } from '../../context/AppContext';
import { ApiStatusIndicator } from '../ui/ApiStatusIndicator';
import { Icons } from '../ui/Icons';

export function Header() {
  const { state, dispatch } = useApp();

  return (
    <header 
      className="px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40"
      style={{ 
        background: 'var(--bg-secondary)', 
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU' })}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          {state.mobileMenuOpen ? (
            <Icons.X className="w-5 h-5 text-gray-400" />
          ) : (
            <Icons.Menu className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <a href="#/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #14b8a6 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Icons.Beaker className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold gradient-text">QA Studio</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>AI-Powered Testing</p>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ApiStatusIndicator onClick={() => dispatch({ type: 'OPEN_MODAL', payload: 'apiStatus' })} />
      </div>
    </header>
  );
}
