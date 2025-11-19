// src/components/PerformanceAnalytics.tsx
// Advanced Analytics Dashboard for AI Tip Tracker

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Award, Target, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface MonthlyTrend {
  month: string;
  total_picks: number | string;
  closed_picks: number | string;
  winners: number | string;
  win_rate: number | string;
  total_pnl: number | string;
  avg_pnl_pct: number | string;
}

interface ConfidenceBracket {
  bracket: string;
  total_picks: number | string;
  winners: number | string;
  win_rate: number | string;
  avg_pnl_pct: number | string;
  total_pnl: number | string;
}

interface SectorPerformance {
  sector: string;
  total_picks: number | string;
  closed_picks: number | string;
  winners: number | string;
  win_rate: number | string;
  avg_pnl_pct: number | string;
  total_pnl: number | string;
  best_pick: string;
  best_pick_pnl: number | string;
}

interface TimeframePerformance {
  timeframe: string;
  total_picks: number | string;
  winners: number | string;
  win_rate: number | string;
  avg_pnl_pct: number | string;
  avg_days_held: number | string;
}

interface ROIProjections {
  avg_return_pct: number | string;
  win_rate: number | string;
  avg_hold_days: number | string;
  projected_value_1k: number | string;
  projected_gain_1k: number | string;
  projected_value_10k: number | string;
  projected_gain_10k: number | string;
}

interface BenchmarkComparison {
  tracker_avg_return: number | string;
  tracker_win_rate: number | string;
  sp500_avg_annual_return: number | string;
  vs_sp500_diff: number | string;
  vs_sp500_status: string;
}

