// frontend/src/components/RefreshDataButton.tsx
// Global "Refresh All Data" button that can be used anywhere

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface RefreshDataButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  showText?: boolean;
  onSuccess?: () => void;
}

const RefreshDataButton: React.FC<RefreshDataButtonProps> = ({
  size = 'md',
  variant = 'primary',
  showText = true,
  onSuccess
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleRefresh = async () => {
    if (refreshing) return;
    
    if (!window.confirm(
      '🔄 Refresh All Data?\n\n' +
      'This will:\n' +
      '• Pull latest news from 20+ sources\n' +
      '• Update political trades (SEC)\n' +
      '• Refresh social sentiment\n' +
      '• Fetch insider trading data\n' +
      '• Update economic indicators\n\n' +
      'Takes 2-3 minutes. Continue?'
    )) {
      return;
    }
    
    setRefreshing(true);
    
    try {
      const response = await fetch(`${API_URL}/api/digest/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLastRefresh(new Date());
        alert(
          '✅ Data Refresh Complete!\n\n' +
          `📊 Collected: ${result.collected} items\n` +
          `💾 Stored: ${result.stored} new entries\n` +
          `🔄 Duplicates skipped: ${result.duplicates}\n\n` +
          'All intelligence is now up to date!'
        );
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Reload the page to show new data
        window.location.reload();
      } else {
        alert('❌ Refresh failed: ' + result.error);
      }
    } catch (error: any) {
      alert('❌ Refresh failed: ' + error.message);
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className={`
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          rounded-lg font-semibold
          shadow-md hover:shadow-lg
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center gap-2
        `}
        title="Pull fresh data from all sources"
      >
        <RefreshCw 
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${refreshing ? 'animate-spin' : ''}`}
        />
        {showText && (
          <span>
            {refreshing ? 'Refreshing...' : 'Refresh All Data'}
          </span>
        )}
      </button>
      
      {refreshing && (
        <p className="text-xs text-gray-600 text-center">
          Fetching from 20+ sources...<br/>
          This takes 2-3 minutes
        </p>
      )}
      
      {lastRefresh && !refreshing && (
        <p className="text-xs text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default RefreshDataButton;
