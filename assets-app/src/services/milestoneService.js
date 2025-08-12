import { airtableService } from './airtableService';

/**
 * Professional Milestone Service
 * Tracks and manages professional development milestones with stealth gamification
 */
class MilestoneService {
  constructor() {
    // Professional milestone definitions with hidden Solo Leveling mechanics
    this.milestones = {
      // Foundation Milestones (Early engagement)
      customer_intelligence_foundation: {
        id: 'customer_intelligence_foundation',
        name: 'Customer Intelligence Foundation',
        description: 'Demonstrate systematic customer analysis capability',
        category: 'Foundation',
        icon: '🎯',
        requirement: { type: 'icp_completion', count: 1, minScore: null },
        reward: { 
          progressPoints: 50, 
          competencyGain: { type: 'customer_analysis', amount: 5 },
          badge: 'Foundation Analyst'
        },
        unlocks: 'Foundation competency recognition',
        hiddenRank: 'E'
      },

      systematic_analyzer: {
        id: 'systematic_analyzer',
        name: 'Systematic Analysis Excellence',
        description: 'Complete comprehensive customer intelligence development',
        category: 'Consistency',
        icon: '📊',
        requirement: { type: 'weekly_icp_analyses', count: 5, timeframe: 7 },
        reward: { 
          progressPoints: 150, 
          competencyGain: { type: 'customer_analysis', amount: 10 },
          badge: 'Systematic Professional'
        },
        unlocks: 'Advanced analysis templates',
        hiddenRank: 'D'
      },

      value_communication_specialist: {
        id: 'value_communication_specialist',
        name: 'Value Communication Specialist',
        description: 'Build compelling ROI models with exceptional returns',
        category: 'Excellence',
        icon: '💰',
        requirement: { type: 'roi_models', count: 3, minReturn: 150 },
        reward: { 
          progressPoints: 200, 
          competencyGain: { type: 'value_articulation', amount: 15 },
          badge: 'Value Expert'
        },
        unlocks: 'Executive communication templates',
        hiddenRank: 'C'
      },

      efficiency_expert: {
        id: 'efficiency_expert',
        name: 'Process Efficiency Expert',
        description: 'Complete full methodology workflow with exceptional efficiency',
        category: 'Performance',
        icon: '⚡',
        requirement: { type: 'workflow_speed', maxMinutes: 20 },
        reward: { 
          progressPoints: 175, 
          competencyGain: { type: 'process_efficiency', amount: 12 },
          badge: 'Efficiency Specialist'
        },
        unlocks: 'Rapid analysis frameworks',
        hiddenRank: 'C'
      },

      methodology_consistency: {
        id: 'methodology_consistency',
        name: 'Methodology Master',
        description: 'Maintain consistent professional development practice',
        category: 'Mastery',
        icon: '🏆',
        requirement: { type: 'consistency_streak', days: 30 },
        reward: { 
          progressPoints: 500, 
          competencyGain: { type: 'all', amount: 20 },
          badge: 'Methodology Authority'
        },
        unlocks: 'Master practitioner recognition',
        hiddenRank: 'B'
      },

      revenue_strategy_authority: {
        id: 'revenue_strategy_authority',
        name: 'Revenue Strategy Authority',
        description: 'Reach advanced competency in all professional domains',
        category: 'Authority',
        icon: '👑',
        requirement: { type: 'all_competencies_advanced', level: 'Advanced' },
        reward: { 
          progressPoints: 1000, 
          competencyGain: { type: 'all', amount: 30 },
          badge: 'Strategic Authority'
        },
        unlocks: 'Executive advisory capabilities',
        hiddenRank: 'A'
      },

      // Engagement Milestones
      daily_dedication: {
        id: 'daily_dedication',
        name: 'Daily Professional Development',
        description: 'Complete daily professional objectives',
        category: 'Engagement',
        icon: '📅',
        requirement: { type: 'daily_objectives', count: 7, consecutive: true },
        reward: { 
          progressPoints: 100, 
          competencyGain: { type: 'consistency', amount: 8 },
          badge: 'Dedicated Professional'
        },
        unlocks: 'Priority support access',
        hiddenRank: 'E'
      },

      comprehensive_strategist: {
        id: 'comprehensive_strategist',
        name: 'Comprehensive Business Strategist',
        description: 'Complete full strategic analysis workflow multiple times',
        category: 'Strategic',
        icon: '🎓',
        requirement: { type: 'full_workflow', count: 10 },
        reward: { 
          progressPoints: 350, 
          competencyGain: { type: 'strategic_thinking', amount: 25 },
          badge: 'Strategic Professional'
        },
        unlocks: 'Strategic advisory templates',
        hiddenRank: 'B'
      },

      value_multiplier: {
        id: 'value_multiplier',
        name: 'Value Multiplication Expert',
        description: 'Identify exceptional business value opportunities',
        category: 'Impact',
        icon: '📈',
        requirement: { type: 'total_value_identified', amount: 1000000 },
        reward: { 
          progressPoints: 400, 
          competencyGain: { type: 'value_identification', amount: 20 },
          badge: 'Value Authority'
        },
        unlocks: 'Enterprise value frameworks',
        hiddenRank: 'A'
      },

      knowledge_distributor: {
        id: 'knowledge_distributor',
        name: 'Strategic Knowledge Distributor',
        description: 'Share strategic insights with stakeholder community',
        category: 'Leadership',
        icon: '🌟',
        requirement: { type: 'exports_shared', count: 20 },
        reward: { 
          progressPoints: 250, 
          competencyGain: { type: 'leadership', amount: 15 },
          badge: 'Knowledge Leader'
        },
        unlocks: 'Leadership communication tools',
        hiddenRank: 'B'
      }
    };

    // Track milestone progress in memory (persisted to Airtable)
    this.userProgress = {};
    this.recentMilestones = [];
    this.activeStreaks = {};
  }

  /**
   * Initialize milestone tracking for a user
   */
  async initializeMilestones(recordId) {
    try {
      const customerData = await airtableService.getCustomerDataByRecordId(recordId);
      const analytics = customerData.usageAnalytics || {};
      
      // Load existing milestone progress
      this.userProgress = analytics.milestone_progress || {};
      this.recentMilestones = analytics.recent_milestones || [];
      this.activeStreaks = analytics.active_streaks || {};
      
      return {
        progress: this.userProgress,
        recent: this.recentMilestones,
        streaks: this.activeStreaks
      };
    } catch (error) {
      console.error('Error initializing milestones:', error);
      return {
        progress: {},
        recent: [],
        streaks: {}
      };
    }
  }

  /**
   * Check and update milestone progress based on user action
   */
  async checkMilestoneProgress(recordId, actionType, actionData) {
    const newlyAchieved = [];
    const progressUpdates = [];

    try {
      // Load current progress
      await this.initializeMilestones(recordId);

      // Check each milestone
      for (const [milestoneId, milestone] of Object.entries(this.milestones)) {
        // Skip if already achieved
        if (this.userProgress[milestoneId]?.achieved) continue;

        // Check if this action contributes to the milestone
        const progress = await this.evaluateMilestoneProgress(
          milestone,
          actionType,
          actionData,
          recordId
        );

        if (progress.contributed) {
          // Update progress
          if (!this.userProgress[milestoneId]) {
            this.userProgress[milestoneId] = {
              current: 0,
              required: progress.required,
              started: new Date().toISOString()
            };
          }

          this.userProgress[milestoneId].current = progress.current;
          this.userProgress[milestoneId].lastUpdate = new Date().toISOString();

          // Check if milestone achieved
          if (progress.current >= progress.required) {
            this.userProgress[milestoneId].achieved = true;
            this.userProgress[milestoneId].achievedAt = new Date().toISOString();
            
            newlyAchieved.push({
              milestone,
              progress: this.userProgress[milestoneId]
            });
          }

          progressUpdates.push({
            milestoneId,
            progress: this.userProgress[milestoneId]
          });
        }
      }

      // Persist progress to Airtable
      if (progressUpdates.length > 0 || newlyAchieved.length > 0) {
        await this.persistMilestoneProgress(recordId);
      }

      return {
        newlyAchieved,
        progressUpdates,
        totalProgress: this.calculateTotalProgress()
      };
    } catch (error) {
      console.error('Error checking milestone progress:', error);
      return {
        newlyAchieved: [],
        progressUpdates: [],
        totalProgress: 0
      };
    }
  }

