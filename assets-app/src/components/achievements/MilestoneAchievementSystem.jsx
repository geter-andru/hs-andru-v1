/**
 * Milestone Achievement System - Phase 3
 * 
 * Professional recognition system with achievement tracking and milestone celebration
 * Uses business terminology and professional development framework
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, Trophy, Star, Target, TrendingUp, BarChart3,
  CheckCircle, Clock, Zap, Users, Brain, DollarSign,
  Calendar, ExternalLink, Download, Share2, Sparkles
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';

const MilestoneAchievementSystem = ({ 
  competencyData, 
  completedActions = [],
  className = '' 
}) => {
  const [achievements, setAchievements] = useState([]);
  const [newAchievements, setNewAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Professional achievement categories
  const achievementCategories = [
    {
      id: 'competency',
      name: 'Competency Milestones',
      description: 'Professional skill development achievements',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'engagement',
      name: 'Platform Engagement',
      description: 'Learning platform utilization achievements',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'execution',
      name: 'Real-World Execution',
      description: 'Business activity and results achievements',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'leadership',
      name: 'Professional Leadership',
      description: 'Advanced professional development achievements',
      icon: Award,
      color: 'yellow'
    }
  ];

  // Comprehensive achievement definitions
  const achievementDefinitions = [
    // Competency Milestones
    {
      id: 'first_assessment',
      category: 'competency',
      name: 'Professional Baseline Established',
      description: 'Completed initial competency assessment',
      icon: CheckCircle,
      points: 50,
      rarity: 'common',
      requirements: 'Complete baseline assessment',
      unlockCondition: (data) => data.hasBaselineAssessment
    },
    {
      id: 'customer_analysis_proficient',
      category: 'competency',
      name: 'Customer Intelligence Proficient',
      description: 'Achieved 70+ points in Customer Analysis',
      icon: Target,
      points: 100,
      rarity: 'uncommon',
      requirements: 'Reach 70+ Customer Analysis score',
      unlockCondition: (data) => data.currentCustomerAnalysis >= 70
    },
    {
      id: 'value_communication_proficient',
      category: 'competency',
      name: 'Value Communication Proficient',
      description: 'Achieved 70+ points in Value Communication',
      icon: TrendingUp,
      points: 100,
      rarity: 'uncommon',
      requirements: 'Reach 70+ Value Communication score',
      unlockCondition: (data) => data.currentValueCommunication >= 70
    },
    {
      id: 'sales_execution_proficient',
      category: 'competency',
      name: 'Sales Execution Proficient',
      description: 'Achieved 70+ points in Sales Execution',
      icon: BarChart3,
      points: 100,
      rarity: 'uncommon',
      requirements: 'Reach 70+ Sales Execution score',
      unlockCondition: (data) => data.currentSalesExecution >= 70
    },
    {
      id: 'triple_proficiency',
      category: 'competency',
      name: 'Triple Competency Master',
      description: 'Achieved 70+ in all three competency areas',
      icon: Trophy,
      points: 500,
      rarity: 'rare',
      requirements: 'Reach 70+ in all competency areas',
      unlockCondition: (data) => 
        data.currentCustomerAnalysis >= 70 && 
        data.currentValueCommunication >= 70 && 
        data.currentSalesExecution >= 70
    },

    // Platform Engagement
    {
      id: 'first_steps',
      category: 'engagement',
      name: 'First Steps Taken',
      description: 'Completed first platform interaction',
      icon: Star,
      points: 25,
      rarity: 'common',
      requirements: 'Complete any platform section',
      unlockCondition: (data) => data.totalProgressPoints > 0
    },
    {
      id: 'content_explorer',
      category: 'engagement',
      name: 'Content Explorer',
      description: 'Viewed all sections in a comprehensive framework',
      icon: Brain,
      points: 75,
      rarity: 'uncommon',
      requirements: 'Complete all sections in a deep-dive modal',
      unlockCondition: (data) => data.sectionsViewed?.length >= 5
    },
    {
      id: 'point_accumulator',
      category: 'engagement',
      name: 'Point Accumulator',
      description: 'Earned 1,000+ progress points',
      icon: Zap,
      points: 150,
      rarity: 'uncommon',
      requirements: 'Accumulate 1,000 progress points',
      unlockCondition: (data) => data.totalProgressPoints >= 1000
    },
    {
      id: 'dedicated_learner',
      category: 'engagement',
      name: 'Dedicated Professional',
      description: 'Earned 5,000+ progress points',
      icon: Award,
      points: 300,
      rarity: 'rare',
      requirements: 'Accumulate 5,000 progress points',
      unlockCondition: (data) => data.totalProgressPoints >= 5000
    },

    // Real-World Execution
    {
      id: 'first_action',
      category: 'execution',
      name: 'First Action Recorded',
      description: 'Logged first real-world business activity',
      icon: CheckCircle,
      points: 50,
      rarity: 'common',
      requirements: 'Log your first real-world action',
      unlockCondition: (data, actions) => actions.length > 0
    },
    {
      id: 'consistent_executor',
      category: 'execution',
      name: 'Consistent Executor',
      description: 'Logged 10+ real-world business activities',
      icon: Calendar,
      points: 200,
      rarity: 'uncommon',
      requirements: 'Log 10 real-world actions',
      unlockCondition: (data, actions) => actions.length >= 10
    },
    {
      id: 'high_impact_achiever',
      category: 'execution',
      name: 'High Impact Achiever',
      description: 'Completed 5+ high-impact business activities',
      icon: TrendingUp,
      points: 250,
      rarity: 'rare',
      requirements: 'Complete 5 high-impact actions',
      unlockCondition: (data, actions) => 
        actions.filter(a => a.impact === 'high' || a.impact === 'critical').length >= 5
    },
    {
      id: 'deal_closer',
      category: 'execution',
      name: 'Deal Closure Specialist',
      description: 'Successfully closed business opportunities',
      icon: DollarSign,
      points: 500,
      rarity: 'epic',
      requirements: 'Record deal closure activities',
      unlockCondition: (data, actions) => 
        actions.some(a => a.type === 'deal_closure')
    },

    // Professional Leadership
    {
      id: 'methodology_unlock',
      category: 'leadership',
      name: 'Methodology Specialist',
      description: 'Unlocked advanced professional methodologies',
      icon: ExternalLink,
      points: 200,
      rarity: 'uncommon',
      requirements: 'Unlock 2+ advanced tools',
      unlockCondition: (data) => {
        const unlocked = Object.values(data.toolUnlockStates || {}).filter(Boolean);
        return unlocked.length >= 2;
      }
    },
    {
      id: 'level_advancement',
      category: 'leadership',
      name: 'Professional Advancement',
      description: 'Advanced to higher professional level',
      icon: Trophy,
      points: 300,
      rarity: 'rare',
      requirements: 'Advance beyond Foundation level',
      unlockCondition: (data) => {
        const level = assessmentService.calculateProfessionalLevel(data.totalProgressPoints);
        return level.id !== 'foundation';
      }
    },
    {
      id: 'expertise_demonstration',
      category: 'leadership',
      name: 'Expertise Demonstration',
      description: 'Demonstrated expertise across multiple domains',
      icon: Brain,
      points: 500,
      rarity: 'epic',
      requirements: 'Excellence in platform engagement and real-world execution',
      unlockCondition: (data, actions) => 
        data.totalProgressPoints >= 2500 && actions.length >= 5
    },
    {
      id: 'revenue_intelligence_master',
      category: 'leadership',
      name: 'Revenue Intelligence Master',
      description: 'Achieved master-level revenue intelligence expertise',
      icon: Award,
      points: 1000,
      rarity: 'legendary',
      requirements: 'Reach Revenue Intelligence Master level',
      unlockCondition: (data) => {
        const level = assessmentService.calculateProfessionalLevel(data.totalProgressPoints);
        return level.id === 'master';
      }
    }
  ];

  // Rarity styling
  const rarityStyles = {
    common: { color: 'gray', glow: 'shadow-gray-500/20' },
    uncommon: { color: 'green', glow: 'shadow-green-500/20' },
    rare: { color: 'blue', glow: 'shadow-blue-500/20' },
    epic: { color: 'purple', glow: 'shadow-purple-500/20' },
    legendary: { color: 'yellow', glow: 'shadow-yellow-500/30' }
  };

  // Check for new achievements
  const checkAchievements = useCallback(() => {
    const currentAchievementIds = achievements.map(a => a.id);
    const newlyUnlocked = [];

    achievementDefinitions.forEach(achievement => {
      if (!currentAchievementIds.includes(achievement.id)) {
        if (achievement.unlockCondition(competencyData, completedActions)) {
          newlyUnlocked.push({
            ...achievement,
            unlockedAt: new Date().toISOString()
          });
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
      setAchievements(prev => [...prev, ...newlyUnlocked]);
      setShowCelebration(true);
    }
  }, [competencyData, completedActions, achievements]);

  // Check achievements when data changes
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Close celebration modal
  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setNewAchievements([]);
  };

  // Filter achievements by category
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  });

  // Calculate statistics
  const stats = {
    totalAchievements: achievements.length,
    totalBonusPoints: achievements.reduce((sum, a) => sum + a.points, 0),
    byRarity: achievements.reduce((acc, a) => {
      acc[a.rarity] = (acc[a.rarity] || 0) + 1;
      return acc;
    }, {}),
    recentAchievements: achievements.filter(a => {
      const achievementDate = new Date(a.unlockedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return achievementDate >= weekAgo;
    }).length
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Statistics */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Professional Achievements
            </h3>
            <p className="text-gray-400">
              Recognition for your professional development milestones and business accomplishments
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div className="text-right">
              <div className="text-lg font-bold text-white">{stats.totalAchievements}</div>
              <div className="text-xs text-gray-500">Achievements</div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">{stats.totalBonusPoints}</div>
            <div className="text-sm text-gray-400">Bonus Points</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{stats.byRarity.rare || 0}</div>
            <div className="text-sm text-gray-400">Rare+</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{stats.recentAchievements}</div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {Math.round((stats.totalAchievements / achievementDefinitions.length) * 100)}%
            </div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Achievements
        </button>
        
        {achievementCategories.map(category => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive 
                  ? `bg-${category.color}-600 text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievementDefinitions.map(achievement => {
          const isUnlocked = achievements.some(a => a.id === achievement.id);
          const rarity = rarityStyles[achievement.rarity];
          const Icon = achievement.icon;
          const category = achievementCategories.find(c => c.id === achievement.category);
          
          // Show only if category matches filter or filter is 'all'
          if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
            return null;
          }

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative p-6 rounded-lg border transition-all ${
                isUnlocked 
                  ? `bg-${rarity.color}-900/20 border-${rarity.color}-500/50 ${rarity.glow}` 
                  : 'bg-gray-900 border-gray-700 opacity-60'
              }`}
            >
              {/* Rarity Indicator */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                isUnlocked 
                  ? `bg-${rarity.color}-600 text-white` 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {achievement.rarity}
              </div>

              {/* Achievement Icon and Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isUnlocked 
                    ? `bg-${rarity.color}-600` 
                    : 'bg-gray-700'
                }`}>
                  <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} />
                </div>
                
                <div className="flex-1">
                  <h4 className={`font-medium mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                    {achievement.description}
                  </p>
                </div>
              </div>

              {/* Points and Category */}
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category?.name}
                </div>
                <div className={`font-bold ${
                  isUnlocked ? `text-${rarity.color}-400` : 'text-gray-600'
                }`}>
                  +{achievement.points} pts
                </div>
              </div>

              {/* Requirements */}
              <div className={`mt-3 text-xs ${isUnlocked ? 'text-green-400' : 'text-gray-600'}`}>
                {isUnlocked ? '✓ Completed' : achievement.requirements}
              </div>

              {/* Unlocked Status */}
              {isUnlocked && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-3 left-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && newAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseCelebration}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-yellow-500/50 rounded-lg max-w-md w-full p-8 text-center shadow-2xl shadow-yellow-500/20"
            >
              {/* Celebration Header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Professional Achievement!</h3>
                <p className="text-gray-400">
                  You've reached a new milestone in your professional development
                </p>
              </motion.div>

              {/* New Achievements */}
              <div className="space-y-4 mb-6">
                {newAchievements.map((achievement, index) => {
                  const rarity = rarityStyles[achievement.rarity];
                  const Icon = achievement.icon;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-4 rounded-lg bg-${rarity.color}-900/20 border border-${rarity.color}-500/50`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-6 h-6 text-${rarity.color}-400`} />
                        <div className="text-left">
                          <div className="font-medium text-white">{achievement.name}</div>
                          <div className="text-sm text-gray-400">{achievement.description}</div>
                          <div className={`text-sm font-bold text-${rarity.color}-400`}>
                            +{achievement.points} bonus points
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseCelebration}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors"
              >
                Continue Professional Journey
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MilestoneAchievementSystem;