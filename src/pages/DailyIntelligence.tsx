import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Target, RefreshCw, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { VettingBadge } from '../components/VettingBadge';

import { API_URL } from '../config/api';

interface TradingSignal {
  ticker: string;
  companyName: string;
  action: 'BUY' | 'SELL' | 'WATCH';
  targetPrice: number;
  currentPrice: number;
  confidence: number;
  reasoning: string;
  catalysts: string[];
  timeHorizon: string;
  riskLevel: string;
  relatedDigestIds: number[];
}

const DailyIntelligence: React.FC = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchSignals();
  }, []);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please login to view Daily Intelligence');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/intelligence/signals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals || []);
        setLastRefresh(new Date());
      } else {
        setError('Failed to load trading signals');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      setError('Failed to load trading signals');
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SELL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Trading Signals...</p>
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
            onClick={fetchSignals}
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-blue-600" />
              Daily Intelligence
            </h1>
            <p className="text-gray-600">
              Top 5 AI-powered trading signals with 20-point vetting
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Automatically tracked in AI Tip Tracker to prove performance
            </p>
          </div>

          <button
            onClick={fetchSignals}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Additional Analysis Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Link to="/deep-dive" className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
            <ExternalLink className="w-4 h-4" />
            Deep Dive Analysis (2000+ words)
          </Link>
          <Link to="/intelligence-threads" className="flex items-center gap-2 text-purple-600 hover:text-purple-800">
            <ExternalLink className="w-4 h-4" />
            Intelligence Threads (connected stories)
          </Link>
          <Link to="/ai-tip-tracker" className="flex items-center gap-2 text-green-600 hover:text-green-800">
            <ExternalLink className="w-4 h-4" />
            AI Tip Tracker (performance tracking)
          </Link>
        </div>
      </div>

      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Top 5 AI Trading Signals
        </h2>

        {signals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No signals available yet</p>
            <p className="text-sm text-gray-500">Signals are generated automatically every 6 hours</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {signals.map((signal, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-900">#{idx + 1}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{signal.ticker}</h3>
                      <p className="text-sm text-gray-600">{signal.companyName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getActionColor(signal.action)}`}>
                          {signal.action}
                        </span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                          {signal.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                  <VettingBadge ticker={signal.ticker} inline={true} />
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600">Current Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${signal.currentPrice?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Target Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${signal.targetPrice?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Potential Return</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {signal.currentPrice && signal.targetPrice 
                        ? ((signal.targetPrice - signal.currentPrice) / signal.currentPrice * 100).toFixed(1) + '%'
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Reasoning</h4>
                  <p className="text-gray-700 text-sm">{signal.reasoning}</p>
                </div>

                {signal.catalysts && signal.catalysts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Catalysts</h4>
                    <ul className="space-y-1">
                      {signal.catalysts.map((catalyst, cidx) => (
                        <li key={cidx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    Timeframe: {signal.timeHorizon} • Risk: {signal.riskLevel} • Supporting: {signal.relatedDigestIds?.length || 0} entries
                  </div>
                  <Link to={`/deep-dive?ticker=${signal.ticker}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    Deep Dive Analysis
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyIntelligence;
