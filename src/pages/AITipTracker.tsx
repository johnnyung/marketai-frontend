// frontend/src/pages/AITipTracker.tsx
import React, { useState, useEffect } from 'react';
import WorkflowButton from '../components/WorkflowButton';
import WorkflowProgress from '../components/WorkflowProgress';
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">⚡ AI Tip Tracker</h1>
          <p className="text-gray-600 mt-1">
            Phase 4: Pattern Recognition • 8-Dimension Analysis • Success Probability
          </p>
        </div>

        {/* Workflow Progress */}
        <WorkflowProgress
          steps={[
            { number: 1, name: 'Fetch Data', completed: true, current: false },
            { number: 2, name: 'Connect Events', completed: true, current: false },
            { number: 3, name: 'Generate Signals', completed: signals.length > 0, current: generating }
          ]}
        />

        {/* Workflow Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <WorkflowButton
            stepNumber={3}
            title="Generate AI Picks"
            description="Create investment recommendations from intelligence"
            timeEstimate="~5 minutes"
            icon="⚡"
            onClick={handleGenerateSignals}
            disabled={generating}
            loading={generating}
            prerequisite="After Steps 1 & 2"
            color="green"
          />

          <WorkflowButton
            title="Analyze Patterns"
            description="Learn from past performance to improve future picks"
            timeEstimate="~1 minute"
            icon="🧠"
            onClick={handleAnalyzePatterns}
            disabled={analyzing || signals.length < 10}
            loading={analyzing}
            disabledReason={signals.length < 10 ? "Need 10+ signals first" : undefined}
            color="purple"
          />
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

            {/* Performance Stats */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Analyzed:</span>
                  <span className="font-semibold">{patternInsights.totalAnalyzed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Win Rate:</span>
                  <span className="font-semibold text-green-600">
                    {(patternInsights.winRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Return:</span>
                  <span className="font-semibold text-blue-600">
                    {(patternInsights.avgReturn * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pattern Confidence:</span>
                  <span className="font-semibold text-purple-600">
                    {(patternInsights.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-sm text-gray-600">
              💡 The system learns from closed positions to improve future recommendations.
              Current confidence: <span className="font-semibold">{(patternInsights.confidence * 100).toFixed(0)}%</span>
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            {(['ALL', 'BUY', 'HOLD', 'WATCH'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="score">Analysis Score</option>
              <option value="probability">Success Probability</option>
              <option value="gain">Predicted Gain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signals List */}
      {filteredSignals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No AI Signals Yet</h3>
          <p className="text-gray-600 mb-6">
            Click "Generate AI Picks" above to create investment recommendations
          </p>
          <p className="text-sm text-gray-500">
            Make sure you've completed Steps 1 & 2 in Intelligence Digest first
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all overflow-hidden"
            >
              {/* Signal Header */}
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{signal.ticker}</h3>
                      <span className="text-gray-600">{signal.companyName}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          signal.action === 'BUY'
                            ? 'bg-green-100 text-green-700'
                            : signal.action === 'HOLD'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {signal.action}
                      </span>
                    </div>
                    <p className="text-gray-700">{signal.investmentThesis}</p>
                  </div>

                  <div className="flex gap-4 ml-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Analysis Score</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {signal.analysisScore}/100
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Success Probability</div>
                      <div className="text-3xl font-bold text-green-600">
                        {signal.successProbability}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Predicted Gain</div>
                      <div className="text-3xl font-bold text-purple-600">
                        +{signal.predictedGainPct}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4 text-gray-600">
                    <span>💰 Entry: ${signal.entryPrice?.toFixed(2) || 'N/A'}</span>
                    <span>⏱️ {signal.timeHorizon}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    {expandedSignal === signal.id ? '▲ Hide Details' : '▼ Show Details'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSignal === signal.id && signal.analysis && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="font-bold text-gray-900 mb-4">8-Dimension Analysis</h4>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Executive Quality */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          👔 Executive Quality
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.executiveQuality?.score || 0}/{signal.analysis.executiveQuality?.maxScore || 15}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.executiveQuality?.score || 0,
                        signal.analysis.executiveQuality?.maxScore || 15
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {signal.analysis.executiveQuality?.reasoning || 'No data'}
                      </p>
                    </div>

                    {/* Business Quality */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          🏢 Business Quality
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.businessQuality?.score || 0}/{signal.analysis.businessQuality?.maxScore || 20}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.businessQuality?.score || 0,
                        signal.analysis.businessQuality?.maxScore || 20
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {signal.analysis.businessQuality?.reasoning || 'No data'}
                      </p>
                    </div>

                    {/* Financial Strength */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          💪 Financial Strength
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.financialStrength?.score || 0}/{signal.analysis.financialStrength?.maxScore || 15}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.financialStrength?.score || 0,
                        signal.analysis.financialStrength?.maxScore || 15
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {signal.analysis.financialStrength?.reasoning || 'No data'}
                      </p>
                    </div>

                    {/* Industry Position */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          🎯 Industry Position
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.industryPosition?.score || 0}/{signal.analysis.industryPosition?.maxScore || 10}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.industryPosition?.score || 0,
                        signal.analysis.industryPosition?.maxScore || 10
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {signal.analysis.industryPosition?.reasoning || 'No data'}
                      </p>
                    </div>

                    {/* Growth Potential */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          📈 Growth Potential
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.growthPotential?.score || 0}/{signal.analysis.growthPotential?.maxScore || 15}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.growthPotential?.score || 0,
                        signal.analysis.growthPotential?.maxScore || 15
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {signal.analysis.growthPotential?.reasoning || 'No data'}
                      </p>
                    </div>

                    {/* Valuation */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          💰 Valuation
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.valuation?.score || 0}/{signal.analysis.valuation?.maxScore || 10}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.valuation?.score || 0,
                        signal.analysis.valuation?.maxScore || 10
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {signal.analysis.valuation?.reasoning || 'No data'}
                      </p>
                    </div>

                    {/* Catalysts */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          🚀 Catalysts
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.catalysts?.score || 0}/{signal.analysis.catalysts?.maxScore || 10}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.catalysts?.score || 0,
                        signal.analysis.catalysts?.maxScore || 10
                      )}
                      {signal.catalysts && signal.catalysts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {signal.catalysts.map((catalyst, idx) => (
                            <div key={idx} className="text-xs text-gray-600">
                              • {catalyst}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          ⚠️ Risk Assessment
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {signal.analysis.riskAssessment?.score || 0}/{signal.analysis.riskAssessment?.maxScore || 5}
                        </span>
                      </div>
                      {getDimensionBar(
                        signal.analysis.riskAssessment?.score || 0,
                        signal.analysis.riskAssessment?.maxScore || 5
                      )}
                      {signal.riskFactors && (
                        <p className="text-xs text-gray-600 mt-2">{signal.riskFactors}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AITipTracker;
