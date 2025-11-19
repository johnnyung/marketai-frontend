// src/components/ExecutiveSummary.tsx
// Executive Summary Card - Daily market intelligence synthesis

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, Target, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface ExecutiveSummary {
  marketDirective: string;
  directiveReasoning: string;
  topThemes: Array<{
    theme: string;
    description: string;
    impact: string;
  }>;
  topOpportunities: Array<{
    ticker: string;
    reasoning: string;
    timeframe: string;
    confidence: number;
  }>;
  keyRisks: string[];
  watchTomorrow: Array<{
    event: string;
    importance: string;
    impact: string;
  }>;
  generatedAt: string;
}

export const ExecutiveSummary: React.FC = () => {
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/executive-summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Failed to load executive summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (regenerating) return;
    
    if (!window.confirm(
      '📊 Regenerate Executive Summary?\n\n' +
      'This will analyze all current intelligence and generate a fresh summary.\n\n' +
      'Takes 30-60 seconds. Continue?'
    )) {
      return;
    }

    setRegenerating(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/executive-summary/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setSummary(result.data);
        alert('✅ Executive summary updated!');
      } else {
        alert('❌ Regeneration failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Regeneration failed: ' + error.message);
    } finally {
      setRegenerating(false);
    }
  };

  const getDirectiveColor = (directive: string) => {
    switch (directive) {
      case 'AGGRESSIVE_BUYING':
        return 'bg-green-600 text-white';
      case 'SELECTIVE_BUYING':
        return 'bg-blue-600 text-white';
      case 'HOLD':
        return 'bg-yellow-600 text-white';
      case 'DEFENSIVE':
        return 'bg-orange-600 text-white';
      case 'SELL':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getDirectiveIcon = (directive: string) => {
    if (directive.includes('BUYING')) return <TrendingUp className="w-6 h-6" />;
    if (directive === 'SELL' || directive === 'DEFENSIVE') return <TrendingDown className="w-6 h-6" />;
    return <Target className="w-6 h-6" />;
  };

  const formatDirective = (directive: string) => {
    return directive.replace(/_/g, ' ');
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const hours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <p className="text-center text-gray-600">Executive summary not available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">📊</span>
              <h2 className="text-3xl font-bold text-white">Executive Summary</h2>
            </div>
            <p className="text-blue-100 text-sm">
              Last updated: {getTimeAgo(summary.generatedAt)}
            </p>
          </div>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              regenerating
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-white text-purple-600 hover:bg-blue-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{regenerating ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Market Directive */}
      <div className="p-6 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className={`px-6 py-4 rounded-xl ${getDirectiveColor(summary.marketDirective)} flex items-center gap-3 shadow-lg`}>
            {getDirectiveIcon(summary.marketDirective)}
            <div>
              <div className="text-xs font-semibold opacity-80">MARKET DIRECTIVE</div>
              <div className="text-xl font-bold">{formatDirective(summary.marketDirective)}</div>
            </div>
          </div>
          <p className="flex-1 text-white text-sm leading-relaxed">
            {summary.directiveReasoning}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Top Themes */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span>
            <span>Top 3 Market Themes</span>
          </h3>
          <div className="space-y-4">
            {summary.topThemes.map((theme, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl font-bold text-blue-300">{idx + 1}.</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-white mb-1">{theme.theme}</h4>
                    <p className="text-blue-100 text-sm mb-2">{theme.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-200">Impact:</span>
                      <span className="text-xs text-blue-100">{theme.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Opportunities */}
        {summary.topOpportunities.length > 0 && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-400/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>💰</span>
              <span>Top Opportunities</span>
            </h3>
            <div className="space-y-3">
              {summary.topOpportunities.map((opp, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-green-300">${opp.ticker}</span>
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                        {opp.confidence}% confidence
                      </span>
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {opp.timeframe}
                      </span>
                    </div>
                  </div>
                  <p className="text-green-100 text-sm">{opp.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Risks */}
        <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-red-400/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            <span>Key Risks</span>
          </h3>
          <ul className="space-y-2">
            {summary.keyRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-3 text-red-100">
                <span className="text-red-300 font-bold mt-1">•</span>
                <span className="flex-1">{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Watch Tomorrow */}
        {summary.watchTomorrow.length > 0 && (
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Watch Tomorrow</span>
            </h3>
            <div className="space-y-3">
              {summary.watchTomorrow.map((item, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.importance === 'HIGH' ? 'bg-red-600 text-white' :
                      item.importance === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {item.importance}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-white mb-1">{item.event}</p>
                      <p className="text-yellow-100 text-sm">{item.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
