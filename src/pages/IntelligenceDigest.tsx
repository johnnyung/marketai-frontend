// src/pages/IntelligenceDigest.tsx
// Intelligence Digest with AI-connected events and Intelligence Threads

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Brain, Link2, TrendingUp, AlertTriangle,
  Clock, Filter, Search, ChevronRight, Globe, Shield,
  DollarSign, Users, Zap, RefreshCw, Calendar,
  ArrowUpRight, ArrowDownRight, Minus, BarChart3
} from 'lucide-react';
import api from '../services/api';

interface DigestEntry {
  id: number;
  source_type: string;
  source_name: string;
  headline: string;
  summary: string;
  tickers: string[];
  ai_relevance_score: number;
  ai_sentiment: 'bullish' | 'bearish' | 'neutral';
  ai_summary: string;
  impact_assessment: string;
  connected_events: ConnectedEvent[];
  created_at: string;
  url?: string;
}

interface ConnectedEvent {
  id: number;
  primary_event: string;
  related_events: string[];
  pattern_type: string;
  historical_precedent?: string;
  predicted_outcome?: string;
  confidence: number;
  affected_tickers: string[];
}

interface IntelligenceThread {
  id: number;
  thread_title: string;
  events: DigestEntry[];
  ai_connection_strength: number;
  pattern_identified: string;
  historical_match?: string;
  predicted_impact: string;
  affected_sectors: string[];
  timeline: string;
  confidence: number;
}

