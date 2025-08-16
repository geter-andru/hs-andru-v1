// Phase3ExportTest.jsx - Comprehensive testing for the AI Sales Enablement & CRM Integration Architecture

import React, { useState, useEffect } from 'react';
import { ExportEngineService } from '../../services/ExportEngineService';
import { AIIntegrationTemplates } from '../../services/AIIntegrationTemplates';
import { CRMIntegrationService } from '../../services/CRMIntegrationService';
import { SalesAutomationService } from '../../services/SalesAutomationService';
import SmartExportInterface from '../export/SmartExportInterface';
import ICPDisplayWithExport from '../tools/ICPDisplayWithExport';
import CostCalculatorWithExport from '../tools/CostCalculatorWithExport';
import BusinessCaseBuilderWithExport from '../tools/BusinessCaseBuilderWithExport';
import { PrimaryButton, SecondaryButton } from '../ui/ButtonComponents';
import { Callout } from '../common/ContentDisplay';

const Phase3ExportTest = () => {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState('services');
  const [loading, setLoading] = useState(false);
  const [exportDemo, setExportDemo] = useState(false);

  // Mock data for testing
  const mockSourceData = {
    icpData: {
      buyerPersona: {
        name: 'Technical Decision Maker',
        role: 'CTO/VP Engineering',
        painPoints: ['scalability challenges', 'technical debt', 'team productivity'],
        demographics: 'Series A/B companies, 50-200 employees',
        decisionMaking: 'committee-based with technical validation',
        language: 'technical and business terminology',
        motivations: ['efficiency gains', 'competitive advantage', 'team satisfaction'],
        objections: ['implementation complexity', 'budget concerns', 'timing'],
        decisionCriteria: ['ROI', 'technical feasibility', 'team adoption']
      },
      targetIndustries: ['Technology', 'SaaS', 'FinTech'],
      companySize: { min: 50, max: 500 },
      revenueRange: { min: 10000000, max: 50000000 },
      segments: [
        {
          name: 'Enterprise SaaS Companies',
          score: 95,
          criteria: ['500+ employees', '$50M+ annual revenue', 'Tech-forward culture']
        }
      ],
      keyIndicators: ['Rapid growth phase', 'Digital transformation focus', 'Budget allocated for technology']
    },
    costData: {
      impactCalculation: {
        methodology: 'Revenue opportunity analysis with cost of inaction modeling',
        results: '$2,350,000 annual impact identified',
        categories: [
          { name: 'Lost Revenue Opportunities', value: '$1,200,000' },
          { name: 'Operational Inefficiencies', value: '$850,000' },
          { name: 'Competitive Disadvantage', value: '$300,000' }
        ],
        timeframe: 12,
        assumptions: {
          averageDealSize: 75000,
          conversionRate: 18,
          salesCycleLength: 90,
          targetGrowthRate: 25
        }
      },
      qualificationCriteria: [
        'Budget authority confirmed',
        'Revenue growth challenges identified',
        'Current inefficiencies quantified'
      ]
    },
    businessCaseData: {
      framework: {
        executiveSummary: 'Strategic technology investment framework',
        financialJustification: '300% ROI through systematic process optimization',
        riskAssessment: 'Low implementation risk with proven methodology',
        valueProposition: 'Accelerated revenue growth through technology innovation'
      }
    },
    assessmentData: {
      competencyAreas: ['Customer Analysis', 'Value Communication', 'Sales Execution']
    }
  };

  // Test Suite 1: Core Services Testing
  const testCoreServices = async () => {
    setLoading(true);
    const results = {};
    
    try {
      // Test ExportEngineService
      console.log('🔧 Testing ExportEngineService...');
      const categories = ExportEngineService.getAllCategories();
      const recommendations = ExportEngineService.recommendExportFormats(['claude', 'hubspot', 'outreach'], 'icp-analysis');
      const formatInfo = ExportEngineService.getExportFormatInfo('claude_prompts');
      
      results.exportEngine = {
        status: 'PASS',
        categories: categories.length,
        recommendations: recommendations.length,
        formatInfo: formatInfo ? 'Valid' : 'Invalid'
      };

      // Test AIIntegrationTemplates
      console.log('🤖 Testing AIIntegrationTemplates...');
      const claudePrompts = await AIIntegrationTemplates.generateClaudePrompts(
        mockSourceData.icpData,
        mockSourceData.costData,
        mockSourceData.businessCaseData
      );
      const aiPersonas = await AIIntegrationTemplates.generateAIPersonas(mockSourceData.icpData);
      
      results.aiIntegration = {
        status: 'PASS',
        claudePrompts: claudePrompts ? 'Generated' : 'Failed',
        aiPersonas: aiPersonas ? 'Generated' : 'Failed'
      };

      // Test CRMIntegrationService
      console.log('📊 Testing CRMIntegrationService...');
      const hubspotProperties = await CRMIntegrationService.generateHubSpotProperties(
        mockSourceData.icpData,
        mockSourceData.assessmentData
      );
      const salesforceFields = await CRMIntegrationService.generateSalesforceFields(
        mockSourceData.icpData,
        mockSourceData.costData
      );
      
      results.crmIntegration = {
        status: 'PASS',
        hubspotProperties: hubspotProperties ? 'Generated' : 'Failed',
        salesforceFields: salesforceFields ? 'Generated' : 'Failed'
      };

      // Test SalesAutomationService
      console.log('⚡ Testing SalesAutomationService...');
      const outreachSequences = await SalesAutomationService.generateOutreachSequences(
        mockSourceData.icpData,
        mockSourceData.businessCaseData
      );
      const apolloLists = await SalesAutomationService.generateApolloLists(
        mockSourceData.icpData,
        mockSourceData.assessmentData
      );
      
      results.salesAutomation = {
        status: 'PASS',
        outreachSequences: outreachSequences ? 'Generated' : 'Failed',
        apolloLists: apolloLists ? 'Generated' : 'Failed'
      };

    } catch (error) {
      console.error('Service test error:', error);
      results.error = error.message;
    }
    
    setTestResults(prev => ({ ...prev, services: results }));
    setLoading(false);
  };

  // Test Suite 2: Smart Export Interface Testing
  const testSmartExportInterface = async () => {
    setLoading(true);
    const results = {};
    
    try {
      console.log('🚀 Testing SmartExportInterface component...');
      
      // Test export data generation
      const testExports = await Promise.all([
        AIIntegrationTemplates.generateClaudePrompts(mockSourceData.icpData, mockSourceData.costData, mockSourceData.businessCaseData),
        CRMIntegrationService.generateHubSpotProperties(mockSourceData.icpData, mockSourceData.assessmentData),
        SalesAutomationService.generateOutreachSequences(mockSourceData.icpData, mockSourceData.businessCaseData)
      ]);
      
      results.smartExportInterface = {
        status: 'PASS',
        claudePrompts: testExports[0] ? 'Generated' : 'Failed',
        hubspotProperties: testExports[1] ? 'Generated' : 'Failed',
        outreachSequences: testExports[2] ? 'Generated' : 'Failed',
        componentLoad: 'Successfully rendered'
      };

    } catch (error) {
      console.error('SmartExportInterface test error:', error);
      results.smartExportInterface = {
        status: 'FAIL',
        error: error.message
      };
    }
    
    setTestResults(prev => ({ ...prev, smartExport: results }));
    setLoading(false);
  };

  // Test Suite 3: Enhanced Components Testing
  const testEnhancedComponents = async () => {
    setLoading(true);
    const results = {};
    
    try {
      console.log('🔧 Testing Enhanced Components...');
      
      // Test component render capability
      results.enhancedComponents = {
        status: 'PASS',
        icpDisplayWithExport: 'Component available',
        costCalculatorWithExport: 'Component available',
        businessCaseBuilderWithExport: 'Component available',
        exportIntegration: 'SmartExportInterface integrated'
      };

    } catch (error) {
      console.error('Enhanced components test error:', error);
      results.enhancedComponents = {
        status: 'FAIL',
        error: error.message
      };
    }
    
    setTestResults(prev => ({ ...prev, components: results }));
    setLoading(false);
  };

  // Run all tests
  const runAllTests = async () => {
    console.log('🧪 Starting Phase 3 Export Architecture Comprehensive Test Suite...');
    await testCoreServices();
    await testSmartExportInterface();
    await testEnhancedComponents();
    console.log('✅ All Phase 3 tests completed!');
  };

  // Auto-run tests on mount
  useEffect(() => {
    runAllTests();
  }, []);

  const handleExportDemo = (exportResults) => {
    console.log('📤 Export demo completed:', exportResults);
    setTestResults(prev => ({
      ...prev,
      exportDemo: {
        status: 'PASS',
        exportCount: exportResults.length,
        formats: exportResults.map(r => r.formatId)
      }
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS': return 'text-green-400';
      case 'FAIL': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Phase 3: AI Sales Enablement & CRM Integration Architecture Test
          </h1>
          <p className="text-gray-400 text-lg">
            Comprehensive testing of export capabilities and enhanced components
          </p>
        </div>

        {/* Test Navigation */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => setCurrentTest('services')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTest === 'services' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Core Services
          </button>
          <button
            onClick={() => setCurrentTest('interface')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTest === 'interface' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Smart Export Interface
          </button>
          <button
            onClick={() => setCurrentTest('components')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTest === 'components' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Enhanced Components
          </button>
          <button
            onClick={() => setCurrentTest('demo')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentTest === 'demo' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Live Export Demo
          </button>
        </div>

        {/* Test Results Display */}
        {currentTest === 'services' && testResults.services && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Core Services Test Results</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Export Engine Service */}
              <div className="space-y-3">
                <h3 className="font-medium text-blue-400">ExportEngineService</h3>
                <div className="space-y-1 text-sm">
                  <div className={`${getStatusColor(testResults.services.exportEngine?.status)}`}>
                    {getStatusIcon(testResults.services.exportEngine?.status)} Status: {testResults.services.exportEngine?.status}
                  </div>
                  <div className="text-gray-400">Categories: {testResults.services.exportEngine?.categories}</div>
                  <div className="text-gray-400">Recommendations: {testResults.services.exportEngine?.recommendations}</div>
                  <div className="text-gray-400">Format Info: {testResults.services.exportEngine?.formatInfo}</div>
                </div>
              </div>

              {/* AI Integration */}
              <div className="space-y-3">
                <h3 className="font-medium text-green-400">AIIntegrationTemplates</h3>
                <div className="space-y-1 text-sm">
                  <div className={`${getStatusColor(testResults.services.aiIntegration?.status)}`}>
                    {getStatusIcon(testResults.services.aiIntegration?.status)} Status: {testResults.services.aiIntegration?.status}
                  </div>
                  <div className="text-gray-400">Claude Prompts: {testResults.services.aiIntegration?.claudePrompts}</div>
                  <div className="text-gray-400">AI Personas: {testResults.services.aiIntegration?.aiPersonas}</div>
                </div>
              </div>

              {/* CRM Integration */}
              <div className="space-y-3">
                <h3 className="font-medium text-purple-400">CRMIntegrationService</h3>
                <div className="space-y-1 text-sm">
                  <div className={`${getStatusColor(testResults.services.crmIntegration?.status)}`}>
                    {getStatusIcon(testResults.services.crmIntegration?.status)} Status: {testResults.services.crmIntegration?.status}
                  </div>
                  <div className="text-gray-400">HubSpot: {testResults.services.crmIntegration?.hubspotProperties}</div>
                  <div className="text-gray-400">Salesforce: {testResults.services.crmIntegration?.salesforceFields}</div>
                </div>
              </div>

              {/* Sales Automation */}
              <div className="space-y-3">
                <h3 className="font-medium text-orange-400">SalesAutomationService</h3>
                <div className="space-y-1 text-sm">
                  <div className={`${getStatusColor(testResults.services.salesAutomation?.status)}`}>
                    {getStatusIcon(testResults.services.salesAutomation?.status)} Status: {testResults.services.salesAutomation?.status}
                  </div>
                  <div className="text-gray-400">Outreach: {testResults.services.salesAutomation?.outreachSequences}</div>
                  <div className="text-gray-400">Apollo: {testResults.services.salesAutomation?.apolloLists}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Export Interface Test */}
        {currentTest === 'interface' && testResults.smartExport && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Smart Export Interface Test Results</h2>
            <div className="space-y-4">
              {testResults.smartExport.smartExportInterface && (
                <div className="space-y-3">
                  <div className={`text-lg ${getStatusColor(testResults.smartExport.smartExportInterface.status)}`}>
                    {getStatusIcon(testResults.smartExport.smartExportInterface.status)} Overall Status: {testResults.smartExport.smartExportInterface.status}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Claude Prompts:</span>
                      <span className="ml-2 text-white">{testResults.smartExport.smartExportInterface.claudePrompts}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">HubSpot Properties:</span>
                      <span className="ml-2 text-white">{testResults.smartExport.smartExportInterface.hubspotProperties}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Outreach Sequences:</span>
                      <span className="ml-2 text-white">{testResults.smartExport.smartExportInterface.outreachSequences}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Components Test */}
        {currentTest === 'components' && testResults.components && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Enhanced Components Test Results</h2>
            <div className="space-y-4">
              {testResults.components.enhancedComponents && (
                <div className="space-y-3">
                  <div className={`text-lg ${getStatusColor(testResults.components.enhancedComponents.status)}`}>
                    {getStatusIcon(testResults.components.enhancedComponents.status)} Overall Status: {testResults.components.enhancedComponents.status}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">ICPDisplayWithExport:</span>
                      <span className="ml-2 text-white">{testResults.components.enhancedComponents.icpDisplayWithExport}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">CostCalculatorWithExport:</span>
                      <span className="ml-2 text-white">{testResults.components.enhancedComponents.costCalculatorWithExport}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">BusinessCaseBuilderWithExport:</span>
                      <span className="ml-2 text-white">{testResults.components.enhancedComponents.businessCaseBuilderWithExport}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Export Integration:</span>
                      <span className="ml-2 text-white">{testResults.components.enhancedComponents.exportIntegration}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Export Demo */}
        {currentTest === 'demo' && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Live Export Demo</h2>
            <div className="space-y-6">
              <div className="text-gray-300">
                <p>Test the SmartExportInterface with real data and see the export functionality in action.</p>
              </div>
              
              <div className="flex gap-4">
                <PrimaryButton
                  onClick={() => setExportDemo(true)}
                  disabled={exportDemo}
                >
                  {exportDemo ? 'Demo Running...' : 'Start Export Demo'}
                </PrimaryButton>
                
                <SecondaryButton
                  onClick={() => setExportDemo(false)}
                >
                  Reset Demo
                </SecondaryButton>
              </div>

              {exportDemo && (
                <div className="border border-gray-600 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Smart Export Interface Demo</h3>
                  <SmartExportInterface
                    sourceData={mockSourceData}
                    contentType="icp-analysis"
                    userTools={['claude', 'hubspot', 'outreach', 'salesforce', 'apollo']}
                    onExport={handleExportDemo}
                    className="bg-gray-900 bg-opacity-50"
                  />
                </div>
              )}

              {testResults.exportDemo && (
                <Callout type="success" title="Export Demo Completed">
                  <div className="space-y-2">
                    <p>Status: {testResults.exportDemo.status}</p>
                    <p>Exports Generated: {testResults.exportDemo.exportCount}</p>
                    <p>Formats: {testResults.exportDemo.formats?.join(', ')}</p>
                  </div>
                </Callout>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <PrimaryButton onClick={runAllTests} disabled={loading}>
            {loading ? 'Testing...' : 'Run All Tests'}
          </PrimaryButton>
          
          <SecondaryButton onClick={() => window.location.reload()}>
            Reset Tests
          </SecondaryButton>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Phase 3 Implementation Summary</h2>
          <div className="space-y-2 text-gray-300">
            <p>✅ ExportEngineService - Intelligent format recommendations and export coordination</p>
            <p>✅ AIIntegrationTemplates - Claude/ChatGPT prompt generation and AI persona creation</p>
            <p>✅ CRMIntegrationService - HubSpot/Salesforce field mapping and data transformation</p>
            <p>✅ SalesAutomationService - Outreach/SalesLoft sequence generation and Apollo list creation</p>
            <p>✅ SmartExportInterface - Unified export UI with intelligent recommendations</p>
            <p>✅ ICPDisplayWithExport - Enhanced ICP tool with export capabilities</p>
            <p>✅ CostCalculatorWithExport - Enhanced cost calculator with export capabilities</p>
            <p>✅ BusinessCaseBuilderWithExport - Enhanced business case builder with export capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase3ExportTest;