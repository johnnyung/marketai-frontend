// src/config/api.ts - UPDATED with backward compatibility
// Place this file at: ~/Desktop/marketai/src/config/api.ts

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Single source of truth for API endpoints
export const API_CONFIG = {
  // Backend URL - automatically switches between dev and prod
  BASE_URL: isProduction 
    ? 'https://marketai-backend-production-397e.up.railway.app'
    : 'http://localhost:3001',
  
  // API timeout settings
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// BACKWARD COMPATIBILITY - Export API_URL for existing components
export const API_URL = API_CONFIG.BASE_URL;

// API Endpoints - organized by feature
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  
  // V2.0 Data Collection
  COLLECT: {
    ALL: '/api/collect/all',
    REDDIT: '/api/collect/reddit',
    NEWS: '/api/collect/news',
    STATS: '/api/collect/stats',
  },
  
  // V2.0 AI Processing
  PROCESS: {
    ALL: '/api/process/all',
    REDDIT: '/api/process/reddit',
    NEWS: '/api/process/news',
  },
  
  // Daily Intelligence
  INTELLIGENCE: {
    DAILY: '/api/intelligence/daily/latest',
    GENERATE: '/api/intelligence/daily/generate',
    BY_DATE: (date: string) => `/api/intelligence/daily/${date}`,
    THREADS: '/api/intelligence/threads',
    THREADS_GENERATE: '/api/intelligence/threads/generate',
    EXECUTIVE_SUMMARY: '/api/intelligence/executive-summary',
  },
  
  // AI Tip Tracker
  AI_TIPS: {
    SUMMARY: '/api/ai-tip-tracker/summary',
    OPEN_POSITIONS: '/api/ai-tip-tracker/positions/open',
    CLOSED_POSITIONS: '/api/ai-tip-tracker/positions/closed',
    CREATE: '/api/ai-tip-tracker/create',
    UPDATE: (id: string) => `/api/ai-tip-tracker/${id}`,
    UPDATE_PRICES: '/api/tip-tracker/update-prices',
    ANALYTICS: '/api/ai-tip-tracker/analytics',
    AUTO_TRACK: '/api/auto-tip-tracker/track',
  },
  
  // Digest
  DIGEST: {
    ENTRIES: '/api/digest/entries',
    SUMMARY: '/api/digest/summary',
    INGEST: '/api/digest/ingest',
    REFRESH: '/api/digest/refresh',
    STATS: '/api/digest/stats',
    CLEANUP: '/api/digest/cleanup',
  },
  
  // Opportunities
  OPPORTUNITIES: {
    LIST: '/api/opportunities',
    SIGNALS: '/api/opportunities/signals',
    SCAN: '/api/opportunities/scan',
    ANALYZE: '/api/opportunities/analyze',
  },
  
  // Market Data
  MARKET: {
    PRICE: (ticker: string) => `/api/market/price/${ticker}`,
    BATCH: '/api/market/batch',
    TEST_PRICE: (ticker: string) => `/api/test/price/${ticker}`,
    TEST_PRICES: '/api/test/prices',
    CACHE_STATS: '/api/test/cache-stats',
  },
  
  // News
  NEWS: {
    LATEST: '/api/news/latest',
    SEARCH: '/api/news/search',
  },
  
  // Deep Dive
  DEEP_DIVE: {
    TICKER: (ticker: string) => `/api/deep-dive/${ticker}`,
    CACHED: '/api/deep-dive/cached',
    ENHANCED: (ticker: string) => `/api/enhanced-deep-dive/${ticker}`,
  },
  
  // Social Intelligence
  SOCIAL: {
    REDDIT: '/api/social/reddit',
    SENTIMENT: '/api/social/sentiment',
    TRENDING: '/api/social-intelligence/trending',
    TICKER: (ticker: string) => `/api/social-intelligence/ticker/${ticker}`,
    SUMMARY: '/api/social-intelligence/summary',
    INGEST: '/api/social-intelligence/ingest',
  },
  
  // Ticker Vetting
  VETTING: {
    ANALYZE: (ticker: string) => `/api/vetting/${ticker}`,
    BATCH: '/api/vetting/batch',
  },
  
  // Fundamentals
  FUNDAMENTALS: {
    VETTING: (ticker: string) => `/api/fundamentals/vetting/${ticker}`,
    PROFILE: (ticker: string) => `/api/fundamentals/profile/${ticker}`,
    PRICE: (ticker: string) => `/api/fundamentals/price/${ticker}`,
  },
  
  // Portfolio
  PORTFOLIO: {
    LIST: '/api/portfolio',
    CREATE: '/api/portfolio',
    PERFORMANCE: (id: string) => `/api/portfolio/${id}/performance`,
    TRADES: (id: string) => `/api/portfolio/${id}/trades`,
    POSITIONS: '/api/portfolio/positions',
  },
  
  // Futures Trading
  FUTURES: {
    CONTRACTS: '/api/futures/contracts',
    OPEN: '/api/futures/open',
    CLOSE: '/api/futures/close',
    POSITIONS: (portfolioId: string) => `/api/futures/positions/${portfolioId}`,
  },
  
  // Trade Journal
  JOURNAL: {
    ENTRIES: '/api/journal',
    CREATE: '/api/journal',
    UPDATE: (id: string) => `/api/journal/${id}`,
    DELETE: (id: string) => `/api/journal/${id}`,
  },
  
  // Watchlist
  WATCHLIST: {
    LIST: '/api/watchlist',
    ADD: '/api/watchlist',
    REMOVE: (ticker: string) => `/api/watchlist/${ticker}`,
  },
  
  // Learning Lab
  LEARNING: {
    MODULES: '/api/learning/modules',
    PROGRESS: '/api/learning/progress',
    COMPLETE: (moduleId: string) => `/api/learning/complete/${moduleId}`,
  },
  
  // Calendar
  CALENDAR: {
    UPCOMING: '/api/calendar/upcoming',
    FETCH: '/api/calendar/fetch',
    EVENTS: '/api/events',
  },
  
  // Cache Management
  CACHE: {
    STATUS: '/api/cache/status',
    CLEAR: '/api/cache/clear',
    REFRESH: '/api/cache/refresh',
  },
  
  // System
  SYSTEM: {
    STATUS: '/api/system/status',
    HEALTH: '/health',
  },
  
  // AI Chat
  CHAT: {
    SEND: '/api/ai/chat',
    HISTORY: '/api/chat/history',
    CLEAR: '/api/chat/clear',
  },
  
  // Game Mode
  GAME: {
    TRADE: '/api/game/trade',
    PORTFOLIO: (userId: string) => `/api/game/portfolio/${userId}`,
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export default for backward compatibility
export default API_CONFIG;
