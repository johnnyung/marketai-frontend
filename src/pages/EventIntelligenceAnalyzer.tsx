// src/pages/EventIntelligenceAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import {
  Globe, FileText, Brain, TrendingUp, TrendingDown,
  AlertTriangle, Target, Clock, BarChart3, Shield, Zap, 
  RefreshCw, History, ExternalLink
} from 'lucide-react';
import api from '../services/api';

interface Analysis {
  eventSummary: string;
  historicalPrecedent: {
    matchedEvent: string;
    date: string;
    similarity: number;
    pastOutcome: string;
    keyDifferences: string[];
  };
  sectorImpact: Array<{
    sector: string;
    prediction: string;
    magnitude: number;
    reasoning: string;
  }>;
  affectedTickers: Array<{
    ticker: string;
    recommendation: string;
    confidence: number;
    reasoning: string;
    targetPrice: number;
    timeframe: string;
    catalysts: string[];
  }>;
  riskFactors: Array<{
    risk: string;
    severity: string;
    mitigation: string;
  }>;
  overallConfidence: number;
  tradingStrategy: string;
  timelinePrediction: {
    immediate: string;
    shortTerm: string;
    mediumTerm: string;
  };
}

interface HistoryItem {
  id: number;
  article_url: string;
  user_notes: string;
  ai_analysis: Analysis;
  affected_tickers: string[];
  created_at: string;
}

export default function EventIntelligenceAnalyzer() {
  const [articleUrl, setArticleUrl] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.api.get('/api/event-intelligence/recent');
      if (response.data.success) {
        setHistory(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const analyzeEvent = async () => {
    if (!articleUrl) {
      setError('Please enter an article URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.api.post('/api/event-intelligence/analyze', {
        articleUrl,
        userNotes
      });

      if (response.data.success) {
        setAnalysis(response.data.data);
        loadHistory(); // Refresh history
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setArticleUrl(item.article_url);
    setUserNotes(item.user_notes);
    setAnalysis(item.ai_analysis);
    setShowHistory(false);
  };

  const getSentimentColor = (prediction: string) => {
    if (prediction === 'bullish') return 'text-green-600 bg-green-50';
    if (prediction === 'bearish') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Event Intelligence Analyzer
          </h1>
          <p className="text-gray-600">
            Analyze news events against historical patterns, market data, and AI intelligence
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
        >
          <History className="w-5 h-5" />
          History ({history.length})
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className={showHistory ? 'col-span-8' : 'col-span-12'}>
          {/* Input Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Article URL
                </label>
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Your Analysis Notes
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="What's your take? What angle should we analyze?"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                onClick={analyzeEvent}
                disabled={loading || !articleUrl}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Analyze Event
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Event Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Event Summary
                </h2>
                <p className="text-gray-800 text-lg">{analysis.eventSummary}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Confidence:</span>
                    <span className="text-purple-600 font-bold">{analysis.overallConfidence}%</span>
                  </div>
                </div>
              </div>

              {/* Historical Precedent */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  Historical Precedent
                </h2>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{analysis.historicalPrecedent.matchedEvent}</h3>
                      <p className="text-sm text-gray-600">{analysis.historicalPrecedent.date}</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-bold">
                      {analysis.historicalPrecedent.similarity}% Match
                    </span>
                  </div>
                  <p className="text-gray-800 mb-3">{analysis.historicalPrecedent.pastOutcome}</p>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Key Differences:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {analysis.historicalPrecedent.keyDifferences.map((diff, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{diff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sector Impact */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  Sector Impact
                </h2>
                <div className="space-y-3">
                  {analysis.sectorImpact.map((sector, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${getSentimentColor(sector.prediction)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{sector.sector}</h3>
                        <div className="flex items-center gap-2">
                          {sector.prediction === 'bullish' ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                          <span className="font-bold">{sector.magnitude > 0 ? '+' : ''}{sector.magnitude}%</span>
                        </div>
                      </div>
                      <p className="text-sm">{sector.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticker Recommendations */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-600" />
                  Stock Recommendations
                </h2>
                <div className="space-y-4">
                  {analysis.affectedTickers.map((stock, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold">{stock.ticker}</h3>
                          <p className="text-sm text-gray-600">{stock.timeframe}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-4 py-2 rounded-lg font-bold text-lg ${
                            stock.recommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                            stock.recommendation === 'SELL' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {stock.recommendation}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">{stock.confidence}% confidence</p>
                        </div>
                      </div>
                      
                      <p className="text-gray-800 mb-3">{stock.reasoning}</p>
                      
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-xs text-gray-600">Target Price</p>
                        <p className="text-xl font-bold text-green-600">${stock.targetPrice}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Key Catalysts:</p>
                        <div className="flex flex-wrap gap-2">
                          {stock.catalysts.map((catalyst, cidx) => (
                            <span key={cidx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {catalyst}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-red-600" />
                  Risk Assessment
                </h2>
                <div className="space-y-3">
                  {analysis.riskFactors.map((risk, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-2 ${getSeverityColor(risk.severity)}`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold mb-2">{risk.risk}</p>
                          <p className="text-sm"><strong>Mitigation:</strong> {risk.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trading Strategy */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                  Trading Strategy
                </h2>
                <p className="text-gray-800 text-lg mb-6">{analysis.tradingStrategy}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Immediate (0-1 week)</p>
                    <p className="text-sm font-medium">{analysis.timelinePrediction.immediate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Short-term (1-4 weeks)</p>
                    <p className="text-sm font-medium">{analysis.timelinePrediction.shortTerm}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-xs text-gray-600 mb-1">Medium-term (1-3 months)</p>
                    <p className="text-sm font-medium">{analysis.timelinePrediction.mediumTerm}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Analysis History
              </h3>
              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <ExternalLink className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {new URL(item.article_url).hostname}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.affected_tickers?.slice(0, 3).map((ticker) => (
                        <span key={ticker} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {ticker}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
