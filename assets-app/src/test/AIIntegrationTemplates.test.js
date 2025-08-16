// AIIntegrationTemplates.test.js - Comprehensive testing for AIIntegrationTemplates

import { AIIntegrationTemplates } from '../services/AIIntegrationTemplates';

// Test Suite for AIIntegrationTemplates
describe('AIIntegrationTemplates', () => {
  
  // Mock test data
  const mockICPData = {
    buyerPersona: {
      name: 'Technical Founder',
      role: 'CTO',
      demographics: 'Series A/B companies, 50-200 employees',
      painPoints: ['scaling challenges', 'manual processes', 'data silos'],
      decisionMaking: 'Committee-based with technical validation',
      language: 'technical and business terminology',
      objections: ['implementation complexity', 'budget concerns', 'timeline constraints'],
      motivations: ['efficiency gains', 'technical excellence', 'competitive advantage'],
      decisionCriteria: ['ROI', 'technical feasibility', 'team adoption'],
      industry: 'SaaS Technology',
      communicationStyle: 'direct',
      primaryMotivations: ['innovation', 'scalability']
    },
    conversationFrameworks: [
      'Tell me about your current scaling challenges',
      'How do you handle technical debt',
      'What\'s your biggest operational bottleneck'
    ],
    objectionResponses: [
      'Many CTOs initially have implementation concerns...',
      'Let me show you how we address technical complexity...'
    ]
  };

  const mockCostData = {
    impactCalculation: {
      methodology: 'Time-value analysis with productivity multipliers',
      results: '$2.3M annual efficiency gains'
    }
  };

  const mockBusinessCaseData = {
    framework: {
      executiveSummary: 'Strategic technology investment framework',
      financialJustification: 'ROI-based analysis with risk mitigation',
      riskAssessment: 'Technical and operational risk evaluation',
      valueProposition: 'Accelerated development cycles with reduced technical debt',
      successMetrics: ['50% faster deployments', '30% reduction in bugs']
    }
  };

  describe('generateClaudePrompts', () => {
    
    test('should generate valid prospect research prompt', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(mockICPData, mockCostData, mockBusinessCaseData);
      
      expect(result.prospectResearchPrompt).toContain('TARGET BUYER PROFILE');
      expect(result.prospectResearchPrompt).toContain('Demographics');
      expect(result.prospectResearchPrompt).toContain('Pain Points');
      expect(result.prospectResearchPrompt).toContain('Decision Making');
      expect(result.prospectResearchPrompt).toContain('[COMPANY_NAME]');
    });

    test('should generate valid value proposition prompt', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(mockICPData, mockCostData, mockBusinessCaseData);
      
      expect(result.valuePropositionPrompt).toContain('OUR SOLUTION IMPACT');
      expect(result.valuePropositionPrompt).toContain('Methodology');
      expect(result.valuePropositionPrompt).toContain('Results');
      expect(result.valuePropositionPrompt).toContain('[PROSPECT_COMPANY]');
    });

    test('should generate valid business case prompt', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(mockICPData, mockCostData, mockBusinessCaseData);
      
      expect(result.businessCasePrompt).toContain('FRAMEWORK STRUCTURE');
      expect(result.businessCasePrompt).toContain('Executive Summary');
      expect(result.businessCasePrompt).toContain('Financial Justification');
      expect(result.businessCasePrompt).toContain('Risk Assessment');
    });

    test('should generate valid objection handling prompt', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(mockICPData, mockCostData, mockBusinessCaseData);
      
      expect(result.objectionHandlingPrompt).toContain('BUYER PROFILE');
      expect(result.objectionHandlingPrompt).toContain('Key Concerns');
      expect(result.objectionHandlingPrompt).toContain('Decision Style');
      expect(result.objectionHandlingPrompt).toContain('[INSERT_OBJECTION]');
    });

    test('should generate valid discovery prompt', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(mockICPData, mockCostData, mockBusinessCaseData);
      
      expect(result.discoveryPrompt).toContain('IDEAL BUYER PROFILE');
      expect(result.discoveryPrompt).toContain('Target Profile');
      expect(result.discoveryPrompt).toContain('Known Pain Points');
      expect(result.discoveryPrompt).toContain('[PROSPECT_COMPANY]');
    });

    test('should handle missing ICP data gracefully', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts({}, {}, {});
      
      expect(result.prospectResearchPrompt).toContain('Target buyer demographics');
      expect(result.prospectResearchPrompt).toContain('Key pain points');
      expect(result.prospectResearchPrompt).toContain('Decision-making process');
    });

    test('should handle null data', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(null, null, null);
      
      expect(result).toBeDefined();
      expect(result.prospectResearchPrompt).toBeDefined();
      expect(result.valuePropositionPrompt).toBeDefined();
      expect(result.businessCasePrompt).toBeDefined();
    });

    test('should handle undefined data', () => {
      const result = AIIntegrationTemplates.generateClaudePrompts(undefined, undefined, undefined);
      
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    test('should handle array vs string pain points', () => {
      const icpWithStringPain = {
        buyerPersona: {
          painPoints: 'single pain point string'
        }
      };
      
      const result = AIIntegrationTemplates.generateClaudePrompts(icpWithStringPain, {}, {});
      expect(result.prospectResearchPrompt).toContain('single pain point string');
    });
  });

  describe('generateAIPersonas', () => {
    
    test('should generate valid buyer persona', () => {
      const result = AIIntegrationTemplates.generateAIPersonas(mockICPData);
      
      expect(result.buyerPersona).toBeDefined();
      expect(result.buyerPersona.name).toBe('Technical Founder');
      expect(result.buyerPersona.role).toBe('CTO');
      expect(result.buyerPersona.aiInstructions).toContain('role-playing');
      expect(result.buyerPersona.conversationStarters).toBeDefined();
      expect(result.buyerPersona.objectionHandling).toBeDefined();
    });

    test('should generate role playing prompt', () => {
      const result = AIIntegrationTemplates.generateAIPersonas(mockICPData);
      
      expect(result.buyerPersona.rolePlayingPrompt).toContain('role-playing as Technical Founder');
      expect(result.buyerPersona.rolePlayingPrompt).toContain('CTO');
      expect(result.buyerPersona.rolePlayingPrompt).toContain('Decision criteria');
    });

    test('should generate validation prompt', () => {
      const result = AIIntegrationTemplates.generateAIPersonas(mockICPData);
      
      expect(result.buyerPersona.validationPrompt).toContain('validate a business solution');
      expect(result.buyerPersona.validationPrompt).toContain('business value');
    });

    test('should handle missing buyer persona data', () => {
      const result = AIIntegrationTemplates.generateAIPersonas({});
      
      expect(result.buyerPersona.name).toBe('Target Buyer');
      expect(result.buyerPersona.role).toBe('Decision Maker');
      expect(result.buyerPersona.aiInstructions).toContain('professional business terminology');
    });

    test('should handle array conversions for objections', () => {
      const icpWithStringObjections = {
        buyerPersona: {
          objections: 'budget constraints'
        }
      };
      
      const result = AIIntegrationTemplates.generateAIPersonas(icpWithStringObjections);
      expect(result.buyerPersona.aiInstructions).toContain('budget constraints');
    });

    test('should handle array conversions for motivations', () => {
      const icpWithStringMotivations = {
        buyerPersona: {
          motivations: 'cost reduction'
        }
      };
      
      const result = AIIntegrationTemplates.generateAIPersonas(icpWithStringMotivations);
      expect(result.buyerPersona.aiInstructions).toContain('cost reduction');
    });

    test('should handle null input', () => {
      const result = AIIntegrationTemplates.generateAIPersonas(null);
      
      expect(result).toBeDefined();
      expect(result.buyerPersona).toBeDefined();
      expect(result.buyerPersona.name).toBeDefined();
    });
  });

  describe('generateConversationScripts', () => {
    
    test('should generate discovery script with proper structure', () => {
      const result = AIIntegrationTemplates.generateConversationScripts(mockICPData, mockBusinessCaseData);
      
      expect(result.discoveryScript).toBeDefined();
      expect(result.discoveryScript.title).toBe('Discovery Conversation Flow');
      expect(result.discoveryScript.objective).toContain('pain points');
      expect(result.discoveryScript.structure).toBeDefined();
      expect(Array.isArray(result.discoveryScript.structure)).toBe(true);
      expect(result.discoveryScript.structure.length).toBeGreaterThan(0);
    });

    test('should generate discovery script phases', () => {
      const result = AIIntegrationTemplates.generateConversationScripts(mockICPData, mockBusinessCaseData);
      
      const phases = result.discoveryScript.structure.map(phase => phase.phase);
      expect(phases).toContain('Opening');
      expect(phases).toContain('Pain Discovery');
      expect(phases).toContain('Value Exploration');
      expect(phases).toContain('Solution Bridge');
    });

    test('should generate objection handling script', () => {
      const result = AIIntegrationTemplates.generateConversationScripts(mockICPData, mockBusinessCaseData);
      
      expect(result.objectionHandlingScript).toBeDefined();
      expect(result.objectionHandlingScript.title).toBe('Common Objection Responses');
      expect(result.objectionHandlingScript.responses).toBeDefined();
      expect(result.objectionHandlingScript.responses.budget).toBeDefined();
      expect(result.objectionHandlingScript.responses.timing).toBeDefined();
      expect(result.objectionHandlingScript.responses.authority).toBeDefined();
      expect(result.objectionHandlingScript.responses.competition).toBeDefined();
    });

    test('should handle missing pain points gracefully', () => {
      const icpWithNoPainPoints = {
        buyerPersona: {}
      };
      
      const result = AIIntegrationTemplates.generateConversationScripts(icpWithNoPainPoints, mockBusinessCaseData);
      expect(result.discoveryScript.structure[1].script).toContain('operational challenges');
    });

    test('should handle null inputs', () => {
      const result = AIIntegrationTemplates.generateConversationScripts(null, null);
      
      expect(result).toBeDefined();
      expect(result.discoveryScript).toBeDefined();
      expect(result.objectionHandlingScript).toBeDefined();
    });

    test('should handle missing business case data', () => {
      const result = AIIntegrationTemplates.generateConversationScripts(mockICPData, {});
      
      expect(result.discoveryScript.structure[3].script).toContain('Our solution provides significant business value');
    });
  });

  describe('optimizePromptForAI', () => {
    
    test('should optimize prompt for Claude', () => {
      const basePrompt = 'Analyze this prospect';
      const result = AIIntegrationTemplates.optimizePromptForAI(basePrompt, 'claude');
      
      expect(result).toContain('professional sales specialist');
      expect(result).toContain('step by step');
      expect(result).toContain('clear headings');
      expect(result).toContain(basePrompt);
    });

    test('should optimize prompt for ChatGPT', () => {
      const basePrompt = 'Create a business case';
      const result = AIIntegrationTemplates.optimizePromptForAI(basePrompt, 'chatgpt');
      
      expect(result).toContain('experienced B2B sales professional');
      expect(result).toContain('systematically');
      expect(result).toContain('numbered lists');
      expect(result).toContain(basePrompt);
    });

    test('should use generic optimization for unknown AI type', () => {
      const basePrompt = 'Test prompt';
      const result = AIIntegrationTemplates.optimizePromptForAI(basePrompt, 'unknown-ai');
      
      expect(result).toContain('expertise in B2B sales');
      expect(result).toContain('detailed analysis');
      expect(result).toContain(basePrompt);
    });

    test('should handle no AI type specified', () => {
      const basePrompt = 'Test prompt';
      const result = AIIntegrationTemplates.optimizePromptForAI(basePrompt);
      
      expect(result).toContain(basePrompt);
      expect(result).toContain('expertise in B2B sales');
    });

    test('should handle errors gracefully', () => {
      const result = AIIntegrationTemplates.optimizePromptForAI(null, 'claude');
      expect(result).toBeNull();
    });
  });

  describe('replacePromptVariables', () => {
    
    test('should replace standard variables', () => {
      const prompt = 'Research [COMPANY_NAME] in [INDUSTRY]';
      const variables = {
        companyName: 'TechCorp',
        industry: 'Software'
      };
      
      const result = AIIntegrationTemplates.replacePromptVariables(prompt, variables);
      expect(result).toBe('Research TechCorp in Software');
    });

    test('should handle missing variables', () => {
      const prompt = 'Research [COMPANY_NAME] in [INDUSTRY]';
      const variables = {
        companyName: 'TechCorp'
      };
      
      const result = AIIntegrationTemplates.replacePromptVariables(prompt, variables);
      expect(result).toContain('TechCorp');
      expect(result).toContain('[INDUSTRY]'); // Should remain unreplaced
    });

    test('should handle no variables provided', () => {
      const prompt = 'Research [COMPANY_NAME]';
      const result = AIIntegrationTemplates.replacePromptVariables(prompt);
      
      expect(result).toBe('Research [COMPANY_NAME]');
    });

    test('should handle multiple instances of same variable', () => {
      const prompt = '[COMPANY_NAME] overview for [COMPANY_NAME] team';
      const variables = { companyName: 'TechCorp' };
      
      const result = AIIntegrationTemplates.replacePromptVariables(prompt, variables);
      expect(result).toBe('TechCorp overview for TechCorp team');
    });

    test('should handle error cases gracefully', () => {
      const result = AIIntegrationTemplates.replacePromptVariables(null, {});
      expect(result).toBeNull();
    });
  });

  describe('validatePromptData', () => {
    
    test('should validate data with ICP data', () => {
      const data = { icpData: mockICPData };
      const result = AIIntegrationTemplates.validatePromptData(data);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate data with cost data', () => {
      const data = { costData: mockCostData };
      const result = AIIntegrationTemplates.validatePromptData(data);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate data with business case data', () => {
      const data = { businessCaseData: mockBusinessCaseData };
      const result = AIIntegrationTemplates.validatePromptData(data);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should invalidate empty data', () => {
      const result = AIIntegrationTemplates.validatePromptData({});
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('At least one data source');
    });

    test('should invalidate null data', () => {
      const result = AIIntegrationTemplates.validatePromptData(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data provided');
    });

    test('should invalidate non-object data', () => {
      const result = AIIntegrationTemplates.validatePromptData('invalid string');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data provided');
    });
  });

  describe('default fallback functions', () => {
    
    test('should return default prompts', () => {
      const result = AIIntegrationTemplates.getDefaultPrompts();
      
      expect(result.prospectResearchPrompt).toBeDefined();
      expect(result.valuePropositionPrompt).toBeDefined();
      expect(result.businessCasePrompt).toBeDefined();
      expect(result.prospectResearchPrompt).toContain('[COMPANY_NAME]');
    });

    test('should return default persona', () => {
      const result = AIIntegrationTemplates.getDefaultPersona();
      
      expect(result.buyerPersona).toBeDefined();
      expect(result.buyerPersona.name).toBe('Business Decision Maker');
      expect(result.buyerPersona.role).toBe('Director/VP Level');
      expect(result.buyerPersona.conversationStarters).toBeDefined();
    });

    test('should return default scripts', () => {
      const result = AIIntegrationTemplates.getDefaultScripts();
      
      expect(result.discoveryScript).toBeDefined();
      expect(result.discoveryScript.title).toBe('Basic Discovery Flow');
      expect(result.discoveryScript.structure).toBeDefined();
    });
  });

  describe('error handling', () => {
    
    test('should handle internal errors in generateClaudePrompts', () => {
      // Mock data that could cause internal errors
      const problematicData = {
        buyerPersona: {
          get painPoints() { throw new Error('Test error'); }
        }
      };
      
      const result = AIIntegrationTemplates.generateClaudePrompts(problematicData, {}, {});
      expect(result).toBeDefined();
      expect(result.prospectResearchPrompt).toBeDefined();
    });

    test('should handle internal errors in generateAIPersonas', () => {
      const problematicData = {
        get buyerPersona() { throw new Error('Test error'); }
      };
      
      const result = AIIntegrationTemplates.generateAIPersonas(problematicData);
      expect(result).toBeDefined();
      expect(result.buyerPersona).toBeDefined();
    });

    test('should handle internal errors in generateConversationScripts', () => {
      const problematicData = {
        buyerPersona: {
          get painPoints() { throw new Error('Test error'); }
        }
      };
      
      const result = AIIntegrationTemplates.generateConversationScripts(problematicData, {});
      expect(result).toBeDefined();
      expect(result.discoveryScript).toBeDefined();
    });
  });

});

