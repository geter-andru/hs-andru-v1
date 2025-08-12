/**
 * Phase 7: Competency System Testing Suite
 * 
 * Comprehensive testing for stealth gamification competency progression,
 * ensuring psychological mechanics work correctly while maintaining 
 * professional credibility.
 */

import { airtableService } from '../../services/airtableService';
import { competencyService } from '../../services/competencyService';
import { milestoneService } from '../../services/milestoneService';

// Mock Airtable service for controlled testing
jest.mock('../../services/airtableService');

describe('Competency Progression System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to clean state for each test
    airtableService.loadCompetencyProgress.mockResolvedValue({
      total_progress_points: 0,
      overall_level: 'Foundation',
      hidden_rank: 'E',
      customer_analysis: 5,
      value_articulation: 0,
      strategic_communication: 0
    });
  });

  describe('Progress Point Calculations', () => {
    test('calculates ICP completion points correctly with score bonus', async () => {
      const mockCompletionData = {
        score: 85,
        timeSpent: 1200, // 20 minutes
        companyName: 'Test Corp'
      };

      const result = await airtableService.handleICPCompletion('test-customer', mockCompletionData);
      
      // Base points (25) + score bonus (85 * 0.25 = 21.25 rounded to 21) = 46
      expect(result.gamification.pointsAwarded).toBe(46);
      expect(result.gamification.competencyAdvanced).toBe(true);
    });

    test('calculates cost calculator points with efficiency bonus', async () => {
      const mockCostData = {
        annualCost: 150000,
        timeSpent: 900 // 15 minutes (efficient)
      };

      const result = await airtableService.handleCostCalculatorCompletion('test-customer', mockCostData);
      
      // Base points (35) + efficiency bonus (5) = 40
      expect(result.gamification.pointsAwarded).toBe(40);
    });

    test('awards maximum points for business case with comprehensive template', async () => {
      const mockBusinessCaseData = {
        templateName: 'Full Implementation Business Case',
        timeSpent: 1800 // 30 minutes
      };

      const result = await airtableService.handleBusinessCaseCompletion('test-customer', mockBusinessCaseData);
      
      // Base points (50) + comprehensive bonus (25) = 75
      expect(result.gamification.pointsAwarded).toBe(75);
    });

    test('applies daily multiplier for consistent usage', async () => {
      // Mock customer with existing streak
      airtableService.loadCompetencyProgress.mockResolvedValue({
        total_progress_points: 100,
        consistency_streak: 3,
        last_activity_date: new Date().toISOString().split('T')[0]
      });

      const result = await airtableService.updateProgressPoints('test-customer', 25);
      
      // 25 base points * 1.15 streak multiplier = 28.75 rounded to 29
      expect(result.pointsAwarded).toBe(29);
    });
  });

  describe('Level Advancement Logic', () => {
    test('advances from Foundation to Developing at 100 points', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        total_progress_points: 95,
        overall_level: 'Foundation',
        hidden_rank: 'E'
      });

      const result = await airtableService.updateProgressPoints('test-customer', 10);
      
      expect(result.levelAdvanced).toBe(true);
      expect(result.newLevel).toBe('Developing');
      expect(result.newRank).toBe('D');
    });

    test('advances competency scores systematically', async () => {
      const result = await airtableService.advanceCompetency('test-customer', 'customer_analysis', 3);
      
      expect(result.competencyAdvanced).toBe(true);
      expect(result.oldScore).toBe(5);
      expect(result.newScore).toBe(8);
      expect(result.competencyName).toBe('Customer Analysis');
    });

    test('maintains competency score caps at maximum', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        customer_analysis: 95
      });

      const result = await airtableService.advanceCompetency('test-customer', 'customer_analysis', 10);
      
      expect(result.newScore).toBe(100); // Capped at maximum
      expect(result.masteryAchieved).toBe(true);
    });
  });

  describe('Professional Milestone Triggers', () => {
    test('triggers Customer Intelligence Foundation milestone', async () => {
      const result = await milestoneService.checkMilestoneProgress('test-customer', 'customer_intelligence_foundation');
      
      expect(result.milestoneAchieved).toBe(true);
      expect(result.milestone.name).toBe('Customer Intelligence Foundation');
      expect(result.milestone.category).toBe('competency_development');
      expect(result.milestone.points).toBe(50);
    });

    test('triggers Value Articulation Mastery with requirements', async () => {
      // Mock requirements met
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          cost_calculator: { completions: 3, total_value_calculated: 500000 }
        }
      });

      const result = await milestoneService.checkMilestoneProgress('test-customer', 'value_articulation_mastery');
      
      expect(result.milestoneAchieved).toBe(true);
      expect(result.milestone.points).toBe(75);
    });

    test('triggers Comprehensive Revenue Strategist ultimate milestone', async () => {
      // Mock all requirements met
      airtableService.loadCompetencyProgress.mockResolvedValue({
        customer_analysis: 80,
        value_articulation: 75,
        strategic_communication: 70,
        total_progress_points: 800
      });

      const result = await milestoneService.checkMilestoneProgress('test-customer', 'comprehensive_revenue_strategist');
      
      expect(result.milestoneAchieved).toBe(true);
      expect(result.milestone.points).toBe(200);
      expect(result.comprehensiveMilestone).toBe(true);
    });
  });

  describe('Tool Unlock Criteria Validation', () => {
    test('unlocks cost calculator after 3 qualifying ICP analyses', async () => {
      // Mock 3 high-scoring ICP completions
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: { 
            completions: 3, 
            avg_score: 78,
            qualifying_scores: 3 
          }
        }
      });

      const result = await airtableService.evaluateUnlockCriteria('test-customer');
      
      expect(result.unlocks).toContain('cost_calculator');
      expect(result.toolUnlocked).toBe(true);
    });

    test('requires quality scores, not just quantity for unlock', async () => {
      // Mock 3 low-scoring ICP completions
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: { 
            completions: 3, 
            avg_score: 45,
            qualifying_scores: 1 // Only 1 above threshold
          }
        }
      });

      const result = await airtableService.evaluateUnlockCriteria('test-customer');
      
      expect(result.unlocks).not.toContain('cost_calculator');
    });

    test('unlocks business case builder after 2 cost analyses', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          cost_calculator: { 
            access: true,
            completions: 2,
            total_value_calculated: 300000
          }
        }
      });

      const result = await airtableService.evaluateUnlockCriteria('test-customer');
      
      expect(result.unlocks).toContain('business_case_builder');
    });
  });

  describe('Consistency Streak Logic', () => {
    test('increments streak for consecutive daily usage', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      airtableService.loadCompetencyProgress.mockResolvedValue({
        consistency_streak: 5,
        last_activity_date: yesterday.toISOString().split('T')[0]
      });

      const result = await airtableService.updateConsistencyStreak('test-customer');
      
      expect(result.streakIncremented).toBe(true);
      expect(result.newStreak).toBe(6);
    });

    test('resets streak after gap in usage', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      airtableService.loadCompetencyProgress.mockResolvedValue({
        consistency_streak: 8,
        last_activity_date: threeDaysAgo.toISOString().split('T')[0]
      });

      const result = await airtableService.updateConsistencyStreak('test-customer');
      
      expect(result.streakReset).toBe(true);
      expect(result.newStreak).toBe(1);
    });

    test('awards streak milestone at 7 days', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        consistency_streak: 6,
        last_activity_date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      });

      const result = await airtableService.updateConsistencyStreak('test-customer');
      
      expect(result.newStreak).toBe(7);
      expect(result.milestoneAchieved).toBe(true);
      expect(result.milestone.name).toBe('Weekly Excellence Commitment');
    });
  });

  describe('Daily Objectives Generation', () => {
    test('generates appropriate objectives for Foundation level', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        overall_level: 'Foundation',
        customer_analysis: 15
      });

      const result = await airtableService.generateDailyObjectives('test-customer');
      
      expect(result.objectives).toHaveLength(3);
      expect(result.objectives[0].type).toBe('exploration');
      expect(result.objectives.every(obj => obj.points >= 5)).toBe(true);
    });

    test('generates advanced objectives for Proficient level', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        overall_level: 'Proficient',
        customer_analysis: 70,
        value_articulation: 65
      });

      const result = await airtableService.generateDailyObjectives('test-customer');
      
      expect(result.objectives.some(obj => obj.type === 'mastery')).toBe(true);
      expect(result.objectives.some(obj => obj.points >= 15)).toBe(true);
    });

    test('includes streak-based objectives for consistent users', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        overall_level: 'Developing',
        consistency_streak: 5
      });

      const result = await airtableService.generateDailyObjectives('test-customer');
      
      expect(result.objectives.some(obj => obj.name.includes('consistency'))).toBe(true);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles missing customer data gracefully', async () => {
      airtableService.loadCompetencyProgress.mockRejectedValue(new Error('Customer not found'));

      const result = await airtableService.handleICPCompletion('nonexistent-customer', {});
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Customer not found');
    });

    test('prevents negative progress points', async () => {
      const result = await airtableService.updateProgressPoints('test-customer', -50);
      
      expect(result.pointsAwarded).toBe(0);
      expect(result.error).toContain('Invalid points value');
    });

    test('handles concurrent completion attempts', async () => {
      const promise1 = airtableService.handleICPCompletion('test-customer', { score: 80 });
      const promise2 = airtableService.handleICPCompletion('test-customer', { score: 85 });

      const [result1, result2] = await Promise.allSettled([promise1, promise2]);
      
      // Only one should succeed, other should detect duplicate
      expect([result1.status, result2.status]).toContain('fulfilled');
      expect([result1.status, result2.status]).toContain('rejected');
    });

    test('recovers from corrupted gamification data', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        total_progress_points: 'invalid',
        overall_level: null
      });

      const result = await airtableService.validateAndRepairGamificationData('test-customer');
      
      expect(result.repaired).toBe(true);
      expect(result.data.total_progress_points).toBe(0);
      expect(result.data.overall_level).toBe('Foundation');
    });
  });
});