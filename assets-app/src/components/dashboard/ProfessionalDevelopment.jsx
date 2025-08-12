import React, { useState, useEffect } from 'react';
import { Award, Target, TrendingUp, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { airtableService } from '../../services/airtableService';

const ProfessionalDevelopment = ({ 
  customerId, 
  milestones = {}, 
  dailyObjectives = {}, 
  onObjectiveComplete,
  className = '' 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('objectives');
  const [data, setData] = useState({
    todaysObjectives: [],
    recentMilestones: [],
    streakData: { current: 0, best: 0 },
    progressSummary: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevelopmentData();
  }, [customerId, milestones, dailyObjectives]);

  const loadDevelopmentData = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      
      const [objectives, milestoneHistory, competency] = await Promise.all([
        airtableService.generateDailyObjectives(customerId),
        airtableService.loadMilestoneHistory(customerId),
        airtableService.loadCompetencyProgress(customerId)
      ]);

      setData({
        todaysObjectives: objectives.objectives || [],
        recentMilestones: milestoneHistory.recent || [],
        streakData: {
          current: competency.consistency_streak || 0,
          best: Math.max(competency.consistency_streak || 0, 7) // Show encouraging best
        },
        progressSummary: {
          totalPoints: competency.total_progress_points || 0,
          milestonesAchieved: milestoneHistory.achieved?.length || 0,
          currentLevel: competency.overall_level || 'Foundation'
        }
      });
    } catch (error) {
      console.error('Error loading professional development data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleObjectiveComplete = async (objectiveId) => {
    try {
      await airtableService.completeObjective(customerId, objectiveId);
      
      // Update local state
      setData(prev => ({
        ...prev,
        todaysObjectives: prev.todaysObjectives.map(obj =>
          obj.id === objectiveId ? { ...obj, completed: true, completed_at: new Date().toISOString() } : obj
        )
      }));

      // Trigger parent callback
      if (onObjectiveComplete) {
        onObjectiveComplete(objectiveId);
      }

      // Refresh data to get updated streaks and points
      setTimeout(() => {
        loadDevelopmentData();
      }, 1000);
    } catch (error) {
      console.error('Error completing objective:', error);
    }
  };

  const getObjectiveIcon = (type) => {
    const icons = {
      exploration: '🔍',
      learning: '📚',
      practice: '💪',
      completion: '✅',
      optimization: '⚡',
      review: '🔄',
      mastery: '🎯',
      comprehensive: '🚀',
      efficiency: '⏱️',
      quality: '⭐'
    };
    return icons[type] || '📋';
  };

  const getCompletedToday = () => {
    return data.todaysObjectives.filter(obj => obj.completed).length;
  };

  const getTotalToday = () => {
    return data.todaysObjectives.length;
  };

  const getProgressPercentage = () => {
    const total = getTotalToday();
    if (total === 0) return 0;
    return (getCompletedToday() / total) * 100;
  };

  if (loading) {
    return (
      <div className={`bg-gray-900 border border-gray-700 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/2" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-900/50 rounded-lg border border-purple-700">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Professional Development
              </h3>
              <p className="text-xs text-gray-400">
                Excellence through consistent growth
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
              <div className="text-lg font-bold text-blue-400">
                {data.progressSummary.totalPoints?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-gray-400">Points</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
              <div className="text-lg font-bold text-yellow-400">
                {data.progressSummary.milestonesAchieved || 0}
              </div>
              <div className="text-xs text-gray-400">Milestones</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700">
              <div className="text-lg font-bold text-green-400">
                {data.streakData.current}
              </div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>

          {/* Section Toggle */}
          <div className="flex bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => setActiveSection('objectives')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === 'objectives'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Objectives</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('milestones')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === 'milestones'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <Award className="w-4 h-4" />
                <span>Achievements</span>
              </div>
            </button>
          </div>

          {/* Daily Objectives Section */}
          {activeSection === 'objectives' && (
            <div className="space-y-4">
              {/* Progress Header */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-white">Today's Focus</h4>
                  <span className="text-xs text-gray-400">
                    {getCompletedToday()}/{getTotalToday()} completed
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  Professional development objectives for {new Date().toLocaleDateString()}
                </div>
              </div>

              {/* Objectives List */}
              <div className="space-y-2">
                {data.todaysObjectives.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No objectives generated yet</p>
                    <button
                      onClick={loadDevelopmentData}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      Generate today's objectives
                    </button>
                  </div>
                ) : (
                  data.todaysObjectives.map((objective) => (
                    <div
                      key={objective.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                        objective.completed
                          ? 'bg-green-900/20 border-green-700 opacity-75'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <button
                        onClick={() => !objective.completed && handleObjectiveComplete(objective.id)}
                        disabled={objective.completed}
                        className={`p-1 rounded-full transition-colors ${
                          objective.completed
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-gray-700 text-gray-400 hover:bg-blue-600 hover:text-white cursor-pointer'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm">{getObjectiveIcon(objective.type)}</span>
                          <h5 className={`text-sm font-medium ${
                            objective.completed ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            {objective.name}
                          </h5>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-gray-500 capitalize">{objective.type}</span>
                          {objective.points && (
                            <span className="text-blue-400">+{objective.points} points</span>
                          )}
                          {objective.completed && objective.completed_at && (
                            <span className="text-green-400 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Completed {new Date(objective.completed_at).toLocaleTimeString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Consistency Streak */}
              {data.streakData.current > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-white mb-1">
                        Excellence Consistency
                      </h5>
                      <p className="text-xs text-gray-400">
                        {data.streakData.current} consecutive days of professional development
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-400">
                        🔥 {data.streakData.current}
                      </div>
                      <div className="text-xs text-gray-500">
                        Best: {data.streakData.best}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recent Milestones Section */}
          {activeSection === 'milestones' && (
            <div className="space-y-3">
              {data.recentMilestones.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No milestones achieved yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Complete analyses to earn professional recognition
                  </p>
                </div>
              ) : (
                data.recentMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    <div className="p-2 bg-yellow-900/50 rounded-lg border border-yellow-700">
                      <Award className="w-4 h-4 text-yellow-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-white">
                        {milestone.name}
                      </h5>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        <span>+{milestone.points} points</span>
                        <span>•</span>
                        <span>{new Date(milestone.achieved_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Professional Level Display */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-white mb-1">
                      Current Professional Level
                    </h5>
                    <p className="text-xs text-gray-400">
                      Systematic business methodology competency
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">
                      {data.progressSummary.currentLevel}
                    </div>
                    <div className="text-xs text-gray-500">
                      Level
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalDevelopment;