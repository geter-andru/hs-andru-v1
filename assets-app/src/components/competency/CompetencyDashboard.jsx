import React, { useState } from 'react';
import { COMPONENT_STYLES, COLORS } from '../../constants/theme';
import CompetencyAssessment from './CompetencyAssessment';
import ProgressiveToolAccess from './ProgressiveToolAccess';
import ProfessionalMilestones from './ProfessionalMilestones';
import DailyObjectives from './DailyObjectives';

const CompetencyDashboard = ({ customerId, isVisible = true, className = '' }) => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [toolStatus, setToolStatus] = useState({});
  const [collapsed, setCollapsed] = useState(false);

  // Hide gamification elements completely if not visible
  if (!isVisible) return null;

  const handleToolStatusChange = (newStatus) => {
    setToolStatus(newStatus);
  };

  const tabs = [
    {
      id: 'assessment',
      name: 'Professional Assessment',
      icon: '📊',
      description: 'Competency evaluation and progression'
    },
    {
      id: 'access',
      name: 'Methodology Access',
      icon: '🔓',
      description: 'Tool unlock requirements and progress'
    },
    {
      id: 'milestones',
      name: 'Professional Milestones',
      icon: '🏆',
      description: 'Achievement tracking and recognition'
    },
    {
      id: 'objectives',
      name: 'Daily Development',
      icon: '🎯',
      description: 'Today\'s professional objectives'
    }
  ];

  const TabButton = ({ tab, isActive }) => (
    <button
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
      }`}
      title={tab.description}
      aria-pressed={isActive}
      aria-describedby={`${tab.id}-description`}
    >
      <span className="text-lg">{tab.icon}</span>
      <span className={`${collapsed ? 'hidden' : 'block'}`}>{tab.name}</span>
    </button>
  );

  const renderActiveComponent = () => {
    const commonProps = { customerId, className: 'w-full' };
    
    switch (activeTab) {
      case 'assessment':
        return <CompetencyAssessment {...commonProps} />;
      case 'access':
        return (
          <ProgressiveToolAccess 
            {...commonProps} 
            onToolStatusChange={handleToolStatusChange}
          />
        );
      case 'milestones':
        return <ProfessionalMilestones {...commonProps} />;
      case 'objectives':
        return <DailyObjectives {...commonProps} />;
      default:
        return <CompetencyAssessment {...commonProps} />;
    }
  };

  return (
    <div className={`${COMPONENT_STYLES.card} overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`${COLORS.secondary} ${COLORS.border} border-b p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎓</div>
            <div>
              <h2 className={`text-lg font-bold ${COLORS.textPrimary}`}>
                Professional Development Center
              </h2>
              <p className={`text-sm ${COLORS.textSecondary}`}>
                Advanced business methodology training and competency tracking
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
            title={collapsed ? 'Expand' : 'Collapse'}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand Professional Development Center' : 'Collapse Professional Development Center'}
          >
            <svg 
              className={`w-5 h-5 transform transition-transform ${collapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="bg-gray-850 border-r border-gray-700 p-4 min-h-[600px]">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                />
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className={`text-sm font-semibold text-gray-300 mb-3 ${collapsed ? 'hidden' : 'block'}`}>
                Quick Overview
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs text-gray-400 ${collapsed ? 'hidden' : 'block'}`}>
                    Tools Available
                  </span>
                  <div className="bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                    {Object.values(toolStatus).filter(t => t?.unlocked).length}/3
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs text-gray-400 ${collapsed ? 'hidden' : 'block'}`}>
                    Development
                  </span>
                  <div className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-medium">
                    Active
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`text-xs text-gray-400 ${collapsed ? 'hidden' : 'block'}`}>
                    Status
                  </span>
                  <div className="bg-purple-900 text-purple-300 px-2 py-1 rounded text-xs font-medium">
                    Training
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Tip */}
            {!collapsed && (
              <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="text-sm">💡</div>
                  <div>
                    <h5 className="text-xs font-semibold text-yellow-400 mb-1">
                      Development Tip
                    </h5>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {activeTab === 'assessment' && 'Complete analyses to advance your professional competency levels.'}
                      {activeTab === 'access' && 'Demonstrate proficiency to unlock advanced methodologies.'}
                      {activeTab === 'milestones' && 'Achievements unlock as you master business analysis skills.'}
                      {activeTab === 'objectives' && 'Daily objectives help maintain consistent professional growth.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6">
            {renderActiveComponent()}
          </div>
        </div>
      )}

      {/* Collapsed State */}
      {collapsed && (
        <div className="p-4 text-center">
          <div className="text-gray-400 text-sm">Professional Development Center</div>
          <div className="text-xs text-gray-500 mt-1">Click to expand</div>
        </div>
      )}
    </div>
  );
};

export default CompetencyDashboard;