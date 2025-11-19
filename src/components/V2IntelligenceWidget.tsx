import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, RefreshCw, Database, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface CollectionStats {
  reddit: {
    total_posts: string;
    unprocessed_posts: string;
    last_collection: string;
  };
  news: {
    total_articles: string;
    unprocessed_articles: string;
    last_collection: string;
  };
}

export default function V2IntelligenceWidget() {
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/collect/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setLoading(false);
    }
  };

  const handleCollectAll = async () => {
    setProcessing(true);
    setMessage('Collecting data...');
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // Collect Reddit
      await fetch(`${API_URL}/api/collect/reddit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Collect News
      await fetch(`${API_URL}/api/collect/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('Collection complete! Processing with AI...');

      // Process Reddit
      await fetch(`${API_URL}/api/process/reddit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Process News
      await fetch(`${API_URL}/api/process/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setMessage('✅ Complete! AI extracted new tickers');
      await loadStats();
    } catch (error) {
      setMessage('❌ Error during collection/processing');
    } finally {
      setProcessing(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const totalUnprocessed = stats ? 
    parseInt(stats.reddit.unprocessed_posts) + parseInt(stats.news.unprocessed_articles) : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Intelligence v2.0</h3>
        </div>
        {totalUnprocessed > 0 && (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
            {totalUnprocessed} new
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Reddit Posts:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{stats.reddit.total_posts}</span>
              {parseInt(stats.reddit.unprocessed_posts) > 0 && (
                <span className="text-xs text-orange-600">
                  ({stats.reddit.unprocessed_posts} new)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">News Articles:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{stats.news.total_articles}</span>
              {parseInt(stats.news.unprocessed_articles) > 0 && (
                <span className="text-xs text-orange-600">
                  ({stats.news.unprocessed_articles} new)
                </span>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Last Updated:</span>
              <span>
                {new Date(stats.reddit.last_collection).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleCollectAll}
        disabled={processing}
        className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Collect & Analyze Now
          </>
        )}
      </button>

      {/* Message */}
      {message && (
        <div className="mt-3 text-sm text-center py-2 bg-purple-50 text-purple-700 rounded">
          {message}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        AI-powered ticker extraction from Reddit & News
      </div>
    </div>
  );
}
