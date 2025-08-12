/**
 * Success Metrics Component - Tracks and displays engagement analytics
 * 
 * Monitors user engagement patterns, completion rates, and satisfaction
 * indicators for the progressive engagement system.
 */

import React, { useState, useEffect } from 'react';
import { airtableService } from '../../services/airtableService';

export const useSuccessMetrics = (customerId) => {
  const [metrics, setMetrics] = useState({
    engagement: {
      timeToFirstInteraction: null,
      compellingAspectEngagement: {},
      progressionRate: 0,
      totalTimeSpent: 0
    },
    completion: {
      toolCompletionRate: 0,
      averageCompletionTime: 0,
      dropOffPoints: [],
      integrationReached: false
    },
    satisfaction: {
      interactionDepth: 0,
      returnEngagement: false,
      advancedFeatureAccess: 0
    }
  });

  const [sessionStartTime] = useState(Date.now());
  const [interactions, setInteractions] = useState([]);

  // Track engagement event
  const trackEngagement = (eventType, data = {}) => {
    const interaction = {
      timestamp: Date.now(),
      type: eventType,
      data,
      sessionTime: Date.now() - sessionStartTime
    };

    setInteractions(prev => [...prev, interaction]);

    // Update specific metrics
    switch (eventType) {
      case 'first_interaction':
        setMetrics(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            timeToFirstInteraction: interaction.sessionTime
          }
        }));
        break;

      case 'compelling_aspect_engaged':
        setMetrics(prev => ({
          ...prev,
          engagement: {
            ...prev.engagement,
            compellingAspectEngagement: {
              ...prev.engagement.compellingAspectEngagement,
              [data.aspectType]: (prev.engagement.compellingAspectEngagement[data.aspectType] || 0) + 1
            }
          }
        }));
        break;

      case 'tool_completed':
        calculateCompletionMetrics();
        break;

      case 'integration_reached':
        setMetrics(prev => ({
          ...prev,
          completion: {
            ...prev.completion,
            integrationReached: true
          }
        }));
        break;
    }
  };

  // Calculate completion metrics
  const calculateCompletionMetrics = () => {
    const toolInteractions = interactions.filter(i => i.type === 'tool_completed');
    const completionRate = (toolInteractions.length / 3) * 100; // 3 total tools
    
    const totalTime = interactions.length > 0 ? 
      Math.max(...interactions.map(i => i.sessionTime)) - Math.min(...interactions.map(i => i.sessionTime)) : 0;
    
    const avgCompletionTime = toolInteractions.length > 0 ? 
      totalTime / toolInteractions.length : 0;

    setMetrics(prev => ({
      ...prev,
      completion: {
        ...prev.completion,
        toolCompletionRate: completionRate,
        averageCompletionTime: avgCompletionTime
      },
      engagement: {
        ...prev.engagement,
        totalTimeSpent: totalTime
      }
    }));
  };

  // Calculate satisfaction metrics
  const calculateSatisfactionMetrics = () => {
    const interactionTypes = [...new Set(interactions.map(i => i.type))];
    const interactionDepth = interactionTypes.length;
    
    const advancedFeatures = interactions.filter(i => 
      ['integration_reached', 'stakeholder_view_accessed', 'advanced_methodology_unlocked'].includes(i.type)
    ).length;

    setMetrics(prev => ({
      ...prev,
      satisfaction: {
        ...prev.satisfaction,
        interactionDepth,
        advancedFeatureAccess: advancedFeatures
      }
    }));
  };

  // Send metrics to backend
  const persistMetrics = async () => {
    try {
      const metricsData = {
        ...metrics,
        interactions: interactions.slice(-50), // Last 50 interactions
        sessionId: sessionStartTime,
        customerId
      };

      await airtableService.trackProgressiveEngagementMetrics(customerId, metricsData);
    } catch (error) {
      console.error('Error persisting success metrics:', error);
    }
  };

  // Update calculated metrics periodically
  useEffect(() => {
    calculateCompletionMetrics();
    calculateSatisfactionMetrics();
  }, [interactions]);

  // Persist metrics on unmount or periodically
  useEffect(() => {
    const persistInterval = setInterval(persistMetrics, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(persistInterval);
      persistMetrics(); // Final persist on unmount
    };
  }, [metrics]);

  // Get engagement insights
  const getEngagementInsights = () => {
    const insights = [];
    
    // Time to engagement analysis
    if (metrics.engagement.timeToFirstInteraction) {
      if (metrics.engagement.timeToFirstInteraction < 10000) { // < 10 seconds
        insights.push({
          type: 'positive',
          message: 'Immediate engagement achieved',
          metric: 'time_to_first_interaction',
          value: metrics.engagement.timeToFirstInteraction
        });
      } else if (metrics.engagement.timeToFirstInteraction > 30000) { // > 30 seconds
        insights.push({
          type: 'concern',
          message: 'Delayed initial engagement',
          metric: 'time_to_first_interaction',
          value: metrics.engagement.timeToFirstInteraction
        });
      }
    }

    // Completion rate analysis
    if (metrics.completion.toolCompletionRate > 66) {
      insights.push({
        type: 'positive',
        message: 'High completion rate achieved',
        metric: 'completion_rate',
        value: metrics.completion.toolCompletionRate
      });
    } else if (metrics.completion.toolCompletionRate < 33) {
      insights.push({
        type: 'concern',
        message: 'Low completion rate detected',
        metric: 'completion_rate',
        value: metrics.completion.toolCompletionRate
      });
    }

    // Engagement depth analysis
    if (metrics.satisfaction.interactionDepth >= 8) {
      insights.push({
        type: 'positive',
        message: 'Deep engagement demonstrated',
        metric: 'interaction_depth',
        value: metrics.satisfaction.interactionDepth
      });
    }

    return insights;
  };

  // Get progression bottlenecks
  const getProgressionBottlenecks = () => {
    const bottlenecks = [];
    
    // Check for aspect engagement drops
    const aspectEngagement = metrics.engagement.compellingAspectEngagement;
    Object.entries(aspectEngagement).forEach(([aspect, count]) => {
      if (count === 0) {
        bottlenecks.push({
          stage: 'compelling_aspect',
          aspect,
          issue: 'No engagement with compelling aspect'
        });
      }
    });

    // Check for completion drop-offs
    if (metrics.completion.toolCompletionRate < 100 && metrics.completion.toolCompletionRate > 0) {
      bottlenecks.push({
        stage: 'tool_completion',
        issue: 'Partial completion pattern detected',
        completionRate: metrics.completion.toolCompletionRate
      });
    }

    return bottlenecks;
  };

  // Export metrics for analysis
  const exportMetrics = () => {
    return {
      timestamp: Date.now(),
      customerId,
      sessionMetrics: metrics,
      interactions: interactions,
      insights: getEngagementInsights(),
      bottlenecks: getProgressionBottlenecks(),
      sessionDuration: Date.now() - sessionStartTime
    };
  };

  return {
    metrics,
    trackEngagement,
    getEngagementInsights,
    getProgressionBottlenecks,
    exportMetrics,
    interactions
  };
};

