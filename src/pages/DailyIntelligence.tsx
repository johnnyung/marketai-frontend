// src/pages/DailyIntelligence.tsx
// IMPROVED: Collapsible cards + better UX

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, Newspaper, Calendar, MessageSquare, Target, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface Opportunity {
  ticker: string;
  action: string;
  confidence: number;
  reasoning: string;
  signals: string[];
  targetPrice?: number;
  stopLoss?: number;
  timeframe?: string;
  catalysts?: string[];
  risks?: string[];
}

interface IntelligenceResponse {
  summary: {
    totalDataPoints: number;
    dataBreakdown: any;
    marketSentiment: string;
    generatedAt: string;
  };
  opportunities: Opportunity[];
  risks: any[];
  keyInsights: string[];
  rawData: any[];
}

// Collapsible Opportunity Card Component
function OpportunityCard({ opportunity, index }: { opportunity: Opportunity; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First card expanded by default

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-blue-600 overflow-hidden">
      {/* Collapsed View - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition"
      >
        <div className="flex items-center justify-between">
          {/* Left: Ticker + Synopsis */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-3xl font-bold text-blue-600">
                {opportunity.ticker}
              </div>
              <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                opportunity.action === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                opportunity.action.includes('SHORT') || opportunity.action.includes('AVOID') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {opportunity.action}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {opportunity.confidence}%
              </div>
            </div>
            
            {/* Quick Synopsis - First 150 chars of reasoning */}
            <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
              {opportunity.reasoning.substring(0, 150)}...
            </p>
            
            {/* Signal count */}
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>📊 {opportunity.signals.length} signals</span>
              {opportunity.catalysts && <span>• 🚀 {opportunity.catalysts.length} catalysts</span>}
              {opportunity.risks && <span>• ⚠️ {opportunity.risks.length} risks</span>}
            </div>
          </div>

          {/* Right: Expand/Collapse Icon */}
          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded View - Show on click */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          
          {/* Full Reasoning */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              📝 Full Analysis:
            </h4>
            <p className="text-gray-700 dark:text-gray-300">
              {opportunity.reasoning}
            </p>
          </div>

          {/* All Signals */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              📊 All Signals ({opportunity.signals.length}):
            </h4>
            <ul className="space-y-2">
              {opportunity.signals.map((signal, sidx) => (
                <li key={sidx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Targets */}
          {(opportunity.targetPrice || opportunity.stopLoss) && (
            <div className="grid grid-cols-2 gap-4">
              {opportunity.targetPrice && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Target Price</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${opportunity.targetPrice}
                  </div>
                  {opportunity.timeframe && (
                    <div className="text-xs text-gray-500 mt-1">{opportunity.timeframe}</div>
                  )}
                </div>
              )}
              {opportunity.stopLoss && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Stop Loss</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${opportunity.stopLoss}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Catalysts */}
          {opportunity.catalysts && opportunity.catalysts.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                🚀 Catalysts:
              </h4>
              <ul className="space-y-2">
                {opportunity.catalysts.map((catalyst, cidx) => (
                  <li key={cidx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <span className="text-green-600 font-bold flex-shrink-0">→</span>
                    <span>{catalyst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {opportunity.risks && opportunity.risks.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                ⚠️ Risks:
              </h4>
              <ul className="space-y-2">
                {opportunity.risks.map((risk, ridx) => (
                  <li key={ridx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <span className="text-red-600 font-bold flex-shrink-0">!</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function DailyIntelligence() {
  const { token } = useAuth();
  const [intelligence, setIntelligence] = useState<IntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'recommendations' | 'data'>('recommendations');

  const fetchIntelligence = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = forceRefresh 
        ? `${API_URL}/api/intelligence/daily?forceRefresh=true`
        : `${API_URL}/api/intelligence/daily`;

      console.log('🔄 Fetching intelligence from:', url);
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Intelligence loaded:', data);
      
      setIntelligence(data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [token]);

  if (loading && !intelligence) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing market intelligence...</p>
        </div>
      </div>
    );
  }

  if (error && !intelligence) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={() => fetchIntelligence()} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Try Again
          </button>
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
              <p className="text-blue-100 mt-2">AI-powered recommendations + market data</p>
              {intelligence?.summary?.generatedAt && (
                <p className="text-blue-200 text-sm mt-1">
                  Last updated: {new Date(intelligence.summary.generatedAt).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={() => fetchIntelligence(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition disabled:opacity-50"
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

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{intelligence?.summary?.dataBreakdown?.political || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Political</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{intelligence?.summary?.dataBreakdown?.insider || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Insider</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <Newspaper className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{intelligence?.summary?.dataBreakdown?.news || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">News</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <MessageSquare className="w-6 h-6 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{intelligence?.summary?.dataBreakdown?.social || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Social</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{intelligence?.summary?.dataBreakdown?.economic || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Economic</p>
          </div>
        </div>

        {/* AI RECOMMENDATIONS VIEW */}
        {selectedView === 'recommendations' && intelligence && (
          <div className="space-y-6">
            
            {/* Sentiment */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Market Sentiment</h2>
              <div className={`inline-block px-6 py-3 rounded-lg font-bold text-lg ${
                intelligence.summary.marketSentiment === 'bullish' ? 'bg-green-100 text-green-800' :
                intelligence.summary.marketSentiment === 'bearish' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {intelligence.summary.marketSentiment.toUpperCase()}
              </div>
            </div>

            {/* Key Insights */}
            {intelligence.keyInsights?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">💡 Key Insights</h2>
                <ul className="space-y-2">
                  {intelligence.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* OPPORTUNITIES - NOW COLLAPSIBLE! */}
            {intelligence.opportunities?.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="w-8 h-8 text-blue-600" />
                    AI Opportunities ({intelligence.opportunities.length})
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click any card to expand details
                  </p>
                </div>
                
                {intelligence.opportunities.map((opp, idx) => (
                  <OpportunityCard key={idx} opportunity={opp} index={idx} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Opportunities Found</h3>
                <p className="text-gray-600">AI couldn't identify high-confidence opportunities. Try refreshing.</p>
              </div>
            )}
          </div>
        )}

        {/* DATA VIEW */}
        {selectedView === 'data' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Raw Market Data</h2>
            <p className="text-gray-600">Total data points: {intelligence?.summary?.totalDataPoints || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}
