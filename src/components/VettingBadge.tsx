// src/components/VettingBadge.tsx
// Displays 20-Point Vetting Score and Details

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface VettingScore {
  category: string;
  score: number;
  status: string;
  reasoning: string;
  keyFindings: string[];
}

interface VettingResult {
  ticker: string;
  overallScore: number;
  overallStatus: string;
  scores: VettingScore[];
  summary: string;
  generatedAt: string;
}

interface VettingBadgeProps {
  ticker: string;
  inline?: boolean;
}

export const VettingBadge: React.FC<VettingBadgeProps> = ({ ticker, inline = false }) => {
  const [vetting, setVetting] = useState<VettingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (expanded && !vetting) {
      loadVetting();
    }
  }, [expanded]);

  const loadVetting = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/vetting/${ticker}`, {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'FAIL':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-600 text-white';
      case 'CAUTION':
        return 'bg-yellow-600 text-white';
      case 'REJECTED':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Inline badge view
  if (inline) {
    return (
      <button
        onClick={() => setExpanded(!expanded)}
        className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 transition-all hover:scale-105 ${
          vetting 
            ? getScoreColor(vetting.overallScore)
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        <Shield className="w-3 h-3" />
        <span>
          {vetting ? `${vetting.overallScore}/100` : 'Vet'}
        </span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
    );
  }

  // Full card view
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-purple-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h3 className="font-bold text-gray-900">20-Point Vetting Analysis</h3>
            <p className="text-xs text-gray-600">Comprehensive ticker evaluation</p>
          </div>
        </div>
        
        {vetting && (
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg font-bold text-lg ${getScoreColor(vetting.overallScore)}`}>
              {vetting.overallScore}/100
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(vetting.overallStatus)}`}>
              {vetting.overallStatus}
            </span>
          </div>
        )}
        
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {vetting && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2">Summary</h4>
                <p className="text-sm text-gray-700">{vetting.summary}</p>
              </div>

              {/* Top 5 Checks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900">
                    {showFull ? 'All 20 Checks' : 'Top 5 Checks'}
                  </h4>
                  <button
                    onClick={() => setShowFull(!showFull)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    {showFull ? 'Show Less' : 'View All 20'}
                  </button>
                </div>

                {vetting.scores.slice(0, showFull ? 20 : 5).map((check, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getStatusIcon(check.status)}
                        <span className="font-semibold text-sm text-gray-900">
                          {check.category}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(check.score)}`}>
                        {check.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{check.reasoning}</p>
                    {check.keyFindings.length > 0 && (
                      <div className="space-y-1">
                        {check.keyFindings.map((finding, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 text-xs mt-0.5">•</span>
                            <span className="text-xs text-gray-700">{finding}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Timestamp */}
              <p className="text-xs text-gray-500 text-center">
                Generated: {new Date(vetting.generatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
