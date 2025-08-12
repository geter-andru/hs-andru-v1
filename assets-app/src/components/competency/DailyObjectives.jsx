import React, { useState, useEffect } from 'react';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';

// Daily objective system disguised as professional development goals
const DAILY_OBJECTIVES = {
  // Foundation objectives (new users)
  METHODOLOGY_EXPLORATION: {
    id: 'methodology_exploration',
    title: 'Business Methodology Exploration',
    description: 'Explore customer analysis methodologies',
    action: 'Complete 1 ICP analysis',
    points: 50,
    category: 'Foundation',
    icon: '🔍',
    color: 'from-blue-600 to-blue-500',
    type: 'completion'
  },

  STRATEGIC_PRACTICE: {
    id: 'strategic_practice',
    title: 'Strategic Analysis Practice',
    description: 'Practice comprehensive business analysis',
    action: 'Complete cost impact analysis',
    points: 75,
    category: 'Practice',
    icon: '📊',
    color: 'from-green-600 to-green-500',
    type: 'completion'
  },

  // Engagement objectives (retention mechanics)
  EFFICIENCY_FOCUS: {
    id: 'efficiency_focus',
    title: 'Process Efficiency Optimization',
    description: 'Demonstrate analytical efficiency',
    action: 'Complete any analysis in under 8 minutes',
    points: 60,
    category: 'Efficiency',
    icon: '⚡',
    color: 'from-yellow-600 to-yellow-500',
    type: 'speed'
  },

  QUALITY_EXCELLENCE: {
    id: 'quality_excellence',
    title: 'Quality Excellence Initiative',
    description: 'Maintain high-quality analysis standards',
    action: 'Achieve 75%+ accuracy in customer profiling',
    points: 80,
    category: 'Quality',
    icon: '🎯',
    color: 'from-purple-600 to-purple-500',
    type: 'score'
  },

  // Communication objectives (sharing mechanics)
  STRATEGIC_COMMUNICATION: {
    id: 'strategic_communication',
    title: 'Strategic Communication Excellence',
    description: 'Share insights with stakeholders',
    action: 'Export 1 strategic analysis',
    points: 40,
    category: 'Communication',
    icon: '📤',
    color: 'from-indigo-600 to-indigo-500',
    type: 'action'
  },

  // Advanced objectives (power users)
  COMPREHENSIVE_ANALYSIS: {
    id: 'comprehensive_analysis',
    title: 'Comprehensive Business Analysis',
    description: 'Complete full strategic workflow',
    action: 'Complete ICP + Cost + Business Case workflow',
    points: 150,
    category: 'Mastery',
    icon: '🏆',
    color: 'from-red-600 to-red-500',
    type: 'workflow'
  }
};

