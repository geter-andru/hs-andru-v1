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
import { PrimaryButton } from '../ui/ButtonComponents';
import useNavigation from '../../hooks/useNavigation';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';
import { COMPONENT_STYLES, COLORS } from '../../constants/theme';
import { BUSINESS } from '../../constants/app';

const CostCalculator = () => {
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

  // Sidebar component for contextual guidance
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
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400">Enter parameters to see cost timeline</p>
        </div>
      );
    }

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#374151', 
                border: '1px solid #6B7280',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="cumulativeLoss" 
              stroke="#EF4444" 
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Input Field Component
  const InputField = ({ label, value, onChange, prefix, suffix, disabled }) => {
    return (
      <MobileOptimizedInput
        label={label}
        value={value}
        onChange={onChange}
        prefix={prefix}
        suffix={suffix}
        disabled={disabled}
        type="number"
      />
    );
  };

  // Result Metric Component
  const ResultMetric = ({ icon, label, value, highlight = false }) => {
    return (
      <div className={`p-4 rounded-lg border ${
        highlight 
          ? 'bg-blue-900/30 border-blue-600/50' 
          : 'bg-gray-700/50 border-gray-600/50'
      }`}>
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">{icon}</span>
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <div className={`text-2xl font-bold ${
          highlight ? 'text-blue-400' : 'text-white'
        }`}>
          ${value}
        </div>
      </div>
    );
  };

  // Technical Cost Breakdown Component
  const TechnicalCostBreakdown = ({ costs }) => {
    if (!costs) return null;

    return (
      <div className="space-y-4">
        {Object.entries(costs).map(([category, amount]) => (
          <div key={category} className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
            <span className="text-gray-300 capitalize">{category.replace('_', ' ')}</span>
            <span className="text-white font-semibold">${amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const loadCostData = async () => {
      try {
        setLoading(true);
        const customerAssets = await airtableService.getCustomerAssets(
          session.recordId,
          session.accessToken
        );
        setCostData(customerAssets.costCalculatorContent);
        setIcpData(customerAssets.icpDescription || customerAssets.icpContent);
        setError(null);
      } catch (err) {
        console.error('Failed to load cost calculator data:', err);
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
      loadCostData();
    }
  }, [session, throwError]);

  // Auto-populate fields using ICP Analysis data
  const autoPopulateFromICP = () => {
    if (!icpData) return;

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 ICP Auto-populate Debug:', icpData);
      }
      
      const newFormData = { ...formData };
      const newAutoPopulated = new Set();

      // Current Annual Revenue - from ICP demographics and segments
      if (!formData.currentRevenue && icpData.segments) {
        const primarySegment = icpData.segments[0];
        if (primarySegment?.criteria) {
          // Extract revenue patterns from criteria
          const revenueCriteria = primarySegment.criteria.find(c => 
            c.includes('revenue') || c.includes('$') || c.includes('ARR') || c.includes('MRR')
          );
          if (revenueCriteria) {
            // Extract numbers and estimate revenue
            const numbers = revenueCriteria.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*([MK]?)/gi);
            if (numbers && numbers.length > 0) {
              let revenue = parseFloat(numbers[0].replace(/[$,]/g, ''));
              if (numbers[0].includes('M')) revenue *= 1000000;
              if (numbers[0].includes('K')) revenue *= 1000;
              newFormData.currentRevenue = Math.round(revenue).toString();
              newAutoPopulated.add('currentRevenue');
            }
          } else {
            // Default based on segment characteristics
            const segmentName = primarySegment.name.toLowerCase();
            if (segmentName.includes('enterprise')) {
              newFormData.currentRevenue = '50000000'; // $50M
            } else if (segmentName.includes('mid-market')) {
              newFormData.currentRevenue = '10000000'; // $10M
            } else if (segmentName.includes('smb') || segmentName.includes('small')) {
              newFormData.currentRevenue = '2000000'; // $2M
            } else {
              newFormData.currentRevenue = '5000000'; // $5M default
            }
            newAutoPopulated.add('currentRevenue');
          }
        }
      }

      // Target Growth Rate - from business characteristics and growth stage
      if (!formData.targetGrowthRate || formData.targetGrowthRate === '20') {
        if (icpData.keyIndicators) {
          const growthIndicators = icpData.keyIndicators.filter(indicator => 
            indicator.toLowerCase().includes('growth') || 
            indicator.toLowerCase().includes('scaling') ||
            indicator.toLowerCase().includes('expansion')
          );
          if (growthIndicators.length > 0) {
            // High growth companies
            newFormData.targetGrowthRate = '35';
          } else {
            // Stable growth
            newFormData.targetGrowthRate = '25';
          }
        } else {
          // Default based on segment
          const primarySegment = icpData.segments?.[0];
          if (primarySegment?.name.toLowerCase().includes('enterprise')) {
            newFormData.targetGrowthRate = '15'; // Slower but steady
          } else {
            newFormData.targetGrowthRate = '30'; // Faster growth expected
          }
        }
        newAutoPopulated.add('targetGrowthRate');
      }

      // Average Deal Size - from segment characteristics and budget patterns
      if (!formData.averageDealSize) {
        const revenue = parseFloat(newFormData.currentRevenue || formData.currentRevenue || 0);
        if (revenue > 0) {
          // Estimate deal size as percentage of revenue
          const primarySegment = icpData.segments?.[0];
          if (primarySegment?.name.toLowerCase().includes('enterprise')) {
            newFormData.averageDealSize = Math.round(revenue * 0.02).toString(); // 2% of revenue
          } else if (primarySegment?.name.toLowerCase().includes('mid-market')) {
            newFormData.averageDealSize = Math.round(revenue * 0.015).toString(); // 1.5% of revenue
          } else {
            newFormData.averageDealSize = Math.round(revenue * 0.01).toString(); // 1% of revenue
          }
          newAutoPopulated.add('averageDealSize');
        }
      }

      // Sales Cycle Length - from decision-making complexity
      if (!formData.salesCycleLength || formData.salesCycleLength === '90') {
        if (icpData.ratingCriteria) {
          // Look for complexity indicators
          const complexityFactors = icpData.ratingCriteria.filter(criteria =>
            criteria.description?.toLowerCase().includes('complex') ||
            criteria.description?.toLowerCase().includes('committee') ||
            criteria.description?.toLowerCase().includes('approval')
          );
          
          if (complexityFactors.length > 0) {
            newFormData.salesCycleLength = '120'; // 4 months for complex sales
          } else {
            newFormData.salesCycleLength = '75'; // 2.5 months for simpler sales
          }
        } else {
          const primarySegment = icpData.segments?.[0];
          if (primarySegment?.name.toLowerCase().includes('enterprise')) {
            newFormData.salesCycleLength = '150'; // 5 months for enterprise
          } else {
            newFormData.salesCycleLength = '60'; // 2 months for smaller companies
          }
        }
        newAutoPopulated.add('salesCycleLength');
      }

      // Conversion Rate - from fit score and strategic alignment
      if (!formData.conversionRate || formData.conversionRate === '15') {
        if (icpData.segments?.[0]?.score) {
          const fitScore = icpData.segments[0].score;
          if (fitScore >= 90) {
            newFormData.conversionRate = '25'; // High fit = high conversion
          } else if (fitScore >= 80) {
            newFormData.conversionRate = '20';
          } else {
            newFormData.conversionRate = '12';
          }
        } else {
          newFormData.conversionRate = '18'; // Slight improvement from default
        }
        newAutoPopulated.add('conversionRate');
      }

      // Churn Rate - from retention likelihood factors
      if (!formData.churnRate || formData.churnRate === '5') {
        if (icpData.segments?.[0]?.score) {
          const fitScore = icpData.segments[0].score;
          if (fitScore >= 90) {
            newFormData.churnRate = '3'; // High fit = low churn
          } else if (fitScore >= 80) {
            newFormData.churnRate = '5';
          } else {
            newFormData.churnRate = '8';
          }
        } else {
          newFormData.churnRate = '4'; // Slightly better retention
        }
        newAutoPopulated.add('churnRate');
      }

      // Analysis Timeframe - from urgency factors
      if (!formData.timeframe || formData.timeframe === '12') {
        if (icpData.keyIndicators) {
          const urgencyIndicators = icpData.keyIndicators.filter(indicator =>
            indicator.toLowerCase().includes('urgent') ||
            indicator.toLowerCase().includes('immediate') ||
            indicator.toLowerCase().includes('competitive')
          );
          if (urgencyIndicators.length > 0) {
            newFormData.timeframe = '6'; // Urgent situations = shorter analysis
          } else {
            newFormData.timeframe = '18'; // Standard planning horizon
          }
        } else {
          newFormData.timeframe = '12'; // Keep default
        }
        newAutoPopulated.add('timeframe');
      }

      setFormData(newFormData);
      setAutoPopulated(newAutoPopulated);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Auto-populated ${newAutoPopulated.size} fields from ICP analysis`);
      }

    } catch (error) {
      console.error('Error auto-populating from ICP:', error);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Remove from auto-populated set if user manually edits
    if (autoPopulated.has(field)) {
      setAutoPopulated(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  }, [autoPopulated]);

  // Memoize form validation state
  const isFormValid = useMemo(() => {
    return Object.values(formData).every(value => value && value.trim() !== '');
  }, [formData]);

  // Memoize auto-population status for expensive checks
  const autoPopulationSummary = useMemo(() => {
    return {
      count: autoPopulated.size,
      hasAnyAutoPopulated: autoPopulated.size > 0,
      fields: Array.from(autoPopulated)
    };
  }, [autoPopulated]);

  // Helper function to render form fields with auto-population indicators
  const renderFormField = useCallback((field, label, placeholder, type = 'number', options = null) => {
    const isAutoPopulated = autoPopulated.has(field);
    const className = isAutoPopulated 
      ? `${COMPONENT_STYLES.formInput} border-blue-400/30 bg-blue-400/5` 
      : COMPONENT_STYLES.formInput;

    return (
      <div>
        <label className={`${COMPONENT_STYLES.formLabel} flex items-center gap-1`}>
          {label}
          {isAutoPopulated && (
            <span className={`${COLORS.brand} text-xs`} title="Auto-populated from ICP Analysis">
              ✨
            </span>
          )}
        </label>
        {options ? (
          <select
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={className}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={className}
            required
          />
        )}
      </div>
    );
  }, [formData, autoPopulated, handleInputChange]);

  const calculateCostOfInaction = useCallback(() => {
    const {
      currentRevenue,
      targetGrowthRate,
      averageDealSize,
      salesCycleLength,
      conversionRate,
      churnRate,
      timeframe
    } = formData;

    // Convert strings to numbers
    const revenue = parseFloat(currentRevenue) || 0;
    const growth = parseFloat(targetGrowthRate) / 100;
    const dealSize = parseFloat(averageDealSize) || 0;
    const cycle = parseInt(salesCycleLength) || 90;
    const conversion = parseFloat(conversionRate) / 100;
    const churn = parseFloat(churnRate) / 100;
    const months = parseInt(timeframe) || 12;

    // Calculate baseline metrics
    const currentMonthlyRevenue = revenue / 12;
    const targetMonthlyGrowth = currentMonthlyRevenue * growth / 12;
    
    // Calculate opportunity costs
    const missedGrowthRevenue = targetMonthlyGrowth * months * (months + 1) / 2;
    const inefficiencyLoss = revenue * BUSINESS.defaultInefficiencyRate;
    const churnImpact = revenue * churn;
    const extendedSalesCycleCost = (cycle - 60) * dealSize * 0.02; // Cost per day extended
    
    const totalCostOfInaction = missedGrowthRevenue + inefficiencyLoss + churnImpact + Math.max(0, extendedSalesCycleCost);

    // Generate month-by-month projections
    const projections = [];
    for (let month = 1; month <= 12; month++) {
      const withAction = currentMonthlyRevenue * (1 + growth) ** (month / 12);
      const withoutAction = currentMonthlyRevenue * (1 + growth * BUSINESS.defaultGrowthWithoutAction) ** (month / 12);
      
      projections.push({
        month: `Month ${month}`,
        withAction: Math.round(withAction),
        withoutAction: Math.round(withoutAction),
        gap: Math.round(withAction - withoutAction)
      });
    }

    // Calculate impact categories
    const impactCategories = [
      {
        category: 'Revenue Growth',
        currentState: Math.round(revenue * 1.05),
        withImprovement: Math.round(revenue * (1 + growth)),
        impact: Math.round(missedGrowthRevenue)
      },
      {
        category: 'Sales Efficiency',
        currentState: Math.round(revenue * 0.85),
        withImprovement: Math.round(revenue),
        impact: Math.round(inefficiencyLoss)
      },
      {
        category: 'Customer Retention',
        currentState: Math.round(revenue * (1 - churn)),
        withImprovement: Math.round(revenue * (1 - churn * 0.5)),
        impact: Math.round(churnImpact * 0.5)
      }
    ];

    const result = {
      totalCostOfInaction: Math.round(totalCostOfInaction),
      monthlyImpact: Math.round(totalCostOfInaction / months),
      projections,
      impactCategories,
      metrics: {
        missedGrowthRevenue: Math.round(missedGrowthRevenue),
        inefficiencyLoss: Math.round(inefficiencyLoss),
        churnImpact: Math.round(churnImpact),
        salesCycleCost: Math.round(Math.max(0, extendedSalesCycleCost))
      }
    };

    setCalculations(result);

    // Save calculations
    airtableService.saveUserProgress(
      session.customerId,
      'cost_calculator',
      { formData, calculations: result }
    ).catch(console.error);

    // Trigger workflow completion callback
    if (onCostCalculated && result.totalCostOfInaction > 0) {
      onCostCalculated({
        totalAnnualCost: result.totalCostOfInaction,
        timeSpent: Date.now() - startTime
      }).catch(console.error);
    }
  }, [formData, onCostCalculated, session?.customerId, startTime]);

  const handleCalculate = (e) => {
    e.preventDefault();
    try {
      calculateCostOfInaction();
    } catch (error) {
      console.error('Calculation error:', error);
      setError('Failed to calculate cost analysis');
    }
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
      if (onCostCalculated) {
        onCostCalculated({
          totalAnnualCost: calculations?.totalCostOfInaction || 0,
          calculations,
          hasCompleted: true
        });
      }
    } catch (error) {
      console.error('Navigation to business case error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const exportResults = async () => {
    if (!calculations) return;

    try {
      // Create a simple text export (in real implementation, this would generate PDF)
      const exportData = `Cost of Inaction Analysis
=============================

Total Cost of Inaction: $${calculations.totalCostOfInaction.toLocaleString()}
Monthly Impact: $${calculations.monthlyImpact.toLocaleString()}

Breakdown:
- Missed Growth Revenue: $${calculations.metrics.missedGrowthRevenue.toLocaleString()}
- Inefficiency Loss: $${calculations.metrics.inefficiencyLoss.toLocaleString()}
- Churn Impact: $${calculations.metrics.churnImpact.toLocaleString()}
- Extended Sales Cycle Cost: $${calculations.metrics.salesCycleCost.toLocaleString()}

Generated on: ${new Date().toLocaleDateString()}
`;

      const blob = new Blob([exportData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cost-of-inaction-analysis.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Cost of Inaction Calculator</h1>
            <p className="text-secondary">Calculate the financial impact of delayed action</p>
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
        <h1 className="text-2xl font-bold text-primary">Cost of Inaction Calculator</h1>
        <Callout type="error" title="Error Loading Calculator Data">
          {error}
        </Callout>
      </div>
    );
  }

  // Prepare sidebar content
  const sidebarContent = (
    <CostCalculatorSidebar 
      usage={{
        when: ["Discovery calls", "Proposal meetings", "Urgency creation"],
        presentation: "Let's look at the cost of waiting to implement...",
        exports: ["Executive PDF", "Slide deck format", "Email template"],
        urgencyPhrases: [
          "Every month of delay costs $21K",
          "Time is money in technical organizations",
          "Opportunity cost compounds daily"
        ]
      }}
    />
  );

  return (
    <DashboardLayout 
      sidebarContent={sidebarContent} 
      currentPhase="cost-calculator"
    >
      <div className="space-y-8">
        {/* Financial Impact Visualization Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Financial Impact Visualization
              </h1>
              <p className="text-gray-400">
                Calculate the financial impact of delayed decisions and missed opportunities
              </p>
            </div>
            {calculations && (
              <MobileOptimizedButton
                onClick={exportResults}
                variant="secondary"
                className="mt-4 sm:mt-0"
              >
                Export Results
              </MobileOptimizedButton>
            )}
          </div>
          
          {/* Auto-populate from ICP button */}
          {icpData && (
            <div className="mb-6">
              <PrimaryButton
                onClick={() => {
                  try {
                    autoPopulateFromICP();
                  } catch (error) {
                    console.error('Auto-populate error:', error);
                  }
                }}
                className="w-full sm:w-auto"
              >
                Auto-populate from ICP Analysis
              </PrimaryButton>
            </div>
          )}
          
          {/* Cost Timeline Chart - 40% of space */}
          <MobileOptimizedCard 
            className="mb-8"
            style={{ minHeight: '40vh' }}
          >
            <h2 className="text-xl font-semibold text-white mb-6">
              Cost of Inaction Timeline
            </h2>
            <CostTimelineChart data={calculations?.timeline} />
          </MobileOptimizedCard>
        </div>

        {/* Input/Results Split - 50/50 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Panel */}
          <MobileOptimizedCard>
            <h3 className="text-lg font-semibold text-white mb-4">Input Parameters</h3>
            {costData && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-300 mb-3">Methodology</h4>
                <ContentDisplay content={costData} />
              </div>
            )}
            
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Current Revenue"
                  value={formData.currentRevenue}
                  onChange={(value) => handleInputChange('currentRevenue', value)}
                  prefix="$"
                />
                <InputField
                  label="Growth Rate"
                  value={formData.targetGrowthRate}
                  onChange={(value) => handleInputChange('targetGrowthRate', value)}
                  suffix="%"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Sales Cycle (months)"
                  value={formData.salesCycleLength}
                  onChange={(value) => handleInputChange('salesCycleLength', value)}
                  suffix="months"
                />
                <InputField
                  label="Deal Size"
                  value={formData.averageDealSize}
                  onChange={(value) => handleInputChange('averageDealSize', value)}
                  prefix="$"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Close Rate"
                  value={formData.conversionRate}
                  onChange={(value) => handleInputChange('conversionRate', value)}
                  suffix="%"
                />
                <InputField
                  label="Delay Period"
                  value={formData.timeframe}
                  onChange={(value) => handleInputChange('timeframe', value)}
                  suffix="months"
                />
              </div>

              <PrimaryButton
                type="submit"
                className="w-full"
                disabled={!isFormValid}
                onClick={handleCalculate}
              >
                Calculate Impact
              </PrimaryButton>
            </form>
          </MobileOptimizedCard>

          {/* Results Panel */}
          <MobileOptimizedCard>
            <h3 className="text-lg font-semibold text-white mb-4">Impact Analysis</h3>
            {calculations ? (
              <div className="space-y-4">
                <ResultMetric
                  icon="💰"
                  label="TOTAL IMPACT"
                  value={calculations.totalImpact.toLocaleString()}
                  highlight={true}
                />
                <ResultMetric
                  icon="⏱️"
                  label="MONTHLY LOSS"
                  value={calculations.monthlyLoss.toLocaleString()}
                />
                <ResultMetric
                  icon="📈"
                  label="OPPORTUNITY COST"
                  value={calculations.opportunityCost.toLocaleString()}
                />
                <ResultMetric
                  icon="🚨"
                  label="URGENCY FACTOR"
                  value={`${calculations.urgencyMultiplier}x`}
                />
                
                <PrimaryButton
                  onClick={() => {
                    try {
                      exportResults();
                    } catch (error) {
                      console.error('Export error:', error);
                    }
                  }}
                  className="w-full mt-6"
                >
                  Export to Presentation
                </PrimaryButton>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Enter parameters to see impact analysis</p>
              </div>
            )}
          </MobileOptimizedCard>
        </div>

        {/* Technical Founder Costs - 20% of space */}
        {calculations?.technicalCosts && (
          <MobileOptimizedCard>
            <h3 className="text-lg font-semibold text-white mb-4">
              Technical Founder Costs
            </h3>
            <TechnicalCostBreakdown costs={calculations.technicalCosts} />
          </MobileOptimizedCard>
        )}

        {/* Implementation Guidance */}
        <ImplementationGuidance 
          toolType="cost-calculator"
          context={{
            totalImpact: calculations?.totalImpact || 0,
            monthlyLoss: calculations?.monthlyLoss || 0,
            customerType: session?.customerId
          }}
          customerData={costData}
        />

        {/* Export Strategy Guide */}
        {calculations && (
          <ExportStrategyGuide 
            results={calculations}
            stakeholderTypes={["CEO", "CFO", "VP Sales", "CTO", "VP Product"]}
            onExport={(stakeholder, strategy) => {
              console.log('Exporting for:', stakeholder, strategy);
              exportResults();
            }}
          />
        )}

        {/* Success Metrics Tracking */}
        <SuccessMetricsPanel 
          toolType="cost-calculator"
          metrics={{
            toolsUsed: calculations ? 1 : 0,
            conversations: 0,
            successRate: 0,
            lastUsed: calculations ? "Today" : "Never"
          }}
          onTrackUsage={(type) => {
            console.log('Tracking usage:', type);
            // Could save to Airtable here
          }}
        />
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

const CostCalculatorWithErrorBoundary = (props) => (
  <AsyncErrorBoundary 
    fallbackMessage="Failed to load the Cost Calculator. This might be due to a configuration issue or temporary service disruption."
    onRetry={() => window.location.reload()}
  >
    <CostCalculator {...props} />
  </AsyncErrorBoundary>
);

export default CostCalculatorWithErrorBoundary;