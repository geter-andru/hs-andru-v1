/**
 * Enhanced Customer Dashboard with Progressive Engagement Integration
 * 
 * Integrates the progressive engagement system with existing functionality.
 * Provides choice between progressive experience and traditional dashboard.
 */

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import EnhancedTabNavigation from '../navigation/EnhancedTabNavigation';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';
import useCompetencyDashboard from '../../hooks/useCompetencyDashboard';
import LoadingSpinner from '../common/LoadingSpinner';
import { Callout } from '../common/ContentDisplay';
import { authService } from '../../services/authService';
import CompetencyDashboard from '../competency/CompetencyDashboard';
import CompetencyOverview from './CompetencyOverview';
import ActiveToolDisplay from './ActiveToolDisplay';
import ProfessionalDevelopment from './ProfessionalDevelopment';
import ProgressiveToolAccess from '../competency/ProgressiveToolAccess';
import ProgressNotifications from '../notifications/ProgressNotifications';
import { useProgressNotifications } from '../notifications/ProgressNotifications';
import ProgressiveEngagementContainer from '../progressive-engagement/ProgressiveEngagementContainer';

const CustomerDashboardEnhanced = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customerId } = useParams();
  
  // Dashboard experience selection
  const [experienceMode, setExperienceMode] = useState('progressive'); // 'progressive' or 'traditional'
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const {
    workflowData,
    workflowProgress,
    userPreferences,
    usageAnalytics,
    workflowStatus,
    loading: workflowLoading,
    error: workflowError,
    completeTool,
    startTool,
    updateProgress,
    trackExport: trackExportAction,
    initializeWorkflow
  } = useWorkflowProgress(customerId);

  const {
    competencyProgress,
    toolAccess,
    milestones,
    dailyObjectives,
    loading: gamificationLoading,
    error: gamificationError,
    handleToolCompletion,
    handleObjectiveCompletion,
    handleToolUnlock,
    checkUnlockCriteria,
    refreshData,
    summaryStats
  } = useCompetencyDashboard(customerId);

  const {
    notifications,
    showProgressRecognition,
    showCompetencyAdvancement,
    showMilestoneReached,
    showToolAccessEarned,
    dismissNotification
  } = useProgressNotifications();

  // Determine experience mode based on user progress
  useEffect(() => {
    const determineExperienceMode = () => {
      // If user has completed any tools, default to traditional
      const hasCompletedAnyTool = workflowProgress && (
        workflowProgress.icp_completed || 
        workflowProgress.cost_completed || 
        workflowProgress.business_case_completed
      );

      // Check URL parameter for forced mode
      const urlParams = new URLSearchParams(location.search);
      const forcedMode = urlParams.get('experience');
      
      if (forcedMode === 'progressive' || forcedMode === 'traditional') {
        setExperienceMode(forcedMode);
      } else if (!hasCompletedAnyTool) {
        // New users get progressive experience
        setExperienceMode('progressive');
      } else {
        // Returning users get traditional dashboard
        setExperienceMode('traditional');
      }
    };

    if (workflowProgress) {
      determineExperienceMode();
    }
  }, [workflowProgress, location.search]);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current active tab from route
  const getActiveTab = () => {
    if (location.pathname.includes('cost-calculator')) return 'cost';
    if (location.pathname.includes('business-case')) return 'business_case';
    if (location.pathname.includes('results')) return 'results';
    return 'icp';
  };

  // Enhanced tab navigation with access control
  const handleTabChange = async (tabRoute) => {
    const session = authService.getCurrentSession();
    const queryString = session?.accessToken ? `?token=${session.accessToken}` : '';
    
    // Check tool access before navigation
    const toolName = tabRoute === 'cost-calculator' ? 'cost_calculator' : 
                    tabRoute === 'business-case' ? 'business_case_builder' : 
                    'icp_analysis';
    
    if (toolAccess[toolName] && !toolAccess[toolName].access) {
      // Show access denied notification
      showProgressRecognition(
        'Advanced Methodology Locked',
        0
      );
      return;
    }
    
    // Start tool timer when navigating
    const timerToolName = tabRoute === 'cost-calculator' ? 'cost' : 
                         tabRoute === 'business-case' ? 'business_case' : tabRoute;
    startTool(timerToolName);
    
    navigate(`/customer/${customerId}/dashboard/${tabRoute}${queryString}`);
  };

  // Initialize workflow if needed on mount
  useEffect(() => {
    if (customerId && !workflowProgress && !workflowLoading) {
      initializeWorkflow();
    }
  }, [customerId, workflowProgress, workflowLoading, initializeWorkflow]);

  // Enhanced tool completion callbacks with gamification integration
  const toolCallbacks = {
    onICPComplete: async (data) => {
      try {
        // Process with both workflow and gamification systems
        const [workflowResult, gamificationResult] = await Promise.all([
          completeTool('icp', {
            score: data.overallScore,
            company_name: data.companyName,
            timeSpent: data.timeSpent
          }),
          handleToolCompletion('icp', {
            score: data.overallScore,
            companyName: data.companyName,
            timeSpent: data.timeSpent
          })
        ]);
        
        // Show gamification feedback
        if (gamificationResult.success && gamificationResult.gamification) {
          const { gamification } = gamificationResult;
          
          if (gamification.pointsAwarded > 0) {
            showProgressRecognition('Customer Analysis Completed', gamification.pointsAwarded);
          }
          
          if (gamification.milestoneAchieved) {
            showMilestoneReached('Professional Milestone', 'Customer Intelligence Foundation', 50);
          }
          
          if (gamification.toolUnlocked) {
            showToolAccessEarned('Cost Calculator Methodology');
          }
        }
        
        // Check for auto-unlock and navigation
        await checkUnlockCriteria();
        
        if (workflowResult.success && data.overallScore >= 60) {
          setTimeout(() => {
            handleTabChange('cost-calculator');
          }, 3000);
        }
        
        return workflowResult;
      } catch (error) {
        console.error('Error completing ICP:', error);
        throw error;
      }
    },

    onCostCalculated: async (data) => {
      try {
        const [workflowResult, gamificationResult] = await Promise.all([
          completeTool('cost', {
            annual_cost: data.totalAnnualCost,
            timeSpent: data.timeSpent
          }),
          handleToolCompletion('cost', {
            annualCost: data.totalAnnualCost,
            timeSpent: data.timeSpent
          })
        ]);
        
        // Show gamification feedback
        if (gamificationResult.success && gamificationResult.gamification) {
          const { gamification } = gamificationResult;
          
          if (gamification.pointsAwarded > 0) {
            showProgressRecognition('Value Quantification Completed', gamification.pointsAwarded);
          }
          
          if (gamification.milestoneAchieved) {
            showMilestoneReached('Professional Milestone', 'Value Articulation Mastery', 75);
          }
          
          if (gamification.toolUnlocked) {
            showToolAccessEarned('Business Case Builder Methodology');
          }
        }
        
        await checkUnlockCriteria();
        
        if (workflowResult.success) {
          setTimeout(() => {
            handleTabChange('business-case');
          }, 3000);
        }
        
        return workflowResult;
      } catch (error) {
        console.error('Error completing Cost Calculator:', error);
        throw error;
      }
    },

    onBusinessCaseReady: async (data) => {
      try {
        const [workflowResult, gamificationResult] = await Promise.all([
          completeTool('business_case', {
            selected_template: data.selectedTemplate,
            timeSpent: data.timeSpent
          }),
          handleToolCompletion('business_case', {
            templateName: data.selectedTemplate,
            timeSpent: data.timeSpent
          })
        ]);
        
        // Show gamification feedback
        if (gamificationResult.success && gamificationResult.gamification) {
          const { gamification } = gamificationResult;
          
          if (gamification.pointsAwarded > 0) {
            showProgressRecognition('Strategic Proposal Completed', gamification.pointsAwarded);
          }
          
          if (gamification.milestoneAchieved) {
            showMilestoneReached('Professional Milestone', 'Strategic Communication Mastery', 100);
          }
          
          if (gamification.comprehensiveMilestone) {
            showMilestoneReached('Master Achievement', 'Comprehensive Revenue Strategist', 200);
          }
        }
        
        if (workflowResult.success) {
          setTimeout(() => {
            handleTabChange('results');
          }, 3000);
        }
        
        return workflowResult;
      } catch (error) {
        console.error('Error completing Business Case:', error);
        throw error;
      }
    },

    onExport: async (exportData) => {
      try {
        await trackExportAction(getActiveTab(), exportData.format);
        showProgressRecognition('Professional Export Completed', 10);
      } catch (error) {
        console.error('Error tracking export:', error);
      }
    },

    onUpdateProgress: async (progressData) => {
      try {
        await updateProgress(progressData);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  // Handle progressive engagement tool completion
  const handleProgressiveToolCompletion = async (toolName, completionData) => {
    // Map progressive tool names to traditional callback names
    const toolMapping = {
      'icp_analysis': 'onICPComplete',
      'cost_calculator': 'onCostCalculated', 
      'business_case': 'onBusinessCaseReady'
    };

    const callback = toolCallbacks[toolMapping[toolName]];
    if (callback) {
      await callback(completionData);
    }

    // Switch to traditional experience after first tool completion
    if (experienceMode === 'progressive') {
      setExperienceMode('traditional');
      // Navigate to traditional dashboard with completed tool
      const route = toolName === 'icp_analysis' ? 'cost-calculator' : 
                   toolName === 'cost_calculator' ? 'business-case' : 'results';
      handleTabChange(route);
    }
  };

  // Handle experience mode toggle
  const toggleExperienceMode = () => {
    const newMode = experienceMode === 'progressive' ? 'traditional' : 'progressive';
    setExperienceMode(newMode);
    
    // Update URL to maintain mode preference
    const url = new URL(window.location);
    url.searchParams.set('experience', newMode);
    window.history.pushState({}, '', url);
  };

  // Combined loading state
  const isLoading = workflowLoading || gamificationLoading;
  const hasError = workflowError || gamificationError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner message="Loading strategic intelligence platform..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <Callout type="error" title="Error Loading Dashboard">
          {workflowError || gamificationError}
        </Callout>
      </div>
    );
  }

  return (
    <>
      {/* Progressive Engagement Experience */}
      {experienceMode === 'progressive' && (
        <ProgressiveEngagementContainer
          customerId={customerId}
          onToolCompletion={handleProgressiveToolCompletion}
        />
      )}

      {/* Traditional Dashboard Experience */}
      {experienceMode === 'traditional' && (
        <div className={`min-h-screen ${isMobile ? 'pb-20' : ''}`}>
          <div className="space-y-6">
            {/* Competency Overview Header */}
            <CompetencyOverview
              customerId={customerId}
              competencyData={competencyProgress}
              onRefresh={refreshData}
              className="w-full"
            />

            {/* Main Content Grid */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
              {/* Tool Area - Takes up most space */}
              <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'} space-y-6`}>
                {/* Progressive Tool Access */}
                <ProgressiveToolAccess
                  customerId={customerId}
                  toolAccess={toolAccess}
                  onToolComplete={handleToolCompletion}
                  onUnlockEarned={handleToolUnlock}
                  className="w-full"
                />

                {/* Enhanced Navigation */}
                <EnhancedTabNavigation 
                  activeTab={getActiveTab()}
                  onTabChange={handleTabChange}
                  workflowData={workflowProgress}
                  workflowStatus={workflowStatus}
                  completionPercentage={workflowProgress?.completion_percentage || 0}
                  customerId={customerId}
                  toolAccess={toolAccess}
                />

                {/* Active Tool Display with Gamification */}
                <ActiveToolDisplay
                  currentTool={getActiveTab()}
                  toolData={workflowProgress}
                  customerId={customerId}
                  onCompletion={async (data) => {
                    // Route to appropriate callback
                    const activeTab = getActiveTab();
                    if (activeTab === 'icp') return await toolCallbacks.onICPComplete(data);
                    if (activeTab === 'cost') return await toolCallbacks.onCostCalculated(data);
                    if (activeTab === 'business_case') return await toolCallbacks.onBusinessCaseReady(data);
                    return data;
                  }}
                  onToolChange={handleTabChange}
                  className="w-full"
                >
                  <Outlet context={toolCallbacks} />
                </ActiveToolDisplay>
              </div>

              {/* Professional Development Sidebar */}
              <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-1'}`}>
                {isMobile ? (
                  /* Mobile: Collapsible Sidebar */
                  <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-700">
                    <button
                      onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                      className="w-full p-4 text-white font-medium flex items-center justify-center space-x-2"
                    >
                      <span>Professional Development</span>
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                        {summaryStats.objectivesCompleted}/{summaryStats.objectivesTotal}
                      </span>
                    </button>
                    
                    {showMobileSidebar && (
                      <div className="absolute bottom-full left-0 right-0 bg-gray-900 border-t border-gray-700 max-h-80 overflow-y-auto">
                        <ProfessionalDevelopment
                          customerId={customerId}
                          milestones={milestones}
                          dailyObjectives={dailyObjectives}
                          onObjectiveComplete={handleObjectiveCompletion}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Desktop: Fixed Sidebar */
                  <div className="sticky top-6">
                    <ProfessionalDevelopment
                      customerId={customerId}
                      milestones={milestones}
                      dailyObjectives={dailyObjectives}
                      onObjectiveComplete={handleObjectiveCompletion}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experience Mode Toggle (Development & Testing) */}
      {(process.env.NODE_ENV === 'development' || new URLSearchParams(location.search).has('debug')) && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <button
            onClick={toggleExperienceMode}
            className="block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg border border-indigo-500 transition-colors duration-200"
          >
            {experienceMode === 'progressive' ? 'Switch to Traditional' : 'Switch to Progressive'}
          </button>
          <div className="text-xs text-gray-400 text-center">
            Current: {experienceMode}
          </div>
        </div>
      )}

      {/* Progress Notifications - Available in both experiences */}
      <ProgressNotifications
        notifications={notifications}
        onDismiss={dismissNotification}
        position="top-right"
      />
    </>
  );
};

export default CustomerDashboardEnhanced;