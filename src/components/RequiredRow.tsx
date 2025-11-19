import { Clock, Bell } from 'lucide-react';
import { Badge } from './Badge';
import type { RequiredEvent } from '../types';

interface RequiredRowProps {
  event: RequiredEvent;
  onAddAlert?: (eventId: string) => void;
  density?: 'comfort' | 'compact';
}

export function RequiredRow({ event, onAddAlert, density = 'comfort' }: RequiredRowProps) {
  const padding = density === 'comfort' ? 'p-4' : 'p-3';

  const getCategoryTone = (category: string) => {
    switch (category) {
      case 'macro':
        return 'info';
      case 'earnings':
        return 'success';
      case 'policy':
        return 'warn';
      case 'regulatory':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className={`glass-card ${padding} flex items-start justify-between gap-4 hover:shadow-xl transition-shadow`}>
      <div className="flex items-start gap-3 flex-1">
        {/* Time Badge */}
        <Badge tone="info">
          <Clock className="w-3 h-3 mr-1" />
          {event.time}
        </Badge>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {event.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {event.meta}
          </p>
          <div className="mt-2">
            <Badge tone={getCategoryTone(event.category)} className="text-xs">
              {event.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Alert Button */}
      <button
        onClick={() => onAddAlert?.(event.id)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                   transition-colors ${
                     event.hasAlert
                       ? 'bg-blue-500 text-white'
                       : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                   }`}
      >
        <Bell className="w-4 h-4" />
        {event.hasAlert ? 'Added' : 'Alert'}
      </button>
    </div>
  );
}