export const PerformanceAnalytics: React.FC = () => {
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [confidenceBrackets, setConfidenceBrackets] = useState<ConfidenceBracket[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<SectorPerformance[]>([]);
  const [timeframePerformance, setTimeframePerformance] = useState<TimeframePerformance[]>([]);
  const [roiProjections, setRoiProjections] = useState<ROIProjections | null>(null);
  const [benchmarkComparison, setBenchmarkComparison] = useState<BenchmarkComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all analytics data
      const [
        trendsRes,
        confidenceRes,
        sectorRes,
        timeframeRes,
        roiRes,
        benchmarkRes
      ] = await Promise.all([
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/monthly-trends`, { headers }),
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/confidence-brackets`, { headers }),
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/sector-performance`, { headers }),
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/timeframe-performance`, { headers }),
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/roi-projections`, { headers }),
        fetch(`${API_URL}/api/ai-tip-tracker/analytics/benchmark-comparison`, { headers })
      ]);

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setMonthlyTrends(data.data);
      }

      if (confidenceRes.ok) {
        const data = await confidenceRes.json();
        setConfidenceBrackets(data.data);
      }

      if (sectorRes.ok) {
        const data = await sectorRes.json();
        setSectorPerformance(data.data);
      }

      if (timeframeRes.ok) {
        const data = await timeframeRes.json();
        setTimeframePerformance(data.data);
      }

      if (roiRes.ok) {
        const data = await roiRes.json();
        setRoiProjections(data.data);
      }

      if (benchmarkRes.ok) {
        const data = await benchmarkRes.json();
        setBenchmarkComparison(data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (value: number | string | undefined) => {
    if (!value) return '0.00%';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Performance Analytics</h2>
        <p className="text-gray-600">Deep dive into AI Tip Tracker performance metrics</p>
      </div>

      {/* ROI Projections */}
      {roiProjections && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">ROI Projections</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Historical Performance</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Avg Return:</span>
                  <span className="font-bold text-green-600">{formatPercent(roiProjections.avg_return_pct)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Win Rate:</span>
                  <span className="font-bold text-blue-600">{formatPercent(roiProjections.win_rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Avg Hold:</span>
                  <span className="font-bold text-gray-800">{roiProjections.avg_hold_days} days</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">$1,000 Investment</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Projected Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(roiProjections.projected_value_1k)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Gain</p>
                  <p className={`text-lg font-bold ${Number(roiProjections.projected_gain_1k) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(roiProjections.projected_gain_1k)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">$10,000 Investment</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Projected Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(roiProjections.projected_value_10k)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expected Gain</p>
                  <p className={`text-lg font-bold ${Number(roiProjections.projected_gain_10k) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(roiProjections.projected_gain_10k)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benchmark Comparison */}
      {benchmarkComparison && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Benchmark Comparison</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">AI Tracker Avg Return</p>
              <p className="text-3xl font-bold text-blue-600">{formatPercent(benchmarkComparison.tracker_avg_return)}</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">S&P 500 Annual Return</p>
              <p className="text-3xl font-bold text-gray-600">{formatPercent(benchmarkComparison.sp500_avg_annual_return)}</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Performance vs S&P 500</p>
              <p className={`text-3xl font-bold ${Number(benchmarkComparison.vs_sp500_diff) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(benchmarkComparison.vs_sp500_diff) >= 0 ? '+' : ''}{formatPercent(benchmarkComparison.vs_sp500_diff)}
              </p>
              <p className="text-sm font-semibold text-gray-700 mt-2">{benchmarkComparison.vs_sp500_status}</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Monthly Performance Trends</h3>
        </div>

        <div className="space-y-3">
          {monthlyTrends.map((trend, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">{trend.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Win Rate: <span className="font-bold text-green-600">{formatPercent(trend.win_rate)}</span></span>
                  <span className={`text-lg font-bold ${Number(trend.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(trend.total_pnl)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>{trend.total_picks} picks</span>
                <span>{trend.closed_picks} closed</span>
                <span>{trend.winners} winners</span>
                <span>Avg: {formatPercent(trend.avg_pnl_pct)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Win Rate by Confidence */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-900">Win Rate by Confidence Level</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {confidenceBrackets.map((bracket, idx) => (
            <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-center mb-3">
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-blue-600">{bracket.bracket}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate:</span>
                  <span className="font-bold text-green-600">{formatPercent(bracket.win_rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Return:</span>
                  <span className={`font-bold ${Number(bracket.avg_pnl_pct) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(bracket.avg_pnl_pct)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total P/L:</span>
                  <span className={`font-bold ${Number(bracket.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(bracket.total_pnl)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Picks:</span>
                  <span className="font-bold text-gray-800">{bracket.total_picks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Performance */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-900">Sector Performance</h3>
        </div>

        <div className="space-y-3">
          {sectorPerformance.map((sector, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{sector.sector}</h4>
                  <p className="text-sm text-gray-600">Best: {sector.best_pick} ({formatPercent(sector.best_pick_pnl)})</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${Number(sector.total_pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(sector.total_pnl)}
                  </p>
                  <p className="text-sm text-gray-600">{formatPercent(sector.win_rate)} win rate</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>{sector.total_picks} picks</span>
                <span>{sector.closed_picks} closed</span>
                <span>{sector.winners} winners</span>
                <span>Avg: {formatPercent(sector.avg_pnl_pct)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeframe Performance */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Performance by Timeframe</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeframePerformance.map((tf, idx) => (
            <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
              <div className="text-center mb-3">
                <p className="text-lg font-bold text-gray-900">{tf.timeframe}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate:</span>
                  <span className="font-bold text-green-600">{formatPercent(tf.win_rate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Return:</span>
                  <span className={`font-bold ${(typeof tf.avg_pnl_pct === 'string' ? parseFloat(tf.avg_pnl_pct) : tf.avg_pnl_pct) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(tf.avg_pnl_pct)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Hold:</span>
                  <span className="font-bold text-gray-800">
                    {typeof tf.avg_days_held === 'string' ? parseFloat(tf.avg_days_held).toFixed(0) : tf.avg_days_held.toFixed(0)} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Picks:</span>
                  <span className="font-bold text-gray-800">{tf.total_picks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
