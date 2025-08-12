import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWorkflowProgress } from '../hooks/useWorkflowProgress';
import EnhancedTabNavigation from '../components/navigation/EnhancedTabNavigation';
import ICPDisplay from '../components/tools/ICPDisplay';
import CostCalculator from '../components/tools/CostCalculator';
import BusinessCaseBuilder from '../components/tools/BusinessCaseBuilder';
import ResultsDashboard from '../components/results/ResultsDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Callout } from '../components/common/ContentDisplay';
import { authService } from '../services/authService';

const CustomerDashboard = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Workflow management hook
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

  // Track current active tool
  const [currentTool, setCurrentTool] = useState('icp');

  // Get current active tab from route
  const getActiveTab = () => {
    if (location.pathname.includes('cost-calculator')) return 'cost';
    if (location.pathname.includes('business-case')) return 'business_case';
    if (location.pathname.includes('results')) return 'results';
    return 'icp';
  };

  // Handle tab navigation with workflow tracking
  const handleTabChange = (tabRoute) => {
    const session = authService.getCurrentSession();
    const queryString = session?.accessToken ? `?token=${session.accessToken}` : '';
    
    // Map route to tool name for tracking
    const toolName = tabRoute === 'cost-calculator' ? 'cost' : 
                    tabRoute === 'business-case' ? 'business_case' : tabRoute;
    
    // Start tool timer
    startTool(toolName);
    setCurrentTool(toolName);
    
    // Navigate to route
    navigate(`/customer/${customerId}/dashboard/${tabRoute}${queryString}`);
  };

  // Initialize workflow on mount
  useEffect(() => {
    if (customerId && !workflowProgress && !loading) {
      initializeWorkflow();
    }
  }, [customerId, workflowProgress, loading, initializeWorkflow]);

  // Tool completion callbacks
  const toolCallbacks = {
    // ICP Tool Completion
    onICPComplete: async (data) => {
      try {
        console.log('ICP Completion triggered:', data);
        const result = await completeTool('icp', {
          score: data.overallScore,
          company_name: data.companyName
        });
        
        if (result.success && data.overallScore >= 60) {
          // Show success message and auto-navigate after delay
          setTimeout(() => {
            handleTabChange('cost-calculator');
          }, 2000);
        }
      } catch (error) {
        console.error('Error completing ICP:', error);
      }
    },

    // Cost Calculator Completion
    onCostCalculated: async (data) => {
      try {
        console.log('Cost Calculator completion triggered:', data);
        const result = await completeTool('cost', {
          annual_cost: data.totalAnnualCost
        });
        
        if (result.success) {
          // Auto-navigate to business case
          setTimeout(() => {
            handleTabChange('business-case');
          }, 2000);
        }
      } catch (error) {
        console.error('Error completing Cost Calculator:', error);
      }
    },

    // Business Case Completion
    onBusinessCaseReady: async (data) => {
      try {
        console.log('Business Case completion triggered:', data);
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

    // Export tracking
    onExport: async (exportData) => {
      try {
        await trackExportAction(getActiveTab(), exportData.format);
        console.log('Export tracked:', exportData);
      } catch (error) {
        console.error('Error tracking export:', error);
      }
    },

    // Progress updates
    onUpdateProgress: async (progressData) => {
      try {
        await updateProgress(progressData);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }
  };

  // Render current tool based on route
  const renderCurrentTool = () => {
    const activeTab = getActiveTab();
    
    switch (activeTab) {
      case 'icp':
        return (
          <ICPDisplay 
            onICPComplete={toolCallbacks.onICPComplete}
            onUpdateProgress={toolCallbacks.onUpdateProgress}
            workflowData={workflowProgress}
          />
        );
      
      case 'cost':
        return (
          <CostCalculator 
            onCostCalculated={toolCallbacks.onCostCalculated}
            onUpdateProgress={toolCallbacks.onUpdateProgress}
            workflowData={workflowProgress}
            icpData={{ 
              score: workflowProgress?.icp_score,
              companyName: workflowProgress?.company_name 
            }}
          />
        );
      
      case 'business_case':
        return (
          <BusinessCaseBuilder 
            onBusinessCaseReady={toolCallbacks.onBusinessCaseReady}
            onUpdateProgress={toolCallbacks.onUpdateProgress}
            workflowData={workflowProgress}
            costData={{ 
              annualCost: workflowProgress?.annual_cost 
            }}
          />
        );
      
      case 'results':
        return (
          <ResultsDashboard 
            onExport={toolCallbacks.onExport}
            workflowData={workflowProgress}
            completionPercentage={workflowProgress?.completion_percentage}
          />
        );
      
      default:
        return <ICPDisplay onICPComplete={toolCallbacks.onICPComplete} />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner message="Loading workflow progress..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <Callout type="error" title="Error Loading Workflow">
          {error}
        </Callout>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Workflow Progress Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Business Assessment Platform
          </h1>
          <p className="text-gray-400">
            {workflowProgress?.company_name && `Company: ${workflowProgress.company_name} • `}
            Progress: {workflowProgress?.completion_percentage || 0}% Complete
          </p>
        </div>

        {/* Enhanced Navigation */}
        <div className="mb-8">
          <EnhancedTabNavigation 
            activeTab={getActiveTab()}
            onTabChange={handleTabChange}
            workflowData={workflowProgress}
            workflowStatus={workflowStatus}
            completionPercentage={workflowProgress?.completion_percentage || 0}
          />
        </div>
        
        {/* Tool Content Area */}
        <div className="tool-content">
          {renderCurrentTool()}
        </div>
        
        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-white font-medium mb-2">Debug Info:</h3>
            <pre className="text-gray-400 text-sm overflow-auto">
              {JSON.stringify({
                activeTab: getActiveTab(),
                workflowStatus,
                completionPercentage: workflowProgress?.completion_percentage,
                toolsCompleted: usageAnalytics?.tools_completed
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;