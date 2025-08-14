/**
 * Tab Navigation Component
 * 
 * Professional tab navigation with lock states and progress indicators
 */

import React from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle, BarChart3 } from 'lucide-react';

const TabNavigation = ({ 
  tabs, 
  activeTab, 
  competencyData, 
  onTabClick, 
  className = '' 
}) => {
  // Get current score for requirement category
  const getCurrentScore = (category) => {
    switch (category) {
      case 'customerAnalysis':
        return competencyData.currentCustomerAnalysis;
      case 'valueCommunication':
        return competencyData.currentValueCommunication;
      case 'salesExecution':
        return competencyData.currentSalesExecution;
      default:
        return 0;
    }
  };

  // Calculate progress percentage towards requirement
  const getProgressPercentage = (tab) => {
    if (!tab.requirementScore || !tab.requirementCategory) return 100;
    
    const currentScore = getCurrentScore(tab.requirementCategory);
    return Math.min(100, (currentScore / tab.requirementScore) * 100);
  };

  // Get tab status styling
  const getTabStyling = (tab, isActive) => {
    if (tab.unlocked) {
      return isActive 
        ? 'bg-blue-900/50 border-blue-500/50 text-blue-300'
        : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600';
    } else {
      return 'bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed';
    }
  };

  // Get requirement text for locked tabs
  const getRequirementText = (tab) => {
    if (tab.unlocked) return null;
    
    const currentScore = getCurrentScore(tab.requirementCategory);
    const needed = tab.requirementScore - currentScore;
    
    return `Reach ${needed.toFixed(0)}+ points in ${tab.requirementCategory.replace(/([A-Z])/g, ' $1').toLowerCase()} to unlock`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tab Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const progressPercentage = getProgressPercentage(tab);
          const requirementText = getRequirementText(tab);
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                console.log('TabNavigation: Button clicked for:', tab.id, 'unlocked:', tab.unlocked);
                onTabClick(tab.id);
              }}
              disabled={false} // Temporarily enable all buttons for testing
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-lg border-2 transition-all duration-300 text-left cursor-pointer ${getTabStyling(tab, isActive)}`}
            >
              {/* Tab Icon and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{tab.label}</h3>
                    <p className="text-sm opacity-75">{tab.description}</p>
                  </div>
                </div>
                
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {tab.unlocked ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Lock className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Progress Bar for Locked Tabs */}
              {!tab.unlocked && tab.requirementScore && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress to unlock</span>
                    <span className="text-gray-300">
                      {getCurrentScore(tab.requirementCategory).toFixed(0)}/{tab.requirementScore}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-2 rounded-full ${
                        progressPercentage >= 100 ? 'bg-green-500' : 
                        progressPercentage >= 70 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                  
                  {requirementText && (
                    <p className="text-xs text-gray-500 mt-2">
                      {requirementText}
                    </p>
                  )}
                </div>
              )}

              {/* Active Tab Indicator */}
              {isActive && tab.unlocked && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-400 rounded-b-lg"
                />
              )}

              {/* Tab Number */}
              <div className="absolute top-2 right-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  tab.unlocked ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {index + 1}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Professional Progress Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-lg p-4"
      >
        <div className="flex items-center space-x-3 mb-3">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h4 className="font-medium text-white">Methodology Progress</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {competencyData.currentCustomerAnalysis.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Customer Analysis</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {competencyData.currentValueCommunication.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Value Communication</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {competencyData.currentSalesExecution.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Sales Execution</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TabNavigation;