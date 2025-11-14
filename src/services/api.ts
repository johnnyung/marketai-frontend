import { API_URL } from '../config/api';

export interface StockPrice {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

// Get stock price
export async function getStockPrice(ticker: string): Promise<StockPrice> {
  const response = await fetch(`${API_URL}/api/market/price/${ticker}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch stock price');
  }
  return response.json();
}

// Get multiple stock prices
export async function getBatchPrices(tickers: string[]): Promise<StockPrice[]> {
  const response = await fetch(`${API_URL}/api/market/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickers }),
  });
  if (!response.ok) throw new Error('Failed to fetch batch prices');
  return response.json();
}

// Get latest news
export async function getLatestNews(query?: string, limit?: number): Promise<NewsArticle[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (limit) params.append('limit', limit.toString());
  
  const response = await fetch(`${API_URL}/api/news/latest?${params}`);
  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
}

// AI chat
export async function sendChatMessage(messages: Array<{role: string, content: string}>) {
  const response = await fetch(`${API_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) throw new Error('Failed to send chat message');
  return response.json();
}

// Execute trade
export async function executeTrade(
  userId: string, 
  ticker: string, 
  action: 'buy' | 'sell', 
  shares: number, 
  price: number
) {
  const response = await fetch(`${API_URL}/api/game/trade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ticker, action, shares, price }),
  });
  if (!response.ok) throw new Error('Failed to execute trade');
  return response.json();
}

// Get portfolio
export async function getPortfolio(userId: string) {
  const response = await fetch(`${API_URL}/api/game/portfolio/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch portfolio');
  return response.json();
}

export const api = {
  getStockPrice,
  getBatchPrices,
  getLatestNews,
  sendChatMessage,
  executeTrade,
  getPortfolio,
};
