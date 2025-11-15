// src/components/Sidebar.tsx
// Enhanced Sidebar with Login/Logout functionality + PHASE 4 AI Tip Tracker

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Brain, 
  Target,
  TrendingUp,
  Calendar,
  GraduationCap,
  Lightbulb,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Link2,
  FileText,
  Rocket
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
    // INTELLIGENCE HUB
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/daily-intelligence', icon: Brain, label: 'Daily Intelligence' },
    { path: '/deep-dive', icon: FileText, label: 'Deep Dive' },
    { path: '/digest', icon: BookOpen, label: 'Intelligence Digest' },
    { path: '/intelligence-threads', icon: Link2, label: 'Intelligence Threads' },
    { path: '/opportunity-hub', icon: Rocket, label: 'Opportunity Hub' },
    
    // PERFORMANCE TRACKING - PHASE 4
    { path: '/ai-tip-tracker', icon: Target, label: 'AI Tip Tracker', badge: '🧠' },
    
    // TRADING & LEARNING
    { path: '/futures', icon: TrendingUp, label: 'Futures Trading' },
    { path: '/learning', icon: GraduationCap, label: 'Learning Lab' },
    
    // UTILITY
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: '/insights', icon: Lightbulb, label: 'Insights' },
    { path: '/settings', icon: Settings, label: 'Settings' },
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
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col
          transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MarketAI</h1>
              <p className="text-xs text-gray-500">Trading Intelligence</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative
                    ${active 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-base" title="Phase 4 - Pattern Recognition">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Version Info */}
        <div className="px-4 pb-4 text-center">
          <p className="text-xs text-gray-500">
            MarketAI v2.0 • Phase 4 🧠 • © 2025
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
