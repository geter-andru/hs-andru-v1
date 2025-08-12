/**
 * Progressive Engagement Hook - Manages state for compelling aspect focus
 * and progressive revelation system across all tools and components.
 */

import { useState, useCallback, useEffect } from 'react';
import { airtableService } from '../services/airtableService';

export const useProgressiveEngagement = (customerId) => {
  // Track which compelling aspects user has seen
  const [compellingAspectShown, setCompellingAspectShown] = useState({
    immediate_rating: false,
    financial_impact: false,
    business_case: false,
    integration_reveal: false
  });

  // Track progressive reveal eligibility
  const [revelationTriggers, setRevelationTriggers] = useState({
    tier_classification: false,
    technical_costs: false,
    stakeholder_views: false,
    tool_integration: false
  });

  // Track overall engagement progression
  const [engagementState, setEngagementState] = useState({
    currentPhase: 'welcome', // welcome, tool_focus, integration_reveal
    activeToolFocus: null,
    toolsCompleted: [],
    integrationUnlocked: false,
    userJourneyStep: 1
  });

  // Track tool interaction depth for revelation triggers
  const [interactionDepth, setInteractionDepth] = useState({
    icp_analysis: { ratings_completed: 0, time_spent: 0 },
    cost_calculator: { charts_explored: 0, scenarios_run: 0 },
    business_case: { sections_viewed: 0, stakeholder_modes: 0 }
  });

  // Initialize engagement state from Airtable
  useEffect(() => {
    const initializeEngagementState = async () => {
      try {
        const customerData = await airtableService.getCustomerDataByRecordId(customerId);
        const progressData = await airtableService.loadCompetencyProgress(customerId);
        
        // Determine current engagement state based on existing data
        const completedTools = [];
        if (customerData.icp_completed) completedTools.push('icp_analysis');
        if (customerData.cost_completed) completedTools.push('cost_calculator');
        if (customerData.business_case_completed) completedTools.push('business_case');

        // Set appropriate phase based on completion
        let currentPhase = 'welcome';
        if (completedTools.length > 0 && completedTools.length < 3) {
          currentPhase = 'tool_focus';
        } else if (completedTools.length === 3) {
          currentPhase = 'integration_reveal';
        }

        setEngagementState(prev => ({
          ...prev,
          currentPhase,
          toolsCompleted: completedTools,
          integrationUnlocked: completedTools.length === 3,
          userJourneyStep: completedTools.length + 1
        }));

        // Mark aspects as shown if tools are already completed
        const aspectsShown = {};
        if (customerData.icp_completed) aspectsShown.immediate_rating = true;
        if (customerData.cost_completed) aspectsShown.financial_impact = true;
        if (customerData.business_case_completed) aspectsShown.business_case = true;
        
        setCompellingAspectShown(prev => ({ ...prev, ...aspectsShown }));

      } catch (error) {
        console.error('Error initializing engagement state:', error);
      }
    };

    if (customerId) {
      initializeEngagementState();
    }
  }, [customerId]);

  // Show compelling aspect and transition to tool focus
  const showCompellingAspect = useCallback((aspectType, toolName = null) => {
    setCompellingAspectShown(prev => ({
      ...prev,
      [aspectType]: true
    }));

    setEngagementState(prev => ({
      ...prev,
      currentPhase: 'tool_focus',
      activeToolFocus: toolName || aspectType,
      userJourneyStep: Math.max(prev.userJourneyStep, 2)
    }));
  }, []);

  // Track tool interaction for progressive reveals
  const trackInteraction = useCallback((toolName, interactionType, data) => {
    setInteractionDepth(prev => {
      const updated = { ...prev };
      
      switch (toolName) {
        case 'icp_analysis':
          if (interactionType === 'company_rated') {
            updated.icp_analysis.ratings_completed += 1;
            
            // Trigger tier classification reveal after first rating
            if (updated.icp_analysis.ratings_completed >= 1) {
              setRevelationTriggers(triggers => ({
                ...triggers,
                tier_classification: true
              }));
            }
          }
          break;
          
        case 'cost_calculator':
          if (interactionType === 'chart_explored') {
            updated.cost_calculator.charts_explored += 1;
            
            // Trigger technical costs reveal after chart interaction
            if (updated.cost_calculator.charts_explored >= 1) {
              setRevelationTriggers(triggers => ({
                ...triggers,
                technical_costs: true
              }));
            }
          }
          break;
          
        case 'business_case':
          if (interactionType === 'section_previewed') {
            updated.business_case.sections_viewed += 1;
            
            // Trigger stakeholder views after preview engagement
            if (updated.business_case.sections_viewed >= 1) {
              setRevelationTriggers(triggers => ({
                ...triggers,
                stakeholder_views: true
              }));
            }
          }
          break;
      }
      
      return updated;
    });

    // Track time spent for engagement analytics
    const timeSpent = prev => prev + 1;
    setInteractionDepth(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName],
        time_spent: timeSpent(prev[toolName]?.time_spent || 0)
      }
    }));
  }, []);

  // Mark tool as completed and check for integration unlock
  const completeToolEngagement = useCallback((toolName) => {
    setEngagementState(prev => {
      const newCompleted = [...prev.toolsCompleted];
      if (!newCompleted.includes(toolName)) {
        newCompleted.push(toolName);
      }

      const integrationUnlocked = newCompleted.length === 3;
      
      // Trigger integration reveal when all tools completed
      if (integrationUnlocked && !prev.integrationUnlocked) {
        setRevelationTriggers(triggers => ({
          ...triggers,
          tool_integration: true
        }));
        
        setCompellingAspectShown(aspects => ({
          ...aspects,
          integration_reveal: true
        }));
      }

      return {
        ...prev,
        toolsCompleted: newCompleted,
        integrationUnlocked,
        currentPhase: integrationUnlocked ? 'integration_reveal' : prev.currentPhase,
        userJourneyStep: Math.max(prev.userJourneyStep, newCompleted.length + 1)
      };
    });
  }, []);

  // Get current compelling aspect to show
  const getCurrentCompellingAspect = useCallback(() => {
    if (engagementState.currentPhase === 'welcome') {
      return null; // Show welcome hero instead
    }
    
    if (engagementState.currentPhase === 'tool_focus') {
      // Determine next most compelling aspect to show
      if (!compellingAspectShown.immediate_rating && !engagementState.toolsCompleted.includes('icp_analysis')) {
        return 'immediate_rating';
      }
      if (!compellingAspectShown.financial_impact && !engagementState.toolsCompleted.includes('cost_calculator')) {
        return 'financial_impact';
      }
      if (!compellingAspectShown.business_case && !engagementState.toolsCompleted.includes('business_case')) {
        return 'business_case';
      }
    }
    
    if (engagementState.currentPhase === 'integration_reveal') {
      return 'integration_reveal';
    }
    
    return null;
  }, [engagementState, compellingAspectShown]);

  // Get available revelation content
  const getAvailableRevelations = useCallback(() => {
    return Object.keys(revelationTriggers).filter(key => revelationTriggers[key]);
  }, [revelationTriggers]);

  // Calculate engagement progression percentage
  const getEngagementProgress = useCallback(() => {
    const totalSteps = 6; // Welcome + 3 tools + 2 revelations
    const currentStep = engagementState.userJourneyStep;
    return Math.min(100, Math.round((currentStep / totalSteps) * 100));
  }, [engagementState.userJourneyStep]);

  // Reset engagement state (for testing or restart)
  const resetEngagement = useCallback(() => {
    setCompellingAspectShown({
      immediate_rating: false,
      financial_impact: false,
      business_case: false,
      integration_reveal: false
    });
    
    setRevelationTriggers({
      tier_classification: false,
      technical_costs: false,
      stakeholder_views: false,
      tool_integration: false
    });
    
    setEngagementState({
      currentPhase: 'welcome',
      activeToolFocus: null,
      toolsCompleted: [],
      integrationUnlocked: false,
      userJourneyStep: 1
    });
    
    setInteractionDepth({
      icp_analysis: { ratings_completed: 0, time_spent: 0 },
      cost_calculator: { charts_explored: 0, scenarios_run: 0 },
      business_case: { sections_viewed: 0, stakeholder_modes: 0 }
    });
  }, []);

  return {
    // State
    engagementState,
    compellingAspectShown,
    revelationTriggers,
    interactionDepth,
    
    // Actions
    showCompellingAspect,
    trackInteraction,
    completeToolEngagement,
    resetEngagement,
    
    // Computed
    getCurrentCompellingAspect,
    getAvailableRevelations,
    getEngagementProgress,
    
    // Helper booleans
    isWelcomePhase: engagementState.currentPhase === 'welcome',
    isToolFocusPhase: engagementState.currentPhase === 'tool_focus',
    isIntegrationPhase: engagementState.currentPhase === 'integration_reveal',
    canShowIntegration: engagementState.integrationUnlocked
  };
};