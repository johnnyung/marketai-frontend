// src/services/api.ts - COMPLETE API Service
// Place this file at: ~/Desktop/marketai/src/services/api.ts

import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, buildApiUrl } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Retry logic for network errors
    if (!originalRequest._retry && error.code === 'ECONNABORTED') {
      originalRequest._retry = true;
      return api(originalRequest);
    }
    
    // Handle 401 - redirect to login
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// TYPE DEFINITIONS
// ========================================

export interface StockPrice {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
  source?: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

export interface AITip {
  id?: string;
  ticker: string;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence_score: number;
  reasoning: string;
  status: 'OPEN' | 'CLOSED';
  created_at?: string;
}

// ========================================
// V2.0 DATA COLLECTION (NEW)
// ========================================

export const dataCollectionService = {
  // Master collection - collects ALL data sources
  collectAll: async () => {
    const response = await api.post(API_ENDPOINTS.COLLECT.ALL);
    return response.data;
  },
  
  // Individual data source collection
  collectReddit: async () => {
    const response = await api.post(API_ENDPOINTS.COLLECT.REDDIT);
    return response.data;
  },
  
  collectNews: async () => {
    const response = await api.post(API_ENDPOINTS.COLLECT.NEWS);
    return response.data;
  },
  
  // Get collection status
  getCollectionStats: async () => {
    const response = await api.get(API_ENDPOINTS.COLLECT.STATS);
    return response.data;
  },
};

// ========================================
// V2.0 AI PROCESSING (NEW)
// ========================================

export const aiProcessingService = {
  // Process all collected data with AI
  processAll: async () => {
    const response = await api.post(API_ENDPOINTS.PROCESS.ALL);
    return response.data;
  },
  
  // Process individual sources
  processReddit: async () => {
    const response = await api.post(API_ENDPOINTS.PROCESS.REDDIT);
    return response.data;
  },
  
  processNews: async () => {
    const response = await api.post(API_ENDPOINTS.PROCESS.NEWS);
    return response.data;
  },
};

// ========================================
// AUTHENTICATION
// ========================================

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  
  register: async (email: string, password: string, name: string) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, { email, password, name });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  },
  
  getMe: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};

// ========================================
// DAILY INTELLIGENCE
// ========================================

export const intelligenceService = {
  getDailyIntelligence: async () => {
    const response = await api.get(API_ENDPOINTS.INTELLIGENCE.DAILY);
    return response.data;
  },
  
  generateDailyIntelligence: async () => {
    const response = await api.post(API_ENDPOINTS.INTELLIGENCE.GENERATE);
    return response.data;
  },
  
  getIntelligenceByDate: async (date: string) => {
    const response = await api.get(API_ENDPOINTS.INTELLIGENCE.BY_DATE(date));
    return response.data;
  },
  
  getIntelligenceThreads: async () => {
    const response = await api.get(API_ENDPOINTS.INTELLIGENCE.THREADS);
    return response.data;
  },
  
  generateIntelligenceThreads: async () => {
    const response = await api.post(API_ENDPOINTS.INTELLIGENCE.THREADS_GENERATE);
    return response.data;
  },
  
  getExecutiveSummary: async () => {
    const response = await api.get(API_ENDPOINTS.INTELLIGENCE.EXECUTIVE_SUMMARY);
    return response.data;
  },
};

// ========================================
// AI TIP TRACKER
// ========================================

