import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, Tag, Filter, Newspaper, Globe, DollarSign, AlertCircle } from 'lucide-react';
import WorkflowButton from '../components/WorkflowButton';
import { API_URL } from '../config/api';

interface DigestEntry {
  id: number;
  source_type: string;
  source_name: string;
  ai_summary: string;
  ai_relevance_score: number;
  ai_sentiment?: string;
  tickers?: string[];
  tags?: string[];
  event_date: string;
  content_url?: string;
}

const Digest: React.FC = () => {
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DigestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingThreads, setGeneratingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedSentiment, setSelectedSentiment] = useState('all');
  const [minRelevance, setMinRelevance] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, searchTerm, selectedSource, selectedSentiment, minRelevance]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please login to view Intelligence Digest');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/digest/entries?limit=200`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(Array.isArray(data) ? data : []);
        setLastRefresh(new Date());
      } else {
        setError(`Failed to load entries: ${response.status}`);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
      setError('Failed to load Intelligence Digest');
      setLoading(false);
    }
  };

  const triggerIngestion = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/digest/ingest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ Data collection started! Refreshing in 30 seconds...');
        setTimeout(() => fetchEntries(), 30000);
      } else {
        alert('❌ Failed to start data collection');
      }
    } catch (err) {
      console.error('Failed to trigger ingestion:', err);
      alert('❌ Failed to start data collection');
    }
    setRefreshing(false);
  };

  const generateThreads = async () => {
    setGeneratingThreads(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/threads/detect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Generated ${result.data?.threadsCreated || 0} intelligence threads!`);
      } else {
        alert('❌ Failed to generate threads');
      }
    } catch (err) {
      console.error('Failed to generate threads:', err);
      alert('❌ Failed to generate threads');
    }
    setGeneratingThreads(false);
  };

  const filterEntries = () => {
    if (!Array.isArray(entries)) {
      setFilteredEntries([]);
      return;
    }

    let filtered = [...entries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.ai_summary?.toLowerCase().includes(term) ||
        entry.source_name?.toLowerCase().includes(term) ||
        entry.tickers?.some(t => t.toLowerCase().includes(term)) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(entry => entry.source_type === selectedSource);
    }

    if (selectedSentiment !== 'all') {
      filtered = filtered.filter(entry => entry.ai_sentiment === selectedSentiment);
    }

    filtered = filtered.filter(entry => (entry.ai_relevance_score || 0) >= minRelevance);
    filtered.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    setFilteredEntries(filtered);
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'bullish':
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'news':
        return <Newspaper className="w-5 h-5 text-blue-600" />;
      case 'social':
      case 'social_reddit':
        return <Globe className="w-5 h-5 text-purple-600" />;
      case 'insider_trade':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'political':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Tag className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const uniqueSources = ['all', ...new Set(entries.map(e => e.source_type).filter(Boolean))];

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

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchEntries()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📰 Intelligence Digest</h1>
          <p className="text-gray-600">
            Raw intelligence feed from all sources • {entries.length} total entries
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Searchable database of news, social, political, and market intelligence
          </p>
        </div>

        {/* Workflow Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <WorkflowButton
            stepNumber={1}
            title="Fetch Fresh Data"
            description="Pull latest market news, social media, and intelligence"
            timeEstimate="~3 minutes"
            icon="🔄"
            onClick={triggerIngestion}
            disabled={refreshing}
            loading={refreshing}
            color="blue"
          />

          <WorkflowButton
            stepNumber={2}
            title="Connect Related Events"
            description="AI identifies patterns and connections across entries"
            timeEstimate="~2 minutes"
            icon="🧵"
            onClick={generateThreads}
            disabled={generatingThreads || entries.length === 0}
            loading={generatingThreads}
            disabledReason={entries.length === 0 ? "Run Step 1 first" : undefined}
            prerequisite="After Step 1"
            color="purple"
          />
        </div>

        {lastRefresh && (
          <p className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleString()}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticker, keyword, or tag..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Source Type
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {uniqueSources.map(source => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sentiment
            </label>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sentiment</option>
              <option value="bullish">Bullish/Positive</option>
              <option value="bearish">Bearish/Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Relevance: {minRelevance}+
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={minRelevance}
            onChange={(e) => setMinRelevance(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredEntries.length} of {entries.length} entries
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getSourceIcon(entry.source_type)}
                <div>
                  <h3 className="font-semibold text-gray-900">{entry.source_name}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.event_date).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getSentimentIcon(entry.ai_sentiment)}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRelevanceColor(entry.ai_relevance_score || 0)}`}>
                  {entry.ai_relevance_score || 0} Score
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{entry.ai_summary}</p>

            {entry.tickers && entry.tickers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {entry.tickers.map((ticker, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold"
                  >
                    ${ticker}
                  </span>
                ))}
              </div>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {entry.content_url && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href={entry.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View Source →
                </a>
              </div>
            )}
          </div>
        ))}

        {filteredEntries.length === 0 && entries.length > 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <p className="text-gray-600">No entries match your filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSource('all');
                setSelectedSentiment('all');
                setMinRelevance(0);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No intelligence entries yet</p>
            <p className="text-sm text-gray-500 mb-6">Click "Fetch Fresh Data" above to start collecting intelligence</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Digest;
