import React from 'react';
import { useRoute } from '../../router/Router';
import { Icons } from '../ui/Icons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const navItems = [
  { path: '', label: 'Dashboard', icon: 'Home' },
  { path: 'library', label: 'Library', icon: 'FolderOpen' },
  { path: 'test-cases', label: 'Test Cases', icon: 'ClipboardList' },
  { path: 'test-scripts', label: 'Test Scripts', icon: 'Code' },
  { path: 'ada-auditor', label: 'ADA Auditor', icon: 'Eye' },
  { path: 'api-testing', label: 'API Testing', icon: 'Server' },
  { path: 'test-plans', label: 'Test Plans', icon: 'Document' },
  { path: 'stlc', label: 'STLC / Backlog', icon: 'Kanban' },
  { path: 'settings', label: 'Settings', icon: 'Cog' }
];

export function Sidebar() {
  const currentPath = useRoute();
  const { user, signOut } = useAuth();
  const { state, dispatch } = useApp();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.hash = '#/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    // Close mobile menu when navigating
    if (state.mobileMenuOpen) {
      dispatch({ type: 'TOGGLE_MOBILE_MENU' });
    }
  };

  const sidebarClasses = state.mobileMenuOpen
    ? 'fixed inset-0 z-50 flex flex-col lg:relative lg:w-64 lg:flex-shrink-0'
    : 'w-64 flex-shrink-0 hidden lg:flex flex-col';

  return (
    <>
      {/* Mobile Overlay */}
      {state.mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU' })}
        />
      )}
      
      <aside 
        className={sidebarClasses} 
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}
      >
      {/* User Profile */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>QA Engineer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin" role="navigation" aria-label="Main navigation">
        {navItems.map(item => {
          const Icon = Icons[item.icon];
          const isActive = currentPath === item.path;
          
          return (
            <a
              key={item.path}
              href={`#/${item.path}`}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent'
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-400'}`} />}
              <span className="font-medium text-sm">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 transition-all duration-200 group"
          style={{ background: 'transparent' }}
        >
          <Icons.LogOut className="w-5 h-5 group-hover:text-red-400" />
          <span className="font-medium text-sm">Logout</span>
        </button>
        <p className="text-xs mt-3 px-3 hidden sm:block" style={{ color: 'var(--text-muted)' }}>
          <kbd className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>⌘K</kbd> Quick actions
        </p>
      </div>
    </aside>
    </>
  );
}
