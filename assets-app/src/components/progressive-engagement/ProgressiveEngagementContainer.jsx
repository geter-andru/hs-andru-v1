/**
 * Progressive Engagement Container - Main orchestrator for the redesigned experience
 * 
 * Manages the flow from Welcome → Compelling Aspects → Tool Focus → Integration Reveal
 * Implements the One Focus Rule and progressive disclosure strategy.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProgressiveEngagement } from '../../hooks/useProgressiveEngagement';
import WelcomeHero from './WelcomeHero';
import CompellingAspectDemo from './CompellingAspectDemo';
import IntegratedIntelligenceReveal from './IntegratedIntelligenceReveal';
import ICPRatingFocus from '../tool-focus/ICPRatingFocus';
import CostImpactFocus from '../tool-focus/CostImpactFocus';  
import BusinessCaseAutoFocus from '../tool-focus/BusinessCaseAutoFocus';

const ProgressiveEngagementContainer = ({ customerId, onToolCompletion }) => {
  const {
    engagementState,
    showCompellingAspect,
    trackInteraction,
    completeToolEngagement,
    getCurrentCompellingAspect,
    getEngagementProgress,
    isWelcomePhase,
    isToolFocusPhase,
    isIntegrationPhase,
    canShowIntegration
  } = useProgressiveEngagement(customerId);

  const [currentView, setCurrentView] = useState('welcome'); // welcome, aspect_demo, tool_focus, integration
  const [toolTransition, setToolTransition] = useState(null);
  const [completedAnalysisData, setCompletedAnalysisData] = useState({});

  // Handle engagement start from Welcome Hero
  const handleStartEngagement = (engagementType) => {
    if (engagementType === 'strategic_analysis') {
      // Show compelling aspect demo first
      setCurrentView('aspect_demo');
      showCompellingAspect('immediate_rating', 'icp_analysis');
    } else {
      // Direct to specific compelling aspect
      setCurrentView('aspect_demo');  
      showCompellingAspect(engagementType);
    }
  };

  // Handle compelling aspect engagement
  const handleAspectEngagement = (aspectType, interactionData) => {
    trackInteraction(getToolNameFromAspect(aspectType), 'aspect_engaged', interactionData);
    
    // Transition to focused tool experience
    setToolTransition(aspectType);
    setTimeout(() => {
      setCurrentView('tool_focus');
      setToolTransition(null);
    }, 500);
  };

  // Handle tool-specific interactions for progressive reveals
  const handleToolInteraction = (toolName, interactionType, data) => {
    trackInteraction(toolName, interactionType, data);
  };

  // Handle tool completion and progression
  const handleToolProgression = (toolName, completionData) => {
    // Store completion data for integration
    setCompletedAnalysisData(prev => ({
      ...prev,
      [toolName]: completionData
    }));

    completeToolEngagement(toolName);
    
    // Notify parent component
    onToolCompletion?.(toolName, completionData);

    // Check if all tools completed for integration reveal
    if (canShowIntegration) {
      setCurrentView('integration');
    } else {
      // Return to welcome for next tool selection
      setCurrentView('welcome');
    }
  };

  // Handle advanced access unlock
  const handleAdvancedAccess = (capabilityName, accessData) => {
    trackInteraction('advanced_methodologies', 'capability_accessed', {
      capability: capabilityName,
      ...accessData
    });

    // Could integrate with stealth gamification system here
    // to unlock advanced competency features
  };

  // Helper function to map aspect types to tool names
  const getToolNameFromAspect = (aspectType) => {
    const aspectToTool = {
      'immediate_rating': 'icp_analysis',
      'financial_impact': 'cost_calculator', 
      'business_case': 'business_case'
    };
    return aspectToTool[aspectType] || 'unknown';
  };

  // Get current compelling aspect for demo
  const currentAspect = getCurrentCompellingAspect();

  // Progress indicator (subtle, professional)
  const progressPercentage = getEngagementProgress();

  return (
    <div className="progressive-engagement-container min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      
      {/* Subtle Progress Indicator */}
      <div className="progress-indicator fixed top-0 left-0 right-0 z-40">
        <motion.div
          className="progress-bar h-1 bg-gradient-to-r from-blue-600 to-purple-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="container mx-auto px-6 py-8">
        
        {/* One Focus Rule Implementation - Only show one primary component at a time */}
        <AnimatePresence mode="wait">
          
          {/* Phase 1: Welcome Experience */}
          {currentView === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <WelcomeHero
                customerId={customerId}
                onStartEngagement={handleStartEngagement}
              />
            </motion.div>
          )}

          {/* Phase 2: Compelling Aspect Demo */}
          {currentView === 'aspect_demo' && currentAspect && (
            <motion.div
              key="aspect_demo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <CompellingAspectDemo
                aspectType={currentAspect}
                onEngageWith={handleAspectEngagement}
                customerId={customerId}
              />
            </motion.div>
          )}

          {/* Phase 3: Tool Focus Experience */}
          {currentView === 'tool_focus' && (
            <motion.div
              key="tool_focus"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
            >
              {/* Tool Transition Effect */}
              <AnimatePresence>
                {toolTransition && (
                  <motion.div
                    className="tool-transition-overlay fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4">✨</div>
                      <div className="text-xl text-white font-semibold">
                        Preparing focused experience...
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tool-Specific Focus Components */}
              {engagementState.activeToolFocus === 'immediate_rating' && (
                <ICPRatingFocus
                  customerId={customerId}
                  onProgressionComplete={handleToolProgression}
                  onInteraction={handleToolInteraction}
                />
              )}

              {engagementState.activeToolFocus === 'financial_impact' && (
                <CostImpactFocus
                  customerId={customerId}
                  onProgressionComplete={handleToolProgression}
                  onInteraction={handleToolInteraction}
                />
              )}

              {engagementState.activeToolFocus === 'business_case' && (
                <BusinessCaseAutoFocus
                  customerId={customerId}
                  onProgressionComplete={handleToolProgression}
                  onInteraction={handleToolInteraction}
                  previousAnalysisData={completedAnalysisData}
                />
              )}
            </motion.div>
          )}

          {/* Phase 4: Integration Reveal */}
          {currentView === 'integration' && canShowIntegration && (
            <motion.div
              key="integration"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
            >
              <IntegratedIntelligenceReveal
                customerId={customerId}
                completedAnalysisData={completedAnalysisData}
                onAdvancedAccess={handleAdvancedAccess}
              />
            </motion.div>
          )}

        </AnimatePresence>

        {/* Quick Tool Access (Subtle, contextual) */}
        {currentView !== 'welcome' && (
          <motion.div
            className="quick-access fixed bottom-8 right-8 z-30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.7, x: 0 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setCurrentView('welcome')}
              className="bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:text-white p-3 rounded-full border border-gray-600/50 hover:border-gray-500 transition-all duration-200"
              title="Return to overview"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </motion.div>
        )}

        {/* Engagement State Debug (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-gray-800/90 backdrop-blur-sm text-xs text-gray-300 p-3 rounded-lg border border-gray-600/50 font-mono z-20">
            <div>Phase: {engagementState.currentPhase}</div>
            <div>View: {currentView}</div>
            <div>Tools: {engagementState.toolsCompleted.length}/3</div>
            <div>Progress: {progressPercentage}%</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressiveEngagementContainer;