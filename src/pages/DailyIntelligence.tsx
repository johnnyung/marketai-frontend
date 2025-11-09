// frontend/src/components/DailyIntelligence.tsx
// Daily Intelligence Report Display Component

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, Globe, DollarSign, Bitcoin, Calendar, RefreshCw } from 'lucide-react';

interface TradingSignal {
  ticker: string;
  action: 'BUY' | 'SELL' | 'WATCH';
  priceTarget: number | null;
  currentPrice: number | null;
  confidence: number;
  riskReward: number;
  reasoning: string;
  catalysts: string[];
  timeframe: string;
  supportingEntries: number;
}

interface DailyReport {
  date: string;
  summary: string;
  topStories: Array<{
    summary: string;
    relevance: number;
    source: string;
    date: string;
  }>;
  marketMovers: Array<{
    summary: string;
    tickers: string[];
    relevance: number;
    sentiment: string;
  }>;
  geopoliticalAlerts: Array<{
    summary: string;
    source: string;
    relevance: number;
  }>;
  economicIndicators: Array<{
    summary: string;
    source: string;
    date: string;
  }>;
  cryptoTrends: Array<{
    summary: string;
    source: string;
    relevance: number;
  }>;
  recommendations: string[];
  generatedAt: string;
}

const DailyIntelligence: React.FC = () => {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchLatestReport();
    fetchTradingSignals();
  }, []);

  const fetchTradingSignals = async () => {
    try {
      setLoadingSignals(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/opportunities/signals?limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setSignals(data.signals);
      }
    } catch (err) {
      console.error('Error fetching signals:', err);
    } finally {
      setLoadingSignals(false);
    }
  };

  const fetchLatestReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/intelligence/daily/latest`);
      const data = await response.json();
      
      if (data.success) {
        setReport(data.report);
        setError(null);
      } else {
        setError(data.message || 'No reports available');
      }
    } catch (err) {
      setError('Failed to load report');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewReport = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/intelligence/daily/generate`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh to show new report
        await fetchLatestReport();
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      setError('Failed to generate report');
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading intelligence report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Report Available</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={generateNewReport} disabled={generating}>
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daily Intelligence Report</h1>
          <p className="text-gray-600">
            Generated {new Date(report.generatedAt).toLocaleString()}
          </p>
        </div>
        <Button onClick={generateNewReport} disabled={generating} variant="outline">
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Trading Opportunities */}
      {!loadingSignals && signals.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              AI Trading Signals
              <Badge variant="outline" className="ml-auto">
                {signals.length} Opportunities
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signals.map((signal, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-lg border border-purple-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-800 font-mono">
                      ${signal.ticker}
                    </span>
                    <Badge
                      variant={
                        signal.action === 'BUY' ? 'default' :
                        signal.action === 'SELL' ? 'destructive' :
                        'secondary'
                      }
                      className="text-sm font-semibold"
                    >
                      {signal.action}
                    </Badge>
                    {signal.priceTarget && (
                      <span className="text-sm text-gray-600">
                        @ ${signal.priceTarget.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className={`text-lg font-bold ${
                      signal.confidence >= 80 ? 'text-green-600' :
                      signal.confidence >= 70 ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {signal.confidence}%
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-3 leading-relaxed">
                  {signal.reasoning}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <span className="text-gray-500">Risk/Reward:</span>
                    <span className="ml-1 font-semibold text-gray-800">
                      {signal.riskReward.toFixed(1)}:1
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeframe:</span>
                    <span className="ml-1 font-semibold text-gray-800 capitalize">
                      {signal.timeframe}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Data Points:</span>
                    <span className="ml-1 font-semibold text-gray-800">
                      {signal.supportingEntries}
                    </span>
                  </div>
                </div>

                {signal.catalysts && signal.catalysts.length > 0 && (
                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-xs font-semibold text-gray-500 mb-2">
                      KEY CATALYSTS:
                    </div>
                    <ul className="space-y-1">
                      {signal.catalysts.slice(0, 3).map((catalyst, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex gap-2">
                          <span className="text-purple-600">→</span>
                          <span>{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            
            <div className="text-center pt-2">
              <button
                onClick={fetchTradingSignals}
                disabled={loadingSignals}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {loadingSignals ? 'Refreshing...' : 'Refresh Signals'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {report.summary}
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              Actionable Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 flex-1">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Intelligence Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="stories" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="stories">
                Top Stories ({report.topStories.length})
              </TabsTrigger>
              <TabsTrigger value="movers">
                Market Movers ({report.marketMovers.length})
              </TabsTrigger>
              <TabsTrigger value="geo">
                Geopolitical ({report.geopoliticalAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="economic">
                Economic ({report.economicIndicators.length})
              </TabsTrigger>
              <TabsTrigger value="crypto">
                Crypto ({report.cryptoTrends.length})
              </TabsTrigger>
            </TabsList>

            {/* Top Stories */}
            <TabsContent value="stories" className="space-y-3">
              {report.topStories.length > 0 ? (
                report.topStories.map((story, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={story.relevance >= 80 ? 'destructive' : 'secondary'}>
                          Relevance: {story.relevance}
                        </Badge>
                        <span className="text-xs text-gray-500">{story.source}</span>
                      </div>
                      <p className="text-gray-800 font-medium">{story.summary}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(story.date).toLocaleString()}
                      </p>
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
                          {mover.tickers?.map((ticker) => (
                            <Badge key={ticker} variant="outline" className="font-mono">
                              {ticker}
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
                <p className="text-gray-500 text-center py-8">No market movers identified</p>
              )}
            </TabsContent>

            {/* Geopolitical */}
            <TabsContent value="geo" className="space-y-3">
              {report.geopoliticalAlerts.length > 0 ? (
                report.geopoliticalAlerts.map((alert, index) => (
                  <Card key={index} className="border-red-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">{alert.source}</span>
                        <Badge variant="destructive">Relevance: {alert.relevance}</Badge>
                      </div>
                      <p className="text-gray-800">{alert.summary}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No geopolitical alerts</p>
              )}
            </TabsContent>

            {/* Economic */}
            <TabsContent value="economic" className="space-y-3">
              {report.economicIndicators.length > 0 ? (
                report.economicIndicators.map((indicator, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-semibold">{indicator.source}</span>
                      </div>
                      <p className="text-gray-800">{indicator.summary}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(indicator.date).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No economic indicators</p>
              )}
            </TabsContent>

            {/* Crypto */}
            <TabsContent value="crypto" className="space-y-3">
              {report.cryptoTrends.length > 0 ? (
                report.cryptoTrends.map((trend, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Bitcoin className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-semibold">{trend.source}</span>
                        <Badge>Relevance: {trend.relevance}</Badge>
                      </div>
                      <p className="text-gray-800">{trend.summary}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No crypto trends detected</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { DailyIntelligence };
export default DailyIntelligence;
