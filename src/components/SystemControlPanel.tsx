// src/components/SystemControlPanel.tsx
// Comprehensive control panel for MarketAI V2 system monitoring and management

import React, { useState, useEffect } from 'react';
import {
  Activity, Database, Brain, Clock, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Play, Pause, Zap, TrendingUp,
  BarChart3, Calendar, Settings, Eye, Download, Upload
} from 'lucide-react';
import api from '../services/api';

interface SystemStats {
  database: {
    totalRecords: number;
    lastUpdate: string;
    status: 'healthy' | 'warning' | 'error';
  };
  scheduler: {
    isRunning: boolean;
    lastRun: string | null;
    nextRun: string;
    todayCollections: number;
  };
  aiAnalysis: {
    lastAnalysis: string | null;
    totalRecommendations: number;
    successRate: number;
  };
  dataCollection: {
    sourcesActive: number;
    totalSources: number;
    itemsToday: number;
    failedCollections: number;
  };
}

interface ScheduleInfo {
  name: string;
  time: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun?: string;
  itemsCollected?: number;
}

export default function SystemControlPanel() {
  const [stats, setStats] = useState<SystemStats>({
    database: {
      totalRecords: 0,
      lastUpdate: 'Never',
      status: 'healthy'
    },
    scheduler: {
      isRunning: false,
      lastRun: null,
      nextRun: 'Not scheduled',
      todayCollections: 0
    },
    aiAnalysis: {
      lastAnalysis: null,
      totalRecommendations: 0,
      successRate: 0
    },
    dataCollection: {
      sourcesActive: 0,
      totalSources: 14,
      itemsToday: 0,
      failedCollections: 0
    }
  });

  const [schedules, setSchedules] = useState<ScheduleInfo[]>([
    { name: 'Pre-Market', time: '4:00 AM EST', status: 'pending' },
    { name: 'Market Open', time: '9:30 AM EST', status: 'pending' },
    { name: 'Mid-Day', time: '12:00 PM EST', status: 'pending' },
    { name: 'Market Close', time: '4:00 PM EST', status: 'pending' },
    { name: 'Evening Analysis', time: '6:00 PM EST', status: 'pending' },
    { name: 'Weekend', time: 'Saturday 10:00 AM', status: 'pending' }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'scheduler' | 'analysis' | 'logs'>('overview');

  // Load system stats
  useEffect(() => {
    loadSystemStats();
    const interval = setInterval(loadSystemStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = async () => {
    try {
      // Get scheduler status
      const schedulerResponse = await api.api.get('/api/scheduler/status');
      
      // Get AI analysis stats
      const aiResponse = await api.api.get('/api/ai-analysis/performance');
      
      // Get collection stats
      const collectionResponse = await api.api.get('/api/v2/collect/stats');
      
      // Update stats
      if (schedulerResponse.data.success) {
        const schedulerData = schedulerResponse.data.data;
        setStats(prev => ({
          ...prev,
          scheduler: {
            isRunning: schedulerData.scheduler.isRunning,
            lastRun: schedulerData.scheduler.lastRun,
            nextRun: 'See schedule',
            todayCollections: schedulerData.todayStats?.total_runs || 0
          },
          dataCollection: {
            ...prev.dataCollection,
            itemsToday: schedulerData.todayStats?.total_items || 0
          }
        }));
      }
      
      if (aiResponse.data.success) {
        const aiData = aiResponse.data.data;
        setStats(prev => ({
          ...prev,
          aiAnalysis: {
            lastAnalysis: new Date().toLocaleString(),
            totalRecommendations: aiData.total_recommendations || 0,
            successRate: aiData.avg_return_pct || 0
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load system stats:', error);
    }
  };

  // Control scheduler
  const toggleScheduler = async () => {
    setIsLoading(true);
    try {
      if (stats.scheduler.isRunning) {
        await api.api.post('/api/scheduler/stop');
      } else {
        await api.api.post('/api/scheduler/start');
      }
      await loadSystemStats();
    } catch (error) {
      console.error('Failed to toggle scheduler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Force data collection
  const forceCollection = async (type: string = 'all') => {
    setIsLoading(true);
    try {
      await api.api.post('/api/scheduler/force-run', { collectionType: type });
      alert(`Force collection initiated for: ${type}`);
    } catch (error) {
      console.error('Failed to force collection:', error);
      alert('Failed to initiate collection');
    } finally {
      setIsLoading(false);
    }
  };

  // Run AI analysis
  const runAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await api.api.post('/api/ai-analysis/analyze');
      if (response.data.success) {
        alert(`AI Analysis complete: ${response.data.data.recommendations.length} recommendations generated`);
        await loadSystemStats();
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        alert('Analysis was run recently. Please wait at least 1 hour between analyses.');
      } else {
        alert('Failed to run analysis');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export data
  const exportData = async () => {
    try {
      const response = await api.api.get('/api/ai-analysis/latest');
      const data = JSON.stringify(response.data.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketai-export-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'text-green-500';
      case 'warning':
      case 'running':
        return 'text-yellow-500';
      case 'error':
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
      case 'running':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-xl p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold">System Control Panel</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadSystemStats()}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={exportData}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {(['overview', 'scheduler', 'analysis', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize transition-all ${
              activeTab === tab 
                ? 'border-b-2 border-blue-400 text-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Database Status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-6 h-6 text-blue-400" />
              {getStatusIcon(stats.database.status)}
            </div>
            <p className="text-sm text-gray-400">Database</p>
            <p className="text-xl font-bold">{stats.database.totalRecords.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Records</p>
          </div>

          {/* Scheduler Status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-green-400" />
              {stats.scheduler.isRunning ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-gray-400">Scheduler</p>
            <p className="text-xl font-bold">{stats.scheduler.isRunning ? 'Active' : 'Stopped'}</p>
            <p className="text-xs text-gray-500">{stats.scheduler.todayCollections} runs today</p>
          </div>

          {/* AI Analysis */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-6 h-6 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-400">AI Tips</p>
            <p className="text-xl font-bold">{stats.aiAnalysis.totalRecommendations}</p>
            <p className="text-xs text-gray-500">{stats.aiAnalysis.successRate.toFixed(1)}% success</p>
          </div>

          {/* Data Collection */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-orange-400" />
              <span className="text-sm font-bold text-green-400">
                {stats.dataCollection.sourcesActive}/{stats.dataCollection.totalSources}
              </span>
            </div>
            <p className="text-sm text-gray-400">Data Today</p>
            <p className="text-xl font-bold">{stats.dataCollection.itemsToday.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Items collected</p>
          </div>
        </div>
      )}

      {/* Scheduler Tab */}
      {activeTab === 'scheduler' && (
        <div>
          {/* Scheduler Controls */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Scheduler Status</h3>
                <p className="text-sm text-gray-400">
                  {stats.scheduler.isRunning ? 'Running - Collections active' : 'Stopped - No automatic collections'}
                </p>
              </div>
              <button
                onClick={toggleScheduler}
                disabled={isLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  stats.scheduler.isRunning 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {stats.scheduler.isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Stop Scheduler
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Scheduler
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Collection Schedule</h3>
            <div className="space-y-2">
              {schedules.map((schedule, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(schedule.status)}
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-gray-400">{schedule.time}</p>
                    </div>
                  </div>
                  {schedule.lastRun && (
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Last run</p>
                      <p className="text-sm">{schedule.lastRun}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Manual Controls */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Manual Collection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => forceCollection('all')}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Collect All
              </button>
              <button
                onClick={() => forceCollection('news')}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                News Only
              </button>
              <button
                onClick={() => forceCollection('social')}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Social Only
              </button>
              <button
                onClick={() => forceCollection('analysis')}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Run Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div>
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">AI Analysis Engine</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Last run: {stats.aiAnalysis.lastAnalysis || 'Never'}
                </p>
              </div>
              <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Brain className="w-5 h-5" />
                Run Analysis Now
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{stats.aiAnalysis.totalRecommendations}</p>
                <p className="text-sm text-gray-400">Total Tips</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{stats.aiAnalysis.successRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-400">{stats.dataCollection.itemsToday}</p>
                <p className="text-sm text-gray-400">Data Points</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.location.href = '/ai-tip-tracker'}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                View All Tips
              </button>
              <button
                onClick={() => window.location.href = '/deep-dive'}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Deep Dive Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="text-sm text-gray-400">
              <p>System logs will appear here...</p>
              <p className="mt-2">• Scheduler started - 9:00 AM</p>
              <p>• Data collection completed - 9:05 AM</p>
              <p>• AI analysis initiated - 9:10 AM</p>
              <p>• 15 recommendations generated - 9:15 AM</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      )}
    </div>
  );
}
