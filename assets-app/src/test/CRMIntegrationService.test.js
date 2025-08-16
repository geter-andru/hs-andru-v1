// CRMIntegrationService.test.js - Comprehensive testing for CRMIntegrationService

import { CRMIntegrationService } from '../services/CRMIntegrationService';

// Test Suite for CRMIntegrationService
describe('CRMIntegrationService', () => {
  
  // Mock test data
  const mockICPData = {
    personaTypes: [
      { name: 'Technical Decision Maker', id: 'technical_dm' },
      { name: 'Business Decision Maker', id: 'business_dm' },
      { name: 'Economic Buyer', id: 'economic_buyer' }
    ],
    targetIndustries: ['Technology', 'SaaS', 'Healthcare'],
    companySize: { min: 100, max: 1000 },
    revenueRange: { min: 10000000, max: 100000000 },
    geography: ['United States', 'Canada', 'United Kingdom'],
    technographics: ['Salesforce', 'HubSpot', 'Microsoft'],
    buyerPersona: {
      jobTitles: ['VP Sales', 'Sales Director', 'Revenue Operations'],
      departments: ['Sales', 'Marketing', 'Operations'],
      seniority: ['Director', 'VP', 'C-Level'],
      primaryPainPoint: 'revenue predictability'
    }
  };

  const mockAssessmentData = {
    competencyAreas: [
      'Customer Analysis',
      'Value Communication', 
      'Executive Readiness',
      'Process Optimization'
    ]
  };

  const mockCostData = {
    categories: [
      'Lost Revenue Opportunities',
      'Operational Inefficiencies',
      'Competitive Disadvantage',
      'Productivity Losses'
    ],
    qualificationCriteria: [
      'Budget authority confirmed',
      'Timeline established',
      'Business impact quantified'
    ]
  };

  describe('generateHubSpotProperties', () => {
    
    test('should generate contact properties with ICP fit score', () => {
      const result = CRMIntegrationService.generateHubSpotProperties(mockICPData, mockAssessmentData);
      
      expect(result.contactProperties).toBeDefined();
      expect(Array.isArray(result.contactProperties)).toBe(true);
      
      const icpFitProperty = result.contactProperties.find(prop => prop.name === 'icp_fit_score');
      expect(icpFitProperty).toBeDefined();
      expect(icpFitProperty.type).toBe('number');
      expect(icpFitProperty.options.min).toBe(1);
      expect(icpFitProperty.options.max).toBe(10);
      expect(icpFitProperty.groupName).toBe('h_s_revenue_intelligence');
    });

    test('should generate buyer persona type property with custom persona types', () => {
      const result = CRMIntegrationService.generateHubSpotProperties(mockICPData, mockAssessmentData);
      
      const personaProperty = result.contactProperties.find(prop => prop.name === 'buyer_persona_type');
      expect(personaProperty).toBeDefined();
      expect(personaProperty.type).toBe('enumeration');
      expect(personaProperty.options.length).toBe(3);
      expect(personaProperty.options[0].label).toBe('Technical Decision Maker');
      expect(personaProperty.options[0].value).toBe('technical_dm');
    });

    test('should generate company properties', () => {
      const result = CRMIntegrationService.generateHubSpotProperties(mockICPData, mockAssessmentData);
      
      expect(result.companyProperties).toBeDefined();
      expect(Array.isArray(result.companyProperties)).toBe(true);
      
      const companyFitProperty = result.companyProperties.find(prop => prop.name === 'icp_company_fit_score');
      expect(companyFitProperty).toBeDefined();
      expect(companyFitProperty.type).toBe('number');
    });

    test('should generate deal properties', () => {
      const result = CRMIntegrationService.generateHubSpotProperties(mockICPData, mockAssessmentData);
      
      expect(result.dealProperties).toBeDefined();
      expect(Array.isArray(result.dealProperties)).toBe(true);
      
      const financialImpactProperty = result.dealProperties.find(prop => prop.name === 'financial_impact_projection');
      expect(financialImpactProperty).toBeDefined();
      expect(financialImpactProperty.type).toBe('number');
    });

    test('should generate property groups', () => {
      const result = CRMIntegrationService.generateHubSpotProperties(mockICPData, mockAssessmentData);
      
      expect(result.propertyGroups).toBeDefined();
      expect(Array.isArray(result.propertyGroups)).toBe(true);
      expect(result.propertyGroups[0].name).toBe('h_s_revenue_intelligence');
      expect(result.propertyGroups[0].label).toBe('H&S Revenue Intelligence');
    });

    test('should handle missing persona types', () => {
      const icpWithoutPersonas = { ...mockICPData };
      delete icpWithoutPersonas.personaTypes;
      
      const result = CRMIntegrationService.generateHubSpotProperties(icpWithoutPersonas, mockAssessmentData);
      
      const personaProperty = result.contactProperties.find(prop => prop.name === 'buyer_persona_type');
      expect(personaProperty.options.length).toBe(4); // Default persona types
    });

    test('should handle missing competency areas', () => {
      const assessmentWithoutCompetencies = { ...mockAssessmentData };
      delete assessmentWithoutCompetencies.competencyAreas;
      
      const result = CRMIntegrationService.generateHubSpotProperties(mockICPData, assessmentWithoutCompetencies);
      
      expect(result.contactProperties).toBeDefined();
      expect(result.contactProperties.length).toBeGreaterThan(0);
    });

    test('should handle null inputs', () => {
      const result = CRMIntegrationService.generateHubSpotProperties(null, null);
      
      expect(result).toBeDefined();
      expect(result.contactProperties).toBeDefined();
      expect(result.companyProperties).toBeDefined();
      expect(result.dealProperties).toBeDefined();
    });

    test('should handle empty objects', () => {
      const result = CRMIntegrationService.generateHubSpotProperties({}, {});
      
      expect(result.contactProperties).toBeDefined();
      expect(Array.isArray(result.contactProperties)).toBe(true);
      expect(result.contactProperties.length).toBeGreaterThan(0);
    });
  });

  describe('generateSalesforceFields', () => {
    
    test('should generate custom fields with proper Salesforce structure', () => {
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, mockCostData);
      
      expect(result.customFields).toBeDefined();
      expect(Array.isArray(result.customFields)).toBe(true);
      
      const icpField = result.customFields.find(field => field.fullName === 'Account.ICP_Fit_Score__c');
      expect(icpField).toBeDefined();
      expect(icpField.type).toBe('Number');
      expect(icpField.precision).toBe(3);
      expect(icpField.scale).toBe(1);
      expect(icpField.trackTrending).toBe(true);
    });

    test('should generate contact decision making style field', () => {
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, mockCostData);
      
      const decisionField = result.customFields.find(field => field.fullName === 'Contact.Decision_Making_Style__c');
      expect(decisionField).toBeDefined();
      expect(decisionField.type).toBe('Picklist');
      expect(decisionField.valueSet.restricted).toBe(true);
      expect(decisionField.valueSet.valueSetDefinition.value.length).toBe(4);
    });

    test('should generate opportunity fields with currency types', () => {
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, mockCostData);
      
      const costField = result.customFields.find(field => field.fullName === 'Opportunity.Cost_of_Inaction__c');
      expect(costField).toBeDefined();
      expect(costField.type).toBe('Currency');
      expect(costField.precision).toBe(10);
      expect(costField.trackTrending).toBe(true);
    });

    test('should generate workflows with proper trigger conditions', () => {
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, mockCostData);
      
      expect(result.workflows).toBeDefined();
      expect(Array.isArray(result.workflows)).toBe(true);
      
      const icpWorkflow = result.workflows.find(wf => wf.name === 'H&S_ICP_Score_Alert');
      expect(icpWorkflow).toBeDefined();
      expect(icpWorkflow.triggerCondition).toBe('ICP_Fit_Score__c >= 8.5');
      expect(icpWorkflow.actions.length).toBe(2);
      expect(icpWorkflow.actions[0].type).toBe('Task');
      expect(icpWorkflow.actions[1].type).toBe('Email');
    });

    test('should generate report types', () => {
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, mockCostData);
      
      expect(result.reportTypes).toBeDefined();
      expect(Array.isArray(result.reportTypes)).toBe(true);
      
      const pipelineReport = result.reportTypes.find(report => report.name === 'H&S Revenue Intelligence Pipeline');
      expect(pipelineReport).toBeDefined();
      expect(pipelineReport.baseObject).toBe('Opportunity');
      expect(pipelineReport.fields.length).toBeGreaterThan(0);
      expect(pipelineReport.filters.length).toBeGreaterThan(0);
    });

    test('should handle missing cost categories', () => {
      const costWithoutCategories = { ...mockCostData };
      delete costWithoutCategories.categories;
      
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, costWithoutCategories);
      expect(result.customFields.length).toBeGreaterThan(0);
    });

    test('should handle null inputs', () => {
      const result = CRMIntegrationService.generateSalesforceFields(null, null);
      
      expect(result).toBeDefined();
      expect(result.customFields).toBeDefined();
      expect(result.workflows).toBeDefined();
      expect(result.reportTypes).toBeDefined();
    });
  });

  describe('generatePipedriveData', () => {
    
    test('should generate custom fields with proper Pipedrive structure', () => {
      const result = CRMIntegrationService.generatePipedriveData(mockICPData, mockAssessmentData);
      
      expect(result.customFields).toBeDefined();
      expect(Array.isArray(result.customFields)).toBe(true);
      
      const icpField = result.customFields.find(field => field.key === 'icp_fit_score');
      expect(icpField).toBeDefined();
      expect(icpField.field_type).toBe('double');
      expect(icpField.options.min).toBe(1);
      expect(icpField.options.max).toBe(10);
    });

    test('should generate buyer persona field with enum options', () => {
      const result = CRMIntegrationService.generatePipedriveData(mockICPData, mockAssessmentData);
      
      const personaField = result.customFields.find(field => field.key === 'buyer_persona');
      expect(personaField).toBeDefined();
      expect(personaField.field_type).toBe('enum');
      expect(personaField.options.length).toBe(3);
      expect(personaField.options[0].label).toBe('Technical Decision Maker');
    });

    test('should generate monetary fields', () => {
      const result = CRMIntegrationService.generatePipedriveData(mockICPData, mockAssessmentData);
      
      const financialField = result.customFields.find(field => field.key === 'financial_impact');
      expect(financialField).toBeDefined();
      expect(financialField.field_type).toBe('monetary');
      expect(financialField.currency).toBe('USD');
    });

    test('should generate activity types', () => {
      const result = CRMIntegrationService.generatePipedriveData(mockICPData, mockAssessmentData);
      
      expect(result.activities).toBeDefined();
      expect(Array.isArray(result.activities)).toBe(true);
      
      const icpActivity = result.activities.find(activity => activity.name === 'H&S ICP Analysis');
      expect(icpActivity).toBeDefined();
      expect(icpActivity.icon_key).toBe('analysis');
      expect(icpActivity.color).toBe('blue');
    });

    test('should generate import templates', () => {
      const result = CRMIntegrationService.generatePipedriveData(mockICPData, mockAssessmentData);
      
      expect(result.importTemplates).toBeDefined();
      expect(result.importTemplates.contacts).toBeDefined();
      expect(result.importTemplates.deals).toBeDefined();
      
      expect(result.importTemplates.contacts.columns).toContain('ICP Fit Score');
      expect(result.importTemplates.contacts.mapping['ICP Fit Score']).toBe('icp_fit_score');
      
      expect(result.importTemplates.deals.columns).toContain('Financial Impact');
      expect(result.importTemplates.deals.mapping['Financial Impact']).toBe('financial_impact');
    });

    test('should handle missing persona types', () => {
      const icpWithoutPersonas = { ...mockICPData };
      delete icpWithoutPersonas.personaTypes;
      
      const result = CRMIntegrationService.generatePipedriveData(icpWithoutPersonas, mockAssessmentData);
      
      const personaField = result.customFields.find(field => field.key === 'buyer_persona');
      expect(personaField.options.length).toBe(3); // Default personas
    });

    test('should handle null inputs', () => {
      const result = CRMIntegrationService.generatePipedriveData(null, null);
      
      expect(result).toBeDefined();
      expect(result.customFields).toBeDefined();
      expect(result.activities).toBeDefined();
      expect(result.importTemplates).toBeDefined();
    });
  });

  describe('validateCRMData', () => {
    
    test('should validate HubSpot data with ICP data', () => {
      const data = { icpData: mockICPData };
      const result = CRMIntegrationService.validateCRMData(data, 'hubspot');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate HubSpot data with assessment data', () => {
      const data = { assessmentData: mockAssessmentData };
      const result = CRMIntegrationService.validateCRMData(data, 'hubspot');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate Salesforce data with ICP data', () => {
      const data = { icpData: mockICPData };
      const result = CRMIntegrationService.validateCRMData(data, 'salesforce');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate Salesforce data with cost data', () => {
      const data = { costData: mockCostData };
      const result = CRMIntegrationService.validateCRMData(data, 'salesforce');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate Pipedrive data with ICP data', () => {
      const data = { icpData: mockICPData };
      const result = CRMIntegrationService.validateCRMData(data, 'pipedrive');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should invalidate missing required data for HubSpot', () => {
      const data = { otherData: 'test' };
      const result = CRMIntegrationService.validateCRMData(data, 'hubspot');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('HubSpot integration requires');
    });

    test('should invalidate missing required data for Salesforce', () => {
      const data = { otherData: 'test' };
      const result = CRMIntegrationService.validateCRMData(data, 'salesforce');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Salesforce integration requires');
    });

    test('should invalidate unsupported CRM type', () => {
      const data = { icpData: mockICPData };
      const result = CRMIntegrationService.validateCRMData(data, 'unsupported-crm');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unsupported CRM type');
    });

    test('should invalidate null data', () => {
      const result = CRMIntegrationService.validateCRMData(null, 'hubspot');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data object');
    });

    test('should invalidate non-object data', () => {
      const result = CRMIntegrationService.validateCRMData('invalid string', 'hubspot');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid data object');
    });
  });

  describe('default fallback functions', () => {
    
    test('should return default HubSpot properties', () => {
      const result = CRMIntegrationService.getDefaultHubSpotProperties();
      
      expect(result.contactProperties).toBeDefined();
      expect(result.dealProperties).toBeDefined();
      expect(Array.isArray(result.contactProperties)).toBe(true);
      expect(Array.isArray(result.dealProperties)).toBe(true);
      
      const icpProperty = result.contactProperties.find(prop => prop.name === 'icp_fit_score');
      expect(icpProperty).toBeDefined();
    });

    test('should return default Salesforce fields', () => {
      const result = CRMIntegrationService.getDefaultSalesforceFields();
      
      expect(result.customFields).toBeDefined();
      expect(result.workflows).toBeDefined();
      expect(Array.isArray(result.customFields)).toBe(true);
      expect(Array.isArray(result.workflows)).toBe(true);
      
      const icpField = result.customFields.find(field => field.fullName === 'Account.ICP_Fit_Score__c');
      expect(icpField).toBeDefined();
    });

    test('should return default Pipedrive data', () => {
      const result = CRMIntegrationService.getDefaultPipedriveData();
      
      expect(result.customFields).toBeDefined();
      expect(result.activities).toBeDefined();
      expect(result.importTemplates).toBeDefined();
      expect(Array.isArray(result.customFields)).toBe(true);
      expect(Array.isArray(result.activities)).toBe(true);
      
      const icpField = result.customFields.find(field => field.key === 'icp_fit_score');
      expect(icpField).toBeDefined();
    });
  });

  describe('error handling', () => {
    
    test('should handle internal errors in generateHubSpotProperties', () => {
      const problematicData = {
        get personaTypes() { throw new Error('Test error'); }
      };
      
      const result = CRMIntegrationService.generateHubSpotProperties(problematicData, mockAssessmentData);
      expect(result).toBeDefined();
      expect(result.contactProperties).toBeDefined();
    });

    test('should handle internal errors in generateSalesforceFields', () => {
      const problematicData = {
        get categories() { throw new Error('Test error'); }
      };
      
      const result = CRMIntegrationService.generateSalesforceFields(mockICPData, problematicData);
      expect(result).toBeDefined();
      expect(result.customFields).toBeDefined();
    });

    test('should handle internal errors in generatePipedriveData', () => {
      const problematicData = {
        get personaTypes() { throw new Error('Test error'); }
      };
      
      const result = CRMIntegrationService.generatePipedriveData(problematicData, mockAssessmentData);
      expect(result).toBeDefined();
      expect(result.customFields).toBeDefined();
    });

    test('should handle validation errors gracefully', () => {
      const problematicData = {
        get icpData() { throw new Error('Test error'); }
      };
      
      const result = CRMIntegrationService.validateCRMData(problematicData, 'hubspot');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

});

// Manual Testing Function (for browser console testing)
export const runManualCRMTests = () => {
  console.log('🧪 Running CRMIntegrationService Manual Tests...');
  
  try {
    const mockData = {
      personaTypes: [{ name: 'Test Buyer', id: 'test_buyer' }],
      buyerPersona: { primaryPainPoint: 'efficiency' }
    };
    
    const assessmentData = {
      competencyAreas: ['Customer Analysis', 'Value Communication']
    };
    
    // Test 1: HubSpot properties generation
    const hubSpotProps = CRMIntegrationService.generateHubSpotProperties(mockData, assessmentData);
    console.log('✅ HubSpot properties:', hubSpotProps.contactProperties.length);
    
    // Test 2: Salesforce fields generation
    const salesforceFields = CRMIntegrationService.generateSalesforceFields(mockData, {});
    console.log('✅ Salesforce fields:', salesforceFields.customFields.length);
    
    // Test 3: Pipedrive data generation
    const pipedriveData = CRMIntegrationService.generatePipedriveData(mockData, assessmentData);
    console.log('✅ Pipedrive data:', pipedriveData.customFields.length);
    
    // Test 4: Validation
    const validation = CRMIntegrationService.validateCRMData({ icpData: mockData }, 'hubspot');
    console.log('✅ Validation result:', validation.isValid);
    
    // Test 5: Default fallbacks
    const defaultHubSpot = CRMIntegrationService.getDefaultHubSpotProperties();
    console.log('✅ Default HubSpot properties:', defaultHubSpot.contactProperties.length);
    
    // Test 6: Error handling
    const errorTest = CRMIntegrationService.validateCRMData(null, 'hubspot');
    console.log('✅ Error handling test:', !errorTest.isValid);
    
    console.log('🎉 All CRMIntegrationService manual tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ CRMIntegrationService manual test failed:', error);
    return false;
  }
};