import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Calculator, 
  FileText, 
  BarChart3,
  BookOpen,
  Lock, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Unlock,
  Star
} from 'lucide-react';
import MethodologyUnlockNotification, { useMethodologyUnlock } from '../notifications/MethodologyUnlockNotification';
import { competencyService } from '../../services/competencyService';

const EnhancedTabNavigation = ({ 
  activeTab, 
  onTabChange, 
  workflowData = {},
  workflowStatus = {},
  completionPercentage = 0,
  customerId
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [toolAccessStatus, setToolAccessStatus] = useState({});
  const [previousAccessStatus, setPreviousAccessStatus] = useState({});
  const { notification, showUnlockNotification, hideNotification } = useMethodologyUnlock();

  // Tab configuration with competency-based progressive access
  const tabConfig = [
    {
      id: 'competency',
      name: 'Professional Development',
      icon: BookOpen,
      step: 0,
      description: 'Personalized competency tracking and professional growth',
      professionalLevel: 'Assessment-Driven',
      competencyArea: 'Professional Development',
      isAvailable: () => true, // Always available - assessment-driven dashboard
      isCompleted: () => false, // Never truly "completed" - ongoing development
      getBadge: () => null,
      getUnlockReason: () => 'Assessment-driven professional development dashboard',
      route: 'competency'
    },
    {
      id: 'icp',
      name: 'ICP Analysis',
      icon: Target,
      step: 1,
      description: 'Export-ready buyer personas for AI/CRM/Sales automation',
      professionalLevel: 'Foundation Level',
      competencyArea: 'Customer Intelligence',
      isAvailable: () => true, // Always available - foundation tool
      isCompleted: () => workflowData.icp_completed,
      getBadge: () => workflowData.icp_completed && workflowData.icp_score ? `${workflowData.icp_score}% match` : null,
      getUnlockReason: () => 'Foundational customer analysis methodology - always accessible',
      route: 'icp'
    },
    {
      id: 'cost-calculator',
      name: 'Cost Calculator',
      icon: Calculator,
      step: 2,
      description: 'Financial intelligence for prospect conversations',
      professionalLevel: 'Developing Level',
      competencyArea: 'Value Quantification',
      isAvailable: () => toolAccessStatus['cost-calculator']?.hasAccess || false,
      isCompleted: () => workflowData.cost_calculated,
      getBadge: () => workflowData.cost_calculated && workflowData.annual_cost ? `$${formatLargeNumber(workflowData.annual_cost)} risk` : null,
      getUnlockReason: () => toolAccessStatus['cost-calculator']?.reason || 'Customer analysis competency required',
      getProgress: () => toolAccessStatus['cost-calculator']?.progress || { required: 3, completed: 0 },
      route: 'cost-calculator'
    },
    {
      id: 'business-case',
      name: 'Business Case',
      icon: FileText,
      step: 3,
      description: 'Executive-ready proposals with export capabilities',
      professionalLevel: 'Proficient Level',
      competencyArea: 'Strategic Development',
      isAvailable: () => toolAccessStatus['business-case']?.hasAccess || false,
      isCompleted: () => workflowData.business_case_ready,
      getBadge: () => workflowData.selected_template || (workflowData.business_case_ready ? 'Complete' : null),
      getUnlockReason: () => toolAccessStatus['business-case']?.reason || 'Value articulation mastery required',
      getProgress: () => toolAccessStatus['business-case']?.progress || { required: 2, completed: 0 },
      route: 'business-case'
    },
    {
      id: 'results',
      name: 'Export Dashboard',
      icon: BarChart3,
      step: 4,
      description: 'Multi-platform export hub for your tech stack',
      professionalLevel: 'Executive Level',
      competencyArea: 'Strategic Communication',
      isAvailable: () => workflowData.business_case_ready || completionPercentage > 75,
      isCompleted: () => completionPercentage === 100,
      getBadge: () => completionPercentage === 100 ? 'Ready' : null,
      getUnlockReason: () => 'Complete strategic business case development',
      route: 'results'
    }
  ];

  // Format large numbers for badges
  const formatLargeNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const completedTabs = tabConfig.filter(tab => tab.isCompleted()).length;
    return (completedTabs / tabConfig.length) * 100;
  };

  // Load tool access status and check for unlocks
  useEffect(() => {
    if (!customerId) return;

    const checkAccessStatus = async () => {
      try {
        const recordId = customerId; // Assuming customerId is the recordId
        const accessStatus = await competencyService.getToolAccessStatus(recordId);
        
        if (accessStatus) {
          // Check for new unlocks
          const unlockCheck = await competencyService.checkForUnlocks(recordId, previousAccessStatus);
          
          if (unlockCheck.hasUnlocks && unlockCheck.unlocks.length > 0) {
            const firstUnlock = unlockCheck.unlocks[0];
            showUnlockNotification(
              firstUnlock.tool,
              firstUnlock.competencyAchieved,
              firstUnlock.level
            );
          }

          setPreviousAccessStatus(toolAccessStatus);
          setToolAccessStatus(accessStatus);
        }
      } catch (error) {
        console.warn('Error checking tool access status:', error);
        // Fallback to basic workflow-based access
        setToolAccessStatus({
          'icp': { hasAccess: true },
          'cost-calculator': { hasAccess: workflowData.icp_completed },
          'business-case': { hasAccess: workflowData.cost_calculated }
        });
      }
    };

    checkAccessStatus();
  }, [customerId, workflowData, showUnlockNotification, previousAccessStatus, toolAccessStatus]);

  // Animate progress bar
  useEffect(() => {
    const targetProgress = calculateProgress();
    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;
    const increment = (targetProgress - animatedProgress) / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedProgress(prev => {
        const newValue = prev + increment;
        if (currentStep >= steps || Math.abs(newValue - targetProgress) < 1) {
          clearInterval(timer);
          return targetProgress;
        }
        return newValue;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [workflowData, animatedProgress, calculateProgress]);

  // Get tab status
  const getTabStatus = (tab) => {
    if (tab.isCompleted()) return 'completed';
    if (tab.id === activeTab) return 'current';
    if (tab.isAvailable()) return 'available';
    return 'locked';
  };

  // Get status styling
  const getStatusStyling = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 border-green-700 text-green-100 hover:bg-green-900/40';
      case 'current':
        return 'bg-blue-900/50 border-blue-500 text-blue-100 ring-2 ring-blue-500/50 hover:bg-blue-900/60';
      case 'available':
        return 'bg-blue-900/30 border-blue-700 text-blue-100 hover:bg-blue-900/40';
      case 'locked':
        return 'bg-gray-900 border-gray-700 text-gray-500 opacity-60 cursor-not-allowed';
      default:
        return 'bg-gray-900 border-gray-700 text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'current':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Handle tab click with competency validation
  const handleTabClick = (tab) => {
    if (tab.isAvailable() && onTabChange) {
      onTabChange(tab.route);
    } else if (!tab.isAvailable()) {
      // Show competency requirement tooltip or modal
      console.log(`Access denied: ${tab.getUnlockReason()}`);
    }
  };

  // Generate workflow suggestions
  const getWorkflowSuggestions = () => {
    const suggestions = [];
    
    if (!workflowData.icpCompleted) {
      suggestions.push({
        type: 'next',
        icon: Target,
        text: 'Start with ICP Analysis to identify your ideal customer profile',
        action: 'Begin ICP Analysis'
      });
    } else if (!workflowData.costCalculated) {
      suggestions.push({
        type: 'next',
        icon: Calculator,
        text: 'Calculate the cost of inaction to quantify business impact',
        action: 'Calculate Costs'
      });
    } else if (!workflowData.businessCaseReady) {
      suggestions.push({
        type: 'next',
        icon: FileText,
        text: 'Build your business case to present ROI and value proposition',
        action: 'Build Business Case'
      });
    } else if (!workflowData.resultsGenerated) {
      suggestions.push({
        type: 'next',
        icon: BarChart3,
        text: 'View executive results dashboard with insights and recommendations',
        action: 'View Results'
      });
    } else {
      suggestions.push({
        type: 'complete',
        icon: TrendingUp,
        text: 'All tools completed! Your executive results are ready for presentation',
        action: 'Export Results'
      });
    }

    return suggestions;
  };

  const suggestions = getWorkflowSuggestions();
  const completedCount = tabConfig.filter(tab => tab.isCompleted()).length;

  return (
    <div className="space-y-6">
      {/* Methodology Unlock Notification */}
      <MethodologyUnlockNotification
        isVisible={notification.isVisible}
        onClose={hideNotification}
        unlockedTool={notification.unlockedTool}
        competencyAchieved={notification.competencyAchieved}
        nextSteps={notification.nextSteps}
      />
      {/* Progress Overview */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Workflow Progress</h2>
            <p className="text-sm text-gray-400">
              {completedCount} of {tabConfig.length} steps completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{Math.round(animatedProgress)}%</div>
            <div className="text-xs text-gray-400">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
        
        {/* Mini Steps Indicator */}
        <div className="flex justify-between mt-3">
          {tabConfig.map((tab, index) => (
            <div key={tab.id} className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                tab.isCompleted() ? 'bg-green-500' : 
                tab.id === activeTab ? 'bg-blue-500' : 
                'bg-gray-600'
              }`} />
              <span className="text-xs text-gray-400 mt-1">{tab.step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tabConfig.map((tab, index) => {
          const status = getTabStatus(tab);
          const Icon = tab.icon;
          const badge = tab.getBadge();
          const progress = tab.getProgress ? tab.getProgress() : null;
          const isLocked = status === 'locked';

          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${getStatusStyling(status)}`}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 border-2 border-gray-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{tab.step}</span>
              </div>

              {/* Status Icon */}
              <div className="absolute top-2 right-2">
                {getStatusIcon(status)}
              </div>

              {/* Professional Level Badge */}
              {tab.professionalLevel && (
                <div className="absolute top-2 left-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isLocked ? 'bg-gray-700 text-gray-500' : 'bg-blue-900 text-blue-300 border border-blue-700'
                  }`}>
                    {tab.professionalLevel}
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="mt-8">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </div>
                
                <p className="text-xs opacity-75 mb-2">{tab.description}</p>
                
                {/* Competency Area */}
                {tab.competencyArea && (
                  <p className="text-xs text-blue-400 mb-3 font-medium">
                    {tab.competencyArea}
                  </p>
                )}

                {/* Locked Tool - Show Progress Requirements */}
                {isLocked && progress && (
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Progress Required</span>
                      <span className="text-gray-300">{progress.completed}/{progress.required}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((progress.completed / progress.required) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 leading-tight">
                      {tab.getUnlockReason()}
                    </p>
                  </div>
                )}

                {/* Badge for Available/Completed Tools */}
                {badge && !isLocked && (
                  <div className="inline-block px-2 py-1 bg-gray-800/50 rounded-full text-xs font-medium border border-gray-600">
                    {badge}
                  </div>
                )}

                {/* Locked Tool - Competency Requirement */}
                {isLocked && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-800 rounded-full text-xs font-medium border border-gray-600">
                    <Lock className="w-3 h-3" />
                    <span>Competency Required</span>
                  </div>
                )}
              </div>

              {/* Connection Line (Desktop only) */}
              {index < tabConfig.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
            Workflow Suggestions
          </h3>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const SuggestionIcon = suggestion.icon;
              
              return (
                <div
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    suggestion.type === 'complete' 
                      ? 'bg-green-900/20 border-green-800 text-green-100'
                      : suggestion.type === 'next'
                      ? 'bg-blue-900/20 border-blue-800 text-blue-100'
                      : 'bg-yellow-900/20 border-yellow-800 text-yellow-100'
                  }`}
                >
                  <SuggestionIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    suggestion.type === 'complete' ? 'text-green-400' :
                    suggestion.type === 'next' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`} />
                  
                  <div className="flex-1">
                    <p className="text-sm">{suggestion.text}</p>
                    {suggestion.action && (
                      <button className="text-xs font-medium mt-1 underline opacity-75 hover:opacity-100 transition-opacity">
                        {suggestion.action} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTabNavigation;