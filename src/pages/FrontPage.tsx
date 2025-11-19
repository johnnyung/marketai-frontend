import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../components/Badge';
import { Sparkles, Zap, ExternalLink, Clock } from 'lucide-react';

const API_URL = 'https://marketai-backend-production-397e.up.railway.app';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  urlToImage?: string;
}

interface FrontPageProps {
  density: 'comfort' | 'compact';
}

export function FrontPage({ density }: FrontPageProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [headlines, setHeadlines] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const spacing = density === 'comfort' ? 'space-y-10' : 'space-y-6';
  const cardPadding = density === 'comfort' ? 'p-8' : 'p-6';

  // Fetch real news from backend
  useEffect(() => {
    async function fetchNews() {
      try {
        // Fetch latest financial news
        const newsResponse = await fetch(`${API_URL}/api/news/latest?q=stock+market+trading&limit=8`);
        const newsData = await newsResponse.json();
        setNews(newsData || []);

        // Fetch top headlines
        const headlinesResponse = await fetch(`${API_URL}/api/news/headlines?category=business&limit=5`);
        const headlinesData = await headlinesResponse.json();
        setHeadlines(headlinesData || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading latest news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={spacing}>
      {/* Top Headlines */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-0">Top Headlines</h2>
          <Badge tone="success">LIVE</Badge>
        </div>
        <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 ${cardPadding} space-y-4`}>
          {headlines.length > 0 ? headlines.map((article, idx) => (
            <motion.a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 group hover:bg-slate-50 dark:hover:bg-slate-700/50 p-4 rounded-xl transition-all"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <span className="flex-shrink-0 mt-1 w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 group-hover:scale-150 transition-transform" />
              <div className="flex-1">
                <p className="text-slate-900 dark:text-white font-semibold leading-relaxed group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{article.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 mt-1" />
            </motion.a>
          )) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">
              No headlines available. Check your NewsAPI key configuration.
            </p>
          )}
        </div>
      </motion.section>

      {/* Market News */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50" />
            <div className="relative p-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-0">Latest Market News</h2>
          <Badge tone="info">Real-Time</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.length > 0 ? news.map((article, idx) => (
            <motion.a
              key={idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              {article.urlToImage && (
                <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className={cardPadding}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge tone="info">{article.source}</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(article.publishedAt)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-4 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  Read more
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </motion.a>
          )) : (
            <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No news available. Check your NewsAPI key configuration in Railway.
              </p>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
