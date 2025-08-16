// CostCalculatorWithExport.jsx - Enhanced Cost Calculator with Smart Export Capabilities

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import { CardSkeleton } from '../common/LoadingSpinner';
import AsyncErrorBoundary, { useAsyncError } from '../common/AsyncErrorBoundary';
import DashboardLayout from '../layout/DashboardLayout';
import SidebarSection from '../layout/SidebarSection';
import { MobileOptimizedInput, MobileOptimizedButton, MobileOptimizedCard } from '../layout/MobileOptimized';
import ImplementationGuidance from '../guidance/ImplementationGuidance';
import SuccessMetricsPanel from '../guidance/SuccessMetricsPanel';
import ExportStrategyGuide from '../guidance/ExportStrategyGuide';
import NavigationControls from '../navigation/NavigationControls';
import { PrimaryButton, SecondaryButton } from '../ui/ButtonComponents';
import SmartExportInterface from '../export/SmartExportInterface';
import useNavigation from '../../hooks/useNavigation';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';
import { COMPONENT_STYLES, COLORS } from '../../constants/theme';
import { BUSINESS } from '../../constants/app';

const CostCalculatorWithExport = () => {
  const { onCostCalculated } = useOutletContext() || {};
  const { throwError } = useAsyncError();
  const navigation = useNavigation(null, 'cost-calculator');
  const [costData, setCostData] = useState(null);
  const [icpData, setIcpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [autoPopulated, setAutoPopulated] = useState(new Set());
  const [startTime] = useState(Date.now());
  const [isNavigating, setIsNavigating] = useState(false);
  const [showExportInterface, setShowExportInterface] = useState(false);
  const [userTools, setUserTools] = useState(['claude', 'salesforce', 'apollo']);
  const [formData, setFormData] = useState({
    currentRevenue: '',
    targetGrowthRate: '20',
    averageDealSize: '',
    salesCycleLength: '90',
    conversionRate: '15',
    churnRate: '5',
    timeframe: BUSINESS.standardAnalysisPeriod.toString()
  });

  const session = authService.getCurrentSession();

  // Enhanced sidebar with export guidance
  const CostCalculatorSidebar = ({ usage }) => {
    return (
      <div className="space-y-6">
        <SidebarSection icon="💡" title="WHEN TO USE">
          <ul className="space-y-1">
            {usage.when.map((item, index) => (
              <li key={index} className="text-gray-300 text-sm">• {item}</li>
            ))}
          </ul>
        </SidebarSection>
        
        <SidebarSection icon="🗣️" title="HOW TO PRESENT">
          <p className="text-gray-300 text-sm">"{usage.presentation}"</p>
        </SidebarSection>
        
        <SidebarSection icon="📊" title="EXPORT OPTIONS">
          <ul className="space-y-1">
            {usage.exports.map((item, index) => (
              <li key={index} className="text-gray-300 text-sm">• {item}</li>
            ))}
          </ul>
        </SidebarSection>

        {/* Export Integration Guidance */}
        {calculations && (
          <SidebarSection icon="🚀" title="AMPLIFY WITH YOUR TOOLS">
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Transform this cost analysis into compelling assets for prospect engagement
              </p>
              <div className="flex flex-wrap gap-2">
                {userTools.map(tool => (
                  <span key={tool} className="px-2 py-1 bg-purple-900 text-purple-200 rounded text-xs">
                    {tool}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowExportInterface(true)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-2 rounded transition-colors"
              >
                Export Cost Intelligence →
              </button>
            </div>
          </SidebarSection>
        )}
        
        <SidebarSection icon="⚡" title="URGENCY PHRASES">
          {usage.urgencyPhrases.map((phrase, index) => (
            <p key={index} className="text-gray-300 text-sm">"{phrase}"</p>
          ))}
        </SidebarSection>
      </div>
    );
  };

  // Cost Timeline Chart Component
  const CostTimelineChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No data available for chart
        </div>
      );
    }

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value, name) => [
                `$${value.toLocaleString()}`, 
                name === 'cumulativeCost' ? 'Cumulative Cost of Inaction' : name
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="monthlyCost" 
              stroke={COLORS.warning} 
              strokeWidth={2}
              name="Monthly Cost"
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeCost" 
              stroke={COLORS.danger} 
              strokeWidth={3}
              name="Cumulative Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Enhanced export source data generation
  const generateExportSourceData = useCallback(() => {
    if (!calculations || !costData || !icpData) return null;

    return {
      icpData: {
        buyerPersona: {
          name: 'Revenue Operations Leader',
          role: 'VP Sales/RevOps',
          painPoints: ['revenue predictability', 'sales inefficiency', 'data silos'],
          demographics: 'Mid-market companies, $10M-100M revenue',
          decisionMaking: 'committee-based with financial validation',
          language: 'business and financial terminology',
          motivations: ['revenue growth', 'operational efficiency', 'competitive advantage'],
          objections: ['budget constraints', 'implementation complexity', 'ROI timeline'],
          decisionCriteria: ['financial impact', 'implementation ease', 'vendor stability']
        },
        targetIndustries: ['Technology', 'SaaS', 'Professional Services'],
        companySize: { min: 100, max: 1000 },
        revenueRange: { 
          min: parseInt(formData.currentRevenue) || 10000000, 
          max: (parseInt(formData.currentRevenue) || 10000000) * 5 
        }
      },
      costData: {
        impactCalculation: {
          methodology: 'Revenue opportunity analysis with cost of inaction modeling',
          results: `$${calculations.totalLossFirstYear.toLocaleString()} annual impact identified`,
          categories: calculations.breakdown,
          timeframe: parseInt(formData.timeframe),
          assumptions: {
            averageDealSize: parseInt(formData.averageDealSize),
            conversionRate: parseFloat(formData.conversionRate),
            salesCycleLength: parseInt(formData.salesCycleLength),
            targetGrowthRate: parseFloat(formData.targetGrowthRate)
          }
        },
        qualificationCriteria: [
          'Budget authority confirmed',
          'Revenue growth challenges identified',
          'Current inefficiencies quantified',
          'Timeline for improvement established'
        ]
      },
      businessCaseData: {
        framework: {
          executiveSummary: 'Revenue acceleration through systematic process optimization',
          financialJustification: `${calculations.totalLossFirstYear.toLocaleString()} annual opportunity cost elimination`,
          riskAssessment: 'Low implementation risk with proven methodology',
          valueProposition: 'Accelerated revenue growth through systematic process improvement'
        }
      },
      assessmentData: {
        competencyAreas: ['Revenue Analysis', 'Process Optimization', 'Financial Modeling']
      }
    };
  }, [calculations, costData, icpData, formData]);

  // Export completion handler
  const handleExportComplete = (exportResults) => {
    console.log('Cost calculator export completed:', exportResults);
    
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

    setShowExportInterface(false);
  };

  // Calculation logic
  const calculateCostOfInaction = useCallback(() => {
    const revenue = parseInt(formData.currentRevenue) || 0;
    const growthRate = parseFloat(formData.targetGrowthRate) || 0;
    const dealSize = parseInt(formData.averageDealSize) || 0;
    const cycleLength = parseInt(formData.salesCycleLength) || 90;
    const conversionRate = parseFloat(formData.conversionRate) || 0;
    const churnRate = parseFloat(formData.churnRate) || 0;
    const timeframeMonths = parseInt(formData.timeframe) || 12;

    if (revenue === 0 || dealSize === 0) {
      return null;
    }

    // Current performance calculations
    const currentDealsPerYear = revenue / dealSize;
    const targetDealsPerYear = currentDealsPerYear * (1 + growthRate / 100);
    const gapInDeals = targetDealsPerYear - currentDealsPerYear;

    // Cost categories
    const monthlyOpportunityLoss = (gapInDeals * dealSize) / 12;
    const monthlyCycleLoss = (currentDealsPerYear * dealSize * (cycleLength - 60)) / (90 * 12);
    const monthlyConversionLoss = (currentDealsPerYear * dealSize * (20 - conversionRate)) / (20 * 12);
    const monthlyChurnLoss = (revenue * churnRate) / (100 * 12);

    const totalMonthlyCost = monthlyOpportunityLoss + monthlyCycleLoss + monthlyConversionLoss + monthlyChurnLoss;

    // Timeline data for chart
    const timelineData = [];
    let cumulativeCost = 0;
    
    for (let month = 1; month <= Math.min(timeframeMonths, 24); month++) {
      cumulativeCost += totalMonthlyCost;
      timelineData.push({
        month: `Month ${month}`,
        monthlyCost: totalMonthlyCost,
        cumulativeCost: cumulativeCost
      });
    }

    return {
      totalMonthlyCost,
      totalLossFirstYear: totalMonthlyCost * 12,
      totalLossTimeframe: totalMonthlyCost * timeframeMonths,
      breakdown: [
        {
          category: 'Lost Revenue Opportunities',
          monthlyCost: monthlyOpportunityLoss,
          description: 'Revenue not captured due to missed growth targets'
        },
        {
          category: 'Extended Sales Cycles',
          monthlyCost: monthlyCycleLoss,
          description: 'Revenue delayed due to longer than optimal sales cycles'
        },
        {
          category: 'Poor Conversion Rates',
          monthlyCost: monthlyConversionLoss,
          description: 'Revenue lost due to suboptimal conversion performance'
        },
        {
          category: 'Customer Churn',
          monthlyCost: monthlyChurnLoss,
          description: 'Revenue lost due to customer attrition'
        }
      ],
      timelineData,
      assumptions: {
        currentDealsPerYear,
        targetDealsPerYear,
        gapInDeals,
        timeframeMonths
      }
    };
  }, [formData]);

  // Calculate when form data changes
  useEffect(() => {
    const newCalculations = calculateCostOfInaction();
    setCalculations(newCalculations);
    
    if (newCalculations && onCostCalculated) {
      onCostCalculated({
        totalCost: newCalculations.totalLossFirstYear,
        monthlyCost: newCalculations.totalMonthlyCost,
        timeframe: parseInt(formData.timeframe),
        breakdown: newCalculations.breakdown
      });
    }
  }, [formData, calculateCostOfInaction, onCostCalculated]);

  // Data loading
  useEffect(() => {
    const loadData = async () => {
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
        
        if (customerAssets?.costCalculatorContent) {
          setCostData(customerAssets.costCalculatorContent);
        }
        
        if (customerAssets?.icpContent) {
          setIcpData(customerAssets.icpContent);
        }

        // Auto-populate fields if data available
        if (customerAssets?.costCalculatorContent) {
          const autoFields = new Set();
          const updates = {};

          if (customerAssets.costCalculatorContent.includes('$')) {
            const revenueMatch = customerAssets.costCalculatorContent.match(/\$[\d,]+/);
            if (revenueMatch) {
              updates.currentRevenue = revenueMatch[0].replace(/[$,]/g, '');
              autoFields.add('currentRevenue');
            }
          }

          if (Object.keys(updates).length > 0) {
            setFormData(prev => ({ ...prev, ...updates }));
            setAutoPopulated(autoFields);
          }
        }

      } catch (err) {
        console.error('Failed to load cost calculator data:', err);
        setError(err.message);
        if (err.message.includes('configuration') || err.message.includes('unauthorized')) {
          throwError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadData();
    } else {
      setLoading(false);
      setError('No session available');
    }
  }, [session, throwError]);

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

  const handleContinueToBusinessCase = () => {
    setIsNavigating(true);
    try {
      navigation.goToPhase('business-case');
    } catch (error) {
      console.error('Navigation to business case error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Cost of Inaction Calculator</h1>
            <p className="text-gray-400">Quantify the financial impact of delayed decisions</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !costData) {
    return (
      <div className="space-y-6">
        <Callout type="error" title="Error Loading Cost Calculator Data">
          {error}
        </Callout>
      </div>
    );
  }

  // Prepare sidebar content
  const sidebarContent = (
    <CostCalculatorSidebar 
      usage={{
        when: ["Executive presentations", "Budget discussions", "Urgency creation"],
        presentation: "Every month you delay costs you $X in lost revenue. Let me show you why.",
        exports: ["Executive dashboards", "Proposal appendices", "Board presentations"],
        urgencyPhrases: [
          "Every month you delay costs $X",
          "The cost of inaction is $X annually",
          "You're leaving $X on the table"
        ]
      }}
    />
  );

  const exportSourceData = generateExportSourceData();

  return (
    <DashboardLayout 
      sidebarContent={sidebarContent} 
      currentPhase="cost-calculator"
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Cost of Inaction Calculator
            {calculations && (
              <span className="ml-3 text-sm bg-purple-600 text-white px-3 py-1 rounded-full">
                Export Ready
              </span>
            )}
          </h1>
          
          {/* Cost Calculator Summary */}
          {costData && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Framework Overview</h2>
              <ContentDisplay content={costData} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <MobileOptimizedCard title="Business Parameters" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <MobileOptimizedInput
              label="Current Annual Revenue"
              value={formData.currentRevenue}
              onChange={(value) => handleInputChange('currentRevenue', value)}
              placeholder="e.g., 10000000"
              type="number"
              prefix="$"
              autoPopulated={autoPopulated.has('currentRevenue')}
            />
            
            <MobileOptimizedInput
              label="Target Growth Rate"
              value={formData.targetGrowthRate}
              onChange={(value) => handleInputChange('targetGrowthRate', value)}
              placeholder="20"
              type="number"
              suffix="%"
            />
            
            <MobileOptimizedInput
              label="Average Deal Size"
              value={formData.averageDealSize}
              onChange={(value) => handleInputChange('averageDealSize', value)}
              placeholder="e.g., 50000"
              type="number"
              prefix="$"
            />
            
            <MobileOptimizedInput
              label="Sales Cycle Length"
              value={formData.salesCycleLength}
              onChange={(value) => handleInputChange('salesCycleLength', value)}
              placeholder="90"
              type="number"
              suffix="days"
            />
            
            <MobileOptimizedInput
              label="Conversion Rate"
              value={formData.conversionRate}
              onChange={(value) => handleInputChange('conversionRate', value)}
              placeholder="15"
              type="number"
              suffix="%"
            />
            
            <MobileOptimizedInput
              label="Analysis Timeframe"
              value={formData.timeframe}
              onChange={(value) => handleInputChange('timeframe', value)}
              placeholder="12"
              type="number"
              suffix="months"
            />
          </div>
        </MobileOptimizedCard>

        {/* Results Display */}
        {calculations && (
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <MobileOptimizedCard>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    ${calculations.totalMonthlyCost.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Monthly Cost of Inaction</div>
                </div>
              </MobileOptimizedCard>
              
              <MobileOptimizedCard>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    ${calculations.totalLossFirstYear.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">Annual Impact</div>
                </div>
              </MobileOptimizedCard>
              
              <MobileOptimizedCard>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    ${calculations.totalLossTimeframe.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">{formData.timeframe}-Month Impact</div>
                </div>
              </MobileOptimizedCard>
            </div>

            {/* Cost Timeline Chart */}
            <MobileOptimizedCard title="Cost Progression Over Time">
              <CostTimelineChart data={calculations.timelineData} />
            </MobileOptimizedCard>

            {/* Cost Breakdown */}
            <MobileOptimizedCard title="Cost Breakdown by Category">
              <div className="space-y-4">
                {calculations.breakdown.map((item, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{item.category}</h4>
                      <span className="text-red-400 font-bold">
                        ${item.monthlyCost.toLocaleString()}/month
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </MobileOptimizedCard>

            {/* Export Interface */}
            {exportSourceData && (
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 border border-purple-500 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Cost Intelligence Ready for Export
                    </h3>
                    <p className="text-purple-200">
                      Transform this analysis into compelling assets for prospect engagement
                    </p>
                  </div>
                </div>
                
                {!showExportInterface ? (
                  <div className="flex flex-wrap gap-3">
                    <PrimaryButton
                      onClick={() => setShowExportInterface(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Export Cost Intelligence →
                    </PrimaryButton>
                    <SecondaryButton
                      onClick={handleContinueToBusinessCase}
                      className="border-gray-500 text-gray-300 hover:border-gray-400"
                    >
                      Continue to Business Case
                    </SecondaryButton>
                  </div>
                ) : (
                  <div className="mt-6">
                    <SmartExportInterface
                      sourceData={exportSourceData}
                      contentType="financial-impact"
                      userTools={userTools}
                      onExport={handleExportComplete}
                      className="bg-gray-900 bg-opacity-50"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        {calculations && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How to Use This Analysis</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-white mb-2">In Presentations</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Lead with the monthly cost: "${calculations.totalMonthlyCost.toLocaleString()}/month"</li>
                  <li>• Emphasize urgency: "Every month costs you ${calculations.totalMonthlyCost.toLocaleString()}"</li>
                  <li>• Show the timeline chart for visual impact</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">In Proposals</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Include cost breakdown by category</li>
                  <li>• Compare against solution investment</li>
                  <li>• Highlight ROI and payback period</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        currentPhase={navigation.currentPhase}
        onGoBack={handleGoBack}
        onGoHome={handleGoHome}
        onNextPhase={handleContinueToBusinessCase}
        canGoBack={true}
        nextLabel="Continue to Business Case"
        disabled={isNavigating}
      />
    </DashboardLayout>
  );
};

const CostCalculatorWithExportAndErrorBoundary = (props) => (
  <AsyncErrorBoundary 
    fallbackMessage="Failed to load the Cost Calculator tool. This might be due to a configuration issue or temporary service disruption."
    onRetry={() => window.location.reload()}
  >
    <CostCalculatorWithExport {...props} />
  </AsyncErrorBoundary>
);

export default CostCalculatorWithExportAndErrorBoundary;