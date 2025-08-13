/**
 * Actionable Insights Engine
 * 
 * Converts business intelligence data into specific, actionable sales recommendations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, Target, Users, DollarSign, Clock, 
  AlertTriangle, CheckCircle, Lightbulb, Zap,
  Phone, Mail, Calendar, FileText, BarChart3,
  MessageSquare, ArrowRight, Star, Flame
} from 'lucide-react';

// Main Actionable Insights Panel
export const ActionableInsights = ({ insights, onActionTaken, className = '' }) => {
  const [activeCategory, setActiveCategory] = useState('immediate');
  
  const categories = [
    { key: 'immediate', label: 'Immediate Actions', icon: Zap, color: 'red' },
    { key: 'thisWeek', label: 'This Week', icon: Calendar, color: 'yellow' },
    { key: 'strategic', label: 'Strategic', icon: Target, color: 'blue' },
    { key: 'optimization', label: 'Optimization', icon: TrendingUp, color: 'green' }
  ];

  if (!insights) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Actionable Insights</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Lightbulb className="w-4 h-4" />
          <span>AI-Generated Recommendations</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-6 p-1 bg-gray-700 rounded-lg">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.key;
          
          return (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded text-sm font-medium transition-all
                ${isActive ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Category Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {insights[activeCategory] && (
            <ActionList 
              actions={insights[activeCategory]} 
              onActionTaken={onActionTaken}
              category={activeCategory}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Action List Component
const ActionList = ({ actions, onActionTaken, category }) => {
  if (!actions || !actions.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
        <p>No actions needed in this category right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <ActionCard 
          key={index} 
          action={action} 
          onActionTaken={onActionTaken}
          category={category}
        />
      ))}
    </div>
  );
};

// Individual Action Card
const ActionCard = ({ action, onActionTaken, category }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const priorityConfig = {
    high: { color: 'red', icon: Flame, bg: 'bg-red-900/20 border-red-500/30' },
    medium: { color: 'yellow', icon: AlertTriangle, bg: 'bg-yellow-900/20 border-yellow-500/30' },
    low: { color: 'green', icon: CheckCircle, bg: 'bg-green-900/20 border-green-500/30' }
  };

  const config = priorityConfig[action.priority] || priorityConfig.medium;
  const PriorityIcon = config.icon;

  const handleComplete = () => {
    setIsCompleted(true);
    if (onActionTaken) {
      onActionTaken(action, category);
    }
  };

  return (
    <motion.div
      layout
      className={`border rounded-lg p-4 transition-all ${config.bg} ${
        isCompleted ? 'opacity-50' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <PriorityIcon className={`w-5 h-5 text-${config.color}-400 mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-white ${isCompleted ? 'line-through' : ''}`}>
              {action.title}
            </h4>
            <p className="text-sm text-gray-300 mt-1">{action.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {action.impact && (
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
              {action.impact}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
        {action.timeEstimate && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{action.timeEstimate}</span>
          </div>
        )}
        {action.difficulty && (
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>{action.difficulty}</span>
          </div>
        )}
        {action.roi && (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span>{action.roi}</span>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-600 pt-4 mt-4">
              {/* Steps */}
              {action.steps && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Steps to Execute:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-400">
                    {action.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Resources */}
              {action.resources && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Resources Needed:</h5>
                  <div className="flex flex-wrap gap-2">
                    {action.resources.map((resource, index) => (
                      <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Outcome */}
              {action.outcome && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Expected Outcome:</h5>
                  <p className="text-sm text-gray-400">{action.outcome}</p>
                </div>
              )}

              {/* Talking Points */}
              {action.talkingPoints && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Key Talking Points:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                    {action.talkingPoints.map((point, index) => (
                      <li key={index}>"{point}"</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-600">
        <div className="flex space-x-2">
          {action.quickActions && action.quickActions.map((quickAction, index) => {
            const actionIcons = {
              call: Phone,
              email: Mail,
              calendar: Calendar,
              document: FileText,
              analyze: BarChart3,
              message: MessageSquare
            };
            
            const ActionIcon = actionIcons[quickAction.type] || ArrowRight;
            
            return (
              <button
                key={index}
                onClick={() => quickAction.action && quickAction.action()}
                className="flex items-center space-x-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
              >
                <ActionIcon className="w-3 h-3" />
                <span>{quickAction.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={`px-4 py-2 rounded text-sm font-medium transition-all ${
            isCompleted
              ? 'bg-green-600 text-white cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          {isCompleted ? '✓ Completed' : 'Mark Complete'}
        </button>
      </div>
    </motion.div>
  );
};

// Insight Summary
export const InsightSummary = ({ summary, className = '' }) => {
  if (!summary) return null;

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-white font-medium mb-3">Key Insights</h4>
      
      <div className="space-y-3">
        {summary.insights && summary.insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded">
            <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-300">{insight.text}</p>
              {insight.confidence && (
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < insight.confidence ? 'bg-green-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Metrics
export const PerformanceMetrics = ({ metrics, className = '' }) => {
  if (!metrics) return null;

  const metricIcons = {
    conversion: TrendingUp,
    efficiency: Zap,
    quality: Star,
    velocity: Clock
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-white font-medium mb-3">Performance Impact</h4>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, metric]) => {
          const Icon = metricIcons[key] || BarChart3;
          
          return (
            <div key={key} className="text-center p-3 bg-gray-700 rounded">
              <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-semibold text-white">{metric.value}</div>
              <div className="text-xs text-gray-400">{metric.label}</div>
              {metric.trend && (
                <div className={`text-xs mt-1 ${
                  metric.trend > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.trend > 0 ? '↗' : '↘'} {Math.abs(metric.trend)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionableInsights;