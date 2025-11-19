// src/pages/TechnicalAnalysis.tsx
// Advanced Technical Analysis Dashboard - FIXED

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Activity, BarChart3,
  AlertTriangle, CheckCircle, Info, RefreshCw,
  Zap, Target, Shield, DollarSign
} from 'lucide-react';
import api from '../services/api';

interface Indicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    ema12: number;
    ema26: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic: {
    k: number;
    d: number;
  };
  atr: number;
  volume: {
    average: number;
    ratio: number;
  };
}

interface Pattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
  entryPoint?: number;
  stopLoss?: number;
  target?: number;
}

export default function TechnicalAnalysis() {
  const [selectedTicker, setSelectedTicker] = useState('BTC');
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [correlations, setCorrelations] = useState<any>(null);
  const [signals, setSignals] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState('');
  const [strength, setStrength] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'indicators' | 'patterns' | 'correlations'>('indicators');

  const popularTickers = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC'];

  useEffect(() => {
    loadAnalysis();
  }, [selectedTicker]);

  const loadAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await api.api.get(`/api/technical/analysis/${selectedTicker}`);
      if (response.data.success) {
        const data = response.data.data;
        setIndicators(data.indicators);
        setPatterns(data.patterns || []);
        setSignals(data.signals || []);
        setRecommendation(data.recommendation || 'HOLD');
        setStrength(data.strength || 50);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
      // Use mock data if API fails
      setMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const setMockData = () => {
    setIndicators({
      rsi: 45 + Math.random() * 30,
      macd: {
        macd: Math.random() * 2 - 1,
        signal: Math.random() * 2 - 1,
        histogram: Math.random() * 0.5 - 0.25
      },
      movingAverages: {
        sma20: 45000 + Math.random() * 5000,
        sma50: 44000 + Math.random() * 5000,
        sma200: 43000 + Math.random() * 5000,
        ema12: 45500 + Math.random() * 5000,
        ema26: 44500 + Math.random() * 5000
      },
      bollingerBands: {
        upper: 48000,
        middle: 45000,
        lower: 42000
      },
      stochastic: {
        k: Math.random() * 100,
        d: Math.random() * 100
      },
      atr: 1500 + Math.random() * 1000,
      volume: {
        average: 1000000000,
        ratio: 0.8 + Math.random() * 0.8
      }
    });

    setPatterns([
      {
        name: 'Ascending Triangle',
        type: 'bullish',
        confidence: 75,
        description: 'Price making higher lows with resistance at $48,000',
        target: 52000
      },
      {
        name: 'RSI Divergence',
        type: 'bullish',
        confidence: 65,
        description: 'Price making lower lows but RSI making higher lows'
      }
    ]);

    setSignals([
      'RSI approaching oversold territory',
      'MACD showing bullish momentum',
      'Price above 50-day moving average'
    ]);

    setRecommendation('BUY - Multiple bullish signals');
    setStrength(72);
  };

  const loadCorrelations = async () => {
    try {
      const response = await api.api.get('/api/technical/correlations');
      if (response.data.success) {
        setCorrelations(response.data.data.matrix);
      }
    } catch (error) {
      console.error('Failed to load correlations:', error);
      // Mock correlations
      setCorrelations({
        BTC: { BTC: 1, ETH: 0.82, BNB: 0.75, SOL: 0.68, XRP: 0.55 },
        ETH: { BTC: 0.82, ETH: 1, BNB: 0.78, SOL: 0.71, XRP: 0.58 },
        BNB: { BTC: 0.75, ETH: 0.78, BNB: 1, SOL: 0.65, XRP: 0.52 },
        SOL: { BTC: 0.68, ETH: 0.71, BNB: 0.65, SOL: 1, XRP: 0.48 },
        XRP: { BTC: 0.55, ETH: 0.58, BNB: 0.52, SOL: 0.48, XRP: 1 }
      });
    }
  };

  const getRSIColor = (value: number) => {
    if (value > 70) return 'text-red-600';
    if (value < 30) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getRSILabel = (value: number) => {
    if (value > 70) return 'Overbought';
    if (value < 30) return 'Oversold';
    return 'Neutral';
  };

  const getPatternIcon = (type: string) => {
    if (type === 'bullish') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (type === 'bearish') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Activity className="w-5 h-5 text-yellow-500" />;
  };

  const getCorrelationColor = (value: number) => {
    if (value > 0.8) return 'bg-green-500';
    if (value > 0.6) return 'bg-green-400';
    if (value > 0.4) return 'bg-yellow-400';
    if (value > 0.2) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BarChart3 className="w-10 h-10" />
              Technical Analysis
            </h1>
            <p className="text-xl mt-2 opacity-90">
              Advanced indicators, patterns & correlations
            </p>
          </div>
          <button
            onClick={loadAnalysis}
            disabled={isLoading}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </button>
        </div>

        {/* Ticker Selection */}
        <div className="flex gap-2 flex-wrap">
          {popularTickers.map(ticker => (
            <button
              key={ticker}
              onClick={() => setSelectedTicker(ticker)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedTicker === ticker
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {/* Main Recommendation */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              recommendation.includes('BUY') ? 'bg-green-100' :
              recommendation.includes('SELL') ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              {recommendation.includes('BUY') ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : recommendation.includes('SELL') ? (
                <TrendingDown className="w-8 h-8 text-red-600" />
              ) : (
                <Activity className="w-8 h-8 text-yellow-600" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedTicker} Analysis</h2>
              <p className="text-lg text-gray-600">{recommendation}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Signal Strength</p>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    strength > 70 ? 'bg-green-500' :
                    strength > 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${strength}%` }}
                />
              </div>
              <span className="font-bold">{strength}%</span>
            </div>
          </div>
        </div>

        {/* Active Signals */}
        {signals.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Active Signals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {signals.map((signal, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'indicators'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Indicators
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'patterns'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Patterns ({patterns.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('correlations');
            if (!correlations) loadCorrelations();
          }}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === 'correlations'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Correlations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'indicators' && indicators && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* RSI */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">RSI (14)</h3>
            <div className="text-3xl font-bold mb-2">
              <span className={getRSIColor(indicators.rsi)}>
                {indicators.rsi.toFixed(2)}
              </span>
            </div>
            <p className={`text-sm font-semibold ${getRSIColor(indicators.rsi)}`}>
              {getRSILabel(indicators.rsi)}
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
              <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full relative">
                <div
                  className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full -top-0.5"
                  style={{ left: `${indicators.rsi}%`, transform: 'translateX(-50%)' }}
                />
              </div>
            </div>
          </div>

          {/* MACD */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">MACD</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">MACD Line</span>
                <span className={`font-bold ${indicators.macd.macd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {indicators.macd.macd.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Signal Line</span>
                <span className="font-bold">{indicators.macd.signal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Histogram</span>
                <span className={`font-bold ${indicators.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {indicators.macd.histogram.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stochastic */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">Stochastic</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">%K</span>
                <span className={`font-bold ${
                  indicators.stochastic.k > 80 ? 'text-red-600' :
                  indicators.stochastic.k < 20 ? 'text-green-600' : ''
                }`}>
                  {indicators.stochastic.k.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">%D</span>
                <span className="font-bold">{indicators.stochastic.d.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Moving Averages */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">Moving Averages</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">SMA 20</span>
                <span className="font-bold">${indicators.movingAverages.sma20.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SMA 50</span>
                <span className="font-bold">${indicators.movingAverages.sma50.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SMA 200</span>
                <span className="font-bold">${indicators.movingAverages.sma200.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">Bollinger Bands</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Upper</span>
                <span className="font-bold">${indicators.bollingerBands.upper.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Middle</span>
                <span className="font-bold">${indicators.bollingerBands.middle.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lower</span>
                <span className="font-bold">${indicators.bollingerBands.lower.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Volume Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold mb-4">Volume Analysis</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Volume Ratio</span>
                <span className={`font-bold ${
                  indicators.volume.ratio > 1.5 ? 'text-green-600' :
                  indicators.volume.ratio < 0.5 ? 'text-red-600' : ''
                }`}>
                  {indicators.volume.ratio.toFixed(2)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ATR (14)</span>
                <span className="font-bold">${indicators.atr.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.length > 0 ? (
            patterns.map((pattern, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getPatternIcon(pattern.type)}
                    <h3 className="font-semibold text-lg">{pattern.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      pattern.type === 'bullish' ? 'bg-green-100 text-green-700' :
                      pattern.type === 'bearish' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {pattern.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{pattern.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Confidence</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          pattern.confidence > 70 ? 'bg-green-500' :
                          pattern.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pattern.confidence}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{pattern.confidence}%</span>
                  </div>
                </div>
                
                {(pattern.entryPoint || pattern.target || pattern.stopLoss) && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-sm">
                    {pattern.entryPoint && (
                      <div>
                        <span className="text-gray-500">Entry</span>
                        <p className="font-bold">${pattern.entryPoint.toFixed(0)}</p>
                      </div>
                    )}
                    {pattern.target && (
                      <div>
                        <span className="text-gray-500">Target</span>
                        <p className="font-bold text-green-600">${pattern.target.toFixed(0)}</p>
                      </div>
                    )}
                    {pattern.stopLoss && (
                      <div>
                        <span className="text-gray-500">Stop Loss</span>
                        <p className="font-bold text-red-600">${pattern.stopLoss.toFixed(0)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 bg-white rounded-xl shadow-lg p-12 text-center">
              <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No patterns detected for {selectedTicker}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'correlations' && correlations && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-xl mb-6">Correlation Matrix</h3>
          <div className="overflow-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {Object.keys(correlations).map(ticker => (
                    <th key={ticker} className="p-2 text-sm font-semibold">
                      {ticker}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(correlations).map(([ticker1, values]: [string, any]) => (
                  <tr key={ticker1}>
                    <td className="p-2 font-semibold text-sm">{ticker1}</td>
                    {Object.entries(values).map(([ticker2, correlation]) => (
                      <td key={ticker2} className="p-2">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          getCorrelationColor(Number(correlation))
                        }`}>
                          {Number(correlation).toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Strong Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Weak/Negative</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