export const aiTipTrackerService = {
  getSummary: async () => {
    const response = await api.get(API_ENDPOINTS.AI_TIPS.SUMMARY);
    return response.data;
  },
  
  getOpenPositions: async () => {
    const response = await api.get(API_ENDPOINTS.AI_TIPS.OPEN_POSITIONS);
    return response.data;
  },
  
  getClosedPositions: async () => {
    const response = await api.get(API_ENDPOINTS.AI_TIPS.CLOSED_POSITIONS);
    return response.data;
  },
  
  createTip: async (tipData: AITip) => {
    const response = await api.post(API_ENDPOINTS.AI_TIPS.CREATE, tipData);
    return response.data;
  },
  
  updateTip: async (id: string, updates: Partial<AITip>) => {
    const response = await api.put(API_ENDPOINTS.AI_TIPS.UPDATE(id), updates);
    return response.data;
  },
  
  updateAllPrices: async () => {
    const response = await api.post(API_ENDPOINTS.AI_TIPS.UPDATE_PRICES);
    return response.data;
  },
  
  getAnalytics: async () => {
    const response = await api.get(API_ENDPOINTS.AI_TIPS.ANALYTICS);
    return response.data;
  },
  
  autoTrack: async (recommendation: any) => {
    const response = await api.post(API_ENDPOINTS.AI_TIPS.AUTO_TRACK, recommendation);
    return response.data;
  },
};

// ========================================
// MARKET DATA
// ========================================

export const marketService = {
  getStockPrice: async (ticker: string): Promise<StockPrice> => {
    const response = await api.get(API_ENDPOINTS.MARKET.PRICE(ticker));
    return response.data;
  },
  
  getBatchPrices: async (tickers: string[]): Promise<StockPrice[]> => {
    const response = await api.post(API_ENDPOINTS.MARKET.BATCH, { tickers });
    return response.data;
  },
  
  testPrice: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.MARKET.TEST_PRICE(ticker));
    return response.data;
  },
  
  testPrices: async (tickers: string[]) => {
    const response = await api.post(API_ENDPOINTS.MARKET.TEST_PRICES, { tickers });
    return response.data;
  },
  
  getCacheStats: async () => {
    const response = await api.get(API_ENDPOINTS.MARKET.CACHE_STATS);
    return response.data;
  },
};

// ========================================
// DIGEST
// ========================================

export const digestService = {
  getEntries: async (date?: string) => {
    const params = date ? { date } : {};
    const response = await api.get(API_ENDPOINTS.DIGEST.ENTRIES, { params });
    return response.data;
  },
  
  getSummary: async () => {
    const response = await api.get(API_ENDPOINTS.DIGEST.SUMMARY);
    return response.data;
  },
  
  ingest: async () => {
    const response = await api.post(API_ENDPOINTS.DIGEST.INGEST);
    return response.data;
  },
  
  refresh: async () => {
    const response = await api.post(API_ENDPOINTS.DIGEST.REFRESH);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get(API_ENDPOINTS.DIGEST.STATS);
    return response.data;
  },
  
  cleanup: async () => {
    const response = await api.post(API_ENDPOINTS.DIGEST.CLEANUP);
    return response.data;
  },
};

// ========================================
// OPPORTUNITIES
// ========================================

export const opportunityService = {
  getOpportunities: async () => {
    const response = await api.get(API_ENDPOINTS.OPPORTUNITIES.LIST);
    return response.data;
  },
  
  getSignals: async () => {
    const response = await api.get(API_ENDPOINTS.OPPORTUNITIES.SIGNALS);
    return response.data;
  },
  
  scanForOpportunities: async () => {
    const response = await api.post(API_ENDPOINTS.OPPORTUNITIES.SCAN);
    return response.data;
  },
  
  analyzeOpportunity: async (opportunityId: string) => {
    const response = await api.post(API_ENDPOINTS.OPPORTUNITIES.ANALYZE, { opportunityId });
    return response.data;
  },
};

// ========================================
// NEWS
// ========================================

export const newsService = {
  getLatestNews: async (query?: string, limit?: number): Promise<NewsArticle[]> => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`${API_ENDPOINTS.NEWS.LATEST}?${params}`);
    return response.data;
  },
  
  searchNews: async (query: string) => {
    const response = await api.get(API_ENDPOINTS.NEWS.SEARCH, { params: { q: query } });
    return response.data;
  },
};

// ========================================
// DEEP DIVE
// ========================================

