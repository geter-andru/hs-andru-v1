/**
 * Competency Analytics Dashboard - Phase 3
 * 
 * Advanced analytics and insights for professional competency development
 * Provides data-driven insights and progress visualization
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, TrendingDown, BarChart3, Target, 
  Award, Calendar, Clock, Zap, Brain, Users,
  AlertCircle, CheckCircle, ArrowUp, ArrowDown,
  PieChart, Activity, Lightbulb, Star
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';

const CompetencyAnalytics = ({ 
  competencyData, 
  completedActions = [],
  recentActivities = [],
  className = '' 
}) => {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Generate comprehensive analytics
  const analytics = useMemo(() => {
    const insights = assessmentService.generateCompetencyInsights(competencyData);
    const levelProgress = assessmentService.calculateLevelProgress(competencyData.totalProgressPoints);
    
    return {
      insights,
      levelProgress,
      competencyScores: calculateCompetencyScores(competencyData),
      progressTrends: calculateProgressTrends(competencyData, recentActivities),
      actionAnalytics: analyzeCompletedActions(completedActions),
      performanceMetrics: calculatePerformanceMetrics(competencyData, completedActions),
      recommendations: generateSmartRecommendations(competencyData, completedActions, insights)
    };
  }, [competencyData, completedActions, recentActivities]);

  // Time range options
  const timeRangeOptions = [
    { id: '7days', name: '7 Days', description: 'Last week' },
    { id: '30days', name: '30 Days', description: 'Last month' },
    { id: '90days', name: '90 Days', description: 'Last quarter' },
    { id: 'all', name: 'All Time', description: 'Complete history' }
  ];

  // Metric display options
  const metricOptions = [
    { id: 'overall', name: 'Overall Progress', icon: TrendingUp },
    { id: 'competency', name: 'Competency Scores', icon: Target },
    { id: 'actions', name: 'Real-World Actions', icon: Activity },
    { id: 'engagement', name: 'Platform Engagement', icon: Zap }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Professional Development Analytics
            </h3>
            <p className="text-gray-400">
              Data-driven insights into your competency development and business impact
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              {timeRangeOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            
            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              {metricOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Overall Score"
            value={analytics.insights.overallScore}
            suffix="/100"
            trend={calculateTrend(analytics.competencyScores.overall)}
            color="blue"
            icon={Target}
          />
          
          <KPICard
            title="Progress Points"
            value={competencyData.totalProgressPoints}
            trend={analytics.progressTrends.pointsGrowth}
            color="green"
            icon={Zap}
          />
          
          <KPICard
            title="Actions Completed"
            value={completedActions.length}
            trend={analytics.actionAnalytics.weeklyGrowth}
            color="purple"
            icon={Activity}
          />
          
          <KPICard
            title="Level Progress"
            value={Math.round(analytics.levelProgress.progress)}
            suffix="%"
            trend="positive"
            color="yellow"
            icon={Award}
          />
        </div>
      </div>

      {/* Main Analytics Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Analytics Panel */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMetric === 'overall' && <OverallProgressPanel analytics={analytics} />}
          {selectedMetric === 'competency' && <CompetencyScorePanel analytics={analytics} />}
          {selectedMetric === 'actions' && <ActionAnalyticsPanel analytics={analytics} />}
          {selectedMetric === 'engagement' && <EngagementPanel analytics={analytics} />}
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          <InsightsPanel insights={analytics.insights} />
          <RecommendationsPanel recommendations={analytics.recommendations} />
        </div>
      </div>

      {/* Detailed Progress Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompetencyRadarChart competencyData={competencyData} />
        <ProgressTimelineChart progressData={analytics.progressTrends} />
      </div>
    </div>
  );
};

// KPI Card Component
const KPICard = ({ title, value, suffix = '', trend, color, icon: Icon }) => {
  const trendColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const TrendIcon = trend === 'positive' ? ArrowUp : trend === 'negative' ? ArrowDown : null;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 text-${color}-400`} />
        {TrendIcon && <TrendIcon className={`w-4 h-4 ${trendColors[trend]}`} />}
      </div>
      
      <div className={`text-2xl font-bold text-${color}-400 mb-1`}>
        {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
};

// Overall Progress Panel
const OverallProgressPanel = ({ analytics }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Overall Progress Overview</h4>
    
    <div className="space-y-6">
      {/* Competency Breakdown */}
      <div>
        <h5 className="font-medium text-gray-300 mb-4">Competency Scores</h5>
        <div className="space-y-3">
          {Object.entries(analytics.competencyScores.categories).map(([category, data]) => (
            <CompetencyProgressBar key={category} category={category} data={data} />
          ))}
        </div>
      </div>

      {/* Level Progress */}
      <div>
        <h5 className="font-medium text-gray-300 mb-4">Professional Level Progress</h5>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white">{analytics.levelProgress.current.name}</span>
            <span className="text-blue-400 font-medium">
              {Math.round(analytics.levelProgress.progress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${analytics.levelProgress.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-3 bg-blue-500 rounded-full"
            />
          </div>
          
          {analytics.levelProgress.next && (
            <div className="text-sm text-gray-400">
              {analytics.levelProgress.pointsToNext} points to {analytics.levelProgress.next.name}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Competency Score Panel
const CompetencyScorePanel = ({ analytics }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Competency Score Analysis</h4>
    
    <div className="space-y-6">
      {Object.entries(analytics.competencyScores.categories).map(([category, data]) => (
        <div key={category} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-medium text-white">{data.name}</h5>
            <span className={`text-lg font-bold ${data.current >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
              {data.current.toFixed(0)}/100
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Baseline:</span>
              <span className="text-white ml-2">{data.baseline.toFixed(0)}</span>
            </div>
            <div>
              <span className="text-gray-400">Improvement:</span>
              <span className={`ml-2 ${data.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.improvement >= 0 ? '+' : ''}{data.improvement.toFixed(0)}
              </span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${data.current >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${data.current}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Action Analytics Panel
const ActionAnalyticsPanel = ({ analytics }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Real-World Action Analytics</h4>
    
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-blue-400 mb-1">
          {analytics.actionAnalytics.totalActions}
        </div>
        <div className="text-sm text-gray-400">Total Actions</div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-green-400 mb-1">
          {analytics.actionAnalytics.averagePoints.toFixed(0)}
        </div>
        <div className="text-sm text-gray-400">Avg Points</div>
      </div>
    </div>
    
    <div className="space-y-4">
      <h5 className="font-medium text-gray-300">Action Distribution</h5>
      {Object.entries(analytics.actionAnalytics.byCategory).map(([category, count]) => (
        <div key={category} className="flex items-center justify-between">
          <span className="text-gray-400 capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
          <span className="text-white font-medium">{count}</span>
        </div>
      ))}
    </div>
  </div>
);

// Engagement Panel
const EngagementPanel = ({ analytics }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Platform Engagement Analysis</h4>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {analytics.performanceMetrics.totalSessions}
          </div>
          <div className="text-sm text-gray-400">Sessions</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {analytics.performanceMetrics.averageSessionTime}m
          </div>
          <div className="text-sm text-gray-400">Avg Session</div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4">
        <h5 className="font-medium text-white mb-3">Engagement Patterns</h5>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Content Completion Rate:</span>
            <span className="text-green-400">{analytics.performanceMetrics.completionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tool Utilization:</span>
            <span className="text-blue-400">{analytics.performanceMetrics.toolUsage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Learning Velocity:</span>
            <span className="text-purple-400">{analytics.performanceMetrics.learningVelocity}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Insights Panel
const InsightsPanel = ({ insights }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-4">Professional Insights</h4>
    
    <div className="space-y-4">
      {insights.insights.slice(0, 3).map((insight, index) => (
        <div key={index} className={`p-4 rounded-lg border-l-4 ${
          insight.type === 'positive' ? 'border-green-500 bg-green-900/20' :
          insight.type === 'opportunity' ? 'border-yellow-500 bg-yellow-900/20' :
          'border-blue-500 bg-blue-900/20'
        }`}>
          <h5 className="font-medium text-white mb-2">{insight.title}</h5>
          <p className="text-sm text-gray-300">{insight.message}</p>
        </div>
      ))}
    </div>
  </div>
);

// Recommendations Panel
const RecommendationsPanel = ({ recommendations }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-4">Smart Recommendations</h4>
    
    <div className="space-y-4">
      {recommendations.slice(0, 3).map((rec, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-white">{rec.title}</h5>
            <span className={`px-2 py-1 rounded text-xs ${
              rec.priority === 'high' ? 'bg-red-600 text-white' :
              rec.priority === 'medium' ? 'bg-yellow-600 text-white' :
              'bg-green-600 text-white'
            }`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
          <div className="text-xs text-gray-500">
            Est. time: {rec.estimatedTime} • +{rec.potentialPoints} points
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Competency Progress Bar
const CompetencyProgressBar = ({ category, data }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-gray-300 capitalize">{data.name}</span>
      <span className="text-white font-medium">{data.current.toFixed(0)}/100</span>
    </div>
    
    <div className="w-full bg-gray-700 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${data.current}%` }}
        transition={{ duration: 1, delay: 0.2 }}
        className={`h-2 rounded-full ${data.current >= 70 ? 'bg-green-500' : 'bg-yellow-500'}`}
      />
    </div>
    
    <div className="flex justify-between text-xs text-gray-500">
      <span>Baseline: {data.baseline.toFixed(0)}</span>
      <span className={data.improvement >= 0 ? 'text-green-400' : 'text-red-400'}>
        {data.improvement >= 0 ? '+' : ''}{data.improvement.toFixed(0)} improvement
      </span>
    </div>
  </div>
);

// Competency Radar Chart (Simplified representation)
const CompetencyRadarChart = ({ competencyData }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Competency Profile</h4>
    
    <div className="relative h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-400 mb-2">
          {Math.round((competencyData.currentCustomerAnalysis + competencyData.currentValueCommunication + competencyData.currentSalesExecution) / 3)}
        </div>
        <div className="text-gray-400">Overall Score</div>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Customer Analysis:</span>
            <span className="text-blue-400">{competencyData.currentCustomerAnalysis.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Value Communication:</span>
            <span className="text-green-400">{competencyData.currentValueCommunication.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Sales Execution:</span>
            <span className="text-purple-400">{competencyData.currentSalesExecution.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Progress Timeline Chart (Simplified representation)
const ProgressTimelineChart = ({ progressData }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Progress Timeline</h4>
    
    <div className="space-y-4">
      {progressData.milestones.map((milestone, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div className={`w-3 h-3 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-500'}`} />
          <div className="flex-1">
            <div className="text-white font-medium">{milestone.title}</div>
            <div className="text-sm text-gray-400">{milestone.date}</div>
          </div>
          {milestone.points && (
            <div className="text-blue-400 font-medium">+{milestone.points}</div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Utility functions for calculations
const calculateCompetencyScores = (competencyData) => {
  const categories = {
    customerAnalysis: {
      name: 'Customer Analysis',
      baseline: competencyData.baselineCustomerAnalysis || 0,
      current: competencyData.currentCustomerAnalysis || 0,
      improvement: (competencyData.currentCustomerAnalysis || 0) - (competencyData.baselineCustomerAnalysis || 0)
    },
    valueCommunication: {
      name: 'Value Communication',
      baseline: competencyData.baselineValueCommunication || 0,
      current: competencyData.currentValueCommunication || 0,
      improvement: (competencyData.currentValueCommunication || 0) - (competencyData.baselineValueCommunication || 0)
    },
    salesExecution: {
      name: 'Sales Execution',
      baseline: competencyData.baselineSalesExecution || 0,
      current: competencyData.currentSalesExecution || 0,
      improvement: (competencyData.currentSalesExecution || 0) - (competencyData.baselineSalesExecution || 0)
    }
  };

  const overall = Object.values(categories).reduce((sum, cat) => sum + cat.current, 0) / 3;

  return { categories, overall };
};

const calculateProgressTrends = (competencyData, recentActivities) => {
  // Simplified trend calculation
  return {
    pointsGrowth: 'positive',
    milestones: [
      { title: 'Started Professional Journey', date: '30 days ago', completed: true, points: 50 },
      { title: 'First Competency Milestone', date: '20 days ago', completed: true, points: 100 },
      { title: 'Real-World Application', date: '10 days ago', completed: true, points: 200 },
      { title: 'Advanced Tool Unlock', date: 'In progress', completed: false }
    ]
  };
};

const analyzeCompletedActions = (completedActions) => {
  return {
    totalActions: completedActions.length,
    averagePoints: completedActions.length > 0 
      ? completedActions.reduce((sum, action) => sum + action.pointsAwarded, 0) / completedActions.length 
      : 0,
    weeklyGrowth: 'positive',
    byCategory: completedActions.reduce((acc, action) => {
      acc[action.category] = (acc[action.category] || 0) + 1;
      return acc;
    }, {})
  };
};

const calculatePerformanceMetrics = (competencyData, completedActions) => {
  return {
    totalSessions: competencyData.totalSessions || 5,
    averageSessionTime: 25,
    completionRate: 85,
    toolUsage: 70,
    learningVelocity: 'High'
  };
};

const generateSmartRecommendations = (competencyData, completedActions, insights) => {
  const recommendations = [];
  
  // Add recommendations based on insights
  insights.recommendations.forEach(rec => {
    recommendations.push({
      title: rec.action,
      description: rec.description,
      priority: rec.priority,
      estimatedTime: rec.estimatedTime,
      potentialPoints: rec.potentialPoints
    });
  });

  return recommendations;
};

const calculateTrend = (value) => {
  // Simplified trend calculation
  return value > 60 ? 'positive' : value > 40 ? 'neutral' : 'negative';
};

export default CompetencyAnalytics;