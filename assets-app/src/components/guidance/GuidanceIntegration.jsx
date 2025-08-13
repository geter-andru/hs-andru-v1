/**
 * Guidance Integration Component
 * 
 * Central component that integrates all guidance features into existing tools
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, Settings, TrendingUp, Target, 
  ChevronDown, ChevronUp, X, Lightbulb 
} from 'lucide-react';

import { implementationGuidanceService } from '../../services/implementationGuidanceService';
import { GuidancePanel } from './ContextualHelp';
import { ProgressTracker, QuickStats } from './ProgressTracking';
import { JourneyOverview } from './ImplementationRoadmap';
import { ActionableInsights } from './ActionableInsights';
import { GuidedWorkflow, QuickTour } from './GuidedWorkflow';

const GuidanceIntegration = ({ 
  toolName, 
  userProgress = {}, 
  customerData = null,
  className = '',
  showInSidebar = false,
  onGuidanceAction,
  children 
}) => {
  const [guidance, setGuidance] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [insights, setInsights] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [activeSection, setActiveSection] = useState('guidance');
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Check if this is user's first time with this tool
  useEffect(() => {
    const hasUsedTool = localStorage.getItem(`guidance_${toolName}_used`);
    if (!hasUsedTool) {
      setIsFirstTime(true);
      setShowPanel(true);
    }
  }, [toolName]);

  // Load guidance data
  useEffect(() => {
    if (toolName) {
      try {
        const contextualGuidance = implementationGuidanceService.getContextualGuidance(
          toolName, 
          userProgress, 
          customerData
        );
        setGuidance(contextualGuidance);

        const implementationRoadmap = implementationGuidanceService.getImplementationRoadmap(
          userProgress, 
          customerData
        );
        setRoadmap(implementationRoadmap);

        // Generate actionable insights based on current context
        const actionableInsights = generateActionableInsights(toolName, userProgress, contextualGuidance);
        setInsights(actionableInsights);

      } catch (error) {
        console.error('Failed to load guidance:', error);
      }
    }
  }, [toolName, userProgress, customerData]);

  const generateActionableInsights = (tool, progress, guidance) => {
    const baseInsights = {
      immediate: [],
      thisWeek: [],
      strategic: [],
      optimization: []
    };

    // Add insights based on current tool and progress
    if (tool === 'icp-analysis') {
      if (!progress?.icp_complete) {
        baseInsights.immediate.push({
          title: 'Complete ICP Framework',
          description: 'Define your ideal customer characteristics',
          priority: 'high',
          timeEstimate: '10 minutes',
          impact: 'Foundation for all sales activities',
          steps: [
            'Review existing customer data',
            'Identify common success patterns',
            'Define scoring criteria'
          ],
          outcome: 'Clear target customer definition'
        });
      }

      baseInsights.thisWeek.push({
        title: 'Apply ICP to Current Pipeline',
        description: 'Score all active prospects using new criteria',
        priority: 'medium',
        timeEstimate: '2 hours',
        impact: 'Prioritize high-value opportunities',
        steps: [
          'Export current prospect list',
          'Apply ICP scoring to each prospect',
          'Prioritize outreach based on scores'
        ]
      });
    }

    if (tool === 'cost-calculator') {
      baseInsights.immediate.push({
        title: 'Calculate ROI for Top Prospect',
        description: 'Create compelling value proposition',
        priority: 'high',
        timeEstimate: '15 minutes',
        impact: 'Accelerate deal closure',
        steps: [
          'Gather prospect financial data',
          'Input into cost calculator',
          'Prepare value presentation'
        ]
      });
    }

    return baseInsights;
  };

  const handleGuidanceAction = (action, context) => {
    // Mark action as taken
    if (onGuidanceAction) {
      onGuidanceAction(action, context);
    }

    // Track usage
    localStorage.setItem(`guidance_${toolName}_used`, 'true');
    
    // Hide first-time indicators
    setIsFirstTime(false);
  };

  const handleStartWorkflow = () => {
    setShowWorkflow(true);
  };

  const handleCompleteWorkflow = () => {
    setShowWorkflow(false);
    localStorage.setItem(`workflow_${toolName}_completed`, 'true');
  };

  // Generate workflow steps based on tool
  const getWorkflowSteps = () => {
    const workflows = {
      'icp-analysis': {
        title: 'ICP Analysis Walkthrough',
        description: 'Learn how to identify and score your ideal customers',
        steps: [
          {
            title: 'Understanding ICP Framework',
            description: 'Learn the key components of an effective ICP',
            type: 'info',
            instructions: [
              'Review the ICP segments and criteria',
              'Understand how scoring works',
              'Identify your target characteristics'
            ],
            highlight: { selector: '[data-guidance="icp-framework"]', tooltip: 'This is your ICP framework' }
          },
          {
            title: 'Score Your First Company',
            description: 'Practice using the rating system',
            type: 'action',
            instructions: [
              'Enter a company name you want to evaluate',
              'Click "Calculate Fit Score"',
              'Review the detailed breakdown'
            ],
            highlight: { selector: '[data-guidance="company-rating"]', tooltip: 'Rate companies here' }
          },
          {
            title: 'Interpret Results',
            description: 'Understand what the scores mean',
            type: 'tip',
            instructions: [
              'High scores (80+) = Priority prospects',
              'Medium scores (60-79) = Qualified leads',
              'Low scores (<60) = Deprioritize or nurture'
            ]
          }
        ]
      }
    };

    return workflows[toolName] || null;
  };

  // Sidebar layout for guidance
  if (showInSidebar) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Quick Stats */}
        {userProgress && (
          <QuickStats 
            stats={{
              toolsCompleted: Object.values(userProgress).filter(Boolean).length,
              totalTools: 3,
              timeSpent: userProgress.timeSpent || 0,
              actionsTaken: userProgress.actionsTaken || 0
            }}
          />
        )}

        {/* Journey Overview */}
        {roadmap && (
          <JourneyOverview 
            journeyMap={roadmap.journeyMap || guidance?.journeyMap}
            currentPhase={roadmap.currentPhase}
          />
        )}

        {/* Contextual Guidance */}
        {guidance && (
          <GuidancePanel guidance={guidance} />
        )}

        {/* Quick Tour Button */}
        {getWorkflowSteps() && (
          <QuickTour 
            tourSteps={[
              { 
                selector: '[data-guidance="main-content"]', 
                title: 'Main Tool Area',
                description: 'This is where you interact with the tool'
              },
              {
                selector: '[data-guidance="sidebar"]',
                title: 'Guidance Panel',
                description: 'Get contextual help and tips here'
              }
            ]}
            onComplete={() => console.log('Tour completed')}
          />
        )}

        {children}
      </div>
    );
  }

  // Main layout for guidance panel
  return (
    <div className={className}>
      {/* Floating Guidance Button */}
      {!showPanel && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowPanel(true)}
          className={`fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-lg transition-colors ${
            isFirstTime ? 'animate-pulse ring-4 ring-blue-300' : ''
          }`}
        >
          <Lightbulb className="w-6 h-6" />
          {isFirstTime && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </motion.button>
      )}

      {/* Guidance Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-96 bg-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Implementation Guide</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Section Tabs */}
              <div className="flex space-x-1 bg-gray-700 p-1 rounded">
                {[
                  { key: 'guidance', label: 'Guide', icon: Target },
                  { key: 'insights', label: 'Actions', icon: TrendingUp },
                  { key: 'progress', label: 'Progress', icon: TrendingUp }
                ].map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded text-xs font-medium transition-all ${
                        activeSection === section.key ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeSection === 'guidance' && guidance && (
                    <GuidancePanel guidance={guidance} />
                  )}

                  {activeSection === 'insights' && insights && (
                    <ActionableInsights 
                      insights={insights} 
                      onActionTaken={handleGuidanceAction}
                    />
                  )}

                  {activeSection === 'progress' && (
                    <div className="space-y-6">
                      <ProgressTracker progress={userProgress} />
                      {roadmap && (
                        <JourneyOverview 
                          journeyMap={roadmap.journeyMap || guidance?.journeyMap}
                          currentPhase={roadmap.currentPhase}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-800 border-t border-gray-700 p-4">
              <div className="space-y-2">
                {getWorkflowSteps() && (
                  <button
                    onClick={handleStartWorkflow}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
                  >
                    Start Guided Walkthrough
                  </button>
                )}
                
                <button
                  onClick={() => setShowPanel(false)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 px-4 rounded text-sm font-medium transition-colors"
                >
                  Hide Guide
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guided Workflow */}
      <GuidedWorkflow
        workflow={getWorkflowSteps()}
        isActive={showWorkflow}
        onComplete={handleCompleteWorkflow}
        onSkip={handleCompleteWorkflow}
        onClose={() => setShowWorkflow(false)}
      />

      {children}
    </div>
  );
};

export default GuidanceIntegration;