// ICPDisplayWithExport.jsx - Enhanced ICP Display with Smart Export Capabilities

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
import SmartExportInterface from '../export/SmartExportInterface';
import useNavigation from '../../hooks/useNavigation';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const ICPDisplayWithExport = () => {
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
  const [showExportInterface, setShowExportInterface] = useState(false);
  const [userTools, setUserTools] = useState(['claude', 'hubspot', 'outreach']); // Default tools for demo

  const session = authService.getCurrentSession();
  const { guidance, getHelpFor, getQuickTip } = useContextualHelp('icp-analysis');

  // Enhanced sidebar with export guidance
  const ICPAnalysisSidebar = ({ usage, progress }) => {
    return (
      <div className="space-y-6">
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
          }}
        />

        {/* Export Integration Guidance */}
        {ratingResult && (
          <SidebarSection icon="🚀" title="AMPLIFY WITH YOUR TOOLS">
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Transform this analysis into actionable assets for your existing tools
              </p>
              <div className="flex flex-wrap gap-2">
                {userTools.map(tool => (
                  <span key={tool} className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs">
                    {tool}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowExportInterface(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition-colors"
              >
                Export Intelligence →
              </button>
            </div>
          </SidebarSection>
        )}
      </div>
    );
  };

  // Tab Content Component (same as original)
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

    if (activeTab === 'export') {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-semibold text-white">Export Intelligence</h2>
            <ContextualHelp 
              title="Revenue Intelligence Export"
              content="Transform your ICP analysis into actionable assets for your existing AI, CRM, and sales automation tools."
              type="tooltip"
              position="right"
            />
          </div>
          
          {ratingResult ? (
            <SmartExportInterface
              sourceData={{
                icpData: {
                  ...icpData,
                  ratingResult,
                  buyerPersona: {
                    name: 'High-Fit Technical Buyer',
                    role: 'Technical Decision Maker',
                    painPoints: ['scalability challenges', 'manual processes', 'data inconsistencies'],
                    demographics: 'Series A/B companies, 50-200 employees',
                    decisionMaking: 'committee-based with technical validation',
                    language: 'technical and business terminology',
                    motivations: ['efficiency gains', 'competitive advantage'],
                    objections: ['implementation complexity', 'budget concerns'],
                    decisionCriteria: ['ROI', 'technical feasibility', 'team adoption']
                  },
                  targetIndustries: ['Technology', 'SaaS', 'FinTech'],
                  companySize: { min: 50, max: 500 },
                  revenueRange: { min: 10000000, max: 50000000 }
                },
                costData: {
                  impactCalculation: {
                    methodology: 'Time-value analysis with productivity multipliers',
                    results: '$2.3M annual efficiency gains'
                  }
                },
                businessCaseData: {
                  framework: {
                    executiveSummary: 'Strategic technology investment framework',
                    financialJustification: 'ROI-based analysis with risk mitigation',
                    riskAssessment: 'Technical and operational risk evaluation',
                    valueProposition: 'Accelerated development cycles with reduced technical debt'
                  }
                },
                assessmentData: {
                  competencyAreas: ['Customer Analysis', 'Value Communication', 'Sales Execution']
                }
              }}
              contentType="icp-analysis"
              userTools={userTools}
              onExport={handleExportComplete}
              className="w-full"
            />
          ) : (
            <div className="text-center py-12 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="text-gray-400 text-lg mb-4">
                Complete your ICP analysis to unlock export capabilities
              </div>
              <p className="text-gray-500 mb-6">
                Rate at least one company to generate exportable intelligence
              </p>
              <PrimaryButton
                onClick={() => setActiveTab('rating')}
                className="inline-flex"
              >
                Start Company Rating
              </PrimaryButton>
            </div>
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

                {/* Export Prompt */}
                <div className="mt-6 p-4 bg-blue-950 bg-opacity-30 border border-blue-500 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-blue-400">🚀</span>
                    <h4 className="text-sm font-medium text-white">Ready to Amplify This Analysis?</h4>
                  </div>
                  <p className="text-xs text-gray-300 mb-3">
                    Export this intelligence to your existing tools for immediate implementation
                  </p>
                  <button
                    onClick={() => setActiveTab('export')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded transition-colors"
                  >
                    Export to Your Tools →
                  </button>
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

  // Export completion handler
  const handleExportComplete = (exportResults) => {
    console.log('Export completed:', exportResults);
    
    // Create downloadable files
    exportResults.forEach(result => {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Show success message
    setShowExportInterface(false);
    // Could show toast notification here
  };

  // Navigation handlers (same as original)
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

  // Data loading effect (same as original)
  useEffect(() => {
    const loadICPData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!session || !session.recordId || !session.accessToken) {
          throw new Error('No valid session found. Please check your access link.');
        }

        const customerAssets = await airtableService.getCustomerAssets(
          session.recordId,
          session.accessToken
        );
        
        if (!customerAssets || !customerAssets.icpContent) {
          throw new Error('No ICP content found for this customer');
        }
        
        setIcpData(customerAssets.icpContent);
        
        if (customerAssets.detailedIcpAnalysis) {
          setDetailedAnalysis(customerAssets.detailedIcpAnalysis);
        }
        
        if (customerAssets.targetBuyerPersonas) {
          setBuyerPersonas(customerAssets.targetBuyerPersonas);
        }
        
        if (customerAssets.detailedIcpAnalysis || customerAssets.targetBuyerPersonas) {
          setActiveTab('enhanced');
        }
      } catch (err) {
        console.error('Failed to load ICP data:', err);
        setError(err.message);
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

  // Rating calculation (same as original)
  const calculateFitScore = async (companyName) => {
    setIsRating(true);
    setRatingResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const frameworkCriteria = icpFramework || [
        { name: 'Company Size', weight: 25 },
        { name: 'Technical Maturity', weight: 30 },
        { name: 'Growth Stage', weight: 20 },
        { name: 'Pain Point Severity', weight: 25 }
      ];

      const criteriaScores = frameworkCriteria.map(criterion => ({
        name: criterion.name,
        weight: criterion.weight,
        score: Math.floor(Math.random() * 30) + 70,
        description: criterion.description || `Assessment of ${criterion.name.toLowerCase()}`
      }));

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
      
      if (session?.customerId) {
        await airtableService.saveUserProgress(
          session.customerId,
          'icp_rating',
          { companyName, rating: mockRating }
        );
      }

      if (onICPComplete && mockRating.overallScore >= 60) {
        await onICPComplete({
          overallScore: mockRating.overallScore,
          companyName: companyName,
          timeSpent: Date.now() - startTime
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
        <Callout type="error" title="Error Loading ICP Data">
          {error}
        </Callout>
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
        companiesRated: ratingResult ? 1 : 0,
        championTier: 1
      }}
    />
  );

  // Enhanced tab structure with export tab
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
    { key: 'rating', label: 'Company Rating' },
    { key: 'export', label: '🚀 Export Intelligence', highlight: !!ratingResult }
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
      }}
    >
      <DashboardLayout 
        sidebarContent={sidebarContent} 
        currentPhase="icp-analysis"
        data-guidance="sidebar"
      >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Your ICP Analysis
            {ratingResult && (
              <span className="ml-3 text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
                Export Ready
              </span>
            )}
          </h1>
          
          {/* ICP Summary */}
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

        {/* Desktop Tab Navigation */}
        <div className="hidden lg:block sticky top-0 z-10 bg-gray-900 border-b border-gray-700">
          <div className="flex space-x-6 overflow-x-auto px-2">
            {tabStructure.map((tab) => (
              <TabButton
                key={tab.key}
                active={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={tab.highlight ? 'border-blue-500 bg-blue-950 bg-opacity-30' : ''}
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

        {/* Export Success Message */}
        {ratingResult && activeTab !== 'export' && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-500 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Revenue Intelligence Ready for Export
                </h3>
                <p className="text-blue-200">
                  Transform this analysis into actionable assets for your existing tools
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                onClick={() => setActiveTab('export')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Export to Your Tools →
              </PrimaryButton>
              <SecondaryButton
                onClick={handleContinueToCalculator}
                className="border-gray-500 text-gray-300 hover:border-gray-400"
              >
                Continue to Cost Calculator
              </SecondaryButton>
            </div>
          </div>
        )}
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

const ICPDisplayWithExportAndErrorBoundary = (props) => (
  <AsyncErrorBoundary 
    fallbackMessage="Failed to load the ICP Analysis tool. This might be due to a configuration issue or temporary service disruption."
    onRetry={() => window.location.reload()}
  >
    <ICPDisplayWithExport {...props} />
  </AsyncErrorBoundary>
);

export default ICPDisplayWithExportAndErrorBoundary;