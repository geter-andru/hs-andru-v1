import React, { useState, useEffect } from 'react';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';
import CompetencyReadiness from './CompetencyReadiness';
import MethodologyProgression from './MethodologyProgression';
import ToolUnlockModal, { useToolUnlockModal } from './ToolUnlockModal';
import { competencyService } from '../../services/competencyService';

// Tool unlock requirements (hidden progression gates)
const TOOL_UNLOCK_REQUIREMENTS = {
  ICP_ANALYSIS: {
    name: 'ICP Analysis',
    description: 'Customer identification and profiling methodology',
    icon: '🎯',
    requirement: 'Always available',
    unlocked: true,
    color: 'from-blue-600 to-blue-500'
  },
  COST_CALCULATOR: {
    name: 'Cost of Inaction Calculator',
    description: 'Revenue impact analysis methodology',
    icon: '📊',
    requirement: 'Complete 3 ICP analyses with 70%+ accuracy scores',
    requiredCompletions: 3,
    requiredScore: 70,
    unlocked: false,
    color: 'from-green-600 to-green-500'
  },
  BUSINESS_CASE: {
    name: 'Business Case Builder',
    description: 'Strategic proposal development framework',
    icon: '📋',
    requirement: 'Complete 2 comprehensive cost analyses',
    requiredCompletions: 2,
    unlocked: false,
    color: 'from-purple-600 to-purple-500'
  }
};

