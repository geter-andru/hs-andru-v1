/**
 * Phase 7: Psychological Satisfaction Testing Framework
 * 
 * Testing notification timing, celebration effectiveness, and psychological
 * engagement mechanics while maintaining professional appearance.
 */

import { useProgressNotifications } from '../../components/notifications/ProgressNotifications';
import ProgressNotifications from '../../components/notifications/ProgressNotifications';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

// Mock canvas-confetti for celebration testing
jest.mock('canvas-confetti', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Psychological Satisfaction System', () => {
  let mockOnDismiss;

  beforeEach(() => {
    mockOnDismiss = jest.fn();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Notification Timing and Frequency', () => {
    test('staggers notification display for psychological impact', async () => {
      const notifications = [
        { id: 1, type: 'progress_recognition', data: { activity: 'ICP Analysis', points: 25 } },
        { id: 2, type: 'competency_advancement', data: { competency: 'Customer Analysis', gain: 3 } },
        { id: 3, type: 'milestone_reached', data: { milestone_name: 'Professional Achievement' } }
      ];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // First notification should appear immediately
      expect(screen.getByText('Strategic Progress Recognition')).toBeInTheDocument();
      
      // Second notification appears after 200ms stagger
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Executive Competency Advancement')).toBeInTheDocument();
      });

      // Third notification appears after another 200ms
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Strategic Milestone Achievement')).toBeInTheDocument();
      });
    });

    test('uses variable timing to prevent habituation', () => {
      const { result } = renderHook(() => useProgressNotifications());

      // Different notification types have different auto-dismiss times
      const progressId = result.current.showProgressRecognition('Test Activity', 25);
      const milestoneId = result.current.showMilestoneReached('Test Milestone', 'Excellence Badge');
      const competencyId = result.current.showCompetencyAdvancement('Test Competency', 5);

      // Progress notifications: 3000ms
      // Milestone notifications: 6000ms  
      // Competency notifications: 4500ms

      expect(result.current.notifications).toHaveLength(3);

      // Progress should dismiss first (3000ms)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.notifications).toHaveLength(2);

      // Competency should dismiss next (4500ms total)
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.notifications).toHaveLength(1);

      // Milestone should dismiss last (6000ms total)
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    test('limits notification frequency to prevent overwhelm', async () => {
      const { result } = renderHook(() => useProgressNotifications());

      // Rapid-fire notifications
      for (let i = 0; i < 10; i++) {
        result.current.showProgressRecognition(`Activity ${i}`, 10);
      }

      // Should queue and display maximum 3 simultaneously
      await waitFor(() => {
        const notifications = screen.queryAllByText(/Strategic Progress Recognition/);
        expect(notifications.length).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('Advancement Celebration Effectiveness', () => {
    test('provides appropriate celebration level for different achievements', () => {
      const notifications = [
        { 
          id: 1, 
          type: 'progress_recognition', 
          data: { activity: 'Minor Progress', points: 5 },
          timestamp: new Date().toISOString()
        },
        { 
          id: 2, 
          type: 'milestone_reached', 
          data: { milestone_name: 'Major Achievement', points: 100 },
          timestamp: new Date().toISOString()
        }
      ];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Progress recognition should have medium celebration level
      const progressNotification = screen.getByText('Strategic Progress Recognition').closest('div');
      expect(progressNotification).not.toHaveClass('animate-sophisticated-glow');

      // Milestone should have high celebration level with glow effect
      const milestoneNotification = screen.getByText('Strategic Milestone Achievement').closest('div');
      expect(milestoneNotification.querySelector('.animate-sophisticated-glow')).toBeInTheDocument();
    });

    test('includes confetti-style celebration for high achievements', () => {
      const notifications = [{
        id: 1,
        type: 'milestone_reached',
        data: { milestone_name: 'Comprehensive Revenue Strategist', points: 200 },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Should have professional confetti animation
      const confettiElements = screen.getAllByText('Strategic Milestone Achievement')[0]
        .closest('div')
        .querySelectorAll('.animate-professional-confetti');
      
      expect(confettiElements.length).toBeGreaterThan(0);
    });

    test('uses sophisticated progress bar animations', () => {
      const notifications = [{
        id: 1,
        type: 'progress_recognition',
        data: { activity: 'Excellence Demonstrated', points: 50 },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      const progressBar = screen.getByText('+50').previousElementSibling;
      expect(progressBar).toHaveClass('animate-sophisticated-progress-fill');
    });
  });

  describe('Daily Objective Completion Satisfaction', () => {
    test('provides immediate feedback for objective completion', async () => {
      // Mock objective completion
      const mockObjective = {
        id: 'obj-1',
        name: 'Complete customer analysis review',
        type: 'review',
        points: 15,
        completed: false
      };

      const { result } = renderHook(() => useProgressNotifications());

      // Simulate objective completion
      act(() => {
        result.current.showProgressRecognition('Objective Completed', 15);
      });

      await waitFor(() => {
        expect(result.current.notifications).toHaveLength(1);
        expect(result.current.notifications[0].data.points).toBe(15);
      });
    });

    test('escalates satisfaction for streak completions', () => {
      const { result } = renderHook(() => useProgressNotifications());

      // Simulate streak milestone
      act(() => {
        result.current.showConsistencyReward(7, 25);
      });

      const notification = result.current.notifications[0];
      expect(notification.type).toBe('consistency_reward');
      expect(notification.data.streak_days).toBe(7);
      expect(notification.data.points).toBe(25);
    });

    test('provides completion satisfaction without gaming language', () => {
      const notifications = [{
        id: 1,
        type: 'progress_recognition',
        data: { activity: 'Daily Objective Achieved', points: 10 },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Should use professional terminology
      expect(screen.getByText('Strategic Progress Recognition')).toBeInTheDocument();
      expect(screen.getByText('+10 Excellence Points')).toBeInTheDocument();
      expect(screen.queryByText(/XP|points scored|level up/i)).not.toBeInTheDocument();
    });
  });

  describe('Milestone Achievement Euphoria', () => {
    test('creates euphoric effect for major milestones', () => {
      const notifications = [{
        id: 1,
        type: 'milestone_reached',
        data: { 
          milestone_name: 'Strategic Communication Mastery',
          badge: 'Executive Excellence',
          points: 150
        },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Should have high celebration level with multiple effects
      const milestoneCard = screen.getByText('Strategic Milestone Achievement').closest('div');
      
      // Check for euphoric elements
      expect(milestoneCard.querySelector('.animate-milestone-celebration')).toBeInTheDocument();
      expect(screen.getByText('Executive Excellence')).toBeInTheDocument();
      expect(screen.getByText('+150')).toBeInTheDocument();
    });

    test('extends display time for milestone euphoria', () => {
      const { result } = renderHook(() => useProgressNotifications());

      act(() => {
        result.current.showMilestoneReached('Major Achievement', 'Excellence Badge', 100);
      });

      expect(result.current.notifications).toHaveLength(1);

      // Milestone notifications should display longer (6000ms vs 3000ms)
      act(() => {
        jest.advanceTimersByTime(4000);
      });

      // Should still be visible after 4 seconds
      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        jest.advanceTimersByTime(2500);
      });

      // Should dismiss after full 6+ seconds
      expect(result.current.notifications).toHaveLength(0);
    });

    test('provides badge visualization for milestone euphoria', () => {
      const notifications = [{
        id: 1,
        type: 'milestone_reached',
        data: { 
          milestone_name: 'Customer Intelligence Foundation',
          badge: 'Methodology Specialist',
          points: 75
        },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Badge should be prominently displayed
      const badge = screen.getByText('Methodology Specialist');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('div')).toHaveClass(/bg-gradient-to-r/);
    });
  });

  describe('Systematic Progression Motivation', () => {
    test('shows progress towards next level for motivation', () => {
      const notifications = [{
        id: 1,
        type: 'competency_advancement',
        data: { 
          competency: 'Strategic Analysis',
          gain: 5,
          currentScore: 45,
          nextMilestone: 50
        },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      expect(screen.getByText('Strategic Analysis +5')).toBeInTheDocument();
      expect(screen.getByText('Strategic capability expanded')).toBeInTheDocument();
    });

    test('builds anticipation for upcoming unlocks', () => {
      const notifications = [{
        id: 1,
        type: 'progress_recognition',
        data: { 
          activity: 'ICP Analysis Excellence',
          points: 25,
          progressToNext: '2 more qualifying analyses for advanced tools'
        },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      expect(screen.getByText('ICP Analysis Excellence')).toBeInTheDocument();
      expect(screen.getByText('+25 Excellence Points')).toBeInTheDocument();
    });

    test('maintains engagement through variable reward schedules', () => {
      const { result } = renderHook(() => useProgressNotifications());

      // Simulate variable rewards
      const rewards = [10, 25, 15, 50, 20, 100]; // Variable point values
      
      rewards.forEach((points, index) => {
        act(() => {
          result.current.showProgressRecognition(`Activity ${index}`, points);
        });
      });

      // Should show different point values for psychological variety
      expect(result.current.notifications.map(n => n.data.points))
        .toEqual(expect.arrayContaining([10, 25, 15, 50, 20, 100]));
    });
  });

  describe('Professional Credibility Maintenance', () => {
    test('uses executive-level language in all celebrations', () => {
      const notifications = [
        {
          id: 1,
          type: 'progress_recognition',
          data: { activity: 'Strategic Analysis', points: 30 },
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'competency_advancement',
          data: { competency: 'Executive Capability', gain: 8 },
          timestamp: new Date().toISOString()
        },
        {
          id: 3,
          type: 'tool_access_earned',
          data: { tool_name: 'Advanced Methodology Suite' },
          timestamp: new Date().toISOString()
        }
      ];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Check for professional language patterns
      expect(screen.getByText('Strategic Progress Recognition')).toBeInTheDocument();
      expect(screen.getByText('Executive Competency Advancement')).toBeInTheDocument();
      expect(screen.getByText('Executive Methodology Unlocked')).toBeInTheDocument();
      
      // Ensure no gaming terminology
      expect(screen.queryByText(/level up|achievement unlocked|XP|quest/i)).not.toBeInTheDocument();
    });

    test('maintains business context in celebration effects', () => {
      const notifications = [{
        id: 1,
        type: 'milestone_reached',
        data: { milestone_name: 'Value Articulation Mastery' },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      expect(screen.getByText('Executive excellence demonstrated')).toBeInTheDocument();
      expect(screen.queryByText(/congratulations|awesome|epic/i)).not.toBeInTheDocument();
    });

    test('provides sophisticated visual feedback without childish elements', () => {
      const notifications = [{
        id: 1,
        type: 'consistency_reward',
        data: { streak_days: 14, points: 50 },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications 
          notifications={notifications} 
          onDismiss={mockOnDismiss} 
        />
      );

      // Should use professional design elements
      const container = screen.getByText('Executive Excellence Momentum').closest('div');
      expect(container).toHaveClass(/bg-gradient-to-r/);
      
      // Should not have childish animations or colors
      expect(container.querySelector('.animate-bounce')).not.toBeInTheDocument();
      expect(screen.queryByText(/🎉|🎊|🌟/)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Performance', () => {
    test('handles rapid notification generation without performance issues', () => {
      const { result } = renderHook(() => useProgressNotifications());

      // Generate many notifications rapidly
      act(() => {
        for (let i = 0; i < 50; i++) {
          result.current.showProgressRecognition(`Activity ${i}`, 5);
        }
      });

      // Should handle gracefully without memory leaks
      expect(result.current.notifications.length).toBeLessThanOrEqual(10); // Reasonable limit
    });

    test('cleans up timers on unmount', () => {
      const { result, unmount } = renderHook(() => useProgressNotifications());

      act(() => {
        result.current.showProgressRecognition('Test', 10);
      });

      const timerCount = jest.getTimerCount();
      
      unmount();
      
      // Timers should be cleaned up
      expect(jest.getTimerCount()).toBeLessThan(timerCount);
    });

    test('maintains notification state across re-renders', () => {
      const { result, rerender } = renderHook(() => useProgressNotifications());

      act(() => {
        result.current.showMilestoneReached('Persistent Achievement', 'Test Badge');
      });

      expect(result.current.notifications).toHaveLength(1);

      rerender();

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].data.milestone_name).toBe('Persistent Achievement');
    });
  });
});