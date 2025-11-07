// src/pages/DailyIntelligence.tsx
// UNIFIED INTELLIGENCE: AI recommendations + comprehensive data

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, Newspaper, Calendar, MessageSquare, Target, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // ✅ Added auth

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface DataItem {
  source: string;
  type: string;
  timestamp: Date;
  title: string;
  content: string;
  ticker?: string;
  politician?: string;
  sentiment?: string;
}

interface AllData {
  political: DataItem[];
  insider: DataItem[];
  news: DataItem[];
  social: DataItem[];
  economic: DataItem[];
  total: number;
}

export function DailyIntelligence() {
  const { token } = useAuth(); // ✅ Get auth token
  const [aiData, setAiData] = useState<any>(null);
  const [allData, setAllData] = useState<AllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'recommendations' | 'data'>('recommendations');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ Add Authorization header with token
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch AI recommendations
      const aiResponse = await fetch(`${API_URL}/api/intelligence/daily`, { headers });
      const aiResult = await aiResponse.json();
      setAiData(aiResult);

      // Fetch all comprehensive data
      const dataResponse = await fetch(`${API_URL}/api/data/all`, { headers });
      const dataResult = await dataResponse.json();
      setAllData(dataResult);

      // Update last refreshed time
      const now = new Date();
      setLastUpdated(now);
      localStorage.setItem('lastIntelligenceFetch', now.toDateString());

    } catch (error) {
      console.error('Error fetching intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if we've already fetched today
    const lastFetch = localStorage.getItem('lastIntelligenceFetch');
    const today = new Date().toDateString();
    
    if (lastFetch !== today) {
      // First fetch of the day
      fetchData();
      localStorage.setItem('lastIntelligenceFetch', today);
    } else {
      // Already fetched today, load from cache or wait for manual refresh
      fetchData();
    }
  }, []);

  if (loading && !aiData && !allData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading complete intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🧠 Daily Intelligence Center</h1>
              <p className="text-blue-100 mt-2">
                AI-powered recommendations + comprehensive market data
              </p>
              {lastUpdated && (
                <p className="text-blue-200 text-sm mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()} on {lastUpdated.toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition disabled:opacity-50"
              title="Manually refresh intelligence data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('recommendations')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedView === 'recommendations'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            🎯 AI Recommendations
          </button>
          <button
            onClick={() => setSelectedView('data')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              selectedView === 'data'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            📊 Market Intelligence
          </button>
        </div>

        {/* Data Stats Overview (Always visible) */}
        {allData && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allData.political.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Political Trades</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allData.insider.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Insider Trades</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Newspaper className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allData.news.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">News Articles</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allData.social.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Social Posts</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allData.economic.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Economic Events</p>
            </div>
          </div>
        )}

        {/* AI RECOMMENDATIONS VIEW */}
        {selectedView === 'recommendations' && aiData && (
          <div className="space-y-6">
            
            {/* Top Opportunity */}
            {aiData.executiveDashboard?.topOpportunity && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                  <Target className="w-7 h-7" />
                  🎯 Top Opportunity
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                      {aiData.executiveDashboard.topOpportunity.symbol}
                    </p>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
                      {aiData.executiveDashboard.topOpportunity.action}
                    </p>
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                      Confidence: <span className="font-bold text-green-600">{aiData.executiveDashboard.topOpportunity.confidence}%</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Price: <span className="font-bold">${aiData.executiveDashboard.topOpportunity.price}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Market Direction</p>
                    <p className="text-3xl font-bold capitalize text-gray-900 dark:text-white">
                      {aiData.executiveDashboard.marketDirection?.direction || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {aiData.executiveDashboard.marketDirection?.timeframe}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* High Confidence Plays */}
            {aiData.ultimateRecommendations?.highConfidence && aiData.ultimateRecommendations.highConfidence.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  🎯 High Confidence Plays
                </h2>
                <div className="space-y-3">
                  {aiData.ultimateRecommendations.highConfidence.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl font-bold text-green-700 dark:text-green-300">{rec.symbol}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{rec.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {rec.signals?.join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                            {rec.confidence}% Confidence
                          </p>
                          {rec.target && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Target: ${rec.target}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Risks */}
            {aiData.executiveDashboard?.keyRisks && aiData.executiveDashboard.keyRisks.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Key Risks
                </h2>
                <div className="space-y-3">
                  {aiData.executiveDashboard.keyRisks.map((risk: any, idx: number) => (
                    <div key={idx} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-semibold text-red-900 dark:text-red-100">{risk.type}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{risk.description}</p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">Severity: {risk.severity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 dark:text-gray-400">VIX</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aiData.marketOverview?.vix?.toFixed(2) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {aiData.marketOverview?.vix > 20 ? 'Elevated' : 'Normal'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 dark:text-gray-400">Sentiment</p>
                <p className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                  {aiData.marketOverview?.sentiment || 'N/A'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 dark:text-gray-400">Put/Call Ratio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aiData.optionsIntelligence?.flow?.summary?.putCallRatio?.toFixed(2) || 'N/A'}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <p className="text-xs text-gray-500 dark:text-gray-400">Options Sentiment</p>
                <p className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                  {aiData.optionsIntelligence?.flow?.summary?.overallSentiment || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MARKET INTELLIGENCE DATA VIEW */}
        {selectedView === 'data' && allData && (
          <div className="space-y-6">
            
            {/* Political Trades */}
            {allData.political.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Political Trades
                </h2>
                <div className="space-y-3">
                  {allData.political.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                              {item.source}
                            </span>
                            {item.ticker && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                                {item.ticker}
                              </span>
                            )}
                            {item.sentiment && (
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                item.sentiment === 'bullish' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {item.sentiment}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.content}</p>
                          {item.politician && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">👤 {item.politician}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 ml-4">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insider Activity */}
            {allData.insider.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Insider Activity
                </h2>
                <div className="space-y-3">
                  {allData.insider.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {item.source}
                            </span>
                            {item.ticker && (
                              <span className="px-2 py-0.5 text-xs font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                {item.ticker}
                              </span>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.content}</p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 ml-4">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent News */}
            {allData.news.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-blue-600" />
                  Market News
                </h2>
                <div className="space-y-3">
                  {allData.news.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{item.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-blue-600 dark:text-blue-400">{item.source}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Economic Calendar */}
            {allData.economic.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  Upcoming Economic Events
                </h2>
                <div className="space-y-3">
                  {allData.economic.map((item, idx) => (
                    <div key={idx} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.content}</p>
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                          {new Date(item.timestamp).toLocaleDateString()}
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
    </div>
  );
}
