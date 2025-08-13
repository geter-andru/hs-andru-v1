/**
 * Progress Tracking Components
 * 
 * Visual components to show user progress through the revenue intelligence journey
 */

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Circle, Clock, TrendingUp, Target, Award } from 'lucide-react';

// Main Progress Tracker
export const ProgressTracker = ({ progress, className = '' }) => {
  const tools = [
    {
      key: 'icp',
      name: 'ICP Analysis',
      description: 'Define your ideal customer',
      completed: progress?.icp_complete || false,
      progress: progress?.icp_progress || 0
    },
    {
      key: 'cost',
      name: 'Cost Calculator',
      description: 'Quantify business impact',
      completed: progress?.cost_complete || false,
      progress: progress?.cost_progress || 0
    },
    {
      key: 'business_case',
      name: 'Business Case',
      description: 'Build stakeholder consensus',
      completed: progress?.business_case_complete || false,
      progress: progress?.business_case_progress || 0
    }
  ];

  const overallProgress = tools.reduce((sum, tool) => sum + (tool.completed ? 100 : tool.progress), 0) / (tools.length * 100) * 100;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Implementation Progress</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{Math.round(overallProgress)}%</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Revenue Intelligence Journey</span>
          <span>{Math.round(overallProgress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Individual Tool Progress */}
      <div className="space-y-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4"
          >
            <div className="flex-shrink-0">
              {tool.completed ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : tool.progress > 0 ? (
                <Clock className="w-6 h-6 text-yellow-400" />
              ) : (
                <Circle className="w-6 h-6 text-gray-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className={`text-sm font-medium ${tool.completed ? 'text-green-400' : 'text-white'}`}>
                  {tool.name}
                </h4>
                <span className="text-xs text-gray-400">
                  {tool.completed ? '100%' : `${tool.progress}%`}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{tool.description}</p>
              
              {!tool.completed && (
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tool.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-blue-500 h-1 rounded-full"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Compact Progress Ring
export const ProgressRing = ({ progress, size = 80, strokeWidth = 8, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          stroke="rgb(55, 65, 81)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Progress circle */}
        <motion.circle
          stroke="rgb(59, 130, 246)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Milestone Tracker
export const MilestoneTracker = ({ milestones, className = '' }) => {
  const completedCount = milestones.filter(m => m.status === 'complete').length;
  
  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Key Milestones</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Award className="w-4 h-4" />
          <span>{completedCount}/{milestones.length} Complete</span>
        </div>
      </div>

      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4"
          >
            <div className="flex-shrink-0 mt-1">
              {milestone.status === 'complete' ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : milestone.status === 'in_progress' ? (
                <Clock className="w-5 h-5 text-yellow-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                milestone.status === 'complete' ? 'text-green-400' : 'text-white'
              }`}>
                {milestone.task}
              </h4>
              {milestone.description && (
                <p className="text-xs text-gray-400 mt-1">{milestone.description}</p>
              )}
              {milestone.timeline && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{milestone.timeline}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Quick Stats Panel
export const QuickStats = ({ stats, className = '' }) => {
  const statItems = [
    {
      label: 'Tools Completed',
      value: stats.toolsCompleted || 0,
      total: stats.totalTools || 3,
      icon: Target,
      color: 'text-blue-400'
    },
    {
      label: 'Time Invested',
      value: `${stats.timeSpent || 0}m`,
      total: null,
      icon: Clock,
      color: 'text-yellow-400'
    },
    {
      label: 'Actions Taken',
      value: stats.actionsTaken || 0,
      total: null,
      icon: TrendingUp,
      color: 'text-green-400'
    }
  ];

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-sm text-gray-300">{stat.label}</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">
                {stat.total ? `${stat.value}/${stat.total}` : stat.value}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Usage Analytics
export const UsageAnalytics = ({ analytics, className = '' }) => {
  if (!analytics) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Usage Insights</h3>
      
      <div className="space-y-4">
        {/* Most Used Tool */}
        {analytics.mostUsedTool && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="text-sm text-gray-300">Most Used Tool</span>
            <span className="text-sm font-medium text-blue-400">{analytics.mostUsedTool}</span>
          </div>
        )}

        {/* Peak Usage Time */}
        {analytics.peakTime && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="text-sm text-gray-300">Peak Usage</span>
            <span className="text-sm font-medium text-yellow-400">{analytics.peakTime}</span>
          </div>
        )}

        {/* Success Rate */}
        {analytics.completionRate && (
          <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
            <span className="text-sm text-gray-300">Completion Rate</span>
            <span className="text-sm font-medium text-green-400">{analytics.completionRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;