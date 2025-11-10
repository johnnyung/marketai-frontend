import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Newspaper,
  Brain,
  DollarSign,
  TrendingUp,
  Eye,
  BookOpen,
  Calendar,
  GraduationCap,
  Lightbulb,
  Settings,
  Target
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/digest', icon: Newspaper, label: 'Digest' },
    { path: '/daily-intelligence', icon: Brain, label: 'Daily Intelligence' },
    { path: '/ai-tip-tracker', icon: Target, label: 'AI Tip Tracker' },
    { path: '/futures', icon: DollarSign, label: 'Futures Trading' },
    { path: '/watchlist', icon: Eye, label: 'Watchlist' },
    { path: '/journal', icon: BookOpen, label: 'Trade Journal' },
    { path: '/calendar', icon: Calendar, label: 'Economic Calendar' },
    { path: '/learning', icon: GraduationCap, label: 'Learning Lab' },
    { path: '/insights', icon: Lightbulb, label: 'Insights' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">MarketAI</h1>
        <p className="text-sm text-gray-600">AI-Powered Trading</p>
      </div>
      
      <nav className="px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
