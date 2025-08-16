import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator,
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  ChevronRight,
  Info,
  CheckCircle,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserIntelligence } from '../../contexts/simplified/UserIntelligenceContext';

const SimplifiedFinancialImpact = ({ customerId }) => {
  const navigate = useNavigate();
  const { assessment, milestone, usage, updateUsage } = useUserIntelligence();
  const [activeTab, setActiveTab] = useState('calculate');
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calculator State
  const [calculatorInputs, setCalculatorInputs] = useState({
    currentRevenue: '',
    targetGrowthRate: '20',
    averageDealSize: '',
    salesCycleLength: '90',
    winRate: '25',
    teamSize: '5',
    customerAcquisitionCost: '',
    customerLifetimeValue: ''
  });

  // Business Case State
  const [businessCase, setBusinessCase] = useState({
    executiveSummary: '',
    problemStatement: '',
    proposedSolution: '',
    financialProjections: null,
    implementationTimeline: '',
    riskMitigation: '',
    successMetrics: ''
  });

  // Calculation Results
  const [calculations, setCalculations] = useState(null);

  // Set milestone-appropriate defaults
  useEffect(() => {
    if (!milestone) return;
    
    const defaults = {
      foundation: {
        averageDealSize: '15000',
        salesCycleLength: '45',
        winRate: '25',
        teamSize: '3'
      },
      growth: {
        averageDealSize: '45000',
        salesCycleLength: '75',
        winRate: '35',
        teamSize: '8'
      },
      expansion: {
        averageDealSize: '150000',
        salesCycleLength: '120',
        winRate: '45',
        teamSize: '20'
      }
    };
    
    const tierDefaults = defaults[milestone.tier] || defaults.foundation;
    setCalculatorInputs(prev => ({ ...prev, ...tierDefaults }));
  }, [milestone]);

  // Auto-populate from assessment data
  useEffect(() => {
    if (!assessment) return;
    
    if (assessment.revenue?.current) {
      setCalculatorInputs(prev => ({
        ...prev,
        currentRevenue: assessment.revenue.current.toString()
      }));
    }
  }, [assessment]);

  // Calculate financial impact
  const handleCalculate = useCallback(() => {
    setIsCalculating(true);
    
    // Simulate calculation
    setTimeout(() => {
      const revenue = parseFloat(calculatorInputs.currentRevenue) || 0;
      const growthRate = parseFloat(calculatorInputs.targetGrowthRate) / 100;
      const dealSize = parseFloat(calculatorInputs.averageDealSize) || 0;
      const cycleLength = parseFloat(calculatorInputs.salesCycleLength) || 90;
      const winRate = parseFloat(calculatorInputs.winRate) / 100;
      
      // Calculate improvements
      const improvedWinRate = Math.min(winRate * 1.4, 0.65); // 40% improvement, max 65%
      const improvedCycleLength = cycleLength * 0.75; // 25% faster
      const improvedDealSize = dealSize * 1.25; // 25% larger deals
      
      // Calculate impact
      const currentMonthlyDeals = (revenue / 12) / dealSize;
      const improvedMonthlyRevenue = currentMonthlyDeals * improvedDealSize * (improvedWinRate / winRate);
      const annualImpact = improvedMonthlyRevenue * 12 - revenue;
      
      // Generate projections for chart
      const projections = [];
      for (let month = 0; month <= 12; month++) {
        projections.push({
          month: `M${month}`,
          current: Math.round((revenue / 12) * month),
          optimized: Math.round((improvedMonthlyRevenue) * month)
        });
      }
      
      const results = {
        currentState: {
          annualRevenue: revenue,
          averageDealSize: dealSize,
          winRate: winRate * 100,
          salesCycle: cycleLength,
          monthlyDeals: currentMonthlyDeals
        },
        optimizedState: {
          annualRevenue: revenue + annualImpact,
          averageDealSize: improvedDealSize,
          winRate: improvedWinRate * 100,
          salesCycle: improvedCycleLength,
          monthlyDeals: currentMonthlyDeals * (improvedWinRate / winRate)
        },
        impact: {
          revenueIncrease: annualImpact,
          percentageGrowth: (annualImpact / revenue) * 100,
          dealSizeIncrease: improvedDealSize - dealSize,
          cycleReduction: cycleLength - improvedCycleLength,
          winRateImprovement: (improvedWinRate - winRate) * 100
        },
        projections
      };
      
      setCalculations(results);
      
      // Auto-populate business case with calculations
      generateBusinessCase(results);
      
      // Track usage
      updateUsage({ 
        lastFinancialCalculation: Date.now(),
        financialProgress: 50 
      });
      
      setIsCalculating(false);
    }, 1000);
  }, [calculatorInputs, updateUsage]);

  // Generate business case from calculations
  const generateBusinessCase = (results) => {
    const executiveSummary = `
      By implementing systematic revenue intelligence capabilities, we project a ${results.impact.percentageGrowth.toFixed(1)}% 
      increase in annual revenue ($${(results.impact.revenueIncrease / 1000).toFixed(0)}K additional revenue).
      This will be achieved through ${results.impact.winRateImprovement.toFixed(0)}% improvement in win rates,
      ${((results.impact.cycleReduction / results.currentState.salesCycle) * 100).toFixed(0)}% faster sales cycles,
      and ${((results.impact.dealSizeIncrease / results.currentState.averageDealSize) * 100).toFixed(0)}% larger average deal sizes.
    `.trim();
    
    const problemStatement = `
      Current revenue operations are constrained by:
      • Win rate of only ${results.currentState.winRate.toFixed(0)}% indicating value communication gaps
      • ${results.currentState.salesCycle}-day sales cycles limiting velocity
      • Average deal size of $${(results.currentState.averageDealSize / 1000).toFixed(0)}K below market potential
      • Lack of systematic buyer intelligence and value articulation frameworks
    `.trim();
    
    const proposedSolution = `
      Implement systematic revenue intelligence platform providing:
      • Data-driven ICP analysis for precise buyer targeting
      • Financial impact calculators for value quantification
      • Stakeholder-specific business case generators
      • Implementation resources and templates for scale
    `.trim();
    
    const implementationTimeline = milestone?.tier === 'foundation' ? '3-6 months' : 
                                   milestone?.tier === 'growth' ? '6-9 months' : '9-12 months';
    
    const riskMitigation = `
      • Phased rollout starting with pilot team
      • Weekly progress tracking and optimization
      • Executive stakeholder alignment checkpoints
      • Continuous measurement against success metrics
    `.trim();
    
    const successMetrics = `
      • Win rate improvement to ${results.optimizedState.winRate.toFixed(0)}%
      • Sales cycle reduction to ${results.optimizedState.salesCycle.toFixed(0)} days
      • Average deal size increase to $${(results.optimizedState.averageDealSize / 1000).toFixed(0)}K
      • Monthly revenue growth of $${(results.impact.revenueIncrease / 12000).toFixed(0)}K
    `.trim();
    
    setBusinessCase({
      executiveSummary,
      problemStatement,
      proposedSolution,
      financialProjections: results,
      implementationTimeline,
      riskMitigation,
      successMetrics
    });
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setCalculatorInputs(prev => ({ ...prev, [field]: value }));
  };

  // Export business case
  const handleExport = () => {
    // Track usage
    updateUsage({ 
      lastBusinessCaseExport: Date.now(),
      financialProgress: 100 
    });
    
    // In production, this would generate a PDF or DOCX
    console.log('Exporting business case:', businessCase);
    alert('Business case exported successfully!');
  };

  // Milestone-specific guidance
  const guidance = useMemo(() => {
    const guides = {
      foundation: {
        focus: 'Basic ROI and business case fundamentals',
        tip: 'Focus on clear value propositions and measurable outcomes',
        stakeholders: ['Direct Manager', 'Department Head', 'Finance']
      },
      growth: {
        focus: 'Enterprise deal economics and multi-stakeholder cases',
        tip: 'Build cases for complex buying committees with varied priorities',
        stakeholders: ['VP Sales', 'CFO', 'CTO', 'Procurement']
      },
      expansion: {
        focus: 'Strategic enterprise deals and competitive scenarios',
        tip: 'Create board-level presentations with strategic market positioning',
        stakeholders: ['C-Suite', 'Board of Directors', 'Strategic Advisors']
      }
    };
    
    return guides[milestone?.tier] || guides.foundation;
  }, [milestone]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/customer/${customerId}/simplified/dashboard`)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Impact Builder</h1>
          <p className="text-gray-400">Calculate impact → Generate business case → Export for stakeholders</p>
        </div>

        {/* Milestone Guidance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-1">{milestone?.tier?.charAt(0).toUpperCase() + milestone?.tier?.slice(1)} Stage Guidance</p>
              <p className="text-gray-400 text-sm mb-2">{guidance.focus}</p>
              <p className="text-blue-400 text-sm">{guidance.tip}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('calculate')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'calculate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Calculate Impact
          </button>
          <button
            onClick={() => setActiveTab('business-case')}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'business-case'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            } ${!calculations ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!calculations}
          >
            <FileText className="w-4 h-4" />
            Generate Business Case
          </button>
          <button
            onClick={handleExport}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ml-auto ${
              businessCase.executiveSummary
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-900 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!businessCase.executiveSummary}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Side - Calculator (40%) */}
          <div className={`lg:col-span-2 ${activeTab === 'business-case' ? 'hidden lg:block' : ''}`}>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Impact Calculator</h2>
              
              <div className="space-y-4">
                {/* Current Revenue */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Current Annual Revenue
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={calculatorInputs.currentRevenue}
                      onChange={(e) => handleInputChange('currentRevenue', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder="2000000"
                    />
                  </div>
                </div>

                {/* Average Deal Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Average Deal Size
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={calculatorInputs.averageDealSize}
                      onChange={(e) => handleInputChange('averageDealSize', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      placeholder={milestone?.tier === 'foundation' ? '15000' : milestone?.tier === 'growth' ? '45000' : '150000'}
                    />
                  </div>
                </div>

                {/* Win Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Current Win Rate (%)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.winRate}
                    onChange={(e) => handleInputChange('winRate', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="25"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Sales Cycle Length */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sales Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.salesCycleLength}
                    onChange={(e) => handleInputChange('salesCycleLength', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="90"
                  />
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sales Team Size
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="5"
                  />
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating || !calculatorInputs.currentRevenue}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      Calculate Impact
                    </>
                  )}
                </button>
              </div>

              {/* Calculation Results */}
              {calculations && (
                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">Impact Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Revenue Increase</span>
                      <span className="text-green-400 font-semibold">
                        +${(calculations.impact.revenueIncrease / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate Improvement</span>
                      <span className="text-blue-400 font-semibold">
                        +{calculations.impact.winRateImprovement.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cycle Reduction</span>
                      <span className="text-purple-400 font-semibold">
                        -{calculations.impact.cycleReduction.toFixed(0)} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deal Size Increase</span>
                      <span className="text-yellow-400 font-semibold">
                        +${(calculations.impact.dealSizeIncrease / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Business Case (60%) */}
          <div className={`lg:col-span-3 ${activeTab === 'calculate' && calculations ? 'hidden lg:block' : ''}`}>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              {calculations ? (
                <>
                  <h2 className="text-xl font-semibold text-white mb-4">Business Case</h2>
                  
                  {/* Revenue Projection Chart */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3">Revenue Projections</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={calculations.projections}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                            labelStyle={{ color: '#9CA3AF' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="current" 
                            stroke="#6B7280" 
                            strokeWidth={2}
                            name="Current"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="optimized" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            name="Optimized"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Stakeholder Tabs */}
                  <div className="mb-4">
                    <div className="flex gap-2 flex-wrap">
                      {guidance.stakeholders.map((stakeholder) => (
                        <button
                          key={stakeholder}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                        >
                          {stakeholder} View
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Business Case Sections */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        Executive Summary
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {businessCase.executiveSummary}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-red-400" />
                        Problem Statement
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {businessCase.problemStatement}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Proposed Solution
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {businessCase.proposedSolution}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-800 rounded-lg">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Success Metrics
                      </h4>
                      <p className="text-gray-300 text-sm whitespace-pre-line">
                        {businessCase.successMetrics}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Calculate impact first to generate business case</p>
                  <button
                    onClick={() => setActiveTab('calculate')}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Go to Calculator
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedFinancialImpact;