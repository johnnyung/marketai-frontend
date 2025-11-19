// src/components/Sidebar.tsx
// Complete V2 Sidebar with Technical Analysis

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard,
  Target,
  BookOpen,
  FileText,
  Database,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  Brain,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Command Center',
      description: 'V2 Data Collection',
      badge: 'LIVE'
    },
    { 
      path: '/diagnostics', 
      icon: Activity, 
      label: 'System Health',
      description: 'Real vs Mock Data',
      badge: 'NEW'
    },
    { 
      path: '/ai-tip-tracker', 
      icon: Target, 
      label: 'AI Tip Tracker',
      description: 'Track Performance',
      badge: null
    },
    { 
      path: '/correlation-lab', 
      icon: TrendingUp, 
      label: 'Correlation Lab',
      description: 'Crypto→Stock Patterns',
      badge: 'AI'
    },
    { 
      path: '/digest', 
      icon: BookOpen, 
      label: 'Intelligence Digest',
      description: 'AI-Connected Events',
      badge: 'NEW'
    },
    { 
      path: '/technical', 
      icon: BarChart3, 
      label: 'Event Analyzer',
      description: 'AI Event Intelligence',
      badge: 'NEW'
    },
    { 
      path: '/deep-dive', 
      icon: FileText, 
      label: 'Deep Dive',
      description: '20-Point Analysis',
      badge: 'PRO'
    },
    { 
      path: '/data-monitor', 
      icon: Database, 
      label: 'Data Monitor',
      description: '20+ Live Sources',
      badge: 'LIVE'
    },
  ];

  const dataStatus = [
    { label: 'News & RSS', status: 'active', count: '2,450' },
    { label: 'Crypto Impact', status: 'active', count: '850' },
    { label: 'Executive Moves', status: 'active', count: '340' },
    { label: 'SEC Filings', status: 'active', count: '1,200' },
    { label: 'Mergers & Acquisitions', status: 'active', count: '95' },
    { label: 'Interest Rates', status: 'active', count: '15' },
    { label: 'Event Trends', status: 'collecting', count: '450' },
    { label: 'Insider Trading', status: 'active', count: '620' },
    { label: 'Social Sentiment', status: 'active', count: '1,340' },
    { label: 'Options Flow', status: 'active', count: '890' },
    { label: 'Political News', status: 'active', count: '230' },
    { label: 'Economic Data', status: 'collecting', count: '45' },
    { label: 'Wars & Conflicts', status: 'active', count: '18' },
    { label: 'Market Titans', status: 'active', count: '92' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col
          transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MarketAI V2</h1>
              <p className="text-xs text-gray-400">Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="py-4">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all relative group
                    ${active 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium text-sm block">{item.label}</span>
                    <span className="text-xs opacity-75">{item.description}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      item.badge === 'LIVE' ? 'bg-green-500 text-white animate-pulse' :
                      item.badge === 'NEW' ? 'bg-yellow-500 text-gray-900' :
                      item.badge === 'PRO' ? 'bg-purple-500 text-white' :
                      item.badge === 'HOT' ? 'bg-orange-500 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Data Collection Status */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Live Data Sources (20+)
            </h3>
          </div>
          <div className="space-y-2">
            {dataStatus.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    item.status === 'active' ? 'bg-green-400' : 
                    item.status === 'collecting' ? 'bg-yellow-400 animate-pulse' : 
                    'bg-gray-500'
                  }`} />
                  <span className="text-gray-300">{item.label}</span>
                </div>
                <span className="text-gray-400 font-mono">{item.count}</span>
              </div>
            ))}
          </div>

          {/* System Stats */}
          <div className="mt-6 space-y-3">
            {/* AI Status */}
            <div className="p-3 bg-purple-900/30 rounded-lg border border-purple-700">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300">AI Analysis</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Last Run:</span>
                  <span className="text-white">2 min ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommendations:</span>
                  <span className="text-green-400 font-bold">18 Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="text-green-400 font-bold">78.5%</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="p-3 bg-green-900/30 rounded-lg border border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs font-semibold text-green-300">Portfolio Performance</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Total P/L:</span>
                  <span className="text-green-400 font-bold">+$14,285</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="text-green-400 font-bold">68.2%</span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-300">System Health</span>
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-green-400 font-bold">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Points:</span>
                  <span className="text-white font-bold">1.5M+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors border border-red-800"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-gray-500">
            MarketAI V2.2 • Technical Analysis • © 2025
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
