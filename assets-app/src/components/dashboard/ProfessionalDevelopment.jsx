import React, { useState, useEffect } from 'react';
import { Award, Target, TrendingUp, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { airtableService } from '../../services/airtableService';
import '../../styles/gamification.css';

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
    <div className={`executive-card animate-executive-entrance ${className}`}>
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-purple-900/30 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30 backdrop-blur-sm">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Strategic Development Center
              </h3>
              <p className="text-sm text-gray-300 font-medium">
                Executive excellence through systematic advancement
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="professional-interactive professional-focus text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800/50 backdrop-blur-sm border border-gray-600 hover:border-purple-500"
          >
            {collapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-6">
          {/* Executive Performance Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="executive-card bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20 hover:border-blue-400/40">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1 animate-sophisticated-points-increment">
                  {data.progressSummary.totalPoints?.toLocaleString() || '0'}
                </div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Excellence Points</div>
              </div>
            </div>
            
            <div className="executive-card bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20 hover:border-yellow-400/40">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {data.progressSummary.milestonesAchieved || 0}
                </div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Achievements</div>
              </div>
            </div>
            
            <div className="executive-card bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20 hover:border-green-400/40">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1 animate-executive-streak-fire">
                  {data.streakData.current}
                </div>
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Momentum</div>
              </div>
            </div>
          </div>

          {/* Executive Section Navigation */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
            <button
              onClick={() => setActiveSection('objectives')}
              className={`professional-interactive professional-focus flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                activeSection === 'objectives'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Strategic Focus</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveSection('milestones')}
              className={`professional-interactive professional-focus flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${
                activeSection === 'milestones'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Recognition</span>
              </div>
            </button>
          </div>

          {/* Daily Objectives Section */}
          {activeSection === 'objectives' && (
            <div className="space-y-4">
              {/* Executive Progress Dashboard */}
              <div className="executive-card bg-gradient-to-br from-gray-800/80 to-gray-900/50">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Today's Strategic Priorities</h4>
                    <span className="professional-badge badge-advancement text-xs">
                      {getCompletedToday()}/{getTotalToday()} achieved
                    </span>
                  </div>
                  
                  <div className="relative mb-4">
                    <div className="w-full bg-gray-700/50 rounded-full h-3 shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-green-500 to-blue-600 h-3 rounded-full animate-sophisticated-progress-fill shadow-lg"
                        style={{ width: `${getProgressPercentage()}%`, '--target-width': `${getProgressPercentage()}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 font-medium">
                    Executive development roadmap • {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
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
                      className={`milestone-gallery-card flex items-center space-x-4 p-4 rounded-xl border transition-all ${
                        objective.completed
                          ? 'bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-600/40 opacity-80'
                          : 'bg-gradient-to-r from-gray-800/60 to-gray-900/40 border-gray-600/50 hover:border-blue-500/40'
                      }`}
                    >
                      <button
                        onClick={() => !objective.completed && handleObjectiveComplete(objective.id)}
                        disabled={objective.completed}
                        className={`professional-interactive p-2 rounded-xl transition-all ${
                          objective.completed
                            ? 'bg-green-600/80 text-white cursor-default shadow-lg'
                            : 'bg-gray-700/80 text-gray-400 hover:bg-blue-600 hover:text-white cursor-pointer professional-focus'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg">{getObjectiveIcon(objective.type)}</span>
                          <h5 className={`text-sm font-semibold ${
                            objective.completed ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            {objective.name}
                          </h5>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="professional-badge text-xs font-medium capitalize">
                            {objective.type}
                          </span>
                          {objective.points && (
                            <span className="professional-badge badge-advancement text-xs">+{objective.points} pts</span>
                          )}
                          {objective.completed && objective.completed_at && (
                            <span className="text-green-400 flex items-center space-x-1 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>Achieved {new Date(objective.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Executive Excellence Momentum */}
              {data.streakData.current > 0 && (
                <div className="executive-card bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-lg font-semibold text-white mb-2">
                          Executive Excellence Momentum
                        </h5>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {data.streakData.current} consecutive days of strategic advancement
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400 mb-1 animate-executive-streak-fire">
                          🔥 {data.streakData.current}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          Personal Best: {data.streakData.best}
                        </div>
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
                    className="milestone-gallery-card flex items-center space-x-4 p-5 bg-gradient-to-r from-gray-800/70 to-gray-900/50 rounded-xl border border-gray-600/50"
                  >
                    <div className="p-3 bg-gradient-to-br from-yellow-600/20 to-yellow-500/20 rounded-xl border border-yellow-500/30">
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-white mb-2">
                        {milestone.name}
                      </h5>
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="professional-badge badge-excellence font-bold">
                          +{milestone.points} points
                        </span>
                        <span className="text-gray-400 font-medium">
                          {new Date(milestone.achieved_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Executive Competency Tier Display */}
              <div className="executive-card bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-lg font-semibold text-white mb-2">
                        Executive Competency Tier
                      </h5>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Strategic business intelligence methodology mastery
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400 mb-1 animate-level-badge-advancement">
                        {data.progressSummary.currentLevel}
                      </div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Tier Classification
                      </div>
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