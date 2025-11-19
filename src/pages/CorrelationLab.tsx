// src/pages/CorrelationLab.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Activity, Target, Clock,
  CheckCircle, XCircle, AlertCircle, RefreshCw, BarChart3,
  Zap, Calendar, Award
} from 'lucide-react';
import api from '../services/api';

interface Pattern {
  id: number;
  crypto_symbol: string;
  stock_symbol: string;
  accuracy_rate: number;
  correlation_strength: number;
  sample_size: number;
  pattern_description: string;
}

interface Prediction {
  id: number;
  crypto_symbol: string;
  crypto_move_percent: number;
  predicted_stock: string;
  predicted_direction: string;
  predicted_magnitude: number;
  confidence: number;
  status: string;
  was_correct?: boolean;
  actual_stock_move?: number;
}

export default function CorrelationLab() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [history, setHistory] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await api.api.get('/api/correlation/dashboard');
      if (response.data.success) {
        setPatterns(response.data.data.patterns);
        loadPredictions();
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to load correlation dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      const response = await api.api.get('/api/correlation/predictions');
      if (response.data.success) {
        setPredictions(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.api.get('/api/correlation/history?limit=20');
      if (response.data.success) {
        setHistory(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          Correlation Lab
        </h1>
        <p className="text-gray-600">
          AI-powered crypto-stock correlation patterns with live predictions
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Total Validated</span>
            </div>
            <p className="text-2xl font-bold">{stats.total_validated || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Accuracy Rate</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {stats.correct && stats.total_validated 
                ? ((stats.correct / stats.total_validated) * 100).toFixed(1)
                : '0'}%
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Avg Precision</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.avg_accuracy ? parseFloat(stats.avg_accuracy).toFixed(1) : '0'}%
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Active Patterns</span>
            </div>
            <p className="text-2xl font-bold">{patterns.length}</p>
          </div>
        </div>
      )}

      {/* Active Predictions */}
      {predictions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            Active Predictions (Weekend → Monday)
          </h2>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 p-6">
            <div className="space-y-4">
              {predictions.map((pred) => (
                <div key={pred.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold">{pred.crypto_symbol}</span>
                        <span className={`text-xl font-bold ${
                          pred.crypto_move_percent > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pred.crypto_move_percent > 0 ? '+' : ''}{pred.crypto_move_percent.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Weekend move</p>
                    </div>
                    <div className="text-2xl font-bold text-gray-400">→</div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold">{pred.predicted_stock}</span>
                        <span className={`px-3 py-1 rounded-lg font-bold ${
                          pred.predicted_direction === 'up' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pred.predicted_direction === 'up' ? '↑' : '↓'} {pred.predicted_magnitude.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Predicted Monday open</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">{pred.confidence.toFixed(0)}%</p>
                      <p className="text-xs text-gray-600">confidence</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                      ⏳ Awaiting Monday validation
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discovered Patterns */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-600" />
          Discovered Patterns ({patterns.length})
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <div key={pattern.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">{pattern.crypto_symbol}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-bold text-lg">{pattern.stock_symbol}</span>
                  </div>
                  <p className="text-xs text-gray-600">Weekend crypto → Monday stock</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{pattern.accuracy_rate.toFixed(0)}%</p>
                  <p className="text-xs text-gray-600">accuracy</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Correlation:</span>
                  <span className="font-medium">{pattern.correlation_strength.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sample Size:</span>
                  <span className="font-medium">{pattern.sample_size} weeks</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-700">{pattern.pattern_description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Recent Validations
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Pair</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Crypto Move</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Predicted</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Actual</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="p-3">
                      <span className="font-medium">{item.crypto_symbol} → {item.predicted_stock}</span>
                    </td>
                    <td className="p-3">
                      <span className={item.crypto_move_percent > 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.crypto_move_percent > 0 ? '+' : ''}{item.crypto_move_percent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={item.predicted_direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                        {item.predicted_direction === 'up' ? '↑' : '↓'} {item.predicted_magnitude.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={item.actual_stock_move! > 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.actual_stock_move! > 0 ? '+' : ''}{item.actual_stock_move?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3">
                      {item.was_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
