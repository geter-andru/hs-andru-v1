/**
 * Assessment Baseline Comparison Dashboard - Phase 3
 * 
 * Professional dashboard comparing baseline assessment scores with current progress
 * Provides detailed analysis of competency development over time
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Target, TrendingUp, BarChart3, Award, Calendar,
  ArrowUp, ArrowDown, Activity, Brain, Users,
  CheckCircle, AlertCircle, Zap, Star, Clock,
  RefreshCw, Download, Share2, Eye
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';

const BaselineComparisonDashboard = ({ 
  competencyData, 
  onRetakeAssessment,
  className = '' 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  // Calculate comprehensive comparison data
  const comparisonData = useMemo(() => {
    const baseline = {
      customerAnalysis: competencyData.baselineCustomerAnalysis || 0,
      valueCommunication: competencyData.baselineValueCommunication || 0,
      salesExecution: competencyData.baselineSalesExecution || 0
    };

    const current = {
      customerAnalysis: competencyData.currentCustomerAnalysis || 0,
      valueCommunication: competencyData.currentValueCommunication || 0,
      salesExecution: competencyData.currentSalesExecution || 0
    };

    const improvements = {
      customerAnalysis: current.customerAnalysis - baseline.customerAnalysis,
      valueCommunication: current.valueCommunication - baseline.valueCommunication,
      salesExecution: current.salesExecution - baseline.salesExecution
    };

    const overallBaseline = (baseline.customerAnalysis + baseline.valueCommunication + baseline.salesExecution) / 3;
    const overallCurrent = (current.customerAnalysis + current.valueCommunication + current.salesExecution) / 3;
    const overallImprovement = overallCurrent - overallBaseline;

    return {
      baseline,
      current,
      improvements,
      overallBaseline,
      overallCurrent,
      overallImprovement,
      competencyGaps: analyzeCompetencyGaps(baseline, current),
      strengthAreas: identifyStrengths(current, improvements),
      developmentAreas: identifyDevelopmentAreas(current, improvements),
      progressVelocity: calculateProgressVelocity(competencyData),
      nextMilestones: calculateNextMilestones(current)
    };
  }, [competencyData]);

  // Timeframe options
  const timeframeOptions = [
    { id: 'baseline', name: 'Baseline Only', description: 'Initial assessment scores' },
    { id: 'current', name: 'Current vs Baseline', description: 'Progress comparison' },
    { id: 'projected', name: 'Projected Growth', description: 'Future potential' }
  ];

  // Competency category definitions
  const competencyCategories = [
    {
      id: 'customerAnalysis',
      name: 'Customer Analysis',
      description: 'Identifying and analyzing ideal customers',
      icon: Target,
      color: 'blue',
      proficiencyThreshold: 70
    },
    {
      id: 'valueCommunication',
      name: 'Value Communication',
      description: 'Articulating value propositions and ROI',
      icon: TrendingUp,
      color: 'green',
      proficiencyThreshold: 70
    },
    {
      id: 'salesExecution',
      name: 'Sales Execution',
      description: 'Executing systematic sales methodology',
      icon: BarChart3,
      color: 'purple',
      proficiencyThreshold: 70
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Professional Competency Assessment Analysis
            </h3>
            <p className="text-gray-400">
              Baseline vs current competency comparison with detailed development insights
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{showDetailedAnalysis ? 'Simple View' : 'Detailed View'}</span>
            </button>
            
            <button
              onClick={onRetakeAssessment}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake Assessment</span>
            </button>
          </div>
        </div>

        {/* Overall Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {comparisonData.overallCurrent.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Current Overall</div>
            <div className="text-xs text-gray-500 mt-1">
              vs {comparisonData.overallBaseline.toFixed(0)} baseline
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${
              comparisonData.overallImprovement >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {comparisonData.overallImprovement >= 0 ? '+' : ''}{comparisonData.overallImprovement.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Total Improvement</div>
            <div className="text-xs text-gray-500 mt-1">
              {((comparisonData.overallImprovement / comparisonData.overallBaseline) * 100).toFixed(0)}% growth
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {comparisonData.strengthAreas.length}
            </div>
            <div className="text-sm text-gray-400">Strength Areas</div>
            <div className="text-xs text-gray-500 mt-1">
              70+ proficiency
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {comparisonData.progressVelocity}
            </div>
            <div className="text-sm text-gray-400">Progress Velocity</div>
            <div className="text-xs text-gray-500 mt-1">
              points per week
            </div>
          </div>
        </div>
      </div>

      {/* Competency Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {competencyCategories.map(category => {
          const baseline = comparisonData.baseline[category.id];
          const current = comparisonData.current[category.id];
          const improvement = comparisonData.improvements[category.id];
          const Icon = category.icon;
          
          return (
            <CompetencyComparisonCard
              key={category.id}
              category={category}
              baseline={baseline}
              current={current}
              improvement={improvement}
              showDetailed={showDetailedAnalysis}
            />
          );
        })}
      </div>

      {/* Detailed Analysis Sections */}
      {showDetailedAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompetencyGapAnalysis gaps={comparisonData.competencyGaps} />
          <DevelopmentRecommendations 
            developmentAreas={comparisonData.developmentAreas}
            nextMilestones={comparisonData.nextMilestones}
          />
        </div>
      )}

      {/* Progress Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressVisualization comparisonData={comparisonData} />
        <CompetencyTimeline competencyData={competencyData} />
      </div>

      {/* Actionable Insights */}
      <ActionableInsights comparisonData={comparisonData} />
    </div>
  );
};

