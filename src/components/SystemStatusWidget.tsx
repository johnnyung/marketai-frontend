// frontend/src/components/SystemStatusWidget.tsx
import React, { useState, useEffect } from 'react';

// Import your API URL config
// Adjust this import based on your project structure
const API_URL = process.env.REACT_APP_API_URL || 'https://marketai-backend-production-397e.up.railway.app';

interface SystemHealth {
  database: boolean;
  digestData: boolean;
  threadsGenerated: boolean;
  signalsActive: boolean;
  priceAPI: boolean;
  claudeAPI: boolean;
}

const SystemStatusWidget: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(`${API_URL}/api/system/health`);
      const data = await response.json();
      
      const status: SystemHealth = {
        database: data.components.database?.status === 'healthy',
        digestData: data.components.digestData?.status === 'healthy',
        threadsGenerated: data.components.threads?.status === 'healthy',
        signalsActive: data.components.signals?.status === 'healthy',
        priceAPI: data.components.priceAPI?.status === 'healthy',
        claudeAPI: data.components.claudeAPI?.status === 'healthy'
      };
      setHealth(status);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  if (!health) return null;

  const allGood = Object.values(health).every(v => v);
  const hasIssues = Object.values(health).some(v => !v);

  return (
    <div className={`
      fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border-2 z-50
      ${allGood ? 'border-green-500' : 'border-orange-500'}
    `}>
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50"
      >
        <div className="text-2xl">
          {allGood ? '🟢' : hasIssues ? '🟡' : '🔴'}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {allGood ? 'System Healthy' : 'Issues Detected'}
          </div>
          <div className="text-xs text-gray-600">
            Click for details
          </div>
        </div>
        <div className="text-gray-400">
          {expanded ? '▼' : '▶'}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-2">
          <StatusItem name="Database" status={health.database} />
          <StatusItem name="Digest Data" status={health.digestData} />
          <StatusItem name="Threads" status={health.threadsGenerated} />
          <StatusItem name="AI Signals" status={health.signalsActive} />
          <StatusItem name="Price API" status={health.priceAPI} />
          <StatusItem name="Claude AI" status={health.claudeAPI} />

          <button
            onClick={checkSystemHealth}
            className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            🔄 Refresh Status
          </button>
        </div>
      )}
    </div>
  );
};

const StatusItem: React.FC<{ name: string; status: boolean }> = ({ name, status }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <div>{status ? '✅' : '❌'}</div>
      <div>{name}</div>
    </div>
  </div>
);

export default SystemStatusWidget;