  /**
   * Evaluate if an action contributes to a milestone
   */
  async evaluateMilestoneProgress(milestone, actionType, actionData, recordId) {
    const requirement = milestone.requirement;
    let contributed = false;
    let current = 0;
    let required = requirement.count || requirement.days || requirement.amount || 1;

    // Get current progress
    const currentProgress = this.userProgress[milestone.id]?.current || 0;

    switch (requirement.type) {
      case 'icp_completion':
        if (actionType === 'tool_completed' && actionData.tool === 'icp') {
          contributed = true;
          current = currentProgress + 1;
        }
        break;

      case 'weekly_icp_analyses':
        if (actionType === 'tool_completed' && actionData.tool === 'icp') {
          // Check weekly count
          const weeklyCount = await this.getWeeklyToolCount(recordId, 'icp');
          contributed = true;
          current = weeklyCount;
        }
        break;

      case 'roi_models':
        if (actionType === 'tool_completed' && actionData.tool === 'cost') {
          const roiReturn = this.calculateROI(actionData);
          if (roiReturn >= (requirement.minReturn || 0)) {
            contributed = true;
            current = currentProgress + 1;
          }
        }
        break;

      case 'workflow_speed':
        if (actionType === 'workflow_completed') {
          const duration = actionData.duration || Infinity;
          if (duration <= requirement.maxMinutes * 60) {
            contributed = true;
            current = 1; // Binary achievement
            required = 1;
          }
        }
        break;

      case 'consistency_streak':
        if (actionType === 'daily_activity') {
          const streak = await this.getConsistencyStreak(recordId);
          contributed = true;
          current = streak;
          required = requirement.days;
        }
        break;

      case 'all_competencies_advanced':
        if (actionType === 'competency_advanced') {
          const competencyLevels = await this.getCompetencyLevels(recordId);
          const allAdvanced = Object.values(competencyLevels).every(
            level => level === 'Advanced' || level === 'Expert' || level === 'Master'
          );
          if (allAdvanced) {
            contributed = true;
            current = 1;
            required = 1;
          }
        }
        break;

      case 'daily_objectives':
        if (actionType === 'daily_objectives_completed') {
          const consecutiveDays = await this.getConsecutiveDailyObjectives(recordId);
          contributed = true;
          current = consecutiveDays;
        }
        break;

      case 'full_workflow':
        if (actionType === 'workflow_completed' && actionData.complete) {
          contributed = true;
          current = currentProgress + 1;
        }
        break;

      case 'total_value_identified':
        if (actionType === 'tool_completed' && actionData.tool === 'cost') {
          const totalValue = await this.getTotalValueIdentified(recordId);
          contributed = true;
          current = totalValue;
          required = requirement.amount;
        }
        break;

      case 'exports_shared':
        if (actionType === 'export_created') {
          contributed = true;
          current = currentProgress + 1;
        }
        break;
    }

    return {
      contributed,
      current,
      required
    };
  }

  /**
   * Helper methods for milestone evaluation
   */
  async getWeeklyToolCount(recordId, toolName) {
    const customerData = await airtableService.getCustomerDataByRecordId(recordId);
    const completions = customerData.usageAnalytics?.tool_completions || [];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return completions.filter(c => 
      c.name === toolName && 
      new Date(c.timestamp) > weekAgo
    ).length;
  }

  calculateROI(actionData) {
    const cost = actionData.annualCost || 0;
    const investment = actionData.investment || 50000;
    return investment > 0 ? (cost / investment) * 100 : 0;
  }

  async getConsistencyStreak(recordId) {
    return this.activeStreaks.daily || 0;
  }

  async getCompetencyLevels(recordId) {
    const customerData = await airtableService.getCustomerDataByRecordId(recordId);
    return customerData.competencyLevels || {};
  }

  async getConsecutiveDailyObjectives(recordId) {
    return this.activeStreaks.dailyObjectives || 0;
  }

  async getTotalValueIdentified(recordId) {
    const customerData = await airtableService.getCustomerDataByRecordId(recordId);
    const completions = customerData.usageAnalytics?.tool_completions || [];
    
    return completions
      .filter(c => c.name === 'cost')
      .reduce((total, c) => total + (c.annual_cost || 0), 0);
  }

  /**
   * Calculate total milestone progress
   */
  calculateTotalProgress() {
    const total = Object.keys(this.milestones).length;
    const achieved = Object.values(this.userProgress).filter(p => p.achieved).length;
    return Math.round((achieved / total) * 100);
  }

  /**
   * Persist milestone progress to Airtable
   */
  async persistMilestoneProgress(recordId) {
    try {
      const analyticsUpdate = {
        milestone_progress: this.userProgress,
        recent_milestones: this.recentMilestones.slice(0, 10),
        active_streaks: this.activeStreaks,
        last_milestone_update: new Date().toISOString()
      };

      await airtableService.updateUsageAnalytics(recordId, analyticsUpdate);
      return true;
    } catch (error) {
      console.error('Error persisting milestone progress:', error);
      return false;
    }
  }

  /**
   * Get milestone leaderboard data (for social proof)
   */
  getMilestoneStats() {
    const stats = {
      totalAchieved: Object.values(this.userProgress).filter(p => p.achieved).length,
      totalAvailable: Object.keys(this.milestones).length,
      recentAchievements: this.recentMilestones.slice(0, 5),
      currentStreaks: this.activeStreaks,
      nextMilestones: this.getNextMilestones()
    };

    return stats;
  }

  /**
   * Get next achievable milestones
   */
  getNextMilestones() {
    return Object.entries(this.milestones)
      .filter(([id, milestone]) => !this.userProgress[id]?.achieved)
      .map(([id, milestone]) => ({
        ...milestone,
        progress: this.userProgress[id] || { current: 0, required: 1 }
      }))
      .sort((a, b) => {
        const aProgress = (a.progress.current / a.progress.required) || 0;
        const bProgress = (b.progress.current / b.progress.required) || 0;
        return bProgress - aProgress;
      })
      .slice(0, 3);
  }
}

export const milestoneService = new MilestoneService();