import { useState, useEffect, useCallback } from 'react';
import { airtableService } from '../services/airtableService';
import { authService } from '../services/authService';

// Custom hook for managing workflow progress
export const useWorkflowProgress = () => {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const session = authService.getCurrentSession();
  const recordId = session?.recordId;

  // Load initial workflow progress
  const loadWorkflowProgress = useCallback(async () => {
    if (!recordId) {
      setError('No valid session found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const customerData = await airtableService.getCustomerDataByRecordId(recordId);
      setWorkflowData(customerData.workflowProgress);
    } catch (err) {
      console.error('Error loading workflow progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  // Update workflow progress
  const updateProgress = useCallback(async (progressUpdate) => {
    if (!recordId) {
      throw new Error('No valid session found');
    }

    try {
      const updatedProgress = await airtableService.updateWorkflowProgress(recordId, progressUpdate);
      setWorkflowData(updatedProgress);
      return updatedProgress;
    } catch (err) {
      console.error('Error updating workflow progress:', err);
      setError(err.message);
      throw err;
    }
  }, [recordId]);

  // Tool completion handlers
  const handleICPCompletion = useCallback(async (data) => {
    try {
      const result = await airtableService.handleICPCompletion(recordId, data);
      await loadWorkflowProgress(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error handling ICP completion:', err);
      throw err;
    }
  }, [recordId, loadWorkflowProgress]);

  const handleCostCalculatorCompletion = useCallback(async (data) => {
    try {
      const result = await airtableService.handleCostCalculatorCompletion(recordId, data);
      await loadWorkflowProgress(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error handling Cost Calculator completion:', err);
      throw err;
    }
  }, [recordId, loadWorkflowProgress]);

  const handleBusinessCaseCompletion = useCallback(async (data) => {
    try {
      const result = await airtableService.handleBusinessCaseCompletion(recordId, data);
      await loadWorkflowProgress(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error handling Business Case completion:', err);
      throw err;
    }
  }, [recordId, loadWorkflowProgress]);

  const handleResultsGenerated = useCallback(async (data) => {
    try {
      const result = await airtableService.handleResultsGenerated(recordId, data);
      await loadWorkflowProgress(); // Refresh data
      return result;
    } catch (err) {
      console.error('Error handling Results generation:', err);
      throw err;
    }
  }, [recordId, loadWorkflowProgress]);

  // Export and share tracking
  const trackExport = useCallback(async (exportData) => {
    try {
      await airtableService.trackExport(recordId, exportData);
    } catch (err) {
      console.error('Error tracking export:', err);
    }
  }, [recordId]);

  const trackShare = useCallback(async (shareData) => {
    try {
      await airtableService.trackShare(recordId, shareData);
    } catch (err) {
      console.error('Error tracking share:', err);
    }
  }, [recordId]);

  // Load data on mount and when recordId changes
  useEffect(() => {
    loadWorkflowProgress();
  }, [loadWorkflowProgress]);

  // Start session tracking on mount
  useEffect(() => {
    if (recordId) {
      airtableService.startSession(recordId).catch(err => {
        console.error('Error starting session:', err);
      });
    }
  }, [recordId]);

  return {
    workflowData,
    loading,
    error,
    updateProgress,
    handleICPCompletion,
    handleCostCalculatorCompletion,
    handleBusinessCaseCompletion,
    handleResultsGenerated,
    trackExport,
    trackShare,
    refreshData: loadWorkflowProgress
  };
};