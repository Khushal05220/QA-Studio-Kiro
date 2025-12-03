import React, { useState } from 'react';
import { Icons } from './Icons';

export function Accordion({ items, defaultExpanded = [] }) {
  const [expanded, setExpanded] = useState(new Set(defaultExpanded));

  const toggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="card p-0 overflow-hidden">
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors text-left"
            aria-expanded={expanded.has(item.id)}
          >
            <div className="flex items-center gap-3">
              {expanded.has(item.id) 
                ? <Icons.ChevronDown className="w-5 h-5 text-gray-400" />
                : <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
              }
              <span className="font-medium text-white">{item.title}</span>
              {item.badge && <span className="badge-gray">{item.badge}</span>}
            </div>
            {item.actions}
          </button>
          
          {expanded.has(item.id) && (
            <div className="border-t border-gray-800 p-4">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
