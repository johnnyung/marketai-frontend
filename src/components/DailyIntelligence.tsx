// src/components/DailyIntelligence.tsx
// FIXED: Line 252-254 - Handle ticker objects properly
// Changed from: {ticker}
// Changed to: {typeof ticker === 'string' ? ticker : ticker.ticker}

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Target, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface DailyReport {
  date: string;
  topStories: Array<{
    title: string;
    summary: string;
    relevance: number;
    source: string;
  }>;
  marketMovers: Array<{
    tickers: any[]; // Can be string[] or object[]
    summary: string;
    sentiment: string;
    reasoning: string;
  }>;
  riskAlerts: Array<{
    level: string;
    description: string;
    affectedSectors: string[];
  }>;
  tradingSignals: Array<{
    ticker: string;
    signal: string;
    confidence: number;
    reasoning: string;
  }>;
}

export function DailyIntelligence() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const fetchLatestReport = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/daily/latest`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setReport(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewReport = async () => {
    if (generating) return;
    
    if (!window.confirm('Generate new Daily Intelligence Report?\n\nThis will analyze the latest market data and create a fresh report. Takes about 30 seconds.')) {
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/intelligence/daily/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('✅ New report generated successfully!');
          await fetchLatestReport();
        }
      }
    } catch (error) {
      alert('❌ Failed to generate report');
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Daily Intelligence...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Available</h3>
          <p className="text-gray-600 mb-6">Generate your first Daily Intelligence Report</p>
          <button
            onClick={generateNewReport}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Daily Intelligence Report
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <p>{formatDate(report.date)}</p>
            </div>
          </div>
          <button
            onClick={generateNewReport}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate New
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="stories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stories">
            Top Stories ({report.topStories?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="movers">
            Market Movers ({report.marketMovers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="risks">
            Risk Alerts ({report.riskAlerts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="signals">
            Signals ({report.tradingSignals?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Top Stories */}
        <TabsContent value="stories" className="space-y-4">
          {report.topStories && report.topStories.length > 0 ? (
            report.topStories.map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <Badge variant="outline">{story.relevance}%</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{story.source}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{story.summary}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No top stories in the last 24 hours</p>
          )}
        </TabsContent>

        {/* Market Movers */}
        <TabsContent value="movers" className="space-y-3">
          {report.marketMovers.length > 0 ? (
            report.marketMovers.map((mover, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex gap-2">
                      {mover.tickers?.map((ticker, idx) => (
                        <Badge key={idx} variant="outline" className="font-mono">
                          {typeof ticker === 'string' ? ticker : ticker.ticker || ticker}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant={
                      mover.sentiment === 'bullish' ? 'default' : 
                      mover.sentiment === 'bearish' ? 'destructive' : 
                      'secondary'
                    }>
                      {mover.sentiment}
                    </Badge>
                  </div>
                  <p className="text-gray-800">{mover.summary}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No significant market movers</p>
          )}
        </TabsContent>

        {/* Risk Alerts */}
        <TabsContent value="risks" className="space-y-3">
          {report.riskAlerts && report.riskAlerts.length > 0 ? (
            report.riskAlerts.map((alert, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(alert.level)}`}>
                          {alert.level}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-3">{alert.description}</p>
                      {alert.affectedSectors && alert.affectedSectors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {alert.affectedSectors.map((sector, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No active risk alerts</p>
          )}
        </TabsContent>

        {/* Trading Signals */}
        <TabsContent value="signals" className="space-y-3">
          {report.tradingSignals && report.tradingSignals.length > 0 ? (
            report.tradingSignals.map((signal, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                        ${signal.ticker}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {signal.signal === 'BUY' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                        <span className={`font-bold ${signal.signal === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
                          {signal.signal}
                        </span>
                      </div>
                    </div>
                    <Badge variant="default">
                      {signal.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-gray-700">{signal.reasoning}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No trading signals generated</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
