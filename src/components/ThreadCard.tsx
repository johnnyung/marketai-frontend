// src/components/ThreadCard.tsx
// Display individual Intelligence Thread

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface ThreadCardProps {
  thread: {
    id: number;
    title: string;
    theme: string;
    entry_count: number;
    timespan_hours: number;
    impact_level: string;
    affected_tickers: Array<{
      ticker: string;
      impact: string;
      reasoning: string;
    }>;
    ai_insight: string;
    ai_trading_implication: string;
    ai_risk_factors: string[];
    ai_catalysts_to_watch?: Array<{
      date: string;
      event: string;
      importance: string;
    }>;
    entries: Array<{
      id: number;
      source_name: string;
      ai_summary: string;
      ai_sentiment: string;
      event_date: string;
    }>;
  };
}

export const ThreadCard: React.FC<ThreadCardProps> = ({ thread }) => {
  const [expanded, setExpanded] = useState(false);

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600 bg-red-100 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getThemeIcon = (theme: string) => {
    const icons: Record<string, string> = {
      'TECH': '💻',
      'PHARMA': '💊',
      'FINANCE': '💰',
      'FINTECH': '💳',
      'ENERGY': '⚡',
      'TRANSPORTATION': '✈️',
      'SUPPLY_CHAIN': '🚚',
      'POLITICS': '🏛️',
      'DEFENSE': '🛡️',
      'RETAIL': '🛍️'
    };
    return icons[theme] || '📊';
  };

  const getTickerImpactIcon = (impact: string) => {
    if (impact.includes('+')) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (impact.includes('-')) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return null;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-700 bg-green-50';
      case 'bearish': return 'text-red-700 bg-red-50';
      default: return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getThemeIcon(thread.theme)}</span>
              <h3 className="text-xl font-bold text-gray-900">{thread.title}</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getImpactColor(thread.impact_level)}`}>
                {thread.impact_level} IMPACT
              </span>
              <span className="text-sm text-gray-600">
                {thread.entry_count} connected events
              </span>
              <span className="text-sm text-gray-600">
                {thread.timespan_hours}h timespan
              </span>
            </div>
          </div>
        </div>

        {/* Affected Tickers */}
        {thread.affected_tickers && thread.affected_tickers.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">AFFECTED TICKERS</h4>
            <div className="flex flex-wrap gap-2">
              {thread.affected_tickers.map((ticker, idx) => (
                <div key={idx} className="bg-white rounded-lg px-3 py-2 border border-gray-200 flex items-center gap-2">
                  <span className="font-bold text-blue-600">{ticker.ticker}</span>
                  <div className="flex items-center gap-1">
                    {getTickerImpactIcon(ticker.impact)}
                    <span className={ticker.impact.includes('+') ? 'text-green-600 font-semibold' : ticker.impact.includes('-') ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                      {ticker.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Insight */}
      <div className="p-6 bg-blue-50 border-b border-blue-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-blue-900 mb-2">AI INSIGHT</h4>
            <p className="text-gray-800 leading-relaxed">{thread.ai_insight}</p>
          </div>
        </div>
      </div>

      {/* Trading Implication */}
      <div className="p-6 bg-green-50 border-b border-green-100">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-green-900 mb-2">TRADING IMPLICATION</h4>
            <p className="text-gray-800 font-medium">{thread.ai_trading_implication}</p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {thread.ai_risk_factors && thread.ai_risk_factors.length > 0 && (
        <div className="p-6 bg-red-50 border-b border-red-100">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-2">RISK FACTORS</h4>
              <ul className="space-y-1">
                {thread.ai_risk_factors.map((risk, idx) => (
                  <li key={idx} className="text-gray-800 text-sm flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Catalysts to Watch */}
      {thread.ai_catalysts_to_watch && thread.ai_catalysts_to_watch.length > 0 && (
        <div className="p-6 bg-yellow-50 border-b border-yellow-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-yellow-900 mb-2">CATALYSTS TO WATCH</h4>
              <div className="space-y-2">
                {thread.ai_catalysts_to_watch.map((catalyst, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-sm font-bold text-yellow-900">{catalyst.date}:</span>
                    <span className="text-sm text-gray-800">{catalyst.event}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      catalyst.importance === 'HIGH' ? 'bg-red-200 text-red-800' :
                      catalyst.importance === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {catalyst.importance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connected Events (Expandable) */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900">
            {thread.entry_count} Connected Events
          </span>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {expanded && (
          <div className="px-6 pb-6 space-y-3">
            {thread.entries && thread.entries.filter(e => e.id).map((entry, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-blue-600">{entry.source_name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.event_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800 mb-2">{entry.ai_summary}</p>
                {entry.ai_sentiment && (
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getSentimentColor(entry.ai_sentiment)}`}>
                    {entry.ai_sentiment}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
