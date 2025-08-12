/**
 * Phase 7: Professional Credibility Validation Testing
 * 
 * Ensuring zero gaming terminology, business-appropriate language,
 * executive-level visual quality, and enterprise compatibility.
 */

import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CompetencyOverview from '../../components/dashboard/CompetencyOverview';
import ProfessionalDevelopment from '../../components/dashboard/ProfessionalDevelopment';
import ProgressiveToolAccess from '../../components/competency/ProgressiveToolAccess';
import ProgressNotifications from '../../components/notifications/ProgressNotifications';
import { extractAllUIText, validateLanguageCompliance } from '../utils/textValidation';

// Mock services
jest.mock('../../services/airtableService');

const mockCustomerId = 'test-customer-validation';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Professional Credibility Validation', () => {
  describe('Zero Gaming Terminology Validation', () => {
    const gamingTerms = [
      'level up', 'levelup', 'level-up',
      'achievement unlocked', 'unlock achievement',
      'XP', 'experience points', 'exp',
      'quest', 'mission', 'challenge',
      'boss', 'raid', 'dungeon',
      'loot', 'reward', 'prize',
      'score', 'high score', 'leaderboard',
      'player', 'gamer', 'gaming',
      'character', 'avatar', 'profile pic',
      'health', 'mana', 'energy',
      'buff', 'debuff', 'power-up',
      'respawn', 'spawn', 'checkpoint',
      'save game', 'load game',
      'inventory', 'items', 'weapons',
      'guild', 'clan', 'party',
      'PvP', 'PvE', 'multiplayer',
      'noob', 'newbie', 'pro gamer',
      'ding', 'grind', 'farming'
    ];

    test('CompetencyOverview contains no gaming terminology', () => {
      const mockData = {
        currentLevel: 'Proficient',
        progressPoints: 350,
        toolsUnlocked: 2,
        consistencyStreak: 5
      };

      renderWithRouter(
        <CompetencyOverview
          customerId={mockCustomerId}
          competencyData={mockData}
          onRefresh={() => {}}
        />
      );

      const text = extractAllUIText(screen.getByRole('main') || document.body);
      
      gamingTerms.forEach(term => {
        expect(text.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });

    test('ProfessionalDevelopment uses business language only', () => {
      const mockData = {
        todaysObjectives: [
          { id: 1, name: 'Review methodology framework', type: 'review', points: 15 },
          { id: 2, name: 'Complete strategic analysis', type: 'completion', points: 25 }
        ],
        recentMilestones: [
          { name: 'Strategic Excellence Recognition', points: 75, achieved_at: new Date().toISOString() }
        ],
        streakData: { current: 7, best: 10 },
        progressSummary: { totalPoints: 400, currentLevel: 'Proficient' }
      };

      renderWithRouter(
        <ProfessionalDevelopment
          customerId={mockCustomerId}
          milestones={mockData.recentMilestones}
          dailyObjectives={mockData.todaysObjectives}
        />
      );

      const text = extractAllUIText(screen.getByRole('main') || document.body);
      
      // Should contain professional terms
      expect(text).toMatch(/professional|strategic|executive|competency|methodology/i);
      
      // Should not contain gaming terms
      gamingTerms.forEach(term => {
        expect(text.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });

    test('ProgressNotifications maintain professional language', () => {
      const notifications = [
        {
          id: 1,
          type: 'progress_recognition',
          data: { activity: 'Strategic Analysis', points: 25 },
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'milestone_reached',
          data: { milestone_name: 'Excellence Recognition', badge: 'Methodology Specialist' },
          timestamp: new Date().toISOString()
        }
      ];

      render(
        <ProgressNotifications
          notifications={notifications}
          onDismiss={() => {}}
        />
      );

      const text = extractAllUIText(document.body);
      
      gamingTerms.forEach(term => {
        expect(text.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });

    test('ProgressiveToolAccess uses methodology terminology', () => {
      renderWithRouter(
        <ProgressiveToolAccess
          customerId={mockCustomerId}
        />
      );

      const text = extractAllUIText(screen.getByRole('main') || document.body);
      
      // Should use professional business terminology
      expect(text).toMatch(/methodology|framework|competency|analysis|strategic/i);
      
      // Absolutely no gaming terms
      gamingTerms.forEach(term => {
        expect(text.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });

    test('validates all UI components collectively', () => {
      const allComponents = [
        <CompetencyOverview key="overview" customerId={mockCustomerId} />,
        <ProfessionalDevelopment key="development" customerId={mockCustomerId} />,
        <ProgressiveToolAccess key="access" customerId={mockCustomerId} />
      ];

      allComponents.forEach((component, index) => {
        const { unmount } = renderWithRouter(component);
        
        const text = extractAllUIText(document.body);
        
        gamingTerms.forEach(term => {
          expect(text.toLowerCase()).not.toContain(term.toLowerCase());
        });
        
        unmount();
      });
    });
  });

  describe('Business-Appropriate Language Standards', () => {
    const businessTerms = [
      'professional', 'strategic', 'executive',
      'competency', 'methodology', 'framework',
      'analysis', 'assessment', 'evaluation',
      'development', 'advancement', 'progression',
      'excellence', 'mastery', 'proficiency',
      'recognition', 'achievement', 'milestone',
      'systematic', 'comprehensive', 'sophisticated',
      'intelligence', 'capability', 'readiness'
    ];

    test('uses executive-level vocabulary throughout', () => {
      renderWithRouter(
        <CompetencyOverview
          customerId={mockCustomerId}
          competencyData={{ currentLevel: 'Expert', progressPoints: 1000 }}
        />
      );

      const text = extractAllUIText(document.body);
      
      // Should contain multiple business terms
      const businessTermCount = businessTerms.filter(term => 
        text.toLowerCase().includes(term.toLowerCase())
      ).length;
      
      expect(businessTermCount).toBeGreaterThan(5);
    });

    test('maintains formal tone in all interactions', () => {
      const notifications = [{
        id: 1,
        type: 'competency_advancement',
        data: { competency: 'Strategic Communication', gain: 8 },
        timestamp: new Date().toISOString()
      }];

      render(
        <ProgressNotifications
          notifications={notifications}
          onDismiss={() => {}}
        />
      );

      // Should not use casual language
      const casualTerms = ['awesome', 'cool', 'sweet', 'nice', 'great job', 'way to go'];
      const text = extractAllUIText(document.body);
      
      casualTerms.forEach(term => {
        expect(text.toLowerCase()).not.toContain(term.toLowerCase());
      });
    });

    test('uses industry-standard terminology', () => {
      renderWithRouter(
        <ProgressiveToolAccess customerId={mockCustomerId} />
      );

      const text = extractAllUIText(document.body);
      
      // Should use B2B SaaS industry terms
      const industryTerms = [
        'methodology', 'framework', 'analysis',
        'readiness', 'competency', 'systematic'
      ];
      
      industryTerms.forEach(term => {
        expect(text.toLowerCase()).toContain(term.toLowerCase());
      });
    });
  });

  describe('Executive-Level Visual Quality', () => {
    test('uses sophisticated color schemes', () => {
      renderWithRouter(
        <CompetencyOverview
          customerId={mockCustomerId}
          competencyData={{ currentLevel: 'Advanced' }}
        />
      );

      // Check for professional color classes
      const container = screen.getByRole('main') || document.body;
      const elements = container.querySelectorAll('*');
      
      let hasGradients = false;
      let hasProfessionalColors = false;
      
      elements.forEach(element => {
        const className = element.className || '';
        
        if (className.includes('gradient') || className.includes('from-') || className.includes('to-')) {
          hasGradients = true;
        }
        
        if (className.includes('gray-') || className.includes('blue-') || className.includes('purple-')) {
          hasProfessionalColors = true;
        }
      });
      
      expect(hasGradients).toBe(true);
      expect(hasProfessionalColors).toBe(true);
    });

    test('implements sophisticated typography hierarchy', () => {
      renderWithRouter(
        <ProfessionalDevelopment customerId={mockCustomerId} />
      );

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for font weight variations
      const container = document.body;
      const fontElements = container.querySelectorAll('.font-bold, .font-semibold, .font-medium');
      expect(fontElements.length).toBeGreaterThan(0);
    });

    test('maintains consistent spacing and layout', () => {
      renderWithRouter(
        <CompetencyOverview customerId={mockCustomerId} />
      );

      const container = document.body;
      const spacingElements = container.querySelectorAll('[class*="space-"], [class*="gap-"], [class*="p-"], [class*="m-"]');
      
      expect(spacingElements.length).toBeGreaterThan(10); // Should have systematic spacing
    });
  });

  describe('Enterprise Sales Conversation Compatibility', () => {
    test('positions features as professional development tools', () => {
      renderWithRouter(
        <ProgressiveToolAccess customerId={mockCustomerId} />
      );

      const text = extractAllUIText(document.body);
      
      // Should frame as business methodology
      expect(text).toMatch(/methodology|professional development|competency/i);
      expect(text).not.toMatch(/game|play|fun|entertainment/i);
    });

    test('emphasizes systematic approach and business value', () => {
      renderWithRouter(
        <CompetencyOverview
          customerId={mockCustomerId}
          competencyData={{ currentLevel: 'Proficient', progressPoints: 500 }}
        />
      );

      const text = extractAllUIText(document.body);
      
      // Should emphasize business benefits
      expect(text).toMatch(/systematic|strategic|excellence|advancement/i);
    });

    test('avoids any language that suggests frivolous activity', () => {
      const allNotificationTypes = [
        { type: 'progress_recognition', data: { activity: 'Analysis', points: 25 } },
        { type: 'competency_advancement', data: { competency: 'Strategic Thinking', gain: 5 } },
        { type: 'milestone_reached', data: { milestone_name: 'Professional Recognition' } },
        { type: 'tool_access_earned', data: { tool_name: 'Advanced Methodology' } },
        { type: 'consistency_reward', data: { streak_days: 7, points: 35 } }
      ];

      allNotificationTypes.forEach((notification, index) => {
        const notifications = [{ id: index, ...notification, timestamp: new Date().toISOString() }];
        
        const { unmount } = render(
          <ProgressNotifications
            notifications={notifications}
            onDismiss={() => {}}
          />
        );

        const text = extractAllUIText(document.body);
        
        // Frivolous terms that would hurt sales conversations
        const frivolousTerms = ['fun', 'play', 'game', 'entertainment', 'amusing', 'enjoyable'];
        frivolousTerms.forEach(term => {
          expect(text.toLowerCase()).not.toContain(term.toLowerCase());
        });
        
        unmount();
      });
    });
  });

  describe('Professional Development Positioning', () => {
    test('frames all features as competency development', () => {
      renderWithRouter(
        <ProfessionalDevelopment customerId={mockCustomerId} />
      );

      const text = extractAllUIText(document.body);
      
      // Should consistently frame as professional development
      expect(text).toMatch(/professional development|competency|strategic/i);
      expect(text).not.toMatch(/score|points earned|winning/i);
    });

    test('emphasizes business intelligence and methodology', () => {
      renderWithRouter(
        <ProgressiveToolAccess customerId={mockCustomerId} />
      );

      const text = extractAllUIText(document.body);
      
      expect(text).toMatch(/business intelligence|methodology|framework/i);
      expect(text).toMatch(/systematic|professional|strategic/i);
    });

    test('positions progress tracking as competency assessment', () => {
      renderWithRouter(
        <CompetencyOverview
          customerId={mockCustomerId}
          competencyData={{
            currentLevel: 'Developing',
            progressPoints: 250,
            consistency_streak: 5
          }}
        />
      );

      const text = extractAllUIText(document.body);
      
      // Should frame tracking as professional assessment
      expect(text).toMatch(/competency|assessment|development|advancement/i);
      expect(text).not.toMatch(/score|points|rewards/i);
    });

    test('validates enterprise-appropriate feature descriptions', () => {
      const featureDescriptions = [
        'Professional Competency Overview',
        'Strategic Development Center', 
        'Methodology Access Framework',
        'Executive Competency Dashboard',
        'Professional Development',
        'Strategic Progress Recognition'
      ];

      featureDescriptions.forEach(description => {
        // Each should sound appropriate in enterprise context
        expect(description).toMatch(/professional|strategic|executive|competency|methodology/i);
        expect(description).not.toMatch(/game|play|score|level|achievement/i);
      });
    });
  });

  describe('Language Compliance Automation', () => {
    test('automated scanning for inappropriate terms', () => {
      const prohibitedTerms = [
        // Gaming terms
        'level up', 'XP', 'achievement unlocked', 'quest', 'mission',
        // Casual terms  
        'awesome', 'cool', 'sweet', 'way to go',
        // Frivolous terms
        'fun', 'play', 'game', 'entertainment'
      ];

      const result = validateLanguageCompliance(prohibitedTerms);
      
      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('validates required professional vocabulary presence', () => {
      const requiredTerms = [
        'professional', 'strategic', 'competency',
        'methodology', 'executive', 'systematic'
      ];

      const compliance = validateLanguageCompliance([], requiredTerms);
      
      expect(compliance.hasRequiredTerms).toBe(true);
      expect(compliance.requiredTermsFound.length).toBeGreaterThan(3);
    });

    test('checks tone consistency across components', () => {
      const components = [
        'CompetencyOverview',
        'ProfessionalDevelopment', 
        'ProgressiveToolAccess',
        'ProgressNotifications'
      ];

      components.forEach(componentName => {
        const toneAnalysis = validateLanguageCompliance([], [], componentName);
        
        expect(toneAnalysis.tone).toBe('professional');
        expect(toneAnalysis.formalityScore).toBeGreaterThan(0.8);
      });
    });
  });

  describe('Visual Brand Consistency', () => {
    test('maintains H&S platform aesthetic', () => {
      renderWithRouter(
        <CompetencyOverview customerId={mockCustomerId} />
      );

      // Check for consistent color scheme
      const elements = document.querySelectorAll('[class*="gray-"], [class*="blue-"]');
      expect(elements.length).toBeGreaterThan(0);
    });

    test('uses enterprise-grade visual elements', () => {
      renderWithRouter(
        <ProfessionalDevelopment customerId={mockCustomerId} />
      );

      // Should have professional visual indicators
      const sophisticatedElements = document.querySelectorAll(
        '[class*="gradient"], [class*="shadow"], [class*="backdrop"], [class*="border"]'
      );
      
      expect(sophisticatedElements.length).toBeGreaterThan(5);
    });

    test('avoids childish or playful visual elements', () => {
      const allComponents = [
        <CompetencyOverview key="1" customerId={mockCustomerId} />,
        <ProfessionalDevelopment key="2" customerId={mockCustomerId} />,
        <ProgressiveToolAccess key="3" customerId={mockCustomerId} />
      ];

      allComponents.forEach(component => {
        const { unmount } = renderWithRouter(component);
        
        // Should not have bright, playful colors
        const playfulElements = document.querySelectorAll(
          '[class*="pink-"], [class*="orange-"], [class*="red-5"], [class*="yellow-4"]'
        );
        
        // Bright colors should be minimal or contextual only
        expect(playfulElements.length).toBeLessThan(3);
        
        unmount();
      });
    });
  });
});