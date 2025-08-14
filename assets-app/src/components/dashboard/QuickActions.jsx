import React from 'react';
import QuickActionButton from './QuickActionButton';

const QuickActions = ({ 
  actions, 
  onActionClick, 
  competencyScores = {},
  className = '' 
}) => {
  // Calculate tool availability based on competency scores
  const getToolAvailability = () => {
    return {
      icpUnlocked: true, // Always available
      costCalculatorUnlocked: (competencyScores.valueCommunication || 0) >= 70,
      businessCaseUnlocked: (competencyScores.salesExecution || 0) >= 70,
      actionTrackerUnlocked: true // Always available
    };
  };
  
  const toolAvailability = getToolAvailability();
  
  // Calculate progress towards unlock
  const calculateProgress = (currentScore, targetScore = 70) => {
    return (currentScore / targetScore) * 100;
  };
  
  // Enhanced default actions with Phase 4 metadata
  const defaultActions = [
    {
      id: 'rate_prospect',
      title: 'Rate New Prospect',
      description: 'ICP analysis for qualification',
      icon: 'user-plus',
      enabled: toolAvailability.icpUnlocked,
      category: 'customerAnalysis',
      estimatedTime: '5 min',
      pointValue: 25,
      progress: 100 // Always unlocked
    },
    {
      id: 'cost_analysis',
      title: 'Update Cost Model',
      description: 'Financial impact analysis',
      icon: 'calculator',
      enabled: toolAvailability.costCalculatorUnlocked,
      category: 'valueCommunication',
      estimatedTime: '10 min',
      pointValue: 30,
      requirement: '70+ Value Communication',
      progress: calculateProgress(competencyScores.valueCommunication || 45)
    },
    {
      id: 'business_case',
      title: 'Export Business Case',
      description: 'Stakeholder presentation',
      icon: 'download',
      enabled: toolAvailability.businessCaseUnlocked,
      category: 'salesExecution',
      estimatedTime: '15 min',
      pointValue: 35,
      requirement: '70+ Sales Execution',
      progress: calculateProgress(competencyScores.salesExecution || 52)
    },
    {
      id: 'log_activity',
      title: 'Log Real Action',
      description: 'Track professional development',
      icon: 'plus-circle',
      enabled: toolAvailability.actionTrackerUnlocked,
      category: 'general',
      estimatedTime: '2 min',
      pointValue: 15,
      progress: 100 // Always unlocked
    }
  ];

  const actionsToRender = actions || defaultActions;

  const handleActionClick = (actionId) => {
    if (onActionClick) {
      onActionClick(actionId);
    } else {
      console.log(`Quick action clicked: ${actionId}`);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Header Section */}
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-400">
          Access professional tools and track development activities
        </p>
      </div>
      
      {/* Actions Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {actionsToRender.map((action) => (
            <QuickActionButton 
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              enabled={action.enabled}
              category={action.category}
              estimatedTime={action.estimatedTime}
              pointValue={action.pointValue}
              requirement={action.requirement}
              progress={action.progress}
              onClick={() => handleActionClick(action.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Footer Help Text */}
      <div className="px-6 pb-6">
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {Object.values(toolAvailability).filter(v => v).length} of 4 tools available
            </span>
            <span className="text-blue-400">
              Complete activities to unlock more tools
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;