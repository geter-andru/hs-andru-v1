/**
 * Phase 7: Progressive Tool Access Testing Suite
 * 
 * Testing systematic tool unlocking, access validation, and persistence
 * of professional competency-based progression system.
 */

import { airtableService } from '../../services/airtableService';
import { competencyService } from '../../services/competencyService';
import ProgressiveToolAccess from '../../components/competency/ProgressiveToolAccess';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../services/airtableService');
jest.mock('../../services/competencyService');

const mockCustomerId = 'test-customer-123';

const renderProgressiveToolAccess = (props = {}) => {
  return render(
    <BrowserRouter>
      <ProgressiveToolAccess 
        customerId={mockCustomerId}
        {...props}
      />
    </BrowserRouter>
  );
};

describe('Progressive Tool Access System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock: Foundation level user with only ICP access
    airtableService.getCustomerDataByRecordId.mockResolvedValue({
      toolAccessStatus: {
        icp_analysis: { 
          access: true, 
          completions: 0,
          avg_score: 0 
        },
        cost_calculator: { 
          access: false, 
          completions: 0,
          unlock_progress: {
            qualifying_icp_scores: 0,
            required_scores: 3
          }
        },
        business_case_builder: { 
          access: false, 
          completions: 0,
          unlock_progress: {
            cost_analyses_completed: 0,
            required_analyses: 2
          }
        }
      }
    });

    competencyService.getToolAccessStatus.mockResolvedValue({
      'icp': { hasAccess: true },
      'cost-calculator': { hasAccess: false },
      'business-case': { hasAccess: false }
    });
  });

  describe('ICP Analysis Access (Always Available)', () => {
    test('displays ICP analysis as always available', async () => {
      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('ICP Analysis')).toBeInTheDocument();
        expect(screen.getByText('Always available')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
      });
    });

    test('tracks ICP completion progress correctly', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: { 
            access: true, 
            completions: 2,
            avg_score: 75,
            qualifying_scores: 2
          }
        }
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('2/3 qualifying ICP analyses completed')).toBeInTheDocument();
      });
    });

    test('validates scoring threshold for qualification', async () => {
      const lowScoreCompletion = { score: 45, timeSpent: 1200 };
      const highScoreCompletion = { score: 80, timeSpent: 1200 };

      // Low score should not count as qualifying
      const lowResult = await airtableService.handleICPCompletion(mockCustomerId, lowScoreCompletion);
      expect(lowResult.qualifiesForUnlock).toBe(false);

      // High score should count as qualifying
      const highResult = await airtableService.handleICPCompletion(mockCustomerId, highScoreCompletion);
      expect(highResult.qualifiesForUnlock).toBe(true);
    });
  });

  describe('Cost Calculator Access Progression', () => {
    test('displays locked state with progress requirements', async () => {
      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Cost of Inaction Calculator')).toBeInTheDocument();
        expect(screen.getByText('Locked')).toBeInTheDocument();
        expect(screen.getByText('Complete 3 ICP analyses with 70%+ accuracy scores')).toBeInTheDocument();
      });
    });

    test('shows progress bar for unlock requirements', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: { 
            access: true, 
            qualifying_scores: 2 
          },
          cost_calculator: { 
            access: false,
            unlock_progress: {
              qualifying_icp_scores: 2,
              required_scores: 3
            }
          }
        }
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('67%')).toBeInTheDocument(); // 2/3 = 67%
      });
    });

    test('unlocks cost calculator when requirements are met', async () => {
      // Simulate meeting unlock requirements
      airtableService.evaluateUnlockCriteria.mockResolvedValue({
        unlocks: ['cost_calculator'],
        toolUnlocked: true
      });

      competencyService.checkForUnlocks.mockResolvedValue({
        hasUnlocks: true,
        unlocks: [{
          tool: 'cost_calculator',
          competencyAchieved: 'Value Analysis Readiness'
        }]
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Available')).toBeInTheDocument();
      });
    });

    test('persists access state across sessions', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          cost_calculator: { 
            access: true, 
            completions: 1,
            unlock_date: '2024-01-15T10:00:00Z'
          }
        }
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Methodology accessible')).toBeInTheDocument();
      });
    });
  });

  describe('Business Case Builder Access Progression', () => {
    test('requires cost calculator completions', async () => {
      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Business Case Builder')).toBeInTheDocument();
        expect(screen.getByText('Complete 2 comprehensive cost analyses')).toBeInTheDocument();
      });
    });

    test('tracks cost calculator completion progress', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          cost_calculator: { 
            access: true, 
            completions: 1 
          },
          business_case_builder: { 
            access: false,
            unlock_progress: {
              cost_analyses_completed: 1,
              required_analyses: 2
            }
          }
        }
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('1/2 cost analyses completed')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    test('validates comprehensive analysis requirement', async () => {
      const quickAnalysis = { annualCost: 50000, timeSpent: 300 }; // 5 minutes - too quick
      const thoroughAnalysis = { annualCost: 200000, timeSpent: 1200 }; // 20 minutes - thorough

      const quickResult = await airtableService.handleCostCalculatorCompletion(mockCustomerId, quickAnalysis);
      expect(quickResult.qualifiesForUnlock).toBe(false);

      const thoroughResult = await airtableService.handleCostCalculatorCompletion(mockCustomerId, thoroughAnalysis);
      expect(thoroughResult.qualifiesForUnlock).toBe(true);
    });

    test('unlocks business case builder when ready', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          cost_calculator: { 
            access: true, 
            completions: 2,
            qualifying_completions: 2
          },
          business_case_builder: { 
            access: true,
            unlock_date: '2024-01-20T14:30:00Z'
          }
        }
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Methodology accessible')).toBeInTheDocument();
      });
    });
  });

  describe('Access State Persistence', () => {
    test('loads access state on component mount', async () => {
      const mockAccessState = {
        icp_analysis: { access: true, completions: 5 },
        cost_calculator: { access: true, completions: 3 },
        business_case_builder: { access: false, completions: 0 }
      };

      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: mockAccessState
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(airtableService.getCustomerDataByRecordId).toHaveBeenCalledWith(mockCustomerId);
      });
    });

    test('updates access state when tools are unlocked', async () => {
      const mockUnlockResult = {
        toolUnlocked: true,
        unlockedTool: 'cost_calculator',
        newAccessState: {
          cost_calculator: { 
            access: true, 
            unlock_date: new Date().toISOString() 
          }
        }
      };

      airtableService.unlockAdvancedTool.mockResolvedValue(mockUnlockResult);

      const { rerender } = renderProgressiveToolAccess();
      
      // Simulate tool unlock
      await airtableService.unlockAdvancedTool(mockCustomerId, 'cost_calculator');
      
      rerender(
        <BrowserRouter>
          <ProgressiveToolAccess customerId={mockCustomerId} />
        </BrowserRouter>
      );

      expect(airtableService.unlockAdvancedTool).toHaveBeenCalledWith(mockCustomerId, 'cost_calculator');
    });

    test('handles network disconnection gracefully', async () => {
      airtableService.getCustomerDataByRecordId.mockRejectedValue(new Error('Network error'));

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        // Should fallback to local state or show error
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });
  });

  describe('Professional Readiness Calculations', () => {
    test('calculates overall readiness percentage', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: {
          icp_analysis: { access: true, completions: 5, avg_score: 80 },
          cost_calculator: { access: true, completions: 2 },
          business_case_builder: { access: false, completions: 0 }
        }
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('67%')).toBeInTheDocument(); // 2/3 tools unlocked
      });
    });

    test('displays competency readiness indicators', async () => {
      renderProgressiveToolAccess();
      
      // Navigate to readiness view
      fireEvent.click(screen.getByText('Readiness Status'));
      
      await waitFor(() => {
        expect(screen.getByText(/Competency Readiness/)).toBeInTheDocument();
      });
    });

    test('shows methodology progression pathway', async () => {
      renderProgressiveToolAccess();
      
      // Navigate to progression view
      fireEvent.click(screen.getByText('Methodology Path'));
      
      await waitFor(() => {
        expect(screen.getByText(/Methodology Progression/)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles invalid customer ID', async () => {
      airtableService.getCustomerDataByRecordId.mockRejectedValue(new Error('Invalid customer'));

      renderProgressiveToolAccess({ customerId: 'invalid-id' });
      
      await waitFor(() => {
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      });
    });

    test('handles corrupted access data', async () => {
      airtableService.getCustomerDataByRecordId.mockResolvedValue({
        toolAccessStatus: null // Corrupted data
      });

      renderProgressiveToolAccess();
      
      await waitFor(() => {
        // Should display default locked state
        expect(screen.getByText('Locked')).toBeInTheDocument();
      });
    });

    test('prevents race conditions in unlock checking', async () => {
      let callCount = 0;
      airtableService.evaluateUnlockCriteria.mockImplementation(() => {
        callCount++;
        return new Promise(resolve => {
          setTimeout(() => resolve({ unlocks: [], toolUnlocked: false }), 100);
        });
      });

      renderProgressiveToolAccess();
      
      // Trigger multiple unlock checks rapidly
      fireEvent.click(screen.getByText('Access Overview'));
      fireEvent.click(screen.getByText('Access Overview'));
      fireEvent.click(screen.getByText('Access Overview'));
      
      await waitFor(() => {
        expect(callCount).toBe(1); // Should debounce to single call
      });
    });

    test('recovers from temporary unlock failures', async () => {
      airtableService.evaluateUnlockCriteria
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({ unlocks: ['cost_calculator'], toolUnlocked: true });

      renderProgressiveToolAccess();
      
      // Should retry and eventually succeed
      await waitFor(() => {
        expect(airtableService.evaluateUnlockCriteria).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Professional Integration', () => {
    test('displays professional language throughout', async () => {
      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Methodology Access Framework')).toBeInTheDocument();
        expect(screen.getByText('Systematic methodology ensures optimal implementation success')).toBeInTheDocument();
        expect(screen.queryByText(/level up/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
      });
    });

    test('maintains business context in all states', async () => {
      renderProgressiveToolAccess();
      
      await waitFor(() => {
        expect(screen.getByText('Demonstrate proficiency in prerequisite methodologies')).toBeInTheDocument();
        expect(screen.getByText('Methodologies Available')).toBeInTheDocument();
        expect(screen.getByText('Analyses Completed')).toBeInTheDocument();
      });
    });
  });
});