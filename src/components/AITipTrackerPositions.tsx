import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, Award, AlertCircle } from 'lucide-react';

const API_URL = 'https://marketai-backend-production-397e.up.railway.app';

interface Position {
  id: number;
  ticker: string;
  company_name: string;
  recommendation_type: string;
  entry_price: string;
  entry_date: string;
  exit_price?: string;
  exit_date?: string;
  shares: string;
  status: string;
  current_price?: string;
  current_pnl?: string;
  current_pnl_pct?: string;
  final_pnl?: string;
  final_pnl_pct?: string;
  days_held: number;
  total_days_held?: number;
  ai_confidence: number;
  ai_prediction_pct?: string;
  ai_reasoning: string;
  prediction_accuracy_direction?: boolean;
  exit_reason?: string;
}

interface Summary {
  period_type: string;
  total_picks: number;
  open_positions: number;
  closed_positions: number;
  winners: number;
  losers: number;
  win_rate: string;
  total_invested: string;
  current_value: string;
  total_pnl: string;
  avg_return_per_pick: string;
  best_pick_ticker: string;
  best_pick_pnl: string;
  worst_pick_ticker: string;
  worst_pick_pnl: string;
  direction_accuracy_pct: string;
  avg_hold_days: string;
}

const AITipTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [closedPositions, setClosedPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Please login to view AI Tip Tracker');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch summary
      const summaryRes = await fetch(`${API_URL}/api/ai-tip-tracker/summary`, { headers });
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }

      // Fetch open positions
      const openRes = await fetch(`${API_URL}/api/ai-tip-tracker/positions/open`, { headers });
      if (openRes.ok) {
        const openData = await openRes.json();
        setOpenPositions(openData.data);
      }

      // Fetch closed positions
      const closedRes = await fetch(`${API_URL}/api/ai-tip-tracker/positions/closed`, { headers });
      if (closedRes.ok) {
        const closedData = await closedRes.json();
        setClosedPositions(closedData.data);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load AI Tip Tracker data');
      setLoading(false);
    }
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return '$0.00';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const formatPercent = (value: string | undefined) => {
    if (!value) return '0.00%';
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          💰 AI Tip Tracker
        </h1>
        <p className="text-gray-600">
          Every AI recommendation tracked with mock $100 investment to prove performance
        </p>
      </div>

      {/* Performance Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Picks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Picks</span>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{summary.total_picks}</p>
            <p className="text-sm text-gray-500 mt-1">
              {summary.open_positions} open • {summary.closed_positions} closed
            </p>
          </div>

          {/* Win Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Win Rate</span>
              <Award className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{formatPercent(summary.win_rate)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {summary.winners} wins • {summary.losers} losses
            </p>
          </div>

          {/* Total P/L */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total P/L</span>
              {parseFloat(summary.total_pnl) >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className={`text-3xl font-bold ${
              parseFloat(summary.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.total_pnl)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Invested: {formatCurrency(summary.total_invested)}
            </p>
          </div>

          {/* AI Accuracy */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">AI Accuracy</span>
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {formatPercent(summary.direction_accuracy_pct)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Avg hold: {parseFloat(summary.avg_hold_days).toFixed(0)} days
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('open')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'open'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Open Positions ({openPositions.length})
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'closed'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Closed Positions ({closedPositions.length})
            </button>
          </nav>
        </div>

        {/* Open Positions */}
        {activeTab === 'open' && (
          <div className="p-6">
            {openPositions.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No open positions</p>
                <p className="text-sm text-gray-500 mt-2">
                  AI recommendations will appear here automatically
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {openPositions.map((position) => (
                  <div
                    key={position.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {position.ticker}
                        </h3>
                        <p className="text-sm text-gray-600">{position.company_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        parseFloat(position.current_pnl || '0') >= 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {formatCurrency(position.current_pnl)} ({formatPercent(position.current_pnl_pct)})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Entry Price</p>
                        <p className="text-sm font-medium">{formatCurrency(position.entry_price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current Price</p>
                        <p className="text-sm font-medium">{formatCurrency(position.current_price)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">AI Confidence</p>
                        <p className="text-sm font-medium">{position.ai_confidence}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Days Held</p>
                        <p className="text-sm font-medium">{position.days_held} days</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">AI Reasoning:</p>
                      <p className="text-sm text-gray-700">{position.ai_reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Closed Positions */}
        {activeTab === 'closed' && (
          <div className="p-6">
            {closedPositions.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No closed positions yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Completed trades will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {closedPositions.map((position) => (
                  <div
                    key={position.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {position.ticker}
                        </h3>
                        <p className="text-sm text-gray-600">{position.company_name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          parseFloat(position.final_pnl || '0') >= 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {formatCurrency(position.final_pnl)} ({formatPercent(position.final_pnl_pct)})
                        </span>
                        {position.prediction_accuracy_direction && (
                          <p className="text-xs text-green-600 mt-1">✓ Predicted direction</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Entry</p>
                        <p className="text-sm font-medium">{formatCurrency(position.entry_price)}</p>
                        <p className="text-xs text-gray-400">{formatDate(position.entry_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Exit</p>
                        <p className="text-sm font-medium">{formatCurrency(position.exit_price)}</p>
                        <p className="text-xs text-gray-400">{formatDate(position.exit_date!)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">AI Confidence</p>
                        <p className="text-sm font-medium">{position.ai_confidence}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Hold Time</p>
                        <p className="text-sm font-medium">{position.total_days_held} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Exit Reason</p>
                        <p className="text-sm font-medium">{position.exit_reason}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-500 mb-1">AI Reasoning:</p>
                      <p className="text-sm text-gray-700">{position.ai_reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center mt-8">
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default AITipTracker;
