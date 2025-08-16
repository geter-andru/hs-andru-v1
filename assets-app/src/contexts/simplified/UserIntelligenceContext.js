import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';
import { TaskRecommendationEngine } from '../../services/TaskRecommendationEngine';
import { TaskCompletionService } from '../../services/TaskCompletionService';

// Create context
const UserIntelligenceContext = createContext();

// Custom hook for using the context
export const useUserIntelligence = () => {
  const context = useContext(UserIntelligenceContext);
  if (!context) {
    throw new Error('useUserIntelligence must be used within UserIntelligenceProvider');
  }
  
  // Return with safe defaults for graceful degradation
  return {
    // Assessment data with safe defaults
    assessment: context.assessment || {
      performance: { level: 'Average', score: 50 },
      revenue: { opportunity: 500000 },
      strategy: { focusArea: 'Sales Process' },
      challenges: { critical: 0, highPriority: 0, manageable: 0 },
      competencyScores: { 
        customerAnalysis: 50, 
        valueCommunication: 50, 
        executiveReadiness: 50 
      }
    },
    
    // Milestone data with safe defaults
    milestone: context.milestone || {
      tier: 'foundation',
      context: 'Building systematic business intelligence capabilities',
      targets: { customerAnalysis: 70, valueCommunication: 65, executiveReadiness: 50 }
    },
    
    // Usage tracking with safe defaults
    usage: context.usage || {},
    
    // Loading and error states
    loading: context.loading || false,
    error: context.error || null,
    
    // Methods
    updateUsage: context.updateUsage,
    refreshData: context.refreshData
  };
};

// Enhanced milestone detection using TaskRecommendationEngine
const detectMilestoneTier = (businessMetrics) => {
  if (!businessMetrics) return 'foundation';
  
  // Use enhanced detection with task data
  const enhancedMilestone = TaskRecommendationEngine.detectMilestoneWithTasks(businessMetrics);
  
  // Return the enhanced milestone or fall back to basic detection
  if (enhancedMilestone) {
    return enhancedMilestone;
  }
  
  // Fallback to original logic
  const { mrr, teamSize, customerCount, fundingStage } = businessMetrics;
  
  if (mrr >= 75000 || teamSize > 15 || customerCount > 150 || fundingStage === 'Series A') {
    return { tier: 'expansion', context: 'Market expansion and enterprise sales' };
  }
  
  if (mrr >= 25000 || teamSize > 8 || customerCount > 50 || fundingStage === 'Seed') {
    return { tier: 'growth', context: 'Scaling systematic revenue processes' };
  }
  
  return { tier: 'foundation', context: 'Building systematic foundations' };
};

// Milestone configuration by tier
const getMilestoneConfig = (tier) => {
  const configs = {
    foundation: {
      tier: 'foundation',
      context: 'Building systematic foundations for scalable growth',
      targets: { customerAnalysis: 70, valueCommunication: 65, executiveReadiness: 50 },
      priority: ['Customer Analysis', 'Value Communication', 'Executive Readiness'],
      focus: 'Establish systematic buyer understanding frameworks',
      timeframe: '3-6 months'
    },
    growth: {
      tier: 'growth',
      context: 'Scaling systematic revenue processes for consistent growth',
      targets: { customerAnalysis: 85, valueCommunication: 80, executiveReadiness: 75 },
      priority: ['Value Communication', 'Executive Readiness', 'Customer Analysis'],
      focus: 'Optimize buyer intelligence for scale and team training',
      timeframe: '6-12 months'
    },
    expansion: {
      tier: 'expansion',
      context: 'Developing enterprise sales sophistication and market leadership',
      targets: { customerAnalysis: 90, valueCommunication: 90, executiveReadiness: 85 },
      priority: ['Executive Readiness', 'Strategic Intelligence', 'Competitive Mastery'],
      focus: 'Advanced buyer intelligence for market expansion',
      timeframe: '12-18 months'
    }
  };
  
  return configs[tier] || configs.foundation;
};

// Provider component
export const UserIntelligenceProvider = ({ children, customerId }) => {
  const [userIntelligence, setUserIntelligence] = useState({
    assessment: null,
    milestone: null,
    usage: {},
    loading: true,
    error: null
  });

  // Single fetch for all user data
  const fetchUserData = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setUserIntelligence(prev => ({ ...prev, loading: true, error: null }));
      
      const session = authService.getCurrentSession();
      if (!session) {
        throw new Error('No active session');
      }
      
      // SINGLE API CALL for all data
      const customerData = await airtableService.fetchCustomerWithAssessment(
        customerId, 
        session.accessToken
      );
      
      // Extract assessment data
      const assessment = customerData.assessment || null;
      
      // Extract or calculate milestone data
      const businessMetrics = customerData.businessMetrics || {
        mrr: customerData.revenue?.current ? customerData.revenue.current / 12 : 0,
        teamSize: customerData.teamSize || 1,
        customerCount: customerData.customerCount || 0,
        fundingStage: customerData.fundingStage || 'Pre-seed'
      };
      
      const tier = detectMilestoneTier(businessMetrics);
      const milestone = getMilestoneConfig(tier);
      
      // Extract usage data
      const usage = customerData.usageAnalytics || {};
      
      setUserIntelligence({
        assessment,
        milestone,
        usage,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching user intelligence:', error);
      setUserIntelligence(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  }, [customerId]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Enhanced usage tracking update with task completion integration
  const updateUsage = useCallback((newUsageData) => {
    setUserIntelligence(prev => {
      const updatedUsage = { ...prev.usage, ...newUsageData };
      
      // Enhance usage assessment with task completion data if available
      let enhancedAssessment = prev.assessment;
      if (newUsageData.tasksCompleted || newUsageData.taskCompetencyGains) {
        enhancedAssessment = TaskCompletionService.enhanceUsageAssessmentWithTasks(
          prev.assessment,
          customerId
        );
      }
      
      return {
        ...prev,
        usage: updatedUsage,
        assessment: enhancedAssessment
      };
    });
    
    // Throttled Airtable update (every 30 seconds)
    // This would be implemented with a debounce/throttle utility
  }, [customerId]);

  // Refresh data method
  const refreshData = useCallback(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...userIntelligence,
    updateUsage,
    refreshData
  }), [userIntelligence, updateUsage, refreshData]);

  return (
    <UserIntelligenceContext.Provider value={contextValue}>
      {children}
    </UserIntelligenceContext.Provider>
  );
};

export default UserIntelligenceContext;