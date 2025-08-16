// SalesAutomationService.test.js - Comprehensive testing for SalesAutomationService

import { SalesAutomationService } from '../services/SalesAutomationService';

// Test Suite for SalesAutomationService
describe('SalesAutomationService', () => {
  
  // Mock test data
  const mockICPData = {
    buyerPersona: {
      painPoints: ['scaling challenges', 'manual processes', 'data inconsistencies'],
      jobTitles: ['VP Sales', 'Sales Director', 'Revenue Operations Manager'],
      departments: ['Sales', 'Marketing', 'Operations'],
      seniority: ['Director', 'VP', 'C-Level'],
      jobFunction: ['Sales', 'Marketing', 'Revenue Operations'],
      primaryPainPoint: 'revenue predictability',
      communicationStyle: 'direct',
      decisionSpeed: 'fast',
      primaryMotivations: ['efficiency gains', 'competitive advantage']
    },
    targetIndustries: ['Technology', 'SaaS', 'FinTech'],
    targetIndustry: 'Technology',
    companySize: { min: 100, max: 500 },
    revenueRange: { min: 10000000, max: 50000000 },
    geography: ['United States', 'Canada'],
    companyType: ['Private', 'Public'],
    fundingStage: ['Series B', 'Series C'],
    technographics: ['Salesforce', 'HubSpot', 'Outreach'],
    excludeCompanies: ['Competitor Corp'],
    requirePhone: true,
    discoveryQuestions: [
      'How do you currently track revenue predictability?',
      'What challenges do you face with forecasting?',
      'How does your team handle pipeline management?'
    ]
  };

  const mockBusinessCaseData = {
    caseStudy: {
      company: 'TechScale Inc',
      outcome: '40% improvement in forecast accuracy'
    }
  };

  const mockCostData = {
    qualificationCriteria: [
      'Budget authority confirmed',
      'Timeline established', 
      'Business impact quantified',
      'Decision maker identified'
    ]
  };

  const mockAssessmentData = {
    competencyAreas: ['Customer Analysis', 'Value Communication', 'Sales Execution']
  };

  describe('generateOutreachSequences', () => {
    
    test('should generate valid prospecting sequence', () => {
      const result = SalesAutomationService.generateOutreachSequences(mockICPData, mockBusinessCaseData);
      
      expect(result.prospectingSequence).toBeDefined();
      expect(result.prospectingSequence.name).toBe('H&S ICP-Qualified Prospects');
      expect(result.prospectingSequence.description).toContain('H&S Revenue Intelligence');
      expect(result.prospectingSequence.steps).toBeDefined();
      expect(Array.isArray(result.prospectingSequence.steps)).toBe(true);
      expect(result.prospectingSequence.steps.length).toBe(4);
    });

    test('should generate sequence steps with proper structure', () => {
      const result = SalesAutomationService.generateOutreachSequences(mockICPData, mockBusinessCaseData);
      
      const firstStep = result.prospectingSequence.steps[0];
      expect(firstStep.stepNumber).toBe(1);
      expect(firstStep.type).toBe('email');
      expect(firstStep.delay).toBe(0);
      expect(firstStep.subject).toBeDefined();
      expect(firstStep.template).toBeDefined();
      expect(firstStep.trackingParameters).toBeDefined();
      expect(firstStep.variables).toBeDefined();
      expect(Array.isArray(firstStep.variables)).toBe(true);
    });

    test('should include LinkedIn step in sequence', () => {
      const result = SalesAutomationService.generateOutreachSequences(mockICPData, mockBusinessCaseData);
      
      const linkedInStep = result.prospectingSequence.steps.find(step => step.type === 'linkedin');
      expect(linkedInStep).toBeDefined();
      expect(linkedInStep.stepNumber).toBe(3);
      expect(linkedInStep.delay).toBe(5);
      expect(linkedInStep.template).toBeDefined();
    });

    test('should generate targeting criteria', () => {
      const result = SalesAutomationService.generateOutreachSequences(mockICPData, mockBusinessCaseData);
      
      expect(result.prospectingSequence.targetingCriteria).toBeDefined();
      expect(result.prospectingSequence.targetingCriteria.icpFitScore).toBeDefined();
      expect(result.prospectingSequence.targetingCriteria.icpFitScore.min).toBe(7.0);
      expect(result.prospectingSequence.targetingCriteria.icpFitScore.max).toBe(10.0);
      expect(result.prospectingSequence.targetingCriteria.industry).toContain('Technology');
    });

    test('should generate sequence settings', () => {
      const result = SalesAutomationService.generateOutreachSequences(mockICPData, mockBusinessCaseData);
      
      expect(result.prospectingSequence.sequenceSettings).toBeDefined();
      expect(result.prospectingSequence.sequenceSettings.timezone).toBe('prospect_timezone');
      expect(result.prospectingSequence.sequenceSettings.skipWeekends).toBe(true);
      expect(result.prospectingSequence.sequenceSettings.maxDailyEmails).toBe(50);
    });

    test('should handle missing buyer persona', () => {
      const icpWithoutPersona = { ...mockICPData };
      delete icpWithoutPersona.buyerPersona;
      
      const result = SalesAutomationService.generateOutreachSequences(icpWithoutPersona, mockBusinessCaseData);
      expect(result.prospectingSequence.steps[0].template).toContain('operational challenges');
    });

    test('should handle string pain points vs array', () => {
      const icpWithStringPain = {
        buyerPersona: {
          painPoints: 'single pain point'
        }
      };
      
      const result = SalesAutomationService.generateOutreachSequences(icpWithStringPain, mockBusinessCaseData);
      expect(result.prospectingSequence.steps[0].template).toContain('single pain point');
    });

    test('should handle null inputs', () => {
      const result = SalesAutomationService.generateOutreachSequences(null, null);
      
      expect(result).toBeDefined();
      expect(result.prospectingSequence).toBeDefined();
      expect(result.prospectingSequence.steps.length).toBeGreaterThan(0);
    });
  });

  describe('generateSalesLoftCadences', () => {
    
    test('should generate valid multi-touch cadence', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(mockICPData, mockCostData);
      
      expect(result.multiTouchCadence).toBeDefined();
      expect(result.multiTouchCadence.name).toBe('H&S Revenue Intelligence Qualification');
      expect(result.multiTouchCadence.description).toContain('H&S buyer intelligence');
      expect(result.multiTouchCadence.touches).toBeDefined();
      expect(Array.isArray(result.multiTouchCadence.touches)).toBe(true);
      expect(result.multiTouchCadence.touches.length).toBe(7);
    });

    test('should generate touches with proper structure', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(mockICPData, mockCostData);
      
      const firstTouch = result.multiTouchCadence.touches[0];
      expect(firstTouch.day).toBe(1);
      expect(firstTouch.type).toBe('email');
      expect(firstTouch.template).toBe('h_s_initial_outreach');
      expect(firstTouch.personalizations).toBeDefined();
      expect(firstTouch.trackingTags).toBeDefined();
      expect(Array.isArray(firstTouch.trackingTags)).toBe(true);
    });

    test('should include call touches with objectives', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(mockICPData, mockCostData);
      
      const callTouches = result.multiTouchCadence.touches.filter(touch => touch.type === 'call');
      expect(callTouches.length).toBe(2);
      
      const firstCall = callTouches[0];
      expect(firstCall.day).toBe(7);
      expect(firstCall.duration).toBe(15);
      expect(firstCall.objectives).toBeDefined();
      expect(firstCall.talkTracks).toBeDefined();
      expect(firstCall.dispositionOptions).toBeDefined();
    });

    test('should include LinkedIn touches', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(mockICPData, mockCostData);
      
      const linkedInTouches = result.multiTouchCadence.touches.filter(touch => touch.type === 'linkedin');
      expect(linkedInTouches.length).toBe(2);
      
      const firstLinkedIn = linkedInTouches[0];
      expect(firstLinkedIn.day).toBe(4);
      expect(firstLinkedIn.template).toBe('h_s_value_story');
    });

    test('should generate cadence settings', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(mockICPData, mockCostData);
      
      expect(result.multiTouchCadence.cadenceSettings).toBeDefined();
      expect(result.multiTouchCadence.cadenceSettings.timezone).toBe('prospect');
      expect(result.multiTouchCadence.cadenceSettings.skipWeekends).toBe(true);
      expect(result.multiTouchCadence.cadenceSettings.autoSkipBounces).toBe(true);
    });

    test('should generate success criteria', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(mockICPData, mockCostData);
      
      expect(result.multiTouchCadence.successCriteria).toBeDefined();
      expect(result.multiTouchCadence.successCriteria.replies).toContain('nurture sequence');
      expect(result.multiTouchCadence.successCriteria.meetings).toContain('opportunity stage');
    });

    test('should handle missing discovery questions', () => {
      const icpWithoutQuestions = { ...mockICPData };
      delete icpWithoutQuestions.discoveryQuestions;
      
      const result = SalesAutomationService.generateSalesLoftCadences(icpWithoutQuestions, mockCostData);
      expect(result.multiTouchCadence.touches[2].talkTracks).toContain('How do you currently handle this process?');
    });

    test('should handle null inputs', () => {
      const result = SalesAutomationService.generateSalesLoftCadences(null, null);
      
      expect(result).toBeDefined();
      expect(result.multiTouchCadence).toBeDefined();
      expect(result.multiTouchCadence.touches.length).toBeGreaterThan(0);
    });
  });

  describe('generateApolloLists', () => {
    
    test('should generate valid prospect list criteria', () => {
      const result = SalesAutomationService.generateApolloLists(mockICPData, mockAssessmentData);
      
      expect(result.prospectListCriteria).toBeDefined();
      expect(result.prospectListCriteria.name).toBe('H&S ICP High-Fit Prospects');
      expect(result.prospectListCriteria.description).toContain('H&S Revenue Intelligence');
      expect(result.prospectListCriteria.companyFilters).toBeDefined();
      expect(result.prospectListCriteria.contactFilters).toBeDefined();
    });

    test('should generate company filters', () => {
      const result = SalesAutomationService.generateApolloLists(mockICPData, mockAssessmentData);
      
      const companyFilters = result.prospectListCriteria.companyFilters;
      expect(companyFilters.industries).toContain('Technology');
      expect(companyFilters.employeeCount.min).toBe(100);
      expect(companyFilters.employeeCount.max).toBe(500);
      expect(companyFilters.revenue.min).toBe(10000000);
      expect(companyFilters.geography).toContain('United States');
      expect(companyFilters.technologies).toContain('Salesforce');
    });

    test('should generate contact filters', () => {
      const result = SalesAutomationService.generateApolloLists(mockICPData, mockAssessmentData);
      
      const contactFilters = result.prospectListCriteria.contactFilters;
      expect(contactFilters.jobTitles).toContain('VP Sales');
      expect(contactFilters.departments).toContain('Sales');
      expect(contactFilters.seniority).toContain('VP');
      expect(contactFilters.emailStatus).toBe('verified');
      expect(contactFilters.hasLinkedIn).toBe(true);
      expect(contactFilters.hasPhoneNumber).toBe(true);
    });

    test('should generate intent signals', () => {
      const result = SalesAutomationService.generateApolloLists(mockICPData, mockAssessmentData);
      
      const intentSignals = result.prospectListCriteria.intentSignals;
      expect(intentSignals.technographics).toContain('Salesforce');
      expect(intentSignals.fundingEvents).toContain('Recently funded');
      expect(intentSignals.hiringTrends).toContain('Expanding sales team');
      expect(intentSignals.newsEvents).toContain('Leadership changes');
    });

    test('should generate export settings', () => {
      const result = SalesAutomationService.generateApolloLists(mockICPData, mockAssessmentData);
      
      const exportSettings = result.prospectListCriteria.exportSettings;
      expect(exportSettings.fields).toContain('First Name');
      expect(exportSettings.fields).toContain('Company');
      expect(exportSettings.format).toBe('CSV');
      expect(exportSettings.maxRecords).toBe(1000);
      
      expect(exportSettings.customFields).toBeDefined();
      expect(exportSettings.customFields.length).toBe(3);
      expect(exportSettings.customFields[0].name).toBe('ICP Fit Score');
    });

    test('should generate sequence mapping', () => {
      const result = SalesAutomationService.generateApolloLists(mockICPData, mockAssessmentData);
      
      expect(result.sequenceMapping).toBeDefined();
      expect(result.sequenceMapping.highFitProspects).toBeDefined();
      expect(result.sequenceMapping.mediumFitProspects).toBeDefined();
      expect(result.sequenceMapping.lowFitProspects).toBeDefined();
      
      expect(result.sequenceMapping.highFitProspects.icpScore.min).toBe(8.5);
      expect(result.sequenceMapping.highFitProspects.priority).toBe('High');
      expect(result.sequenceMapping.highFitProspects.assignTo).toBe('Senior Sales Rep');
    });

    test('should handle missing target industries', () => {
      const icpWithoutIndustries = { ...mockICPData };
      delete icpWithoutIndustries.targetIndustries;
      
      const result = SalesAutomationService.generateApolloLists(icpWithoutIndustries, mockAssessmentData);
      expect(result.prospectListCriteria.companyFilters.industries).toContain('Technology');
    });

    test('should handle missing buyer persona', () => {
      const icpWithoutPersona = { ...mockICPData };
      delete icpWithoutPersona.buyerPersona;
      
      const result = SalesAutomationService.generateApolloLists(icpWithoutPersona, mockAssessmentData);
      expect(result.prospectListCriteria.contactFilters.jobTitles).toContain('Director');
    });

    test('should handle null inputs', () => {
      const result = SalesAutomationService.generateApolloLists(null, null);
      
      expect(result).toBeDefined();
      expect(result.prospectListCriteria).toBeDefined();
      expect(result.sequenceMapping).toBeDefined();
    });
  });

  describe('optimizeSequenceForPersona', () => {
    
    test('should optimize sequence for direct communication style', () => {
      const baseSequence = {
        steps: [
          { template: 'This might be helpful and could work for you' },
          { template: 'You might find this could be beneficial' }
        ]
      };
      
      const persona = { communicationStyle: 'direct' };
      const result = SalesAutomationService.optimizeSequenceForPersona(baseSequence, persona);
      
      expect(result.steps[0].template).toBe('This is helpful and will work for you');
      expect(result.steps[1].template).toBe('You will find this will be beneficial');
    });

    test('should optimize timing for fast decision makers', () => {
      const baseSequence = {
        steps: [
          { delay: 3, template: 'Test' },
          { delay: 5, template: 'Test' },
          { delay: 1, template: 'Test' }
        ]
      };
      
      const persona = { decisionSpeed: 'fast' };
      const result = SalesAutomationService.optimizeSequenceForPersona(baseSequence, persona);
      
      expect(result.steps[0].delay).toBe(2); // 3 - 1
      expect(result.steps[1].delay).toBe(4); // 5 - 1
      expect(result.steps[2].delay).toBe(1); // Max(1, 1-1) = 1
    });

    test('should add persona-specific personalizations', () => {
      const baseSequence = {
        personalizations: ['existing.field']
      };
      
      const persona = { primaryMotivations: ['efficiency', 'cost reduction'] };
      const result = SalesAutomationService.optimizeSequenceForPersona(baseSequence, persona);
      
      expect(result.personalizations).toContain('existing.field');
      expect(result.personalizations).toContain('prospect.primary_motivations');
      expect(result.personalizations).toContain('prospect.decision_criteria');
    });

    test('should handle missing personalizations', () => {
      const baseSequence = { steps: [] };
      const persona = { primaryMotivations: ['efficiency'] };
      
      const result = SalesAutomationService.optimizeSequenceForPersona(baseSequence, persona);
      expect(result.personalizations).toContain('prospect.primary_motivations');
    });

    test('should handle null persona', () => {
      const baseSequence = { steps: [{ template: 'test', delay: 3 }] };
      const result = SalesAutomationService.optimizeSequenceForPersona(baseSequence, null);
      
      expect(result).toEqual(baseSequence);
    });

    test('should handle errors gracefully', () => {
      const problematicSequence = {
        get steps() { throw new Error('Test error'); }
      };
      
      const result = SalesAutomationService.optimizeSequenceForPersona(problematicSequence, {});
      expect(result).toBe(problematicSequence);
    });
  });

  describe('generateSequenceVariations', () => {
    
    test('should generate subject line variations', () => {
      const baseSequence = { name: 'Base Sequence' };
      const result = SalesAutomationService.generateSequenceVariations(baseSequence, 'subject_lines');
      
      expect(result.length).toBe(3);
      expect(result[0].name).toBe('Base Sequence - Direct');
      expect(result[1].name).toBe('Base Sequence - Question');
      expect(result[2].name).toBe('Base Sequence - Benefit');
      expect(result[0].subjectVariation).toBe('direct');
    });

    test('should generate messaging tone variations', () => {
      const baseSequence = { name: 'Base Sequence' };
      const result = SalesAutomationService.generateSequenceVariations(baseSequence, 'messaging_tone');
      
      expect(result.length).toBe(3);
      expect(result[0].name).toBe('Base Sequence - Professional');
      expect(result[1].name).toBe('Base Sequence - Casual');
      expect(result[2].name).toBe('Base Sequence - Consultative');
      expect(result[0].toneVariation).toBe('professional');
    });

    test('should generate timing variations', () => {
      const baseSequence = { name: 'Base Sequence' };
      const result = SalesAutomationService.generateSequenceVariations(baseSequence, 'timing');
      
      expect(result.length).toBe(3);
      expect(result[0].name).toBe('Base Sequence - Aggressive');
      expect(result[1].name).toBe('Base Sequence - Standard');
      expect(result[2].name).toBe('Base Sequence - Patient');
      expect(result[0].timingMultiplier).toBe(0.7);
      expect(result[2].timingMultiplier).toBe(1.5);
    });

    test('should handle unknown variation type', () => {
      const baseSequence = { name: 'Base Sequence' };
      const result = SalesAutomationService.generateSequenceVariations(baseSequence, 'unknown');
      
      expect(result.length).toBe(0);
    });

    test('should handle errors gracefully', () => {
      const problematicSequence = {
        get name() { throw new Error('Test error'); }
      };
      
      const result = SalesAutomationService.generateSequenceVariations(problematicSequence, 'subject_lines');
      expect(result).toEqual([problematicSequence]);
    });
  });

  describe('validateSequenceData', () => {
    
    test('should validate valid sequence data', () => {
      const sequenceData = {
        steps: [
          { type: 'email', template: 'Test template' },
          { type: 'call', template: 'Call script' }
        ]
      };
      
      const result = SalesAutomationService.validateSequenceData(sequenceData);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should invalidate null sequence data', () => {
      const result = SalesAutomationService.validateSequenceData(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid sequence data provided');
    });

    test('should invalidate non-object sequence data', () => {
      const result = SalesAutomationService.validateSequenceData('invalid string');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid sequence data provided');
    });

    test('should invalidate sequence without steps', () => {
      const result = SalesAutomationService.validateSequenceData({});
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Sequence must have steps array');
    });

    test('should invalidate sequence with non-array steps', () => {
      const result = SalesAutomationService.validateSequenceData({ steps: 'not an array' });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Sequence must have steps array');
    });

    test('should invalidate sequence with empty steps', () => {
      const result = SalesAutomationService.validateSequenceData({ steps: [] });
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Sequence must have at least one step');
    });

    test('should invalidate step without type', () => {
      const sequenceData = {
        steps: [{ template: 'Test template' }]
      };
      
      const result = SalesAutomationService.validateSequenceData(sequenceData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Step 1 missing required type or template');
    });

    test('should invalidate step without template', () => {
      const sequenceData = {
        steps: [{ type: 'email' }]
      };
      
      const result = SalesAutomationService.validateSequenceData(sequenceData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Step 1 missing required type or template');
    });

    test('should handle validation errors gracefully', () => {
      const problematicData = {
        get steps() { throw new Error('Test error'); }
      };
      
      const result = SalesAutomationService.validateSequenceData(problematicData);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Sequence validation error occurred');
    });
  });

  describe('default fallback functions', () => {
    
    test('should return default Outreach sequence', () => {
      const result = SalesAutomationService.getDefaultOutreachSequence();
      
      expect(result.prospectingSequence).toBeDefined();
      expect(result.prospectingSequence.name).toBe('Basic H&S Sequence');
      expect(result.prospectingSequence.steps.length).toBe(1);
      expect(result.prospectingSequence.steps[0].type).toBe('email');
      expect(result.prospectingSequence.targetingCriteria.icpFitScore.min).toBe(5.0);
    });

    test('should return default SalesLoft cadence', () => {
      const result = SalesAutomationService.getDefaultSalesLoftCadence();
      
      expect(result.multiTouchCadence).toBeDefined();
      expect(result.multiTouchCadence.name).toBe('Basic H&S Cadence');
      expect(result.multiTouchCadence.touches.length).toBe(1);
      expect(result.multiTouchCadence.touches[0].type).toBe('email');
    });

    test('should return default Apollo list', () => {
      const result = SalesAutomationService.getDefaultApolloList();
      
      expect(result.prospectListCriteria).toBeDefined();
      expect(result.prospectListCriteria.name).toBe('Basic Prospect List');
      expect(result.prospectListCriteria.companyFilters.industries).toContain('Technology');
      expect(result.prospectListCriteria.contactFilters.jobTitles).toContain('Director');
    });
  });

  describe('error handling', () => {
    
    test('should handle internal errors in generateOutreachSequences', () => {
      const problematicData = {
        buyerPersona: {
          get painPoints() { throw new Error('Test error'); }
        }
      };
      
      const result = SalesAutomationService.generateOutreachSequences(problematicData, {});
      expect(result).toBeDefined();
      expect(result.prospectingSequence).toBeDefined();
    });

    test('should handle internal errors in generateSalesLoftCadences', () => {
      const problematicData = {
        get discoveryQuestions() { throw new Error('Test error'); }
      };
      
      const result = SalesAutomationService.generateSalesLoftCadences(problematicData, {});
      expect(result).toBeDefined();
      expect(result.multiTouchCadence).toBeDefined();
    });

    test('should handle internal errors in generateApolloLists', () => {
      const problematicData = {
        get buyerPersona() { throw new Error('Test error'); }
      };
      
      const result = SalesAutomationService.generateApolloLists(problematicData, {});
      expect(result).toBeDefined();
      expect(result.prospectListCriteria).toBeDefined();
    });
  });

});

// Manual Testing Function (for browser console testing)
export const runManualSalesAutomationTests = () => {
  console.log('🧪 Running SalesAutomationService Manual Tests...');
  
  try {
    const mockData = {
      buyerPersona: {
        painPoints: ['scaling challenges', 'manual processes'],
        jobTitles: ['VP Sales', 'Sales Director'],
        primaryPainPoint: 'revenue predictability'
      },
      targetIndustries: ['Technology', 'SaaS'],
      companySize: { min: 100, max: 500 }
    };
    
    const businessCaseData = {
      caseStudy: { company: 'TestCorp', outcome: '40% improvement' }
    };
    
    // Test 1: Outreach sequences generation
    const outreachSeq = SalesAutomationService.generateOutreachSequences(mockData, businessCaseData);
    console.log('✅ Outreach sequences:', outreachSeq.prospectingSequence.steps.length);
    
    // Test 2: SalesLoft cadences generation
    const salesLoftCad = SalesAutomationService.generateSalesLoftCadences(mockData, {});
    console.log('✅ SalesLoft cadences:', salesLoftCad.multiTouchCadence.touches.length);
    
    // Test 3: Apollo lists generation
    const apolloLists = SalesAutomationService.generateApolloLists(mockData, {});
    console.log('✅ Apollo lists:', apolloLists.prospectListCriteria.companyFilters.industries.length);
    
    // Test 4: Sequence optimization
    const baseSequence = { steps: [{ template: 'might be', delay: 3 }] };
    const optimized = SalesAutomationService.optimizeSequenceForPersona(baseSequence, { communicationStyle: 'direct' });
    console.log('✅ Sequence optimization:', optimized.steps[0].template.includes('is'));
    
    // Test 5: Sequence variations
    const variations = SalesAutomationService.generateSequenceVariations({ name: 'Test' }, 'subject_lines');
    console.log('✅ Sequence variations:', variations.length === 3);
    
    // Test 6: Validation
    const validation = SalesAutomationService.validateSequenceData({
      steps: [{ type: 'email', template: 'Test' }]
    });
    console.log('✅ Sequence validation:', validation.isValid);
    
    // Test 7: Default fallbacks
    const defaultOutreach = SalesAutomationService.getDefaultOutreachSequence();
    console.log('✅ Default Outreach sequence:', defaultOutreach.prospectingSequence.steps.length);
    
    console.log('🎉 All SalesAutomationService manual tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ SalesAutomationService manual test failed:', error);
    return false;
  }
};