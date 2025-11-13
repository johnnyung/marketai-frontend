import React, { useState, useEffect } from 'react';
import { BookOpen, Search, TrendingUp, Clock, Sparkles, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { EnhancedDeepDive } from '../components/EnhancedDeepDive';

import { API_URL } from '../config/api';

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
  generated_at?: string;
}

interface RecommendedTicker {
  ticker: string;
  reason: string;
  confidence: number;
}

const DeepDivePage: React.FC = () => {
  const [customTicker, setCustomTicker] = useState('');
  const [deepDive, setDeepDive] = useState<DeepDive | null>(null);
  const [cachedAnalyses, setCachedAnalyses] = useState<DeepDive[]>([]);
  const [recommendedTickers, setRecommendedTickers] = useState<RecommendedTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Please login to access Deep Dive');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch cached analyses
      const cachedRes = await fetch(`${API_URL}/api/deep-dive/cached`, { headers });
      if (cachedRes.ok) {
        const data = await cachedRes.json();
        setCachedAnalyses(data.analyses || []);
      }

      // Fetch recommended tickers from trading signals
      const signalsRes = await fetch(`${API_URL}/api/intelligence/signals?count=5`, { headers });
      if (signalsRes.ok) {
        const signalsData = await signalsRes.json();
        const recommendations = (signalsData.signals || []).map((signal: any) => ({
          ticker: signal.ticker,
          reason: signal.action === 'BUY' ? 'AI Trading Signal (BUY)' : 'AI Trading Signal',
          confidence: signal.confidence
        }));
        setRecommendedTickers(recommendations);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('Failed to load Deep Dive page');
      setLoading(false);
    }
  };

  const analyzeTickerFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get('ticker');
    if (ticker) {
      setCustomTicker(ticker);
      analyzeCustomTicker(ticker);
    }
  };

  useEffect(() => {
    analyzeTickerFromUrl();
  }, []);

  const analyzeCustomTicker = async (ticker?: string) => {
    const tickerToAnalyze = (ticker || customTicker).toUpperCase().trim();
    
    if (!tickerToAnalyze) {
      alert('Please enter a ticker symbol');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/deep-dive/${tickerToAnalyze}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeepDive(data.analysis);
        
        // Refresh cached analyses
        const cachedRes = await fetch(`${API_URL}/api/deep-dive/cached`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (cachedRes.ok) {
          const cachedData = await cachedRes.json();
          setCachedAnalyses(cachedData.analyses || []);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to analyze ticker');
        alert(`❌ Analysis failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Failed to analyze ticker:', err);
      setError(err.message || 'Failed to analyze ticker');
      alert('❌ Failed to analyze ticker. Check console for details.');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadCachedAnalysis = (analysis: DeepDive) => {
    setDeepDive(analysis);
    setCustomTicker(analysis.ticker);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Deep Dive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              Deep Dive Analysis
            </h1>
            <p className="text-gray-600">
              Institutional-quality research • 2000+ word comprehensive analysis
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Automatically cached for 24 hours • Powered by AI with 20-point vetting
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Related Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <a
            href="/daily-intelligence"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            View AI Trading Signals
          </a>
          <a
            href="/intelligence-threads"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
          >
            <ExternalLink className="w-4 h-4" />
            Intelligence Threads
          </a>
          <a
            href="/ai-tip-tracker"
            className="flex items-center gap-2 text-green-600 hover:text-green-800"
          >
            <ExternalLink className="w-4 h-4" />
            Track Performance
          </a>
        </div>
      </div>

      {/* Ticker Input */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-indigo-600" />
          Analyze Any Ticker
        </h2>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
            placeholder="Enter ticker (e.g., AAPL, NVDA, TSLA)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-lg"
            onKeyPress={(e) => e.key === 'Enter' && analyzeCustomTicker()}
          />
          <button
            onClick={() => analyzeCustomTicker()}
            disabled={analyzing}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Recommended Tickers */}
        {recommendedTickers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Recommended Tickers
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendedTickers.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomTicker(rec.ticker);
                    analyzeCustomTicker(rec.ticker);
                  }}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-indigo-900">{rec.ticker}</span>
                    <span className="text-xs text-indigo-600">•</span>
                    <span className="text-xs text-indigo-700">{rec.confidence}% confidence</span>
                  </div>
                  <div className="text-xs text-indigo-600 mt-1">{rec.reason}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recently Cached Analyses */}
      {cachedAnalyses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-gray-600" />
            Recent Analyses (24hr Cache)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cachedAnalyses.slice(0, 6).map((analysis, idx) => (
              <button
                key={idx}
                onClick={() => loadCachedAnalysis(analysis)}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-gray-900">{analysis.ticker}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    analysis.recommendation === 'STRONG BUY' || analysis.recommendation === 'BUY'
                      ? 'bg-green-100 text-green-800'
                      : analysis.recommendation === 'SELL' || analysis.recommendation === 'STRONG SELL'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {analysis.recommendation}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{analysis.company_name}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Confidence: {analysis.confidence}%</span>
                  {analysis.generated_at && (
                    <span>{new Date(analysis.generated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Deep Dive Display */}
      {deepDive ? (
        <EnhancedDeepDive analysis={deepDive} />
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md border border-gray-200">
          <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Analysis Selected</h3>
          <p className="text-gray-600 mb-6">
            Enter a ticker above or select from AI recommendations
          </p>
          <div className="text-sm text-gray-500">
            <p>💡 Deep Dive includes:</p>
            <ul className="mt-2 space-y-1">
              <li>• 2000+ word institutional-quality analysis</li>
              <li>• Bull case & bear case scenarios</li>
              <li>• Key catalysts and risk factors</li>
              <li>• 20-point comprehensive vetting</li>
              <li>• Cached for 24 hours for instant access</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepDivePage;
