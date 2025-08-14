/**
 * Phase 1 Test Component
 * 
 * Standalone test of the enhanced dashboard components
 */

import React, { useState } from 'react';
import TabNavigation from '../dashboard/TabNavigation';
import ProgressSidebar from '../dashboard/ProgressSidebar';
import UnlockRequirementsModal from '../dashboard/UnlockRequirementsModal';

const Phase1Test = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

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
    const tab = tabConfig.find(t => t.id === tabId);
    if (!tab.unlocked) {
      setSelectedTool(tab);
      setShowModal(true);
    } else {
      console.log('Navigate to:', tabId);
    }
  };

  const handleAwardPoints = (points, category) => {
    console.log(`Awarded ${points} points to ${category}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Phase 1: Professional Competency System Test
        </h1>
        
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