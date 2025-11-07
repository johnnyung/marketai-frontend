import { ThumbsUp, ThumbsDown, TrendingUp } from 'lucide-react';
import { Badge } from './Badge';
import type { SurpriseStory } from '../types';

interface StoryCardProps {
  story: SurpriseStory;
  onApprove?: (storyId: string) => void;
  onDismiss?: (storyId: string) => void;
  density?: 'comfort' | 'compact';
}

export function StoryCard({ story, onApprove, onDismiss, density = 'comfort' }: StoryCardProps) {
  const padding = density === 'comfort' ? 'p-4' : 'p-3';
  const confidence = Math.round(story.confidence * 100);

  return (
    <div className={`glass-card ${padding} space-y-3 hover:shadow-xl transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex-1">
          {story.headline}
        </h4>
        <Badge tone={confidence >= 80 ? 'success' : 'warn'}>
          <TrendingUp className="w-3 h-3 mr-1" />
          {confidence}% AI
        </Badge>
      </div>

      {/* Why it matters */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
          Why it matters
        </p>
        <p className="text-sm text-blue-900 dark:text-blue-100">
          {story.why}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {story.source} • {story.timestamp}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onApprove?.(story.id)}
            disabled={story.approved === true}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                     bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300
                     hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => onDismiss?.(story.id)}
            disabled={story.approved === false}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                     bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                     hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
