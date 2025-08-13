/**
 * ContextualHelp Component
 * 
 * Provides inline help, tooltips, and contextual guidance
 * throughout the platform to bridge insights to action.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Info, ChevronRight, Target, TrendingUp, Clock } from 'lucide-react';

const ContextualHelp = ({ 
  type = 'tooltip', // tooltip, inline, modal, sidebar
  content,
  title,
  position = 'top',
  trigger = 'hover', // hover, click, always
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'always');

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  if (type === 'tooltip') {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          onClick={handleTrigger}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
            >
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl max-w-xs">
                {title && (
                  <h4 className="text-white font-medium text-sm mb-1">{title}</h4>
                )}
                <p className="text-gray-300 text-sm">{content}</p>
                <div className="absolute w-0 h-0 border-8 border-transparent border-t-gray-900 top-full left-1/2 transform -translate-x-1/2 -mt-px"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            {title && (
              <h4 className="text-blue-300 font-medium mb-1">{title}</h4>
            )}
            <p className="text-gray-300 text-sm">{content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};

// Quick Tip Component
export const QuickTip = ({ tip, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start space-x-2 text-sm ${className}`}
    >
      <span className="text-yellow-400 mt-0.5">💡</span>
      <p className="text-gray-300">{tip}</p>
    </motion.div>
  );
};

// Action Card Component
export const ActionCard = ({ action, onComplete, className = '' }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = () => {
    setIsCompleted(true);
    if (onComplete) onComplete(action);
  };

  const priorityColors = {
    high: 'border-red-500/50 bg-red-900/10',
    medium: 'border-yellow-500/50 bg-yellow-900/10',
    low: 'border-green-500/50 bg-green-900/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 ${priorityColors[action.priority]} ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium">{action.action}</h4>
        <button
          onClick={handleComplete}
          className={`px-2 py-1 rounded text-xs transition-all ${
            isCompleted 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {isCompleted ? '✓ Done' : 'Mark Complete'}
        </button>
      </div>
      
      <p className="text-gray-300 text-sm mb-3">{action.reason}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4 text-gray-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{action.timeEstimate}</span>
          </span>
          <span className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>{action.businessImpact}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Sales Execution Checklist
export const SalesExecutionChecklist = ({ checklist, title, className = '' }) => {
  const [completedItems, setCompletedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedItems(newCompleted);
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <h4 className="text-white font-medium mb-3 flex items-center">
        <Target className="w-4 h-4 mr-2 text-blue-400" />
        {title}
      </h4>
      <div className="space-y-2">
        {checklist.map((item, index) => (
          <label
            key={index}
            className="flex items-start space-x-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={completedItems.has(index)}
              onChange={() => toggleItem(index)}
              className="mt-0.5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
            />
            <span className={`text-sm ${
              completedItems.has(index) 
                ? 'text-gray-500 line-through' 
                : 'text-gray-300 group-hover:text-white'
            }`}>
              {item.task}
            </span>
          </label>
        ))}
      </div>
      {completedItems.size === checklist.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-green-400 text-sm font-medium"
        >
          ✓ All tasks complete!
        </motion.div>
      )}
    </div>
  );
};

// Guidance Panel Component
export const GuidancePanel = ({ guidance, className = '' }) => {
  if (!guidance) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-gray-800 rounded-lg p-6 ${className}`}
    >
      {/* Current Step */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">
          {guidance.currentStep}
        </h3>
        {guidance.prerequisiteCheck && (
          <div className={`text-sm p-2 rounded ${
            guidance.prerequisiteCheck.ready || guidance.prerequisiteCheck.hasICP
              ? 'bg-green-900/20 text-green-400'
              : 'bg-yellow-900/20 text-yellow-400'
          }`}>
            {guidance.prerequisiteCheck.message}
          </div>
        )}
      </div>

      {/* Next Actions */}
      {guidance.nextActions && guidance.nextActions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Next Actions</h4>
          <div className="space-y-3">
            {guidance.nextActions.map((action, index) => (
              <ActionCard key={index} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {guidance.tips && guidance.tips.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Pro Tips</h4>
          <div className="space-y-2">
            {guidance.tips.map((tip, index) => (
              <QuickTip key={index} tip={tip} />
            ))}
          </div>
        </div>
      )}

      {/* Sales Execution */}
      {guidance.salesExecution && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Sales Execution</h4>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5" />
              <div>
                <span className="text-blue-300 text-sm font-medium">Immediate:</span>
                <p className="text-gray-300 text-sm">{guidance.salesExecution.immediate}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div>
                <span className="text-yellow-300 text-sm font-medium">This Week:</span>
                <p className="text-gray-300 text-sm">{guidance.salesExecution.thisWeek}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-green-400 mt-0.5" />
              <div>
                <span className="text-green-300 text-sm font-medium">This Month:</span>
                <p className="text-gray-300 text-sm">{guidance.salesExecution.thisMonth}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Talking Points */}
      {guidance.talkingPoints && (
        <div>
          <h4 className="text-white font-medium mb-3">Talking Points</h4>
          <div className="bg-gray-900 rounded p-3 space-y-2">
            {guidance.talkingPoints.map((point, index) => (
              <p key={index} className="text-gray-300 text-sm italic">
                "{point}"
              </p>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ContextualHelp;