import { useState, useEffect, useCallback } from 'react';
import { airtableService } from '../services/airtableService';
import { authService } from '../services/authService';

// Custom hook for managing workflow progress
export const useWorkflowProgress = (customerId) => {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toolStartTime, setToolStartTime] = useState(null);

  const session = authService.getCurrentSession();
  const recordId = session?.recordId;
  
  // If customerId is null or undefined, don't load workflow data
  const shouldLoad = customerId && customerId !== null;

  // Load initial workflow progress
  const loadWorkflowProgress = useCallback(async () => {
    if (!shouldLoad) {
      setLoading(false);
      return;
    }
    
    if (!recordId) {
      setError('No valid session found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const customerData = await airtableService.getCustomerDataByRecordId(recordId);
      setWorkflowData({
        workflowProgress: customerData.workflowProgress,
        userPreferences: customerData.userPreferences,
        usageAnalytics: customerData.usageAnalytics,
        customerData: customerData
      });
    } catch (err) {
      console.error('Error loading workflow progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recordId, shouldLoad]);

  // Initialize workflow with default values
  const initializeWorkflow = useCallback(async () => {
    if (!recordId) return;
    
    try {
      // Check if workflow data already exists
      if (workflowData?.workflowProgress) return;
      
      // Initialize with defaults by updating with empty object
      await airtableService.updateWorkflowProgress(recordId, {});
      await airtableService.updateUserPreferences(recordId, {});
      await airtableService.updateUsageAnalytics(recordId, {});
      
      // Reload data
      await loadWorkflowProgress();
    } catch (err) {
      console.error('Error initializing workflow:', err);
      setError(err.message);
    }
  }, [recordId, workflowData, loadWorkflowProgress]);

  // Update workflow progress
  const updateProgress = useCallback(async (progressUpdate) => {
    if (!recordId) {
      throw new Error('No valid session found');
    }

    try {
      const updatedProgress = await airtableService.updateWorkflowProgress(recordId, progressUpdate);
      setWorkflowData(prev => ({
        ...prev,
        workflowProgress: updatedProgress
      }));
      return updatedProgress;
    } catch (err) {
      console.error('Error updating workflow progress:', err);
      setError(err.message);
      throw err;
    }
  }, [recordId, shouldLoad]);

  // Complete tool workflow
  const completeTool = useCallback(async (toolName, toolData = {}) => {
    if (!recordId) return { success: false, error: 'No session' };
    
    try {
      // Track time spent if tool was started
      if (toolStartTime) {
        const timeSpent = Math.round((Date.now() - toolStartTime) / 1000);
        toolData.timeSpent = timeSpent;
        setToolStartTime(null);
      }

      // Call appropriate completion handler
      let result;
      switch (toolName) {
        case 'icp':
          result = await airtableService.handleICPCompletion(recordId, toolData);
          break;
        case 'cost':
          result = await airtableService.handleCostCalculatorCompletion(recordId, toolData);
          break;
        case 'business_case':
          result = await airtableService.handleBusinessCaseCompletion(recordId, toolData);
          break;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      // Refresh workflow data
      await loadWorkflowProgress();
      
      return { success: true, result };
    } catch (err) {
      console.error(`Error completing tool ${toolName}:`, err);
      return { success: false, error: err.message };
    }
  }, [recordId, toolStartTime, loadWorkflowProgress]);

  // Start tool timer
  const startTool = useCallback((toolName) => {
    setToolStartTime(Date.now());
    updateProgress({ last_active_tool: toolName });
  }, [updateProgress]);

  // Update user preferences
  const updatePreferences = useCallback(async (preferencesUpdate) => {
    if (!recordId) return;
    
    try {
      const updatedPreferences = await airtableService.updateUserPreferences(recordId, preferencesUpdate);
      setWorkflowData(prev => ({
        ...prev,
        userPreferences: updatedPreferences
      }));
      return updatedPreferences;
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err.message);
    }
  }, [recordId, shouldLoad]);

  // Track export
  const trackExport = useCallback(async (exportType, format) => {
    if (!recordId) return;
    
    try {
      await airtableService.trackExport(recordId, { format, tool: exportType });
      await loadWorkflowProgress(); // Refresh to get updated export history
    } catch (err) {
      console.error('Error tracking export:', err);
    }
  }, [recordId, loadWorkflowProgress]);

  // Get workflow status for navigation
  const getWorkflowStatus = useCallback(() => {
    if (!workflowData?.workflowProgress) return null;
    
    const progress = workflowData.workflowProgress;
    return {
      canAccessCost: progress.icp_completed,
      canAccessBusinessCase: progress.icp_completed && progress.cost_calculated,
      canExport: progress.icp_completed && progress.cost_calculated && progress.business_case_ready,
      nextRecommendedTool: !progress.icp_completed ? 'icp' :
                         !progress.cost_calculated ? 'cost' :
                         !progress.business_case_ready ? 'business_case' : 'completed',
      completionPercentage: progress.completion_percentage || 0
    };
  }, [workflowData]);

  // Load data on mount
  useEffect(() => {
    if (shouldLoad && recordId) {
      loadWorkflowProgress();
    } else if (!shouldLoad) {
      setLoading(false);
    }
  }, [loadWorkflowProgress, recordId, shouldLoad]);

  // Start session tracking on mount (with error handling)
  useEffect(() => {
    let sessionCleanup;
    
    if (recordId) {
      airtableService.startSession(recordId).catch(err => {
        // Don't set error state for session tracking failures
        console.warn('Session tracking failed (non-critical):', err.message);
      });
      
      // Setup cleanup function for session tracking
      sessionCleanup = () => {
        // End session if service supports it
        if (airtableService.endSession) {
          airtableService.endSession(recordId).catch(err => {
            console.warn('Session cleanup failed (non-critical):', err.message);
          });
        }
      };
    }
    
    // Cleanup function
    return () => {
      if (sessionCleanup) {
        sessionCleanup();
      }
    };
  }, [recordId, shouldLoad]);

  return {
    // Data
    workflowData: workflowData?.customerData,
    workflowProgress: workflowData?.workflowProgress,
    userPreferences: workflowData?.userPreferences,
    usageAnalytics: workflowData?.usageAnalytics,
    
    // Status
    loading,
    error,
    workflowStatus: getWorkflowStatus(),
    
    // Actions
    updateProgress,
    completeTool,
    startTool,
    updatePreferences,
    trackExport,
    loadWorkflow: loadWorkflowProgress,
    initializeWorkflow,
    
    // Helper methods
    clearError: () => setError(null),
    refreshWorkflow: loadWorkflowProgress
  };
};