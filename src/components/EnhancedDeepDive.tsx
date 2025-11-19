// src/components/EnhancedDeepDive.tsx
// Comprehensive 2000+ Word Deep Dive Display

import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Target, AlertTriangle, Calendar, Building2, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { API_URL } from '../config/api';

interface DeepDiveAnalysis {
  ticker: string;
  companyName: string;
  executiveSummary: string;
  businessModel: string;
  competitiveLandscape: string;
  financialAnalysis: string;
  riskAssessment: string;
  historicalPatterns: string;
  investmentThesis: string;
  bullCase: {
    title: string;
    points: Array<{
      point: string;
      explanation: string;
      strength: string;
    }>;
  };
  bearCase: {
    title: string;
    points: Array<{
      point: string;
      explanation: string;
      severity: string;
    }>;
  };
  catalysts: {
    nearTerm: Array<{ event: string; timing: string; impact: string; }>;
    mediumTerm: Array<{ event: string; timing: string; impact: string; }>;
    longTerm: Array<{ event: string; timing: string; impact: string; }>;
  };
  riskFactors: {
    operational: string[];
    financial: string[];
    market: string[];
    regulatory: string[];
  };
  historicalComparisons: Array<{
    company: string;
    scenario: string;
    outcome: string;
    relevance: string;
  }>;
  competitiveMatrix: Array<{
    competitor: string;
    strength: string;
    weakness: string;
    marketPosition: string;
  }>;
  recommendation: string;
  confidence: number;
  priceTarget: number | null;
  timeHorizon: string;
  generatedAt: string;
}

interface EnhancedDeepDiveProps {
  recommendedTickers?: string[];
}

