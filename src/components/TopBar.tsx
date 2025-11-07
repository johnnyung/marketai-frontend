import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  density: 'comfort' | 'compact';
}

export function TopBar({ density }: TopBarProps) {
  const padding = density === 'comfort' ? 'py-4 px-8' : 'py-3 px-6';

  return (
    <div className={`glass-card border-0 border-b ${padding} flex items-center justify-between sticky top-0 z-40`}>
      {/* Search Input */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search events, companies, topics..."
            className="w-full pl-12 pr-6 py-3.5 rounded-2xl border-2 bg-slate-50/50 border-slate-200/60 
                     focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none focus:bg-white/80
                     dark:bg-slate-900/30 dark:border-slate-700/60 dark:focus:border-blue-400 dark:focus:bg-slate-900/50
                     text-sm font-medium placeholder:text-slate-400 transition-all duration-200
                     hover:border-slate-300 dark:hover:border-slate-600"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Current Time */}
        <div className="flex flex-col items-end">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              timeZone: 'America/Los_Angeles',
            })}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Pacific Time
          </div>
        </div>

        {/* Alerts Button */}
        <button
          className="relative p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700
                   transition-all duration-200 hover:scale-105 group"
          aria-label="Alerts"
        >
          <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            3
          </span>
        </button>
      </div>
    </div>
  );
}
