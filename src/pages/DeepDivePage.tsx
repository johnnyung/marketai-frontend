import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { EnhancedDeepDive } from '../components/EnhancedDeepDive';
import { API_URL } from '../config/api';

const DeepDivePage: React.FC = () => {
  const [recommendedTickers, setRecommendedTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedTickers();
  }, []);

  const fetchRecommendedTickers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch top signals for recommendations
      const response = await fetch(`${API_URL}/api/opportunities/signals?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tickers = (data.signals || []).map((s: any) => s.ticker);
        setRecommendedTickers(tickers);
      }
    } catch (err) {
      console.error('Failed to fetch recommended tickers:', err);
    } finally {
      setLoading(false);
    }
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

      {/* Quick Links */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Related Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Link
            to="/daily-intelligence"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            View AI Trading Signals
          </Link>
          <Link
            to="/intelligence-threads"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
          >
            <ExternalLink className="w-4 h-4" />
            Intelligence Threads
          </Link>
          <Link
            to="/ai-tip-tracker"
            className="flex items-center gap-2 text-green-600 hover:text-green-800"
          >
            <ExternalLink className="w-4 h-4" />
            Track Performance
          </Link>
        </div>
      </div>

      {/* EnhancedDeepDive Component */}
      <EnhancedDeepDive recommendedTickers={recommendedTickers} />
    </div>
  );
};

export default DeepDivePage;
