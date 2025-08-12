import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Clock, TrendingUp, Award, Target } from 'lucide-react';
import { airtableService } from '../../services/airtableService';
import { useProgressNotifications } from '../notifications/ProgressNotifications';
import ProgressNotifications from '../notifications/ProgressNotifications';

const ActiveToolDisplay = ({ 
  currentTool, 
  toolData, 
  customerId,
  onCompletion, 
  onToolChange,
  children,
  className = '' 
}) => {
  const [toolAccess, setToolAccess] = useState({});
  const [gamificationFeedback, setGamificationFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const {
    notifications,
    showProgressRecognition,
    showCompetencyAdvancement,
    showMilestoneReached,
    showToolAccessEarned,
    dismissNotification
  } = useProgressNotifications();

  useEffect(() => {
    loadToolAccessStatus();
  }, [customerId, currentTool]);

  const loadToolAccessStatus = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const data = await airtableService.getCustomerDataByRecordId(customerId);
      setToolAccess(data.toolAccessStatus || {});
    } catch (error) {
      console.error('Error loading tool access status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletionWithGamification = async (completionData) => {
    try {
      // Call the original completion handler
      const result = await onCompletion(completionData);
      
      // Process gamification feedback if available
      if (result?.gamification) {
        setGamificationFeedback(result.gamification);
        
        // Show appropriate notifications based on achievements
        const { gamification } = result;
        
        if (gamification.pointsAwarded > 0) {
          showProgressRecognition(
            `${currentTool.toUpperCase()} Analysis Completed`,
            gamification.pointsAwarded
          );
        }
        
        if (gamification.competencyAdvanced) {
          showCompetencyAdvancement(
            'Professional Competency',
            gamification.pointsAwarded
          );
        }
        
        if (gamification.milestoneAchieved) {
          showMilestoneReached(
            'Professional Milestone Achieved',
            'Excellence Recognition',
            gamification.pointsAwarded
          );
        }
        
        if (gamification.toolUnlocked) {
          showToolAccessEarned('Advanced Methodology Access');
        }

        // Auto-refresh tool access status
        setTimeout(() => {
          loadToolAccessStatus();
        }, 1000);
      }
      
      return result;
    } catch (error) {
      console.error('Error in gamified completion handler:', error);
      throw error;
    }
  };

  const getToolInfo = (toolName) => {
    const toolInfo = {
      icp: {
        name: 'Customer Intelligence Analysis',
        description: 'Systematic customer profiling and market analysis',
        icon: '🎯',
        color: 'blue',
        level: 'Foundation'
      },
      cost: {
        name: 'Value Quantification',
        description: 'Financial impact assessment and ROI calculation',
        icon: '💰',
        color: 'green',
        level: 'Developing'
      },
      'cost-calculator': {
        name: 'Value Quantification',
        description: 'Financial impact assessment and ROI calculation', 
        icon: '💰',
        color: 'green',
        level: 'Developing'
      },
      business_case: {
        name: 'Strategic Proposal Development',
        description: 'Executive-level business case construction',
        icon: '📊',
        color: 'purple',
        level: 'Proficient'
      },
      'business-case': {
        name: 'Strategic Proposal Development',
        description: 'Executive-level business case construction',
        icon: '📊', 
        color: 'purple',
        level: 'Proficient'
      },
      results: {
        name: 'Results Dashboard',
        description: 'Comprehensive analysis results and export',
        icon: '📈',
        color: 'yellow',
        level: 'Advanced'
      }
    };
    
    return toolInfo[toolName] || toolInfo.icp;
  };

  const getAccessStatus = (toolName) => {
    const normalizedName = toolName === 'cost-calculator' ? 'cost_calculator' : 
                          toolName === 'business-case' ? 'business_case_builder' : 
                          `${toolName}_analysis`;
    
    return toolAccess[normalizedName] || { access: false, completions: 0 };
  };

  const toolInfo = getToolInfo(currentTool);
  const accessStatus = getAccessStatus(currentTool);
  const isLocked = !accessStatus.access;

  if (loading) {
    return (
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3" />
          <div className="h-32 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
        {/* Tool Header */}
        <div className={`bg-gradient-to-r from-${toolInfo.color}-900/50 to-${toolInfo.color}-800/50 border-b border-gray-700 p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-${toolInfo.color}-900/50 rounded-lg border border-${toolInfo.color}-700`}>
                <span className="text-2xl">{toolInfo.icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {toolInfo.name}
                </h2>
                <p className="text-gray-300 text-sm">
                  {toolInfo.description}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`text-xs px-2 py-1 bg-${toolInfo.color}-900/50 text-${toolInfo.color}-300 rounded-full border border-${toolInfo.color}-700`}>
                    {toolInfo.level} Level
                  </span>
                  <span className="text-xs text-gray-400">
                    Completions: {accessStatus.completions || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-3">
              {isLocked ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <Lock className="w-5 h-5" />
                  <span className="text-sm">Methodology Locked</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gamification Feedback */}
        {gamificationFeedback && (
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center space-x-4">
              <Award className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white mb-1">
                  Professional Development Feedback
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {gamificationFeedback.pointsAwarded > 0 && (
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-300">+{gamificationFeedback.pointsAwarded} points</span>
                    </div>
                  )}
                  {gamificationFeedback.competencyAdvanced && (
                    <div className="flex items-center space-x-1">
                      <Target className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300">Competency Advanced</span>
                    </div>
                  )}
                  {gamificationFeedback.milestoneAchieved && (
                    <div className="flex items-center space-x-1">
                      <Award className="w-3 h-3 text-yellow-400" />
                      <span className="text-gray-300">Milestone Achieved</span>
                    </div>
                  )}
                  {gamificationFeedback.toolUnlocked && (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-300">Tool Unlocked</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setGamificationFeedback(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Locked Tool Display */}
        {isLocked ? (
          <div className="p-8 text-center">
            <div className="mb-6">
              <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                Advanced Methodology Locked
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Demonstrate proficiency in prerequisite methodologies to unlock this advanced analysis tool.
              </p>
            </div>

            {/* Unlock Progress */}
            {accessStatus.unlock_progress && (
              <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  Unlock Requirements
                </h4>
                <div className="space-y-3 text-sm">
                  {Object.entries(accessStatus.unlock_progress).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-400 capitalize">
                        {key.replace('_', ' ')}
                      </span>
                      <span className="text-gray-300 font-medium">
                        {typeof value === 'number' ? value : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => onToolChange('icp')}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start with Customer Analysis
            </button>
          </div>
        ) : (
          /* Active Tool Content */
          <div className="p-6">
            {/* Enhanced children with gamification context */}
            {React.cloneElement(children, {
              onCompletion: handleCompletionWithGamification,
              toolInfo: toolInfo,
              accessStatus: accessStatus,
              gamificationEnabled: true
            })}
          </div>
        )}
      </div>

      {/* Progress Notifications */}
      <ProgressNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
      />
    </>
  );
};

export default ActiveToolDisplay;