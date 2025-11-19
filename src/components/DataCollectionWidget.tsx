import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  icon: React.ReactNode;
  stats: {
    totalItems: number;
    unprocessedItems: number;
    lastCollection: string | null;
  };
  onCollect: () => Promise<void>;
  onAnalyze: () => Promise<void>;
  viewAllHref: string;
}

export default function DataCollectionWidget({
  title,
  icon,
  stats,
  onCollect,
  onAnalyze,
  viewAllHref
}: Props) {
  const [collecting, setCollecting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');

  const handleCollect = async () => {
    setCollecting(true);
    setMessage('');
    try {
      await onCollect();
      setMessage('Collection complete!');
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setCollecting(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setMessage('');
    try {
      await onAnalyze();
      setMessage('Analysis complete!');
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = () => {
    if (!stats.lastCollection) return 'text-gray-400';
    const hoursSince = stats.lastCollection ? 
      (Date.now() - new Date(stats.lastCollection).getTime()) / (1000 * 60 * 60) : 999;
    if (hoursSince < 2) return 'text-green-500';
    if (hoursSince < 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className={getStatusColor()}>
          {stats.unprocessedItems > 0 ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Items:</span>
          <span className="font-semibold">{stats.totalItems.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Unprocessed:</span>
          <span className="font-semibold text-orange-600">{stats.unprocessedItems}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Update:</span>
          <span className="text-gray-500">
            {stats.lastCollection ? new Date(stats.lastCollection).toLocaleString() : 'Never'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCollect}
          disabled={collecting}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {collecting ? <RefreshCw size={16} className="animate-spin" /> : <Clock size={16} />}
          {collecting ? 'Collecting...' : 'Collect Data'}
        </button>
        
        <button
          onClick={handleAnalyze}
          disabled={analyzing || stats.unprocessedItems === 0}
          className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <span>🤖</span>}
          {analyzing ? 'Analyzing...' : 'Analyze (' + stats.unprocessedItems + ')'}
        </button>
        
        <a
          href={viewAllHref}
          className="block w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center"
        >
          View All
        </a>
      </div>

      {message && (
        <div className="mt-3 text-sm text-center py-2 bg-gray-50 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
