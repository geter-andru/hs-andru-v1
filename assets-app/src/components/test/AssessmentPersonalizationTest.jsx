import React, { useState, useEffect } from 'react';
import { Target, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ProfessionalDashboard from '../dashboard/ProfessionalDashboard';
import { airtableService } from '../../services/airtableService';
import { getMockDataByCustomerId } from '../../data/mockProfessionalData';

const AssessmentPersonalizationTest = () => {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState(null);
  const [testData, setTestData] = useState({});
  const [errors, setErrors] = useState([]);

  // Test scenarios for different assessment levels
  const testScenarios = {
    developing: {
      name: 'Developing Level User',
      customerId: 'CUST_02',
      expectedLevel: 'Developing',
      expectedScore: 67,
      expectedRecommendations: 3,
      expectedTone: 'encouraging'
    },
    expert: {
      name: 'Expert Level User', 
      customerId: 'CUST_4',
      expectedLevel: 'Expert',
      expectedScore: 94,
      expectedRecommendations: 3,
      expectedTone: 'expert'
    },
    critical: {
      name: 'Critical Performance Level',
      customerId: 'TEST_CRITICAL',
      mockData: {
        assessmentData: {
          scores: { overall: 25, buyerUnderstanding: 30, techToValue: 20 },
          performance: { level: 'Critical', isHighPriority: true },
          revenue: { opportunity: 100000, roiMultiplier: 2 }
        },
        personalizedMessaging: {
          urgency: 'immediate',
          tone: 'supportive',
          focus: 'foundational capabilities',
          encouragement: 'Every professional journey starts with a single step.',
          nextStep: 'Focus on foundational customer understanding'
        }
      },
      expectedLevel: 'Critical',
      expectedScore: 25,
      expectedTone: 'supportive'
    }
  };

  // Run comprehensive tests
  const runTests = async () => {
    const results = {};
    const testErrors = [];
    
    try {
      // Test 1: Mock Data Integration
      console.log('🧪 Testing Mock Data Integration...');
      for (const [key, scenario] of Object.entries(testScenarios)) {
        try {
          const mockData = scenario.mockData || getMockDataByCustomerId(scenario.customerId);
          
          results[`mockData_${key}`] = {
            name: `Mock Data - ${scenario.name}`,
            passed: !!mockData.assessmentData,
            details: {
              hasAssessmentData: !!mockData.assessmentData,
              hasPersonalizedMessaging: !!mockData.personalizedMessaging,
              hasPersonalizedRecommendations: !!mockData.personalizedRecommendations,
              assessmentScore: mockData.assessmentData?.overall_score || mockData.assessmentData?.scores?.overall,
              recommendationCount: mockData.personalizedRecommendations?.length || 0
            }
          };
        } catch (error) {
          testErrors.push(`Mock Data Test ${scenario.name}: ${error.message}`);
          results[`mockData_${key}`] = { name: `Mock Data - ${scenario.name}`, passed: false, error: error.message };
        }
      }

      // Test 2: Airtable Service Functions
      console.log('🧪 Testing Airtable Service Functions...');
      
      // Test personalization helper functions
      const testAssessment = {
        performance: { level: 'Developing' },
        revenue: { opportunity: 250000, roiMultiplier: 2.5 },
        scores: { overall: 67, buyerUnderstanding: 72, techToValue: 58 },
        challenges: { total: 5, critical: 1 },
        strategy: { primaryRecommendation: 'Focus on systematic improvement', focusArea: 'customer_analysis' }
      };

      // Test getPersonalizedMessaging
      try {
        const messaging = airtableService.getPersonalizedMessaging(testAssessment);
        results.personalizedMessaging = {
          name: 'Personalized Messaging Generation',
          passed: messaging && messaging.tone === 'encouraging',
          details: {
            hasTone: !!messaging.tone,
            hasEncouragement: !!messaging.encouragement,
            hasNextStep: !!messaging.nextStep,
            hasRevenueMessage: !!messaging.revenueMessage,
            tone: messaging.tone
          }
        };
      } catch (error) {
        testErrors.push(`Personalized Messaging Test: ${error.message}`);
        results.personalizedMessaging = { name: 'Personalized Messaging Generation', passed: false, error: error.message };
      }

      // Test generatePersonalizedRecommendations
      try {
        const recommendations = airtableService.generatePersonalizedRecommendations(testAssessment);
        results.personalizedRecommendations = {
          name: 'Personalized Recommendations Generation',
          passed: Array.isArray(recommendations) && recommendations.length > 0,
          details: {
            isArray: Array.isArray(recommendations),
            count: recommendations.length,
            hasHighPriorityItems: recommendations.some(r => r.priority === 'high'),
            hasCriticalItems: recommendations.some(r => r.priority === 'critical'),
            sampleRecommendation: recommendations[0]?.title
          }
        };
      } catch (error) {
        testErrors.push(`Personalized Recommendations Test: ${error.message}`);
        results.personalizedRecommendations = { name: 'Personalized Recommendations Generation', passed: false, error: error.message };
      }

      // Test 3: Component Integration
      console.log('🧪 Testing Component Integration...');
      
      // Test DevelopmentFocus component props
      const developmentFocusProps = {
        developmentData: { recommendations: [], recentMilestones: [] },
        competencyScores: { customerAnalysis: 67, valueCommunication: 58, salesExecution: 52 },
        assessmentData: testAssessment,
        personalizedMessaging: airtableService.getPersonalizedMessaging(testAssessment),
        personalizedRecommendations: airtableService.generatePersonalizedRecommendations(testAssessment),
        onStartSession: () => {},
        onShowMilestones: () => {}
      };

      results.componentProps = {
        name: 'Component Props Validation',
        passed: developmentFocusProps.assessmentData && developmentFocusProps.personalizedMessaging,
        details: {
          hasAssessmentData: !!developmentFocusProps.assessmentData,
          hasPersonalizedMessaging: !!developmentFocusProps.personalizedMessaging,
          hasPersonalizedRecommendations: !!developmentFocusProps.personalizedRecommendations,
          propsCount: Object.keys(developmentFocusProps).length
        }
      };

      // Test 4: Error Handling
      console.log('🧪 Testing Error Handling...');
      
      // Test with invalid assessment data
      try {
        const invalidMessaging = airtableService.getPersonalizedMessaging(null);
        results.errorHandling = {
          name: 'Error Handling - Null Assessment',
          passed: !!invalidMessaging, // Should return default messaging
          details: {
            handlesNull: !!invalidMessaging,
            hasDefaultTone: invalidMessaging?.tone === 'professional' || invalidMessaging?.tone === 'encouraging'
          }
        };
      } catch (error) {
        results.errorHandling = {
          name: 'Error Handling - Null Assessment',
          passed: false,
          error: error.message
        };
      }

      // Test 5: Performance Level Validation
      console.log('🧪 Testing Performance Level Validation...');
      
      const performanceLevels = ['Critical', 'Needs Work', 'Average', 'Good', 'Excellent'];
      const performanceResults = [];
      
      for (const level of performanceLevels) {
        try {
          const testData = {
            performance: { level },
            revenue: { opportunity: 500000, roiMultiplier: 3 },
            scores: { overall: 50 },
            challenges: { total: 3, critical: 0 },
            strategy: { focusArea: 'customer_analysis' }
          };
          
          const messaging = airtableService.getPersonalizedMessaging(testData);
          performanceResults.push({
            level,
            passed: !!messaging && !!messaging.tone,
            tone: messaging?.tone,
            urgency: messaging?.urgency
          });
        } catch (error) {
          performanceResults.push({
            level,
            passed: false,
            error: error.message
          });
        }
      }

      results.performanceLevels = {
        name: 'Performance Level Validation',
        passed: performanceResults.every(r => r.passed),
        details: { levels: performanceResults }
      };

      setTestResults(results);
      setErrors(testErrors);
      
    } catch (error) {
      console.error('Test suite failed:', error);
      setErrors([...testErrors, `Test Suite Error: ${error.message}`]);
    }
  };

  // Load test data for dashboard preview
  useEffect(() => {
    const loadTestData = () => {
      try {
        const developingData = getMockDataByCustomerId('CUST_02');
        const expertData = getMockDataByCustomerId('CUST_4');
        
        setTestData({
          developing: developingData,
          expert: expertData
        });
      } catch (error) {
        setErrors(prev => [...prev, `Test Data Loading Error: ${error.message}`]);
      }
    };
    
    loadTestData();
  }, []);

  const getStatusIcon = (passed, error) => {
    if (error) return <XCircle className="text-red-500" size={16} />;
    if (passed) return <CheckCircle className="text-green-500" size={16} />;
    return <AlertTriangle className="text-yellow-500" size={16} />;
  };

  const getStatusColor = (passed, error) => {
    if (error) return 'text-red-400';
    if (passed) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Assessment Personalization Testing & Debugging
          </h1>
          <div className="flex gap-4">
            <button
              onClick={runTests}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Run All Tests
            </button>
            <button
              onClick={() => setCurrentTest('developing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'developing'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Developing User Test
            </button>
            <button
              onClick={() => setCurrentTest('expert')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentTest === 'expert'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Expert User Test
            </button>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <h3 className="text-red-400 font-semibold mb-2 flex items-center">
              <XCircle size={18} className="mr-2" />
              Test Errors ({errors.length})
            </h3>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-300 text-sm">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(testResults).map(([key, result]) => (
              <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium text-sm">{result.name}</h4>
                  {getStatusIcon(result.passed, result.error)}
                </div>
                <div className={`text-xs ${getStatusColor(result.passed, result.error)}`}>
                  {result.error ? `Error: ${result.error}` : result.passed ? 'Passed' : 'Failed'}
                </div>
                {result.details && (
                  <div className="mt-2 text-xs text-gray-400">
                    {typeof result.details === 'object' ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    ) : (
                      result.details
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Test Preview */}
        {currentTest && testData[currentTest] && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <Target size={18} className="mr-2 text-blue-400" />
              Dashboard Test Preview - {testScenarios[currentTest]?.name}
            </h3>
            
            {/* Assessment Data Preview */}
            <div className="mb-6 p-4 bg-gray-900 rounded-lg">
              <h4 className="text-gray-300 font-medium mb-2">Assessment Data Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Overall Score:</span>
                  <div className="text-white font-medium">
                    {testData[currentTest].assessmentData?.overall_score || 
                     testData[currentTest].assessmentData?.scores?.overall || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Performance Level:</span>
                  <div className="text-white font-medium">
                    {testData[currentTest].assessmentData?.performance_level || 
                     testData[currentTest].assessmentData?.performance?.level || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Recommendations:</span>
                  <div className="text-white font-medium">
                    {testData[currentTest].personalizedRecommendations?.length || 0}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Messaging Tone:</span>
                  <div className="text-white font-medium">
                    {testData[currentTest].personalizedMessaging?.tone || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Dashboard Preview */}
            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 text-gray-300 text-sm font-medium">
                Live Dashboard Component Test
              </div>
              <div className="bg-gray-900">
                <ProfessionalDashboard
                  customerId={testScenarios[currentTest].customerId}
                  mockMode={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Manual Testing Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <Users size={18} className="mr-2 text-green-400" />
            Manual Testing Checklist
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-gray-300 font-medium mb-3">Visual Validation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Assessment-driven messaging displays correctly</li>
                <li>✓ Personalized recommendations show with proper priorities</li>
                <li>✓ Competency gauges use assessment baselines</li>
                <li>✓ Revenue opportunity messaging appears</li>
                <li>✓ Performance level indicators are accurate</li>
                <li>✓ Professional styling maintained throughout</li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-300 font-medium mb-3">Functional Validation</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ Different user levels show different content</li>
                <li>✓ Priority-based recommendation sorting works</li>
                <li>✓ Assessment data fallbacks function properly</li>
                <li>✓ Error boundaries handle missing data</li>
                <li>✓ Development debug info shows assessment data</li>
                <li>✓ Mobile responsive design maintained</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPersonalizationTest;