import React from 'react';

const variants = {
  default: 'bg-gray-500/20 text-gray-400',
  teal: 'bg-teal-500/20 text-teal-400',
  blue: 'bg-blue-500/20 text-blue-400',
  red: 'bg-red-500/20 text-red-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  green: 'bg-green-500/20 text-green-400',
  purple: 'bg-purple-500/20 text-purple-400'
};

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const variant = {
    Critical: 'red',
    High: 'yellow',
    Medium: 'blue',
    Low: 'default'
  }[priority] || 'default';
  
  return <Badge variant={variant}>{priority}</Badge>;
}

export function StatusBadge({ status }) {
  const variant = {
    New: 'default',
    Active: 'blue',
    'In Progress': 'yellow',
    Testing: 'purple',
    Done: 'green',
    Closed: 'default'
  }[status] || 'default';
  
  return <Badge variant={variant}>{status}</Badge>;
}
