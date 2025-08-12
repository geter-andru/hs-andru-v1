import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Calendar, Filter, Eye } from 'lucide-react';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';
import { milestoneService } from '../../services/milestoneService';
import { useProgressNotifications } from '../notifications/ProgressNotifications';
import MilestoneGallery from '../milestones/MilestoneGallery';
import CompetencyFeedback from './CompetencyFeedback';

const ProfessionalMilestones = ({ customerId, className = '' }) => {
  const { workflowProgress, usageAnalytics } = useWorkflowProgress(customerId);
  const [milestones, setMilestones] = useState({});
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [milestoneStats, setMilestoneStats] = useState({});
  const [activeView, setActiveView] = useState('overview'); // overview, gallery, feedback
  const [loading, setLoading] = useState(true);
  
  const { 
    showMilestoneReached, 
    showProgressRecognition,
    showCompetencyAdvancement 
  } = useProgressNotifications();

  // Initialize milestone tracking
  useEffect(() => {
    const initializeMilestones = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        
        // Initialize milestone service
        const milestoneData = await milestoneService.initializeMilestones(customerId);
        setMilestones(milestoneData.progress);
        setRecentAchievements(milestoneData.recent);
        
        // Get stats
        const stats = milestoneService.getMilestoneStats();
        setMilestoneStats(stats);
      } catch (error) {
        console.error('Error initializing milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMilestones();
  }, [customerId]);

  // Monitor for milestone progress and achievements
  useEffect(() => {
    const checkMilestoneProgress = async () => {
      if (!workflowProgress || !usageAnalytics || !customerId) return;

      try {
        // Simulate different actions based on workflow progress
        let actionType = null;
        let actionData = {};

        // Check for ICP completion
        if (workflowProgress.icp_completed) {
          actionType = 'tool_completed';
          actionData = {
            tool: 'icp',
            score: workflowProgress.icp_score || 0,
            timestamp: workflowProgress.analysis_date || new Date().toISOString()
          };
        }

        // Check for cost calculation
        if (workflowProgress.cost_calculated) {
          actionType = 'tool_completed';
          actionData = {
            tool: 'cost',
            annualCost: workflowProgress.annual_cost || 0,
            timestamp: new Date().toISOString()
          };
        }

        // Check for business case completion
        if (workflowProgress.business_case_ready) {
          actionType = 'tool_completed';
          actionData = {
            tool: 'business_case',
            template: workflowProgress.selected_template,
            timestamp: new Date().toISOString()
          };
        }

        if (actionType) {
          const milestoneCheck = await milestoneService.checkMilestoneProgress(
            customerId,
            actionType,
            actionData
          );

          // Handle new achievements
          if (milestoneCheck.newlyAchieved.length > 0) {
            milestoneCheck.newlyAchieved.forEach(achievement => {
              const milestone = achievement.milestone;
              
              // Show professional milestone notification
              showMilestoneReached(
                milestone.name,
                milestone.reward.badge,
                milestone.reward.progressPoints
              );

              // Show competency advancement
              if (milestone.reward.competencyGain) {
                showCompetencyAdvancement(
                  milestone.reward.competencyGain.type,
                  milestone.reward.competencyGain.amount
                );
              }

              // Show progress recognition
              showProgressRecognition(
                milestone.category + ' Milestone',
                milestone.reward.progressPoints
              );
            });

            // Update local state
            setRecentAchievements(prev => [
              ...milestoneCheck.newlyAchieved.map(a => ({
                milestone: a.milestone,
                achievedAt: a.progress.achievedAt,
                timestamp: new Date().toISOString()
              })),
              ...prev
            ].slice(0, 10));
          }

          // Update milestone progress
          setMilestones(milestoneService.userProgress);
          setMilestoneStats(milestoneService.getMilestoneStats());
        }
      } catch (error) {
        console.error('Error checking milestone progress:', error);
      }
    };

    checkMilestoneProgress();
  }, [workflowProgress, usageAnalytics, customerId, showMilestoneReached, showCompetencyAdvancement, showProgressRecognition]);

  const getTotalAchieved = () => {
    return Object.values(milestones).filter(m => m.achieved).length;
  };

  const getTotalAvailable = () => {
    return Object.keys(milestoneService.milestones || {}).length;
  };

  const getTotalProgressPoints = () => {
    return Object.entries(milestones)
      .filter(([_, progress]) => progress.achieved)
      .reduce((total, [milestoneId, _]) => {
        const milestone = milestoneService.milestones[milestoneId];
        return total + (milestone?.reward.progressPoints || 0);
      }, 0);
  };

  const getRecentActivity = () => {
    const activities = [];
    
    if (workflowProgress?.icp_completed) {
      activities.push({
        type: 'icp_completed',
        timestamp: workflowProgress.analysis_date || new Date().toISOString(),
        score: workflowProgress.icp_score
      });
    }
    
    if (workflowProgress?.cost_calculated) {
      activities.push({
        type: 'cost_calculated',
        timestamp: new Date().toISOString(),
        annualCost: workflowProgress.annual_cost
      });
    }
    
    if (workflowProgress?.business_case_ready) {
      activities.push({
        type: 'business_case_ready',
        timestamp: new Date().toISOString(),
        template: workflowProgress.selected_template
      });
    }

    return activities.slice(0, 5);
  };

  const MilestoneOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-yellow-400">
            {getTotalAchieved()}
          </div>
          <div className="text-sm text-gray-400">Milestones Achieved</div>
          <div className="text-xs text-gray-500 mt-1">
            of {getTotalAvailable()} available
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">
            {getTotalProgressPoints()}
          </div>
          <div className="text-sm text-gray-400">Progress Points</div>
          <div className="text-xs text-gray-500 mt-1">
            Professional development
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">
            {milestoneStats.currentStreaks?.daily || 0}
          </div>
          <div className="text-sm text-gray-400">Current Streak</div>
          <div className="text-xs text-gray-500 mt-1">
            Consecutive days
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round((getTotalAchieved() / getTotalAvailable()) * 100)}%
          </div>
          <div className="text-sm text-gray-400">Completion</div>
          <div className="text-xs text-gray-500 mt-1">
            Overall progress
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Professional Achievements
          </h3>
          <div className="space-y-3">
            {recentAchievements.slice(0, 3).map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="text-2xl">{achievement.milestone.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">
                    {achievement.milestone.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {achievement.milestone.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-yellow-400">
                    +{achievement.milestone.reward.progressPoints}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.achievedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestones */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
          Next Professional Milestones
        </h3>
        <div className="space-y-4">
          {milestoneStats.nextMilestones?.slice(0, 3).map((milestone, index) => {
            const progress = (milestone.progress.current / (milestone.progress.required || 1)) * 100;
            
            return (
              <div key={milestone.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{milestone.icon}</div>
                    <div>
                      <h4 className="font-medium text-white">{milestone.name}</h4>
                      <p className="text-sm text-gray-400">{milestone.description}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full border border-blue-700">
                    {milestone.category}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-gray-300">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {milestone.progress.current} / {milestone.progress.required || 1}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with View Toggle */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Professional Milestone System
            </h2>
            <p className="text-gray-400">
              Track systematic development and professional achievement recognition
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {getTotalAchieved()}
            </div>
            <div className="text-sm text-gray-400">Achievements</div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveView('overview')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeView === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </button>
          
          <button
            onClick={() => setActiveView('gallery')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeView === 'gallery' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Full History
          </button>
          
          <button
            onClick={() => setActiveView('feedback')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeView === 'feedback' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Award className="w-4 h-4 mr-2" />
            Live Feedback
          </button>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'overview' && <MilestoneOverview />}
      
      {activeView === 'gallery' && (
        <MilestoneGallery customerId={customerId} />
      )}
      
      {activeView === 'feedback' && (
        <CompetencyFeedback
          customerId={customerId}
          recentActions={getRecentActivity()}
          competencyChanges={[]} // Will be populated by real competency tracking
        />
      )}
    </div>
  );
};

export default ProfessionalMilestones;