const DailyObjectives = ({ customerId, className = '' }) => {
  const { workflowProgress, usageAnalytics, updateWorkflowProgress } = useWorkflowProgress(customerId);
  const [todaysObjectives, setTodaysObjectives] = useState([]);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [totalPointsToday, setTotalPointsToday] = useState(0);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [lastCompletedObjective, setLastCompletedObjective] = useState(null);

  // Generate daily objectives based on user progress and history
  useEffect(() => {
    if (!workflowProgress || !usageAnalytics) return;

    const today = new Date().toDateString();
    const storedObjectives = localStorage.getItem(`dailyObjectives_${customerId}_${today}`);
    
    if (storedObjectives) {
      const parsed = JSON.parse(storedObjectives);
      setTodaysObjectives(parsed.objectives);
      setCompletedObjectives(parsed.completed || []);
      setTotalPointsToday(parsed.points || 0);
    } else {
      // Generate new objectives for today
      const newObjectives = generateDailyObjectives();
      setTodaysObjectives(newObjectives);
      setCompletedObjectives([]);
      setTotalPointsToday(0);
      
      // Store in localStorage
      localStorage.setItem(`dailyObjectives_${customerId}_${today}`, JSON.stringify({
        objectives: newObjectives,
        completed: [],
        points: 0
      }));
    }

    // Calculate streak
    calculateDailyStreak();
  }, [customerId, workflowProgress, usageAnalytics]);

  // Check objective completion
  useEffect(() => {
    if (!workflowProgress || !usageAnalytics || todaysObjectives.length === 0) return;

    const newCompletions = [];

    todaysObjectives.forEach(objective => {
      if (completedObjectives.includes(objective.id)) return;

      let completed = false;

      switch (objective.type) {
        case 'completion':
          if (objective.id === 'methodology_exploration') {
            completed = workflowProgress.icp_completed;
          } else if (objective.id === 'strategic_practice') {
            completed = workflowProgress.cost_calculated;
          }
          break;

        case 'speed':
          const timePerTool = usageAnalytics.time_per_tool || {};
          completed = Object.values(timePerTool).some(time => time < 480); // 8 minutes
          break;

        case 'score':
          completed = workflowProgress.icp_completed && (workflowProgress.icp_score || 0) >= 75;
          break;

        case 'action':
          completed = (usageAnalytics.export_count || 0) > 0;
          break;

        case 'workflow':
          completed = workflowProgress.icp_completed && 
                     workflowProgress.cost_calculated && 
                     workflowProgress.business_case_ready;
          break;
      }

      if (completed) {
        newCompletions.push(objective);
      }
    });

    if (newCompletions.length > 0) {
      const newCompleted = [...completedObjectives, ...newCompletions.map(obj => obj.id)];
      const newPoints = totalPointsToday + newCompletions.reduce((sum, obj) => sum + obj.points, 0);
      
      setCompletedObjectives(newCompleted);
      setTotalPointsToday(newPoints);
      setLastCompletedObjective(newCompletions[0]);
      setShowCompletionCelebration(true);
      
      setTimeout(() => setShowCompletionCelebration(false), 3000);

      // Update localStorage
      const today = new Date().toDateString();
      localStorage.setItem(`dailyObjectives_${customerId}_${today}`, JSON.stringify({
        objectives: todaysObjectives,
        completed: newCompleted,
        points: newPoints
      }));

      // Update streak if all objectives completed
      if (newCompleted.length === todaysObjectives.length) {
        updateDailyStreak();
      }
    }
  }, [workflowProgress, usageAnalytics, todaysObjectives, completedObjectives, totalPointsToday]);

  const generateDailyObjectives = () => {
    const userLevel = calculateUserLevel();
    const objectives = [];

    // Always include one foundation objective
    objectives.push(DAILY_OBJECTIVES.METHODOLOGY_EXPLORATION);

    // Add objectives based on user progression
    if (userLevel >= 1) {
      objectives.push(DAILY_OBJECTIVES.STRATEGIC_PRACTICE);
    }

    if (userLevel >= 2) {
      objectives.push(Math.random() > 0.5 ? DAILY_OBJECTIVES.EFFICIENCY_FOCUS : DAILY_OBJECTIVES.QUALITY_EXCELLENCE);
    }

    if (userLevel >= 3) {
      objectives.push(DAILY_OBJECTIVES.STRATEGIC_COMMUNICATION);
    }

    if (userLevel >= 4) {
      objectives.push(DAILY_OBJECTIVES.COMPREHENSIVE_ANALYSIS);
    }

    // Randomize 2-4 objectives per day
    return objectives.slice(0, Math.min(objectives.length, Math.max(2, Math.floor(Math.random() * 3) + 2)));
  };

  const calculateUserLevel = () => {
    if (!workflowProgress || !usageAnalytics) return 0;
    
    const toolsCompleted = usageAnalytics.tools_completed?.length || 0;
    const exportCount = usageAnalytics.export_count || 0;
    
    if (toolsCompleted >= 10 && exportCount >= 5) return 4; // Expert
    if (toolsCompleted >= 6 && exportCount >= 3) return 3; // Advanced
    if (toolsCompleted >= 3) return 2; // Intermediate
    if (toolsCompleted >= 1) return 1; // Beginner
    return 0; // New user
  };

  const calculateDailyStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      const stored = localStorage.getItem(`dailyObjectives_${customerId}_${dateStr}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.completed && parsed.completed.length === parsed.objectives.length) {
          streak = i;
        } else {
          break;
        }
      } else {
        break;
      }
    }
    
    setDailyStreak(streak);
  };

  const updateDailyStreak = () => {
    setDailyStreak(prev => prev + 1);
  };

  const getCompletionRate = () => {
    if (todaysObjectives.length === 0) return 0;
    return Math.round((completedObjectives.length / todaysObjectives.length) * 100);
  };

  const ObjectiveCard = ({ objective }) => {
    const isCompleted = completedObjectives.includes(objective.id);
    
    return (
      <div className={`relative overflow-hidden rounded-lg border p-4 transition-all duration-300 ${
        isCompleted 
          ? 'bg-gray-800 border-gray-600 shadow-lg' 
          : 'bg-gray-900 border-gray-700'
      }`}>
        
        {isCompleted && (
          <div className={`absolute inset-0 bg-gradient-to-r ${objective.color} opacity-10`}></div>
        )}

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`text-xl p-2 rounded-lg ${
                isCompleted 
                  ? `bg-gradient-to-r ${objective.color}` 
                  : 'bg-gray-700'
              }`}>
                {objective.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${isCompleted ? 'text-white' : 'text-gray-300'}`}>
                  {objective.title}
                </h3>
                <p className={`text-sm ${isCompleted ? 'text-gray-300' : 'text-gray-400'}`}>
                  {objective.description}
                </p>
              </div>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              isCompleted 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {isCompleted ? 'Complete' : '+' + objective.points}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-400">
              <span className="font-medium">{objective.category}</span> • {objective.action}
            </div>

            {isCompleted && (
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Objective achieved +{objective.points} points</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!workflowProgress) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Completion Celebration */}
      {showCompletionCelebration && lastCompletedObjective && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`bg-gradient-to-r ${lastCompletedObjective.color} text-white px-6 py-4 rounded-lg shadow-lg border border-yellow-400 max-w-sm`}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{lastCompletedObjective.icon}</div>
              <div>
                <div className="font-bold text-lg">Objective Achieved!</div>
                <div className="font-semibold">{lastCompletedObjective.title}</div>
                <div className="text-xs opacity-75 mt-2">+{lastCompletedObjective.points} Professional Points</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Professional Development Dashboard */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Daily Professional Development</h2>
            <p className="text-gray-400">Today's strategic development objectives</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">
              {getCompletionRate()}%
            </div>
            <div className="text-sm text-gray-400">Today's Progress</div>
          </div>
        </div>

        {/* Daily Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalPointsToday}</div>
            <div className="text-sm text-gray-400">Points Earned Today</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{completedObjectives.length}</div>
            <div className="text-sm text-gray-400">Objectives Complete</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{dailyStreak}</div>
            <div className="text-sm text-gray-400">Day Streak</div>
          </div>
        </div>

        {/* Daily Objectives */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Today's Development Objectives</h3>
          {todaysObjectives.map((objective) => (
            <ObjectiveCard key={objective.id} objective={objective} />
          ))}
        </div>

        {/* Progress Summary */}
        {completedObjectives.length === todaysObjectives.length && todaysObjectives.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-900 to-green-800 rounded-lg border border-green-700">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎉</div>
              <div>
                <h4 className="font-bold text-white">Daily Objectives Complete!</h4>
                <p className="text-green-200 text-sm">
                  Outstanding professional development today. All objectives achieved!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyObjectives;