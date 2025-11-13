// src/pages/AITipTracker.tsx
// Enhanced AI Tip Tracker with Analytics and Leaderboard

import React, { useState } from 'react';
import { Target, BarChart3, Trophy } from 'lucide-react';
import AITipTrackerPositions from '../components/AITipTrackerPositions';
import { PerformanceAnalytics } from '../components/PerformanceAnalytics';
import { TopPerformersLeaderboard } from '../components/TopPerformersLeaderboard';

const AITipTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'positions' | 'analytics' | 'leaderboard'>('positions');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🎯 AI Tip Tracker
        </h1>
        <p className="text-xl text-gray-600">
          Proving AI Works: Every recommendation tracked with mock $100 investment
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Transparent • Accountable • Performance-Driven
        </p>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('positions')}
              className={`flex-1 px-6 py-4 text-center font-medium flex items-center justify-center gap-2 ${
                activeTab === 'positions'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Target className="w-5 h-5" />
              Positions
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-4 text-center font-medium flex items-center justify-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-6 py-4 text-center font-medium flex items-center justify-center gap-2 ${
                activeTab === 'leaderboard'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'positions' && <AITipTrackerPositions />}
          {activeTab === 'analytics' && <PerformanceAnalytics />}
          {activeTab === 'leaderboard' && <TopPerformersLeaderboard />}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 How It Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span>Every AI BUY/SELL recommendation is automatically tracked with a mock $100 investment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span>Prices update in real-time, showing live profit/loss on each position</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span>Positions close automatically based on AI exit signals or time limits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span>All performance data is transparent - wins, losses, and overall accuracy</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AITipTracker;
