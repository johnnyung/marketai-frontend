// src/components/CorrelationWidget.tsx
// Compact widget for V2Dashboard showing weekend predictions

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Target, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Prediction {
  crypto_symbol: string;
  crypto_move_percent: number;
  predicted_stock: string;
  predicted_direction: string;
  predicted_magnitude: number;
  confidence: number;
}

export default function CorrelationWidget() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [predResponse, histResponse] = await Promise.all([
        api.api.get('/api/correlation/predictions'),
        api.api.get('/api/correlation/history?limit=10')
      ]);

      if (predResponse.data.success) {
        setPredictions(predResponse.data.data.slice(0, 3));
      }

      if (histResponse.data.success) {
        setStats(histResponse.data.stats);
      }
    } catch (error) {
      console.error('Correlation widget error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-lg">Correlation Lab</h3>
        </div>
        <button
          onClick={() => navigate('/correlation-lab')}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View All <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Accuracy Rate</p>
            <p className="text-xl font-bold text-purple-600">
              {stats.correct && stats.total_validated 
                ? ((stats.correct / stats.total_validated) * 100).toFixed(1)
                : '0'}%
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Predictions</p>
            <p className="text-xl font-bold text-blue-600">{stats.total_validated || 0}</p>
          </div>
        </div>
      )}

      {/* Active Predictions */}
      {predictions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Weekend Predictions:</p>
          {predictions.map((pred, idx) => (
            <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{pred.crypto_symbol}</span>
                  <span className={`text-sm font-bold ${
                    pred.crypto_move_percent > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {pred.crypto_move_percent > 0 ? '+' : ''}{pred.crypto_move_percent.toFixed(1)}%
                  </span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{pred.predicted_stock}</span>
                  {pred.predicted_direction === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Predicted: {pred.predicted_magnitude.toFixed(2)}%
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                  {pred.confidence.toFixed(0)}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No active predictions</p>
          <p className="text-xs mt-1">Check back Friday-Monday</p>
        </div>
      )}
    </div>
  );
}
