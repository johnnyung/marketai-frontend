// src/components/TopPerformersLeaderboard.tsx
// Leaderboard showing best AI recommendations

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Medal, Award, Star, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface TopPerformer {
  rank: number | string;
  ticker: string;
  company_name: string;
  entry_date: string;
  exit_date: string;
  days_held: number | string;
  pnl_pct: number | string;
  pnl_amount: number | string;
  ai_confidence: number | string;
  recommendation_type: string;
}

interface RecentWin {
  ticker: string;
  company_name: string;
  exit_date: string;
  pnl_pct: number | string;
  pnl_amount: number | string;
  days_held: number | string;
  ai_confidence: number | string;
}

export const TopPerformersLeaderboard: React.FC = () => {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all-time' | 'recent'>('all-time');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [topRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/top-performers?limit=10`, { headers }),
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/recent-wins?days=7`, { headers })
      ]);

      if (topRes.ok) {
        const data = await topRes.json();
        setTopPerformers(data.data);
      }

      if (recentRes.ok) {
        const data = await recentRes.json();
        setRecentWins(data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMedalIcon = (rank: number | string) => {
    const rankNum = typeof rank === 'string' ? parseInt(rank) : rank;
    switch (rankNum) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-orange-600" />;
      default:
        return <Award className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number | string) => {
    const rankNum = typeof rank === 'string' ? parseInt(rank) : rank;
    switch (rankNum) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-10 h-10" />
          <h2 className="text-3xl font-bold">🏆 Top Performers</h2>
        </div>
        <p className="text-yellow-100 text-lg">
          Hall of Fame: Our best AI recommendations of all time
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all-time')}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'all-time'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              All-Time Best
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'recent'
                  ? 'border-b-2 border-yellow-500 text-yellow-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Recent Wins (7 days)
            </button>
          </nav>
        </div>

        {/* All-Time Top Performers */}
        {activeTab === 'all-time' && (
          <div className="p-6">
            {topPerformers.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No closed positions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.rank}
                    className={`border-2 rounded-xl p-5 transition-all ${
                      Number(performer.rank) <= 3
                        ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getRankBadgeColor(performer.rank)}`}>
                          {Number(performer.rank) <= 3 ? (
                            getMedalIcon(performer.rank)
                          ) : (
                            <span className="text-2xl font-bold">#{performer.rank}</span>
                          )}
                        </div>
                      </div>

                      {/* Stock Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{performer.ticker}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {performer.recommendation_type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{performer.company_name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Entry: {formatDate(performer.entry_date)}</span>
                          <span>Exit: {formatDate(performer.exit_date)}</span>
                          <span>Held: {performer.days_held} days</span>
                          <span>Confidence: {performer.ai_confidence}%</span>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="flex-shrink-0 text-right">
                        <div className="mb-2">
                          <span className="text-4xl font-bold text-green-600">
                            {formatPercent(performer.pnl_pct)}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(performer.pnl_amount)}
                        </div>
                      </div>
                    </div>

                    {/* Special badges for top 3 */}
                    {performer.rank === 1 && (
                      <div className="mt-3 flex items-center gap-2 text-yellow-700">
                        <Star className="w-5 h-5 fill-yellow-400" />
                        <span className="text-sm font-semibold">🏆 BEST PERFORMANCE OF ALL TIME!</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Wins */}
        {activeTab === 'recent' && (
          <div className="p-6">
            {recentWins.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No wins in the last 7 days</p>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-green-900">Recent Hot Streak!</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    {recentWins.length} winning positions closed in the last 7 days
                  </p>
                </div>

                <div className="space-y-3">
                  {recentWins.map((win, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors bg-gradient-to-r from-white to-green-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-lg font-bold text-gray-900">{win.ticker}</h4>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              ✓ WIN
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{win.company_name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Closed: {formatDate(win.exit_date)}</span>
                            <span>Held: {win.days_held} days</span>
                            <span>Confidence: {win.ai_confidence}%</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatPercent(win.pnl_pct)}
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(win.pnl_amount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          <h3 className="text-xl font-bold">AI-Driven Results You Can Trust</h3>
        </div>
        <p className="text-blue-100 mb-4">
          Every recommendation is tracked with real performance data. No cherry-picking, no hiding losses. 
          This is transparent, accountable AI trading intelligence.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Refresh Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
