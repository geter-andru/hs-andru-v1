import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Unlock, ChevronRight, Star } from 'lucide-react';
import { airtableService } from '../../services/airtableService';
import '../../styles/gamification.css';

const CompetencyOverview = ({ customerId, competencyData, onRefresh, className = '' }) => {
  const [overview, setOverview] = useState({
    currentLevel: 'Foundation',
    progressPoints: 0,
    nextLevelThreshold: 100,
    toolsUnlocked: 1,
    totalTools: 3,
    todaysObjectives: 0,
    objectivesCompleted: 0,
    consistencyStreak: 0,
    hiddenRank: 'E'
  });
  const [loading, setLoading] = useState(true);
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    loadOverviewData();
  }, [customerId, competencyData]);

  const loadOverviewData = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      
      // Load comprehensive competency data
      const [competency, toolAccess, milestones, objectives] = await Promise.all([
        airtableService.loadCompetencyProgress(customerId),
        airtableService.checkToolAccess(customerId, 'cost_calculator'), // Check for unlock status
        airtableService.loadMilestoneHistory(customerId),
        airtableService.generateDailyObjectives(customerId)
      ]);

      // Calculate overview metrics
      const progressToNext = competency.rank_points || 0;
      const nextThreshold = competency.next_rank_threshold || 500;
      const unlockedTools = await countUnlockedTools(customerId);
      
      const newOverview = {
        currentLevel: competency.overall_level || 'Foundation',
        progressPoints: competency.total_progress_points || 0,
        nextLevelThreshold: nextThreshold,
        progressToNext: progressToNext,
        toolsUnlocked: unlockedTools,
        totalTools: 3,
        todaysObjectives: objectives.objectives?.length || 0,
        objectivesCompleted: objectives.objectives?.filter(o => o.completed).length || 0,
        consistencyStreak: competency.consistency_streak || 0,
        hiddenRank: competency.hidden_rank || 'E',
        recentMilestones: milestones.recent?.slice(0, 2) || []
      };

      setOverview(newOverview);
      
      // Trigger progress animation if points increased
      if (newOverview.progressPoints > overview.progressPoints) {
        setAnimateProgress(true);
        setTimeout(() => setAnimateProgress(false), 2000);
      }
    } catch (error) {
      console.error('Error loading competency overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const countUnlockedTools = async (customerId) => {
    try {
      const data = await airtableService.getCustomerDataByRecordId(customerId);
      const toolAccess = data.toolAccessStatus || {};
      
      let count = 0;
      if (toolAccess.icp_analysis?.access) count++;
      if (toolAccess.cost_calculator?.access) count++;
      if (toolAccess.business_case_builder?.access) count++;
      
      return count;
    } catch (error) {
      console.error('Error counting unlocked tools:', error);
      return 1; // Default to ICP being unlocked
    }
  };

  const getProgressPercentage = () => {
    return Math.min((overview.progressToNext / overview.nextLevelThreshold) * 100, 100);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Foundation': 'text-blue-400',
      'Developing': 'text-green-400',
      'Proficient': 'text-yellow-400',
      'Advanced': 'text-purple-400',
      'Expert': 'text-red-400'
    };
    return colors[level] || 'text-gray-400';
  };

  const getRankDisplay = (rank) => {
    // Hidden Solo Leveling rank system
    const rankEmojis = {
      'E': '⚪', 'D': '🔵', 'C': '🟢', 
      'B': '🟡', 'A': '🟠', 'S': '🔴', 'S+': '⭐'
    };
    return rankEmojis[rank] || '⚪';
  };

  if (loading) {
    return (
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-900/50 rounded-lg border border-blue-700">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Professional Competency Overview
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span className={`font-medium ${getLevelColor(overview.currentLevel)}`}>
                  {overview.currentLevel} Level
                </span>
                <span className="text-gray-500">•</span>
                <span className="flex items-center space-x-1">
                  <span>{getRankDisplay(overview.hiddenRank)}</span>
                  <span>Methodology Specialist</span>
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onRefresh}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
            title="Refresh competency data"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Progress Points */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Progress Points</h3>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div className={`text-2xl font-bold text-yellow-400 ${animateProgress ? 'animate-pulse' : ''}`}>
              {overview.progressPoints.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Professional development score
            </div>
          </div>

          {/* Methodology Access */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Tools Available</h3>
              <Unlock className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-400">
              {overview.toolsUnlocked}/{overview.totalTools}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Advanced methodologies unlocked
            </div>
          </div>

          {/* Daily Objectives */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Today's Focus</h3>
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {overview.objectivesCompleted}/{overview.todaysObjectives}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Professional objectives completed
            </div>
          </div>

          {/* Consistency Streak */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-400">Excellence Streak</h3>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {overview.consistencyStreak}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Consecutive days of engagement
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-300">Next Advancement Progress</h3>
            <span className="text-xs text-gray-500">
              {overview.progressToNext}/{overview.nextLevelThreshold} points
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${getProgressPercentage()}%` }}
            >
              {animateProgress && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-right" />
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Current: {overview.currentLevel}</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
        </div>

        {/* Recent Achievements */}
        {overview.recentMilestones && overview.recentMilestones.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
              <Award className="w-4 h-4 mr-2 text-yellow-400" />
              Recent Professional Achievements
            </h3>
            <div className="space-y-2">
              {overview.recentMilestones.map((milestone, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-600">
                  <span className="text-sm text-gray-300">{milestone.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-yellow-400">+{milestone.points}</span>
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyOverview;