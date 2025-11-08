// frontend/src/pages/Digest.tsx
// Data Digest Page - Complete Working Version

import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface DigestEntry {
  id: number;
  source_type: string;
  source_name: string;
  ai_summary: string;
  ai_relevance_score: number;
  ai_sentiment: string;
  ai_importance: string;
  tickers: string[];
  people: string[];
  companies: string[];
  event_date: string;
  created_at: string;
}

interface Summary {
  totalEntries: number;
  byType: Array<{
    source_type: string;
    count: string;
    avg_score: string;
  }>;
  trendingTickers: Array<{
    ticker: string;
    mention_count: string;
    ai_sentiment: string;
  }>;
}

const Digest: React.FC = () => {
  const [ingesting, setIngesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSummary(), loadEntries()]);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/api/digest/summary`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const url = filter === 'all' 
        ? `${API_URL}/api/digest/entries?limit=100`
        : `${API_URL}/api/digest/entries?source_type=${filter}&limit=100`;
      
      const response = await fetch(url);
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const handleIngest = async () => {
    if (!window.confirm('Start data ingestion? This will take 2-3 minutes and fetch from SEC, Reddit, and other sources.')) {
      return;
    }
    
    setIngesting(true);
    try {
      const response = await fetch(`${API_URL}/api/digest/ingest`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Success!\n\nCollected: ${result.collected}\nStored: ${result.stored}\nDuplicates: ${result.duplicates}`);
        setLastRefresh(new Date());
        await loadData();
      } else {
        alert('❌ Ingestion failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Ingestion failed: ' + error.message);
      console.error(error);
    } finally {
      setIngesting(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50';
      case 'bearish': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 Data Digest</h1>
        <p className="text-gray-600">
          AI-powered data collection and analysis from multiple sources
        </p>
        {lastRefresh && (
          <p className="text-sm text-gray-500 mt-1">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <button
          onClick={handleIngest}
          disabled={ingesting}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-all ${
            ingesting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
          }`}
        >
          {ingesting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ingesting Data... (2-3 min)
            </span>
          ) : (
            <span>🔄 Refresh & Ingest Data</span>
          )}
        </button>
        {ingesting && (
          <p className="mt-2 text-sm text-gray-600">
            Fetching from SEC EDGAR, Reddit, Twitter, News sources...
          </p>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Entries</div>
            <div className="text-3xl font-bold text-blue-600">{summary.totalEntries}</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Data Sources</div>
            <div className="text-3xl font-bold text-purple-600">{summary.byType.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Trending Tickers</div>
            <div className="text-3xl font-bold text-green-600">{summary.trendingTickers.length}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Avg Relevance</div>
            <div className="text-3xl font-bold text-orange-600">
              {summary.byType.length > 0 
                ? Math.round(summary.byType.reduce((acc, t) => acc + parseFloat(t.avg_score), 0) / summary.byType.length)
                : 0}
            </div>
          </div>
        </div>
      )}

      {/* Data by Type */}
      {summary && summary.byType.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">📊 Data by Source Type</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg Relevance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.byType.map((type, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">{type.source_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">{type.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`font-semibold ${getRelevanceColor(parseFloat(type.avg_score))}`}>
                        {Math.round(parseFloat(type.avg_score))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setFilter(type.source_type)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Filter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trending Tickers */}
      {summary && summary.trendingTickers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">🔥 Trending Tickers</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {summary.trendingTickers.map((ticker, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="text-2xl font-bold text-blue-600">{ticker.ticker}</div>
                <div className="text-sm text-gray-600">{ticker.mention_count} mentions</div>
                <div className={`text-sm font-semibold mt-2 ${getSentimentColor(ticker.ai_sentiment)} px-2 py-1 rounded inline-block`}>
                  {ticker.ai_sentiment}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="mb-4 flex items-center gap-4">
        <h2 className="text-2xl font-bold">📋 Recent Entries</h2>
        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">No entries yet</p>
          <p className="text-gray-500 mt-2">Click "Refresh & Ingest Data" to populate the digest</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">{entry.source_name}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{entry.source_type.replace('_', ' ')}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.event_date).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Tickers */}
                  {entry.tickers && entry.tickers.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {entry.tickers.map((ticker, i) => (
                        <span 
                          key={i}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold"
                        >
                          {ticker}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Relevance Score */}
                <div className="text-right ml-4">
                  <div className={`text-2xl font-bold ${getRelevanceColor(entry.ai_relevance_score)}`}>
                    {entry.ai_relevance_score}
                  </div>
                  <div className="text-xs text-gray-500">relevance</div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-gray-800 mb-3">{entry.ai_summary}</p>

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded font-medium ${getSentimentColor(entry.ai_sentiment)}`}>
                  {entry.ai_sentiment}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getImportanceColor(entry.ai_importance)}`}>
                  {entry.ai_importance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Digest;
