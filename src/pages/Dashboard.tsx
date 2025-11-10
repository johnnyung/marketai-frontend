import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Brain, Target, AlertCircle, BookOpen, BarChart3 } from 'lucide-react';

const API_URL = 'https://marketai-backend-production-397e.up.railway.app';

interface Stats {
  totalEntries: number;
  highPriority: number;
  mediumPriority: number;
  topTickers: string[];
}

const Dashboard: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    highPriority: 0,
    mediumPriority: 0,
    topTickers: []
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/digest/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalEntries: data.totalEntries || 0,
          highPriority: data.highPriority || 0,
          mediumPriority: data.mediumPriority || 0,
          topTickers: data.topTickers || []
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    if (!window.confirm(
      '🔄 Refresh All Intelligence Data?\n\n' +
      'This will pull fresh data from:\n' +
      '• Yahoo Finance (25+ feeds including ACHR, PLTR, TSLA)\n' +
      '• SEC EDGAR (insider trades)\n' +
      '• Reddit (5 subreddits)\n' +
      '• News sources (MarketWatch, Seeking Alpha, Benzinga)\n' +
      '• Social sentiment\n' +
      '• Economic indicators\n\n' +
      'Takes 2-3 minutes. Continue?'
    )) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/digest/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastRefresh(new Date());
        alert(
          '✅ Data Refresh Complete!\n\n' +
          `📊 Collected: ${result.collected} items\n` +
          `💾 Stored: ${result.stored} new entries\n` +
          `🔄 Duplicates skipped: ${result.duplicates}\n\n` +
          'All intelligence is now up to date!'
        );
        
        // Reload stats
        await loadStats();
      } else {
        alert('❌ Refresh failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Refresh failed: ' + error.message);
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">AI-powered market intelligence platform</p>
      </div>

      {/* Refresh Data Card - PROMINENT */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Fresh Market Intelligence</h2>
              </div>
              <p className="text-blue-100 mb-4 text-lg">
                Pull the latest data from 80+ sources including Yahoo Finance, SEC EDGAR, Reddit, and major news outlets
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-200 mb-1">Yahoo Finance</div>
                  <div className="text-lg font-bold">25+ Feeds</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-200 mb-1">SEC EDGAR</div>
                  <div className="text-lg font-bold">Insider Trades</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-200 mb-1">Reddit</div>
                  <div className="text-lg font-bold">5 Subreddits</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                  <div className="text-xs text-blue-200 mb-1">Total Sources</div>
                  <div className="text-lg font-bold">80+</div>
                </div>
              </div>

              {lastRefresh && (
                <p className="text-sm text-blue-200 mb-4">
                  ✅ Last refreshed: {lastRefresh.toLocaleTimeString()} - Data is fresh!
                </p>
              )}

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 ${
                  refreshing
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-white text-blue-600 hover:scale-105'
                }`}
              >
                <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing Data... (2-3 min)' : 'Refresh All Data Now'}</span>
              </button>

              {refreshing && (
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Fetching from Yahoo Finance, SEC, Reddit, and 20+ other sources...</span>
                </div>
              )}
            </div>

            <div className="hidden lg:block ml-8">
              <Brain className="w-32 h-32 text-blue-400 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Intelligence Entries</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEntries}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">High Priority (80+)</p>
              <p className="text-3xl font-bold text-green-600">{stats.highPriority}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Medium Priority</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.mediumPriority}</p>
            </div>
            <Target className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">AI Signals</p>
              <p className="text-3xl font-bold text-purple-600">5</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/daily-intelligence"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Daily Intelligence</h3>
          </div>
          <p className="text-gray-600 text-sm">
            AI-powered trading signals, deep analysis, pattern watch, and risk monitor
          </p>
        </a>

        <a
          href="/digest"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Intelligence Digest</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Browse curated intelligence from 80+ sources with advanced filtering
          </p>
        </a>

        <a
          href="/ai-tip-tracker"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200 cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">AI Tip Tracker</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Track AI recommendations with mock $100 investments and live P/L
          </p>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
