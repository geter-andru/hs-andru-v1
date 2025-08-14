import React from 'react';
import { Calendar, Target, TrendingUp, Award, ChevronRight, Star } from 'lucide-react';
import SummaryMetric from './SummaryMetric';

const WeeklySummary = ({ 
  weeklyData, 
  className = '' 
}) => {
  // Default mock data for Phase 3 testing
  const defaultWeeklyData = {
    currentWeek: {
      totalPoints: 180,
      activitiesCompleted: 8,
      competencyGrowth: 12,
      toolsUnlocked: 1,
      averageImpact: 3.2, // out of 4 (low=1, medium=2, high=3, critical=4)
      focusHours: 14.5,
      streak: 5 // consecutive days with activity
    },
    previousWeek: {
      totalPoints: 145,
      activitiesCompleted: 6,
      competencyGrowth: 8,
      toolsUnlocked: 0,
      averageImpact: 2.8,
      focusHours: 11.2,
      streak: 3
    },
    goals: {
      weeklyPointTarget: 200,
      competencyTarget: 15,
      consistencyTarget: 7 // daily activities
    },
    achievements: [
      {
        title: "High Impact Week",
        description: "Completed 2+ critical impact activities",
        earned: true,
        icon: Star
      },
      {
        title: "Consistency Builder", 
        description: "5-day activity streak achieved",
        earned: true,
        icon: Target
      },
      {
        title: "Tool Unlocked",
        description: "Reached 70+ Value Communication score",
        earned: true,
        icon: Award
      }
    ]
  };

  const data = weeklyData || defaultWeeklyData;
  const { currentWeek, previousWeek, goals, achievements } = data;

  // Calculate progress towards goals
  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const pointsProgress = calculateProgress(currentWeek.totalPoints, goals.weeklyPointTarget);
  const competencyProgress = calculateProgress(currentWeek.competencyGrowth, goals.competencyTarget);
  const consistencyProgress = calculateProgress(currentWeek.streak, goals.consistencyTarget);

  return (
    <div className={`bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-lg border border-gray-700 ${className}`}>
      {/* Professional Header with Gradient Accent */}
      <div className="relative p-6 border-b border-gray-700">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 rounded-t-lg" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Weekly Performance Summary
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>This week</span>
            </div>
          </div>
          
          {/* Progress Overview Bar */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Weekly Target Progress</span>
                <span className="text-blue-400 font-medium">{Math.round(pointsProgress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${pointsProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Grid - Business Intelligence Style */}
      <div className="p-6 border-b border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <SummaryMetric
            label="Total Points"
            value={currentWeek.totalPoints}
            previousValue={previousWeek.totalPoints}
            size="default"
            className="text-center"
          />
          
          <SummaryMetric
            label="Activities"
            value={currentWeek.activitiesCompleted}
            previousValue={previousWeek.activitiesCompleted}
            size="default"
            className="text-center"
          />
          
          <SummaryMetric
            label="Competency Growth"
            value={currentWeek.competencyGrowth}
            previousValue={previousWeek.competencyGrowth}
            suffix=" pts"
            size="default"
            className="text-center"
          />
          
          <SummaryMetric
            label="Impact Score"
            value={currentWeek.averageImpact}
            previousValue={previousWeek.averageImpact}
            format="decimal"
            suffix="/4"
            size="small"
            className="text-center"
          />
          
          <SummaryMetric
            label="Focus Hours"
            value={currentWeek.focusHours}
            previousValue={previousWeek.focusHours}
            format="decimal"
            suffix="h"
            size="small"
            className="text-center"
          />
          
          <SummaryMetric
            label="Daily Streak"
            value={currentWeek.streak}
            previousValue={previousWeek.streak}
            suffix=" days"
            size="small"
            className="text-center"
          />
        </div>
      </div>
      
      {/* Goal Progress Indicators */}
      <div className="p-6 border-b border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-4">Goal Progress</h4>
        <div className="space-y-4">
          {/* Points Goal */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Weekly Points Target</span>
              <span className="text-gray-400">{currentWeek.totalPoints} / {goals.weeklyPointTarget}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  pointsProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-blue-500 to-blue-400'
                }`}
                style={{ width: `${pointsProgress}%` }}
              />
            </div>
          </div>
          
          {/* Competency Goal */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Competency Development</span>
              <span className="text-gray-400">{currentWeek.competencyGrowth} / {goals.competencyTarget}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  competencyProgress >= 100 ? 'bg-gradient-to-r from-purple-500 to-purple-400' : 'bg-gradient-to-r from-purple-600 to-purple-500'
                }`}
                style={{ width: `${competencyProgress}%` }}
              />
            </div>
          </div>
          
          {/* Consistency Goal */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Daily Consistency</span>
              <span className="text-gray-400">{currentWeek.streak} / {goals.consistencyTarget} days</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  consistencyProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
                style={{ width: `${consistencyProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements Section */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-white mb-4">Weekly Achievements</h4>
        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div 
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                  achievement.earned 
                    ? 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30' 
                    : 'bg-gray-800/50 border-gray-600/50 hover:bg-gray-800/70'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  achievement.earned 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  <IconComponent size={16} />
                </div>
                
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    achievement.earned ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {achievement.description}
                  </div>
                </div>
                
                {achievement.earned && (
                  <div className="text-green-400">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Weekly Summary Action */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <button className="w-full group bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg py-3 px-4 transition-all duration-200 flex items-center justify-center space-x-2">
            <TrendingUp size={16} className="text-blue-400 group-hover:text-blue-300" />
            <span className="text-sm font-medium text-white group-hover:text-blue-100">
              View Detailed Analytics
            </span>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-all duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklySummary;