// src/components/IntelligenceThreads.tsx
// Container for all Intelligence Threads

import React, { useState, useEffect } from 'react';
import { ThreadCard } from './ThreadCard';
import { RefreshCw, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

export const IntelligenceThreads: React.FC = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/threads`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setThreads(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateThreads = async () => {
    if (regenerating) return;
    
    if (!window.confirm(
      '🧵 Regenerate Intelligence Threads?\n\n' +
      'This will use Claude AI to analyze all recent digest entries and create new threads connecting related events.\n\n' +
      'Takes 1-2 minutes. Continue?'
    )) {
      return;
    }

    setRegenerating(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/threads/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hoursBack: 72 })
      });

      const result = await response.json();

      if (result.success) {
        alert(
          '✅ Threads Generated!\n\n' +
          `🧵 Created: ${result.count} intelligence threads\n\n` +
          'AI has connected related events into coherent market stories.'
        );
        await loadThreads();
      } else {
        alert('❌ Generation failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Generation failed: ' + error.message);
      console.error('Thread generation error:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const filteredThreads = filter === 'ALL' 
    ? threads 
    : threads.filter(t => t.theme === filter);

  const availableThemes = ['ALL', ...Array.from(new Set(threads.map(t => t.theme)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🧵</span>
              <h2 className="text-2xl font-bold">Intelligence Threads</h2>
            </div>
            <p className="text-blue-100 mb-4">
              AI-connected market stories from multiple sources
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{threads.length} Active Threads</span>
              </div>
              <div className="flex items-center gap-2">
                <span>•</span>
                <span>{threads.reduce((sum, t) => sum + t.entry_count, 0)} Connected Events</span>
              </div>
            </div>
          </div>
          <button
            onClick={regenerateThreads}
            disabled={regenerating}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              regenerating
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-white text-purple-600 hover:bg-blue-50 hover:scale-105'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${regenerating ? 'animate-spin' : ''}`} />
            <span>{regenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {availableThemes.map(theme => (
          <button
            key={theme}
            onClick={() => setFilter(theme)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              filter === theme
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {theme}
          </button>
        ))}
      </div>

      {/* Threads */}
      {filteredThreads.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <span className="text-6xl mb-4 block">🧵</span>
          <p className="text-gray-600 mb-4">No intelligence threads available</p>
          <button
            onClick={regenerateThreads}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Generate Threads
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredThreads.map(thread => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
};
