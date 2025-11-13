import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Network, BookOpen, Target, BarChart3, ExternalLink, RefreshCw } from 'lucide-react';

import { API_URL } from '../config/api';

interface Stats {
  totalEntries: number;
  avgRelevance: number;
  activeThreads: number;
  openTips: number;
  winRate: number;
  signalsToday: number;
}

interface QuickSignal {
  ticker: string;
  action: string;
  confidence: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    avgRelevance: 0,
    activeThreads: 0,
    openTips: 0,
    winRate: 0,
    signalsToday: 0
  });
  const [topSignals, setTopSignals] = useState<QuickSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch digest stats
      const digestRes = await fetch(`${API_URL}/api/digest/summary`, { headers });
      if (digestRes.ok) {
        const digestData = await digestRes.json();
        setStats(prev => ({
          ...prev,
          totalEntries: digestData.total || 0,
          avgRelevance: digestData.avgRelevance || 0
        }));
      }

      // Fetch threads count
      const threadsRes = await fetch(`${API_URL}/api/threads?status=ACTIVE`, { headers });
      if (threadsRes.ok) {
        const threadsData = await threadsRes.json();
        setStats(prev => ({
          ...prev,
          activeThreads: threadsData.threads?.length || 0
        }));
      }

      // Fetch tip tracker stats
      const tipsRes = await fetch(`${API_URL}/api/tip-tracker/summary`, { headers });
      if (tipsRes.ok) {
        const tipsData = await tipsRes.json();
        setStats(prev => ({
          ...prev,
          openTips: tipsData.openPositions || 0,
          winRate: tipsData.winRate || 0
        }));
      }

      // Fetch today's signals (top 3 for preview)
      const signalsRes = await fetch(`${API_URL}/api/intelligence/signals?count=3`, { headers });
      if (signalsRes.ok) {
        const signalsData = await signalsRes.json();
        setTopSignals(signalsData.signals || []);
        setStats(prev => ({
          ...prev,
          signalsToday: signalsData.signals?.length || 0
        }));
      }

      setLastRefresh(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, sublabel, color, link }: any) => (
    <a
      href={link}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${color}`} />
        <ExternalLink className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </a>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
            <p className="text-gray-600">Your MarketAI intelligence hub</p>
          </div>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {lastRefresh && (
          <p className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleString()}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          label="AI Trading Signals"
          value={stats.signalsToday}
          sublabel="Generated today"
          color="text-blue-600"
          link="/daily-intelligence"
        />
        <StatCard
          icon={Network}
          label="Intelligence Threads"
          value={stats.activeThreads}
          sublabel="Active storylines"
          color="text-purple-600"
          link="/intelligence-threads"
        />
        <StatCard
          icon={Brain}
          label="Intelligence Entries"
          value={stats.totalEntries}
          sublabel={`Avg relevance: ${stats.avgRelevance}%`}
          color="text-indigo-600"
          link="/digest"
        />
        <StatCard
          icon={Target}
          label="Tracked Tips"
          value={stats.openTips}
          sublabel={`Win rate: ${stats.winRate.toFixed(1)}%`}
          color="text-green-600"
          link="/ai-tip-tracker"
        />
        <StatCard
          icon={BookOpen}
          label="Deep Dive"
          value="Ready"
          sublabel="2000+ word analysis"
          color="text-orange-600"
          link="/deep-dive"
        />
        <StatCard
          icon={BarChart3}
          label="Performance"
          value="Track"
          sublabel="All AI recommendations"
          color="text-teal-600"
          link="/ai-tip-tracker"
        />
      </div>

      {/* Quick Preview: Top Signals */}
      {topSignals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Top AI Signals Today
            </h2>
            <a
              href="/daily-intelligence"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View All <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topSignals.map((signal, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">{signal.ticker}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    signal.action === 'BUY'
                      ? 'bg-green-100 text-green-800'
                      : signal.action === 'SELL'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {signal.action}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Confidence: {signal.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/daily-intelligence"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              View AI Trading Signals
            </h3>
            <p className="text-sm text-gray-600">
              Get today's top 5 AI-powered trading recommendations
            </p>
          </a>

          <a
            href="/deep-dive"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Deep Dive Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Get 2000+ word institutional-quality research on any ticker
            </p>
          </a>

          <a
            href="/intelligence-threads"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-600" />
              Intelligence Threads
            </h3>
            <p className="text-sm text-gray-600">
              View AI-connected storylines from market intelligence
            </p>
          </a>

          <a
            href="/digest"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Intelligence Digest
            </h3>
            <p className="text-sm text-gray-600">
              Search and filter raw intelligence from all sources
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
