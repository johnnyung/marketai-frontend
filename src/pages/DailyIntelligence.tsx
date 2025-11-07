import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Clock,
  BarChart3,
  Lightbulb,
  Eye,
  Star,
  ChevronRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import { API_URL } from '../config';

interface Opportunity {
  rank: number;
  ticker: string;
  action: 'LONG' | 'SHORT' | 'AVOID';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  entry: string;
  target: string;
  stop: string;
  timeframe: string;
  reasoning: string[];
  risks: string[];
  historicalContext: string;
  newsContext: string;
}

interface Catalyst {
  time: string;
  event: string;
  impact: string;
  analysis: string;
  tradingImplication: string;
  affectedSectors: string[];
}

interface WatchlistAnalysis {
  ticker: string;
  recommendation: string;
  shortReason: string;
  priceAction: string;
}

interface Intelligence {
  marketBias: 'bullish' | 'bearish' | 'neutral';
  biasStrength: number;
  riskLevel: 'low' | 'moderate' | 'high';
  executiveSummary: string;
  keyFocus: string;
  catalysts: Catalyst[];
  opportunities: Opportunity[];
  watchlistAnalysis: WatchlistAnalysis[];
  riskAlerts: string[];
  marketContext: {
    sentiment: string;
    volatilityExpectation: string;
    keyLevels: any;
  };
  strategicAdvice: string[];
  rawData?: any;
  cached?: boolean;
  generatedAt?: string;
}

