import React from 'react';

export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex border-b border-gray-800 ${className}`} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-700 rounded">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({ children, isActive }) {
  if (!isActive) return null;
  return <div role="tabpanel">{children}</div>;
}