// Success Metrics Display Component
const SuccessMetricsDisplay = ({ metrics, insights, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className={`success-metrics-display ${className}`}>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Engagement Analytics</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="metric-card text-center">
            <div className="text-2xl font-bold text-blue-400">
              {metrics.engagement.timeToFirstInteraction ? 
                formatTime(metrics.engagement.timeToFirstInteraction) : 'N/A'
              }
            </div>
            <div className="text-xs text-gray-400">Time to Engage</div>
          </div>
          
          <div className="metric-card text-center">
            <div className="text-2xl font-bold text-green-400">
              {Math.round(metrics.completion.toolCompletionRate)}%
            </div>
            <div className="text-xs text-gray-400">Completion Rate</div>
          </div>
          
          <div className="metric-card text-center">
            <div className="text-2xl font-bold text-purple-400">
              {metrics.satisfaction.interactionDepth}
            </div>
            <div className="text-xs text-gray-400">Interaction Depth</div>
          </div>
        </div>

        {/* Insights */}
        {insights && insights.length > 0 && (
          <div className="insights mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Key Insights:</h4>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`text-xs p-2 rounded-lg ${
                    insight.type === 'positive' 
                      ? 'bg-green-900/30 text-green-300 border border-green-700/50'
                      : 'bg-orange-900/30 text-orange-300 border border-orange-700/50'
                  }`}
                >
                  {insight.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="detailed-metrics border-t border-gray-600/30 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-300 mb-2">Engagement</h5>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Total Time: {formatTime(metrics.engagement.totalTimeSpent)}</div>
                  <div>Aspects Engaged: {Object.keys(metrics.engagement.compellingAspectEngagement).length}</div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-300 mb-2">Completion</h5>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>Avg Time/Tool: {formatTime(metrics.completion.averageCompletionTime)}</div>
                  <div>Integration: {metrics.completion.integrationReached ? 'Reached' : 'Pending'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessMetricsDisplay;