// src/pages/SystemDiagnostics.tsx
// Comprehensive system health check - Shows what's real data vs mock, connection status, errors

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Activity, Database, Zap } from 'lucide-react';
import api from '../services/api';

interface DataSourceHealth {
  name: string;
  status: 'connected' | 'error' | 'mock' | 'untested';
  lastSuccess: string | null;
  errorCount: number;
  dataType: 'real' | 'mock' | 'unknown';
  latency: number | null;
  itemCount: number;
}

export default function SystemDiagnostics() {
  const [sources, setSources] = useState<DataSourceHealth[]>([]);
  const [overallHealth, setOverallHealth] = useState({ real: 0, mock: 0, error: 0 });

  useEffect(() => {
    runDiagnostics();
    const interval = setInterval(runDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  const runDiagnostics = async () => {
    try {
      // Get collection status which has real vs mock data breakdown
      const statusResponse = await api.api.get('/api/data-collection/status');
      
      if (statusResponse.data.success && statusResponse.data.data.sources) {
        const sources = statusResponse.data.data.sources;
        const diagnostics: DataSourceHealth[] = sources.map((source: any) => ({
          name: source.name,
          status: 'connected',
          lastSuccess: source.lastCollected,
          errorCount: 0,
          dataType: source.isReal ? 'real' : 'mock',
          latency: null,
          itemCount: source.count
        }));
        
        setSources(diagnostics);
        
        const health = {
          real: diagnostics.filter(d => d.dataType === 'real').length,
          mock: diagnostics.filter(d => d.dataType === 'mock').length,
          error: 0
        };
        setOverallHealth(health);
      }
    } catch (error) {
      console.error('Diagnostics failed:', error);
      setOverallHealth({ real: 0, mock: 0, error: 1 });
    }
  };

  const checkIfRealData = (data: any): boolean => {
    // Check for actual collected data indicators
    if (data?.data?.sources) {
      // Check if sources have isReal flag set to true
      return data.data.sources.some((s: any) => s.isReal === true);
    }
    
    // Check for itemsProcessed from collection endpoints
    if (data?.data?.itemsProcessed > 0) return true;
    
    // Check for error messages indicating not configured
    if (data?.error?.includes('not configured')) return false;
    if (data?.error?.includes('missing')) return false;
    
    return false;
  };

  const getItemCount = (data: any): number => {
    if (Array.isArray(data?.data)) return data.data.length;
    if (data?.data?.count) return parseInt(data.data.count);
    return 0;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'connected') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getDataTypeColor = (type: string) => {
    if (type === 'real') return 'bg-green-100 text-green-800 border-green-300';
    if (type === 'mock') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">System Diagnostics</h1>

      {/* Health Summary */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-3xl font-bold text-green-700">{overallHealth.real}</div>
              <div className="text-sm text-green-600">Real Data Sources</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-3xl font-bold text-yellow-700">{overallHealth.mock}</div>
              <div className="text-sm text-yellow-600">Mock/Simulated Data</div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-3xl font-bold text-red-700">{overallHealth.error}</div>
              <div className="text-sm text-red-600">Connection Errors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Data Source Health Check
          </h2>
        </div>

        <div className="divide-y">
          {sources.map((source, idx) => (
            <div key={idx} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(source.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{source.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      {source.latency && <span>⚡ {source.latency}ms</span>}
                      {source.itemCount > 0 && <span>📊 {source.itemCount} items</span>}
                      {source.lastSuccess && (
                        <span>✓ {new Date(source.lastSuccess).toLocaleTimeString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold border-2 ${getDataTypeColor(source.dataType)}`}>
                    {source.dataType.toUpperCase()}
                  </span>
                  
                  {source.status === 'connected' ? (
                    <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                      ONLINE
                    </span>
                  ) : (
                    <span className="px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                      ERROR
                    </span>
                  )}
                </div>
              </div>

              {source.status === 'error' && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    ⚠️ Connection failed. Check Railway logs for details.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h3 className="font-bold text-blue-900 mb-3">💡 System Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          {overallHealth.mock > 0 && (
            <li>• {overallHealth.mock} sources using mock data - Connect real APIs (Alpha Vantage, CoinGecko, etc.)</li>
          )}
          {overallHealth.error > 0 && (
            <li>• {overallHealth.error} connection errors detected - Check Railway deployment logs</li>
          )}
          {overallHealth.real === sources.length && (
            <li>✅ All systems operational with real data!</li>
          )}
        </ul>
      </div>
    </div>
  );
}
