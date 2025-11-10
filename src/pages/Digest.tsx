import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Tag, Filter, Calendar, RefreshCw } from 'lucide-react';
import { IntelligenceThreads } from '../components/IntelligenceThreads';

const API_URL = 'https://marketai-backend-production-397e.up.railway.app';

interface DigestEntry {
  id: number;
  source_type: string;
  source_name: string;
  ai_summary: string;
  ai_relevance_score: number;
  ai_sentiment?: string;
  ai_entities_tickers?: string[];
  ai_tags?: string[];
  event_date: string;
}

const Digest: React.FC = () => {
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DigestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [minRelevance, setMinRelevance] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedSource, minRelevance]);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/digest/entries`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const entriesData = Array.isArray(data) ? data : [];
        // Sort by relevance score descending
        entriesData.sort((a, b) => b.ai_relevance_score - a.ai_relevance_score);
        setEntries(entriesData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load digest:', error);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    
    if (!window.confirm(
      '🔄 Refresh All Intelligence Data?\n\n' +
      'This will pull fresh data from:\n' +
      '• Yahoo Finance (20+ feeds)\n' +
      '• SEC EDGAR (insider trades)\n' +
      '• Reddit (5 subreddits)\n' +
      '• News sources (MarketWatch, Seeking Alpha, Benzinga, etc.)\n' +
      '• Social sentiment\n' +
      '• Economic indicators\n\n' +
      'Takes 2-3 minutes. Continue?'
    )) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/digest/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastRefresh(new Date());
        alert(
          '✅ Data Refresh Complete!\n\n' +
          `📊 Collected: ${result.collected} items\n` +
          `💾 Stored: ${result.stored} new entries\n` +
          `🔄 Duplicates skipped: ${result.duplicates}\n\n` +
          'All intelligence is now up to date!'
        );
        
        // Reload entries
        await fetchEntries();
      } else {
        alert('❌ Refresh failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Refresh failed: ' + error.message);
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.ai_summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.source_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by source type
    if (selectedSource !== 'all') {
      filtered = filtered.filter(e => e.source_type === selectedSource);
    }

    // Filter by minimum relevance
    filtered = filtered.filter(e => e.ai_relevance_score >= minRelevance);

    setFilteredEntries(filtered);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getSourceColor = (sourceType: string) => {
    const colors: Record<string, string> = {
      'news': 'bg-blue-100 text-blue-800 border-blue-200',
      'earnings_ma': 'bg-purple-100 text-purple-800 border-purple-200',
      'manufacturing': 'bg-orange-100 text-orange-800 border-orange-200',
      'social': 'bg-teal-100 text-teal-800 border-teal-200',
      'social_reddit': 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[sourceType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return null;
    switch (sentiment.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUniqueSourceTypes = () => {
    const types = new Set(entries.map(e => e.source_type));
    return Array.from(types).sort();
  };

  // Get high-priority entries (80+)
  const highPriorityCount = entries.filter(e => e.ai_relevance_score >= 80).length;
  const mediumPriorityCount = entries.filter(e => e.ai_relevance_score >= 60 && e.ai_relevance_score < 80).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Intelligence Digest...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <span className="text-4xl">📰</span>
              Intelligence Digest
            </h1>
            <p className="text-gray-600">
              Curated market intelligence from 80+ sources • Updated every 6 hours
            </p>
            {lastRefresh && (
              <p className="text-sm text-green-600 mt-1">
                ✅ Last refreshed: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
              refreshing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
            title="Pull fresh data from all sources"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh All Data'}</span>
          </button>
        </div>
        
        {refreshing && (
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-semibold text-blue-900">Fetching fresh intelligence...</p>
                <p className="text-sm text-blue-700">Pulling from Yahoo Finance, SEC, Reddit, and 20+ other sources. This takes 2-3 minutes.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intelligence Threads Section */}
      <div className="mb-12">
        <IntelligenceThreads />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Total Entries</div>
          <div className="text-3xl font-bold text-gray-900">{entries.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">High Priority (80+)</div>
          <div className="text-3xl font-bold text-green-600">{highPriorityCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 mb-1">Medium Priority (60-79)</div>
          <div className="text-3xl font-bold text-yellow-600">{mediumPriorityCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Showing</div>
          <div className="text-3xl font-bold text-purple-600">{filteredEntries.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search entries, tickers, sources..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sources ({entries.length})</option>
            {getUniqueSourceTypes().map(type => {
              const count = entries.filter(e => e.source_type === type).length;
              return (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({count})
                </option>
              );
            })}
          </select>

          {/* Relevance Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Min Relevance: {minRelevance}
              </label>
              <button
                onClick={() => setMinRelevance(0)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={minRelevance}
              onChange={(e) => setMinRelevance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">No entries match your filters</p>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSource('all');
                setMinRelevance(0);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
            >
              {/* Header Bar */}
              <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Source Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSourceColor(entry.source_type)}`}>
                      {entry.source_name}
                    </span>

                    {/* Sentiment */}
                    {entry.ai_sentiment && (
                      <div className="flex items-center gap-1">
                        {getSentimentIcon(entry.ai_sentiment)}
                        <span className="text-xs text-gray-600 capitalize">{entry.ai_sentiment}</span>
                      </div>
                    )}

                    {/* Time */}
                    {entry.event_date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.event_date)}
                      </div>
                    )}
                  </div>

                  {/* Relevance Score */}
                  <div className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 ${getRelevanceColor(entry.ai_relevance_score)}`}>
                    {entry.ai_relevance_score}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-gray-800 leading-relaxed text-base">
                  {entry.ai_summary}
                </p>
              </div>

              {/* Footer: Tickers */}
              {entry.ai_entities_tickers && Array.isArray(entry.ai_entities_tickers) && entry.ai_entities_tickers.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {entry.ai_entities_tickers.slice(0, 8).map((ticker) => (
                      <span
                        key={ticker}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm font-mono font-bold hover:bg-blue-200 transition-colors cursor-pointer border border-blue-200"
                      >
                        ${ticker}
                      </span>
                    ))}
                    {entry.ai_entities_tickers.length > 8 && (
                      <span className="text-sm text-gray-500 font-medium">
                        +{entry.ai_entities_tickers.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      {filteredEntries.length > 0 && (
        <div className="text-center mt-8 py-4 text-sm text-gray-500">
          Showing {filteredEntries.length} of {entries.length} entries
          {minRelevance > 0 && ` • Relevance ≥ ${minRelevance}`}
          {selectedSource !== 'all' && ` • ${selectedSource.replace(/_/g, ' ')}`}
        </div>
      )}
    </div>
  );
};

export default Digest;
