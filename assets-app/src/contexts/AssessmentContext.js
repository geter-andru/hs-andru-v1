import React, { createContext, useContext, useState, useEffect } from 'react';

const AssessmentContext = createContext();

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider');
  }
  return context;
};

export const AssessmentProvider = ({ children, customerData }) => {
  const [assessmentData, setAssessmentData] = useState(null);
  const [personalizedMessaging, setPersonalizedMessaging] = useState(null);
  const [competencyBaselines, setCompetencyBaselines] = useState(null);

  useEffect(() => {
    if (customerData?.assessment) {
      setAssessmentData(customerData.assessment);
      setCompetencyBaselines(customerData.competencyBaselines);
      
      // Generate personalized messaging
      const messaging = generatePersonalizedMessaging(customerData.assessment);
      setPersonalizedMessaging(messaging);
    }
  }, [customerData]);

  const generatePersonalizedMessaging = (assessment) => {
    // Handle null assessment data gracefully
    if (!assessment) {
      return {
        welcomeMessage: {
          primary: 'Welcome to your professional development platform',
          secondary: 'Begin your systematic revenue intelligence journey',
          urgency: 'moderate',
          tone: 'professional'
        },
        toolDescriptions: {
          icpTool: 'Systematic customer analysis and targeting',
          costTool: 'Financial impact analysis and opportunity quantification',
          businessCase: 'Executive-ready business case development'
        },
        activityPersonalization: [{
          focusArea: 'Professional Development',
          activityPrefixes: ['Professional development activity:'],
          completionMessages: ['advances professional development goals']
        }],
        achievementPersonalization: {
          badgeContext: 'Professional Achievement',
          completionBonuses: 'Professional Development Achievement',
          milestoneMessages: 'professional capabilities'
        },
        nextSteps: [
          'Begin with systematic customer analysis',
          'Focus on foundational professional development',
          'Build consistent methodology and processes'
        ]
      };
    }

    const { performance, strategy, revenue, challenges } = assessment;
    
    return {
      // Welcome messaging based on performance level
      welcomeMessage: getWelcomeMessage(performance, revenue),
      
      // Focus area-specific tool descriptions
      toolDescriptions: getToolDescriptions(strategy, challenges),
      
      // Activity feed personalization
      activityPersonalization: getActivityPersonalization(strategy, challenges),
      
      // Achievement personalization
      achievementPersonalization: getAchievementPersonalization(strategy, challenges),
      
      // Next steps based on assessment
      nextSteps: getNextSteps(performance, strategy)
    };
  };

  const getWelcomeMessage = (performance, revenue) => {
    // Handle missing performance or revenue data
    if (!performance || !revenue) {
      return {
        primary: 'Welcome to your professional development platform',
        secondary: 'Begin your systematic revenue intelligence journey',
        urgency: 'moderate',
        tone: 'professional'
      };
    }

    const messages = {
      'Critical': {
        primary: `Your revenue optimization analysis reveals critical improvement opportunities`,
        secondary: `Based on your assessment, addressing key capability gaps could unlock ${Math.round(revenue.opportunity/1000)}K in revenue potential`,
        urgency: 'immediate',
        tone: 'supportive'
      },
      'Needs Work': {
        primary: `Your revenue intelligence assessment identifies significant growth opportunities`,
        secondary: `Systematic improvement in key areas shows potential for ${Math.round(revenue.opportunity/1000)}K revenue acceleration`,
        urgency: 'high',
        tone: 'encouraging'
      },
      'Average': {
        primary: `Your revenue capabilities assessment shows solid foundation with optimization potential`,
        secondary: `Strategic enhancement opportunities identified worth ${Math.round(revenue.opportunity/1000)}K in additional revenue`,
        urgency: 'moderate',
        tone: 'professional'
      },
      'Good': {
        primary: `Your revenue intelligence capabilities are performing well above average`,
        secondary: `Advanced optimization opportunities identified for ${Math.round(revenue.opportunity/1000)}K revenue enhancement`,
        urgency: 'strategic',
        tone: 'confident'
      },
      'Excellent': {
        primary: `Your revenue capabilities place you in the top 15% of technical founders`,
        secondary: `Market leadership opportunities identified worth ${Math.round(revenue.opportunity/1000)}K competitive advantage`,
        urgency: 'maintenance',
        tone: 'expert'
      },
      'Developing': {
        primary: `Your assessment shows strong potential for systematic improvement`,
        secondary: `Focus on building consistent methodologies to unlock ${Math.round(revenue.opportunity/1000)}K in revenue opportunities`,
        urgency: 'moderate',
        tone: 'encouraging'
      },
      'Expert': {
        primary: `Your expertise positions you for strategic leadership and organizational impact`,
        secondary: `Leverage your capabilities to drive ${Math.round(revenue.opportunity/1000)}K in strategic revenue growth`,
        urgency: 'strategic',
        tone: 'expert'
      }
    };
    
    return messages[performance.level] || messages['Average'];
  };

  const getToolDescriptions = (strategy, challenges) => {
    // Handle missing strategy data
    if (!strategy || !challenges) {
      return {
        icpTool: 'Systematic customer analysis and targeting',
        costTool: 'Financial impact analysis and opportunity quantification',
        businessCase: 'Executive-ready business case development'
      };
    }

    const focusArea = strategy.focusArea;
    
    // Map focus areas to tool descriptions
    const focusMapping = {
      'Buyer Psychology': {
        icpTool: 'Address buyer psychology and stakeholder identification challenges',
        costTool: 'Quantify impact of buyer conversation gaps',
        businessCase: 'Build compelling cases for buyer psychology investment'
      },
      'Technical Translation': {
        icpTool: 'Focus on business outcome mapping for technical features',
        costTool: 'Calculate technical founder opportunity cost',
        businessCase: 'Create executive-ready technical value propositions'
      },
      'Competitive Positioning': {
        icpTool: 'Identify differentiation opportunities in target market',
        costTool: 'Quantify competitive displacement costs',
        businessCase: 'Build competitive advantage business cases'
      },
      'Sales Process': {
        icpTool: 'Systematic customer identification and qualification',
        costTool: 'Calculate process inefficiency costs',
        businessCase: 'Build systematic sales process business cases'
      }
    };
    
    // Use focus area to determine tool descriptions, with fallback to challenge count
    let toolContext = focusMapping[focusArea];
    
    if (!toolContext && challenges.critical > 0) {
      // Fallback based on challenge severity
      toolContext = focusMapping['Technical Translation']; // Most common
    }
    
    return toolContext || {
      icpTool: 'Systematic customer analysis and targeting',
      costTool: 'Financial impact analysis and opportunity quantification',
      businessCase: 'Executive-ready business case development'
    };
  };

  const getActivityPersonalization = (strategy, challenges) => {
    // Handle missing strategy data
    if (!strategy) {
      return [{
        focusArea: 'Professional Development',
        activityPrefixes: ['Professional development activity:'],
        completionMessages: ['advances professional development goals']
      }];
    }

    const focusArea = strategy.focusArea;
    
    return [{
      focusArea,
      activityPrefixes: getActivityPrefixes(focusArea),
      completionMessages: getCompletionMessages(focusArea)
    }];
  };

  const getAchievementPersonalization = (strategy, challenges) => {
    // Handle missing strategy data
    if (!strategy) {
      return {
        badgeContext: 'Professional Achievement',
        completionBonuses: 'Professional Development Achievement',
        milestoneMessages: 'professional capabilities'
      };
    }

    const focusArea = strategy.focusArea;
    
    return {
      badgeContext: `${focusArea} Achievement`,
      completionBonuses: {
        'Buyer Psychology': 'Stakeholder Identification Mastery',
        'Technical Translation': 'Executive Communication Excellence',
        'Competitive Positioning': 'Market Differentiation Expert',
        'Sales Process': 'Revenue Process Optimization'
      }[focusArea] || 'Professional Development Achievement',
      milestoneMessages: {
        'Buyer Psychology': 'buyer psychology capabilities',
        'Technical Translation': 'technical translation skills',
        'Competitive Positioning': 'competitive positioning expertise',
        'Sales Process': 'sales process optimization'
      }[focusArea] || 'professional capabilities'
    };
  };

  const getNextSteps = (performance, strategy) => {
    // Handle missing performance or strategy data
    if (!performance || !strategy) {
      return [
        'Begin with systematic customer analysis',
        'Focus on foundational professional development',
        'Build consistent methodology and processes'
      ];
    }

    const level = performance.level;
    const focusArea = strategy.focusArea;
    
    const stepsByLevel = {
      'Critical': [
        `Focus on foundational ${focusArea.toLowerCase()} capabilities`,
        'Start with systematic customer analysis to build baseline competency',
        'Use ICP Analysis tool to establish structured approach'
      ],
      'Needs Work': [
        `Strengthen ${focusArea.toLowerCase()} methodology consistency`,
        'Apply systematic approaches across all customer interactions',
        'Build repeatable processes using Cost Calculator insights'
      ],
      'Average': [
        `Optimize ${focusArea.toLowerCase()} effectiveness for competitive advantage`,
        'Scale successful approaches across broader market segments',
        'Leverage Business Case Builder for strategic growth'
      ],
      'Good': [
        `Advanced ${focusArea.toLowerCase()} optimization and team scaling`,
        'Develop systematic approaches for team knowledge transfer',
        'Focus on market leadership positioning'
      ],
      'Excellent': [
        `Strategic ${focusArea.toLowerCase()} leadership and mentorship`,
        'Build organizational capabilities and process standardization',
        'Focus on competitive differentiation and market expansion'
      ]
    };
    
    return stepsByLevel[level] || stepsByLevel['Average'];
  };

  const getActivityPrefixes = (focusArea) => {
    const prefixes = {
      'Buyer Psychology': [
        'Advanced buyer psychology application:',
        'Stakeholder identification breakthrough:',
        'Buyer conversation optimization:'
      ],
      'Technical Translation': [
        'Technical-to-business translation:',
        'Feature-value mapping advancement:',
        'Executive communication enhancement:'
      ],
      'Competitive Positioning': [
        'Competitive differentiation focus:',
        'Market positioning advancement:',
        'Strategic advantage development:'
      ],
      'Sales Process': [
        'Sales process optimization:',
        'Systematic qualification enhancement:',
        'Revenue process advancement:'
      ]
    };
    
    return prefixes[focusArea] || ['Professional development activity:'];
  };

  const getCompletionMessages = (focusArea) => {
    const messages = {
      'Buyer Psychology': [
        'addresses your buyer psychology development needs',
        'builds stakeholder identification capabilities',
        'strengthens buyer conversation effectiveness'
      ],
      'Technical Translation': [
        'enhances your technical-to-business translation skills',
        'develops executive communication capabilities',
        'strengthens feature-value articulation'
      ],
      'Competitive Positioning': [
        'builds competitive differentiation capabilities',
        'strengthens market positioning effectiveness',
        'develops strategic advantage communication'
      ],
      'Sales Process': [
        'optimizes your sales process effectiveness',
        'builds systematic qualification capabilities',
        'strengthens revenue process management'
      ]
    };
    
    return messages[focusArea] || ['advances professional development goals'];
  };

  const value = {
    assessmentData,
    personalizedMessaging,
    competencyBaselines,
    // Helper functions for components
    isHighPriority: assessmentData?.performance?.isHighPriority || false,
    needsFocus: (area) => assessmentData?.strategy?.focusArea === area,
    hasCriticalChallenges: assessmentData?.challenges?.critical > 0,
    hasHighPriorityChallenges: assessmentData?.challenges?.highPriority > 0,
    getFocusAreaMessage: () => {
      return personalizedMessaging?.activityPersonalization?.[0];
    },
    getRevenueOpportunity: () => assessmentData?.revenue?.opportunity || 500000,
    getPerformanceLevel: () => assessmentData?.performance?.level || 'Average'
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
};