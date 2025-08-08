import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const CostCalculator = () => {
  const [costData, setCostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calculations, setCalculations] = useState(null);
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
          session.customerId,
          new URLSearchParams(window.location.search).get('token')
        );
        setCostData(customerAssets.costCalculatorContent);
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
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <h1 className="text-2xl font-bold text-gray-900">Cost of Inaction Calculator</h1>
            <p className="text-gray-600">Calculate the financial impact of delayed action</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Cost of Inaction Calculator</h1>
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
          <h1 className="text-2xl font-bold text-gray-900">Cost of Inaction Calculator</h1>
          <p className="text-gray-600">Calculate the financial impact of delayed decisions and missed opportunities</p>
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
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Calculation Methodology</h2>
            {costData ? (
              <ContentDisplay content={costData} />
            ) : (
              <p className="text-gray-500">No methodology data available</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Metrics</h2>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Current Annual Revenue ($)</label>
                  <input
                    type="number"
                    value={formData.currentRevenue}
                    onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                    placeholder="1000000"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Target Growth Rate (%)</label>
                  <input
                    type="number"
                    value={formData.targetGrowthRate}
                    onChange={(e) => handleInputChange('targetGrowthRate', e.target.value)}
                    placeholder="20"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Average Deal Size ($)</label>
                  <input
                    type="number"
                    value={formData.averageDealSize}
                    onChange={(e) => handleInputChange('averageDealSize', e.target.value)}
                    placeholder="50000"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Sales Cycle (days)</label>
                  <input
                    type="number"
                    value={formData.salesCycleLength}
                    onChange={(e) => handleInputChange('salesCycleLength', e.target.value)}
                    placeholder="90"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Conversion Rate (%)</label>
                  <input
                    type="number"
                    value={formData.conversionRate}
                    onChange={(e) => handleInputChange('conversionRate', e.target.value)}
                    placeholder="15"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Annual Churn Rate (%)</label>
                  <input
                    type="number"
                    value={formData.churnRate}
                    onChange={(e) => handleInputChange('churnRate', e.target.value)}
                    placeholder="5"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Analysis Timeframe (months)</label>
                <select
                  value={formData.timeframe}
                  onChange={(e) => handleInputChange('timeframe', e.target.value)}
                  className="form-input"
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
              
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
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis Results</h2>
                
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
                  <h3 className="font-medium text-gray-900">Impact Breakdown:</h3>
                  {calculations.impactCategories.map((category, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-red-600 font-semibold">
                          ${category.impact.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: ${category.currentState.toLocaleString()} → 
                        Potential: ${category.withImprovement.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Projection</h3>
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

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Gap</h3>
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
            <div className="card p-6 text-center text-gray-500">
              <p>Enter your business metrics and click "Calculate Cost of Inaction" to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;