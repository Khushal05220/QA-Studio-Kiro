import { useApp } from '../context/AppContext';
import { Icons } from '../components/ui/Icons';
import { navigate } from '../router/Router';

const quickActions = [
  { id: 'test-cases', label: 'Generate Test Cases', desc: 'AI-powered test case generation', icon: 'ClipboardList', path: '/test-cases', gradient: 'from-indigo-500 to-purple-500' },
  { id: 'test-scripts', label: 'Generate Test Script', desc: 'Playwright, Cypress, Selenium', icon: 'Code', path: '/test-scripts', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'ada-audit', label: 'ADA Auditor', desc: 'WCAG compliance analysis', icon: 'Eye', path: '/ada-auditor', gradient: 'from-purple-500 to-pink-500' },
  { id: 'api-test', label: 'API Testing', desc: 'Test REST & GraphQL APIs', icon: 'Server', path: '/api-testing', gradient: 'from-orange-500 to-red-500' },
  { id: 'test-plan', label: 'Test Plans', desc: 'Create comprehensive plans', icon: 'Document', path: '/test-plans', gradient: 'from-green-500 to-teal-500' },
  { id: 'backlog', label: 'STLC Backlog', desc: 'Manage stories & bugs', icon: 'Kanban', path: '/stlc', gradient: 'from-pink-500 to-rose-500' }
];

export function Home() {
  const { state } = useApp();
  const { testCases, userStories, bugs, testPlans } = state;

  const stats = [
    { label: 'Test Cases', value: testCases.length, icon: 'ClipboardList', color: '#6366f1' },
    { label: 'User Stories', value: userStories.length, icon: 'FileText', color: '#14b8a6' },
    { label: 'Bugs', value: bugs.length, icon: 'Bug', color: '#f43f5e' },
    { label: 'Test Plans', value: testPlans.length, icon: 'Document', color: '#8b5cf6' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 overflow-auto h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(20, 184, 166, 0.1) 100%)', border: '1px solid var(--border)' }}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Welcome to QA Studio</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>AI-powered testing workflow automation for modern QA teams</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => {
          const Icon = Icons[stat.icon];
          return (
            <div key={stat.label} className="card-hover cursor-pointer" onClick={() => navigate('/library')}>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map(action => {
            const Icon = Icons[action.icon];
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className="group text-left p-5 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)'
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.gradient} shadow-lg`}
                    style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-200 group-hover:text-white transition-colors block mb-1">
                      {action.label}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {action.desc}
                    </span>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            {(testCases.length > 0 || userStories.length > 0) && (
              <button
                onClick={() => navigate('/library')}
                className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View All <Icons.ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {testCases.length === 0 && userStories.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--bg-tertiary)' }}>
                <Icons.ClipboardList className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">No recent activity</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">Start by generating test cases</p>
            </div>
          ) : (
            <div className="space-y-2">
              {testCases.slice(0, 3).map(tc => (
                <div key={tc.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5" style={{ background: 'var(--bg-tertiary)' }}>
                  <Icons.ClipboardList className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-gray-300 truncate flex-1">{tc.title}</span>
                  <span className="badge-primary text-xs">Test Case</span>
                </div>
              ))}
              {userStories.slice(0, 2).map(story => (
                <div key={story.id} className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-white/5" style={{ background: 'var(--bg-tertiary)' }}>
                  <Icons.FileText className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-gray-300 truncate flex-1">{story.title}</span>
                  <span className="badge-teal text-xs">Story</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Features */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">AI Capabilities</h3>
          <div className="space-y-4">
            {[
              { icon: 'Sparkles', color: '#6366f1', title: 'Test Case Generation', desc: 'Generate comprehensive test cases from user stories' },
              { icon: 'Code', color: '#3b82f6', title: 'Script Generation', desc: 'Create automation scripts for popular frameworks' },
              { icon: 'Eye', color: '#a855f7', title: 'Accessibility Auditing', desc: 'AI-powered WCAG compliance analysis' },
              { icon: 'Zap', color: '#eab308', title: 'Smart Assertions', desc: 'Auto-generate API test assertions' }
            ].map((feature, i) => {
              const Icon = Icons[feature.icon];
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${feature.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: feature.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{feature.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
