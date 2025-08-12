import React, { useState, useEffect } from 'react';
import { useWorkflowProgress } from '../../hooks/useWorkflowProgress';

// Hidden achievement system disguised as professional milestones
const PROFESSIONAL_MILESTONES = {
  // Foundation Milestones (Early achievements to build engagement)
  FIRST_ANALYSIS: {
    id: 'first_analysis',
    title: 'Methodology Initiation',
    description: 'Successfully completed your first customer analysis',
    icon: '🎯',
    points: 100,
    category: 'Foundation',
    requirement: 'Complete 1 ICP Analysis',
    color: 'from-blue-600 to-blue-500'
  },
  
  ACCURACY_THRESHOLD: {
    id: 'accuracy_threshold',
    title: 'Precision Specialist',
    description: 'Achieved 80%+ accuracy in customer profiling',
    icon: '🎪',
    points: 150,
    category: 'Proficiency',
    requirement: 'Complete ICP Analysis with 80%+ score',
    color: 'from-green-600 to-green-500'
  },

  // Engagement Milestones (Usage-based achievements)
  COST_MASTER: {
    id: 'cost_master',
    title: 'Financial Impact Analyst',
    description: 'Mastered revenue impact calculation methodologies',
    icon: '📊',
    points: 200,
    category: 'Expertise',
    requirement: 'Complete 3 Cost Calculator analyses',
    color: 'from-purple-600 to-purple-500'
  },

  HIGH_VALUE_IDENTIFIER: {
    id: 'high_value_identifier',
    title: 'Strategic Value Recognition',
    description: 'Identified high-impact revenue opportunities ($100K+)',
    icon: '💎',
    points: 250,
    category: 'Strategic',
    requirement: 'Identify $100K+ annual cost impact',
    color: 'from-yellow-600 to-yellow-500'
  },

  // Communication Milestones
  BUSINESS_CASE_ARCHITECT: {
    id: 'business_case_architect',
    title: 'Strategic Communications Expert',
    description: 'Developed comprehensive business case frameworks',
    icon: '🏗️',
    points: 300,
    category: 'Communication',
    requirement: 'Complete 2 Business Case developments',
    color: 'from-red-600 to-red-500'
  },

  // Productivity Milestones (Speed bonuses)
  EFFICIENCY_EXPERT: {
    id: 'efficiency_expert',
    title: 'Process Optimization Specialist',
    description: 'Demonstrated exceptional analysis efficiency',
    icon: '⚡',
    points: 175,
    category: 'Efficiency',
    requirement: 'Complete analysis in under 5 minutes',
    color: 'from-cyan-600 to-cyan-500'
  },

  // Sharing/Export Milestones (Engagement depth)
  KNOWLEDGE_SHARER: {
    id: 'knowledge_sharer',
    title: 'Strategic Insights Communicator',
    description: 'Actively sharing strategic analyses with stakeholders',
    icon: '📤',
    points: 125,
    category: 'Collaboration',
    requirement: 'Export 5 strategic analyses',
    color: 'from-indigo-600 to-indigo-500'
  },

  // Mastery Milestones (Long-term engagement)
  COMPLETE_STRATEGIST: {
    id: 'complete_strategist',
    title: 'Comprehensive Business Strategist',
    description: 'Mastered all core business analysis methodologies',
    icon: '👑',
    points: 500,
    category: 'Mastery',
    requirement: 'Complete full workflow 3 times',
    color: 'from-gradient-to-r from-yellow-400 via-red-500 to-pink-500'
  },

  // Weekly/Monthly Milestones (Retention mechanics)
  CONSISTENT_ANALYST: {
    id: 'consistent_analyst',
    title: 'Dedicated Professional Development',
    description: 'Consistent engagement with business analysis tools',
    icon: '📅',
    points: 200,
    category: 'Consistency',
    requirement: 'Use platform 5 days in a row',
    color: 'from-teal-600 to-teal-500'
  }
};

