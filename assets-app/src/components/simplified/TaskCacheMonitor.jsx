// TaskCacheMonitor.jsx - Performance monitoring component for task cache system
import React, { useState, useEffect } from 'react';
import { BarChart3, Database, Clock, TrendingUp } from 'lucide-react';
import { TaskDataService } from '../../services/TaskDataService';

const TaskCacheMonitor = ({ showDetails = false }) => {
  const [stats, setStats] = useState(null);
  const [expanded, setExpanded] = useState(false);

  // Update statistics every 5 seconds
  useEffect(() => {
    const updateStats = () => {
      const cacheStats = TaskDataService.getCacheStatistics();
      setStats(cacheStats);
    };

    // Initial update
    updateStats();

    // Set up interval
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats || !showDetails) {
    return null;
  }

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const handleClearCache = () => {
    TaskDataService.clearCache();
    setStats(TaskDataService.getCacheStatistics());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact view */}
      <div 
        className={`bg-gray-900 border border-gray-700 rounded-lg shadow-lg transition-all duration-300 ${
          expanded ? 'w-80' : 'w-48'
        }`}
      >
        <div 
          className="p-3 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Cache</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-400">{stats.hitRate}</span>
              <span className="text-gray-400">{stats.size} items</span>
            </div>
          </div>
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className="border-t border-gray-700 p-3 space-y-3">
            {/* Hit Rate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-300">Hit Rate</span>
              </div>
              <span className="text-xs font-medium text-green-400">{stats.hitRate}</span>
            </div>

            {/* Cache Size */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-300">Memory</span>
              </div>
              <span className="text-xs text-blue-400">{stats.memoryUsage} items</span>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-white font-medium">{stats.hits}</div>
                <div className="text-gray-400">Hits</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-white font-medium">{stats.misses}</div>
                <div className="text-gray-400">Misses</div>
              </div>
            </div>

            {/* Evictions and LocalStorage */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-orange-400 font-medium">{stats.evictions}</div>
                <div className="text-gray-400">Evicted</div>
              </div>
              <div className="text-center p-2 bg-gray-800 rounded">
                <div className="text-purple-400 font-medium">{stats.localStorageKeys}</div>
                <div className="text-gray-400">Stored</div>
              </div>
            </div>

            {/* Cache Actions */}
            <div className="space-y-2">
              <button
                onClick={handleClearCache}
                className="w-full text-xs px-2 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded border border-red-800 transition-colors"
              >
                Clear Cache
              </button>
              
              {/* Performance Indicator */}
              <div className="text-center">
                <div className="text-xs text-gray-400">Performance</div>
                <div className={`text-xs font-medium ${
                  parseFloat(stats.hitRate) > 70 ? 'text-green-400' :
                  parseFloat(stats.hitRate) > 40 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {parseFloat(stats.hitRate) > 70 ? 'Excellent' :
                   parseFloat(stats.hitRate) > 40 ? 'Good' : 'Poor'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCacheMonitor;