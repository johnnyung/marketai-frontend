import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap, Plus, X } from 'lucide-react';
import { Badge } from '../components/Badge';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

interface FuturesContract {
  symbol: string;
  name: string;
  multiplier: number;
  tick_size: number;
  tick_value: number;
  initial_margin: number;
  maintenance_margin: number;
  day_trade_margin: number;
  description: string;
}

interface FuturesPosition {
  id: number;
  symbol: string;
  contract_month: string;
  contracts: number;
  entry_price: number;
  current_price: number;
  multiplier: number;
  unrealized_pnl: number;
  margin_per_contract: number;
}

interface FuturesTradingProps {
  density: 'comfort' | 'compact';
}

export function FuturesTrading({ density }: FuturesTradingProps) {
  const { token } = useAuth();
  const [contracts, setContracts] = useState<FuturesContract[]>([]);
  const [positions, setPositions] = useState<FuturesPosition[]>([]);
  const [selectedContract, setSelectedContract] = useState<FuturesContract | null>(null);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [portfolioId, setPortfolioId] = useState(1); // Default portfolio
  
  const [tradeForm, setTradeForm] = useState({
    contracts: '',
    entryPrice: '',
    contractMonth: 'Dec2024',
    isDayTrade: false,
  });

  const spacing = density === 'comfort' ? 'space-y-6' : 'space-y-4';
  const cardPadding = density === 'comfort' ? 'p-6' : 'p-4';

  // Load futures contracts
  useEffect(() => {
    const loadContracts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/futures/contracts`);
        const data = await response.json();
        setContracts(data);
      } catch (error) {
        console.error('Failed to load contracts:', error);
      }
    };

    loadContracts();
  }, []);

  // Load positions
  useEffect(() => {
    if (!token) return;

    const loadPositions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/futures/positions/${portfolioId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        console.error('Failed to load positions:', error);
      }
    };

    loadPositions();
  }, [token, portfolioId]);

  const handleOpenPosition = async () => {
    if (!selectedContract || !token) return;

    try {
      const response = await fetch(`${API_URL}/api/futures/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          portfolioId,
          symbol: selectedContract.symbol,
          contractMonth: tradeForm.contractMonth,
          contracts: parseInt(tradeForm.contracts),
          entryPrice: parseFloat(tradeForm.entryPrice),
          isDayTrade: tradeForm.isDayTrade,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Error: ${error.error}`);
        return;
      }

      const data = await response.json();
      alert(`✅ Opened ${tradeForm.contracts} ${selectedContract.symbol} contracts!`);
      
      // Reset form
      setShowTradeForm(false);
      setTradeForm({ contracts: '', entryPrice: '', contractMonth: 'Dec2024', isDayTrade: false });
      
      // Reload positions
      window.location.reload();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  const calculateMargin = () => {
    if (!selectedContract || !tradeForm.contracts) return 0;
    
    const margin = tradeForm.isDayTrade 
      ? selectedContract.day_trade_margin 
      : selectedContract.initial_margin;
    
    return parseInt(tradeForm.contracts) * margin;
  };

  const calculateNotionalValue = () => {
    if (!selectedContract || !tradeForm.entryPrice || !tradeForm.contracts) return 0;
    
    return parseFloat(tradeForm.entryPrice) * selectedContract.multiplier * parseInt(tradeForm.contracts);
  };

  return (
    <div className={clsx('p-6', spacing)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Futures Trading</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Trade futures contracts with real margin requirements
          </p>
        </div>
        <button
          onClick={() => setShowTradeForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Position
        </button>
      </div>

      {/* Positions */}
      {positions.length > 0 && (
        <div className={clsx('card', cardPadding, 'mb-6')}>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Open Positions
          </h2>
          <div className="space-y-3">
            {positions.map((pos) => (
              <div
                key={pos.id}
                className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{pos.symbol}</span>
                    <Badge tone={pos.contracts > 0 ? 'success' : 'danger'}>
                      {pos.contracts > 0 ? 'LONG' : 'SHORT'} {Math.abs(pos.contracts)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Entry: ${pos.entry_price} | Current: ${pos.current_price}
                  </p>
                </div>
                <div className="text-right">
                  <div className={clsx(
                    'text-lg font-bold',
                    Number(pos.unrealized_pnl) >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {Number(pos.unrealized_pnl) >= 0 ? '+' : ''}${Number(pos.unrealized_pnl).toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-500">Unrealized P&L</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Contracts */}
      <div className={clsx('card', cardPadding)}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Available Contracts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contracts.map((contract) => (
            <motion.div
              key={contract.symbol}
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl cursor-pointer border-2 border-transparent hover:border-blue-500 transition"
              onClick={() => {
                setSelectedContract(contract);
                setShowTradeForm(true);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {contract.symbol}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{contract.name}</p>
                </div>
                <Zap className="w-5 h-5 text-blue-600" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Multiplier:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${contract.multiplier}/point
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Initial Margin:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ${contract.initial_margin.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Day Trade:</span>
                  <span className="font-semibold text-green-600">
                    ${contract.day_trade_margin.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                {contract.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trade Form Modal */}
      {showTradeForm && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Open {selectedContract.symbol} Position
              </h2>
              <button
                onClick={() => setShowTradeForm(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Contracts
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    value={tradeForm.contracts}
                    onChange={(e) => setTradeForm({ ...tradeForm, contracts: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Entry Price
                  </label>
                  <input
                    type="number"
                    placeholder="5000"
                    step="0.25"
                    value={tradeForm.entryPrice}
                    onChange={(e) => setTradeForm({ ...tradeForm, entryPrice: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contract Month
                </label>
                <select
                  value={tradeForm.contractMonth}
                  onChange={(e) => setTradeForm({ ...tradeForm, contractMonth: e.target.value })}
                  className="input-field"
                >
                  <option value="Dec2024">December 2024</option>
                  <option value="Mar2025">March 2025</option>
                  <option value="Jun2025">June 2025</option>
                  <option value="Sep2025">September 2025</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dayTrade"
                  checked={tradeForm.isDayTrade}
                  onChange={(e) => setTradeForm({ ...tradeForm, isDayTrade: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="dayTrade" className="text-sm text-slate-700 dark:text-slate-300">
                  Day Trade (50% margin reduction)
                </label>
              </div>

              {/* Calculations */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Margin Required:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${calculateMargin().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Notional Value:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${calculateNotionalValue().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Leverage:</span>
                  <span className="font-bold text-purple-600">
                    {calculateMargin() > 0 
                      ? `${(calculateNotionalValue() / calculateMargin()).toFixed(1)}x`
                      : '-'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenPosition}
                disabled={!tradeForm.contracts || !tradeForm.entryPrice}
                className="btn-primary w-full"
              >
                Open Position
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
