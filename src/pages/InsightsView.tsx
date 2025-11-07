import { motion } from 'framer-motion';
import { TrendingUp, Check } from 'lucide-react';

interface InsightsViewProps {
  density: 'comfort' | 'compact';
}

export function InsightsView({ density }: InsightsViewProps) {
  const cardPadding = density === 'comfort' ? 'p-6' : 'p-4';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Insights
      </h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card ${cardPadding} text-center space-y-4`}
      >
        <TrendingUp className="w-16 h-16 mx-auto text-blue-500 opacity-50" />
        
        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Insights Dashboard Coming Soon
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AI confidence trends, validated source leaderboard, and sector heat maps will render here as data accumulates.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <Check className="w-5 h-5" />
            <span>Learning from 12 validated stories this week</span>
          </div>
        </div>
      </motion.div>

      {/* Future Features Teaser */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'AI Confidence Trends',
            desc: 'Track how AI prediction accuracy evolves over time',
          },
          {
            title: 'Source Reliability',
            desc: 'Leaderboard of most accurate news sources',
          },
          {
            title: 'Sector Heat Map',
            desc: 'Visual breakdown of market activity by sector',
          },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass-card ${cardPadding}`}
          >
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {feature.title}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