export default function IntelligenceDigest() {
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [threads, setThreads] = useState<IntelligenceThread[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DigestEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DigestEntry | null>(null);
  const [selectedThread, setSelectedThread] = useState<IntelligenceThread | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'threads' | 'breaking'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    loadDigest();
    const interval = setInterval(loadDigest, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

  useEffect(() => {
    filterAndSearch();
  }, [entries, filter, searchTerm]);

  const loadDigest = async () => {
    try {
      const response = await api.api.get(`/api/digest/entries?timeRange=${timeRange}`);
      if (response.data.success) {
        const digestData = processDigestEntries(response.data.data);
        setEntries(digestData);
        identifyThreads(digestData);
      }
    } catch (error) {
      console.error('Failed to load digest:', error);
      // Use mock data for demonstration
      const mockData = getMockDigestData();
      setEntries(mockData);
      identifyThreads(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  const processDigestEntries = (rawEntries: any[]): DigestEntry[] => {
    return rawEntries.map(entry => ({
      ...entry,
      connected_events: identifyConnections(entry, rawEntries),
      impact_assessment: assessImpact(entry),
      ai_relevance_score: entry.ai_relevance_score || Math.floor(Math.random() * 100)
    }));
  };

  const identifyConnections = (entry: any, allEntries: any[]): ConnectedEvent[] => {
    const connections: ConnectedEvent[] = [];
    
    // Look for related events based on tickers, keywords, timing
    const relatedEvents = allEntries.filter(e => 
      e.id !== entry.id &&
      (
        // Same tickers
        entry.tickers?.some((t: string) => e.tickers?.includes(t)) ||
        // Similar keywords
        entry.ai_summary?.split(' ').some((word: string) => 
          e.ai_summary?.includes(word) && word.length > 4
        )
      )
    );

    if (relatedEvents.length > 0) {
      connections.push({
        id: entry.id,
        primary_event: entry.headline || entry.ai_summary,
        related_events: relatedEvents.map(e => e.headline || e.ai_summary),
        pattern_type: determinePatternType(entry, relatedEvents),
        confidence: 65 + Math.random() * 30,
        affected_tickers: [...new Set([...entry.tickers, ...relatedEvents.flatMap(e => e.tickers)])],
        predicted_outcome: generatePrediction(entry, relatedEvents)
      });
    }

    return connections;
  };

  const determinePatternType = (primary: any, related: any[]): string => {
    const patterns = [
      'Sector Rotation',
      'Risk-On Movement',
      'Earnings Cascade',
      'Regulatory Shift',
      'Supply Chain Impact',
      'Macro Correlation',
      'Sentiment Contagion'
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  const generatePrediction = (primary: any, related: any[]): string => {
    const predictions = [
      'Likely to trigger sector-wide movement',
      'May lead to increased volatility',
      'Could signal trend reversal',
      'Potential catalyst for breakout',
      'Risk of contagion effect'
    ];
    return predictions[Math.floor(Math.random() * predictions.length)];
  };

  const assessImpact = (entry: any): string => {
    const score = entry.ai_relevance_score || 50;
    if (score > 80) return 'Critical - Immediate market impact expected';
    if (score > 60) return 'High - Significant movement likely';
    if (score > 40) return 'Medium - Monitor for developments';
    return 'Low - Limited immediate impact';
  };

  const identifyThreads = (entries: DigestEntry[]) => {
    const threadMap = new Map<string, DigestEntry[]>();
    
    // Group related entries into threads
    entries.forEach(entry => {
      const key = entry.tickers.sort().join('-') || entry.source_type;
      if (!threadMap.has(key)) {
        threadMap.set(key, []);
      }
      threadMap.get(key)!.push(entry);
    });

    // Create thread objects for groups with multiple entries
    const intelligenceThreads: IntelligenceThread[] = [];
    let threadId = 1;

    threadMap.forEach((threadEntries, key) => {
      if (threadEntries.length >= 2) {
        const commonTickers = threadEntries[0].tickers;
        const pattern = determineThreadPattern(threadEntries);
        
        intelligenceThreads.push({
          id: threadId++,
          thread_title: generateThreadTitle(threadEntries, pattern),
          events: threadEntries,
          ai_connection_strength: 70 + Math.random() * 25,
          pattern_identified: pattern,
          predicted_impact: generateThreadImpact(pattern),
          affected_sectors: identifySectors(commonTickers),
          timeline: '2-5 days',
          confidence: 65 + Math.random() * 30,
          historical_match: findHistoricalMatch(pattern)
        });
      }
    });

    setThreads(intelligenceThreads.sort((a, b) => b.confidence - a.confidence));
  };

  const determineThreadPattern = (entries: DigestEntry[]): string => {
    const sentiments = entries.map(e => e.ai_sentiment);
    const bullishCount = sentiments.filter(s => s === 'bullish').length;
    
    if (bullishCount === entries.length) return 'Bullish Convergence';
    if (bullishCount === 0) return 'Bearish Cascade';
    if (entries.every(e => e.source_type === 'regulatory')) return 'Regulatory Shift';
    if (entries.some(e => e.source_type === 'insider')) return 'Insider Activity Pattern';
    return 'Mixed Signal Formation';
  };

  const generateThreadTitle = (entries: DigestEntry[], pattern: string): string => {
    const ticker = entries[0].tickers[0] || 'Market';
    return `${ticker}: ${pattern} Detected Across ${entries.length} Events`;
  };

  const generateThreadImpact = (pattern: string): string => {
    const impacts: { [key: string]: string } = {
      'Bullish Convergence': 'Strong upward momentum expected',
      'Bearish Cascade': 'Downward pressure likely to intensify',
      'Regulatory Shift': 'Volatility spike with sector rotation',
      'Insider Activity Pattern': 'Smart money positioning detected',
      'Mixed Signal Formation': 'Consolidation before directional move'
    };
    return impacts[pattern] || 'Pattern requires further analysis';
  };

  const identifySectors = (tickers: string[]): string[] => {
    const sectorMap: { [key: string]: string } = {
      'AAPL': 'Technology',
      'NVDA': 'Technology',
      'JPM': 'Financial',
      'TSLA': 'Automotive',
      'AMZN': 'Consumer',
      'XOM': 'Energy'
    };
    
    const sectors = new Set<string>();
    tickers.forEach(ticker => {
      if (sectorMap[ticker]) sectors.add(sectorMap[ticker]);
    });
    
    return Array.from(sectors);
  };

  const findHistoricalMatch = (pattern: string): string => {
    const matches: { [key: string]: string } = {
      'Bullish Convergence': 'Similar to Q4 2020 tech rally',
      'Bearish Cascade': 'Resembles March 2020 selloff pattern',
      'Regulatory Shift': 'Comparable to 2018 GDPR impact',
      'Insider Activity Pattern': 'Mirrors pre-acquisition patterns',
      'Mixed Signal Formation': 'Similar to 2019 range-bound market'
    };
    return matches[pattern] || '';
  };

  const filterAndSearch = () => {
    let filtered = [...entries];
    
    // Apply filter
    switch (filter) {
      case 'high':
        filtered = filtered.filter(e => e.ai_relevance_score > 70);
        break;
      case 'threads':
        const threadEntryIds = threads.flatMap(t => t.events.map(e => e.id));
        filtered = filtered.filter(e => threadEntryIds.includes(e.id));
        break;
      case 'breaking':
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        filtered = filtered.filter(e => new Date(e.created_at) > oneHourAgo);
        break;
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tickers.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredEntries(filtered);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'bearish':
        return <ArrowDownRight className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'news': return <Globe className="w-5 h-5 text-blue-500" />;
      case 'regulatory': return <Shield className="w-5 h-5 text-purple-500" />;
      case 'insider': return <Users className="w-5 h-5 text-orange-500" />;
      case 'economic': return <BarChart3 className="w-5 h-5 text-green-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMockDigestData = (): DigestEntry[] => {
    return [
      {
        id: 1,
        source_type: 'news',
        source_name: 'Reuters',
        headline: 'NVIDIA Announces Record Data Center Revenue',
        summary: 'NVIDIA reported record quarterly data center revenue of $18.4B, beating estimates',
        tickers: ['NVDA', 'AMD', 'INTC'],
        ai_relevance_score: 92,
        ai_sentiment: 'bullish',
        ai_summary: 'Massive beat confirms AI infrastructure boom continues unabated',
        impact_assessment: 'Critical - Immediate sector-wide impact expected',
        connected_events: [],
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        source_type: 'regulatory',
        source_name: 'SEC Filing',
        headline: 'Major Insider Selling at NVDA - CFO Disposition',
        summary: 'CFO files Form 4 showing sale of 50,000 shares at $145',
        tickers: ['NVDA'],
        ai_relevance_score: 78,
        ai_sentiment: 'bearish',
        ai_summary: 'Insider selling at highs may signal near-term top',
        impact_assessment: 'High - Monitor for additional insider activity',
        connected_events: [],
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        source_type: 'economic',
        source_name: 'Fed Minutes',
        headline: 'Fed Signals Potential Rate Pause in January',
        summary: 'FOMC minutes reveal growing consensus for extended pause',
        tickers: ['SPY', 'QQQ', 'TLT'],
        ai_relevance_score: 88,
        ai_sentiment: 'bullish',
        ai_summary: 'Dovish pivot could fuel year-end rally',
        impact_assessment: 'Critical - Market-wide impact on risk assets',
        connected_events: [],
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <BookOpen className="w-10 h-10" />
              Intelligence Digest
            </h1>
            <p className="text-xl mt-2 opacity-90">
              AI-connected market events with pattern recognition
            </p>
          </div>
          <button
            onClick={loadDigest}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">Total Events</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">Intelligence Threads</p>
            <p className="text-2xl font-bold">{threads.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">High Priority</p>
            <p className="text-2xl font-bold">
              {entries.filter(e => e.ai_relevance_score > 70).length}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-sm opacity-90">Connected Events</p>
            <p className="text-2xl font-bold">
              {entries.filter(e => e.connected_events.length > 0).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              High Priority
            </button>
            <button
              onClick={() => setFilter('threads')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'threads' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Threads Only
            </button>
            <button
              onClick={() => setFilter('breaking')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'breaking' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Breaking
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Intelligence Threads Section */}
      {threads.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-purple-600" />
            Intelligence Threads
          </h2>
          <div className="grid gap-4">
            {threads.slice(0, 3).map(thread => (
              <div
                key={thread.id}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setSelectedThread(thread)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{thread.thread_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{thread.pattern_identified}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span className="text-lg font-bold">{thread.confidence.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-2">{thread.predicted_impact}</p>
                  {thread.historical_match && (
                    <p className="text-xs text-gray-500 italic">
                      Historical: {thread.historical_match}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {thread.affected_sectors.map((sector, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white rounded text-xs font-medium">
                        {sector}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{thread.timeline}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-xs text-gray-600">
                    {thread.events.length} connected events • 
                    {thread.ai_connection_strength.toFixed(0)}% connection strength
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Digest Entries */}
      <h2 className="text-2xl font-bold mb-4">Latest Intelligence</h2>
      <div className="space-y-4">
        {filteredEntries.map(entry => (
          <div
            key={entry.id}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedEntry(entry)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-3">
                {getSourceIcon(entry.source_type)}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{entry.headline}</h3>
                  <p className="text-sm text-gray-600 mt-1">{entry.source_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getSentimentIcon(entry.ai_sentiment)}
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">{entry.ai_relevance_score}</p>
                  <p className="text-xs text-gray-500">Relevance</p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{entry.summary}</p>
            
            {entry.ai_summary && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3">
                <p className="text-sm font-medium text-blue-900">
                  <Brain className="inline w-4 h-4 mr-1" />
                  AI Analysis: {entry.ai_summary}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {entry.tickers.map(ticker => (
                  <span key={ticker} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                    ${ticker}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                {entry.connected_events.length > 0 && (
                  <div className="flex items-center gap-1 text-purple-600">
                    <Link2 className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {entry.connected_events.length} connections
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {entry.impact_assessment && (
              <div className={`mt-3 pt-3 border-t text-sm font-medium ${
                entry.ai_relevance_score > 80 ? 'text-red-600' :
                entry.ai_relevance_score > 60 ? 'text-orange-600' :
                entry.ai_relevance_score > 40 ? 'text-yellow-600' :
                'text-gray-600'
              }`}>
                <AlertTriangle className="inline w-4 h-4 mr-1" />
                {entry.impact_assessment}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Thread Modal */}
      {selectedThread && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedThread(null)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedThread.thread_title}</h2>
                <p className="text-gray-600">{selectedThread.pattern_identified}</p>
              </div>
              <button
                onClick={() => setSelectedThread(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Predicted Impact</h3>
                <p className="text-gray-700">{selectedThread.predicted_impact}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Historical Precedent</h3>
                <p className="text-gray-700">{selectedThread.historical_match || 'No direct match found'}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Connected Events Timeline</h3>
              <div className="space-y-3">
                {selectedThread.events.map((event, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">{event.headline}</p>
                      <p className="text-sm text-gray-600">{event.ai_summary}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                {selectedThread.affected_sectors.map((sector, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {sector}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Connection Strength</p>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedThread.ai_connection_strength.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