// Manual Testing Function (for browser console testing)
export const runManualAITemplatesTests = () => {
  console.log('🧪 Running AIIntegrationTemplates Manual Tests...');
  
  try {
    const mockData = {
      buyerPersona: {
        name: 'Test Buyer',
        role: 'VP Sales',
        painPoints: ['low conversion', 'manual processes'],
        decisionMaking: 'committee-based'
      }
    };
    
    // Test 1: Claude prompts generation
    const prompts = AIIntegrationTemplates.generateClaudePrompts(mockData, {}, {});
    console.log('✅ Claude prompts generation:', Object.keys(prompts));
    
    // Test 2: AI persona generation
    const personas = AIIntegrationTemplates.generateAIPersonas(mockData);
    console.log('✅ AI persona generation:', personas.buyerPersona.name);
    
    // Test 3: Conversation scripts
    const scripts = AIIntegrationTemplates.generateConversationScripts(mockData, {});
    console.log('✅ Conversation scripts:', scripts.discoveryScript.title);
    
    // Test 4: Prompt optimization
    const optimized = AIIntegrationTemplates.optimizePromptForAI('Test prompt', 'claude');
    console.log('✅ Prompt optimization:', optimized.includes('professional sales specialist'));
    
    // Test 5: Variable replacement
    const replaced = AIIntegrationTemplates.replacePromptVariables(
      'Research [COMPANY_NAME]', 
      { companyName: 'TestCorp' }
    );
    console.log('✅ Variable replacement:', replaced === 'Research TestCorp');
    
    // Test 6: Validation
    const validation = AIIntegrationTemplates.validatePromptData({ icpData: mockData });
    console.log('✅ Data validation:', validation.isValid);
    
    console.log('🎉 All AIIntegrationTemplates manual tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ AIIntegrationTemplates manual test failed:', error);
    return false;
  }
};