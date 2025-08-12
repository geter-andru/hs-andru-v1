import { useState, useEffect, useCallback } from 'react';
import { airtableService } from '../services/airtableService';

const useCompetencyDashboard = (customerId) => {
  const [competencyProgress, setCompetencyProgress] = useState({});
  const [toolAccess, setToolAccess] = useState({});
  const [milestones, setMilestones] = useState({});
  const [dailyObjectives, setDailyObjectives] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Load all gamification data
  const loadGamificationData = useCallback(async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Loading gamification data for customer:', customerId);
      
      // Load all gamification data in parallel
      const [
        competencyData,
        toolAccessData,
        milestoneData,
        objectivesData
      ] = await Promise.allSettled([
        airtableService.loadCompetencyProgress(customerId),
        loadToolAccessStatus(customerId),
        airtableService.loadMilestoneHistory(customerId),
        airtableService.generateDailyObjectives(customerId)
      ]);

      // Process results with error handling
      if (competencyData.status === 'fulfilled') {
        setCompetencyProgress(competencyData.value);
      } else {
        console.warn('Failed to load competency progress:', competencyData.reason);
        setCompetencyProgress({});
      }

      if (toolAccessData.status === 'fulfilled') {
        setToolAccess(toolAccessData.value);
      } else {
        console.warn('Failed to load tool access:', toolAccessData.reason);
        setToolAccess({});
      }

      if (milestoneData.status === 'fulfilled') {
        setMilestones(milestoneData.value);
      } else {
        console.warn('Failed to load milestones:', milestoneData.reason);
        setMilestones({});
      }

      if (objectivesData.status === 'fulfilled') {
        setDailyObjectives(objectivesData.value);
      } else {
        console.warn('Failed to load daily objectives:', objectivesData.reason);
        setDailyObjectives({});
      }

      setLastRefresh(new Date());
      console.log('Gamification data loaded successfully');
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  // Load tool access status for all tools
  const loadToolAccessStatus = async (customerId) => {
    try {
      const customerData = await airtableService.getCustomerDataByRecordId(customerId);
      return customerData.toolAccessStatus || {};
    } catch (error) {
      console.error('Error loading tool access status:', error);
      return {};
    }
  };

  // Handle tool completion with gamification
  const handleToolCompletion = useCallback(async (toolName, completionData) => {
    if (!customerId) return { success: false, error: 'No customer ID' };

    try {
      console.log(`Processing ${toolName} completion with gamification for customer:`, customerId);
      
      let result;
      
      // Route to appropriate completion handler
      switch (toolName) {
        case 'icp':
          result = await airtableService.handleICPCompletion(customerId, completionData);
          break;
        case 'cost':
        case 'cost-calculator':
          result = await airtableService.handleCostCalculatorCompletion(customerId, completionData);
          break;
        case 'business_case':
        case 'business-case':
          result = await airtableService.handleBusinessCaseCompletion(customerId, completionData);
          break;
        case 'results':
          result = await airtableService.handleResultsGenerated(customerId, completionData);
          break;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      // Refresh gamification data after completion
      setTimeout(() => {
        loadGamificationData();
      }, 1000);

      return { success: true, ...result };
    } catch (error) {
      console.error(`Error completing ${toolName}:`, error);
      return { success: false, error: error.message };
    }
  }, [customerId, loadGamificationData]);

  // Handle objective completion
  const handleObjectiveCompletion = useCallback(async (objectiveId) => {
    if (!customerId) return { success: false, error: 'No customer ID' };

    try {
      const result = await airtableService.completeObjective(customerId, objectiveId);
      
      // Refresh data to show updated objectives and streaks
      setTimeout(() => {
        loadGamificationData();
      }, 500);

      return { success: true, ...result };
    } catch (error) {
      console.error('Error completing objective:', error);
      return { success: false, error: error.message };
    }
  }, [customerId, loadGamificationData]);

  // Handle tool unlock
  const handleToolUnlock = useCallback(async (toolName) => {
    if (!customerId) return { success: false, error: 'No customer ID' };

    try {
      const result = await airtableService.unlockAdvancedTool(customerId, toolName);
      
      // Refresh tool access data
      setTimeout(() => {
        loadGamificationData();
      }, 500);

      return { success: true, ...result };
    } catch (error) {
      console.error('Error unlocking tool:', error);
      return { success: false, error: error.message };
    }
  }, [customerId, loadGamificationData]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    await loadGamificationData();
  }, [loadGamificationData]);

  // Check for available tool unlocks
  const checkUnlockCriteria = useCallback(async () => {
    if (!customerId) return { success: false, error: 'No customer ID' };

    try {
      const result = await airtableService.evaluateUnlockCriteria(customerId);
      
      // Refresh if unlocks were granted
      if (result.unlocks && result.unlocks.length > 0) {
        setTimeout(() => {
          loadGamificationData();
        }, 500);
      }

      return { success: true, ...result };
    } catch (error) {
      console.error('Error checking unlock criteria:', error);
      return { success: false, error: error.message };
    }
  }, [customerId, loadGamificationData]);

  // Award progress points manually
  const awardProgressPoints = useCallback(async (points, source) => {
    if (!customerId) return { success: false, error: 'No customer ID' };

    try {
      const result = await airtableService.updateProgressPoints(customerId, points, source);
      
      // Refresh competency data
      setTimeout(() => {
        loadGamificationData();
      }, 500);

      return { success: true, ...result };
    } catch (error) {
      console.error('Error awarding progress points:', error);
      return { success: false, error: error.message };
    }
  }, [customerId, loadGamificationData]);

  // Update consistency streak
  const updateConsistencyStreak = useCallback(async () => {
    if (!customerId) return { success: false, error: 'No customer ID' };

    try {
      const result = await airtableService.updateConsistencyStreak(customerId);
      
      // Refresh competency data to show updated streak
      setTimeout(() => {
        loadGamificationData();
      }, 500);

      return { success: true, ...result };
    } catch (error) {
      console.error('Error updating consistency streak:', error);
      return { success: false, error: error.message };
    }
  }, [customerId, loadGamificationData]);

  // Get summary statistics
  const getSummaryStats = useCallback(() => {
    return {
      totalPoints: competencyProgress.total_progress_points || 0,
      currentLevel: competencyProgress.overall_level || 'Foundation',
      hiddenRank: competencyProgress.hidden_rank || 'E',
      consistencyStreak: competencyProgress.consistency_streak || 0,
      toolsUnlocked: Object.values(toolAccess).filter(tool => tool.access).length,
      milestonesAchieved: milestones.achieved?.length || 0,
      objectivesCompleted: dailyObjectives.objectives?.filter(obj => obj.completed).length || 0,
      objectivesTotal: dailyObjectives.objectives?.length || 0
    };
  }, [competencyProgress, toolAccess, milestones, dailyObjectives]);

  // Load data on mount and customer change
  useEffect(() => {
    if (customerId) {
      loadGamificationData();
    }
  }, [customerId, loadGamificationData]);

  // Auto-refresh every 5 minutes to keep data current
  useEffect(() => {
    if (!customerId) return;

    const refreshInterval = setInterval(() => {
      loadGamificationData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [customerId, loadGamificationData]);

  return {
    // Data state
    competencyProgress,
    toolAccess,
    milestones,
    dailyObjectives,
    loading,
    error,
    lastRefresh,
    
    // Action functions
    handleToolCompletion,
    handleObjectiveCompletion,
    handleToolUnlock,
    checkUnlockCriteria,
    awardProgressPoints,
    updateConsistencyStreak,
    refreshData,
    
    // Computed values
    summaryStats: getSummaryStats(),
    
    // Utilities
    isDataLoaded: !loading && !error,
    hasError: !!error
  };
};

export default useCompetencyDashboard;