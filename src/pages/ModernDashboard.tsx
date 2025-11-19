// src/pages/ModernDashboard.tsx
// Professional trading dashboard with modern retail investor UI

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Zap, Target, Activity, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function ModernDashboard() {
  const [marketData, setMarketData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState(['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'COIN']);
  const [prices, setPrices] = useState<Record<string, any>>({});

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    // Load prices for watchlist
    for (const ticker of watchlist) {
      try {
        const res = await api.api.get(`/api/market-data/price/${ticker}`);
        setPrices(prev => ({ ...prev, [ticker]: res.data }));
      } catch (error) {
        console.error(`Failed to load ${ticker}`);
      }
    }

    // Load alerts
    try {
      const alertsRes = await api.api.get('/api/analytics/pattern-matches');
      if (alertsRes.data.success) setAlerts(alertsRes.data.data);
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Top Bar */}
      <div className="border-b border-gray-800 bg-[#0f1420]">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              MarketAI
            </h1>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-gray-400">Live Market Data</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-gray-400">Updated {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              Trade
            </button>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
              Portfolio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Watchlist */}
          <div className="col-span-3 space-y-4">
            <div className="bg-[#0f1420] rounded-xl border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-bold text-lg">Watchlist</h2>
              </div>
              <div className="divide-y divide-gray-800">
                {watchlist.map(ticker => {
                  const data = prices[ticker];
                  const change = data?.changePercent || 0;
                  const isPositive = change >= 0;
                  
                  return (
                    <div key={ticker} className="p-4 hover:bg-gray-900/50 cursor-pointer transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">{ticker}</span>
                        <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">${data?.price?.toFixed(2) || '--'}</span>
                        {isPositive ? (
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Vol: {((data?.volume || 0) / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Column - Main Content */}
          <div className="col-span-6 space-y-4">
            
            {/* Market Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-xl p-6 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">S&P 500</span>
                </div>
                <div className="text-3xl font-bold mb-1">{prices.SPY?.price?.toFixed(2) || '--'}</div>
                <div className="text-sm text-green-400">+0.45% Today</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Nasdaq</span>
                </div>
                <div className="text-3xl font-bold mb-1">{prices.QQQ?.price?.toFixed(2) || '--'}</div>
                <div className="text-sm text-green-400">+0.82% Today</div>
              </div>

              <div className="bg-gradient-to-br from-orange-600/20 to-orange-600/5 rounded-xl p-6 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-400">Crypto</span>
                </div>
                <div className="text-3xl font-bold mb-1">{prices.COIN?.price?.toFixed(2) || '--'}</div>
                <div className="text-sm text-red-400">-2.3% Today</div>
              </div>
            </div>

            {/* AI Alerts */}
            {alerts.length > 0 && (
              <div className="bg-[#0f1420] rounded-xl border border-red-500/30 overflow-hidden">
                <div className="p-4 bg-red-500/10 border-b border-red-500/30 flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="font-bold">AI Market Alerts</h3>
                </div>
                <div className="p-4 space-y-3">
                  {alerts.slice(0, 3).map((alert, idx) => (
                    <div key={idx} className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-red-300">{alert.current_event}</h4>
                        <span className="text-xs px-2 py-1 bg-red-500/20 rounded text-red-300">
                          {(alert.similarity_score * 100).toFixed(0)}% Match
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">Similar to: {alert.historical_match}</p>
                      <div className="mt-3 flex gap-4 text-sm">
                        <span className="text-red-400">Impact: {alert.predicted_impact}%</span>
                        <span className="text-gray-500">Duration: {alert.predicted_duration} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chart Placeholder */}
            <div className="bg-[#0f1420] rounded-xl border border-gray-800 p-6 h-96 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Live Chart Integration</p>
                <p className="text-sm text-gray-600">TradingView Widget Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="col-span-3 space-y-4">
            
            {/* AI Recommendations */}
            <div className="bg-[#0f1420] rounded-xl border border-gray-800">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  AI Picks
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">NVDA</span>
                    <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">BUY</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Strong technical breakout</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Target: $920</span>
                    <span className="text-green-400">+12% upside</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">TSLA</span>
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">HOLD</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-2">Consolidating near resistance</div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Wait for: $245</span>
                    <span className="text-blue-400">Watch</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="bg-[#0f1420] rounded-xl border border-gray-800 p-4">
              <h3 className="font-bold mb-4">Market Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">VIX (Fear)</span>
                  <span className="text-yellow-400">18.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Put/Call Ratio</span>
                  <span className="text-gray-300">0.87</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Crypto Correlation</span>
                  <span className="text-purple-400">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Confidence</span>
                  <span className="text-green-400">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
