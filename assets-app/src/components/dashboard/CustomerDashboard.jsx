import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import EnhancedTabNavigation from '../navigation/EnhancedTabNavigation';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';
import LoadingSpinner from '../common/LoadingSpinner';
import { Callout } from '../common/ContentDisplay';
import { authService } from '../../services/authService';
import CompetencyDashboard from '../competency/CompetencyDashboard';

const CustomerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customerId } = useParams();
  const [showCompetencyDashboard, setShowCompetencyDashboard] = useState(true);
  
  const {
    workflowData,
    workflowProgress,
    userPreferences,
    usageAnalytics,
    workflowStatus,
    loading,
    error,
    completeTool,
    startTool,
    updateProgress,
    trackExport: trackExportAction,
    initializeWorkflow
  } = useWorkflowProgress(customerId);

  // Get current active tab from route
  const getActiveTab = () => {
    if (location.pathname.includes('cost-calculator')) return 'cost';
    if (location.pathname.includes('business-case')) return 'business_case';
    if (location.pathname.includes('results')) return 'results';
    return 'icp';
  };

  // Handle tab navigation
  const handleTabChange = (tabRoute) => {
    const session = authService.getCurrentSession();
    const queryString = session?.accessToken ? `?token=${session.accessToken}` : '';
    
    // Start tool timer when navigating
    const toolName = tabRoute === 'cost-calculator' ? 'cost' : 
                    tabRoute === 'business-case' ? 'business_case' : tabRoute;
    startTool(toolName);
    
    navigate(`/customer/${customerId}/dashboard/${tabRoute}${queryString}`);
  };

  // Initialize workflow if needed on mount
  useEffect(() => {
    if (customerId && !workflowProgress && !loading) {
      initializeWorkflow();
    }
  }, [customerId, workflowProgress, loading, initializeWorkflow]);

  // Tool completion callbacks to pass to child components
  const toolCallbacks = {
    onICPComplete: async (data) => {
      try {
        const result = await completeTool('icp', {
          score: data.overallScore,
          company_name: data.companyName
        });
        
        if (result.success) {
          // Auto-navigate to next tool if score is good
          if (data.overallScore >= 60) {
            setTimeout(() => {
              handleTabChange('cost-calculator');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error completing ICP:', error);
      }
    },

    onCostCalculated: async (data) => {
      try {
        const result = await completeTool('cost', {
          annual_cost: data.totalAnnualCost
        });
        
        if (result.success) {
          // Auto-navigate to next tool
          setTimeout(() => {
            handleTabChange('business-case');
          }, 2000);
        }
      } catch (error) {
        console.error('Error completing Cost Calculator:', error);
      }
    },

    onBusinessCaseReady: async (data) => {
      try {
        const result = await completeTool('business_case', {
          selected_template: data.selectedTemplate
        });
        
        if (result.success) {
          // Auto-navigate to results
          setTimeout(() => {
            handleTabChange('results');
          }, 2000);
        }
      } catch (error) {
        console.error('Error completing Business Case:', error);
      }
    },

    onExport: async (exportData) => {
      try {
        await trackExportAction(getActiveTab(), exportData.format);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner message="Loading workflow progress..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Callout type="error" title="Error Loading Workflow">
          {error}
        </Callout>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Navigation */}
      <EnhancedTabNavigation 
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        workflowData={workflowProgress}
        workflowStatus={workflowStatus}
        completionPercentage={workflowProgress?.completion_percentage || 0}
        customerId={customerId}
      />
      
      {/* Professional Development Center - Stealth Gamification */}
      <CompetencyDashboard 
        customerId={customerId}
        isVisible={showCompetencyDashboard}
        className="mb-8"
      />
      
      {/* Tool Content Area */}
      <div className="tool-content">
        <Outlet context={toolCallbacks} />
      </div>
    </div>
  );
};

export default CustomerDashboard;