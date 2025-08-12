import React, { useState, useEffect } from 'react';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';

// Hidden Solo Leveling rank system disguised as professional competency levels
const COMPETENCY_LEVELS = {
  FOUNDATION: { min: 0, max: 500, rank: 'E', display: 'Foundation Level', color: 'from-gray-600 to-gray-500' },
  DEVELOPING: { min: 500, max: 1500, rank: 'D', display: 'Developing Level', color: 'from-blue-600 to-blue-500' },
  PROFICIENT: { min: 1500, max: 3500, rank: 'C', display: 'Proficient Level', color: 'from-green-600 to-green-500' },
  ADVANCED: { min: 3500, max: 7000, rank: 'B', display: 'Advanced Level', color: 'from-purple-600 to-purple-500' },
  EXPERT: { min: 7000, max: 12000, rank: 'A', display: 'Expert Level', color: 'from-yellow-600 to-yellow-500' },
  MASTER: { min: 12000, max: Infinity, rank: 'S', display: 'Master Level', color: 'from-red-600 to-red-500' }
};

// Hidden stats system for the three core competencies
const CORE_COMPETENCIES = {
  CUSTOMER_ANALYSIS: 'Customer Analysis Competency',
  BUSINESS_COMMUNICATION: 'Business Communication Proficiency', 
  REVENUE_STRATEGY: 'Revenue Strategy Capability'
};

const CompetencyAssessment = ({ customerId, className = '' }) => {
  const { workflowProgress, usageAnalytics } = useWorkflowProgress(customerId);
  const [competencyData, setCompetencyData] = useState({
    totalPoints: 0,
    level: 'FOUNDATION',
    competencies: {
      customerAnalysis: 0,
      businessCommunication: 0,
      revenueStrategy: 0
    },
    recentAchievements: []
  });
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  // Calculate hidden Solo Leveling progression from tool usage
  useEffect(() => {
    if (!workflowProgress || !usageAnalytics) return;

    const calculatePoints = () => {
      let points = 0;
      let customerAnalysis = 0;
      let businessCommunication = 0;
      let revenueStrategy = 0;

      // ICP Analysis contributes to Customer Analysis Competency
      if (workflowProgress.icp_completed) {
        points += 150;
        customerAnalysis += Math.min(workflowProgress.icp_score || 0, 100);
      }

      // Cost Calculator contributes to Revenue Strategy Capability
      if (workflowProgress.cost_calculated) {
        points += 200;
        revenueStrategy += 35;
        if (workflowProgress.annual_cost > 100000) revenueStrategy += 15; // Bonus for high-value analysis
      }

      // Business Case contributes to Business Communication Proficiency
      if (workflowProgress.business_case_ready) {
        points += 300;
        businessCommunication += 45;
        if (workflowProgress.selected_template) businessCommunication += 15; // Template selection bonus
      }

      // Usage analytics bonuses (hidden engagement rewards)
      const toolsCompleted = usageAnalytics.tools_completed?.length || 0;
      points += toolsCompleted * 50; // Tool completion streaks

      const exportCount = usageAnalytics.export_count || 0;
      points += exportCount * 75; // Export engagement
      businessCommunication += Math.min(exportCount * 10, 30);

      // Time-based bonuses (efficiency rewards)
      const timePerTool = usageAnalytics.time_per_tool || {};
      Object.values(timePerTool).forEach(time => {
        if (time < 300) points += 25; // Speed bonus for completing tools quickly
      });

      return { points, customerAnalysis, businessCommunication, revenueStrategy };
    };

    const newData = calculatePoints();
    
    // Determine current level (hidden rank system)
    let currentLevel = 'FOUNDATION';
    for (const [level, config] of Object.entries(COMPETENCY_LEVELS)) {
      if (newData.points >= config.min && newData.points < config.max) {
        currentLevel = level;
        break;
      }
    }

    // Check for level up (rank advancement)
    if (currentLevel !== competencyData.level && competencyData.level !== 'FOUNDATION') {
      setLevelUpAnimation(true);
      setTimeout(() => setLevelUpAnimation(false), 3000);
    }

    setCompetencyData({
      totalPoints: newData.points,
      level: currentLevel,
      competencies: {
        customerAnalysis: Math.min(newData.customerAnalysis, 100),
        businessCommunication: Math.min(newData.businessCommunication, 100),
        revenueStrategy: Math.min(newData.revenueStrategy, 100)
      },
      recentAchievements: []
    });
  }, [workflowProgress, usageAnalytics, competencyData.level]);

  const getCurrentLevelConfig = () => COMPETENCY_LEVELS[competencyData.level];
  const getNextLevelConfig = () => {
    const levels = Object.keys(COMPETENCY_LEVELS);
    const currentIndex = levels.indexOf(competencyData.level);
    return currentIndex < levels.length - 1 ? COMPETENCY_LEVELS[levels[currentIndex + 1]] : null;
  };

  const getProgressToNextLevel = () => {
    const current = getCurrentLevelConfig();
    const next = getNextLevelConfig();
    if (!next) return 100; // Master level reached
    
    const currentProgress = competencyData.totalPoints - current.min;
    const totalNeeded = next.min - current.min;
    return Math.min((currentProgress / totalNeeded) * 100, 100);
  };

  const CompetencyBar = ({ label, value, color = 'blue' }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{Math.round(value)}/100</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`bg-gradient-to-r from-${color}-600 to-${color}-500 h-2 rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  if (!workflowProgress) return null;

  const currentLevel = getCurrentLevelConfig();
  const nextLevel = getNextLevelConfig();
  const progressPercent = getProgressToNextLevel();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Level Up Animation */}
      {levelUpAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-8 text-center max-w-md animate-pulse">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional Advancement</h3>
            <p className="text-gray-300">
              Congratulations! You've achieved <span className="text-yellow-400 font-semibold">{currentLevel.display}</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Competency Assessment Panel */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Professional Competency Assessment</h2>
            <p className="text-gray-400 text-sm">Your methodology advancement and skill development</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r ${currentLevel.color} text-white font-semibold`}>
              {currentLevel.display}
            </div>
            <p className="text-xs text-gray-400 mt-1">{competencyData.totalPoints} Progress Points</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">
                Progress to {nextLevel.display}
              </span>
              <span className="text-sm text-gray-400">
                {competencyData.totalPoints}/{nextLevel.min} points
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`bg-gradient-to-r ${nextLevel.color} h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden`}
                style={{ width: `${progressPercent}%` }}
              >
                {progressPercent > 10 && (
                  <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Core Competencies (Hidden Stats System) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Core Competencies</h3>
          
          <CompetencyBar
            label={CORE_COMPETENCIES.CUSTOMER_ANALYSIS}
            value={competencyData.competencies.customerAnalysis}
            color="blue"
          />
          
          <CompetencyBar
            label={CORE_COMPETENCIES.BUSINESS_COMMUNICATION}
            value={competencyData.competencies.businessCommunication}
            color="green"
          />
          
          <CompetencyBar
            label={CORE_COMPETENCIES.REVENUE_STRATEGY}
            value={competencyData.competencies.revenueStrategy}
            color="purple"
          />
        </div>

        {/* Professional Insights (Disguised Achievement Summary) */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Professional Development Insights</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-blue-400 font-semibold">
                {usageAnalytics?.tools_completed?.length || 0}
              </div>
              <div className="text-gray-400">Methodologies Mastered</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-green-400 font-semibold">
                {usageAnalytics?.export_count || 0}
              </div>
              <div className="text-gray-400">Strategic Analyses Shared</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-purple-400 font-semibold">
                {Math.round(competencyData.totalPoints / 100)}
              </div>
              <div className="text-gray-400">Competency Milestones</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-yellow-400 font-semibold">
                {workflowProgress?.completion_percentage || 0}%
              </div>
              <div className="text-gray-400">Process Completion Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyAssessment;