import React from 'react';
import { TrendingUp, Target, AlertTriangle, Award, DollarSign, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';

// Assessment performance level styling
const PERFORMANCE_LEVELS = {
  Foundation: {
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/30',
    icon: Target
  },
  Developing: {
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30',
    icon: TrendingUp
  },
  Proficient: {
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-500/30',
    icon: CheckCircle
  },
  Advanced: {
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/30',
    icon: Award
  },
  Expert: {
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/30',
    icon: Award
  }
};

// Priority level styling
const PRIORITY_LEVELS = {
  low: {
    color: 'text-green-400',
    bg: 'bg-green-900/20',
    border: 'border-green-500/30'
  },
  standard: {
    color: 'text-blue-400',
    bg: 'bg-blue-900/20',
    border: 'border-blue-500/30'
  },
  high: {
    color: 'text-amber-400',
    bg: 'bg-amber-900/20',
    border: 'border-amber-500/30'
  },
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-900/20',
    border: 'border-red-500/30'
  },
  strategic: {
    color: 'text-purple-400',
    bg: 'bg-purple-900/20',
    border: 'border-purple-500/30'
  }
};

const ScoreIndicator = ({ score, label, icon: Icon, benchmark = 70 }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const getProgressColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-gray-700/50">
      <div className="flex-shrink-0">
        <Icon size={18} className={getScoreColor(score)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-300 text-sm">{label}</span>
          <span className={`font-bold text-lg ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(score)}`}
            style={{ width: `${Math.min(100, score)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const ChallengeItem = ({ challenge, severity = 'medium' }) => {
  const severityConfig = {
    low: { icon: CheckCircle, color: 'text-green-400' },
    medium: { icon: AlertTriangle, color: 'text-amber-400' },
    high: { icon: XCircle, color: 'text-red-400' },
    critical: { icon: XCircle, color: 'text-red-500' }
  };

  const config = severityConfig[severity] || severityConfig.medium;
  const Icon = config.icon;

  return (
    <div className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg border border-gray-700/30">
      <Icon size={16} className={`${config.color} mt-0.5 flex-shrink-0`} />
      <span className="text-gray-300 text-sm leading-relaxed">{challenge}</span>
    </div>
  );
};

const RevenueImpactCard = ({ assessmentData }) => {
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const priorityLevel = PRIORITY_LEVELS[assessmentData.lead_priority] || PRIORITY_LEVELS.standard;

  return (
    <div className={`p-4 rounded-lg border ${priorityLevel.bg} ${priorityLevel.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-semibold flex items-center space-x-2">
          <DollarSign size={18} className={priorityLevel.color} />
          <span>Revenue Impact</span>
        </h4>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityLevel.bg} ${priorityLevel.color} border ${priorityLevel.border}`}>
          {assessmentData.lead_priority.charAt(0).toUpperCase() + assessmentData.lead_priority.slice(1)} Priority
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
            Revenue Opportunity
          </div>
          <div className={`text-2xl font-bold ${priorityLevel.color}`}>
            {formatCurrency(assessmentData.revenue_opportunity)}
          </div>
        </div>
        <div>
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">
            ROI Multiplier
          </div>
          <div className={`text-2xl font-bold ${priorityLevel.color}`}>
            {assessmentData.roi_multiplier}x
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Timeline:</span>
          <span className="text-gray-300">{assessmentData.impact_timeline || 'Not specified'}</span>
        </div>
      </div>
    </div>
  );
};

const AssessmentInsights = ({ assessmentData, className = '' }) => {
  if (!assessmentData) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <Target size={48} className="mx-auto text-gray-500 mb-4" />
          <h3 className="text-white font-semibold mb-2">No Assessment Data</h3>
          <p className="text-gray-400 text-sm">
            Complete a customer assessment to see detailed insights and recommendations.
          </p>
        </div>
      </div>
    );
  }

  const performanceLevel = PERFORMANCE_LEVELS[assessmentData.performance_level] || PERFORMANCE_LEVELS.Foundation;
  const PerformanceIcon = performanceLevel.icon;

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}>
      {/* Header with Performance Level */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-3">
            <PerformanceIcon size={24} className={performanceLevel.color} />
            <span>Assessment Insights</span>
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${performanceLevel.bg} ${performanceLevel.color} border ${performanceLevel.border}`}>
            {assessmentData.performance_level} Level
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>Completed: {new Date(assessmentData.completed_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap size={14} />
            <span>Duration: {assessmentData.duration_minutes} minutes</span>
          </div>
          <div>
            <span>Percentile: {assessmentData.percentile}th</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Assessment Scores */}
        <div>
          <h4 className="text-white font-semibold mb-4">Performance Scores</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScoreIndicator 
              score={assessmentData.overall_score} 
              label="Overall Score" 
              icon={Award}
            />
            <ScoreIndicator 
              score={assessmentData.buyer_understanding_score} 
              label="Buyer Understanding" 
              icon={Target}
            />
            <ScoreIndicator 
              score={assessmentData.tech_to_value_score} 
              label="Tech-to-Value Translation" 
              icon={TrendingUp}
            />
            <div className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-gray-700/50">
              <div className="flex-shrink-0">
                <Award size={18} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Performance Percentile</span>
                  <span className="font-bold text-lg text-purple-400">{assessmentData.percentile}th</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Impact */}
        <RevenueImpactCard assessmentData={assessmentData} />

        {/* Challenges */}
        {assessmentData.challenge_breakdown && assessmentData.challenge_breakdown.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Key Challenges</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{assessmentData.total_challenges} total</span>
                {assessmentData.critical_challenges > 0 && (
                  <span className="text-red-400">• {assessmentData.critical_challenges} critical</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {assessmentData.challenge_breakdown.slice(0, 3).map((challenge, index) => (
                <ChallengeItem 
                  key={index} 
                  challenge={challenge} 
                  severity={index < assessmentData.critical_challenges ? 'critical' : 
                          index < assessmentData.critical_challenges + assessmentData.high_priority_challenges ? 'high' : 'medium'}
                />
              ))}
            </div>
          </div>
        )}

        {/* Primary Recommendation */}
        {assessmentData.primary_recommendation && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center space-x-2">
              <Zap size={18} />
              <span>Primary Recommendation</span>
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              {assessmentData.primary_recommendation}
            </p>
            {assessmentData.focus_area && (
              <div className="mt-3 pt-3 border-t border-blue-500/20">
                <div className="text-xs text-blue-300">
                  Focus Area: <span className="capitalize">{assessmentData.focus_area.replace('_', ' ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Information */}
        {assessmentData.product_name && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600/30">
            <h4 className="text-gray-300 font-medium mb-3">Product Context</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Product: </span>
                <span className="text-white">{assessmentData.product_name}</span>
              </div>
              {assessmentData.business_model && (
                <div>
                  <span className="text-gray-400">Business Model: </span>
                  <span className="text-gray-300">{assessmentData.business_model}</span>
                </div>
              )}
              {assessmentData.distinguishing_feature && (
                <div>
                  <span className="text-gray-400">Key Feature: </span>
                  <span className="text-gray-300">{assessmentData.distinguishing_feature}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentInsights;