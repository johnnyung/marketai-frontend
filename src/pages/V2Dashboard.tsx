// src/pages/V2Dashboard.tsx - ENHANCED with ANALYTICS WIDGETS
// 40+ Data Sources + Historical Pattern Matching + Predictive Analytics

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Brain, Activity, Database,
  RefreshCw, PlayCircle, CheckCircle, XCircle, Zap, History, Target,
  BarChart3, Clock, Shield, Award
} from 'lucide-react';
import api from '../services/api';

interface AnalyticsWidget {
  title: string;
  value: string | number;
  subtext: string;
  trend?: 'up' | 'down' | 'neutral';
  accuracy?: number;
}

export default function V2Dashboard() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [scandalAlert, setScandalAlert] = useState<any>(null);
  const [cryptoCorrelation, setCryptoCorrelation] = useState<any>(null);
  const [patternMatches, setPatternMatches] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsWidget[]>([
    { title: 'Historical Patterns', value: '7', subtext: 'Major events tracked', accuracy: 82 },
    { title: 'Weekend Correlation', value: '78%', subtext: 'Crypto-Market accuracy', trend: 'up' },
    { title: 'Pattern Matches', value: '0', subtext: 'Active matches today' },
    { title: 'Prediction Accuracy', value: '0%', subtext: 'Last 30 days', accuracy: 0 }
  ]);
  
  const [dataSources] = useState([
    // Market Data (8 sources)
    { name: 'Stock Prices (Real-time)', category: 'market', count: 0, endpoint: '/api/collect/stocks', icon: TrendingUp },
    { name: 'Options Flow (Unusual Activity)', category: 'market', count: 0, endpoint: '/api/collect/options', icon: Target },
    { name: 'Futures (8 contracts)', category: 'market', count: 0, endpoint: '/api/collect/futures', icon: BarChart3 },
    { name: 'Market Indices', category: 'market', count: 0, endpoint: '/api/collect/indices', icon: Activity },
    { name: 'Pre/After Hours', category: 'market', count: 0, endpoint: '/api/collect/extended', icon: Clock },
    { name: 'ETF Flows', category: 'market', count: 0, endpoint: '/api/collect/etf-flows', icon: Database },
    { name: 'Dark Pool Activity', category: 'market', count: 0, endpoint: '/api/collect/darkpool', icon: Shield },
    { name: 'Short Interest', category: 'market', count: 0, endpoint: '/api/collect/short-interest', icon: TrendingDown },
    
    // Crypto (5 sources)
    { name: 'Crypto Prices (24/7)', category: 'crypto', count: 0, endpoint: '/api/crypto-correlation/crypto/collect', icon: Zap },
    { name: 'Crypto Sentiment', category: 'crypto', count: 0, endpoint: '/api/collect/crypto-sentiment', icon: Activity },
    { name: 'DeFi Total Value Locked', category: 'crypto', count: 0, endpoint: '/api/collect/defi', icon: Database },
    { name: 'NFT Market Trends', category: 'crypto', count: 0, endpoint: '/api/collect/nft', icon: Target },
    { name: 'Whale Wallet Movements', category: 'crypto', count: 0, endpoint: '/api/collect/whale-tracking', icon: TrendingUp },
    
    // Social (6 sources)
    { name: 'Reddit (WSB/Investing)', category: 'social', count: 0, endpoint: '/api/collect/reddit', icon: Activity },
    { name: 'Twitter/X Sentiment', category: 'social', count: 0, endpoint: '/api/collect/twitter', icon: Activity },
    { name: 'StockTwits Buzz', category: 'social', count: 0, endpoint: '/api/collect/stocktwits', icon: Target },
    { name: 'Financial Influencers', category: 'social', count: 0, endpoint: '/api/collect/influencers', icon: Award },
    { name: 'Discord Trading Groups', category: 'social', count: 0, endpoint: '/api/collect/discord', icon: Activity },
    { name: 'YouTube Finance Creators', category: 'social', count: 0, endpoint: '/api/collect/youtube', icon: Activity },
    
    // News (6 sources)
    { name: 'Financial News (Reuters/Bloomberg)', category: 'news', count: 0, endpoint: '/api/collect/news', icon: Activity },
    { name: 'Political News (All Sources)', category: 'news', count: 0, endpoint: '/api/collect/political', icon: AlertTriangle },
    { name: 'Earnings Transcripts', category: 'news', count: 0, endpoint: '/api/collect/earnings', icon: BarChart3 },
    { name: 'Company Press Releases', category: 'news', count: 0, endpoint: '/api/collect/press', icon: Activity },
    { name: 'Analyst Ratings Changes', category: 'news', count: 0, endpoint: '/api/collect/analyst-ratings', icon: Award },
    { name: 'CEO/CFO Interviews', category: 'news', count: 0, endpoint: '/api/collect/interviews', icon: Activity },
    
    // Insider & Institutional (5 sources)
    { name: 'Insider Trading (Form 4)', category: 'insider', count: 0, endpoint: '/api/collect/insider', icon: Target },
    { name: 'Institutional Holdings (13F)', category: 'insider', count: 0, endpoint: '/api/collect/institutional', icon: Shield },
    { name: 'Hedge Fund Positions', category: 'insider', count: 0, endpoint: '/api/collect/hedgefunds', icon: TrendingUp },
    { name: 'Activist Investor Activity', category: 'insider', count: 0, endpoint: '/api/collect/activists', icon: AlertTriangle },
    { name: 'Executive Compensation', category: 'insider', count: 0, endpoint: '/api/collect/exec-comp', icon: Database },
    
    // Regulatory (4 sources)
    { name: 'SEC Filings (8-K, 10-K, 10-Q)', category: 'regulatory', count: 0, endpoint: '/api/collect/sec', icon: Activity },
    { name: 'IPO Pipeline & S-1s', category: 'regulatory', count: 0, endpoint: '/api/collect/ipo', icon: Target },
    { name: 'SPAC Mergers & DAs', category: 'regulatory', count: 0, endpoint: '/api/collect/spac', icon: Zap },
    { name: 'FDA Approvals/Rejections', category: 'regulatory', count: 0, endpoint: '/api/collect/fda', icon: Shield },
    
    // Macro (6 sources)
    { name: 'Fed Interest Rate Data', category: 'macro', count: 0, endpoint: '/api/collect/fed', icon: TrendingUp },
    { name: 'Economic Indicators (CPI, Jobs)', category: 'macro', count: 0, endpoint: '/api/collect/economic', icon: BarChart3 },
    { name: 'Treasury Yields (All Durations)', category: 'macro', count: 0, endpoint: '/api/collect/treasury', icon: Activity },
    { name: 'Geopolitical Events', category: 'macro', count: 0, endpoint: '/api/collect/geopolitical', icon: AlertTriangle },
    { name: 'Dollar Strength Index', category: 'macro', count: 0, endpoint: '/api/collect/dollar', icon: TrendingUp },
    { name: 'Commodity Prices', category: 'macro', count: 0, endpoint: '/api/collect/commodities', icon: Database }
  ]);

  const [dataSourceStates, setDataSourceStates] = useState<Record<string, any>>({});

  useEffect(() => {
    loadDashboardData();
    loadRealPrices();
    const dataInterval = setInterval(loadDashboardData, 60000);
    const priceInterval = setInterval(loadRealPrices, 60000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(priceInterval);
    };
  }, []);

  const loadRealPrices = async () => {
    const tickers = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'];
    const prices: Record<string, number> = {};
    
    for (const ticker of tickers) {
      try {
        const response = await api.api.get(`/api/market/price/${ticker}`);
        if (response.data.success) {
          prices[ticker] = response.data.data.price;
        }
      } catch (error) {
        prices[ticker] = 0;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    setStockPrices(prices);
  };

  const loadDashboardData = async () => {
    try {
      await Promise.allSettled([
        loadPatternMatches(),
        loadAnalytics(),
        loadCryptoCorrelation(),
        loadRecommendations()
      ]);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  };

  const loadPatternMatches = async () => {
    try {
      const response = await api.api.get('/api/analytics/pattern-matches');
      if (response.data.success) {
        const matches = response.data.data;
        setPatternMatches(matches);
        
        // Update alert if high-similarity match found
        const highMatch = matches.find((m: any) => m.similarity_score > 0.75);
        if (highMatch) {
          setScandalAlert({
            active: true,
            type: 'Political Investigation',
            historicalSimilarity: highMatch.historical_match,
            expectedImpact: highMatch.predicted_impact,
            expectedDuration: `${highMatch.predicted_duration} days`,
            similarity: highMatch.similarity_score
          });
        }
      }
    } catch (error) {
      console.error('Pattern match load failed:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await api.api.get('/api/analytics/summary');
      if (response.data.success) {
        const data = response.data.data;
        setAnalyticsData([
          { title: 'Historical Patterns', value: data.historical_events || 7, subtext: 'Major events tracked', accuracy: 82 },
          { title: 'Weekend Correlation', value: `${data.crypto_correlation_strength || 78}%`, subtext: 'Crypto-Market accuracy', trend: 'up' },
          { title: 'Pattern Matches', value: data.active_matches || 0, subtext: 'Active matches today' },
          { title: 'Prediction Accuracy', value: `${data.overall_accuracy || 0}%`, subtext: 'Last 30 days', accuracy: data.overall_accuracy || 0 }
        ]);
      }
    } catch (error) {
      console.error('Analytics load failed:', error);
    }
  };

  const loadCryptoCorrelation = async () => {
    try {
      const response = await api.api.get('/api/crypto-correlation/status');
      if (response.data.success && response.data.data.latest_prediction) {
        setCryptoCorrelation(response.data.data.latest_prediction);
      }
    } catch (error) {
      console.error('Crypto correlation load failed:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await api.api.get('/api/ai-analysis/latest');
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations || []);
      }
    } catch (error) {
      console.error('Recommendations load failed:', error);
    }
  };

  const collectData = async (source: any) => {
    setDataSourceStates(prev => ({ ...prev, [source.name]: 'collecting' }));
    
    try {
      await api.api.post(source.endpoint);
      setDataSourceStates(prev => ({ ...prev, [source.name]: 'success' }));
      setTimeout(() => loadDashboardData(), 1000);
    } catch (error) {
      setDataSourceStates(prev => ({ ...prev, [source.name]: 'error' }));
    }
  };

  const collectAllData = async () => {
    setIsCollecting(true);
    for (const source of dataSources) {
      collectData(source);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsCollecting(false);
  };

  const runComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await api.api.post('/api/analytics/run-comprehensive');
      await loadDashboardData();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'collecting') return <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />;
    if (status === 'success') return <CheckCircle className="w-3 h-3 text-green-600" />;
    if (status === 'error') return <XCircle className="w-3 h-3 text-red-600" />;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* ALERTS */}
      {scandalAlert?.active && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-900 mb-2">
                🚨 Historical Pattern Alert: {scandalAlert.type}
              </h3>
              <p className="text-red-800 mb-3">
                <strong>{(scandalAlert.similarity * 100).toFixed(0)}% similarity</strong> to: {scandalAlert.historicalSimilarity}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Expected Impact</p>
                  <p className="text-lg font-bold text-red-600">{scandalAlert.expectedImpact}%</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Duration</p>
                  <p className="text-lg font-bold">{scandalAlert.expectedDuration}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs text-gray-600">Action</p>
                  <p className="text-lg font-bold text-orange-600">Rotate to Safe Havens</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cryptoCorrelation && cryptoCorrelation.confidence_score > 0.70 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Zap className="w-8 h-8 text-purple-600 animate-pulse" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                💹 Weekend Crypto Correlation Signal
              </h3>
              <p className="text-purple-800 mb-3">
                Bitcoin {cryptoCorrelation.crypto_weekend_change > 0 ? 'surged' : 'dropped'}{' '}
                <strong>{Math.abs(cryptoCorrelation.crypto_weekend_change).toFixed(2)}%</strong> → 
                Market predicted <strong>{cryptoCorrelation.predicted_direction.replace('_', ' ')}</strong>
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">
                  {(cryptoCorrelation.confidence_score * 100).toFixed(0)}% Confidence
                </span>
                <span className="px-3 py-1 bg-white text-purple-900 rounded-full text-sm font-bold">
                  Watch: COIN, MSTR, MARA
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Brain className="w-10 h-10" />
              Intelligence Command Center
            </h1>
            <p className="text-xl mt-2 opacity-90">40+ Data Sources • Historical Patterns • Predictive Analytics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runComprehensiveAnalysis}
              disabled={isAnalyzing}
              className={`px-6 py-3 bg-white text-blue-600 rounded-xl font-bold ${isAnalyzing ? 'opacity-50' : 'hover:shadow-lg'}`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
            <button
              onClick={collectAllData}
              disabled={isCollecting}
              className={`px-6 py-3 bg-green-500 text-white rounded-xl font-bold ${isCollecting ? 'opacity-50' : 'hover:shadow-lg'}`}
            >
              <PlayCircle className="w-5 h-5 inline mr-2" />
              {isCollecting ? 'Collecting...' : 'Collect All'}
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-4 gap-4">
          {analyticsData.map((widget, idx) => (
            <div key={idx} className="bg-white/20 rounded-lg p-4">
              <p className="text-sm opacity-75 mb-1">{widget.title}</p>
              <p className="text-3xl font-bold mb-1">{widget.value}</p>
              <p className="text-xs opacity-90">{widget.subtext}</p>
              {widget.accuracy && (
                <div className="mt-2 w-full bg-white/30 rounded-full h-1.5">
                  <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${widget.accuracy}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* DATA SOURCES COMPACT GRID */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <Database className="w-7 h-7 text-blue-600" />
          Live Data Collection (40 Sources)
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {dataSources.map((source) => {
            const Icon = source.icon;
            const status = dataSourceStates[source.name] || 'idle';
            
            return (
              <button
                key={source.name}
                onClick={() => collectData(source)}
                disabled={status === 'collecting'}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  status === 'success' ? 'border-green-300 bg-green-50' :
                  status === 'collecting' ? 'border-blue-300 bg-blue-50' :
                  status === 'error' ? 'border-red-300 bg-red-50' :
                  'border-gray-200 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className="w-4 h-4 text-gray-600" />
                  {getStatusIcon(status)}
                </div>
                <p className="text-xs font-semibold text-gray-900 leading-tight">{source.name}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PATTERN MATCHES */}
      {patternMatches.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <History className="w-7 h-7 text-purple-600" />
            Historical Pattern Matches ({patternMatches.length})
          </h2>
          <div className="space-y-3">
            {patternMatches.map((match: any, idx: number) => (
              <div key={idx} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{match.current_event}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Similar to: <strong>{match.historical_match}</strong>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{match.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      {(match.similarity_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">Similarity</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-white rounded p-2">
                    <span className="text-xs text-gray-600">Predicted Impact</span>
                    <div className="text-lg font-bold text-red-600">{match.predicted_impact}%</div>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-xs text-gray-600">Duration</span>
                    <div className="text-lg font-bold">{match.predicted_duration} days</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {recommendations.slice(0, 6).map((rec: any, idx: number) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`px-6 py-4 ${rec.action === 'BUY' ? 'bg-green-100' : rec.action === 'SELL' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{rec.ticker}</h3>
                  <span className={`text-2xl font-bold ${rec.action === 'BUY' ? 'text-green-600' : rec.action === 'SELL' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {rec.action}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-bold">{rec.confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className={`h-2 rounded-full ${rec.confidence > 70 ? 'bg-green-500' : rec.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${rec.confidence}%` }} />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target</span>
                    <span className="font-bold text-green-600">${rec.targetPrice?.toFixed(2) || 'TBD'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
