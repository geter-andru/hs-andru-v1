/**
 * Simple Enhanced Customer Dashboard - Phase 1 Testing
 * 
 * Implements sophisticated tab navigation system and progress tracking sidebar
 * with professional competency development architecture (simplified for testing).
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../../services/authService';
import { airtableService } from '../../services/airtableService';
import LoadingSpinner from '../common/LoadingSpinner';
import { Callout } from '../common/ContentDisplay';
import TabNavigation from './TabNavigation';
import ProgressSidebar from './ProgressSidebar';
import UnlockRequirementsModal from './UnlockRequirementsModal';

const SimpleEnhancedDashboard = () => {
  const { customerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [activeTab, setActiveTab] = useState('icp-analysis');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedLockedTool, setSelectedLockedTool] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Professional competency data structure
  const [competencyData, setCompetencyData] = useState({
    // Assessment baseline scores (from initial assessment)
    baselineCustomerAnalysis: 45,
    baselineValueCommunication: 38,
    baselineSalesExecution: 42,
    
    // Current progress scores (updated through platform usage)
    currentCustomerAnalysis: 45,
    currentValueCommunication: 38,
    currentSalesExecution: 42,
    
    // Progress tracking
    totalProgressPoints: 0,
    currentLevel: 'Customer Intelligence Foundation',
    currentLevelPoints: 0,
    totalLevelPoints: 1000,
    
    // Tool unlock states
    toolUnlockStates: {
      icpUnlocked: true,
      costCalculatorUnlocked: false,
      businessCaseUnlocked: false
    },
    
    // Activity tracking
    sectionsViewed: [],
    completedRealWorldActions: [],
    lastActivityDate: new Date().toISOString(),
    totalSessions: 1
  });

  // Tab configuration with professional unlock requirements
  const tabConfig = [
    {
      id: 'icp-analysis',
      label: 'ICP Analysis',
      description: 'Customer Intelligence Foundation',
      icon: '🎯',
      unlocked: competencyData.toolUnlockStates.icpUnlocked
    },
    {
      id: 'cost-calculator',
      label: 'Cost Calculator',
      description: 'Value Communication Methodology',
      icon: '💰',
      unlocked: competencyData.toolUnlockStates.costCalculatorUnlocked,
      requirementScore: 70,
      requirementCategory: 'valueCommunication',
      requirementLevel: 'Value Communication Developing'
    },
    {
      id: 'business-case',
      label: 'Business Case',
      description: 'Sales Execution Framework',
      icon: '📊',
      unlocked: competencyData.toolUnlockStates.businessCaseUnlocked,
      requirementScore: 70,
      requirementCategory: 'salesExecution',
      requirementLevel: 'Sales Strategy Proficient'
    }
  ];

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get active tab from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('cost-calculator')) setActiveTab('cost-calculator');
    else if (path.includes('business-case')) setActiveTab('business-case');
    else setActiveTab('icp-analysis');
  }, [location.pathname]);

  // Load customer data and competency information
  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);

        const session = authService.getCurrentSession();
        if (!session || !session.recordId) {
          throw new Error('No valid session found. Please check your access link.');
        }

        // Load customer assets from Airtable
        const customerAssets = await airtableService.getCustomerAssets(
          session.recordId,
          session.accessToken
        );

        if (!customerAssets) {
          throw new Error('No customer data found');
        }

        setCustomerData(customerAssets);

        // Load competency data (would come from assessment integration in Phase 4)
        // For now, using mock data structure that matches the Airtable schema
        const enhancedCompetencyData = {
          ...competencyData,
          // These would be loaded from Airtable in Phase 4
          baselineCustomerAnalysis: customerAssets.baseline_customer_analysis || 45,
          baselineValueCommunication: customerAssets.baseline_value_communication || 38,
          baselineSalesExecution: customerAssets.baseline_sales_execution || 42,
          currentCustomerAnalysis: customerAssets.current_customer_analysis || 45,
          currentValueCommunication: customerAssets.current_value_communication || 38,
          currentSalesExecution: customerAssets.current_sales_execution || 42,
          totalProgressPoints: customerAssets.total_progress_points || 0,
          toolUnlockStates: {
            icpUnlocked: customerAssets.icp_unlocked !== false,
            costCalculatorUnlocked: customerAssets.cost_calculator_unlocked || false,
            businessCaseUnlocked: customerAssets.business_case_unlocked || false
          }
        };

        setCompetencyData(enhancedCompetencyData);

      } catch (err) {
        console.error('Failed to load customer data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  // Tab navigation handler with lock state checking
  const handleTabNavigation = useCallback((tabId) => {
    const tab = tabConfig.find(t => t.id === tabId);
    
    if (!tab) return;

    // Check if tab is unlocked
    if (!tab.unlocked) {
      setSelectedLockedTool(tab);
      setShowUnlockModal(true);
      return;
    }

    // Navigate to the tab
    const session = authService.getCurrentSession();
    const queryString = session?.accessToken ? `?token=${session.accessToken}` : '';
    navigate(`/customer/${customerId}/dashboard/${tabId}${queryString}`);
  }, [tabConfig, customerId, navigate]);

  // Progress point award system
  const awardProgressPoints = useCallback(async (points, category) => {
    try {
      const updatedData = { ...competencyData };
      
      // Add points to total
      updatedData.totalProgressPoints += points;
      
      // Add points to specific category
      switch (category) {
        case 'customerAnalysis':
          updatedData.currentCustomerAnalysis = Math.min(100, updatedData.currentCustomerAnalysis + (points / 10));
          break;
        case 'valueCommunication':
          updatedData.currentValueCommunication = Math.min(100, updatedData.currentValueCommunication + (points / 10));
          break;
        case 'salesExecution':
          updatedData.currentSalesExecution = Math.min(100, updatedData.currentSalesExecution + (points / 10));
          break;
      }

      // Check for tool unlocks
      if (updatedData.currentValueCommunication >= 70 && !updatedData.toolUnlockStates.costCalculatorUnlocked) {
        updatedData.toolUnlockStates.costCalculatorUnlocked = true;
        // Show professional achievement notification
        console.log('Cost Calculator methodology unlocked!');
      }

      if (updatedData.currentSalesExecution >= 70 && !updatedData.toolUnlockStates.businessCaseUnlocked) {
        updatedData.toolUnlockStates.businessCaseUnlocked = true;
        // Show professional achievement notification
        console.log('Business Case framework unlocked!');
      }

      // Update level based on total points
      if (updatedData.totalProgressPoints >= 20000) {
        updatedData.currentLevel = 'Revenue Intelligence Master';
      } else if (updatedData.totalProgressPoints >= 10000) {
        updatedData.currentLevel = 'Market Execution Expert';
      } else if (updatedData.totalProgressPoints >= 5000) {
        updatedData.currentLevel = 'Revenue Development Advanced';
      } else if (updatedData.totalProgressPoints >= 2500) {
        updatedData.currentLevel = 'Sales Strategy Proficient';
      } else if (updatedData.totalProgressPoints >= 1000) {
        updatedData.currentLevel = 'Value Communication Developing';
      }

      setCompetencyData(updatedData);

      // In Phase 4, this would update Airtable
      // await airtableService.updateProgressPoints(customerId, points, category);

    } catch (error) {
      console.error('Error awarding progress points:', error);
    }
  }, [competencyData, customerId]);

  // Tool completion callbacks with progress tracking
  const toolCallbacks = {
    onICPComplete: useCallback(async (data) => {
      await awardProgressPoints(50, 'customerAnalysis');
      return data;
    }, [awardProgressPoints]),

    onCostCalculated: useCallback(async (data) => {
      await awardProgressPoints(75, 'valueCommunication');
      return data;
    }, [awardProgressPoints]),

    onBusinessCaseReady: useCallback(async (data) => {
      await awardProgressPoints(100, 'salesExecution');
      return data;
    }, [awardProgressPoints])
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner 
          message="Loading professional competency dashboard..." 
          size="large"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Callout type="error" title="Dashboard Error">
            {error}
          </Callout>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Main Dashboard Layout - 80/20 split */}
      <div className={`grid gap-6 p-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-5'}`}>
        {/* Main Content Area - 80% */}
        <div className={`${isMobile ? 'col-span-1 order-2' : 'col-span-4'} space-y-6`}>
          {/* Professional Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Revenue Intelligence Platform
                </h1>
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
          </motion.div>

          {/* Tab Navigation */}
          <TabNavigation
            tabs={tabConfig}
            activeTab={activeTab}
            competencyData={competencyData}
            onTabClick={handleTabNavigation}
            className="w-full"
          />

          {/* Active Tool Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <Outlet context={toolCallbacks} />
            </div>
          </motion.div>
        </div>

        {/* Progress Sidebar - 20% */}
        <div className={`${isMobile ? 'col-span-1 order-1' : 'col-span-1'}`}>
          <ProgressSidebar
            competencyData={competencyData}
            onAwardPoints={awardProgressPoints}
            className="sticky top-6"
          />
        </div>
      </div>

      {/* Unlock Requirements Modal */}
      <UnlockRequirementsModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        tool={selectedLockedTool}
        competencyData={competencyData}
      />
    </div>
  );
};

export default SimpleEnhancedDashboard;