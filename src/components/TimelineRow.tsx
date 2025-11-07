import { ExternalLink } from 'lucide-react';
import type { TimelineItem } from '../types';

interface TimelineRowProps {
  item: TimelineItem;
  density?: 'comfort' | 'compact';
}

export function TimelineRow({ item, density = 'comfort' }: TimelineRowProps) {
  const padding = density === 'comfort' ? 'p-4' : 'p-3';

  const handleOpenSources = () => {
    alert(`Opening sources:\n\n${item.sources.join('\n')}\n\n(Phase 2: Will open actual source links)`);
  };

  return (
    <div className={`glass-card ${padding} space-y-2`}>
      {/* When */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {item.when}
        </span>
        <button 
          onClick={handleOpenSources}
          className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Open sources
        </button>
      </div>

      {/* What */}
      <h5 className="font-semibold text-slate-900 dark:text-slate-100">
        {item.what}
      </h5>

      {/* Why */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
          Why it matters
        </p>
        <p className="text-sm text-amber-900 dark:text-amber-100">
          {item.why}
        </p>
      </div>
    </div>
  );
}
