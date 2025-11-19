// frontend/src/services/aiTipTrackerService.ts
import { API_URL } from '../config/api';

// Get auth token for authenticated requests
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export interface DimensionScore {
  score: number;
  maxScore: number;
  reasoning: string;
  details: string[];
}

export interface ComprehensiveAnalysis {
  ticker: string;
  overallScore: number;
  recommendation: string;
  executiveQuality: DimensionScore;
  businessQuality: DimensionScore;
  financialStrength: DimensionScore;
  industryPosition: DimensionScore;
  growthPotential: DimensionScore;
  valuation: DimensionScore;
  catalysts: DimensionScore;
  riskAssessment: DimensionScore;
  strengths: string[];
  concerns: string[];
  investmentThesis: string;
  comparison: string;
}

export interface AITipSignal {
  id?: number;
  ticker: string;
  companyName: string;
  action: 'BUY' | 'HOLD' | 'WATCH' | 'SHORT';
  confidence: number;
  reasoning: string;
  catalysts: string[];
  predictedGainPct: number;
  entryPrice: number;
  currentPrice?: number;
  shares: number;
  riskFactors: string[];
  timeHorizon: string;
  analysisScore: number;
  analysis: ComprehensiveAnalysis;
  successProbability: number;
  status?: 'OPEN' | 'CLOSED';
  finalPnlPct?: number;
  entryDate?: string;
  exitDate?: string;
  createdAt?: string;
}

export interface PatternInsights {
  dimensionWeights: {
    executiveQuality: number;
    businessQuality: number;
    financialStrength: number;
    industryPosition: number;
    growthPotential: number;
    valuation: number;
    catalysts: number;
    riskAssessment: number;
  };
  winningPatterns: string[];
  losingPatterns: string[];
  optimalThresholds: {
    minOverallScore: number;
    minBusinessQuality: number;
    minFinancialStrength: number;
    minGrowthPotential: number;
  };
  probabilityModel: {
    highProbability: string[];
    mediumProbability: string[];
    lowProbability: string[];
  };
  recommendations: string[];
}

class AITipTrackerService {
  /**
   * Get all AI-generated signals
   */
  async getSignals(): Promise<AITipSignal[]> {
    try {
      const response = await fetch(`${API_URL}/api/intelligence/ai-tips`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch AI tips');
      const data = await response.json();
      return data.tips || [];
    } catch (error) {
      console.error('Failed to fetch AI tips:', error);
      return [];
    }
  }

  /**
   * Generate new signals from Intelligence Digest
   */
  async generateSignals(): Promise<{ signals: AITipSignal[]; count: number }> {
    try {
      const response = await fetch(`${API_URL}/api/intelligence/generate-signals`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to generate signals');
      const data = await response.json();
      return {
        signals: data.signals || [],
        count: data.count || 0
      };
    } catch (error) {
      console.error('Failed to generate signals:', error);
      throw error;
    }
  }

  /**
   * Get pattern insights from closed trades
   */
  async getPatternInsights(): Promise<PatternInsights | null> {
    try {
      const response = await fetch(`${API_URL}/api/intelligence/pattern-insights`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch pattern insights');
      const data = await response.json();
      return data.insights;
    } catch (error) {
      console.error('Failed to fetch pattern insights:', error);
      return null;
    }
  }

  /**
   * Run pattern analysis on closed trades
   */
  async analyzePatterns(): Promise<PatternInsights> {
    try {
      const response = await fetch(`${API_URL}/api/intelligence/analyze-patterns`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to analyze patterns');
      const data = await response.json();
      return data.insights;
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
      throw error;
    }
  }

  /**
   * Get success probability for a ticker
   */
  async getSuccessProbability(ticker: string): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/api/intelligence/success-probability/${ticker}`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch success probability');
      const data = await response.json();
      return parseFloat(data.successProbability) || 50;
    } catch (error) {
      console.error('Failed to fetch success probability:', error);
      return 50; // Default baseline
    }
  }

  /**
   * Update signal status
   */
  async updateSignalStatus(
    id: number, 
    status: 'OPEN' | 'CLOSED',
    exitPrice?: number,
    exitDate?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/intelligence/ai-tips/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, exitPrice, exitDate })
      });
      if (!response.ok) throw new Error('Failed to update signal status');
    } catch (error) {
      console.error('Failed to update signal status:', error);
      throw error;
    }
  }

  /**
   * Calculate current P/L for a signal
   */
  calculatePnL(signal: AITipSignal): { pnlPct: number; pnlDollars: number } {
    const currentPrice = signal.currentPrice || signal.entryPrice;
    const pnlPct = ((currentPrice - signal.entryPrice) / signal.entryPrice) * 100;
    const pnlDollars = (currentPrice - signal.entryPrice) * signal.shares;

    return { pnlPct, pnlDollars };
  }

  /**
   * Get dimension color based on score
   */
  getDimensionColor(score: number, maxScore: number): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get recommendation color
   */
  getRecommendationColor(recommendation: string): string {
    switch (recommendation) {
      case 'STRONG BUY':
      case 'BUY':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'HOLD':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'WATCH':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'SELL':
      case 'SHORT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  /**
   * Get success probability color
   */
  getProbabilityColor(probability: number): string {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 50) return 'text-blue-600';
    if (probability >= 30) return 'text-yellow-600';
    return 'text-red-600';
  }
}

export default new AITipTrackerService();
