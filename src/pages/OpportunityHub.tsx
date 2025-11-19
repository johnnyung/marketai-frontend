import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Building2, Search, ExternalLink, Calendar, Shield, Target } from 'lucide-react';
import { API_URL } from '../config/api';

interface Opportunity {
  id: number;
  ticker: string | null;
  company_name: string;
  opportunity_type: string;
  filing_date: string;
  filing_url: string;
  ai_summary: string;
  opportunity_score: number;
  risk_level: string;
  confidence: number;
  ai_bull_case: string;
  ai_bear_case: string;
  created_at: string;
}

interface Summary {
  ipo_count: number;
  spac_count: number;
  recent_count: number;
}

const OpportunityHub: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'IPO' | 'SPAC_MERGER'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [summaryRes, opportunitiesRes] = await Promise.all([
        fetch(`${API_URL}/api/opportunities/summary`, { headers }),
        fetch(`${API_URL}/api/opportunities/recent?limit=50`, { headers })
      ]);

      if (summaryRes.ok && opportunitiesRes.ok) {
        const summaryData = await summaryRes.json();
        const opportunitiesData = await opportunitiesRes.json();
        
        setSummary(summaryData.data);
        setOpportunities(opportunitiesData.data);
      }
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities
    .filter(opp => filter === 'all' || opp.opportunity_type === filter)
    .filter(opp => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        opp.company_name.toLowerCase().includes(search) ||
        (opp.ticker && opp.ticker.toLowerCase().includes(search))
      );
    });

  const getTypeColor = (type: string) => {
    if (type === 'IPO') return 'bg-purple-100 text-purple-800 border-purple-300';
    if (type === 'SPAC_MERGER') return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'LOW') return 'text-green-600 bg-green-50';
    if (risk === 'MEDIUM') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Rocket className="w-8 h-8 text-purple-600" />
          Opportunity Scanner
        </h1>
        <p className="text-gray-600">
          AI-analyzed IPOs, SPACs with comprehensive risk/reward assessment
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-900">{summary.ipo_count}</span>
            </div>
            <h3 className="text-sm font-semibold text-purple-900">IPO Filings</h3>
            <p className="text-xs text-purple-700">Last 30 days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-blue-900">{summary.spac_count}</span>
            </div>
            <h3 className="text-sm font-semibold text-blue-900">SPAC Mergers</h3>
            <p className="text-xs text-blue-700">Last 30 days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-green-900">{summary.recent_count}</span>
            </div>
            <h3 className="text-sm font-semibold text-green-900">Recent Activity</h3>
            <p className="text-xs text-green-700">Last 7 days</p>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company or ticker..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('IPO')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'IPO' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              IPOs
            </button>
            <button
              onClick={() => setFilter('SPAC_MERGER')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'SPAC_MERGER' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              SPACs
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Opportunities Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Check back soon for new filings'}
            </p>
          </div>
        ) : (
          filteredOpportunities.map((opp, idx) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTypeColor(opp.opportunity_type)}`}>
                      {opp.opportunity_type.replace('_', ' ')}
                    </span>
                    {opp.ticker && (
                      <span className="px-2 py-1 bg-gray-900 text-white rounded text-sm font-mono font-bold">
                        {opp.ticker}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{opp.company_name}</h3>
                  <p className="text-gray-700 mb-4">{opp.ai_summary}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Target className={`w-5 h-5 ${getScoreColor(opp.opportunity_score)}`} />
                      <div>
                        <p className="text-xs text-gray-500">Score</p>
                        <p className={`text-lg font-bold ${getScoreColor(opp.opportunity_score)}`}>
                          {opp.opportunity_score}/100
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-xs text-gray-500">Risk</p>
                        <p className={`text-sm font-bold px-2 py-1 rounded ${getRiskColor(opp.risk_level)}`}>
                          {opp.risk_level}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p className="text-lg font-bold text-blue-600">{opp.confidence}%</p>
                      </div>
                    </div>
                  </div>

                  {expandedId === opp.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="border-t pt-4 mt-4 space-y-3"
                    >
                      <div>
                        <h4 className="font-bold text-green-700 mb-2">🐂 Bull Case</h4>
                        <p className="text-sm text-gray-700">{opp.ai_bull_case}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-red-700 mb-2">🐻 Bear Case</h4>
                        <p className="text-sm text-gray-700">{opp.ai_bear_case}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(opp.filing_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setExpandedId(expandedId === opp.id ? null : opp.id)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    {expandedId === opp.id ? 'Hide' : 'Details'}
                  </button>
                  <a
                    href={opp.filing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    SEC
                  </a>
                  {opp.ticker && (
                    <Link
                      to={`/deep-dive?ticker=${opp.ticker}`}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition text-center"
                    >
                      Deep Dive
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default OpportunityHub;
