// ExportEngineService.test.js - Comprehensive testing for ExportEngineService

import { ExportEngineService } from '../services/ExportEngineService';

// Test Suite for ExportEngineService
describe('ExportEngineService', () => {
  
  // Test data
  const mockUserTools = ['claude', 'hubspot', 'outreach'];
  const mockEmptyTools = [];
  const mockInvalidTools = null;
  
  const mockICPData = {
    buyerPersona: {
      name: 'Technical Founder',
      role: 'CTO',
      painPoints: ['scaling challenges', 'manual processes']
    },
    content: {
      demographics: 'Series A companies',
      psychographics: 'Data-driven decision makers'
    }
  };

  describe('recommendExportFormats', () => {
    
    test('should return AI tools for AI-related user tools', () => {
      const result = ExportEngineService.recommendExportFormats(['claude', 'chatgpt'], 'icp-analysis');
      expect(result).toContain('claude_prompts');
      expect(result).toContain('persona_briefs');
    });

    test('should return CRM formats for CRM user tools', () => {
      const result = ExportEngineService.recommendExportFormats(['hubspot', 'salesforce'], 'icp-analysis');
      expect(result).toContain('hubspot_properties');
      expect(result).toContain('salesforce_fields');
    });

    test('should return sales automation formats for sales tools', () => {
      const result = ExportEngineService.recommendExportFormats(['outreach', 'salesloft'], 'icp-analysis');
      expect(result).toContain('outreach_sequences');
      expect(result).toContain('apollo_lists');
    });

    test('should handle empty user tools array', () => {
      const result = ExportEngineService.recommendExportFormats([], 'icp-analysis');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle null user tools', () => {
      const result = ExportEngineService.recommendExportFormats(null, 'icp-analysis');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle undefined user tools', () => {
      const result = ExportEngineService.recommendExportFormats(undefined, 'icp-analysis');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle invalid content type', () => {
      const result = ExportEngineService.recommendExportFormats(mockUserTools, 'invalid-content-type');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle null content type', () => {
      const result = ExportEngineService.recommendExportFormats(mockUserTools, null);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should return unique recommendations (no duplicates)', () => {
      const result = ExportEngineService.recommendExportFormats(mockUserTools, 'icp-analysis');
      const uniqueResult = [...new Set(result)];
      expect(result.length).toBe(uniqueResult.length);
    });

  });

  describe('getExportFormatInfo', () => {
    
    test('should return valid info for claude_prompts', () => {
      const result = ExportEngineService.getExportFormatInfo('claude_prompts');
      expect(result.name).toBe('Claude Prompt Templates');
      expect(result.category).toBe('ai_tools');
      expect(result.description).toContain('Claude AI');
      expect(result.fileType).toBe('text');
      expect(Array.isArray(result.variables)).toBe(true);
    });

    test('should return valid info for hubspot_properties', () => {
      const result = ExportEngineService.getExportFormatInfo('hubspot_properties');
      expect(result.name).toBe('HubSpot Custom Properties');
      expect(result.category).toBe('crm_platforms');
      expect(result.description).toContain('HubSpot');
      expect(result.fileType).toBe('json');
    });

    test('should return default info for invalid format', () => {
      const result = ExportEngineService.getExportFormatInfo('invalid-format');
      expect(result.name).toBe('Unknown Format');
      expect(result.category).toBe('unknown');
      expect(result.fileType).toBe('text');
    });

    test('should handle null format ID', () => {
      const result = ExportEngineService.getExportFormatInfo(null);
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });

    test('should handle undefined format ID', () => {
      const result = ExportEngineService.getExportFormatInfo(undefined);
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
    });

  });

  describe('validateExportData', () => {
    
    test('should validate AI tools data with content', () => {
      const mockData = { content: 'test content', buyerPersona: mockICPData.buyerPersona };
      const result = ExportEngineService.validateExportData(mockData, 'claude_prompts');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate CRM data with ICP data', () => {
      const mockData = { icpData: mockICPData };
      const result = ExportEngineService.validateExportData(mockData, 'hubspot_properties');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should invalidate null data', () => {
      const result = ExportEngineService.validateExportData(null, 'claude_prompts');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data object');
    });

    test('should invalidate undefined data', () => {
      const result = ExportEngineService.validateExportData(undefined, 'claude_prompts');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data object');
    });

    test('should invalidate string data', () => {
      const result = ExportEngineService.validateExportData('invalid string', 'claude_prompts');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data object');
    });

    test('should handle AI tools validation failure', () => {
      const mockData = { invalidField: 'test' };
      const result = ExportEngineService.validateExportData(mockData, 'claude_prompts');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('AI tools export requires');
    });

  });

  describe('getFormatsForCategory', () => {
    
    test('should return AI tools formats', () => {
      const result = ExportEngineService.getFormatsForCategory('ai_tools');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('category');
    });

    test('should return CRM formats', () => {
      const result = ExportEngineService.getFormatsForCategory('crm_platforms');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(format => format.id === 'hubspot_properties')).toBe(true);
    });

    test('should handle invalid category', () => {
      const result = ExportEngineService.getFormatsForCategory('invalid-category');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('should handle null category', () => {
      const result = ExportEngineService.getFormatsForCategory(null);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

  });

  describe('getAllCategories', () => {
    
    test('should return all categories with metadata', () => {
      const result = ExportEngineService.getAllCategories();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(4); // ai_tools, crm_platforms, sales_automation, business_intelligence
      
      result.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('icon');
      });
    });

    test('should include expected categories', () => {
      const result = ExportEngineService.getAllCategories();
      const categoryIds = result.map(cat => cat.id);
      
      expect(categoryIds).toContain('ai_tools');
      expect(categoryIds).toContain('crm_platforms');
      expect(categoryIds).toContain('sales_automation');
      expect(categoryIds).toContain('business_intelligence');
    });

  });

  describe('category helper methods', () => {
    
    test('getCategoryDisplayName should return proper names', () => {
      expect(ExportEngineService.getCategoryDisplayName('ai_tools')).toBe('AI Sales Enablement');
      expect(ExportEngineService.getCategoryDisplayName('crm_platforms')).toBe('CRM Enhancement');
      expect(ExportEngineService.getCategoryDisplayName('invalid')).toBe('Unknown Category');
    });

    test('getCategoryDescription should return proper descriptions', () => {
      const aiDesc = ExportEngineService.getCategoryDescription('ai_tools');
      expect(aiDesc).toContain('AI tools');
      expect(aiDesc).toContain('Claude');
      
      const crmDesc = ExportEngineService.getCategoryDescription('crm_platforms');
      expect(crmDesc).toContain('HubSpot');
      expect(crmDesc).toContain('Salesforce');
    });

    test('getCategoryIcon should return proper icons', () => {
      expect(ExportEngineService.getCategoryIcon('ai_tools')).toBe('🤖');
      expect(ExportEngineService.getCategoryIcon('crm_platforms')).toBe('📊');
      expect(ExportEngineService.getCategoryIcon('invalid')).toBe('📄');
    });

  });

  describe('error handling', () => {
    
    test('should handle internal errors gracefully', () => {
      // Test with malformed data that might cause internal errors
      const result = ExportEngineService.recommendExportFormats(
        { toString: () => { throw new Error('Test error'); } }, 
        'icp-analysis'
      );
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should handle validation errors gracefully', () => {
      const result = ExportEngineService.validateExportData(
        { get test() { throw new Error('Test error'); } }, 
        'claude_prompts'
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

  });

});

// Manual Testing Function (for browser console testing)
export const runManualTests = () => {
  console.log('🧪 Running ExportEngineService Manual Tests...');
  
  try {
    // Test 1: Basic recommendation
    const recommendations = ExportEngineService.recommendExportFormats(['claude', 'hubspot'], 'icp-analysis');
    console.log('✅ Basic recommendations:', recommendations);
    
    // Test 2: Format info
    const formatInfo = ExportEngineService.getExportFormatInfo('claude_prompts');
    console.log('✅ Format info:', formatInfo);
    
    // Test 3: Categories
    const categories = ExportEngineService.getAllCategories();
    console.log('✅ All categories:', categories);
    
    // Test 4: Validation
    const validationResult = ExportEngineService.validateExportData(
      { content: 'test', icpData: {} }, 
      'claude_prompts'
    );
    console.log('✅ Validation result:', validationResult);
    
    // Test 5: Error handling
    const errorTest = ExportEngineService.recommendExportFormats(null, null);
    console.log('✅ Error handling test:', errorTest);
    
    console.log('🎉 All manual tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
    return false;
  }
};