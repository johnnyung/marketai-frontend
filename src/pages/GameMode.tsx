import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Trophy, Target, Zap, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '../components/Badge';
import { clsx } from 'clsx';
import { getStockPrice } from '../services/api';

interface GameModeProps {
  density: 'comfort' | 'compact';
}

interface Position {
  id: string;
  ticker: string;
  company: string;
  shares: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: string;
}

interface Trade {
  id: string;
  ticker: string;
  action: 'buy' | 'sell';
  shares: number;
  price: number;
  date: string;
  profitLoss?: number;
}

const STARTING_CASH = 100000;

export function GameMode({ density }: GameModeProps) {
  const [cash, setCash] = useState(STARTING_CASH);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [newTrade, setNewTrade] = useState({
    ticker: '',
    shares: '',
    action: 'buy' as 'buy' | 'sell',
  });
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  const spacing = density === 'comfort' ? 'space-y-6' : 'space-y-4';
  const cardPadding = density === 'comfort' ? 'p-6' : 'p-4';

  // Fetch real price when ticker changes
  useEffect(() => {
    const fetchPrice = async () => {
      if (!newTrade.ticker || newTrade.ticker.length < 1) {
        setCurrentPrice(null);
        setPriceError(null);
        return;
      }

      setLoadingPrice(true);
      setPriceError(null);
      
      try {
        const priceData = await getStockPrice(newTrade.ticker.toUpperCase());
        setCurrentPrice(priceData.price);
      } catch (error: any) {
        setPriceError(error.message);
        setCurrentPrice(null);
      } finally {
        setLoadingPrice(false);
      }
    };

    const timer = setTimeout(fetchPrice, 500); // Debounce
    return () => clearTimeout(timer);
  }, [newTrade.ticker]);

  // Calculate portfolio value
  const portfolioValue = positions.reduce(
    (sum, pos) => sum + pos.shares * pos.currentPrice,
    0
  );
  const totalValue = cash + portfolioValue;
  const totalProfitLoss = totalValue - STARTING_CASH;
  const returnPercent = ((totalValue - STARTING_CASH) / STARTING_CASH) * 100;

  const handleBuy = async () => {
    const ticker = newTrade.ticker.toUpperCase();
    const shares = parseInt(newTrade.shares);

    if (!currentPrice) {
      alert('Please wait for price to load or check ticker symbol');
      return;
    }

    const price = currentPrice;
    const cost = shares * price;

    if (cost > cash) {
      alert(`Insufficient funds! You need $${cost.toFixed(2)} but only have $${cash.toFixed(2)}`);
      return;
    }

    // Add position or increase shares
    const existingPos = positions.find((p) => p.ticker === ticker);
    if (existingPos) {
      setPositions(
        positions.map((p) =>
          p.ticker === ticker
            ? {
                ...p,
                shares: p.shares + shares,
                buyPrice: (p.buyPrice * p.shares + price * shares) / (p.shares + shares),
              }
            : p
        )
      );
    } else {
      const companyNames: Record<string, string> = {
        ACHR: 'Archer Aviation',
        NVDA: 'NVIDIA',
        MSFT: 'Microsoft',
        TSLA: 'Tesla',
        AAPL: 'Apple',
      };
      setPositions([
        ...positions,
        {
          id: `pos-${Date.now()}`,
          ticker,
          company: companyNames[ticker] || ticker,
          shares,
          buyPrice: price,
          currentPrice: price,
          buyDate: new Date().toISOString().split('T')[0],
        },
      ]);
    }

    // Add trade record
    setTrades([
      {
        id: `trade-${Date.now()}`,
        ticker,
        action: 'buy',
        shares,
        price,
        date: new Date().toISOString().split('T')[0],
      },
      ...trades,
    ]);

    setCash(cash - cost);
    setShowBuyForm(false);
    setNewTrade({ ticker: '', shares: '', action: 'buy' });
    setCurrentPrice(null);
    alert(`✅ Bought ${shares} shares of ${ticker} at $${price.toFixed(2)}\n\nREAL MARKET PRICE! 🎉`);
  };

  const handleSell = (position: Position) => {
    const proceeds = position.shares * position.currentPrice;
    const profitLoss = proceeds - position.shares * position.buyPrice;

    // Add trade record
    setTrades([
      {
        id: `trade-${Date.now()}`,
        ticker: position.ticker,
        action: 'sell',
        shares: position.shares,
        price: position.currentPrice,
        date: new Date().toISOString().split('T')[0],
        profitLoss,
      },
      ...trades,
    ]);

    // Remove position
    setPositions(positions.filter((p) => p.id !== position.id));
    setCash(cash + proceeds);

    alert(
      `✅ Sold ${position.shares} shares of ${position.ticker} at $${position.currentPrice.toFixed(2)}\n\n` +
        `Profit/Loss: ${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)} (${((profitLoss / (position.shares * position.buyPrice)) * 100).toFixed(2)}%)`
    );
  };

  const getAIAdvice = (position: Position) => {
    const profitPercent = ((position.currentPrice - position.buyPrice) / position.buyPrice) * 100;
    let advice = '';

    if (profitPercent > 10) {
      advice = `🎯 Strong gain! Consider taking some profits. Set a stop-loss to protect gains.`;
    } else if (profitPercent > 5) {
      advice = `📈 Nice profit! Watch for resistance levels. Consider trailing stop-loss.`;
    } else if (profitPercent > 0) {
      advice = `✅ In the green. Hold if fundamentals remain strong. Set alert for 5% gain.`;
    } else if (profitPercent > -5) {
      advice = `⚠️ Small loss. Review your thesis - is it still valid? Don't panic sell on minor dips.`;
    } else {
      advice = `🚨 Significant loss. Reassess: cut losses or average down? Check news for catalysts.`;
    }

    alert(`AI Trading Coach - ${position.ticker}\n\n${advice}\n\n(Phase 2: Real-time AI analysis)`);
  };

  return (
    <div className={spacing}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Game Mode</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Paper Trading Simulator</p>
          </div>
        </div>
        <button onClick={() => setShowBuyForm(!showBuyForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Trade
        </button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`glass-card ${cardPadding}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cash</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${cash.toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`glass-card ${cardPadding}`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Portfolio Value</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${portfolioValue.toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`glass-card ${cardPadding}`}>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Total Value</p>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${totalValue.toLocaleString()}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`glass-card ${cardPadding}`}>
          <div className="flex items-center gap-2 mb-2">
            {totalProfitLoss >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">P&L</p>
          </div>
          <p className={clsx('text-2xl font-bold', totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600')}>
            {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString()} ({returnPercent >= 0 ? '+' : ''}
            {returnPercent.toFixed(2)}%)
          </p>
        </motion.div>
      </div>

      {/* Buy Form */}
      {showBuyForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`glass-card ${cardPadding} space-y-4`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">New Trade</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ticker</label>
              <input type="text" placeholder="AAPL" value={newTrade.ticker} onChange={(e) => setNewTrade({ ...newTrade, ticker: e.target.value })} className="input-field uppercase" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enter any stock ticker</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shares</label>
              <input type="number" placeholder="100" value={newTrade.shares} onChange={(e) => setNewTrade({ ...newTrade, shares: e.target.value })} className="input-field" />
            </div>
          </div>
          {newTrade.ticker && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              {loadingPrice ? (
                <p className="text-sm text-blue-700 dark:text-blue-300">⏳ Fetching real-time price...</p>
              ) : priceError ? (
                <p className="text-sm text-red-700 dark:text-red-300">❌ {priceError}</p>
              ) : currentPrice ? (
                <>
                  <p className="text-sm">
                    <strong>Current Market Price:</strong> ${currentPrice.toFixed(2)} 📈
                  </p>
                  {newTrade.shares && (
                    <p className="text-sm mt-1">
                      <strong>Total Cost:</strong> ${(parseInt(newTrade.shares) * currentPrice).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">✨ Real-time market data!</p>
                </>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter a ticker to see price</p>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleBuy} disabled={!newTrade.ticker || !newTrade.shares} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
              Buy Shares
            </button>
            <button onClick={() => setShowBuyForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Current Positions */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Current Positions</h3>
        <div className={spacing}>
          {positions.map((pos) => {
            const profitLoss = (pos.currentPrice - pos.buyPrice) * pos.shares;
            const profitPercent = ((pos.currentPrice - pos.buyPrice) / pos.buyPrice) * 100;
            const isProfit = profitLoss >= 0;

            return (
              <motion.div key={pos.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`glass-card ${cardPadding}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{pos.ticker}</h4>
                      <Badge tone="default">{pos.shares.toLocaleString()} shares</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{pos.company}</p>
                  </div>
                  <div className={clsx('flex items-center gap-1', isProfit ? 'text-emerald-600' : 'text-red-600')}>
                    {isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    <span className="text-xl font-bold">
                      {profitPercent >= 0 ? '+' : ''}
                      {profitPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Buy Price</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">${pos.buyPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Current Price</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">${pos.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Value</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">${(pos.shares * pos.currentPrice).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">P&L</p>
                    <p className={clsx('font-semibold', isProfit ? 'text-emerald-600' : 'text-red-600')}>
                      {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleSell(pos)} className="btn-secondary flex-1">
                    Sell All
                  </button>
                  <button onClick={() => getAIAdvice(pos)} className="btn-secondary flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    AI Advice
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trade History */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Trade History</h3>
        <div className={`glass-card ${cardPadding}`}>
          <div className="space-y-3">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <Badge tone={trade.action === 'buy' ? 'success' : 'danger'}>{trade.action.toUpperCase()}</Badge>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {trade.shares} {trade.ticker} @ ${trade.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{trade.date}</p>
                  </div>
                </div>
                {trade.profitLoss !== undefined && (
                  <p className={clsx('font-semibold', trade.profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                    {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase 2 Features */}
      <div className={`glass-card ${cardPadding} bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800`}>
        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🚀 Coming in Phase 2</h4>
        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
          <li>• Real-time price updates (live market data)</li>
          <li>• AI-powered trade suggestions</li>
          <li>• Leaderboard & achievements</li>
          <li>• Options trading simulation</li>
          <li>• Risk analysis & portfolio optimization</li>
          <li>• Market hours simulation (9:30am-4pm ET)</li>
        </ul>
      </div>
    </div>
  );
}