export const EnhancedDeepDive: React.FC<EnhancedDeepDiveProps> = ({ recommendedTickers = [] }) => {
  const [ticker, setTicker] = useState('');
  const [analysis, setAnalysis] = useState<DeepDiveAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const loadAnalysis = async (symbol: string) => {
    if (!symbol) return;
    
    setLoading(true);
    setTicker(symbol);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/deep-dive/${symbol}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        alert(`Failed to load analysis for ${symbol}`);
      }
    } catch (error) {
      console.error('Failed to load deep dive:', error);
      alert('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG BUY': return 'bg-green-600 text-white';
      case 'BUY': return 'bg-green-500 text-white';
      case 'HOLD': return 'bg-yellow-500 text-white';
      case 'SELL': return 'bg-red-500 text-white';
      case 'STRONG SELL': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          Comprehensive Deep Dive Analysis
        </h2>
        <p className="text-gray-600 mb-6">
          Get 2000+ word institutional-quality analysis on any ticker
        </p>

        {/* Manual Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Enter Ticker Symbol:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && ticker) {
                  loadAnalysis(ticker);
                }
              }}
              placeholder="NVDA"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
            />
            <button
              onClick={() => loadAnalysis(ticker)}
              disabled={!ticker || loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Quick Select */}
        {recommendedTickers.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Or quick select from AI recommendations:
            </label>
            <div className="flex flex-wrap gap-2">
              {recommendedTickers.map(t => (
                <button
                  key={t}
                  onClick={() => loadAnalysis(t)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 disabled:opacity-50 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-lg p-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Generating comprehensive analysis...</p>
            <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
          </div>
        </div>
      )}

      {/* Analysis Display */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{analysis.ticker}</h1>
                <p className="text-xl text-blue-100">{analysis.companyName}</p>
              </div>
              <div className="text-right">
                <div className={`inline-block px-6 py-3 rounded-lg font-bold text-lg ${getRecommendationColor(analysis.recommendation)}`}>
                  {analysis.recommendation}
                </div>
                <p className="text-sm text-blue-100 mt-2">{analysis.timeHorizon} outlook</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-blue-400">
              <div>
                <p className="text-blue-200 text-sm mb-1">Confidence Score</p>
                <p className="text-3xl font-bold">{analysis.confidence}%</p>
              </div>
              {analysis.priceTarget && (
                <div>
                  <p className="text-blue-200 text-sm mb-1">Price Target</p>
                  <p className="text-3xl font-bold">${analysis.priceTarget}</p>
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis.executiveSummary}</p>
          </div>

          {/* Business Model */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Business Model
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis.businessModel}</p>
          </div>

          {/* Competitive Landscape */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Competitive Landscape</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{analysis.competitiveLandscape}</p>
            
            {analysis.competitiveMatrix.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Competitive Matrix</h3>
                <div className="space-y-4">
                  {analysis.competitiveMatrix.map((comp, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">{comp.competitor}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-green-600">Strength:</span>
                          <p className="text-gray-700 mt-1">{comp.strength}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-red-600">Weakness:</span>
                          <p className="text-gray-700 mt-1">{comp.weakness}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-600">Market Position:</span>
                          <p className="text-gray-700 mt-1">{comp.marketPosition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Financial Analysis */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Analysis</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis.financialAnalysis}</p>
          </div>

          {/* Bull & Bear Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bull Case */}
            <div className="bg-green-50 rounded-xl shadow-lg border-2 border-green-200 p-6">
              <h2 className="text-2xl font-bold text-green-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Bull Case
              </h2>
              <p className="text-green-800 font-semibold mb-4">{analysis.bullCase.title}</p>
              <div className="space-y-4">
                {analysis.bullCase.points.map((point, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex items-start gap-2 mb-2">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getStrengthColor(point.strength)}`} />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{point.point}</h4>
                        <span className={`text-xs font-semibold ${getStrengthColor(point.strength)}`}>
                          {point.strength} STRENGTH
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{point.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bear Case */}
            <div className="bg-red-50 rounded-xl shadow-lg border-2 border-red-200 p-6">
              <h2 className="text-2xl font-bold text-red-900 mb-2 flex items-center gap-2">
                <TrendingDown className="w-6 h-6" />
                Bear Case
              </h2>
              <p className="text-red-800 font-semibold mb-4">{analysis.bearCase.title}</p>
              <div className="space-y-4">
                {analysis.bearCase.points.map((point, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2 mb-2">
                      <XCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getStrengthColor(point.severity)}`} />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{point.point}</h4>
                        <span className={`text-xs font-semibold ${getStrengthColor(point.severity)}`}>
                          {point.severity} SEVERITY
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{point.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Risk Assessment
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{analysis.riskAssessment}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-bold text-red-900 mb-2">Operational Risks</h4>
                <ul className="space-y-1">
                  {analysis.riskFactors.operational.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-bold text-yellow-900 mb-2">Financial Risks</h4>
                <ul className="space-y-1">
                  {analysis.riskFactors.financial.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-2">Market Risks</h4>
                <ul className="space-y-1">
                  {analysis.riskFactors.market.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-600 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2">Regulatory Risks</h4>
                <ul className="space-y-1">
                  {analysis.riskFactors.regulatory.map((risk, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Catalysts */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Key Catalysts
            </h2>
            
            <div className="space-y-6">
              {/* Near Term */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Near-Term (0-3 months)</h3>
                <div className="space-y-3">
                  {analysis.catalysts.nearTerm.map((cat, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{cat.event}</h4>
                        <span className="text-sm font-semibold text-blue-600">{cat.timing}</span>
                      </div>
                      <p className="text-sm text-gray-700">{cat.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Medium Term */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Medium-Term (3-12 months)</h3>
                <div className="space-y-3">
                  {analysis.catalysts.mediumTerm.map((cat, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{cat.event}</h4>
                        <span className="text-sm font-semibold text-green-600">{cat.timing}</span>
                      </div>
                      <p className="text-sm text-gray-700">{cat.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Long Term */}
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-3">Long-Term (12+ months)</h3>
                <div className="space-y-3">
                  {analysis.catalysts.longTerm.map((cat, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900">{cat.event}</h4>
                        <span className="text-sm font-semibold text-purple-600">{cat.timing}</span>
                      </div>
                      <p className="text-sm text-gray-700">{cat.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Historical Patterns */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Historical Patterns</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">{analysis.historicalPatterns}</p>
            
            {analysis.historicalComparisons.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Similar Historical Scenarios</h3>
                <div className="space-y-4">
                  {analysis.historicalComparisons.map((comp, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">{comp.company}</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-semibold text-gray-700">Scenario:</span> {comp.scenario}</p>
                        <p><span className="font-semibold text-gray-700">Outcome:</span> {comp.outcome}</p>
                        <p><span className="font-semibold text-blue-600">Relevance:</span> {comp.relevance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Investment Thesis */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-300 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Investment Thesis
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{analysis.investmentThesis}</p>
          </div>
        </div>
      )}
    </div>
  );
};