const ProgressiveToolAccess = ({ 
  customerId, 
  onToolStatusChange, 
  onToolNavigate,
  showReadiness = true,
  showProgression = true,
  className = '' 
}) => {
  const { workflowProgress, usageAnalytics } = useWorkflowProgress(customerId);
  const [toolStatus, setToolStatus] = useState(TOOL_UNLOCK_REQUIREMENTS);
  const [newUnlocks, setNewUnlocks] = useState([]);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'readiness', 'progression'
  const { modalState, showUnlockModal, hideModal, navigateToTool } = useToolUnlockModal();
  const [previousAccessStatus, setPreviousAccessStatus] = useState({});

  // Check tool unlock requirements and competency progression
  useEffect(() => {
    if (!workflowProgress || !usageAnalytics || !customerId) return;

    const checkUnlocks = async () => {
      try {
        // Get current access status from competency service
        const accessStatus = await competencyService.getToolAccessStatus(customerId);
        
        // Check for new unlocks
        const unlockCheck = await competencyService.checkForUnlocks(customerId, previousAccessStatus);
        
        if (unlockCheck.hasUnlocks && unlockCheck.unlocks.length > 0) {
          const firstUnlock = unlockCheck.unlocks[0];
          
          // Show professional unlock modal
          showUnlockModal(firstUnlock.tool, firstUnlock.competencyAchieved);
          
          // Update local state
          setNewUnlocks([firstUnlock.tool]);
          setShowUnlockAnimation(true);
          setTimeout(() => setShowUnlockAnimation(false), 4000);
        }
        
        // Update tool status based on competency service
        const updatedStatus = { ...toolStatus };
        if (accessStatus['cost-calculator']?.hasAccess) {
          updatedStatus.COST_CALCULATOR.unlocked = true;
        }
        if (accessStatus['business-case']?.hasAccess) {
          updatedStatus.BUSINESS_CASE.unlocked = true;
        }
        
        setToolStatus(updatedStatus);
        setPreviousAccessStatus(accessStatus);
        
        // Notify parent component
        if (onToolStatusChange) {
          onToolStatusChange(updatedStatus);
        }
      } catch (error) {
        console.error('Error checking tool unlocks:', error);
        
        // Fallback to basic unlock logic
        const updatedStatus = { ...toolStatus };
        const previouslyLocked = Object.keys(updatedStatus).filter(key => !updatedStatus[key].unlocked);

        // Cost Calculator unlock logic
        const qualifyingICPScores = getQualifyingICPScores();
        if (qualifyingICPScores >= TOOL_UNLOCK_REQUIREMENTS.COST_CALCULATOR.requiredCompletions) {
          updatedStatus.COST_CALCULATOR.unlocked = true;
        }

        // Business Case Builder unlock logic
        const costCalculatorCompletions = getCostCalculatorCompletions();
        if (costCalculatorCompletions >= TOOL_UNLOCK_REQUIREMENTS.BUSINESS_CASE.requiredCompletions) {
          updatedStatus.BUSINESS_CASE.unlocked = true;
        }

        const newlyUnlocked = Object.keys(updatedStatus).filter(
          key => updatedStatus[key].unlocked && previouslyLocked.includes(key)
        );

        if (newlyUnlocked.length > 0) {
          setNewUnlocks(newlyUnlocked);
          setShowUnlockAnimation(true);
          setTimeout(() => setShowUnlockAnimation(false), 4000);
        }

        setToolStatus(updatedStatus);
        if (onToolStatusChange) {
          onToolStatusChange(updatedStatus);
        }
      }
    };

    checkUnlocks();
  }, [workflowProgress, usageAnalytics, customerId]);

  // Helper functions to calculate progress (hidden from user)
  const getICPCompletionCount = () => {
    return usageAnalytics?.tools_completed?.filter(tool => tool === 'icp').length || 0;
  };

  const getQualifyingICPScores = () => {
    // Simulate tracking of ICP scores (would need enhanced analytics)
    if (workflowProgress?.icp_completed && (workflowProgress?.icp_score || 0) >= 70) {
      return Math.max(getICPCompletionCount(), 1);
    }
    return 0;
  };

  const getCostCalculatorCompletions = () => {
    return usageAnalytics?.tools_completed?.filter(tool => tool === 'cost').length || 0;
  };

  const getProgressTowardsUnlock = (toolKey) => {
    const tool = toolStatus[toolKey];
    if (tool.unlocked) return 100;

    switch (toolKey) {
      case 'COST_CALCULATOR':
        const qualifyingScores = getQualifyingICPScores();
        return Math.min((qualifyingScores / tool.requiredCompletions) * 100, 100);
      
      case 'BUSINESS_CASE':
        const costCompletions = getCostCalculatorCompletions();
        return Math.min((costCompletions / tool.requiredCompletions) * 100, 100);
      
      default:
        return 100;
    }
  };

  const ToolAccessCard = ({ toolKey, tool }) => {
    const progress = getProgressTowardsUnlock(toolKey);
    const isUnlocked = tool.unlocked;

    return (
      <div className={`relative overflow-hidden rounded-lg border transition-all duration-500 ${
        isUnlocked 
          ? 'bg-gray-800 border-gray-600 hover:border-gray-500' 
          : 'bg-gray-900 border-gray-700 opacity-75'
      }`}>
        
        {/* Unlock Animation Overlay */}
        {newUnlocks.includes(toolKey) && showUnlockAnimation && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-500 opacity-20 animate-pulse"></div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl p-2 rounded-lg ${
                isUnlocked 
                  ? `bg-gradient-to-r ${tool.color}` 
                  : 'bg-gray-700 grayscale'
              }`}>
                {tool.icon}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  isUnlocked ? 'text-white' : 'text-gray-400'
                }`}>
                  {tool.name}
                </h3>
                <p className={`text-sm ${
                  isUnlocked ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {tool.description}
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isUnlocked 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-gray-700 text-gray-400 border border-gray-600'
            }`}>
              {isUnlocked ? 'Available' : 'Locked'}
            </div>
          </div>

          {/* Requirements and Progress */}
          <div className="space-y-3">
            <div className="text-sm text-gray-400">
              <span className="font-medium">Unlock Requirements:</span>
              <p className="mt-1">{tool.requirement}</p>
            </div>

            {!isUnlocked && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-gray-300">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${tool.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {progress < 100 && (
                  <div className="text-xs text-gray-500 mt-2">
                    {toolKey === 'COST_CALCULATOR' && 
                      `${getQualifyingICPScores()}/${tool.requiredCompletions} qualifying ICP analyses completed`
                    }
                    {toolKey === 'BUSINESS_CASE' && 
                      `${getCostCalculatorCompletions()}/${tool.requiredCompletions} cost analyses completed`
                    }
                  </div>
                )}
              </div>
            )}

            {isUnlocked && (
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Methodology accessible</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleToolSelect = (toolId) => {
    if (onToolNavigate) {
      onToolNavigate(toolId);
    } else {
      // Default navigation
      const basePath = window.location.pathname.split('/dashboard')[0];
      window.location.href = `${basePath}/dashboard/${toolId}`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tool Unlock Modal */}
      <ToolUnlockModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        unlockedTool={modalState.unlockedTool}
        competencyAchieved={modalState.competencyAchieved}
        onNavigateToTool={navigateToTool}
      />

      {/* View Tabs */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeView === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Access Overview
          </button>
          {showProgression && (
            <button
              onClick={() => setActiveView('progression')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeView === 'progression' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Methodology Path
            </button>
          )}
          {showReadiness && (
            <button
              onClick={() => setActiveView('readiness')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                activeView === 'readiness' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Readiness Status
            </button>
          )}
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'progression' && showProgression && (
        <MethodologyProgression
          customerId={customerId}
          onToolSelect={handleToolSelect}
        />
      )}

      {activeView === 'readiness' && showReadiness && (
        <div className="space-y-4">
          <CompetencyReadiness
            customerId={customerId}
            targetTool="cost-calculator"
          />
          <CompetencyReadiness
            customerId={customerId}
            targetTool="business-case"
          />
        </div>
      )}

      {/* Original Overview (default view) */}
      {activeView === 'overview' && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Methodology Access Framework</h2>
            <p className="text-gray-400">
              Systematic methodology ensures optimal implementation success
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {Object.entries(toolStatus).map(([key, tool]) => (
              <ToolAccessCard key={key} toolKey={key} tool={tool} />
            ))}
          </div>

          {/* Overall Progress Summary */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Access Progress Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {Object.values(toolStatus).filter(t => t.unlocked).length}
                </div>
                <div className="text-sm text-gray-400">Methodologies Available</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {getICPCompletionCount() + getCostCalculatorCompletions()}
                </div>
                <div className="text-sm text-gray-400">Analyses Completed</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(Object.values(toolStatus).reduce((sum, tool) => sum + getProgressTowardsUnlock(Object.keys(toolStatus).find(k => toolStatus[k] === tool)), 0) / Object.keys(toolStatus).length)}%
                </div>
                <div className="text-sm text-gray-400">Overall Access Progress</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressiveToolAccess;