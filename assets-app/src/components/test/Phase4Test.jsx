import React, { useState, useEffect } from 'react';
import { Activity, BarChart3, Trophy, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import enhancedAirtableService from '../../services/enhancedAirtableService';

const Phase4Test = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      {
        id: 'competency_data',
        name: 'Load Competency Data',
        description: 'Fetch comprehensive customer competency information',
        test: () => enhancedAirtableService.getCustomerCompetencyData('CUST_4')
      },
      {
        id: 'track_action', 
        name: 'Track Real-World Action',
        description: 'Record a high-impact customer meeting',
        test: () => enhancedAirtableService.trackRealWorldAction('CUST_4', {
          type: 'customer_meeting',
          description: 'Phase 4 React Integration Test - Strategic enterprise meeting',
          impact: 'high',
          category: 'customerAnalysis',
          pointsAwarded: 180,
          evidenceLink: 'https://example.com/test-meeting'
        })
      },
      {
        id: 'record_assessment',
        name: 'Record Assessment',
        description: 'Save assessment results with competency history',
        test: () => enhancedAirtableService.recordAssessmentResults('CUST_4', {
          customerAnalysisScore: 78,
          valueCommunicationScore: 85,
          salesExecutionScore: 71,
          totalProgressPoints: 1500,
          assessmentType: 'progress',
          notes: 'Phase 4 React integration test assessment',
          updateCurrent: true
        })
      },
      {
        id: 'unlock_achievement',
        name: 'Unlock Achievement',
        description: 'Award achievement with bonus points',
        test: () => enhancedAirtableService.unlockAchievement('CUST_4', 'phase_4_integration_test', 75)
      },
      {
        id: 'action_statistics',
        name: 'Calculate Statistics', 
        description: 'Generate action analytics and insights',
        test: () => enhancedAirtableService.getActionStatistics('CUST_4')
      },
      {
        id: 'learning_velocity',
        name: 'Learning Velocity',
        description: 'Calculate weekly progress points velocity',
        test: () => enhancedAirtableService.calculateLearningVelocity('CUST_4')
      }
    ];

    for (const test of tests) {
      setCurrentTest(test.name);
      
      try {
        const startTime = Date.now();
        const result = await test.test();
        const duration = Date.now() - startTime;
        
        setTestResults(prev => [...prev, {
          ...test,
          status: 'success',
          duration,
          result: result,
          details: getTestDetails(test.id, result)
        }]);
        
      } catch (error) {
        setTestResults(prev => [...prev, {
          ...test,
          status: 'error',
          error: error.message,
          details: `Error: ${error.message}`
        }]);
      }
      
      // Small delay for UI feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setCurrentTest(null);
    setIsRunning(false);
  };

  const getTestDetails = (testId, result) => {
    switch (testId) {
      case 'competency_data':
        return result ? `Loaded: ${result.competencyLevel} (${result.totalProgressPoints} points, ${result.achievementIds.length} achievements)` : 'No data found';
      case 'track_action':
        return result ? `Action tracked: ${result.id} (180 points awarded)` : 'Failed to track';
      case 'record_assessment':
        return result ? `Assessment recorded: ${result.id}` : 'Failed to record';
      case 'unlock_achievement':
        return result?.success ? `Achievement unlocked: ${result.achievementId} (+${result.bonusPoints} points)` : 
               result?.alreadyUnlocked ? 'Already unlocked' : 'Failed to unlock';
      case 'action_statistics':
        return result ? `${result.totalActions} actions, ${result.totalPoints} total points` : 'No statistics';
      case 'learning_velocity':
        return `${result} points per week`;
      default:
        return 'Test completed';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phase 4 Integration Test</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive testing of the enhanced Airtable competency tracking system
              </p>
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {isRunning ? 'Running Tests...' : 'Run Phase 4 Tests'}
          </button>

          {currentTest && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-semibold text-blue-800">Currently Running: {currentTest}</span>
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h2>
            
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div 
                  key={test.id}
                  className={`p-4 rounded-lg border ${
                    test.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                        <p className="text-sm font-mono text-gray-700">{test.details}</p>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      {test.duration && (
                        <div>{test.duration}ms</div>
                      )}
                      <div>#{index + 1}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4">Test Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testResults.filter(t => t.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {testResults.filter(t => t.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {testResults.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>

              {testResults.every(t => t.status === 'success') && (
                <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
                  <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-green-800">🎉 All Phase 4 Features Working!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Professional competency tracking system is fully operational
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Overview */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Phase 4 Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-World Action Tracking</h3>
              <p className="text-sm text-gray-600">
                Honor-based system for tracking customer meetings, proposals, and business development activities
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Assessment Recording</h3>
              <p className="text-sm text-gray-600">
                Complete competency history with baseline vs current progress comparison
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Achievement System</h3>
              <p className="text-sm text-gray-600">
                Professional milestone tracking with bonus points and recognition
              </p>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <Zap className="w-6 h-6 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Learning Analytics</h3>
              <p className="text-sm text-gray-600">
                Velocity calculations, action statistics, and professional development insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase4Test;