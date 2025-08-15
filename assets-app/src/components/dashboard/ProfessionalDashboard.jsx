import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Calculator, FileText, PlusCircle } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import InteractiveFilters from './InteractiveFilters';
import CompetencyGauges from './CompetencyGauges';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import WeeklySummary from './WeeklySummary';
import DevelopmentFocus from './DevelopmentFocus';
import AssessmentInsights from './AssessmentInsights';
import { AssessmentProvider } from '../../contexts/AssessmentContext';
import { getMockDataByCustomerId, testScenarios } from '../../data/mockProfessionalData';

const DashboardGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 ${className}`}>
      {children}
    </div>
  );
};

const ProfessionalDashboard = ({ customerId: propCustomerId, mockMode = false, testScenario = null }) => {
  const { customerId: paramCustomerId } = useParams();
  const navigate = useNavigate();
  
  // Use prop customerId for testing, fallback to URL param
  const customerId = propCustomerId || paramCustomerId;
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Phase 4: Filter state management
  const [filters, setFilters] = useState({
    timeFilter: 'week',
    competencyFilter: 'all',
    activityFilter: 'all',
    impactFilter: 'all'
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get mock data based on customer ID and test scenario
        let data = getMockDataByCustomerId(customerId);
        
        // Apply test scenario if specified (for Phase 2 testing)
        if (testScenario && testScenarios[testScenario]) {
          data = {
            ...data,
            ...testScenarios[testScenario].data
          };
        }
        
        setDashboardData(data);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      loadDashboardData();
    }
  }, [customerId, testScenario]);

  // Phase 4: Filter logic for activity data
  const getFilteredActivities = () => {
    if (!dashboardData?.recentActivities) return [];
    
    let filtered = [...dashboardData.recentActivities];
    
    // Time filter
    if (filters.timeFilter !== 'all') {
      const timeRanges = {
        week: 7,
        month: 30,
        quarter: 90
      };
      const days = timeRanges[filters.timeFilter];
      
      if (days) {
        // For mock data, we'll filter based on timestamp strings
        filtered = filtered.filter(activity => {
          // Parse relative timestamps like "2 hours ago", "Yesterday", etc.
          const timestamp = activity.timestamp?.toLowerCase() || '';
          
          if (timestamp.includes('hour') || timestamp.includes('minute')) {
            return true; // Recent activity within a day
          } else if (timestamp === 'yesterday') {
            return filters.timeFilter !== 'week' ? false : true;
          } else if (timestamp.includes('day')) {
            const daysAgo = parseInt(timestamp.match(/\d+/)?.[0] || '0');
            return daysAgo <= days;
          } else if (timestamp.includes('week')) {
            const weeksAgo = parseInt(timestamp.match(/\d+/)?.[0] || '0');
            return weeksAgo * 7 <= days;
          }
          return true; // Include if we can't parse
        });
      }
    }
    
    // Competency filter
    if (filters.competencyFilter !== 'all') {
      const competencyMap = {
        'customerAnalysis': 'Customer Analysis',
        'valueCommunication': 'Value Communication',
        'salesExecution': 'Sales Execution'
      };
      const targetCompetency = competencyMap[filters.competencyFilter];
      
      if (targetCompetency) {
        filtered = filtered.filter(activity => 
          activity.competencyCategory === targetCompetency || 
          activity.category === targetCompetency
        );
      }
    }
    
    // Activity type filter
    if (filters.activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === filters.activityFilter);
    }
    
    // Impact level filter
    if (filters.impactFilter !== 'all') {
      filtered = filtered.filter(activity => activity.impactLevel === filters.impactFilter);
    }
    
    return filtered;
  };

  // Filter change handlers
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      timeFilter: 'week',
      competencyFilter: 'all',
      activityFilter: 'all',
      impactFilter: 'all'
    });
  };

  // Handle quick action clicks
  const handleActionClick = (actionId) => {
    switch (actionId) {
      case 'rate_prospect':
        console.log('Opening ICP Analysis tool...');
        if (!mockMode) {
          navigate(`/customer/${customerId}/dashboard/icp`);
        }
        break;
      case 'cost_analysis':
        console.log('Opening Cost Calculator tool...');
        if (!mockMode) {
          navigate(`/customer/${customerId}/dashboard/cost-calculator`);
        }
        break;
      case 'business_case':
        console.log('Opening Business Case Builder...');
        if (!mockMode) {
          navigate(`/customer/${customerId}/dashboard/business-case`);
        }
        break;
      case 'log_activity':
        console.log('Opening Activity Tracker...');
        // TODO: Implement activity tracker modal
        break;
      default:
        console.log(`Unknown action: ${actionId}`);
    }
  };

  // Handle view all activities
  const handleViewAllActivities = () => {
    console.log('Opening full activity history...');
    // TODO: Implement activity history view
  };

  // Handle competency gauge clicks (Phase 2 enhancement)
  const handleGaugeClick = (competencyName) => {
    console.log(`Opening detailed ${competencyName} competency analysis...`);
    // TODO: Phase 3 will implement detailed competency modals
  };

  // Phase 5: Handle development session start (Stealth Gamification)
  const handleStartDevelopmentSession = (recommendation = null) => {
    if (recommendation) {
      console.log('Starting recommended development session:', recommendation.title);
    } else {
      console.log('Starting professional development session...');
    }
    // TODO: Implement development session modal/flow
  };

  // Phase 5: Handle milestones view
  const handleViewMilestones = () => {
    console.log('Opening professional milestones history...');
    // TODO: Implement milestones modal
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading professional dashboard...</div>
      </div>
    );
  }

  // Error state
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Failed to load dashboard data</div>
      </div>
    );
  }

  const { customer, competencyAreas, nextUnlock, recentActivities, weeklySummary, developmentFocus } = dashboardData;
  
  // Extract competency scores for QuickActions
  const competencyScores = {
    customerAnalysis: competencyAreas.find(a => a.name === 'Customer Analysis')?.current || 0,
    valueCommunication: competencyAreas.find(a => a.name === 'Value Communication')?.current || 0,
    salesExecution: competencyAreas.find(a => a.name === 'Sales Execution')?.current || 0
  };

  // Prepare assessment data for context provider
  const assessmentCustomerData = {
    assessment: {
      performance: {
        level: dashboardData.assessmentData?.performance_level || dashboardData.assessmentData?.performance?.level,
        isHighPriority: dashboardData.assessmentData?.is_high_priority || dashboardData.assessmentData?.performance?.isHighPriority
      },
      scores: {
        overall: dashboardData.assessmentData?.overall_score || dashboardData.assessmentData?.scores?.overall,
        buyerUnderstanding: dashboardData.assessmentData?.buyer_understanding_score || dashboardData.assessmentData?.scores?.buyerUnderstanding,
        techToValue: dashboardData.assessmentData?.tech_to_value_score || dashboardData.assessmentData?.scores?.techToValue
      },
      revenue: {
        opportunity: dashboardData.assessmentData?.revenue_opportunity || dashboardData.assessmentData?.revenue?.opportunity,
        roiMultiplier: dashboardData.assessmentData?.roi_multiplier || dashboardData.assessmentData?.revenue?.roiMultiplier,
        impactTimeline: dashboardData.assessmentData?.impact_timeline || dashboardData.assessmentData?.revenue?.impactTimeline
      },
      challenges: {
        total: dashboardData.assessmentData?.total_challenges || dashboardData.assessmentData?.challenges?.total,
        critical: dashboardData.assessmentData?.critical_challenges || dashboardData.assessmentData?.challenges?.critical,
        highPriority: dashboardData.assessmentData?.high_priority_challenges || dashboardData.assessmentData?.challenges?.highPriority
      },
      strategy: {
        focusArea: dashboardData.assessmentData?.focus_area || dashboardData.assessmentData?.strategy?.focusArea || 'Technical Translation',
        primaryRecommendation: dashboardData.assessmentData?.primary_recommendation || dashboardData.assessmentData?.strategy?.primaryRecommendation,
        recommendationType: dashboardData.assessmentData?.recommendation_type || dashboardData.assessmentData?.strategy?.recommendationType
      }
    },
    competencyBaselines: dashboardData.competencyBaselines
  };

  // Determine action availability based on competency scores
  const actions = [
    {
      id: 'rate_prospect',
      title: 'Rate Prospect',
      description: 'ICP Analysis Tool',
      icon: Target,
      enabled: true,
      locked: false
    },
    {
      id: 'cost_analysis',
      title: 'Cost Analysis',
      description: 'Financial Impact Calculator',
      icon: Calculator,
      enabled: competencyAreas.find(a => a.name === 'Value Communication')?.current >= 70,
      locked: competencyAreas.find(a => a.name === 'Value Communication')?.current < 70,
      requirement: '70+ Value Communication'
    },
    {
      id: 'business_case',
      title: 'Business Case',
      description: 'Executive Proposal Builder',
      icon: FileText,
      enabled: competencyAreas.find(a => a.name === 'Sales Execution')?.current >= 70,
      locked: competencyAreas.find(a => a.name === 'Sales Execution')?.current < 70,
      requirement: '70+ Sales Execution'
    },
    {
      id: 'log_activity',
      title: 'Log Activity',
      description: 'Professional Action Tracker',
      icon: PlusCircle,
      enabled: true,
      locked: false
    }
  ];

  return (
    <AssessmentProvider customerData={assessmentCustomerData}>
      <div className="min-h-screen bg-gray-900">
        {/* Professional Dashboard Header */}
        <DashboardHeader 
          customerName={customer.name}
          companyName={customer.company}
          competencyLevel={customer.competencyLevel}
          isAdmin={customer.isAdmin}
        />
        
        {/* Phase 4: Interactive Filters */}
        <InteractiveFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={clearAllFilters}
          filteredResults={getFilteredActivities()}
          totalResults={recentActivities?.length || 0}
        />
        
        {/* Phase 5: Enhanced Five-Section Dashboard Grid with Assessment Context */}
        <DashboardGrid>
        {/* First Row: Development Focus (Assessment-Driven Stealth Gamification with Context) */}
        <DevelopmentFocus 
          developmentData={developmentFocus}
          competencyScores={competencyScores}
          onStartSession={handleStartDevelopmentSession}
          onShowMilestones={handleViewMilestones}
          className="lg:col-span-2"
        />
        
        {/* Assessment-Driven Competency Gauges */}
        <CompetencyGauges 
          competencyAreas={competencyAreas}
          nextUnlock={nextUnlock}
          competencyBaselines={dashboardData.competencyBaselines}
          assessmentData={dashboardData.assessmentData}
          onGaugeClick={handleGaugeClick}
          className=""
        />
        
        {/* Second Row: Actions and Activity */}
        <QuickActions 
          actions={actions}
          onActionClick={handleActionClick}
          competencyScores={competencyScores}
          className=""
        />
        
        <RecentActivity 
          activities={getFilteredActivities()}
          onViewAll={handleViewAllActivities}
          className=""
        />
        
        {/* Weekly Summary */}
        <WeeklySummary 
          weeklyData={weeklySummary}
          className=""
        />
      </DashboardGrid>
      
      {/* Assessment Insights Section - Full Width */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <AssessmentInsights 
          assessmentData={dashboardData.assessmentData}
          className=""
        />
      </div>
      
      {/* Development Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-medium mb-2">Phase 5 Development Info:</h3>
            <div className="text-gray-400 text-sm space-y-1">
              <div>Customer ID: {customerId}</div>
              <div>Mock Mode: {mockMode ? 'Yes' : 'No'}</div>
              <div>Admin User: {customer.isAdmin ? 'Yes' : 'No'}</div>
              <div>Tools Unlocked: {actions.filter(a => a.enabled && !a.locked).length}/4</div>
              <div>Phase 5: Development Focus Card (Stealth Gamification) Active</div>
              <div>Current Level: {developmentFocus?.currentLevel || 'Developing'}</div>
              <div>Points to Next Unlock: {developmentFocus?.nextUnlock?.pointsNeeded || 0}</div>
              <div>Weekly Recommendations: {developmentFocus?.recommendations?.length || 0}</div>
              <div>Recent Milestones: {developmentFocus?.recentMilestones?.length || 0}</div>
              <div>Active Filters: {Object.values(filters).filter(f => f !== 'all').length}</div>
              <div>Filtered Activities: {getFilteredActivities().length} of {recentActivities?.length || 0}</div>
              <div>Stealth Gamification: 100% Professional Presentation</div>
              <div>Assessment Score: {dashboardData.assessmentData?.overall_score || 'N/A'}</div>
              <div>Performance Level: {dashboardData.assessmentData?.performance_level || 'N/A'}</div>
              <div>Revenue Opportunity: ${dashboardData.assessmentData?.revenue_opportunity?.toLocaleString() || 'N/A'}</div>
              <div>Personalized Recommendations: {dashboardData.personalizedRecommendations?.length || 0}</div>
              <div>Messaging Tone: {dashboardData.personalizedMessaging?.tone || 'N/A'}</div>
              <div>Assessment-Driven: {dashboardData.personalizedMessaging ? 'Yes' : 'No'}</div>
              {testScenario && <div>Test Scenario: {testScenarios[testScenario]?.name}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
    </AssessmentProvider>
  );
};

export { DashboardGrid };
export default ProfessionalDashboard;