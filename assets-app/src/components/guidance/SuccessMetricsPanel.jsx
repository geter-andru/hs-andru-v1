/**
 * SuccessMetricsPanel Component
 * 
 * Tracks usage metrics and provides optimization tips to encourage
 * continued usage and improvement of business execution skills.
 */

import React from 'react';

const SuccessMetricsPanel = ({ toolType, metrics, onTrackUsage }) => {
  return (
    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-green-400">
          📊 Usage & Success Metrics
        </h4>
        {onTrackUsage && (
          <button 
            onClick={() => onTrackUsage('manual_usage')}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
          >
            Record Usage
          </button>
        )}
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard 
          label="Tools Used"
          value={metrics.toolsUsed || 0}
          target={10}
          icon="🎯"
        />
        <MetricCard 
          label="Conversations"
          value={metrics.conversations || 0}
          target={20}
          icon="💬"
        />
        <MetricCard 
          label="Success Rate"
          value={`${metrics.successRate || 0}%`}
          target="25%"
          icon="📈"
        />
        <MetricCard 
          label="Last Used"
          value={metrics.lastUsed || "Never"}
          target="< 7 days"
          icon="⏰"
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-green-500/20">
        <h5 className="text-sm font-semibold text-green-300 mb-2">
          💡 OPTIMIZATION TIPS
        </h5>
        <OptimizationTips metrics={metrics} toolType={toolType} />
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, target, icon }) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center space-x-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="text-xs text-gray-500">Target: {target}</div>
    </div>
  );
};

const OptimizationTips = ({ metrics, toolType }) => {
  const getTips = () => {
    if (metrics.lastUsed === "Never" || !metrics.lastUsed) {
      return [
        "Schedule time this week to use this tool with actual prospects",
        "Start with 2-3 companies you're currently evaluating",
        "Track which conversation approaches work best"
      ];
    }
    
    if (metrics.successRate < 25) {
      return [
        "Focus on higher-scoring prospects (8.0+ ratings)",
        "Practice the conversation starters provided above",
        "Ask for feedback after calls to improve approach"
      ];
    }
    
    return [
      "You're doing great! Consider training team members on this approach",
      "Document what's working best for your specific market",
      "Share success stories with other founders"
    ];
  };

  return (
    <ul className="space-y-1">
      {getTips().map((tip, index) => (
        <li key={index} className="text-gray-300 text-sm">• {tip}</li>
      ))}
    </ul>
  );
};

export default SuccessMetricsPanel;