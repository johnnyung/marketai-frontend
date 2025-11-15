// frontend/src/components/SystemStatusWidget.tsx
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

interface SystemStatus {
  database: { status: string; message: string };
  priceAPI: { status: string; message: string; source?: string };
  claudeAI: { status: string; message: string };
  digestData: { status: string; message: string; count?: number };
  threads: { status: string; message: string; count?: number };
  signals: { status: string; message: string; count?: number };
}

const SystemStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/system/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getOverallStatus = (): 'healthy' | 'degraded' | 'down' => {
    if (!status) return 'down';
    
    const statuses = [
      status.database.status,
      status.priceAPI.status,
      status.claudeAI.status,
      status.digestData.status,
      status.threads.status,
      status.signals.status
    ];

    if (statuses.some(s => s === 'down')) return 'down';
    if (statuses.some(s => s === 'degraded')) return 'degraded';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  const overallStatus = getOverallStatus();

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">System Status</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {status && (
            <div className="space-y-3">
              <StatusRow
                icon="💾"
                label="Database"
                status={status.database.status}
                message={status.database.message}
              />
              <StatusRow
                icon="💰"
                label="Price API"
                status={status.priceAPI.status}
                message={status.priceAPI.message}
                detail={status.priceAPI.source ? `Source: ${status.priceAPI.source}` : undefined}
              />
              <StatusRow
                icon="🤖"
                label="Claude AI"
                status={status.claudeAI.status}
                message={status.claudeAI.message}
              />
              <StatusRow
                icon="📰"
                label="Digest Data"
                status={status.digestData.status}
                message={status.digestData.message}
                detail={status.digestData.count ? `${status.digestData.count} entries` : undefined}
              />
              <StatusRow
                icon="🧵"
                label="Threads"
                status={status.threads.status}
                message={status.threads.message}
                detail={status.threads.count ? `${status.threads.count} threads` : undefined}
              />
              <StatusRow
                icon="⚡"
                label="AI Signals"
                status={status.signals.status}
                message={status.signals.message}
                detail={status.signals.count ? `${status.signals.count} signals` : undefined}
              />
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={fetchStatus}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              🔄 Refresh Status
            </button>
            {lastCheck && (
              <p className="text-xs text-gray-500 mt-1">
                Updated: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className={`rounded-full shadow-lg border-2 p-3 transition-all hover:scale-110 ${
            overallStatus === 'healthy'
              ? 'bg-green-50 border-green-200'
              : overallStatus === 'degraded'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}
          title="System Status"
        >
          <span className="text-2xl">{getStatusIcon(overallStatus)}</span>
        </button>
      )}
    </div>
  );
};

const StatusRow: React.FC<{
  icon: string;
  label: string;
  status: string;
  message: string;
  detail?: string;
}> = ({ icon, label, status, message, detail }) => {
  const getColor = (s: string) => {
    switch (s) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getIcon = (s: string) => {
    switch (s) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className="flex items-start gap-2">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs">{getIcon(status)}</span>
        </div>
        <p className={`text-xs ${getColor(status)} truncate`}>{message}</p>
        {detail && <p className="text-xs text-gray-500">{detail}</p>}
      </div>
    </div>
  );
};

export default SystemStatusWidget;
