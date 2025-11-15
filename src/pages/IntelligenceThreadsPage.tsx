import React, { useState } from 'react';
import { Network, Sparkles, AlertCircle } from 'lucide-react';
import { IntelligenceThreads } from '../components/IntelligenceThreads';

import { API_URL } from '../config/api';

const IntelligenceThreadsPage: React.FC = () => {
  const [detecting, setDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const runThreadDetection = async () => {
    if (!confirm('Run AI thread detection? This will analyze digest entries and create connected storylines (1-2 minutes).')) {
      return;
    }

    setDetecting(true);
    setError(null);

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
        setLastDetection(new Date());
        setRefreshKey(prev => prev + 1); // Force component refresh
        alert(`✅ Thread detection complete!\n\nCreated ${data.threadsCreated || 0} new threads from ${data.entriesAnalyzed || 0} entries.`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Thread detection failed');
        alert(`❌ Thread detection failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Thread detection error:', err);
      setError(err.message || 'Failed to run thread detection');
      alert('❌ Thread detection failed. Check console for details.');
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <Network className="w-8 h-8 text-purple-600" />
              Intelligence Threads
            </h1>
            <p className="text-gray-600">
              AI-connected storylines from digest intelligence
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Related events automatically grouped into coherent narratives with confidence scoring
            </p>
          </div>

          {/* Run Detection Button - ONLY HERE */}
          <button
            onClick={runThreadDetection}
            disabled={detecting}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            title="Analyze digest entries and create new threads"
          >
            <Sparkles className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
            {detecting ? 'Detecting...' : 'Run Detection'}
          </button>
        </div>

        {lastDetection && (
          <p className="text-sm text-gray-500">
            Last detection: {lastDetection.toLocaleString()}
          </p>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          How Thread Detection Works
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            • <strong>Analyzes unthreaded entries:</strong> Scans digest intelligence for related events
          </p>
          <p>
            • <strong>AI pattern matching:</strong> Groups events by theme, tickers, and context
          </p>
          <p>
            • <strong>Confidence scoring:</strong> Rates connection strength (60-100%)
          </p>
          <p>
            • <strong>Impact analysis:</strong> Identifies affected tickers with reasoning
          </p>
          <p className="text-xs text-gray-600 mt-3">
            💡 Tip: Run detection after collecting fresh digest data for best results
          </p>
        </div>
      </div>

      {/* Intelligence Threads Component */}
      <IntelligenceThreads key={refreshKey} />
    </div>
  );
};

export default IntelligenceThreadsPage;
