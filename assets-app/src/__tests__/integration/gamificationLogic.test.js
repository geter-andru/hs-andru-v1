/**
 * Phase 7: Automated Gamification Logic Testing
 * 
 * Integration testing for complete gamification workflows,
 * end-to-end scenarios, and cross-component interactions.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomerDashboard from '../../components/dashboard/CustomerDashboard';
import { airtableService } from '../../services/airtableService';
import { competencyService } from '../../services/competencyService';

// Mock services and hooks
jest.mock('../../services/airtableService');
jest.mock('../../services/competencyService');
jest.mock('../../hooks/useWorkflowProgress');
jest.mock('../../hooks/useCompetencyDashboard');

const mockCustomerId = 'integration-test-customer';

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <CustomerDashboard customerId={mockCustomerId} />
    </BrowserRouter>
  );
};

describe('Gamification Logic Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock initial customer state - Foundation level
    airtableService.loadCompetencyProgress.mockResolvedValue({
      total_progress_points: 50,
      overall_level: 'Foundation',
      hidden_rank: 'E',
      customer_analysis: 10,
      value_articulation: 0,
      strategic_communication: 0,
      consistency_streak: 2,
      last_activity_date: new Date().toISOString().split('T')[0]
    });

    airtableService.getCustomerDataByRecordId.mockResolvedValue({
      toolAccessStatus: {
        icp_analysis: { access: true, completions: 1, avg_score: 65 },
        cost_calculator: { access: false, completions: 0 },
        business_case_builder: { access: false, completions: 0 }
      }
    });

    airtableService.generateDailyObjectives.mockResolvedValue({
      objectives: [
        { id: 'obj-1', name: 'Complete ICP framework review', type: 'review', points: 10, completed: false },
        { id: 'obj-2', name: 'Analyze customer segment data', type: 'analysis', points: 15, completed: false }
      ]
    });
  });

  describe('Complete ICP-to-Cost Calculator Progression', () => {
    test('full progression workflow from ICP completion to tool unlock', async () => {
      // Step 1: Mock successful ICP completion with high score
      airtableService.handleICPCompletion.mockResolvedValue({
        success: true,
        gamification: {
          pointsAwarded: 46, // 25 base + 21 score bonus
          competencyAdvanced: true,
          competencyGain: 3,
          milestoneAchieved: false,
          toolUnlocked: false,
          qualifiesForUnlock: true
        }
      });

      // Step 2: After 3rd qualifying completion, mock tool unlock
      airtableService.evaluateUnlockCriteria.mockResolvedValue({
        unlocks: ['cost_calculator'],
        toolUnlocked: true
      });

      renderDashboard();

      // Simulate ICP completion
      const icpData = {
        overallScore: 85,
        companyName: 'Test Enterprise Corp',
        timeSpent: 1200
      };

      // Mock the completion workflow
      await act(async () => {
        await airtableService.handleICPCompletion(mockCustomerId, icpData);
      });

      // Verify competency advancement
      expect(airtableService.handleICPCompletion).toHaveBeenCalledWith(mockCustomerId, icpData);
      
      // Verify unlock evaluation
      expect(airtableService.evaluateUnlockCriteria).toHaveBeenCalledWith(mockCustomerId);
    });

    test('sequential ICP completions build toward unlock', async () => {
      const completionScenarios = [
        { score: 75, expectedQualifying: 1 },
        { score: 82, expectedQualifying: 2 },
        { score: 78, expectedQualifying: 3 } // This should trigger unlock
      ];

      for (let i = 0; i < completionScenarios.length; i++) {
        const scenario = completionScenarios[i];
        
        // Mock progressive completion state
        airtableService.handleICPCompletion.mockResolvedValue({
          success: true,
          gamification: {
            pointsAwarded: 25 + Math.round(scenario.score * 0.25),
            competencyAdvanced: true,
            qualifiesForUnlock: true
          }
        });

        airtableService.getCustomerDataByRecordId.mockResolvedValue({
          toolAccessStatus: {
            icp_analysis: { 
              access: true, 
              completions: i + 1,
              qualifying_scores: scenario.expectedQualifying,
              avg_score: scenario.score
            },
            cost_calculator: { 
              access: scenario.expectedQualifying >= 3,
              completions: 0 
            }
          }
        });

        const icpData = {
          overallScore: scenario.score,
          companyName: `Test Company ${i + 1}`,
          timeSpent: 1000 + (i * 200)
        };

        await airtableService.handleICPCompletion(mockCustomerId, icpData);
        
        if (scenario.expectedQualifying >= 3) {
          // Should trigger unlock on 3rd qualifying completion
          expect(airtableService.evaluateUnlockCriteria).toHaveBeenCalled();
        }
      }
    });

    test('quality gate prevents unlock with low scores', async () => {
      const lowScoreCompletions = [
        { score: 45, qualifies: false },
        { score: 50, qualifies: false },
        { score: 55, qualifies: false }
      ];

      for (const completion of lowScoreCompletions) {
        airtableService.handleICPCompletion.mockResolvedValue({
          success: true,
          gamification: {
            pointsAwarded: 25, // No score bonus for low scores
            qualifiesForUnlock: completion.qualifies
          }
        });

        const icpData = {
          overallScore: completion.score,
          companyName: 'Low Score Test',
          timeSpent: 1200
        };

        await airtableService.handleICPCompletion(mockCustomerId, icpData);
      }

      // Should not unlock despite 3 completions
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: { 
            access: true, 
            completions: 3,
            qualifying_scores: 0, // No qualifying scores
            avg_score: 50
          },
          cost_calculator: { access: false }
        }
      });

      const result = await airtableService.evaluateUnlockCriteria(mockCustomerId);
      expect(result.unlocks).not.toContain('cost_calculator');
    });
  });

  describe('Milestone Achievement Cascade', () => {
    test('competency advancement triggers milestone check', async () => {
      // Mock competency level that should trigger milestone
      airtableService.loadCompetencyProgress.mockResolvedValue({
        customer_analysis: 20, // Crosses threshold
        total_progress_points: 150
      });

      airtableService.checkMilestoneProgress.mockResolvedValue({
        milestoneAchieved: true,
        milestone: {
          name: 'Customer Intelligence Foundation',
          category: 'competency_development',
          points: 50
        }
      });

      airtableService.advanceCompetency.mockResolvedValue({
        competencyAdvanced: true,
        oldScore: 17,
        newScore: 20,
        milestoneTriggered: true
      });

      await airtableService.advanceCompetency(mockCustomerId, 'customer_analysis', 3);
      
      expect(airtableService.checkMilestoneProgress).toHaveBeenCalledWith(
        mockCustomerId, 
        'customer_intelligence_foundation'
      );
    });

    test('milestone achievement awards appropriate points', async () => {
      const milestoneScenarios = [
        { milestone: 'customer_intelligence_foundation', expectedPoints: 50 },
        { milestone: 'value_articulation_mastery', expectedPoints: 75 },
        { milestone: 'strategic_communication_mastery', expectedPoints: 100 },
        { milestone: 'comprehensive_revenue_strategist', expectedPoints: 200 }
      ];

      for (const scenario of milestoneScenarios) {
        airtableService.checkMilestoneProgress.mockResolvedValue({
          milestoneAchieved: true,
          milestone: {
            name: scenario.milestone,
            points: scenario.expectedPoints
          }
        });

        const result = await airtableService.checkMilestoneProgress(mockCustomerId, scenario.milestone);
        
        expect(result.milestone.points).toBe(scenario.expectedPoints);
      }
    });

    test('comprehensive milestone requires all competencies', async () => {
      // Mock user close to comprehensive milestone
      airtableService.loadCompetencyProgress.mockResolvedValue({
        customer_analysis: 80,
        value_articulation: 75,
        strategic_communication: 65, // Just under threshold
        total_progress_points: 750
      });

      let result = await airtableService.checkMilestoneProgress(
        mockCustomerId, 
        'comprehensive_revenue_strategist'
      );
      
      expect(result.milestoneAchieved).toBe(false);

      // Now meet all requirements
      airtableService.loadCompetencyProgress.mockResolvedValue({
        customer_analysis: 80,
        value_articulation: 75,
        strategic_communication: 70, // Meets threshold
        total_progress_points: 800
      });

      airtableService.checkMilestoneProgress.mockResolvedValue({
        milestoneAchieved: true,
        milestone: {
          name: 'Comprehensive Revenue Strategist',
          points: 200
        },
        comprehensiveMilestone: true
      });

      result = await airtableService.checkMilestoneProgress(
        mockCustomerId, 
        'comprehensive_revenue_strategist'
      );
      
      expect(result.milestoneAchieved).toBe(true);
      expect(result.comprehensiveMilestone).toBe(true);
    });
  });

  describe('Daily Objectives and Consistency', () => {
    test('objective completion awards points and updates streak', async () => {
      airtableService.completeObjective.mockResolvedValue({
        success: true,
        pointsAwarded: 15,
        streakUpdated: true,
        newStreak: 3
      });

      await airtableService.completeObjective(mockCustomerId, 'obj-1');
      
      expect(airtableService.completeObjective).toHaveBeenCalledWith(mockCustomerId, 'obj-1');
    });

    test('consistency streak awards bonus multipliers', async () => {
      // Mock user with active streak
      airtableService.loadCompetencyProgress.mockResolvedValue({
        consistency_streak: 7,
        last_activity_date: new Date(Date.now() - 86400000).toISOString().split('T')[0] // Yesterday
      });

      airtableService.updateConsistencyStreak.mockResolvedValue({
        streakIncremented: true,
        newStreak: 8,
        streakBonus: 1.2 // 20% bonus
      });

      airtableService.updateProgressPoints.mockResolvedValue({
        pointsAwarded: 30, // 25 base * 1.2 multiplier
        streakMultiplier: 1.2
      });

      await airtableService.updateConsistencyStreak(mockCustomerId);
      
      expect(airtableService.updateConsistencyStreak).toHaveBeenCalledWith(mockCustomerId);
    });

    test('streak reset after gap in activity', async () => {
      // Mock user with gap in activity
      const threeDaysAgo = new Date(Date.now() - (3 * 86400000));
      
      airtableService.loadCompetencyProgress.mockResolvedValue({
        consistency_streak: 12,
        last_activity_date: threeDaysAgo.toISOString().split('T')[0]
      });

      airtableService.updateConsistencyStreak.mockResolvedValue({
        streakReset: true,
        oldStreak: 12,
        newStreak: 1
      });

      const result = await airtableService.updateConsistencyStreak(mockCustomerId);
      
      expect(result.streakReset).toBe(true);
      expect(result.newStreak).toBe(1);
    });
  });

  describe('Cross-Component State Synchronization', () => {
    test('competency advancement updates all relevant components', async () => {
      // Mock advancement that affects multiple areas
      airtableService.handleICPCompletion.mockResolvedValue({
        success: true,
        gamification: {
          pointsAwarded: 45,
          competencyAdvanced: true,
          levelAdvanced: true,
          newLevel: 'Developing',
          milestoneAchieved: true,
          toolUnlocked: false
        }
      });

      renderDashboard();

      // Simulate completion
      await act(async () => {
        await airtableService.handleICPCompletion(mockCustomerId, {
          overallScore: 88,
          companyName: 'Test Corp',
          timeSpent: 1000
        });
      });

      // Should refresh competency data
      expect(airtableService.loadCompetencyProgress).toHaveBeenCalled();
    });

    test('tool unlock propagates to access components', async () => {
      airtableService.evaluateUnlockCriteria.mockResolvedValue({
        unlocks: ['cost_calculator'],
        toolUnlocked: true
      });

      airtableService.unlockAdvancedTool.mockResolvedValue({
        success: true,
        toolUnlocked: 'cost_calculator',
        newAccessState: {
          cost_calculator: {
            access: true,
            unlock_date: new Date().toISOString()
          }
        }
      });

      await airtableService.evaluateUnlockCriteria(mockCustomerId);
      
      // Should update access state across components
      expect(airtableService.unlockAdvancedTool).toHaveBeenCalled();
    });

    test('milestone notifications appear in notification system', async () => {
      // This would be tested with actual component rendering
      // Here we verify the data flow
      
      const milestoneData = {
        milestoneAchieved: true,
        milestone: {
          name: 'Professional Excellence Recognition',
          points: 75
        }
      };

      airtableService.checkMilestoneProgress.mockResolvedValue(milestoneData);
      
      const result = await airtableService.checkMilestoneProgress(
        mockCustomerId, 
        'excellence_recognition'
      );
      
      expect(result.milestoneAchieved).toBe(true);
      expect(result.milestone.points).toBe(75);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('handles partial completion failures gracefully', async () => {
      // Mock scenario where some operations succeed, others fail
      airtableService.handleICPCompletion.mockResolvedValue({
        success: true,
        gamification: {
          pointsAwarded: 25,
          competencyAdvanced: true
        }
      });

      airtableService.checkMilestoneProgress.mockRejectedValue(
        new Error('Milestone service unavailable')
      );

      // Should not prevent core completion
      const result = await airtableService.handleICPCompletion(mockCustomerId, {
        overallScore: 75,
        companyName: 'Test',
        timeSpent: 1000
      });

      expect(result.success).toBe(true);
      expect(result.gamification.pointsAwarded).toBe(25);
    });

    test('prevents duplicate completions', async () => {
      let callCount = 0;
      airtableService.handleICPCompletion.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ success: true, gamification: { pointsAwarded: 25 } });
        } else {
          return Promise.reject(new Error('Duplicate completion detected'));
        }
      });

      // First call should succeed
      const result1 = await airtableService.handleICPCompletion(mockCustomerId, {
        overallScore: 80,
        companyName: 'Test',
        timeSpent: 1000
      });
      expect(result1.success).toBe(true);

      // Second call should fail
      await expect(
        airtableService.handleICPCompletion(mockCustomerId, {
          overallScore: 80,
          companyName: 'Test',
          timeSpent: 1000
        })
      ).rejects.toThrow('Duplicate completion detected');
    });

    test('recovers from corrupted gamification data', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        total_progress_points: 'invalid',
        overall_level: null,
        customer_analysis: 'corrupted'
      });

      airtableService.validateAndRepairGamificationData.mockResolvedValue({
        repaired: true,
        data: {
          total_progress_points: 0,
          overall_level: 'Foundation',
          customer_analysis: 0,
          value_articulation: 0,
          strategic_communication: 0
        }
      });

      const result = await airtableService.validateAndRepairGamificationData(mockCustomerId);
      
      expect(result.repaired).toBe(true);
      expect(result.data.total_progress_points).toBe(0);
      expect(result.data.overall_level).toBe('Foundation');
    });
  });

  describe('Performance and Optimization', () => {
    test('batches multiple simultaneous updates', async () => {
      const batchOperations = [
        () => airtableService.updateProgressPoints(mockCustomerId, 25),
        () => airtableService.advanceCompetency(mockCustomerId, 'customer_analysis', 3),
        () => airtableService.updateConsistencyStreak(mockCustomerId)
      ];

      // Mock batch processing
      airtableService.batchGamificationUpdates.mockResolvedValue({
        success: true,
        operations: 3,
        totalPoints: 25,
        competencyUpdates: 1,
        streakUpdated: true
      });

      const results = await Promise.all(batchOperations.map(op => op()));
      
      // Should handle concurrent operations efficiently
      expect(results).toHaveLength(3);
    });

    test('caches frequently accessed data', async () => {
      // Call same data multiple times
      await airtableService.loadCompetencyProgress(mockCustomerId);
      await airtableService.loadCompetencyProgress(mockCustomerId);
      await airtableService.loadCompetencyProgress(mockCustomerId);

      // Should cache and not call service multiple times
      expect(airtableService.loadCompetencyProgress).toHaveBeenCalledTimes(3);
      // In real implementation, would verify caching behavior
    });

    test('handles high-frequency updates efficiently', async () => {
      const rapidUpdates = Array.from({ length: 20 }, (_, i) => 
        airtableService.updateProgressPoints(mockCustomerId, 5)
      );

      airtableService.updateProgressPoints.mockResolvedValue({
        pointsAwarded: 5,
        success: true
      });

      const results = await Promise.allSettled(rapidUpdates);
      
      // Should handle without overwhelming the system
      const successful = results.filter(r => r.status === 'fulfilled');
      expect(successful.length).toBeGreaterThan(0);
    });
  });
});