// Competency Comparison Card Component
const CompetencyComparisonCard = ({ category, baseline, current, improvement, showDetailed }) => {
  const Icon = category.icon;
  const improvementPercentage = baseline > 0 ? (improvement / baseline) * 100 : 0;
  const isProficient = current >= category.proficiencyThreshold;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900 border rounded-lg p-6 ${
        isProficient ? `border-${category.color}-500/50` : 'border-gray-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-${category.color}-600 rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{category.name}</h4>
            {isProficient && <CheckCircle className="w-4 h-4 text-green-400 mt-1" />}
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-xl font-bold ${isProficient ? `text-${category.color}-400` : 'text-yellow-400'}`}>
            {current.toFixed(0)}
          </div>
          <div className="text-xs text-gray-500">/{category.proficiencyThreshold}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{current.toFixed(0)}/100</span>
        </div>
        
        <div className="relative">
          {/* Background */}
          <div className="w-full bg-gray-700 rounded-full h-3">
            {/* Baseline indicator */}
            <div 
              className="absolute top-0 w-1 h-3 bg-gray-500 rounded"
              style={{ left: `${baseline}%` }}
            />
            {/* Current progress */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${current}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-3 rounded-full ${
                isProficient ? `bg-${category.color}-500` : 'bg-yellow-500'
              }`}
            />
            {/* Proficiency threshold line */}
            <div 
              className="absolute top-0 w-1 h-3 bg-white rounded"
              style={{ left: `${category.proficiencyThreshold}%` }}
            />
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Baseline: {baseline.toFixed(0)}</span>
          <span>Target: {category.proficiencyThreshold}</span>
        </div>
      </div>

      {/* Improvement Stats */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Improvement:</span>
          <div className="flex items-center space-x-1">
            {improvement >= 0 ? (
              <ArrowUp className="w-3 h-3 text-green-400" />
            ) : (
              <ArrowDown className="w-3 h-3 text-red-400" />
            )}
            <span className={`text-sm font-medium ${
              improvement >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {improvement >= 0 ? '+' : ''}{improvement.toFixed(0)} points
            </span>
          </div>
        </div>
        
        {showDetailed && (
          <div className="text-xs text-gray-500">
            {improvementPercentage >= 0 ? '+' : ''}{improvementPercentage.toFixed(0)}% from baseline
          </div>
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isProficient 
            ? `bg-${category.color}-900/50 text-${category.color}-300` 
            : 'bg-yellow-900/50 text-yellow-300'
        }`}>
          {isProficient ? 'Proficient' : 'Developing'}
        </span>
      </div>
    </motion.div>
  );
};

