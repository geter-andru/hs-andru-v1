import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const CostCalculator = () => {
  const { onCostCalculated } = useOutletContext() || {};
  const [costData, setCostData] = useState(null);
  const [icpData, setIcpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculations, setCalculations] = useState(null);
  const [autoPopulated, setAutoPopulated] = useState(new Set());
  const [startTime, setStartTime] = useState(Date.now());
  const [formData, setFormData] = useState({
    currentRevenue: '',
    targetGrowthRate: '20',
    averageDealSize: '',
    salesCycleLength: '90',
    conversionRate: '15',
    churnRate: '5',
    timeframe: '12'
  });

  const session = authService.getCurrentSession();

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
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadCostData();
    }
  }, [session]);

  // Auto-populate fields using ICP Analysis data
  const autoPopulateFromICP = () => {
    if (!icpData) return;

    try {
      console.log('🎯 ICP Auto-populate Debug:', icpData);
      
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
      
      console.log(`✅ Auto-populated ${newAutoPopulated.size} fields from ICP analysis`);

    } catch (error) {
      console.error('Error auto-populating from ICP:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Remove from auto-populated set if user manually edits
    if (autoPopulated.has(field)) {
      setAutoPopulated(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  // Helper function to render form fields with auto-population indicators
  const renderFormField = (field, label, placeholder, type = 'number', options = null) => {
    const isAutoPopulated = autoPopulated.has(field);
    const className = isAutoPopulated 
      ? 'form-input border-brand/30 bg-brand/5' 
      : 'form-input';

    return (
      <div>
        <label className="form-label flex items-center gap-1">
          {label}
          {isAutoPopulated && (
            <span className="text-brand text-xs" title="Auto-populated from ICP Analysis">
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
  };

  const calculateCostOfInaction = () => {
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
    const inefficiencyLoss = revenue * 0.15; // 15% inefficiency assumption
    const churnImpact = revenue * churn;
    const extendedSalesCycleCost = (cycle - 60) * dealSize * 0.02; // Cost per day extended
    
    const totalCostOfInaction = missedGrowthRevenue + inefficiencyLoss + churnImpact + Math.max(0, extendedSalesCycleCost);

    // Generate month-by-month projections
    const projections = [];
    for (let month = 1; month <= 12; month++) {
      const withAction = currentMonthlyRevenue * (1 + growth) ** (month / 12);
      const withoutAction = currentMonthlyRevenue * (1 + growth * 0.3) ** (month / 12); // 30% of target growth without action
      
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
    if (onCostCalculated && result.totalAnnualCost > 0) {
      onCostCalculated({
        totalAnnualCost: result.totalAnnualCost,
        timeSpent: Date.now() - startTime
      }).catch(console.error);
    }
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    calculateCostOfInaction();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Cost of Inaction Calculator</h1>
          <p className="text-secondary">Calculate the financial impact of delayed decisions and missed opportunities</p>
        </div>
        {calculations && (
          <button
            onClick={exportResults}
            className="btn btn-secondary"
          >
            Export Results
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Methodology and Input Form */}
        <div className="space-y-6">
          <div className="card card-padding glass">
            <h2 className="text-lg font-semibold text-primary mb-4">Calculation Methodology</h2>
            {costData ? (
              <ContentDisplay content={costData} />
            ) : (
              <p className="text-muted">No methodology data available</p>
            )}
          </div>

          <div className="card card-padding glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Business Metrics</h2>
              <button
                type="button"
                onClick={autoPopulateFromICP}
                disabled={!icpData}
                className="btn btn-secondary"
                title="Auto-populate fields using ICP Analysis data"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-fill from ICP
              </button>
            </div>
            {autoPopulated.size > 0 && (
              <div className="mb-4 p-3 bg-brand/10 border border-brand/20 rounded-lg">
                <p className="text-sm text-brand">
                  ✨ {autoPopulated.size} fields auto-populated from your ICP Analysis
                </p>
              </div>
            )}
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {renderFormField(
                  'currentRevenue', 
                  'Current Annual Revenue ($)', 
                  'e.g., 5000000 (from ICP demographics)'
                )}
                
                {renderFormField(
                  'targetGrowthRate', 
                  'Target Growth Rate (%)', 
                  'e.g., 25 (from ICP growth stage)'
                )}
                
                {renderFormField(
                  'averageDealSize', 
                  'Average Deal Size ($)', 
                  'e.g., 75000 (from ICP budget patterns)'
                )}
                
                {renderFormField(
                  'salesCycleLength', 
                  'Sales Cycle (days)', 
                  'e.g., 90 (from ICP decision complexity)'
                )}
                
                {renderFormField(
                  'conversionRate', 
                  'Conversion Rate (%)', 
                  'e.g., 18 (from ICP fit score)'
                )}
                
                {renderFormField(
                  'churnRate', 
                  'Annual Churn Rate (%)', 
                  'e.g., 4 (from ICP retention factors)'
                )}
              </div>
              
              {renderFormField(
                'timeframe', 
                'Analysis Timeframe', 
                'months', 
                'select',
                [
                  { value: '6', label: '6 months (urgent situations)' },
                  { value: '12', label: '12 months (standard)' },
                  { value: '18', label: '18 months (strategic planning)' },
                  { value: '24', label: '24 months (long-term analysis)' }
                ]
              )}
              
              <button type="submit" className="btn btn-primary w-full">
                Calculate Cost of Inaction
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Results and Visualizations */}
        <div className="space-y-6">
          {calculations ? (
            <>
              <div className="card card-padding glass">
                <h2 className="text-lg font-semibold text-primary mb-4">Cost Analysis Results</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      ${calculations.totalCostOfInaction.toLocaleString()}
                    </div>
                    <div className="text-sm text-red-800">Total Cost of Inaction</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      ${calculations.monthlyImpact.toLocaleString()}
                    </div>
                    <div className="text-sm text-yellow-800">Monthly Impact</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-primary">Impact Breakdown:</h3>
                  {calculations.impactCategories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-red-600 font-semibold">
                          ${category.impact.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-secondary">
                        Current: ${category.currentState.toLocaleString()} → 
                        Potential: ${category.withImprovement.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card card-padding glass">
                <h3 className="text-lg font-semibold text-primary mb-4">Revenue Projection</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculations.projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="withAction" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="With Action"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="withoutAction" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Without Action"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding glass">
                <h3 className="text-lg font-semibold text-primary mb-4">Monthly Revenue Gap</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={calculations.projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="gap" fill="#f59e0b" name="Revenue Gap" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="card card-padding glass text-center text-muted">
              <p>Enter your business metrics and click "Calculate Cost of Inaction" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;