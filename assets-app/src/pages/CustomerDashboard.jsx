import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWorkflowProgress } from '../hooks/useWorkflowProgress';
import EnhancedTabNavigation from '../components/navigation/EnhancedTabNavigation';
import WelcomeHero from '../components/progressive-engagement/WelcomeHero';
import ICPDisplay from '../components/tools/ICPDisplay';
import CostCalculator from '../components/tools/CostCalculator';
import BusinessCaseBuilder from '../components/tools/BusinessCaseBuilder';
import ResultsDashboard from '../components/results/ResultsDashboard';
import CompetencyDashboard from '../components/competency/CompetencyDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Callout } from '../components/common/ContentDisplay';
import { authService } from '../services/authService';
import { AssessmentProvider } from '../contexts/AssessmentContext';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import PlatformSwitcher from '../components/platform-switcher/PlatformSwitcher';
import { airtableService } from '../services/airtableService';

const CustomerDashboard = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Authentication state
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Assessment data state
  const [assessmentData, setAssessmentData] = useState(null);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  
  // Handle authentication
  useEffect(() => {
    const authenticateUser = async () => {
      try {
        setAuthLoading(true);
        setAuthError(null);
        
        // Get token from URL params
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        
        if (!customerId || !token) {
          setAuthError('Missing customer ID or access token');
          setAuthLoading(false);
          return;
        }
        
        // Validate credentials
        const result = await authService.validateCredentials(customerId, token);
        
        if (!result.valid) {
          setAuthError(result.error || 'Invalid credentials');
          setAuthLoading(false);
          return;
        }
        
        // Generate session
        authService.generateSession(result.customerData, token);
        setIsAuthenticated(true);
        
        // Load assessment data after authentication
        await loadAssessmentData(customerId, token);
        
      } catch (error) {
        console.error('Authentication error:', error);
        setAuthError(error.message);
      } finally {
        setAuthLoading(false);
      }
    };
    
    // Check existing session first
    const existingSession = authService.getCurrentSession();
    if (existingSession && existingSession.customerId === customerId) {
      setIsAuthenticated(true);
      setAuthLoading(false);
      
      // Load assessment data for existing session
      loadAssessmentData(customerId, existingSession.accessToken);
    } else {
      authenticateUser();
    }
  }, [customerId, location.search]);

  // Load assessment data
  const loadAssessmentData = async (custId, accessToken) => {
    try {
      setLoadingAssessment(true);
      const customerWithAssessment = await airtableService.fetchCustomerWithAssessment(custId, accessToken);
      setAssessmentData(customerWithAssessment);
    } catch (error) {
      console.warn('Could not load assessment data:', error);
      // Set minimal assessment data as fallback
      setAssessmentData({
        name: 'Customer',
        company: 'Company',
        assessment: null,
        competencyBaselines: null,
        competencyProgress: {}
      });
    } finally {
      setLoadingAssessment(false);
    }
  };
  
  // Workflow management hook (only after authentication)
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
  } = useWorkflowProgress(isAuthenticated ? customerId : null);

  // Track current active tool
  const [currentTool, setCurrentTool] = useState('icp');

  // Get current active tab from route
  const getActiveTab = () => {
    if (location.pathname.includes('welcome') || location.pathname === `/customer/${customerId}`) return 'welcome';
    if (location.pathname.includes('dashboard') && !location.pathname.includes('cost-calculator') && !location.pathname.includes('business-case') && !location.pathname.includes('icp') && !location.pathname.includes('results')) return 'competency';
    if (location.pathname.includes('cost-calculator')) return 'cost';
    if (location.pathname.includes('business-case')) return 'business_case';
    if (location.pathname.includes('results')) return 'results';
    if (location.pathname.includes('icp')) return 'icp';
    return 'welcome'; // Default to welcome for new customers
  };

  // Handle tab navigation with workflow tracking
  const handleTabChange = (tabRoute) => {
    const session = authService.getCurrentSession();
    const queryString = session?.accessToken ? `?token=${session.accessToken}` : '';
    
    // Map route to tool name for tracking
    const toolName = tabRoute === 'cost-calculator' ? 'cost' : 
                    tabRoute === 'business-case' ? 'business_case' :
                    tabRoute === 'competency' ? 'dashboard' : tabRoute;
    
    // Start tool timer (only for actual tools, not dashboard)
    if (toolName !== 'dashboard' && toolName !== 'competency') {
      startTool(toolName);
      setCurrentTool(toolName);
    }
    
    // Navigate to route
    const route = tabRoute === 'competency' ? 'dashboard' : `dashboard/${tabRoute}`;
    navigate(`/customer/${customerId}/${route}${queryString}`);
  };

  // Initialize workflow on mount
  useEffect(() => {
    if (customerId && !workflowProgress && !loading) {
      initializeWorkflow();
    }
  }, [customerId, workflowProgress, loading, initializeWorkflow]);

  // Tool completion callbacks
  const toolCallbacks = {
    // Welcome Experience Completion
    onWelcomeComplete: async (nextPhase) => {
      try {
        console.log('Welcome experience completed, navigating to:', nextPhase);
        // Navigate to the next phase (typically ICP analysis)
        const targetPhase = nextPhase === 'icp-analysis' ? 'icp' : nextPhase;
        handleTabChange(targetPhase);
      } catch (error) {
        console.error('Error completing welcome experience:', error);
      }
    },

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
      case 'welcome':
        return (
          <WelcomeHero 
            customerId={customerId}
            customerData={workflowData}
            onStartEngagement={toolCallbacks.onWelcomeComplete}
          />
        );

      case 'competency':
        return (
          <CompetencyDashboard 
            customerData={assessmentData}
          />
        );
        
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
        return (
          <WelcomeHero 
            customerId={customerId}
            customerData={workflowData}
            onStartEngagement={toolCallbacks.onWelcomeComplete}
          />
        );
    }
  };

  // Authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner message="Authenticating..." />
      </div>
    );
  }

  // Authentication error state
  if (authError) {
    return (
      <div className="min-h-screen bg-black p-8 flex items-center justify-center">
        <Callout type="error" title="Authentication Error">
          {authError}
          <div className="mt-4 text-center">
            <a 
              href="/test" 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Try test environment instead
            </a>
          </div>
        </Callout>
      </div>
    );
  }

  // Workflow loading state
  if (!isAuthenticated || loading || loadingAssessment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner message={loadingAssessment ? "Loading Revenue Intelligence Infrastructure..." : "Loading export capabilities..."} />
      </div>
    );
  }

  // Workflow error state
  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <Callout type="error" title="Error Loading Workflow">
          {error}
        </Callout>
      </div>
    );
  }

  const activeTab = getActiveTab();
  const showWelcomeExperience = activeTab === 'welcome';

  return (
    <FeatureFlagProvider customerId={customerId}>
      <AssessmentProvider customerData={assessmentData}>
        <div className="relative">
          {/* Platform Switcher */}
          <PlatformSwitcher customerId={customerId} />
          
          <div className="min-h-screen bg-black">
        {showWelcomeExperience ? (
          // Full-screen welcome experience with DashboardLayout built-in
          <div className="tool-content">
            {renderCurrentTool()}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Assessment-Enhanced Header */}
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Revenue Intelligence Infrastructure
                  </h1>
                  <p className="text-gray-400">
                    {workflowProgress?.company_name && `${workflowProgress.company_name} • `}
                    Export-ready intelligence for your tech stack
                  </p>
                </div>
                
                {/* Assessment Status Indicators */}
                {assessmentData?.assessment && (
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-blue-400">
                      Level: {assessmentData.assessment.performance?.level || 'Not Available'}
                    </div>
                    <div className="text-green-400">
                      Focus: {assessmentData.assessment.strategy?.focusArea || 'General'}
                    </div>
                    <div className="text-purple-400">
                      Revenue: ${Math.round((assessmentData.assessment.revenue?.opportunity || 750000) / 1000)}K
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Navigation */}
            <div className="mb-8">
              <EnhancedTabNavigation 
                activeTab={activeTab}
                onTabChange={handleTabChange}
                workflowData={workflowProgress}
                workflowStatus={workflowStatus}
                completionPercentage={workflowProgress?.completion_percentage || 0}
                assessmentData={assessmentData}
              />
            </div>
            
            {/* Tool Content Area */}
            <div className="tool-content">
              {renderCurrentTool()}
            </div>
          </div>
        )}
      
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && !showWelcomeExperience && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-white font-medium mb-2">Debug Info:</h3>
            <pre className="text-gray-400 text-sm overflow-auto">
              {JSON.stringify({
                activeTab: activeTab,
                workflowStatus,
                completionPercentage: workflowProgress?.completion_percentage,
                toolsCompleted: usageAnalytics?.tools_completed
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
          </div>
        </div>
      </AssessmentProvider>
    </FeatureFlagProvider>
  );
};

export default CustomerDashboard;