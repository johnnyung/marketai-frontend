import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Clock, AlertCircle, Zap, Calendar, BookOpen, Shield, BarChart3, Sparkles } from 'lucide-react';
import { ExecutiveSummary } from '../components/ExecutiveSummary';
import { VettingBadge } from '../components/VettingBadge';

const API_URL = 'https://marketai-backend-production-397e.up.railway.app';

interface TradingSignal {
  ticker: string;
  action: 'BUY' | 'SELL' | 'WATCH';
  priceTarget: number | null;
  currentPrice: number | null;
  confidence: number;
  riskReward: number;
  reasoning: string;
  catalysts: string[];
  timeframe: string;
  supportingEntries: number;
  isTracked?: boolean;
}

interface DeepDive {
  ticker: string;
  company_name: string;
  analysis: string;
  key_points: string[];
  bull_case: string;
  bear_case: string;
  catalysts: string[];
  risks: string[];
  recommendation: string;
  confidence: number;
  generated_at?: Date;
}

interface PatternMatch {
  pattern_name: string;
  description: string;
  current_similarity: number;
  implications: string;
  historical_context: string;
  historical_outcome?: string;
}

interface RiskAssessment {
  overall_risk_level: string;
  risk_score: number;
  top_risks: Array<{
    category: string;
    description: string;
    severity: string;
  }>;
}

const DailyIntelligence: React.FC = () => {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [deepDive, setDeepDive] = useState<DeepDive | null>(null);
  const [cachedAnalyses, setCachedAnalyses] = useState<DeepDive[]>([]);
  const [patterns, setPatterns] = useState<PatternMatch[]>([]);
  const [risks, setRisks] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDeepDive, setLoadingDeepDive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['signals']));
  const [customTicker, setCustomTicker] = useState('');
  
  // Custom ticker analysis states
  const [customSignalTicker, setCustomSignalTicker] = useState('');
  const [customSignal, setCustomSignal] = useState<TradingSignal | null>(null);
  const [loadingCustomSignal, setLoadingCustomSignal] = useState(false);
  
  const [customPatternTicker, setCustomPatternTicker] = useState('');
  const [customPatterns, setCustomPatterns] = useState<PatternMatch[]>([]);
  const [loadingCustomPatterns, setLoadingCustomPatterns] = useState(false);
  const [showGeneralPatterns, setShowGeneralPatterns] = useState(true);
  
  const [customRiskTicker, setCustomRiskTicker] = useState('');
  const [customRisks, setCustomRisks] = useState<RiskAssessment | null>(null);
  const [loadingCustomRisks, setLoadingCustomRisks] = useState(false);
  const [showGeneralRisks, setShowGeneralRisks] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setError('Please login to view Daily Intelligence');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch trading signals
      const signalsRes = await fetch(`${API_URL}/api/opportunities/signals`, { headers });
      if (signalsRes.ok) {
        const signalsData = await signalsRes.json();
        setSignals(signalsData.signals || []);
      }

      // Fetch today's cached analyses
      const cachedRes = await fetch(`${API_URL}/api/deep-dive/today`, { headers });
      if (cachedRes.ok) {
        const cachedData = await cachedRes.json();
        setCachedAnalyses(cachedData.data || []);
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load Daily Intelligence');
      setLoading(false);
    }
  };

  const loadDeepDive = async (ticker: string) => {
    if (!ticker) return;
    
    setLoadingDeepDive(true);
    setDeepDive(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const url = `${API_URL}/api/deep-dive/ticker-of-day?ticker=${ticker}`;

      const [deepDiveRes, patternsRes, risksRes] = await Promise.all([
        fetch(url, { headers }),
        patterns.length === 0 ? fetch(`${API_URL}/api/deep-dive/pattern-watch`, { headers }) : Promise.resolve(null),
        risks === null ? fetch(`${API_URL}/api/deep-dive/risk-monitor`, { headers }) : Promise.resolve(null)
      ]);

      if (deepDiveRes.ok) {
        const data = await deepDiveRes.json();
        setDeepDive(data.data);
        
        // Add to cached analyses if not already there
        if (!cachedAnalyses.find(a => a.ticker === data.data.ticker)) {
          setCachedAnalyses([data.data, ...cachedAnalyses]);
        }
      }

      if (patternsRes && patternsRes.ok) {
        const data = await patternsRes.json();
        setPatterns(data.data || []);
      }

      if (risksRes && risksRes.ok) {
        const data = await risksRes.json();
        setRisks(data.data);
      }

      setLoadingDeepDive(false);
    } catch (err) {
      console.error('Failed to load deep dive:', err);
      setLoadingDeepDive(false);
    }
  };
  
  const loadCustomSignal = async (ticker: string) => {
    if (!ticker) return;
    
    setLoadingCustomSignal(true);
    setCustomSignal(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${API_URL}/api/opportunities/signal/${ticker}`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setCustomSignal(data.signal);
      } else {
        const error = await res.json();
        alert(error.error || `No intelligence found for ${ticker}`);
      }
      
      setLoadingCustomSignal(false);
    } catch (err) {
      console.error('Failed to load custom signal:', err);
      setLoadingCustomSignal(false);
      alert('Failed to generate signal');
    }
  };
  
  const loadCustomPatterns = async (ticker: string) => {
    if (!ticker) return;
    
    setLoadingCustomPatterns(true);
    setCustomPatterns([]);
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${API_URL}/api/deep-dive/pattern-watch/${ticker}`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setCustomPatterns(data.data || []);
        setShowGeneralPatterns(false);
      } else {
        const error = await res.json();
        alert(error.error || `No intelligence found for ${ticker}`);
      }
      
      setLoadingCustomPatterns(false);
    } catch (err) {
      console.error('Failed to load custom patterns:', err);
      setLoadingCustomPatterns(false);
      alert('Failed to generate patterns');
    }
  };
  
  const loadCustomRisks = async (ticker: string) => {
    if (!ticker) return;
    
    setLoadingCustomRisks(true);
    setCustomRisks(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const res = await fetch(`${API_URL}/api/deep-dive/risk-monitor/${ticker}`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setCustomRisks(data.data);
        setShowGeneralRisks(false);
      } else {
        const error = await res.json();
        alert(error.error || `No intelligence found for ${ticker}`);
      }
      
      setLoadingCustomRisks(false);
    } catch (err) {
      console.error('Failed to load custom risks:', err);
      setLoadingCustomRisks(false);
      alert('Failed to generate risk assessment');
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'bg-green-100 text-green-800 border-green-300';
      case 'SELL': return 'bg-red-100 text-red-800 border-red-300';
      case 'WATCH': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'extreme': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Daily Intelligence...</p>
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

  // Get top 5 tracked tickers from signals
  const topTickers = signals
    .filter(s => s.action !== 'WATCH')
    .slice(0, 5)
    .map(s => s.ticker);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Executive Summary */}
      <ExecutiveSummary />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-blue-600" />
          Daily Intelligence
        </h1>
        <p className="text-gray-600">
          AI-powered market analysis • Deep research cached daily to save costs
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => toggleSection('signals')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            expandedSections.has('signals')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Trading Signals
        </button>
        <button
          onClick={() => toggleSection('deepdive')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            expandedSections.has('deepdive')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Deep Dive {cachedAnalyses.length > 0 && `(${cachedAnalyses.length})`}
        </button>
        <button
          onClick={() => toggleSection('patterns')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            expandedSections.has('patterns')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Pattern Watch
        </button>
        <button
          onClick={() => toggleSection('risks')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            expandedSections.has('risks')
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Risk Monitor
        </button>
      </div>

      {/* Trading Signals Section */}
      {expandedSections.has('signals') && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-green-600" />
            Top 5 AI Trading Signals
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {signals.slice(0, 5).map((signal, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{signal.ticker}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getActionColor(signal.action)}`}>
                          {signal.action}
                        </span>
                        {signal.isTracked && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-300">
                            📍 Tracked
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Confidence: <span className={`font-semibold ${getConfidenceColor(signal.confidence)}`}>{signal.confidence}%</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{signal.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Risk/Reward</div>
                      <div className="text-2xl font-bold text-blue-600">{signal.riskReward}:1</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">AI Analysis</h4>
                    <p className="text-gray-700 leading-relaxed">{signal.reasoning}</p>
                  </div>

                  {signal.catalysts.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Key Catalysts</h4>
                      <div className="space-y-2">
                        {signal.catalysts.map((catalyst, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700">{catalyst}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 20-Point Vetting */}
                  <div className="mt-4">
                    <VettingBadge ticker={signal.ticker} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Custom Ticker Signal */}
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-md border-2 border-blue-200 p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Get Signal for Specific Ticker
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter any ticker symbol to get AI-powered trading signal based on recent intelligence
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={customSignalTicker}
                onChange={(e) => setCustomSignalTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customSignalTicker) {
                    loadCustomSignal(customSignalTicker);
                  }
                }}
                placeholder="Enter ticker (e.g., ACHR)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                maxLength={5}
                disabled={loadingCustomSignal}
              />
              <button
                onClick={() => customSignalTicker && loadCustomSignal(customSignalTicker)}
                disabled={loadingCustomSignal || !customSignalTicker}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loadingCustomSignal ? 'Analyzing...' : 'Get Signal'}
              </button>
            </div>
          </div>

          {/* Custom Signal Display */}
          {customSignal && !loadingCustomSignal && (
            <div className="bg-white rounded-xl shadow-lg border-2 border-blue-300 overflow-hidden mt-6">
              <div className="bg-gradient-to-r from-blue-100 to-white p-6 border-b border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{customSignal.ticker}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getActionColor(customSignal.action)}`}>
                        {customSignal.action}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
                        🎯 Custom Analysis
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Confidence: <span className={`font-semibold ${getConfidenceColor(customSignal.confidence)}`}>{customSignal.confidence}%</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{customSignal.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Risk/Reward</div>
                    <div className="text-2xl font-bold text-blue-600">{customSignal.riskReward}:1</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">AI Analysis</h4>
                  <p className="text-gray-700 leading-relaxed">{customSignal.reasoning}</p>
                </div>

                {customSignal.catalysts.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Key Catalysts</h4>
                    <div className="space-y-2">
                      {customSignal.catalysts.map((catalyst, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{catalyst}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 20-Point Vetting */}
                <div className="mt-4">
                  <VettingBadge ticker={customSignal.ticker} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deep Dive Section */}
      {expandedSections.has('deepdive') && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
            Deep Dive Analysis
          </h2>
          
          <p className="text-gray-600 mb-6">
            Select a ticker from AI recommendations or enter your own. Analysis is cached for the day to save costs.
          </p>

          {/* Ticker Selection */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Quick Select from AI Recommendations
              </h3>
              <div className="flex flex-wrap gap-2">
                {topTickers.map(ticker => (
                  <button
                    key={ticker}
                    onClick={() => loadDeepDive(ticker)}
                    disabled={loadingDeepDive}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${
                      cachedAnalyses.find(a => a.ticker === ticker)
                        ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {ticker}
                    {cachedAnalyses.find(a => a.ticker === ticker) && ' ✓'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={customTicker}
                onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customTicker) {
                    loadDeepDive(customTicker);
                  }
                }}
                placeholder="Or enter any ticker (e.g., TSLA)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                maxLength={5}
                disabled={loadingDeepDive}
              />
              <button
                onClick={() => customTicker && loadDeepDive(customTicker)}
                disabled={loadingDeepDive || !customTicker}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {loadingDeepDive ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loadingDeepDive && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating comprehensive analysis... (30-60 seconds)</p>
              <p className="text-sm text-gray-500 mt-2">This will be cached for the rest of the day</p>
            </div>
          )}

          {/* Today's Cached Analyses */}
          {cachedAnalyses.length > 0 && !loadingDeepDive && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Today's Analyses ({cachedAnalyses.length})</h3>
              <div className="flex flex-wrap gap-2">
                {cachedAnalyses.map(analysis => (
                  <button
                    key={analysis.ticker}
                    onClick={() => setDeepDive(analysis)}
                    className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${
                      deepDive?.ticker === analysis.ticker
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {analysis.ticker}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deep Dive Display */}
          {deepDive && !loadingDeepDive && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{deepDive.ticker}</h3>
                <p className="text-xl text-gray-600 mb-4">{deepDive.company_name}</p>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg font-bold ${
                    deepDive.recommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                    deepDive.recommendation === 'SELL' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {deepDive.recommendation}
                  </span>
                  <span className="text-sm text-gray-600">
                    Confidence: <span className={`font-bold ${getConfidenceColor(deepDive.confidence)}`}>{deepDive.confidence}%</span>
                  </span>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {deepDive.analysis}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h4 className="text-lg font-bold text-green-800 mb-3">Bull Case</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{deepDive.bull_case}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <h4 className="text-lg font-bold text-red-800 mb-3">Bear Case</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">{deepDive.bear_case}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pattern Watch & Risk Monitor sections remain the same... */}
      {/* (keeping existing code for these sections) */}

      {/* Pattern Watch Section */}
      {expandedSections.has('patterns') && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Pattern Watch: Historical Context
          </h2>

          {patterns.length === 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const res = await fetch(`${API_URL}/api/deep-dive/pattern-watch`, { headers });
                    if (res.ok) {
                      const data = await res.json();
                      setPatterns(data.data || []);
                    }
                  } catch (err) {
                    console.error('Failed to load patterns:', err);
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Generate Pattern Analysis
              </button>
              <p className="text-sm text-gray-500 mt-3">Click to analyze historical market patterns</p>
            </div>
          )}

          {patterns.length > 0 && (
            <div className="grid grid-cols-1 gap-6">
              {patterns.map((pattern, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{pattern.pattern_name}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      {pattern.current_similarity}% Match
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Historical Context</h4>
                      <p className="text-gray-600 text-sm">{pattern.historical_context}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Current Similarities</h4>
                      <p className="text-gray-600 text-sm">{pattern.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Implications</h4>
                      <p className="text-gray-600 text-sm">{pattern.implications}</p>
                    </div>

                    {pattern.historical_outcome && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-1">Historical Outcome</h4>
                        <p className="text-yellow-700 text-sm">{pattern.historical_outcome}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Risk Monitor Section */}
      {expandedSections.has('risks') && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-orange-600" />
            Risk Monitor: Market Assessment
          </h2>

          {!risks && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const res = await fetch(`${API_URL}/api/deep-dive/risk-monitor`, { headers });
                    if (res.ok) {
                      const data = await res.json();
                      setRisks(data.data);
                    }
                  } catch (err) {
                    console.error('Failed to load risks:', err);
                  }
                }}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Generate Risk Assessment
              </button>
              <p className="text-sm text-gray-500 mt-3">Click to analyze current market risks</p>
            </div>
          )}

          {risks && (
            <div className="space-y-6">
              {/* Overall Risk Level */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Overall Risk Assessment</h3>
                  <span className={`px-4 py-2 rounded-lg font-bold border-2 ${getRiskColor(risks.overall_risk_level)}`}>
                    {risks.overall_risk_level.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          risks.risk_score >= 80 ? 'bg-red-600' :
                          risks.risk_score >= 60 ? 'bg-orange-500' :
                          risks.risk_score >= 40 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${risks.risk_score}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{risks.risk_score}/100</span>
                </div>
              </div>

              {/* Top Risks */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top Market Risks</h3>
                <div className="space-y-4">
                  {risks.top_risks.map((risk, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{risk.category}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                          risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {risk.severity}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{risk.description}</p>
                      {risk.probability && (
                        <p className="text-xs text-gray-600">Probability: {risk.probability}</p>
                      )}
                      {risk.impact && (
                        <p className="text-xs text-gray-600 mt-1">Impact: {risk.impact}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {risks.recommendations && risks.recommendations.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Risk Mitigation Strategies</h3>
                  <ul className="space-y-2">
                    {risks.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyIntelligence;