export const deepDiveService = {
  getDeepDive: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.DEEP_DIVE.TICKER(ticker));
    return response.data;
  },
  
  getCachedDeepDives: async () => {
    const response = await api.get(API_ENDPOINTS.DEEP_DIVE.CACHED);
    return response.data;
  },
  
  getEnhancedDeepDive: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.DEEP_DIVE.ENHANCED(ticker));
    return response.data;
  },
};

// ========================================
// SOCIAL INTELLIGENCE
// ========================================

export const socialService = {
  ingestSocialIntelligence: async () => {
    const response = await api.post(API_ENDPOINTS.SOCIAL.INGEST);
    return response.data;
  },
  
  getAITrendingTickers: async (limit: number = 10) => {
    const response = await api.get(`${API_ENDPOINTS.SOCIAL.TRENDING}?limit=${limit}`);
    return response.data;
  },
  
  getTickerIntelligence: async (ticker: string, days: number = 7) => {
    const response = await api.get(`${API_ENDPOINTS.SOCIAL.TICKER(ticker)}?days=${days}`);
    return response.data;
  },
  
  getSocialIntelligenceSummary: async () => {
    const response = await api.get(API_ENDPOINTS.SOCIAL.SUMMARY);
    return response.data;
  },
  
  getRedditPosts: async () => {
    const response = await api.get(API_ENDPOINTS.SOCIAL.REDDIT);
    return response.data;
  },
  
  getSentiment: async () => {
    const response = await api.get(API_ENDPOINTS.SOCIAL.SENTIMENT);
    return response.data;
  },
};

// ========================================
// TICKER VETTING
// ========================================

export const vettingService = {
  analyzeTicker: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.VETTING.ANALYZE(ticker));
    return response.data;
  },
  
  batchAnalyze: async (tickers: string[]) => {
    const response = await api.post(API_ENDPOINTS.VETTING.BATCH, { tickers });
    return response.data;
  },
};

// ========================================
// FUNDAMENTALS
// ========================================

export const fundamentalsService = {
  getVetting: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.FUNDAMENTALS.VETTING(ticker));
    return response.data;
  },
  
  getProfile: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.FUNDAMENTALS.PROFILE(ticker));
    return response.data;
  },
  
  getPrice: async (ticker: string) => {
    const response = await api.get(API_ENDPOINTS.FUNDAMENTALS.PRICE(ticker));
    return response.data;
  },
};

// ========================================
// PORTFOLIO
// ========================================

export const portfolioService = {
  getPortfolios: async () => {
    const response = await api.get(API_ENDPOINTS.PORTFOLIO.LIST);
    return response.data;
  },
  
  createPortfolio: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.PORTFOLIO.CREATE, data);
    return response.data;
  },
  
  getPerformance: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.PORTFOLIO.PERFORMANCE(id));
    return response.data;
  },
  
  getTrades: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.PORTFOLIO.TRADES(id));
    return response.data;
  },
};

// ========================================
// FUTURES
// ========================================

export const futuresService = {
  getContracts: async () => {
    const response = await api.get(API_ENDPOINTS.FUTURES.CONTRACTS);
    return response.data;
  },
  
  openPosition: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.FUTURES.OPEN, data);
    return response.data;
  },
  
  closePosition: async (data: any) => {
    const response = await api.post(API_ENDPOINTS.FUTURES.CLOSE, data);
    return response.data;
  },
  
  getPositions: async (portfolioId: string) => {
    const response = await api.get(API_ENDPOINTS.FUTURES.POSITIONS(portfolioId));
    return response.data;
  },
};

// ========================================
// AI CHAT
// ========================================

export const chatService = {
  sendChatMessage: async (messages: Array<{role: string, content: string}>) => {
    const response = await api.post(API_ENDPOINTS.CHAT.SEND, { messages });
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get(API_ENDPOINTS.CHAT.HISTORY);
    return response.data;
  },
  
  clearHistory: async () => {
    const response = await api.delete(API_ENDPOINTS.CHAT.CLEAR);
    return response.data;
  },
};

