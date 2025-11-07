// src/pages/DataIntelligence.tsx
// COMPLETE DATA DASHBOARD: View all ingested data

import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, Newspaper, Calendar, MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface DataItem {
  source: string;
  type: string;
  timestamp: Date;
  title: string;
  content: string;
  ticker?: string;
  politician?: string;
  insider?: string;
  sentiment?: string;
  metadata: any;
}

interface GroupedData {
  political: DataItem[];
  insider: DataItem[];
  news: DataItem[];
  social: DataItem[];
  economic: DataItem[];
  total: number;
  timestamp: string;
}

export function DataIntelligence() {
  const [data, setData] = useState<GroupedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTicker, setSearchTicker] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/data/all`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchByTicker = async () => {
    if (!searchTicker) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/data/ticker/${searchTicker}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error searching ticker:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderDataItems = (items: DataItem[], type: string) => {
    if (!items || items.length === 0) {
      return <p className="text-gray-500">No {type} data available</p>;
    }

    return (
      <div className="space-y-3">
        {items.slice(0, 10).map((item, idx) => (
          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {item.source}
                  </span>
                  {item.ticker && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      {item.ticker}
                    </span>
                  )}
                  {item.sentiment && (
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                      item.sentiment === 'bullish' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      item.sentiment === 'bearish' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {item.sentiment}
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {item.content}
                </p>
                {item.politician && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    👤 {item.politician}
                  </p>
                )}
                {item.insider && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    👔 {item.insider}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 ml-4">
                {new Date(item.timestamp).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading all data sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📊 Data Intelligence Center</h1>
              <p className="text-blue-100 mt-2">
                Complete market intelligence from all sources
              </p>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              placeholder="Search by ticker (e.g., AAPL, TSLA)..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && searchByTicker()}
            />
            <button
              onClick={searchByTicker}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
            {searchTicker && (
              <button
                onClick={() => { setSearchTicker(''); fetchData(); }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.political.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Political Trades</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.insider.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Insider Trades</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Newspaper className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.news.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">News Articles</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.social.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Social Posts</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.economic.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Economic Events</p>
            </div>
          </div>
        )}

        {/* Data Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'political', 'insider', 'news', 'social', 'economic'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Data Display */}
        {data && (
          <div className="space-y-6">
            {(selectedType === 'all' || selectedType === 'political') && data.political.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  Political Trades
                </h2>
                {renderDataItems(data.political, 'political')}
              </div>
            )}

            {(selectedType === 'all' || selectedType === 'insider') && data.insider.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Insider Activity
                </h2>
                {renderDataItems(data.insider, 'insider')}
              </div>
            )}

            {(selectedType === 'all' || selectedType === 'news') && data.news.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Newspaper className="w-6 h-6 text-blue-600" />
                  News & Updates
                </h2>
                {renderDataItems(data.news, 'news')}
              </div>
            )}

            {(selectedType === 'all' || selectedType === 'social') && data.social.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-pink-600" />
                  Social Sentiment
                </h2>
                {renderDataItems(data.social, 'social')}
              </div>
            )}

            {(selectedType === 'all' || selectedType === 'economic') && data.economic.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  Economic Calendar
                </h2>
                {renderDataItems(data.economic, 'economic')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
