// frontend/src/components/FundamentalsViewer.tsx
// Display comprehensive fundamental analysis and 20-point vetting

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, DollarSign, Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { API_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

interface VettingCategory {
  category: string;
  score: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  reasoning: string;
  keyFindings: string[];
}

interface VettingResult {
  ticker: string;
  overallScore: number;
  overallStatus: 'APPROVED' | 'CAUTION' | 'REJECTED';
  scores: VettingCategory[];
  summary: string;
  keyStrengths: string[];
  keyRisks: string[];
  generatedAt: string;
}

interface FundamentalsViewerProps {
  ticker: string;
  onClose?: () => void;
}

export function FundamentalsViewer({ ticker, onClose }: FundamentalsViewerProps) {
  const { token } = useAuth();
  const [vetting, setVetting] = useState<VettingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadVetting();
  }, [ticker]);

  const loadVetting = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/fundamentals/vetting/${ticker}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVetting(data.data);
      }
    } catch (error) {
      console.error('Failed to load vetting:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'WARNING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'FAIL':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getOverallBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-600 text-white';
      case 'CAUTION':
        return 'bg-yellow-600 text-white';
      case 'REJECTED':
        return 'bg-red-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Analyzing fundamentals...</p>
        </div>
      </div>
    );
  }

  if (!vetting) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Unable to load vetting analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-blue-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                20-Point Vetting Analysis
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Comprehensive fundamental evaluation for {ticker}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-4xl font-bold mb-1 ${
              vetting.overallScore >= 70 ? 'text-green-600' :
              vetting.overallScore >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {vetting.overallScore}/100
            </div>
            <span className={`px-4 py-1 rounded-full text-sm font-bold ${getOverallBadge(vetting.overallStatus)}`}>
              {vetting.overallStatus}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {vetting.summary}
        </p>
      </div>

      {/* Key Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-green-900 dark:text-green-100">Key Strengths</h3>
          </div>
          <ul className="space-y-2">
            {vetting.keyStrengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900 dark:text-red-100">Key Risks</h3>
          </div>
          <ul className="space-y-2">
            {vetting.keyRisks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {showAll ? 'All 20 Checks' : 'Top 5 Checks'}
            </h3>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
              {showAll ? 'Show Less' : 'View All 20'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {vetting.scores.slice(0, showAll ? 20 : 5).map((check, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(check.status)}
                  <span className="font-semibold text-sm">{check.category}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(check.status)}`}>
                  {check.score}/100
                </span>
              </div>
              
              <p className="text-xs opacity-90 mb-2">{check.reasoning}</p>
              
              {check.keyFindings.length > 0 && (
                <div className="space-y-1">
                  {check.keyFindings.map((finding, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs opacity-75 mt-0.5">•</span>
                      <span className="text-xs opacity-90">{finding}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generated: {new Date(vetting.generatedAt).toLocaleString()}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Data sources: Financial Modeling Prep, Finnhub
        </p>
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