// ========================================
// GAME MODE
// ========================================

export const gameService = {
  executeTrade: async (
    userId: string, 
    ticker: string, 
    action: 'buy' | 'sell', 
    shares: number, 
    price: number
  ) => {
    const response = await api.post(API_ENDPOINTS.GAME.TRADE, { 
      userId, ticker, action, shares, price 
    });
    return response.data;
  },
  
  getPortfolio: async (userId: string) => {
    const response = await api.get(API_ENDPOINTS.GAME.PORTFOLIO(userId));
    return response.data;
  },
};

// ========================================
// SYSTEM
// ========================================

export const systemService = {
  getSystemStatus: async () => {
    const response = await api.get(API_ENDPOINTS.SYSTEM.STATUS);
    return response.data;
  },
  
  getHealth: async () => {
    const response = await api.get(API_ENDPOINTS.SYSTEM.HEALTH);
    return response.data;
  },
};

// Export axios instance for direct use
export { api };

// Export all services
export default {
  // V2.0 Services
  dataCollection: dataCollectionService,
  aiProcessing: aiProcessingService,
  
  // Core Services
  auth: authService,
  intelligence: intelligenceService,
  aiTipTracker: aiTipTrackerService,
  market: marketService,
  digest: digestService,
  opportunities: opportunityService,
  news: newsService,
  deepDive: deepDiveService,
  social: socialService,
  vetting: vettingService,
  fundamentals: fundamentalsService,
  portfolio: portfolioService,
  futures: futuresService,
  chat: chatService,
  game: gameService,
  system: systemService,
  
  // Direct API access
  api,
  
  // Legacy exports for backward compatibility
  getStockPrice: marketService.getStockPrice,
  getBatchPrices: marketService.getBatchPrices,
  getLatestNews: newsService.getLatestNews,
  sendChatMessage: chatService.sendChatMessage,
  executeTrade: gameService.executeTrade,
  getPortfolio: gameService.getPortfolio,
  ingestSocialIntelligence: socialService.ingestSocialIntelligence,
  getAITrendingTickers: socialService.getAITrendingTickers,
  getTickerIntelligence: socialService.getTickerIntelligence,
  getSocialIntelligenceSummary: socialService.getSocialIntelligenceSummary,
  collectReddit: dataCollectionService.collectReddit,
  collectNews: dataCollectionService.collectNews,
  collectAll: dataCollectionService.collectAll,
  processReddit: aiProcessingService.processReddit,
  processNews: aiProcessingService.processNews,
  processAll: aiProcessingService.processAll,
  getCollectionStats: dataCollectionService.getCollectionStats,
};
// Add this to the END of your src/services/api.ts file
// This provides backward compatibility for components using old imports

// BACKWARD COMPATIBILITY EXPORTS
// Add these individual function exports for components still using them
export const getStockPrice = marketService.getStockPrice;
export const getBatchPrices = marketService.getBatchPrices;
export const getLatestNews = newsService.getLatestNews;
export const sendChatMessage = chatService.sendChatMessage;
export const executeTrade = gameService.executeTrade;
export const getPortfolio = gameService.getPortfolio;
export const ingestSocialIntelligence = socialService.ingestSocialIntelligence;
export const getAITrendingTickers = socialService.getAITrendingTickers;
export const getTickerIntelligence = socialService.getTickerIntelligence;
export const getSocialIntelligenceSummary = socialService.getSocialIntelligenceSummary;
export const collectReddit = dataCollectionService.collectReddit;
export const collectNews = dataCollectionService.collectNews;
export const collectAll = dataCollectionService.collectAll;
export const processReddit = aiProcessingService.processReddit;
export const processNews = aiProcessingService.processNews;
export const processAll = aiProcessingService.processAll;
export const getCollectionStats = dataCollectionService.getCollectionStats;
// Add this to the END of your src/services/api.ts file
// This provides backward compatibility for components using old imports

// BACKWARD COMPATIBILITY EXPORTS
// Add these individual function exports for components still using them
