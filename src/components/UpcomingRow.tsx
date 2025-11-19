import { Bell, FileText } from 'lucide-react';
import type { UpcomingDate } from '../types';

interface UpcomingRowProps {
  item: UpcomingDate;
  density?: 'comfort' | 'compact';
}

export function UpcomingRow({ item, density = 'comfort' }: UpcomingRowProps) {
  const padding = density === 'comfort' ? 'p-4' : 'p-3';

  const handleAddAlert = () => {
    alert(`Alert added for:\n\n${item.title}\n${item.date}\n\n✅ You'll be notified before this event`);
  };

  const handleAddNotes = () => {
    alert(`Add notes for:\n\n${item.title}\n\nCurrent note: ${item.note}\n\n(Phase 2: Full note editor coming)`);
  };

  return (
    <div className={`glass-card ${padding} flex items-start justify-between gap-4`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {item.date}
          </span>
        </div>
        <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {item.title}
        </h5>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {item.note}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAddAlert}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                   hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hover:scale-105"
          title="Add alert"
        >
          <Bell className="w-4 h-4" />
        </button>
        <button
          onClick={handleAddNotes}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                   hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors hover:scale-105"
          title="Add notes"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
