// src/components/IntelligenceThreads.tsx
// Intelligence Threads Display Component

import React, { useState, useEffect } from 'react';
import { Link2, AlertTriangle, TrendingUp, Calendar, Target, RefreshCw, Eye } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface Thread {
  id: number;
  title: string;
  theme: string;
  status: string;
  ai_insight: string;
  ai_trading_implication: string;
  ai_risk_factors: string[];
  affected_tickers: string[];
  event_count: number;
  first_event_date: string;
  last_event_date: string;
  risk_level: string;
  confidence_score: number;
}

interface ThreadEvent {
  entry_id: number;
  source_name: string;
  ai_summary: string;
  event_date: string;
  relevance_score: number;
}

interface ThreadDetail extends Thread {
  events: ThreadEvent[];
}

export const IntelligenceThreads: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ThreadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/threads/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setThreads(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load threads:', error);
      setLoading(false);
    }
  };

  const loadThreadDetail = async (threadId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/threads/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedThread(data.data);
      }
    } catch (error) {
      console.error('Failed to load thread detail:', error);
    }
  };

  const runDetection = async () => {
    if (!window.confirm('Run AI thread detection on recent intelligence?\n\nThis will analyze the last 7 days of high-priority entries and create new threads where patterns are detected.')) {
      return;
    }

    setDetecting(true);
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
        const data = await response.json();
        alert(data.data.message);
        await loadThreads();
      } else {
        alert('Thread detection failed');
      }
    } catch (error) {
      console.error('Detection error:', error);
      alert('Failed to run detection');
    } finally {
      setDetecting(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-purple-600" />
            Intelligence Threads
          </h2>
          <p className="text-gray-600 mt-1">
            AI-detected connections between market events
          </p>
        </div>
        
        <button
          onClick={runDetection}
          disabled={detecting}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
          {detecting ? 'Detecting...' : 'Run Detection'}
        </button>
      </div>

      {/* Threads List */}
      {threads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Threads</h3>
          <p className="text-gray-600 mb-4">
            No connected intelligence patterns detected yet.
          </p>
          <button
            onClick={runDetection}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
          >
            Run Thread Detection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-purple-500 transition-colors cursor-pointer"
              onClick={() => loadThreadDetail(thread.id)}
            >
              {/* Thread Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {thread.title}
                    </h3>
                    <p className="text-sm text-gray-600">{thread.theme}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(thread.risk_level)}`}>
                    {thread.risk_level}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(thread.last_event_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Link2 className="w-4 h-4" />
                    {thread.event_count} events
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {thread.confidence_score}% confidence
                  </span>
                </div>
              </div>

              {/* Thread Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span>💡</span> AI Insight
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {thread.ai_insight}
                  </p>
                </div>

                {thread.affected_tickers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Affected Tickers</h4>
                    <div className="flex flex-wrap gap-2">
                      {thread.affected_tickers.map((ticker, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold"
                        >
                          {String(ticker)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadThreadDetail(thread.id);
                  }}
                  className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Full Thread
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thread Detail Modal */}
      {selectedThread && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedThread(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedThread.title}
                  </h2>
                  <p className="text-gray-600">{selectedThread.theme}</p>
                </div>
                <button
                  onClick={() => setSelectedThread(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* AI Insight */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span>💡</span> AI Insight
                </h3>
                <p className="text-blue-800 leading-relaxed">{selectedThread.ai_insight}</p>
              </div>

              {/* Trading Implication */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trading Implication
                </h3>
                <p className="text-green-800 leading-relaxed">{selectedThread.ai_trading_implication}</p>
              </div>

              {/* Risk Factors */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Factors
                </h3>
                <ul className="space-y-2">
                  {selectedThread.ai_risk_factors.map((risk, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-orange-800">
                      <span className="mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connected Events */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-purple-600" />
                  Connected Events ({selectedThread.events.length})
                </h3>
                <div className="space-y-3">
                  {selectedThread.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {event.source_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{event.ai_summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Tickers */}
              {selectedThread.affected_tickers.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Affected Tickers</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedThread.affected_tickers.map((ticker, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold"
                      >
                        {ticker}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <button
                onClick={() => setSelectedThread(null)}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
