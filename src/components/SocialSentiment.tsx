// frontend/src/components/SocialSentiment.tsx
// Display Social Sentiment from Reddit + News

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, MessageSquare, Newspaper, Activity, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface TrendingTicker {
  ticker: string;
  score: number;
  mentions: number;
  redditMentions: number;
  redditSentiment: 'bullish' | 'bearish' | 'neutral';
  newsArticles: number;
  newsSentiment: 'positive' | 'negative' | 'neutral';
  trending: boolean;
}

interface DailySummary {
  totalTickers: number;
  bullishCount: number;
  bearishCount: number;
  topBullish: any[];
  topBearish: any[];
}

export function SocialSentiment() {
  const { token } = useAuth();
  const [trending, setTrending] = useState<TrendingTicker[]>([]);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [view, setView] = useState<'trending' | 'bullish' | 'bearish'>('trending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trendingRes, summaryRes] = await Promise.all([
        fetch(`${API_URL}/api/social/trending?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/social/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (trendingRes.ok && summaryRes.ok) {
        const trendingData = await trendingRes.json();
        const summaryData = await summaryRes.json();
        setTrending(trendingData.data);
        setSummary(summaryData.data);
      }
    } catch (error) {
      console.error('Failed to load social sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch(`${API_URL}/api/social/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Reload data after analysis
        await loadData();
      }
    } catch (error) {
      console.error('Failed to run analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 20) return 'text-green-600 bg-green-50 border-green-200';
    if (score < -20) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === 'bullish' || sentiment === 'positive') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (sentiment === 'bearish' || sentiment === 'negative') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading social sentiment...</p>
        </div>
      </div>
    );
  }

  const displayTickers = view === 'bullish' 
    ? summary?.topBullish || []
    : view === 'bearish'
    ? summary?.topBearish || []
    : trending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-purple-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Social Sentiment
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Reddit + News Intelligence
              </p>
            </div>
          </div>
          
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4 border border-purple-100 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Tracked</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {summary.totalTickers}
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4 border border-purple-100 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Bullish</div>
              <div className="text-2xl font-bold text-green-600">
                {summary.bullishCount}
              </div>
            </div>
            
            <div className="bg-white/50 dark:bg-slate-700/50 rounded-xl p-4 border border-purple-100 dark:border-slate-600">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Bearish</div>
              <div className="text-2xl font-bold text-red-600">
                {summary.bearishCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('trending')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            view === 'trending'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          🔥 Trending
        </button>
        
        <button
          onClick={() => setView('bullish')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            view === 'bullish'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          📈 Most Bullish
        </button>
        
        <button
          onClick={() => setView('bearish')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            view === 'bearish'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          📉 Most Bearish
        </button>
      </div>

      {/* Tickers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayTickers.map((ticker: any, idx: number) => (
          <motion.div
            key={ticker.ticker}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl p-4 border ${getSentimentColor(ticker.score || ticker.sentiment_score)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {ticker.ticker}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Score: {ticker.score || ticker.sentiment_score}/100
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getSentimentColor(ticker.score || ticker.sentiment_score)}`}>
                {(ticker.score || ticker.sentiment_score) > 20 ? 'BULLISH' : 
                 (ticker.score || ticker.sentiment_score) < -20 ? 'BEARISH' : 'NEUTRAL'}
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-2">
              {/* Reddit */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-slate-600 dark:text-slate-400">Reddit</span>
                </div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(ticker.redditSentiment)}
                  <span className="font-semibold">{ticker.redditMentions || 0} mentions</span>
                </div>
              </div>

              {/* News */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-600 dark:text-slate-400">News</span>
                </div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(ticker.newsSentiment)}
                  <span className="font-semibold">{ticker.newsArticles || 0} articles</span>
                </div>
              </div>
            </div>

            {/* Trending Badge */}
            {ticker.trending && (
              <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-3 h-3" />
                <span className="font-semibold">TRENDING NOW</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {displayTickers.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No social sentiment data yet</p>
          <button
            onClick={runAnalysis}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
          >
            Run First Analysis
          </button>
        </div>
      )}
    </div>
  );
}
