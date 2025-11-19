import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, Bell, RefreshCw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { useAuth } from '../contexts/AuthContext';
import { getStockPrice } from '../services/api';

import { API_URL } from '../config/api';

interface WatchlistItem {
  id: number;
  symbol: string;
  asset_type: string;
  notes: string;
  price_alert_high: number | null;
  price_alert_low: number | null;
  currentPrice?: number;
  priceChangePct?: number;
}

export function ResearchWatchlist({ density }: { density: 'comfort' | 'compact' }) {
  const { token } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ symbol: '', notes: '', alertHigh: '', alertLow: '' });

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(`${API_URL}/api/watchlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWatchlist(data);
      data.forEach((item: WatchlistItem) => updatePrice(item.symbol));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = async (symbol: string) => {
    try {
      const price = await getStockPrice(symbol);
      if (price) {
        setWatchlist(prev => prev.map(item => 
          item.symbol === symbol ? { ...item, currentPrice: price.price, priceChangePct: price.changePercent } : item
        ));
      }
    } catch (err) {}
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        symbol: form.symbol.toUpperCase(),
        assetType: 'stock',
        notes: form.notes,
        priceAlertHigh: form.alertHigh || null,
        priceAlertLow: form.alertLow || null
      })
    });
    setForm({ symbol: '', notes: '', alertHigh: '', alertLow: '' });
    setShowAdd(false);
    fetchWatchlist();
  };

  const handleRemove = async (symbol: string) => {
    if (!confirm(`Remove ${symbol}?`)) return;
    await fetch(`${API_URL}/api/watchlist/${symbol}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setWatchlist(prev => prev.filter(i => i.symbol !== symbol));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-600 dark:text-slate-400">Loading...</p></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Watchlist</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition"><Plus className="w-5 h-5" />Add</button>
      </div>

      {showAdd && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleAdd} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
          <input type="text" placeholder="Symbol" value={form.symbol} onChange={e => setForm({...form, symbol: e.target.value})} required className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="0.01" placeholder="Alert High" value={form.alertHigh} onChange={e => setForm({...form, alertHigh: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
            <input type="number" step="0.01" placeholder="Alert Low" value={form.alertLow} onChange={e => setForm({...form, alertLow: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div className="flex gap-3"><button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">Add</button><button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl">Cancel</button></div>
        </motion.form>
      )}

      {watchlist.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700"><p className="text-slate-600 dark:text-slate-400 mb-4">Watchlist empty</p><button onClick={() => setShowAdd(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">Add Symbol</button></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition">
              <div className="flex justify-between items-start mb-3">
                <div><h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.symbol}</h3><Badge tone="info">{item.asset_type}</Badge></div>
                <button onClick={() => handleRemove(item.symbol)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-600" /></button>
              </div>
              {item.currentPrice && (<div className="mb-3"><div className="text-2xl font-bold text-slate-900 dark:text-white">${item.currentPrice.toFixed(2)}</div><div className={`flex items-center gap-1 text-sm font-semibold ${(item.priceChangePct || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{(item.priceChangePct || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}{item.priceChangePct?.toFixed(2)}%</div></div>)}
              {item.notes && <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{item.notes}</p>}
              {(item.price_alert_high || item.price_alert_low) && <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-2 rounded-lg"><Bell className="w-3 h-3" /><span>Alerts: {item.price_alert_low && `$${item.price_alert_low}`}{item.price_alert_low && item.price_alert_high && ' - '}{item.price_alert_high && `$${item.price_alert_high}`}</span></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