const ProfessionalMilestones = ({ customerId, className = '' }) => {
  const { workflowProgress, usageAnalytics } = useWorkflowProgress(customerId);
  const [milestones, setMilestones] = useState({});
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Check milestone completion based on user progress
  useEffect(() => {
    if (!workflowProgress || !usageAnalytics) return;

    const currentMilestones = { ...milestones };
    const newAchievements = [];

    // Check each milestone requirement
    Object.entries(PROFESSIONAL_MILESTONES).forEach(([key, milestone]) => {
      if (currentMilestones[milestone.id]?.achieved) return; // Already achieved

      let achieved = false;

      switch (milestone.id) {
        case 'first_analysis':
          achieved = workflowProgress.icp_completed;
          break;

        case 'accuracy_threshold':
          achieved = workflowProgress.icp_completed && (workflowProgress.icp_score || 0) >= 80;
          break;

        case 'cost_master':
          const costCompletions = usageAnalytics.tools_completed?.filter(tool => tool === 'cost').length || 0;
          achieved = costCompletions >= 3;
          break;

        case 'high_value_identifier':
          achieved = workflowProgress.cost_calculated && (workflowProgress.annual_cost || 0) >= 100000;
          break;

        case 'business_case_architect':
          const businessCompletions = usageAnalytics.tools_completed?.filter(tool => tool === 'business_case').length || 0;
          achieved = businessCompletions >= 2;
          break;

        case 'efficiency_expert':
          // Check if any tool was completed in under 5 minutes (300 seconds)
          const timePerTool = usageAnalytics.time_per_tool || {};
          achieved = Object.values(timePerTool).some(time => time < 300);
          break;

        case 'knowledge_sharer':
          achieved = (usageAnalytics.export_count || 0) >= 5;
          break;

        case 'complete_strategist':
          const allToolsCompleted = workflowProgress.icp_completed && 
                                   workflowProgress.cost_calculated && 
                                   workflowProgress.business_case_ready;
          // Simplified check - in reality, would track multiple completions
          achieved = allToolsCompleted && (usageAnalytics.tools_completed?.length || 0) >= 9;
          break;

        case 'consistent_analyst':
          // Simplified consistency check - would need more sophisticated tracking
          achieved = (usageAnalytics.tools_completed?.length || 0) >= 5;
          break;
      }

      if (achieved) {
        currentMilestones[milestone.id] = {
          ...milestone,
          achieved: true,
          achievedAt: new Date().toISOString()
        };
        newAchievements.push(milestone);
      } else {
        // Track progress towards milestone
        currentMilestones[milestone.id] = {
          ...milestone,
          achieved: false,
          progress: calculateMilestoneProgress(milestone.id)
        };
      }
    });

    // Show achievement notification
    if (newAchievements.length > 0) {
      setCurrentAchievement(newAchievements[0]);
      setShowAchievement(true);
      setRecentAchievements(prev => [...newAchievements, ...prev].slice(0, 5));
      
      setTimeout(() => setShowAchievement(false), 4000);
    }

    setMilestones(currentMilestones);
  }, [workflowProgress, usageAnalytics]);

  const calculateMilestoneProgress = (milestoneId) => {
    if (!workflowProgress || !usageAnalytics) return 0;

    switch (milestoneId) {
      case 'first_analysis':
        return workflowProgress.icp_completed ? 100 : 0;

      case 'accuracy_threshold':
        return workflowProgress.icp_completed ? Math.min((workflowProgress.icp_score || 0) / 80 * 100, 100) : 0;

      case 'cost_master':
        const costCompletions = usageAnalytics.tools_completed?.filter(tool => tool === 'cost').length || 0;
        return Math.min((costCompletions / 3) * 100, 100);

      case 'high_value_identifier':
        if (!workflowProgress.cost_calculated) return 0;
        return Math.min(((workflowProgress.annual_cost || 0) / 100000) * 100, 100);

      case 'knowledge_sharer':
        return Math.min(((usageAnalytics.export_count || 0) / 5) * 100, 100);

      default:
        return 0;
    }
  };

  const getAchievedMilestones = () => {
    return Object.values(milestones).filter(m => m.achieved);
  };

  const getTotalMilestonePoints = () => {
    return getAchievedMilestones().reduce((total, milestone) => total + milestone.points, 0);
  };

  const MilestoneCard = ({ milestone, achieved = false, progress = 0 }) => (
    <div className={`relative overflow-hidden rounded-lg border p-4 transition-all duration-300 ${
      achieved 
        ? 'bg-gray-800 border-gray-600 shadow-lg' 
        : 'bg-gray-900 border-gray-700 opacity-80'
    }`}>
      
      {/* Achievement glow effect */}
      {achieved && (
        <div className={`absolute inset-0 bg-gradient-to-r ${milestone.color} opacity-10`}></div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`text-2xl p-2 rounded-lg ${
              achieved 
                ? `bg-gradient-to-r ${milestone.color}` 
                : 'bg-gray-700 grayscale'
            }`}>
              {milestone.icon}
            </div>
            <div>
              <h3 className={`font-semibold ${achieved ? 'text-white' : 'text-gray-400'}`}>
                {milestone.title}
              </h3>
              <p className={`text-sm ${achieved ? 'text-gray-300' : 'text-gray-500'}`}>
                {milestone.description}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              achieved 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {achieved ? 'Achieved' : `${Math.round(progress)}%`}
            </div>
            <p className="text-xs text-gray-500 mt-1">{milestone.points} points</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-gray-400">
            <span className="font-medium">{milestone.category}</span> • {milestone.requirement}
          </div>
          
          {!achieved && progress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${milestone.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {achieved && (
            <div className="flex items-center space-x-2 text-sm text-green-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Milestone achieved</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Achievement Notification */}
      {showAchievement && currentAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`bg-gradient-to-r ${currentAchievement.color} text-white px-6 py-4 rounded-lg shadow-2xl border border-yellow-400 max-w-sm`}>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{currentAchievement.icon}</div>
              <div>
                <div className="font-bold text-lg">Professional Milestone!</div>
                <div className="font-semibold">{currentAchievement.title}</div>
                <div className="text-sm opacity-90 mt-1">{currentAchievement.description}</div>
                <div className="text-xs opacity-75 mt-2">+{currentAchievement.points} Progress Points</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Milestones Dashboard */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Professional Milestones</h2>
            <p className="text-gray-400">Track your achievement in business analysis methodologies</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {getAchievedMilestones().length}/{Object.keys(PROFESSIONAL_MILESTONES).length}
            </div>
            <div className="text-sm text-gray-400">Milestones Achieved</div>
          </div>
        </div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
            <h3 className="text-sm font-semibold text-white mb-3">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {recentAchievements.slice(0, 3).map((achievement, index) => (
                <div key={index} className={`flex items-center space-x-2 px-3 py-2 rounded-full bg-gradient-to-r ${achievement.color} text-white text-sm`}>
                  <span>{achievement.icon}</span>
                  <span>{achievement.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestone Categories */}
        <div className="grid gap-4">
          {Object.values(milestones).map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              achieved={milestone.achieved}
              progress={milestone.progress || 0}
            />
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {getTotalMilestonePoints()}
              </div>
              <div className="text-sm text-gray-400">Total Points Earned</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {Math.round((getAchievedMilestones().length / Object.keys(PROFESSIONAL_MILESTONES).length) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {Object.values(milestones).filter(m => !m.achieved && m.progress > 50).length}
              </div>
              <div className="text-sm text-gray-400">Near Completion</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalMilestones;