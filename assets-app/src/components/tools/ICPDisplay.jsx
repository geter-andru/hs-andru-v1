import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import AsyncErrorBoundary, { useAsyncError } from '../common/AsyncErrorBoundary';
import ICPFrameworkDisplay from './ICPFrameworkDisplay';
import BuyerPersonaDetail from '../icp-analysis/BuyerPersonaDetail';
import AllSectionsGrid from '../icp-analysis/AllSectionsGrid';
import DashboardLayout from '../layout/DashboardLayout';
import SidebarSection from '../layout/SidebarSection';
import { TabButton, MobileTabNavigation, MobileOptimizedInput, MobileOptimizedButton } from '../layout/MobileOptimized';
import { GuidanceIntegration, ContextualHelp, QuickTip } from '../guidance';
import { useContextualHelp } from '../guidance/ToolGuidanceWrapper';
import NavigationControls from '../navigation/NavigationControls';
import { PrimaryButton, SecondaryButton } from '../ui/ButtonComponents';
import useNavigation from '../../hooks/useNavigation';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const ICPDisplay = () => {
  const { onICPComplete } = useOutletContext() || {};
  const { throwError } = useAsyncError();
  const navigation = useNavigation(null, 'icp-analysis');
  const [icpData, setIcpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [ratingResult, setRatingResult] = useState(null);
  const [isRating, setIsRating] = useState(false);
  const [icpFramework, setIcpFramework] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState('framework');
  const [detailedAnalysis, setDetailedAnalysis] = useState(null);
  const [buyerPersonas, setBuyerPersonas] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const session = authService.getCurrentSession();
  const { guidance, getHelpFor, getQuickTip } = useContextualHelp('icp-analysis');

  // Enhanced sidebar with integrated guidance
  const ICPAnalysisSidebar = ({ usage, progress }) => {
    return (
      <GuidanceIntegration
        toolName="icp-analysis"
        userProgress={{
          icp_complete: !!ratingResult,
          icp_progress: ratingResult ? 100 : (companyName ? 50 : 0),
          companiesRated: ratingResult ? 1 : 0,
          timeSpent: Math.floor((Date.now() - startTime) / 60000),
          actionsTaken: ratingResult ? 3 : 1
        }}
        customerData={icpData}
        showInSidebar={true}
        onGuidanceAction={(action, context) => {
          console.log('Guidance action taken:', action.title);
          // Could track usage here
        }}
      />
    );
  };

  // Tab Content Component
  const TabContent = ({ activeTab, sections, icpData }) => {
    if (activeTab === 'all_sections') {
      return <AllSectionsGrid sections={sections} />;
    }
    
    if (activeTab === 'framework') {
      return (
        <div className="space-y-6" data-guidance="icp-framework">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-semibold text-white">ICP Framework</h2>
            <ContextualHelp 
              {...getHelpFor('icp-framework')}
              type="tooltip"
              position="right"
            />
          </div>
          
          <ICPFrameworkDisplay 
            customerData={icpData}
            onFrameworkUpdate={handleFrameworkUpdate}
          />
          
          {icpData && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h2 className="text-lg font-semibold text-white">ICP Details</h2>
                <ContextualHelp 
                  title="Your ICP Analysis"
                  content="This detailed analysis helps you understand your ideal customer characteristics and behavior patterns."
                  type="tooltip"
                />
              </div>
              <ContentDisplay content={icpData} />
            </div>
          )}
          
          {!ratingResult && (
            <QuickTip tip={getQuickTip('first-time')} className="mt-4" />
          )}
        </div>
      );
    }

    if (activeTab === 'rating') {
      return (
        <div className="max-w-md" data-guidance="company-rating">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Company Fit Calculator</h2>
            <ContextualHelp 
              {...getHelpFor('company-rating')}
              type="tooltip"
              position="right"
            />
          </div>
          
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <MobileOptimizedInput
              label="Company Name"
              value={companyName}
              onChange={setCompanyName}
              placeholder="Enter company name to analyze"
              disabled={isRating}
            />
            
            <MobileOptimizedButton
              type="submit"
              disabled={!companyName.trim() || isRating}
              className="w-full"
            >
              {isRating ? 'Analyzing...' : 'Calculate Fit Score'}
            </MobileOptimizedButton>
          </form>

          {isRating && (
            <div className="mt-4">
              <LoadingSpinner message="Analyzing company fit..." />
            </div>
          )}

          {ratingResult && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-600 pt-4">
                <h3 className="font-semibold text-white mb-3">
                  Fit Analysis: {ratingResult.companyName}
                </h3>
                
                {/* Overall Score */}
                <div className={`rounded-lg p-4 mb-4 ${getScoreBackground(ratingResult.overallScore)} border border-gray-600`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Overall Fit Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(ratingResult.overallScore)}`}>
                      {ratingResult.overallScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1">{ratingResult.recommendation} Priority Prospect</p>
                </div>

                {/* Criteria Breakdown */}
                <div className="space-y-3">
                  {ratingResult.criteria.map((criterion, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {criterion.name} 
                          <span className="text-xs text-secondary ml-1">({criterion.weight}%)</span>
                        </span>
                        <span className={`font-semibold ${getScoreColor(criterion.score)}`}>
                          {criterion.score}/100
                        </span>
                      </div>
                      <p className="text-xs text-secondary">{criterion.description}</p>
                      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${criterion.score >= 80 ? 'bg-green-500' : criterion.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${criterion.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="mt-4">
                  <Callout type="success" title={`Recommendation: ${ratingResult.recommendation}`}>
                    <ul className="mt-2 space-y-1">
                      {ratingResult.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm">• {step}</li>
                      ))}
                    </ul>
                  </Callout>
                  
                  {ratingResult.overallScore >= 80 && (
                    <QuickTip 
                      tip="High score! This is a priority prospect - schedule a meeting within 2 weeks." 
                      className="mt-3" 
                    />
                  )}
                  
                  {ratingResult.overallScore < 60 && (
                    <QuickTip 
                      tip={getQuickTip('low-score')} 
                      className="mt-3" 
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Individual section content
    if (sections && sections[activeTab]) {
      return (
        <div dangerouslySetInnerHTML={{ __html: sections[activeTab] }} />
      );
    }

    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No content available for this section</p>
      </div>
    );
  };

  // Navigation handlers
  const handleGoBack = () => {
    setIsNavigating(true);
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation back error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleGoHome = () => {
    setIsNavigating(true);
    try {
      navigation.goHome();
    } catch (error) {
      console.error('Navigation home error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleContinueToCalculator = () => {
    setIsNavigating(true);
    try {
      navigation.goToPhase('cost-calculator');
      if (onICPComplete) {
        onICPComplete({
          hasCompleted: true,
          ratingResult,
          activeTab
        });
      }
    } catch (error) {
      console.error('Navigation to cost calculator error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    const loadICPData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!session || !session.recordId || !session.accessToken) {
          throw new Error('No valid session found. Please check your access link.');
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('Loading ICP data for session:', {
            recordId: session.recordId,
            customerId: session.customerId,
            hasToken: !!session.accessToken
          });
        }

        const customerAssets = await airtableService.getCustomerAssets(
          session.recordId,
          session.accessToken
        );
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Customer assets loaded:', customerAssets);
        }
        
        if (!customerAssets || !customerAssets.icpContent) {
          throw new Error('No ICP content found for this customer');
        }
        
        setIcpData(customerAssets.icpContent);
        
        // Load enhanced ICP data if available
        if (customerAssets.detailedIcpAnalysis) {
          setDetailedAnalysis(customerAssets.detailedIcpAnalysis);
        }
        
        if (customerAssets.targetBuyerPersonas) {
          setBuyerPersonas(customerAssets.targetBuyerPersonas);
        }
        
        // Set default active tab based on available data
        if (customerAssets.detailedIcpAnalysis || customerAssets.targetBuyerPersonas) {
          setActiveTab('enhanced');
        }
      } catch (err) {
        console.error('Failed to load ICP data:', err);
        setError(err.message);
        // Throw error to boundary for critical failures
        if (err.message.includes('configuration') || err.message.includes('unauthorized')) {
          throwError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadICPData();
    } else {
      setLoading(false);
      setError('No session available');
    }
  }, [session, throwError]);

  const handleFrameworkUpdate = (framework) => {
    setIcpFramework(framework);
  };

  const calculateFitScore = async (companyName) => {
    setIsRating(true);
    setRatingResult(null);

    try {
      // Simulate company analysis (in real implementation, this would call an AI service or external API)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Use custom framework if available, otherwise use defaults
      const frameworkCriteria = icpFramework || [
        { name: 'Company Size', weight: 25 },
        { name: 'Technical Maturity', weight: 30 },
        { name: 'Growth Stage', weight: 20 },
        { name: 'Pain Point Severity', weight: 25 }
      ];

      // Calculate scores based on framework weights
      const criteriaScores = frameworkCriteria.map(criterion => ({
        name: criterion.name,
        weight: criterion.weight,
        score: Math.floor(Math.random() * 30) + 70, // 70-100 range
        description: criterion.description || `Assessment of ${criterion.name.toLowerCase()}`
      }));

      // Calculate weighted overall score
      const overallScore = Math.round(
        criteriaScores.reduce((sum, c) => sum + (c.score * c.weight / 100), 0)
      );

      const mockRating = {
        companyName,
        overallScore,
        criteria: criteriaScores,
        recommendation: 'High Priority',
        nextSteps: [
          'Schedule discovery call within 2 weeks',
          'Prepare customized demo focusing on scalability',
          'Research recent company news and initiatives'
        ]
      };

      setRatingResult(mockRating);
      
      // Save rating to user progress (only if session is available)
      if (session?.customerId) {
        await airtableService.saveUserProgress(
          session.customerId,
          'icp_rating',
          { companyName, rating: mockRating }
        );
      }

      // Trigger workflow completion callback
      if (onICPComplete && mockRating.overallScore >= 60) {
        await onICPComplete({
          overallScore: mockRating.overallScore,
          companyName: companyName,
          timeSpent: Date.now() - startTime // Calculate time spent
        });
      }

    } catch (err) {
      console.error('Rating calculation failed:', err);
      setError('Failed to calculate company fit score');
    } finally {
      setIsRating(false);
    }
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (companyName.trim()) {
      calculateFitScore(companyName.trim());
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ICP Identification & Rating</h1>
            <p className="text-gray-400">Analyze and rate potential customers against your ideal profile</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !icpData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ICP Identification & Rating System</h1>
            <p className="text-gray-400">Analyze and rate potential customers against your ideal customer profile</p>
          </div>
        </div>
        <Callout type="error" title="Error Loading ICP Data">
          {error}
        </Callout>
        
        {/* Show basic rating interface even if data fails to load */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">ICP Framework</h2>
            <p className="text-gray-400 text-sm">ICP content is not available. You can still use the rating tool.</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Company Fit Calculator</h2>
            
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="company-name-input-form"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Company Name
                </label>
                <input
                  id="company-name-input-form"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name to analyze"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isRating}
                  aria-describedby="company-name-form-help"
                />
                <div id="company-name-form-help" className="sr-only">
                  Enter the name of the company you want to analyze against your ideal customer profile
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!companyName.trim() || isRating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                aria-describedby="calculate-button-help"
              >
                {isRating ? 'Analyzing Company...' : 'Calculate ICP Fit Score'}
              </button>
              <div id="calculate-button-help" className="sr-only">
                Click to start analyzing the company against your ideal customer profile criteria
              </div>
            </form>

            {/* Rating Results */}
            {ratingResult && (
              <div className="mt-6 space-y-4">
                <div className={`p-4 rounded-lg ${getScoreBackground(ratingResult.overallScore)} border border-gray-600`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{ratingResult.companyName}</h3>
                    <span className={`text-2xl font-bold ${getScoreColor(ratingResult.overallScore)}`}>
                      {ratingResult.overallScore}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{ratingResult.recommendation} Prospect</p>
                  
                  <div className="space-y-2">
                    {ratingResult.criteria.map((criterion, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{criterion.name}</span>
                        <span className="font-medium">{criterion.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Prepare sidebar content
  const sidebarContent = (
    <ICPAnalysisSidebar 
      usage={{
        when: ["Prospect research", "Qualification", "Team training"],
        how: [
          "Ask these questions in discovery calls:",
          "• What's driving this evaluation now?",
          "• Who else is involved in this decision?"
        ],
        success: "8.5+ scores = prioritize outreach"
      }}
      progress={{
        companiesRated: 3,
        championTier: 1
      }}
    />
  );

  // Define tab structure for better UX
  const tabStructure = [
    { key: 'framework', label: 'ICP Framework' },
    ...(detailedAnalysis || buyerPersonas ? [{ key: 'enhanced', label: 'Detailed Analysis' }] : []),
    ...(detailedAnalysis ? [
      { key: 'pain_points', label: 'Pain Points' },
      { key: 'goals_objectives', label: 'Goals & Objectives' },
      { key: 'decision_making', label: 'Decision Making' },
      { key: 'behavioral_characteristics', label: 'Behavior' },
      { key: 'all_sections', label: 'All Sections' }
    ] : []),
    { key: 'rating', label: 'Company Rating' }
  ];

  return (
    <GuidanceIntegration
      toolName="icp-analysis"
      userProgress={{
        icp_complete: !!ratingResult,
        icp_progress: ratingResult ? 100 : (companyName ? 50 : 0),
        companiesRated: ratingResult ? 1 : 0,
        timeSpent: Math.floor((Date.now() - startTime) / 60000),
        actionsTaken: ratingResult ? 3 : 1
      }}
      customerData={icpData}
      onGuidanceAction={(action, context) => {
        console.log('Main guidance action:', action.title);
        // Track comprehensive usage
      }}
    >
      <DashboardLayout 
        sidebarContent={sidebarContent} 
        currentPhase="icp-analysis"
        data-guidance="sidebar"
      >
      <div className="space-y-8">
        {/* Your ICP Analysis Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Your ICP Analysis</h1>
          
          {/* Personalized ICP Summary */}
          {icpData && (
            <div 
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8"
              style={{ minHeight: '30vh' }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">ICP Summary</h2>
              <ContentDisplay content={icpData} />
            </div>
          )}
        </div>

        {/* Mobile Tab Navigation */}
        <MobileTabNavigation
          tabs={tabStructure}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Desktop Tab Navigation - Sticky */}
        <div className="hidden lg:block sticky top-0 z-10 bg-gray-900 border-b border-gray-700">
          <div className="flex space-x-6 overflow-x-auto px-2">
            {tabStructure.map((tab) => (
              <TabButton
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tab.key === 'enhanced' && (detailedAnalysis || buyerPersonas) && (
                  <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    AI Generated
                  </span>
                )}
              </TabButton>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[40vh]">
          {activeTab === 'enhanced' && (
            <div className="space-y-8">
              {buyerPersonas && (
                <BuyerPersonaDetail persona={buyerPersonas} />
              )}
              
              {detailedAnalysis && (
                <AllSectionsGrid sections={detailedAnalysis} />
              )}
              
              {!buyerPersonas && !detailedAnalysis && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-4">
                    Enhanced ICP analysis not yet available
                  </div>
                  <p className="text-gray-500">
                    Complete your initial assessment to unlock AI-generated detailed analysis
                  </p>
                </div>
              )}
            </div>
          )}
          
          {activeTab !== 'enhanced' && (
            <TabContent 
              activeTab={activeTab} 
              sections={detailedAnalysis} 
              icpData={icpData}
            />
          )}
        </div>

        {/* Transition Section */}
        {activeTab !== 'rating' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              Now Rate Your Prospects Using These Criteria
            </h3>
            <p className="text-gray-300 mb-4">
              Use the scoring system below to evaluate how well your prospects match this ideal profile.
            </p>
            <PrimaryButton
              onClick={() => {
                try {
                  setActiveTab('rating');
                } catch (error) {
                  console.error('Tab change error:', error);
                }
              }}
              className="w-full sm:w-auto"
            >
              Start Rating Companies →
            </PrimaryButton>
          </div>
        )}

        {/* Enhanced Implementation Guidance */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold text-white">Next Steps</h3>
            <ContextualHelp 
              title="Implementation Guidance"
              content="AI-generated recommendations based on your current progress and tool usage patterns."
              type="tooltip"
            />
          </div>
          
          {ratingResult ? (
            <div className="space-y-3">
              <QuickTip tip={getQuickTip('completed-icp')} />
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <span>✅ ICP Analysis Complete</span>
                <span>•</span>
                <span>Score: {ratingResult.overallScore}/100</span>
                <span>•</span>
                <span>Ready for Cost Calculator</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <QuickTip tip="Complete a company rating to unlock the next phase of your sales intelligence journey." />
              <div className="text-sm text-gray-400">
                Progress: Framework reviewed, ready to rate prospects
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        currentPhase={navigation.currentPhase}
        onGoBack={handleGoBack}
        onGoHome={handleGoHome}
        onNextPhase={handleContinueToCalculator}
        canGoBack={true}
        nextLabel="Continue to Cost Calculator"
        disabled={isNavigating}
      />
      </DashboardLayout>
    </GuidanceIntegration>
  );
};

const ICPDisplayWithErrorBoundary = (props) => (
  <AsyncErrorBoundary 
    fallbackMessage="Failed to load the ICP Analysis tool. This might be due to a configuration issue or temporary service disruption."
    onRetry={() => window.location.reload()}
  >
    <ICPDisplay {...props} />
  </AsyncErrorBoundary>
);

export default ICPDisplayWithErrorBoundary;