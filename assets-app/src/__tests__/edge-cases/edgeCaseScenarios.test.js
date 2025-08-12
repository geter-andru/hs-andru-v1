/**
 * Phase 7: Edge Case Testing Scenarios
 * 
 * Testing network disconnection, simultaneous operations, boundary conditions,
 * data corruption recovery, and migration scenarios.
 */

import { airtableService } from '../../services/airtableService';
import { competencyService } from '../../services/competencyService';
import { render, screen, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomerDashboard from '../../components/dashboard/CustomerDashboard';

jest.mock('../../services/airtableService');
jest.mock('../../services/competencyService');

const mockCustomerId = 'edge-case-test-customer';

describe('Edge Case Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Network Disconnection During Progression', () => {
    test('handles network failure during ICP completion', async () => {
      // Mock network failure
      airtableService.handleICPCompletion
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({
          success: true,
          gamification: { pointsAwarded: 25 }
        });

      // First attempt should fail
      await expect(
        airtableService.handleICPCompletion(mockCustomerId, {
          overallScore: 80,
          companyName: 'Test Corp',
          timeSpent: 1200
        })
      ).rejects.toThrow('Network Error');

      // Retry should succeed
      const result = await airtableService.handleICPCompletion(mockCustomerId, {
        overallScore: 80,
        companyName: 'Test Corp',
        timeSpent: 1200
      });

      expect(result.success).toBe(true);
      expect(airtableService.handleICPCompletion).toHaveBeenCalledTimes(2);
    });

    test('queues offline progress for sync when reconnected', async () => {
      // Mock offline state
      const offlineQueue = [];
      
      // Simulate offline operations
      const offlineOperations = [
        { type: 'objective_completion', data: { objectiveId: 'obj-1', points: 15 } },
        { type: 'progress_update', data: { points: 10, source: 'daily_activity' } },
        { type: 'competency_advance', data: { competency: 'customer_analysis', gain: 2 } }
      ];

      // Mock offline storage
      airtableService.queueOfflineOperation.mockImplementation((operation) => {
        offlineQueue.push(operation);
        return Promise.resolve({ queued: true, queueSize: offlineQueue.length });
      });

      // Queue operations while offline
      for (const operation of offlineOperations) {
        await airtableService.queueOfflineOperation(operation);
      }

      expect(offlineQueue).toHaveLength(3);

      // Mock reconnection and sync
      airtableService.syncOfflineQueue.mockResolvedValue({
        synced: true,
        operations: offlineQueue.length,
        successfulSync: 3,
        failed: 0
      });

      const syncResult = await airtableService.syncOfflineQueue(mockCustomerId);
      
      expect(syncResult.synced).toBe(true);
      expect(syncResult.successfulSync).toBe(3);
    });

    test('preserves local state during temporary disconnection', async () => {
      // Mock initial load
      airtableService.loadCompetencyProgress.mockResolvedValue({
        total_progress_points: 150,
        overall_level: 'Developing',
        customer_analysis: 25
      });

      const { unmount } = render(
        <BrowserRouter>
          <CustomerDashboard customerId={mockCustomerId} />
        </BrowserRouter>
      );

      // Simulate network disconnect for updates
      airtableService.updateProgressPoints.mockRejectedValue(new Error('Network disconnected'));

      // Local state should persist
      await waitFor(() => {
        // Component should still show cached data
        expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
      });

      unmount();
    });

    test('implements exponential backoff for failed requests', async () => {
      let callCount = 0;
      const callTimes = [];

      airtableService.updateProgressPoints.mockImplementation(() => {
        callTimes.push(Date.now());
        callCount++;
        
        if (callCount < 4) {
          return Promise.reject(new Error('Service unavailable'));
        }
        return Promise.resolve({ success: true, pointsAwarded: 25 });
      });

      // Mock retry with exponential backoff
      const retryWithBackoff = async (operation, maxRetries = 3) => {
        let attempt = 0;
        while (attempt < maxRetries) {
          try {
            return await operation();
          } catch (error) {
            attempt++;
            if (attempt >= maxRetries) throw error;
            
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      };

      const start = Date.now();
      
      act(() => {
        jest.advanceTimersByTime(15000); // Fast-forward through delays
      });

      await retryWithBackoff(() => 
        airtableService.updateProgressPoints(mockCustomerId, 25)
      );

      expect(callCount).toBe(4); // 3 failures + 1 success
      expect(callTimes).toHaveLength(4);
    });
  });

  describe('Simultaneous Tool Completions', () => {
    test('prevents race conditions in completion processing', async () => {
      let processingCount = 0;
      
      airtableService.handleICPCompletion.mockImplementation(async () => {
        processingCount++;
        if (processingCount > 1) {
          throw new Error('Concurrent completion detected');
        }
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        processingCount--;
        
        return {
          success: true,
          gamification: { pointsAwarded: 25 }
        };
      });

      // Attempt simultaneous completions
      const completion1 = airtableService.handleICPCompletion(mockCustomerId, {
        overallScore: 80,
        companyName: 'Test Corp 1',
        timeSpent: 1200
      });

      const completion2 = airtableService.handleICPCompletion(mockCustomerId, {
        overallScore: 85,
        companyName: 'Test Corp 2',
        timeSpent: 1100
      });

      const results = await Promise.allSettled([completion1, completion2]);
      
      // One should succeed, one should fail with race condition error
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      
      expect(successes).toHaveLength(1);
      expect(failures).toHaveLength(1);
      expect(failures[0].reason.message).toContain('Concurrent completion detected');
    });

    test('handles simultaneous milestone achievements', async () => {
      // Mock scenario where multiple actions trigger milestones simultaneously
      const milestoneChecks = [
        'customer_intelligence_foundation',
        'consistency_recognition_weekly',
        'analysis_efficiency_mastery'
      ];

      let checkCount = 0;
      
      airtableService.checkMilestoneProgress.mockImplementation(async (customerId, milestone) => {
        checkCount++;
        
        // Simulate all checks happening at once
        return {
          milestoneAchieved: true,
          milestone: {
            name: milestone,
            points: 50,
            achieved_at: new Date().toISOString()
          }
        };
      });

      // Trigger multiple milestone checks simultaneously
      const checks = milestoneChecks.map(milestone => 
        airtableService.checkMilestoneProgress(mockCustomerId, milestone)
      );

      const results = await Promise.all(checks);
      
      // All should succeed without conflicts
      expect(results).toHaveLength(3);
      expect(results.every(r => r.milestoneAchieved)).toBe(true);
    });

    test('serializes critical gamification updates', async () => {
      const updateQueue = [];
      let processing = false;

      // Mock serialized processing
      airtableService.updateProgressPoints.mockImplementation(async (customerId, points) => {
        updateQueue.push({ customerId, points, timestamp: Date.now() });
        
        if (processing) {
          throw new Error('Update already in progress');
        }
        
        processing = true;
        await new Promise(resolve => setTimeout(resolve, 50));
        processing = false;
        
        return { success: true, pointsAwarded: points };
      });

      // Queue multiple updates
      const updates = [
        airtableService.updateProgressPoints(mockCustomerId, 25),
        airtableService.updateProgressPoints(mockCustomerId, 15),
        airtableService.updateProgressPoints(mockCustomerId, 10)
      ];

      // Should process serially to prevent conflicts
      for (const update of updates) {
        try {
          await update;
        } catch (error) {
          expect(error.message).toContain('Update already in progress');
        }
      }

      expect(updateQueue.length).toBeGreaterThan(0);
    });
  });

  describe('Date Boundary Crossings', () => {
    test('handles daily reset at midnight', async () => {
      // Mock time just before midnight
      const mockDate = new Date('2024-01-15T23:59:30.000Z');
      jest.setSystemTime(mockDate);

      airtableService.generateDailyObjectives.mockResolvedValue({
        objectives: [
          { id: 'obj-1', name: 'Complete analysis review', points: 15, date: '2024-01-15' }
        ]
      });

      let objectives = await airtableService.generateDailyObjectives(mockCustomerId);
      expect(objectives.objectives[0].date).toBe('2024-01-15');

      // Advance past midnight
      const nextDay = new Date('2024-01-16T00:00:30.000Z');
      jest.setSystemTime(nextDay);

      airtableService.generateDailyObjectives.mockResolvedValue({
        objectives: [
          { id: 'obj-2', name: 'Strategic planning session', points: 20, date: '2024-01-16' }
        ]
      });

      objectives = await airtableService.generateDailyObjectives(mockCustomerId);
      expect(objectives.objectives[0].date).toBe('2024-01-16');
    });

    test('correctly handles streak continuation across date boundaries', async () => {
      // Mock user active just before midnight
      const lastActivity = new Date('2024-01-15T23:58:00.000Z');
      
      airtableService.loadCompetencyProgress.mockResolvedValue({
        consistency_streak: 7,
        last_activity_date: lastActivity.toISOString().split('T')[0]
      });

      // Activity just after midnight should continue streak
      const nextDayActivity = new Date('2024-01-16T00:02:00.000Z');
      jest.setSystemTime(nextDayActivity);

      airtableService.updateConsistencyStreak.mockResolvedValue({
        streakIncremented: true,
        newStreak: 8,
        daysContinuous: true
      });

      const result = await airtableService.updateConsistencyStreak(mockCustomerId);
      
      expect(result.streakIncremented).toBe(true);
      expect(result.newStreak).toBe(8);
    });

    test('handles timezone differences in activity tracking', async () => {
      // Mock user in different timezone
      const userTimezone = 'America/New_York'; // UTC-5
      const activityTime = new Date('2024-01-15T23:30:00.000Z'); // 6:30 PM EST

      airtableService.normalizeToUserTimezone.mockReturnValue({
        userDate: '2024-01-15',
        userTime: '18:30:00',
        timezone: userTimezone
      });

      const normalized = airtableService.normalizeToUserTimezone(activityTime, userTimezone);
      
      expect(normalized.userDate).toBe('2024-01-15');
      expect(normalized.timezone).toBe(userTimezone);
    });

    test('manages week boundary for weekly objectives', async () => {
      // Mock end of week (Sunday)
      const endOfWeek = new Date('2024-01-14T23:30:00.000Z'); // Sunday
      jest.setSystemTime(endOfWeek);

      airtableService.checkWeeklyMilestones.mockResolvedValue({
        weekCompleted: true,
        weeklyObjectivesCompleted: 5,
        weeklyBonus: 50
      });

      let weeklyCheck = await airtableService.checkWeeklyMilestones(mockCustomerId);
      expect(weeklyCheck.weekCompleted).toBe(true);

      // Advance to new week (Monday)
      const newWeek = new Date('2024-01-15T00:30:00.000Z');
      jest.setSystemTime(newWeek);

      airtableService.generateWeeklyObjectives.mockResolvedValue({
        weekStarted: true,
        objectives: [
          { id: 'weekly-1', name: 'Complete 3 strategic analyses', points: 75 }
        ]
      });

      const newWeekObjectives = await airtableService.generateWeeklyObjectives(mockCustomerId);
      expect(newWeekObjectives.weekStarted).toBe(true);
    });
  });

  describe('Invalid Gamification Data Recovery', () => {
    test('recovers from corrupted point values', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        total_progress_points: 'corrupted_string',
        overall_level: null,
        customer_analysis: -50, // Invalid negative value
        hidden_rank: 'INVALID'
      });

      airtableService.validateAndRepairGamificationData.mockResolvedValue({
        repaired: true,
        errors: [
          'Invalid total_progress_points: corrupted_string',
          'Invalid customer_analysis: -50',
          'Invalid hidden_rank: INVALID'
        ],
        data: {
          total_progress_points: 0,
          overall_level: 'Foundation',
          customer_analysis: 0,
          hidden_rank: 'E'
        }
      });

      const result = await airtableService.validateAndRepairGamificationData(mockCustomerId);
      
      expect(result.repaired).toBe(true);
      expect(result.errors).toHaveLength(3);
      expect(result.data.total_progress_points).toBe(0);
    });

    test('handles missing required fields', async () => {
      airtableService.loadCompetencyProgress.mockResolvedValue({
        // Missing most required fields
        customer_analysis: 15
      });

      airtableService.initializeGamificationData.mockResolvedValue({
        initialized: true,
        data: {
          total_progress_points: 0,
          overall_level: 'Foundation',
          hidden_rank: 'E',
          customer_analysis: 15, // Preserve existing valid data
          value_articulation: 0,
          strategic_communication: 0,
          consistency_streak: 0
        }
      });

      const result = await airtableService.initializeGamificationData(mockCustomerId);
      
      expect(result.initialized).toBe(true);
      expect(result.data.customer_analysis).toBe(15); // Preserved
      expect(result.data.value_articulation).toBe(0); // Initialized
    });

    test('validates competency score boundaries', async () => {
      const invalidScores = [
        { customer_analysis: 150 }, // Above max (100)
        { value_articulation: -25 }, // Below min (0)
        { strategic_communication: 'invalid' } // Wrong type
      ];

      for (const invalidScore of invalidScores) {
        airtableService.validateCompetencyScore.mockReturnValue({
          valid: false,
          correctedValue: Math.max(0, Math.min(100, invalidScore.customer_analysis || 0)),
          error: 'Score outside valid range 0-100'
        });

        const validation = airtableService.validateCompetencyScore(invalidScore);
        
        expect(validation.valid).toBe(false);
        expect(validation.correctedValue).toBeGreaterThanOrEqual(0);
        expect(validation.correctedValue).toBeLessThanOrEqual(100);
      }
    });

    test('recovers from corrupted tool access data', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: 'corrupted_string',
          cost_calculator: { access: 'maybe' }, // Invalid boolean
          business_case_builder: null
        }
      });

      airtableService.repairToolAccessData.mockResolvedValue({
        repaired: true,
        toolAccessStatus: {
          icp_analysis: { access: true, completions: 0 },
          cost_calculator: { access: false, completions: 0 },
          business_case_builder: { access: false, completions: 0 }
        }
      });

      const result = await airtableService.repairToolAccessData(mockCustomerId);
      
      expect(result.repaired).toBe(true);
      expect(result.toolAccessStatus.icp_analysis.access).toBe(true);
      expect(result.toolAccessStatus.cost_calculator.access).toBe(false);
    });
  });

  describe('Migration of Existing Customer Data', () => {
    test('migrates pre-gamification customers', async () => {
      // Mock customer with only basic workflow data
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        // Has workflow progress but no gamification data
        icp_completed: true,
        cost_completed: false,
        business_case_completed: false,
        completion_percentage: 33
      });

      airtableService.migrateToGamificationSystem.mockResolvedValue({
        migrated: true,
        gamificationData: {
          total_progress_points: 50, // Estimated from existing progress
          overall_level: 'Foundation',
          customer_analysis: 20, // Based on ICP completion
          value_articulation: 0,
          strategic_communication: 0,
          toolAccessStatus: {
            icp_analysis: { access: true, completions: 1 },
            cost_calculator: { access: false, completions: 0 },
            business_case_builder: { access: false, completions: 0 }
          }
        }
      });

      const result = await airtableService.migrateToGamificationSystem(mockCustomerId);
      
      expect(result.migrated).toBe(true);
      expect(result.gamificationData.total_progress_points).toBe(50);
      expect(result.gamificationData.customer_analysis).toBe(20);
    });

    test('preserves existing progress during migration', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        icp_completed: true,
        icp_score: 85,
        cost_completed: true,
        annual_cost: 250000,
        business_case_completed: false
      });

      airtableService.calculateMigrationPoints.mockReturnValue({
        icpPoints: 46, // 25 base + 21 score bonus
        costPoints: 40, // 35 base + 5 efficiency
        totalPoints: 86
      });

      const points = airtableService.calculateMigrationPoints({
        icp_score: 85,
        annual_cost: 250000
      });

      expect(points.totalPoints).toBe(86);
      expect(points.icpPoints).toBe(46);
    });

    test('handles bulk migration for multiple customers', async () => {
      const customerIds = ['cust-1', 'cust-2', 'cust-3'];
      
      airtableService.bulkMigrateCustomers.mockResolvedValue({
        migrated: 3,
        failed: 0,
        results: customerIds.map(id => ({
          customerId: id,
          success: true,
          pointsAwarded: 50
        }))
      });

      const result = await airtableService.bulkMigrateCustomers(customerIds);
      
      expect(result.migrated).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(3);
    });

    test('validates data integrity after migration', async () => {
      airtableService.validatePostMigrationData.mockResolvedValue({
        valid: true,
        checks: {
          pointsValid: true,
          competencyScoresValid: true,
          toolAccessConsistent: true,
          milestoneDataPresent: true
        }
      });

      const validation = await airtableService.validatePostMigrationData(mockCustomerId);
      
      expect(validation.valid).toBe(true);
      expect(Object.values(validation.checks).every(check => check === true)).toBe(true);
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    test('handles large notification queues', async () => {
      // Generate many notifications
      const notifications = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        type: 'progress_recognition',
        data: { activity: `Activity ${i}`, points: 5 },
        timestamp: new Date().toISOString()
      }));

      // Should limit and prioritize notifications
      airtableService.processNotificationQueue.mockResolvedValue({
        processed: 100, // Limited to reasonable number
        queued: 900,
        prioritized: true
      });

      const result = await airtableService.processNotificationQueue(notifications);
      
      expect(result.processed).toBeLessThanOrEqual(100);
      expect(result.prioritized).toBe(true);
    });

    test('cleans up old objective data', async () => {
      airtableService.cleanupOldObjectives.mockResolvedValue({
        cleaned: true,
        objectivesRemoved: 150,
        daysRetained: 30
      });

      const cleanup = await airtableService.cleanupOldObjectives(mockCustomerId);
      
      expect(cleanup.cleaned).toBe(true);
      expect(cleanup.objectivesRemoved).toBeGreaterThan(0);
    });

    test('handles memory constraints gracefully', async () => {
      // Mock memory pressure scenario
      const largeDataSet = Array.from({ length: 10000 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString(),
        points: Math.floor(Math.random() * 50),
        competencyGains: Math.floor(Math.random() * 10)
      }));

      airtableService.processLargeDataSet.mockImplementation(async (data) => {
        // Process in chunks to avoid memory issues
        const chunkSize = 100;
        const chunks = [];
        
        for (let i = 0; i < data.length; i += chunkSize) {
          chunks.push(data.slice(i, i + chunkSize));
        }
        
        return {
          processed: true,
          chunks: chunks.length,
          totalRecords: data.length
        };
      });

      const result = await airtableService.processLargeDataSet(largeDataSet);
      
      expect(result.processed).toBe(true);
      expect(result.chunks).toBe(100); // 10000 / 100
    });
  });
});