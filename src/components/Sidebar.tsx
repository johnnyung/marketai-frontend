import { Home, Search, Calendar, BookOpen, FileText, Gamepad2, TrendingUp, Brain, Settings, LogOut, Moon, Sun, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';
import type { PageId, Theme, Density } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
  theme: Theme;
  density: Density;
  onToggleTheme: () => void;
  onToggleDensity: () => void;
  username?: string;
}

const navItems: { id: PageId; icon: any; label: string }[] = [
  { id: 'digest', icon: Home, label: 'Digest' },
  { id: 'intelligence', icon: Brain, label: 'Daily Intelligence' },
  { id: 'research', icon: Search, label: 'Watchlist' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'learning', icon: BookOpen, label: 'Learning Lab' },
  { id: 'journal', icon: FileText, label: 'Trade Journal' },
  { id: 'game', icon: Gamepad2, label: 'Game Mode' },
  { id: 'futures', icon: TrendingUp, label: 'Futures Trading' },
  { id: 'insights', icon: TrendingUp, label: 'Insights' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({
  currentPage,
  onPageChange,
  theme,
  density,
  onToggleTheme,
  onToggleDensity,
  username,
}: SidebarProps) {
  const { logout } = useAuth();
  const padding = density === 'comfort' ? 'p-6' : 'p-4';

  return (
    <div className={`glass-sidebar w-72 flex flex-col ${padding} gap-8`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              MarketAI
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-0.5">
              AI INVESTMENT CO-PILOT
            </p>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 
                     transition-all duration-200 hover:scale-105 group"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            ) : (
              <Sun className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={clsx(
                'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl shadow-blue-500/30 scale-105'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:scale-102 hover:pl-5'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive && 'drop-shadow-lg')} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Spacer to push logout to bottom */}
        <div className="flex-1" />

        {/* Logout Button */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-semibold text-[15px] 
                     text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 
                     hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:scale-102"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
          {username && (
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3">
              Logged in as <span className="font-semibold">{username}</span>
            </p>
          )}
        </div>
      </nav>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <button
          onClick={onToggleDensity}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl
                   text-sm font-semibold text-slate-700 dark:text-slate-300
                   bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 
                   transition-all duration-200 hover:scale-102"
        >
          <span>Display Density</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize font-medium">
              {density}
            </span>
            {density === 'comfort' ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </div>
        </button>
        
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider">
          VERSION 1.0.0
        </div>
      </div>
    </div>
  );
}
