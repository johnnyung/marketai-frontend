// frontend/src/pages/AITipTracker.tsx
import React, { useState, useEffect } from 'react';
import aiTipTrackerService, { AITipSignal, PatternInsights } from '../services/aiTipTrackerService';

const AITipTracker: React.FC = () => {
  const [signals, setSignals] = useState<AITipSignal[]>([]);
  const [patternInsights, setPatternInsights] = useState<PatternInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'HOLD' | 'WATCH'>('ALL');
  const [sortBy, setSortBy] = useState<'score' | 'probability' | 'gain'>('score');
  const [expandedSignal, setExpandedSignal] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [signalsData, insightsData] = await Promise.all([
        aiTipTrackerService.getSignals(),
        aiTipTrackerService.getPatternInsights()
      ]);
      
      // FILTER OUT OLD SIGNALS WITHOUT PHASE 4 DATA
      const validSignals = signalsData.filter(s => 
        s.analysisScore !== undefined && 
        s.successProbability !== undefined &&
        s.analysis !== undefined
      );
      
      setSignals(validSignals);
      setPatternInsights(insightsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSignals = async () => {
    setGenerating(true);
    try {
      const result = await aiTipTrackerService.generateSignals();
      alert(`✅ Generated ${result.count} new signals!`);
      await loadData();
    } catch (error) {
      alert('❌ Failed to generate signals. Check console for details.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzePatterns = async () => {
    setAnalyzing(true);
    try {
      const insights = await aiTipTrackerService.analyzePatterns();
      setPatternInsights(insights);
      alert('✅ Pattern analysis complete!');
    } catch (error) {
      alert('❌ Pattern analysis failed. Need at least 10 closed trades.');
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredSignals = signals
    .filter(signal => {
      if (filter === 'ALL') return true;
      return signal.action === filter;
    })
    .sort((a, b) => {
      // FIXED: Null-safe sorting
      if (sortBy === 'score') return (b.analysisScore || 0) - (a.analysisScore || 0);
      if (sortBy === 'probability') return (b.successProbability || 0) - (a.successProbability || 0);
      return (b.predictedGainPct || 0) - (a.predictedGainPct || 0);
    });

  const getDimensionBar = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    let color = 'bg-red-500';
    if (percentage >= 85) color = 'bg-green-500';
    else if (percentage >= 70) color = 'bg-blue-500';
    else if (percentage >= 50) color = 'bg-yellow-500';

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI signals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Tip Tracker</h1>
            <p className="text-gray-600 mt-1">
              Phase 4: Pattern Recognition • 8-Dimension Analysis • Success Probability
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAnalyzePatterns}
              disabled={analyzing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {analyzing ? '🧠 Analyzing...' : '🧠 Analyze Patterns'}
            </button>
            <button
              onClick={handleGenerateSignals}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? '⚡ Generating...' : '⚡ Generate Signals'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Signals</div>
            <div className="text-2xl font-bold text-gray-900">{signals.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Avg Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {/* FIXED: Null-safe average calculation */}
              {signals.length > 0
                ? Math.round(signals.reduce((sum, s) => sum + (s.analysisScore || 0), 0) / signals.length)
                : 0}
              /100
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Avg Success Prob</div>
            <div className="text-2xl font-bold text-green-600">
              {/* FIXED: Null-safe average calculation */}
              {signals.length > 0
                ? Math.round(signals.reduce((sum, s) => sum + (s.successProbability || 0), 0) / signals.length)
                : 0}
              %
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Pattern Learning</div>
            <div className="text-2xl font-bold text-purple-600">
              {patternInsights ? 'Active 🧠' : 'Collecting'}
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Insights */}
      {patternInsights && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 Pattern Insights</h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Dimension Weights */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Learned Dimension Weights</h3>
              <div className="space-y-2">
                {Object.entries(patternInsights.dimensionWeights)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([dimension, weight]) => (
                    <div key={dimension} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {dimension.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${weight * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {(weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Recommendations</h3>
              <ul className="space-y-2">
                {patternInsights.recommendations.slice(0, 4).map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex gap-2">
          {(['ALL', 'BUY', 'HOLD', 'WATCH'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="score">Analysis Score</option>
            <option value="probability">Success Probability</option>
            <option value="gain">Predicted Gain</option>
          </select>
        </div>
      </div>

      {/* Signals List */}
      {signals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">No AI signals yet</p>
          <button
            onClick={handleGenerateSignals}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Generate First Signals
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal) => {
            const isExpanded = expandedSignal === signal.id;
            const pnl = aiTipTrackerService.calculatePnL(signal);

            return (
              <div
                key={signal.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-all"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedSignal(isExpanded ? null : signal.id!)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{signal.ticker}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${aiTipTrackerService.getRecommendationColor(
                            signal.action
                          )}`}
                        >
                          {signal.action}
                        </span>
                        <span className="text-sm text-gray-500">{signal.companyName}</span>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">{signal.reasoning}</p>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {signal.analysisScore || 0}
                        <span className="text-lg text-gray-500">/100</span>
                      </div>
                      <div
                        className={`text-sm font-semibold ${aiTipTrackerService.getProbabilityColor(
                          signal.successProbability || 0
                        )}`}
                      >
                        {/* FIXED: Null-safe success probability display */}
                        {signal.successProbability ? (signal.successProbability * 100).toFixed(0) : '50'}% Success
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <div className="text-xs text-gray-500">Entry Price</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {/* FIXED: Null-safe toFixed */}
                        ${(signal.entryPrice || 0).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Predicted Gain</div>
                      <div className="text-lg font-semibold text-green-600">
                        {/* FIXED: Null-safe toFixed */}
                        +{(signal.predictedGainPct || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Confidence</div>
                      <div className="text-lg font-semibold text-blue-600">{signal.confidence || 0}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Time Horizon</div>
                      <div className="text-lg font-semibold text-gray-700">{signal.timeHorizon || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Current P/L</div>
                      <div
                        className={`text-lg font-semibold ${
                          pnl.pnlPct >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {pnl.pnlPct >= 0 ? '+' : ''}
                        {/* FIXED: Null-safe toFixed */}
                        {(pnl.pnlPct || 0).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && signal.analysis && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    {/* 8D Analysis */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        8-Dimension Comprehensive Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { key: 'executiveQuality', label: 'Executive Quality' },
                          { key: 'businessQuality', label: 'Business Quality (Moat)' },
                          { key: 'financialStrength', label: 'Financial Strength' },
                          { key: 'industryPosition', label: 'Industry Position' },
                          { key: 'growthPotential', label: 'Growth Potential' },
                          { key: 'valuation', label: 'Valuation' },
                          { key: 'catalysts', label: 'Catalysts' },
                          { key: 'riskAssessment', label: 'Risk Assessment' },
                        ].map(({ key, label }) => {
                          const dimension = signal.analysis[key as keyof typeof signal.analysis] as any;
                          if (!dimension) return null;
                          
                          return (
                            <div key={key} className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-gray-700">{label}</span>
                                <span className="text-lg font-bold text-gray-900">
                                  {dimension.score}/{dimension.maxScore}
                                </span>
                              </div>
                              {getDimensionBar(dimension.score, dimension.maxScore)}
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                {dimension.reasoning}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Investment Thesis */}
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Investment Thesis</h4>
                      <p className="text-gray-700 leading-relaxed">{signal.analysis.investmentThesis}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Catalysts */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Catalysts</h4>
                        <ul className="space-y-2">
                          {signal.catalysts?.map((catalyst, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-green-600 mt-0.5">↗</span>
                              <span className="text-sm text-gray-700">{catalyst}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risk Factors */}
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">Risk Factors</h4>
                        <ul className="space-y-2">
                          {signal.riskFactors?.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">⚠</span>
                              <span className="text-sm text-gray-700">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {signal.analysis.strengths?.map((strength, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-green-600">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Concerns */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Concerns</h4>
                        <ul className="space-y-1">
                          {signal.analysis.concerns?.map((concern, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-yellow-600">!</span>
                              <span>{concern}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AITipTracker;
