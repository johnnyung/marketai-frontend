import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Target, Clock, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { API_URL } from '../config/api';

interface TipTracker {
  id: number;
  ticker: string;
  company_name: string;
  recommendation_type: 'BUY' | 'SELL' | 'WATCH';
  entry_date: string;
  entry_price: string;
  shares: string;
  current_price: string | null;
  current_pnl: string | null;
  current_pnl_pct: string | null;
  status: string;
  ai_confidence: number;
  ai_reasoning: string;
  ai_catalysts: string[] | null;
  days_held: number;
  exit_price: string | null;
  final_pnl: string | null;
  final_pnl_pct: string | null;
}

interface Stats {
  totalPositions: number;
  openPositions: number;
  closedPositions: number;
  totalPnL: number;
  avgReturn: number;
  winRate: number;
  bestPick: TipTracker | null;
  worstPick: TipTracker | null;
}

const AITipTracker: React.FC = () => {
  const [tips, setTips] = useState<TipTracker[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please login to view AI Tip Tracker');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/intelligence/signals?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTips(data.signals || []);
        calculateStats(data.signals || []);
      } else {
        setError('Failed to load tips');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch tips:', err);
      setError('Failed to load AI Tip Tracker');
      setLoading(false);
    }
  };

  const calculateStats = (tipsList: TipTracker[]) => {
    const openTips = tipsList.filter(t => t.status === 'OPEN');
    const closedTips = tipsList.filter(t => t.status === 'CLOSED');
    
    const totalPnL = tipsList.reduce((sum, t) => {
      const pnl = t.status === 'CLOSED' 
        ? parseFloat(t.final_pnl || '0')
        : parseFloat(t.current_pnl || '0');
      return sum + pnl;
    }, 0);

    const avgReturn = tipsList.length > 0
      ? tipsList.reduce((sum, t) => {
          const pct = t.status === 'CLOSED'
            ? parseFloat(t.final_pnl_pct || '0')
            : parseFloat(t.current_pnl_pct || '0');
          return sum + pct;
        }, 0) / tipsList.length
      : 0;

    const winners = closedTips.filter(t => parseFloat(t.final_pnl || '0') > 0);
    const winRate = closedTips.length > 0 ? (winners.length / closedTips.length) * 100 : 0;

    const bestPick = [...tipsList].sort((a, b) => {
      const aPnl = parseFloat(a.current_pnl_pct || a.final_pnl_pct || '0');
      const bPnl = parseFloat(b.current_pnl_pct || b.final_pnl_pct || '0');
      return bPnl - aPnl;
    })[0] || null;

    const worstPick = [...tipsList].sort((a, b) => {
      const aPnl = parseFloat(a.current_pnl_pct || a.final_pnl_pct || '0');
      const bPnl = parseFloat(b.current_pnl_pct || b.final_pnl_pct || '0');
      return aPnl - bPnl;
    })[0] || null;

    setStats({
      totalPositions: tipsList.length,
      openPositions: openTips.length,
      closedPositions: closedTips.length,
      totalPnL,
      avgReturn,
      winRate,
      bestPick,
      worstPick
    });
  };

  const filteredTips = tips.filter(tip => {
    if (filter === 'all') return true;
    if (filter === 'open') return tip.status === 'OPEN';
    if (filter === 'closed') return tip.status === 'CLOSED';
    return true;
  });

  const getPnLColor = (pnl: string | null) => {
    if (!pnl) return 'text-gray-600';
    const value = parseFloat(pnl);
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatPnL = (pnl: string | null, pnlPct: string | null) => {
    if (!pnl || !pnlPct) return '$0.00 (0.00%)';
    const value = parseFloat(pnl);
    const pct = parseFloat(pnlPct);
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${Math.abs(value).toFixed(2)} (${sign}${pct.toFixed(2)}%)`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Tip Tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTips}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 AI Tip Tracker</h1>
            <p className="text-gray-600">
              Every AI recommendation tracked with $100 mock investment • Proving the AI works
            </p>
          </div>
          <button
            onClick={fetchTips}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalPositions}</span>
            </div>
            <p className="text-sm text-gray-600">Total Signals</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.openPositions} open, {stats.closedPositions} closed
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className={`w-8 h-8 ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600">Total P/L</p>
            <p className="text-xs text-gray-500 mt-1">
              Across all {stats.totalPositions} positions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.avgReturn.toFixed(2)}%</span>
            </div>
            <p className="text-sm text-gray-600">Avg Return</p>
            <p className="text-xs text-gray-500 mt-1">
              Per position
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.winRate.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.closedPositions} closed positions
            </p>
          </div>
        </div>
      )}

      {/* Best/Worst Picks */}
      {stats && (stats.bestPick || stats.worstPick) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.bestPick && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Best Pick</h3>
              </div>
              <p className="text-lg font-bold text-green-900">{stats.bestPick.ticker}</p>
              <p className="text-sm text-green-700">
                {formatPnL(
                  stats.bestPick.current_pnl || stats.bestPick.final_pnl,
                  stats.bestPick.current_pnl_pct || stats.bestPick.final_pnl_pct
                )}
              </p>
            </div>
          )}

          {stats.worstPick && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Worst Pick</h3>
              </div>
              <p className="text-lg font-bold text-red-900">{stats.worstPick.ticker}</p>
              <p className="text-sm text-red-700">
                {formatPnL(
                  stats.worstPick.current_pnl || stats.worstPick.final_pnl,
                  stats.worstPick.current_pnl_pct || stats.worstPick.final_pnl_pct
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({tips.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'open'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Open ({tips.filter(t => t.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'closed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Closed ({tips.filter(t => t.status === 'CLOSED').length})
          </button>
        </div>
      </div>

      {/* Tips List */}
      <div className="space-y-4">
        {filteredTips.map((tip) => (
          <div
            key={tip.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-2xl font-bold text-gray-900">{tip.ticker}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tip.recommendation_type === 'BUY'
                        ? 'bg-green-100 text-green-800'
                        : tip.recommendation_type === 'SELL'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tip.recommendation_type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tip.status === 'OPEN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tip.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tip.company_name}</p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-2xl font-bold ${getPnLColor(tip.current_pnl || tip.final_pnl)}`}>
                  {formatPnL(
                    tip.current_pnl || tip.final_pnl,
                    tip.current_pnl_pct || tip.final_pnl_pct
                  )}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-end mt-1">
                  <Clock className="w-3 h-3" />
                  {tip.days_held} days held
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Entry Price</p>
                <p className="font-semibold text-gray-900">${parseFloat(tip.entry_price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Price</p>
                <p className="font-semibold text-gray-900">
                  ${tip.current_price ? parseFloat(tip.current_price).toFixed(2) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Shares</p>
                <p className="font-semibold text-gray-900">{parseFloat(tip.shares).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">AI Confidence</p>
                <p className="font-semibold text-gray-900">{tip.ai_confidence}%</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700">{tip.ai_reasoning}</p>
            </div>

            {tip.ai_catalysts && tip.ai_catalysts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tip.ai_catalysts.map((catalyst, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                  >
                    {catalyst}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Entry: {new Date(tip.entry_date).toLocaleString()}
            </div>
          </div>
        ))}

        {filteredTips.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tips found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITipTracker;
