/**
 * Phase 1 Test Component
 * 
 * Standalone test of the enhanced dashboard components
 */

import React, { useState } from 'react';
import TabNavigation from '../dashboard/TabNavigation';
import ProgressSidebar from '../dashboard/ProgressSidebar';
import UnlockRequirementsModal from '../dashboard/UnlockRequirementsModal';
import Phase4Test from './Phase4Test';
import WelcomeExperienceTest from './WelcomeExperienceTest';
import DashboardTest from './DashboardTest';
import Phase1DashboardTest from './Phase1DashboardTest';

const Phase1Test = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTest, setActiveTest] = useState('phase1'); // 'phase1', 'phase4', 'welcome', 'dashboard', or 'phase1-dashboard'

  // Mock competency data
  const competencyData = {
    baselineCustomerAnalysis: 45,
    baselineValueCommunication: 38,
    baselineSalesExecution: 42,
    currentCustomerAnalysis: 65,
    currentValueCommunication: 52,
    currentSalesExecution: 48,
    totalProgressPoints: 350,
    currentLevel: 'Customer Intelligence Foundation',
    toolUnlockStates: {
      icpUnlocked: true,
      costCalculatorUnlocked: false,
      businessCaseUnlocked: false
    }
  };

  // Mock tab configuration
  const tabConfig = [
    {
      id: 'icp-analysis',
      label: 'ICP Analysis',
      description: 'Customer Intelligence Foundation',
      icon: '🎯',
      unlocked: true
    },
    {
      id: 'cost-calculator',
      label: 'Cost Calculator',
      description: 'Value Communication Methodology',
      icon: '💰',
      unlocked: false,
      requirementScore: 70,
      requirementCategory: 'valueCommunication',
      requirementLevel: 'Value Communication Developing'
    },
    {
      id: 'business-case',
      label: 'Business Case',
      description: 'Sales Execution Framework',
      icon: '📊',
      unlocked: false,
      requirementScore: 70,
      requirementCategory: 'salesExecution',
      requirementLevel: 'Sales Strategy Proficient'
    }
  ];

  const handleTabClick = (tabId) => {
    console.log('Tab clicked:', tabId); // Debug log
    const tab = tabConfig.find(t => t.id === tabId);
    if (!tab.unlocked) {
      console.log('Tab is locked, showing modal for:', tab.label); // Debug log
      setSelectedTool(tab);
      setShowModal(true);
    } else {
      console.log('Navigate to:', tabId);
      alert(`Navigating to: ${tab.label}`); // Visual feedback for unlocked tabs
    }
  };

  const handleAwardPoints = (points, category) => {
    console.log(`Awarded ${points} points to ${category}`);
    alert(`Awarded ${points} points to ${category}!`); // Visual feedback
  };

  // Return Phase 4 test if selected
  if (activeTest === 'phase4') {
    return <Phase4Test />;
  }

  // Return Welcome Experience test if selected
  if (activeTest === 'welcome') {
    return <WelcomeExperienceTest />;
  }

  // Return Dashboard test if selected
  if (activeTest === 'dashboard') {
    return <DashboardTest />;
  }

  // Return Phase 1 Dashboard test if selected
  if (activeTest === 'phase1-dashboard') {
    return <Phase1DashboardTest />;
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Professional Competency System Test
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTest('phase1')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTest === 'phase1'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Phase 1 Test
            </button>
            <button
              onClick={() => setActiveTest('phase4')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTest === 'phase4'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Phase 4 Integration Test
            </button>
            <button
              onClick={() => setActiveTest('welcome')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTest === 'welcome'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Welcome Experience
            </button>
            <button
              onClick={() => setActiveTest('phase1-dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTest === 'phase1-dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Phase 5 Dashboard
            </button>
            <button
              onClick={() => setActiveTest('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTest === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Full Dashboard
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-4 space-y-6">
            {/* Header */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Revenue Intelligence Platform
                  </h2>
                  <p className="text-gray-400">
                    Professional competency development through systematic methodology
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Current Level</div>
                  <div className="text-lg font-medium text-blue-400">
                    {competencyData.currentLevel}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <TabNavigation
              tabs={tabConfig}
              activeTab="icp-analysis"
              competencyData={competencyData}
              onTabClick={handleTabClick}
            />

            {/* Mock Tool Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Active Tool: ICP Analysis
                </h3>
                <p className="text-gray-400 mb-6">
                  This is where the actual tool content would be displayed.
                  Click on locked tabs to see the unlock requirements modal.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="text-2xl text-blue-400 mb-2">65</div>
                    <div className="text-sm text-gray-400">Customer Analysis</div>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-2xl text-green-400 mb-2">350</div>
                    <div className="text-sm text-gray-400">Progress Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <ProgressSidebar
              competencyData={competencyData}
              onAwardPoints={handleAwardPoints}
            />
          </div>
        </div>
      </div>

      {/* Test Modal */}
      <UnlockRequirementsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        tool={selectedTool}
        competencyData={competencyData}
      />
    </div>
  );
};

export default Phase1Test;