// src/config/dataCollectionConfig.ts
// Complete configuration for all MarketAI V2 data sources

export const DATA_SOURCES = {
  // Financial News & RSS
  NEWS: {
    enabled: true,
    sources: [
      { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', type: 'rss' },
      { name: 'Reuters', url: 'https://www.reuters.com/markets', type: 'scrape' },
      { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', type: 'rss' },
      { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch', type: 'rss' },
      { name: 'WSJ Markets', url: 'https://feeds.wsj.com/wsj/xml/rss', type: 'rss' },
      { name: 'Yahoo Finance', url: 'https://feeds.finance.yahoo.com/rss/2.0/headline', type: 'rss' },
      { name: 'Seeking Alpha', url: 'https://seekingalpha.com/market_currents.xml', type: 'rss' },
      { name: 'Financial Times', url: 'https://www.ft.com', type: 'scrape' }
    ],
    frequency: '15 minutes',
    priority: 'high'
  },

  // Cryptocurrency Impact
  CRYPTO: {
    enabled: true,
    sources: [
      { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss', type: 'rss' },
      { name: 'CryptoCompare', api: 'CRYPTOCOMPARE_API', type: 'api' },
      { name: 'Bitcoin correlation', tickers: ['MSTR', 'COIN', 'RIOT', 'MARA', 'SQ', 'PYPL'] },
      { name: 'DeFi Pulse', url: 'https://defipulse.com', type: 'scrape' },
      { name: 'Glassnode', api: 'GLASSNODE_API', type: 'api' }
    ],
    frequency: '30 minutes',
    priority: 'medium'
  },

  // Executive Team Changes
  EXECUTIVES: {
    enabled: true,
    sources: [
      { name: 'SEC Form 8-K', filing: 'Item 5.02', type: 'edgar' },
      { name: 'PR Newswire', url: 'https://www.prnewswire.com', type: 'scrape' },
      { name: 'Business Wire', url: 'https://www.businesswire.com', type: 'scrape' },
      { name: 'LinkedIn Updates', api: 'LINKEDIN_API', type: 'api' },
      { name: 'Executive Alerts', custom: true }
    ],
    frequency: '1 hour',
    priority: 'high'
  },

  // SEC Filings & Public Documents
  FILINGS: {
    enabled: true,
    sources: [
      { name: '10-K Annual', filing: '10-K', type: 'edgar' },
      { name: '10-Q Quarterly', filing: '10-Q', type: 'edgar' },
      { name: '8-K Events', filing: '8-K', type: 'edgar' },
      { name: 'S-1 Registration', filing: 'S-1', type: 'edgar' },
      { name: 'DEF 14A Proxy', filing: 'DEF 14A', type: 'edgar' },
      { name: '13F Holdings', filing: '13F-HR', type: 'edgar' },
      { name: 'Form 4 Insider', filing: '4', type: 'edgar' },
      { name: 'Schedule 13D/G', filing: '13D', type: 'edgar' }
    ],
    frequency: '30 minutes',
    priority: 'critical'
  },

  // Mergers & Acquisitions
  MERGERS: {
    enabled: true,
    sources: [
      { name: 'SEC DEFM14A', filing: 'DEFM14A', type: 'edgar' },
      { name: 'M&A Database', api: 'MERGR_API', type: 'api' },
      { name: 'SPAC Tracker', url: 'https://spactrack.io', type: 'scrape' },
      { name: 'Merger Arbitrage', custom: true },
      { name: 'Deal Pipeline', api: 'DEALOGIC_API', type: 'api' }
    ],
    frequency: '1 hour',
    priority: 'high'
  },

  // Interest Rates & Fed Data
  RATES: {
    enabled: true,
    sources: [
      { name: 'Fed Funds Rate', api: 'FRED_API', series: 'DFF', type: 'api' },
      { name: '10Y Treasury', api: 'FRED_API', series: 'DGS10', type: 'api' },
      { name: '2Y Treasury', api: 'FRED_API', series: 'DGS2', type: 'api' },
      { name: 'Fed Minutes', url: 'https://www.federalreserve.gov', type: 'scrape' },
      { name: 'CME FedWatch', url: 'https://www.cmegroup.com/tools/fedwatch', type: 'scrape' }
    ],
    frequency: '15 minutes',
    priority: 'critical'
  },

  // Major Events (CES, WWDC, etc)
  EVENTS: {
    enabled: true,
    sources: [
      { name: 'CES', dates: ['2025-01-07', '2025-01-10'], url: 'https://www.ces.tech' },
      { name: 'WWDC', dates: ['2025-06-05', '2025-06-09'], url: 'https://developer.apple.com' },
      { name: 'Google I/O', dates: ['2025-05-14', '2025-05-15'], url: 'https://events.google.com' },
      { name: 'AWS re:Invent', dates: ['2025-12-02', '2025-12-06'], url: 'https://reinvent.awsevents.com' },
      { name: 'FOMC Meetings', schedule: 'fed_calendar', type: 'calendar' },
      { name: 'Earnings Season', schedule: 'quarterly', type: 'calendar' }
    ],
    frequency: 'event-driven',
    priority: 'high'
  },

  // Insider Trading
  INSIDER: {
    enabled: true,
    sources: [
      { name: 'Form 4', filing: '4', type: 'edgar' },
      { name: 'Form 144', filing: '144', type: 'edgar' },
      { name: 'OpenInsider', url: 'http://openinsider.com', type: 'scrape' },
      { name: 'InsiderTracking', api: 'custom', type: 'api' },
      { name: 'Whale Wisdom', url: 'https://whalewisdom.com', type: 'scrape' }
    ],
    frequency: '30 minutes',
    priority: 'high'
  },

  // Social Media & Sentiment
  SOCIAL: {
    enabled: true,
    sources: [
      { name: 'Reddit WSB', subreddit: 'wallstreetbets', type: 'reddit' },
      { name: 'StockTwits', api: 'STOCKTWITS_API', type: 'api' },
      { name: 'Twitter/X Finance', keywords: ['$SPY', '$QQQ', 'stocks'], type: 'twitter' },
      { name: 'TikTok FinTok', hashtags: ['fintok', 'stocks'], type: 'tiktok' },
      { name: 'Discord Servers', custom: true }
    ],
    frequency: '10 minutes',
    priority: 'medium'
  },

  // Market Titans Tracking
  TITANS: {
    enabled: true,
    sources: [
      { name: 'Elon Musk', handle: '@elonmusk', companies: ['TSLA', 'TWTR'] },
      { name: 'Warren Buffett', company: 'BRK', filings: '13F' },
      { name: 'Cathie Wood', company: 'ARK', etfs: ['ARKK', 'ARKQ', 'ARKW'] },
      { name: 'Bill Ackman', company: 'PSH', handle: '@BillAckman' },
      { name: 'Ray Dalio', company: 'Bridgewater', custom: true },
      { name: 'Jeff Bezos', company: 'AMZN', filings: 'Form 4' }
    ],
    frequency: '30 minutes',
    priority: 'high'
  },

  // Geopolitical & Wars
  GEOPOLITICAL: {
    enabled: true,
    sources: [
      { name: 'Reuters World', url: 'https://www.reuters.com/world', type: 'scrape' },
      { name: 'AP International', url: 'https://apnews.com/hub/international-news', type: 'scrape' },
      { name: 'BBC World', url: 'https://www.bbc.com/news/world', type: 'scrape' },
      { name: 'Conflict Tracker', api: 'ACLED_API', type: 'api' },
      { name: 'Oil Impact', tickers: ['USO', 'XLE', 'CVX', 'XOM'] }
    ],
    frequency: '30 minutes',
    priority: 'medium'
  },

  // Economic Indicators
  ECONOMIC: {
    enabled: true,
    sources: [
      { name: 'GDP', api: 'FRED_API', series: 'GDP', type: 'api' },
      { name: 'CPI', api: 'FRED_API', series: 'CPIAUCSL', type: 'api' },
      { name: 'Unemployment', api: 'FRED_API', series: 'UNRATE', type: 'api' },
      { name: 'PMI', api: 'ISM_API', type: 'api' },
      { name: 'Consumer Sentiment', api: 'UMICH_API', type: 'api' },
      { name: 'Housing Starts', api: 'FRED_API', series: 'HOUST', type: 'api' }
    ],
    frequency: 'daily',
    priority: 'high'
  },

  // Options Flow
  OPTIONS: {
    enabled: true,
    sources: [
      { name: 'Unusual Options', api: 'UNUSUALWHALES_API', type: 'api' },
      { name: 'Flow Algo', api: 'FLOWALGO_API', type: 'api' },
      { name: 'Dark Pool', api: 'SQUEEZEMETRICS_API', type: 'api' },
      { name: 'Put/Call Ratio', api: 'CBOE_API', type: 'api' },
      { name: 'Gamma Exposure', custom: true }
    ],
    frequency: '5 minutes',
    priority: 'critical'
  },

  // Political & Regulatory
  POLITICAL: {
    enabled: true,
    sources: [
      { name: 'White House', url: 'https://www.whitehouse.gov/briefing-room', type: 'scrape' },
      { name: 'Congress Bills', api: 'CONGRESS_API', type: 'api' },
      { name: 'SEC Proposals', url: 'https://www.sec.gov/rules/proposed', type: 'scrape' },
      { name: 'Trump Tracker', handle: '@realDonaldTrump', platform: 'truth' },
      { name: 'Policy Changes', custom: true }
    ],
    frequency: '1 hour',
    priority: 'medium'
  }
};

// API Keys Configuration
export const API_KEYS = {
  ALPHA_VANTAGE: process.env.ALPHA_VANTAGE_API_KEY,
  FRED_API: process.env.FRED_API_KEY,
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
  TWITTER_BEARER: process.env.TWITTER_BEARER_TOKEN,
  CRYPTOCOMPARE_API: process.env.CRYPTOCOMPARE_API_KEY,
  POLYGON_IO: process.env.POLYGON_API_KEY,
  NEWSAPI: process.env.NEWS_API_KEY,
  ANTHROPIC: process.env.ANTHROPIC_API_KEY
};

// Collection Schedule
export const COLLECTION_SCHEDULE = {
  CRITICAL: ['FILINGS', 'RATES', 'OPTIONS'],  // Every 5-15 minutes
  HIGH: ['NEWS', 'EXECUTIVES', 'INSIDER', 'MERGERS', 'TITANS', 'ECONOMIC'],  // Every 30-60 minutes
  MEDIUM: ['CRYPTO', 'SOCIAL', 'GEOPOLITICAL', 'POLITICAL'],  // Every 1-2 hours
  LOW: ['EVENTS']  // Event-driven or daily
};

// Database Tables for each source
export const DB_TABLES = {
  NEWS: 'news_articles',
  CRYPTO: 'crypto_impacts',
  EXECUTIVES: 'executive_changes',
  FILINGS: 'sec_filings',
  MERGERS: 'merger_activity',
  RATES: 'interest_rates',
  EVENTS: 'major_events',
  INSIDER: 'insider_trading',
  SOCIAL: 'social_sentiment',
  TITANS: 'titan_activity',
  GEOPOLITICAL: 'geopolitical_events',
  ECONOMIC: 'economic_indicators',
  OPTIONS: 'options_flow',
  POLITICAL: 'political_news'
};

export default DATA_SOURCES;
