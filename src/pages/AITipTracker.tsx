// src/pages/AITipTracker.tsx
// Modern 3-Tier Opportunity Tracker - Built for newbie investors

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Shield, Zap, Target, AlertTriangle,
  DollarSign, Clock, CheckCircle, XCircle, Award, Rocket
} from 'lucide-react';
import api from '../services/api';

interface Tip {
  id: number;
  ticker: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  tier: 'blue_chip' | 'explosive_growth' | 'crypto_alpha';
  entry_price: number | string;
  target_price: number | string;
  stop_loss: number | string;
  expected_gain_percent: number | string;
  risk_score: number;
  confidence: number;
  timeframe: string;
  catalysts: string[] | string;
  reasoning: string;
  exit_strategy: string;
  status: string;
  created_at: string;
}

// Helper to safely convert to number
const toNum = (val: any): number => {
  if (typeof val === 'number') return val;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

// Helper to safely parse catalysts
const parseCatalysts = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return [val];
    }
  }
  return [];
};

export default function AITipTracker() {
  const [blueChips, setBlueChips] = useState<Tip[]>([]);
  const [explosive, setExplosive] = useState<Tip[]>([]);
  const [crypto, setCrypto] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTips();
  }, []);

  const loadTips = async () => {
    try {
      const [blue, exp, crypt] = await Promise.all([
        api.api.get('/api/ai-tips/by-tier/blue_chip'),
        api.api.get('/api/ai-tips/by-tier/explosive_growth'),
        api.api.get('/api/ai-tips/by-tier/crypto_alpha')
      ]);
      
      setBlueChips(blue.data.data || []);
      setExplosive(exp.data.data || []);
      setCrypto(crypt.data.data || []);
    } catch (error) {
      console.error('Failed to load tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 3) return 'text-green-600 bg-green-50';
    if (risk <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskLabel = (risk: number) => {
    if (risk <= 3) return 'Low Risk';
    if (risk <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Stock Picks
        </h1>
        <p className="text-gray-600">
          Simple. Data-backed. Ready to trade.
        </p>
      </div>

      {/* Tier 1: Safe & Steady */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Safe & Steady</h2>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            High Confidence
          </span>
        </div>
        <p className="text-gray-600 mb-6">Big companies, steady gains, lower risk.</p>
        
        {blueChips.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No tips available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blueChips.slice(0, 5).map((tip) => (
              <div key={tip.id} className="bg-white rounded-xl border-2 border-blue-200 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{tip.ticker}</h3>
                    <p className="text-sm text-gray-500">{tip.timeframe}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg font-bold text-sm ${
                    tip.action === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tip.action}
                  </span>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Target Gain</span>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">+{toNum(tip.expected_gain_percent).toFixed(0)}%</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Buy At</p>
                    <p className="text-lg font-bold">${toNum(tip.entry_price).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Target</p>
                    <p className="text-lg font-bold text-green-600">${toNum(tip.target_price).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getRiskColor(tip.risk_score)}`}>
                    {getRiskLabel(tip.risk_score)}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Confidence: </span>
                    <span className="font-bold text-purple-600">{tip.confidence}%</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">{tip.reasoning}</p>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600 mb-1">Exit Strategy</p>
                  <p className="text-sm font-medium text-gray-800">{tip.exit_strategy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier 2: High Growth */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold">High Growth Plays</h2>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            Big Opportunity
          </span>
        </div>
        <p className="text-gray-600 mb-6">Higher risk, bigger potential gains. Recent catalysts.</p>
        
        {explosive.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Rocket className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No explosive plays found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {explosive.slice(0, 5).map((tip) => (
              <div key={tip.id} className="bg-white rounded-xl border-2 border-orange-200 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{tip.ticker}</h3>
                    <p className="text-sm text-gray-500">{tip.timeframe}</p>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-lg font-bold text-sm">
                    {tip.action}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Target Gain</span>
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600">+{toNum(tip.expected_gain_percent).toFixed(0)}%</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Buy</p>
                    <p className="text-sm font-bold">${toNum(tip.entry_price).toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Target</p>
                    <p className="text-sm font-bold text-green-600">${toNum(tip.target_price).toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Stop</p>
                    <p className="text-sm font-bold text-red-600">${toNum(tip.stop_loss).toFixed(2)}</p>
                  </div>
                </div>

                <div className={`px-3 py-2 rounded-lg mb-3 ${getRiskColor(tip.risk_score)}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">{getRiskLabel(tip.risk_score)}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Why Now:</p>
                  <div className="flex flex-wrap gap-1">
                    {parseCatalysts(tip.catalysts).slice(0, 2).map((cat, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3">{tip.reasoning.slice(0, 100)}...</p>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs text-gray-600 mb-1">Exit Plan</p>
                  <p className="text-sm font-medium text-gray-800">{tip.exit_strategy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier 3: Crypto Alpha */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Crypto Plays</h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Volatile & Fast
          </span>
        </div>
        <p className="text-gray-600 mb-6">Crypto moves fast. Higher risk, huge potential. Watch closely.</p>
        
        {crypto.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No crypto plays available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crypto.slice(0, 5).map((tip) => (
              <div key={tip.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{tip.ticker}</h3>
                    <p className="text-sm text-purple-600 font-semibold">{tip.timeframe}</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-sm">
                    {tip.action}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 mb-4 border-2 border-purple-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-700 font-semibold">Potential Gain</span>
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-4xl font-bold text-purple-600">+{toNum(tip.expected_gain_percent).toFixed(0)}%</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Entry</p>
                    <p className="text-sm font-bold">${toNum(tip.entry_price).toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Target</p>
                    <p className="text-sm font-bold text-green-700">${toNum(tip.target_price).toFixed(2)}</p>
                  </div>
                  <div className="bg-red-100 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Stop</p>
                    <p className="text-sm font-bold text-red-700">${toNum(tip.stop_loss).toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-red-100 border-2 border-red-300 px-3 py-2 rounded-lg mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold text-red-700">High Risk - Crypto Volatility</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 font-medium">{tip.reasoning}</p>

                <div className="bg-white/70 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-purple-700 font-semibold mb-1">⚡ Exit Fast:</p>
                  <p className="text-sm font-medium text-gray-800">{tip.exit_strategy}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