export function DailyIntelligence({ density }: { density: 'comfortable' | 'compact' }) {
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const compact = density === 'compact';

  // Load cached data from localStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem('dailyIntelligence');
    const cachedDate = localStorage.getItem('dailyIntelligenceDate');
    
    if (cachedData && cachedDate) {
      try {
        const data = JSON.parse(cachedData);
        const date = new Date(cachedDate);
        
        setIntelligence(data);
        setLastUpdated(date);
      } catch (e) {
        console.error('Failed to parse cached intelligence:', e);
      }
    }
  }, []); // Only run once on mount

  const fetchIntelligence = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/intelligence/daily?refresh=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch intelligence');

      const data = await res.json();
      
      // Save to localStorage
      localStorage.setItem('dailyIntelligence', JSON.stringify(data));
      localStorage.setItem('dailyIntelligenceDate', new Date().toISOString());
      
      setIntelligence(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBiasColor = (bias: string) => {
    if (bias === 'bullish') return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (bias === 'bearish') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
  };

  const getBiasIcon = (bias: string) => {
    if (bias === 'bullish') return <TrendingUp className="w-5 h-5" />;
    if (bias === 'bearish') return <TrendingDown className="w-5 h-5" />;
    return <BarChart3 className="w-5 h-5" />;
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    if (risk === 'moderate') return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-green-600 bg-green-50 dark:bg-green-900/20';
  };

  const getConfidenceColor = (confidence: string) => {
    if (confidence === 'HIGH') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (confidence === 'MEDIUM') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  };

  const getActionColor = (action: string) => {
    if (action === 'LONG') return 'bg-green-600 text-white';
    if (action === 'SHORT') return 'bg-red-600 text-white';
    return 'bg-slate-600 text-white';
  };

  // Show loading spinner ONLY when actually fetching
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Analyzing market data...</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            This may take 10-15 seconds
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">
              Failed to Generate Intelligence
            </h3>
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={fetchIntelligence}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message to generate first report if no data
  if (!intelligence) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Ready to Generate Intelligence
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Click the button below to generate your first daily intelligence report
          </p>
          <button
            onClick={fetchIntelligence}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Zap className="w-5 h-5" />
            Generate Intelligence
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Daily Intelligence
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              AI-Powered Market Analysis
            </p>
          </div>
        </div>
        <div className="text-right">
          <button
            onClick={fetchIntelligence}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {lastUpdated && (
            <p className="text-sm text-slate-500 mt-1">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-6 border border-blue-100 dark:border-slate-700"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getBiasColor(intelligence.marketBias)}`}>
              {getBiasIcon(intelligence.marketBias)}
              <span className="font-bold capitalize">{intelligence.marketBias}</span>
              <span className="text-sm opacity-75">({intelligence.biasStrength}/10)</span>
            </div>
            <div className={`px-4 py-2 rounded-lg ${getRiskColor(intelligence.riskLevel)}`}>
              <span className="font-semibold capitalize">{intelligence.riskLevel} Risk</span>
            </div>
          </div>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
          {intelligence.executiveSummary}
        </p>

        <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
          <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              Key Focus Today:
            </h3>
            <p className="text-slate-700 dark:text-slate-300">
              {intelligence.keyFocus}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Top Opportunities */}
      {intelligence.opportunities && intelligence.opportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Top Opportunities
            </h2>
          </div>

          <div className="grid gap-4">
            {intelligence.opportunities.map((opp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">#{opp.rank}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {opp.ticker}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getActionColor(opp.action)}`}>
                          {opp.action}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getConfidenceColor(opp.confidence)}`}>
                          {opp.confidence}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {opp.score}
                    </div>
                    <div className="text-xs text-slate-500">score</div>
                  </div>
                </div>

                {/* Price Levels */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Entry</div>
                    <div className="font-bold text-green-700 dark:text-green-400">{opp.entry}</div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Target</div>
                    <div className="font-bold text-blue-700 dark:text-blue-400">{opp.target}</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Stop</div>
                    <div className="font-bold text-red-700 dark:text-red-400">{opp.stop}</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Timeframe</div>
                    <div className="font-bold text-purple-700 dark:text-purple-400">{opp.timeframe}</div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    Reasoning:
                  </h4>
                  <ul className="space-y-1">
                    {opp.reasoning.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                {opp.risks && opp.risks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Risks:
                    </h4>
                    <ul className="space-y-1">
                      {opp.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <ChevronRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Historical Context */}
                {opp.historicalContext && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Historical Context: </span>
                      {opp.historicalContext}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Catalysts */}
      {intelligence.catalysts && intelligence.catalysts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Today's Catalysts
            </h2>
          </div>

          <div className="grid gap-4">
            {intelligence.catalysts.map((catalyst, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {catalyst.time}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        catalyst.impact === 'high' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : catalyst.impact === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {catalyst.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {catalyst.event}
                    </h3>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-3">
                  {catalyst.analysis}
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">Trading Implication: </span>
                    {catalyst.tradingImplication}
                  </p>
                </div>
                {catalyst.affectedSectors && catalyst.affectedSectors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {catalyst.affectedSectors.map((sector, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-medium"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Watchlist Analysis */}
      {intelligence.watchlistAnalysis && intelligence.watchlistAnalysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Your Watchlist Intelligence
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {intelligence.watchlistAnalysis.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {item.ticker}
                  </h3>
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    item.recommendation === 'STRONG_BUY'
                      ? 'bg-green-600 text-white'
                      : item.recommendation === 'BUY'
                      ? 'bg-green-500 text-white'
                      : item.recommendation === 'HOLD'
                      ? 'bg-yellow-500 text-white'
                      : item.recommendation === 'SELL'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-500 text-white'
                  }`}>
                    {item.recommendation.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 mb-2">
                  {item.shortReason}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Watch: </span>
                  {item.priceAction}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk Alerts */}
      {intelligence.riskAlerts && intelligence.riskAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900 dark:text-red-300">
              Risk Alerts
            </h2>
          </div>
          <ul className="space-y-2">
            {intelligence.riskAlerts.map((alert, index) => (
              <li key={index} className="flex items-start gap-2 text-red-800 dark:text-red-300">
                <ChevronRight className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Strategic Advice */}
      {intelligence.strategicAdvice && intelligence.strategicAdvice.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-5 border border-purple-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Strategic Advice
            </h2>
          </div>
          <ul className="space-y-2">
            {intelligence.strategicAdvice.map((advice, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                <ChevronRight className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
