// frontend/src/components/DigestBrowser.tsx
// Browse and filter digest intelligence entries

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, AlertCircle } from 'lucide-react';

interface DigestEntry {
  id: string;
  source_type: string;
  source_name: string;
  ai_summary: string;
  ai_relevance_score: number;
  ai_sentiment: string;
  ai_entities_tickers: string[];
  ai_tags: string[];
  event_date: string;
}

interface DigestStats {
  totalEntries: number;
  byType: Array<{
    source_type: string;
    count: string;
    avg_score: string;
  }>;
  trendingTickers: Array<{
    ticker: string;
    mention_count: string;
    ai_sentiment: string;
  }>;
}

const DigestBrowser: React.FC = () => {
  const [entries, setEntries] = useState<DigestEntry[]>([]);
  const [stats, setStats] = useState<DigestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minRelevance, setMinRelevance] = useState(50);

  useEffect(() => {
    fetchStats();
    fetchEntries();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/digest/summary`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '50',
        minRelevance: minRelevance.toString(),
        ...(selectedType !== 'all' && { sourceType: selectedType })
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/digest/entries?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.entries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.ai_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.source_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.ai_entities_tickers?.some(ticker => ticker.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const getRelevanceBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 70) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSentimentBadgeColor = (sentiment: string) => {
    if (sentiment === 'bullish') return 'bg-green-100 text-green-800 border-green-200';
    if (sentiment === 'bearish') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Intelligence Digest</h1>
        <p className="text-gray-600">
          Browse {stats?.totalEntries.toLocaleString()} intelligence entries from 80+ sources
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.length}</div>
              <p className="text-xs text-gray-500">Active categories</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Relevance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.byType.reduce((sum, t) => sum + parseFloat(t.avg_score), 0) / stats.byType.length)}
              </div>
              <p className="text-xs text-gray-500">Quality score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Trending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {stats.trendingTickers.slice(0, 3).map(ticker => (
                  <Badge key={ticker.ticker} variant="outline" className="text-xs">
                    {ticker.ticker}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entries, tickers, sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Source Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {stats?.byType.map(type => (
                  <SelectItem key={type.source_type} value={type.source_type}>
                    {type.source_type} ({type.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Relevance Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Min Relevance: {minRelevance}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={minRelevance}
                onChange={(e) => setMinRelevance(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No entries match your filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className={getRelevanceBadgeColor(entry.ai_relevance_score)}>
                    {entry.ai_relevance_score}
                  </Badge>
                  <Badge variant="outline">{entry.source_type}</Badge>
                  {entry.ai_sentiment && (
                    <Badge className={getSentimentBadgeColor(entry.ai_sentiment)}>
                      {entry.ai_sentiment}
                    </Badge>
                  )}
                  {entry.ai_entities_tickers?.map(ticker => (
                    <Badge key={ticker} variant="secondary" className="font-mono">
                      ${ticker}
                    </Badge>
                  ))}
                </div>

                <p className="text-gray-800 font-medium mb-2">{entry.ai_summary}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{entry.source_name}</span>
                  <span>{new Date(entry.event_date).toLocaleString()}</span>
                </div>

                {entry.ai_tags && entry.ai_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.ai_tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Results Count */}
      {!loading && (
        <div className="text-center text-sm text-gray-500">
          Showing {filteredEntries.length} of {entries.length} entries
        </div>
      )}
    </div>
  );
};

export default DigestBrowser;
