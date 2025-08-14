/**
 * Tool Guidance Wrapper
 * 
 * Higher-order component that wraps existing tools with guidance functionality
 */

import React, { useState, useEffect } from 'react';
import { implementationGuidanceService } from '../../services/implementationGuidanceService';
import { authService } from '../../services/authService';
import GuidanceIntegration from './GuidanceIntegration';
import { ContextualHelp, QuickTip } from './index';

const ToolGuidanceWrapper = ({ 
  toolName, 
  children, 
  showSidebarGuidance = false,
  customProgress = null,
  onGuidanceAction 
}) => {
  const [userProgress, setUserProgress] = useState({});
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user progress and customer data
  useEffect(() => {
    const loadGuidanceData = async () => {
      try {
        const session = authService.getCurrentSession();
        if (session) {
          setCustomerData(session);
          
          // Use custom progress if provided, otherwise load from session
          if (customProgress) {
            setUserProgress(customProgress);
          } else {
            // Load progress from local storage or session
            const savedProgress = localStorage.getItem(`progress_${session.customerId}`);
            if (savedProgress) {
              setUserProgress(JSON.parse(savedProgress));
            }
          }
        }
      } catch (error) {
        console.error('Failed to load guidance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGuidanceData();
  }, [customProgress]);

  // Save progress updates
  const handleProgressUpdate = (newProgress) => {
    const session = authService.getCurrentSession();
    if (session) {
      setUserProgress(newProgress);
      localStorage.setItem(`progress_${session.customerId}`, JSON.stringify(newProgress));
    }
  };

  // Handle guidance actions
  const handleGuidanceAction = (action, context) => {
    // Track action
    const updatedProgress = {
      ...userProgress,
      actionsTaken: (userProgress.actionsTaken || 0) + 1,
      lastAction: {
        tool: toolName,
        action: action.title,
        timestamp: new Date().toISOString()
      }
    };
    
    handleProgressUpdate(updatedProgress);

    // Call custom handler if provided
    if (onGuidanceAction) {
      onGuidanceAction(action, context);
    }
  };

  if (loading) {
    return children;
  }

  // Add guidance data attributes to children for workflow targeting
  const enhancedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        'data-guidance': 'main-content',
        ...child.props
      });
    }
    return child;
  });

  return (
    <GuidanceIntegration
      toolName={toolName}
      userProgress={userProgress}
      customerData={customerData}
      showInSidebar={showSidebarGuidance}
      onGuidanceAction={handleGuidanceAction}
    >
      {enhancedChildren}
    </GuidanceIntegration>
  );
};

// Higher-order component for tool enhancement
export const withGuidance = (WrappedComponent, toolName, options = {}) => {
  const GuidanceEnhancedComponent = (props) => {
    return (
      <ToolGuidanceWrapper 
        toolName={toolName} 
        showSidebarGuidance={options.showSidebarGuidance}
        onGuidanceAction={options.onGuidanceAction}
      >
        <WrappedComponent {...props} />
      </ToolGuidanceWrapper>
    );
  };

  GuidanceEnhancedComponent.displayName = `withGuidance(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return GuidanceEnhancedComponent;
};

// Contextual Help Hook
export const useContextualHelp = (toolName, section = null) => {
  const [guidance, setGuidance] = useState(null);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    const session = authService.getCurrentSession();
    const progress = JSON.parse(localStorage.getItem(`progress_${session?.customerId}`) || '{}');
    
    const contextualGuidance = implementationGuidanceService.getContextualGuidance(
      toolName, 
      progress, 
      session
    );
    
    setGuidance(contextualGuidance);
    setTips(contextualGuidance?.tips || []);
  }, [toolName, section]);

  const getHelpFor = (element) => {
    const helpMap = {
      'icp-framework': {
        title: 'ICP Framework',
        content: 'This framework helps you identify and score ideal customers based on key characteristics.',
        tips: ['Focus on customers who have succeeded with your solution', 'Look for patterns in your best relationships']
      },
      'company-rating': {
        title: 'Company Rating',
        content: 'Rate companies against your ICP criteria to prioritize your sales efforts.',
        tips: ['Use conservative estimates for credibility', 'Score prospects immediately after discovery calls']
      },
      'cost-calculator': {
        title: 'Cost Calculator',
        content: 'Calculate the financial impact and ROI for your prospects.',
        tips: ['Include both direct costs and opportunity costs', 'Use prospect-specific data for accuracy']
      }
    };

    return helpMap[element];
  };

  const getQuickTip = (context) => {
    const tipMap = {
      'first-time': 'Start with the ICP framework to establish your foundation',
      'completed-icp': 'Now use the Cost Calculator to quantify value',
      'low-score': 'Low scores may indicate nurture opportunities rather than immediate prospects'
    };

    return tipMap[context];
  };

  return {
    guidance,
    tips,
    getHelpFor,
    getQuickTip,
    ContextualHelp: ({ element, ...props }) => (
      <ContextualHelp {...getHelpFor(element)} {...props} />
    ),
    QuickTip: ({ context, ...props }) => (
      <QuickTip tip={getQuickTip(context)} {...props} />
    )
  };
};

export default ToolGuidanceWrapper;