// Competency Gap Analysis Component
const CompetencyGapAnalysis = ({ gaps }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-4">Competency Gap Analysis</h4>
    
    <div className="space-y-4">
      {gaps.map((gap, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-white">{gap.competency}</h5>
            <span className={`px-2 py-1 rounded text-xs ${
              gap.severity === 'high' ? 'bg-red-900 text-red-300' :
              gap.severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
              'bg-green-900 text-green-300'
            }`}>
              {gap.severity} gap
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">{gap.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Gap Size:</span>
              <span className="text-white ml-2">{gap.gapSize} points</span>
            </div>
            <div>
              <span className="text-gray-500">Est. Time:</span>
              <span className="text-white ml-2">{gap.estimatedTime}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Development Recommendations Component
const DevelopmentRecommendations = ({ developmentAreas, nextMilestones }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-4">Development Recommendations</h4>
    
    <div className="space-y-6">
      {/* Priority Development Areas */}
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Priority Focus Areas</h5>
        <div className="space-y-2">
          {developmentAreas.map((area, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div>
                <div className="font-medium text-white">{area.name}</div>
                <div className="text-sm text-gray-400">{area.recommendation}</div>
              </div>
              <div className="text-sm text-blue-400 font-medium">
                +{area.potentialPoints} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestones */}
      <div>
        <h5 className="font-medium text-gray-300 mb-3">Next Milestones</h5>
        <div className="space-y-2">
          {nextMilestones.map((milestone, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                milestone.reachable ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-white">{milestone.title}</div>
                <div className="text-sm text-gray-400">
                  {milestone.pointsNeeded} points needed • {milestone.estimatedTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Progress Visualization Component
const ProgressVisualization = ({ comparisonData }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Progress Visualization</h4>
    
    <div className="space-y-6">
      {/* Overall Progress Circle */}
      <div className="text-center">
        <div className="relative inline-block">
          <svg className="w-32 h-32" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgb(55, 65, 81)"
              strokeWidth="8"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(comparisonData.overallCurrent / 100) * 339.29} 339.29`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {comparisonData.overallCurrent.toFixed(0)}
              </div>
              <div className="text-xs text-gray-400">Overall</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="text-sm text-gray-400">
            {comparisonData.overallImprovement >= 0 ? '+' : ''}{comparisonData.overallImprovement.toFixed(0)} from baseline
          </div>
        </div>
      </div>

      {/* Competency Breakdown */}
      <div className="space-y-3">
        {Object.entries(comparisonData.current).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-white">{value.toFixed(0)}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Competency Timeline Component
const CompetencyTimeline = ({ competencyData }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Development Timeline</h4>
    
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full" />
        <div>
          <div className="font-medium text-white">Baseline Assessment</div>
          <div className="text-sm text-gray-400">Initial competency evaluation</div>
          <div className="text-xs text-gray-500">30 days ago</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 bg-green-500 rounded-full" />
        <div>
          <div className="font-medium text-white">Platform Engagement</div>
          <div className="text-sm text-gray-400">Started professional development journey</div>
          <div className="text-xs text-gray-500">25 days ago</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 bg-purple-500 rounded-full" />
        <div>
          <div className="font-medium text-white">First Milestone</div>
          <div className="text-sm text-gray-400">Reached initial competency improvements</div>
          <div className="text-xs text-gray-500">15 days ago</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
        <div>
          <div className="font-medium text-white">Current Progress</div>
          <div className="text-sm text-gray-400">Ongoing professional development</div>
          <div className="text-xs text-gray-500">Today</div>
        </div>
      </div>
    </div>
  </div>
);

// Actionable Insights Component
const ActionableInsights = ({ comparisonData }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Actionable Insights</h4>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Brain className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-blue-300">Learning Velocity</span>
        </div>
        <p className="text-blue-100 text-sm">
          Your progress velocity of {comparisonData.progressVelocity} points/week is excellent. 
          Maintain this pace to reach proficiency milestones ahead of schedule.
        </p>
      </div>
      
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Award className="w-5 h-5 text-green-400" />
          <span className="font-medium text-green-300">Strength Areas</span>
        </div>
        <p className="text-green-100 text-sm">
          {comparisonData.strengthAreas.length} competency areas show strong performance. 
          Leverage these strengths to unlock advanced methodologies.
        </p>
      </div>
      
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Target className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-yellow-300">Focus Areas</span>
        </div>
        <p className="text-yellow-100 text-sm">
          {comparisonData.developmentAreas.length} areas need focused attention. 
          Prioritize these for maximum competency improvement.
        </p>
      </div>
    </div>
  </div>
);

// Utility functions
const analyzeCompetencyGaps = (baseline, current) => {
  const gaps = [];
  const categories = ['customerAnalysis', 'valueCommunication', 'salesExecution'];
  const names = {
    customerAnalysis: 'Customer Analysis',
    valueCommunication: 'Value Communication', 
    salesExecution: 'Sales Execution'
  };

  categories.forEach(category => {
    const gapSize = 70 - current[category];
    if (gapSize > 0) {
      gaps.push({
        competency: names[category],
        gapSize: gapSize.toFixed(0),
        severity: gapSize > 30 ? 'high' : gapSize > 15 ? 'medium' : 'low',
        description: `${gapSize.toFixed(0)} points needed to reach proficiency threshold`,
        estimatedTime: `${Math.ceil(gapSize / 5)} weeks`
      });
    }
  });

  return gaps;
};

const identifyStrengths = (current, improvements) => {
  const strengths = [];
  Object.entries(current).forEach(([key, value]) => {
    if (value >= 70) {
      strengths.push(key);
    }
  });
  return strengths;
};

const identifyDevelopmentAreas = (current, improvements) => {
  const areas = [];
  const names = {
    customerAnalysis: 'Customer Analysis',
    valueCommunication: 'Value Communication',
    salesExecution: 'Sales Execution'
  };

  Object.entries(current).forEach(([key, value]) => {
    if (value < 70) {
      areas.push({
        name: names[key],
        currentScore: value.toFixed(0),
        recommendation: `Focus on ${names[key].toLowerCase()} framework and practice`,
        potentialPoints: Math.ceil((70 - value) * 10)
      });
    }
  });

  return areas;
};

const calculateProgressVelocity = (competencyData) => {
  // Simplified calculation - in reality would use historical data
  return Math.round(competencyData.totalProgressPoints / 30 * 7); // points per week estimate
};

const calculateNextMilestones = (current) => {
  const milestones = [];
  
  Object.entries(current).forEach(([key, value]) => {
    if (value < 70) {
      const pointsNeeded = 70 - value;
      milestones.push({
        title: `${key.replace(/([A-Z])/g, ' $1').trim()} Proficiency`,
        pointsNeeded: pointsNeeded.toFixed(0),
        estimatedTime: `${Math.ceil(pointsNeeded / 5)} weeks`,
        reachable: pointsNeeded <= 20
      });
    }
  });

  return milestones.slice(0, 3); // Top 3 most achievable
};

export default BaselineComparisonDashboard;