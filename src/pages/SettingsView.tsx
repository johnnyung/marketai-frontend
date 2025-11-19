import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, EyeOff, DollarSign, Key } from 'lucide-react';
import { Badge } from '../components/Badge';

interface SettingsViewProps {
  density: 'comfort' | 'compact';
}

const SETTINGS_KEY = 'marketai_settings';

export function SettingsView({ density }: SettingsViewProps) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(10);
  const [saved, setSaved] = useState(false);
  
  const cardPadding = density === 'comfort' ? 'p-6' : 'p-4';

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setApiKey(settings.claudeApiKey || '');
        setMonthlyBudget(settings.monthlyBudget || 10);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    const settings = {
      claudeApiKey: apiKey,
      monthlyBudget,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Settings
      </h2>

      {/* AI Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card ${cardPadding} space-y-6`}
      >
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
          <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            AI Configuration
          </h3>
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Claude API Key
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="input-field pr-10"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Get your API key from{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Anthropic Console
            </a>
          </p>
        </div>

        {/* Monthly Budget */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Monthly AI Budget
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                min="1"
                max="100"
                className="input-field"
              />
            </div>
            <Badge tone="info">
              <DollarSign className="w-3 h-3 mr-1" />
              ${monthlyBudget}/month
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            System will pause AI features when budget is reached. Resets monthly.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </motion.div>

      {/* Other Settings Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-card ${cardPadding} space-y-4`}
      >
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Additional Settings
        </h3>
        
        <div className="space-y-3 text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span>Alert Channels</span>
            <Badge tone="default">Coming Soon</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span>Default Morning Time</span>
            <Badge tone="default">Coming Soon</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
            <span>Watchlist Privacy</span>
            <Badge tone="default">Coming Soon</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Source Manager</span>
            <Badge tone="default">Coming Soon</Badge>
          </div>
        </div>
      </motion.div>

      {/* Cost Estimate Info */}
      <div className={`glass-card ${cardPadding} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`}>
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Cost Estimate
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Typical usage: 300-500 AI questions per month = $5-8. Your ${monthlyBudget} budget provides comfortable headroom for daily research and learning.
        </p>
      </div>
    </div>
  );
}
