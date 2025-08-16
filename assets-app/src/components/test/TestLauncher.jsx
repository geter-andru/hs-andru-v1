import React, { useState } from 'react';
import { Target, Play, CheckCircle, XCircle, TestTube, FlaskConical } from 'lucide-react';
import AssessmentPersonalizationTest from './AssessmentPersonalizationTest';
import DashboardTest from './DashboardTest';
import Phase1Test from './Phase1Test';
import Phase4Test from './Phase4Test';
import WelcomeExperienceTest from './WelcomeExperienceTest';
import SimplifiedPlatformTest from './SimplifiedPlatformTest';

const TestLauncher = () => {
  const [activeTest, setActiveTest] = useState(null);
  const [testResults, setTestResults] = useState({});

  const availableTests = [
    {
      id: 'assessment-personalization',
      name: 'Assessment Personalization',
      description: 'Test assessment data integration and personalized messaging',
      component: AssessmentPersonalizationTest,
      priority: 'critical',
      estimatedTime: '10 minutes'
    },
    {
      id: 'phase4-integration',
      name: 'Phase 4 Integration',
      description: 'Test professional competency tracking and Airtable integration',
      component: Phase4Test,
      priority: 'high',
      estimatedTime: '8 minutes'
    },
    {
      id: 'dashboard-full',
      name: 'Full Dashboard',
      description: 'Test complete dashboard functionality with all components',
      component: DashboardTest,
      priority: 'high',
      estimatedTime: '12 minutes'
    },
    {
      id: 'phase1-tools',
      name: 'Phase 1 Tools',
      description: 'Test ICP Analysis, Cost Calculator, and Business Case tools',
      component: Phase1Test,
      priority: 'medium',
      estimatedTime: '15 minutes'
    },
    {
      id: 'welcome-experience',
      name: 'Welcome Experience',
      description: 'Test user onboarding and progressive engagement flow',
      component: WelcomeExperienceTest,
      priority: 'medium',
      estimatedTime: '5 minutes'
    },
    {
      id: 'simplified-platform',
      name: 'Simplified Platform',
      description: 'Test simplified platform components and feature flags',
      component: SimplifiedPlatformTest,
      priority: 'critical',
      estimatedTime: '8 minutes'
    }
  ];

  const handleRunTest = (testId) => {
    const test = availableTests.find(t => t.id === testId);
    if (test) {
      setActiveTest(test);
      setTestResults(prev => ({
        ...prev,
        [testId]: { status: 'running', startTime: Date.now() }
      }));
    }
  };

  const handleBackToLauncher = () => {
    setActiveTest(null);
  };

  const handleTestComplete = (testId, results) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        status: 'completed',
        endTime: Date.now(),
        results
      }
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500 bg-red-900/20';
      case 'high': return 'border-l-orange-500 bg-orange-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-900/20';
      default: return 'border-l-gray-500 bg-gray-900/20';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getTestStatus = (testId) => {
    const result = testResults[testId];
    if (!result) return null;
    
    if (result.status === 'running') {
      return <div className="flex items-center text-blue-400"><TestTube className="animate-spin mr-1" size={16} />Running...</div>;
    }
    
    if (result.status === 'completed') {
      const duration = Math.round((result.endTime - result.startTime) / 1000);
      return <div className="flex items-center text-green-400"><CheckCircle className="mr-1" size={16} />Completed ({duration}s)</div>;
    }
    
    return null;
  };

  // If a test is active, render it
  if (activeTest) {
    const TestComponent = activeTest.component;
    return <TestComponent onBack={handleBackToLauncher} onComplete={(results) => handleTestComplete(activeTest.id, results)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <FlaskConical size={32} className="mr-3 text-blue-400" />
            Assessment Personalization Testing & Debugging
          </h1>
          <p className="text-gray-400">
            Comprehensive testing suite for assessment-driven personalization integration
          </p>
        </div>

        {/* Test Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Total Tests</div>
            <div className="text-2xl font-bold text-white">{availableTests.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Completed</div>
            <div className="text-2xl font-bold text-green-400">
              {Object.values(testResults).filter(r => r.status === 'completed').length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Running</div>
            <div className="text-2xl font-bold text-blue-400">
              {Object.values(testResults).filter(r => r.status === 'running').length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">Estimated Time</div>
            <div className="text-2xl font-bold text-purple-400">
              {availableTests.reduce((sum, test) => sum + parseInt(test.estimatedTime), 0)} min
            </div>
          </div>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableTests.map((test) => (
            <div
              key={test.id}
              className={`border-l-4 rounded-r-lg p-6 bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-200 ${getPriorityColor(test.priority)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{test.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(test.priority)}`}>
                      {test.priority}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{test.description}</p>
                  <div className="text-sm text-gray-400">
                    Estimated time: {test.estimatedTime}
                  </div>
                </div>
                <Target size={24} className="text-blue-400 mt-1" />
              </div>

              {/* Test Status */}
              <div className="mb-4">
                {getTestStatus(test.id) || <div className="text-gray-500 text-sm">Not started</div>}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleRunTest(test.id)}
                disabled={testResults[test.id]?.status === 'running'}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  testResults[test.id]?.status === 'running'
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                }`}
              >
                <Play size={18} />
                <span>{testResults[test.id]?.status === 'running' ? 'Running...' : 'Run Test'}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                const criticalTests = availableTests.filter(t => t.priority === 'critical');
                criticalTests.forEach(test => handleRunTest(test.id));
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Run Critical Tests
            </button>
            <button
              onClick={() => {
                const highTests = availableTests.filter(t => t.priority === 'high');
                highTests.forEach(test => handleRunTest(test.id));
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
            >
              Run High Priority
            </button>
            <button
              onClick={() => {
                availableTests.forEach(test => handleRunTest(test.id));
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Test Results Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Test Results Summary</h3>
            <div className="space-y-3">
              {Object.entries(testResults).map(([testId, result]) => {
                const test = availableTests.find(t => t.id === testId);
                return (
                  <div key={testId} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div>
                      <div className="text-white font-medium">{test?.name}</div>
                      <div className="text-gray-400 text-sm">
                        {result.status === 'completed' && result.endTime && result.startTime
                          ? `Duration: ${Math.round((result.endTime - result.startTime) / 1000)}s`
                          : `Status: ${result.status}`
                        }
                      </div>
                    </div>
                    <div className="flex items-center">
                      {result.status === 'completed' ? (
                        <CheckCircle className="text-green-400" size={20} />
                      ) : result.status === 'running' ? (
                        <TestTube className="text-blue-400 animate-spin" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestLauncher;