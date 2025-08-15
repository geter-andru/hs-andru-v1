import React, { useState } from 'react';
import CompetencyDashboard from '../competency/CompetencyDashboard';
import { AssessmentProvider } from '../../contexts/AssessmentContext';

// Test data profiles for comprehensive testing
const TEST_PROFILES = {
  CUST_02: {
    name: 'CUST_02 (Developing Level)',
    assessment: {
      performance: {
        level: 'Developing',
        isHighPriority: false
      },
      scores: {
        overall: 45,
        buyerUnderstanding: 40,
        techToValue: 50
      },
      revenue: {
        opportunity: 750000,
        roiMultiplier: 3.2,
        impactTimeline: '6-12 months'
      },
      challenges: [
        'Buyer Conversations Challenge',
        'Technical Translation Challenge'
      ],
      strategy: {
        focusArea: 'Buyer Psychology',
        primaryRecommendation: 'Focus on stakeholder identification and buyer conversation optimization',
        recommendationType: 'systematic_development'
      }
    },
    competencyBaselines: {
      customerAnalysis: 42,
      valueCommunication: 38,
      salesExecution: 35
    },
    competencyProgress: {
      customerAnalysis: 8,
      valueCommunication: 12,
      salesExecution: 5
    }
  },
  CUST_4: {
    name: 'CUST_4 (Good Level - Admin)',
    assessment: {
      performance: {
        level: 'Good',
        isHighPriority: false
      },
      scores: {
        overall: 75,
        buyerUnderstanding: 80,
        techToValue: 70
      },
      revenue: {
        opportunity: 1200000,
        roiMultiplier: 4.5,
        impactTimeline: '3-6 months'
      },
      challenges: [
        'Competitive Positioning Challenge'
      ],
      strategy: {
        focusArea: 'Competitive Positioning',
        primaryRecommendation: 'Leverage advanced competitive intelligence for market leadership',
        recommendationType: 'advanced_optimization'
      }
    },
    competencyBaselines: {
      customerAnalysis: 72,
      valueCommunication: 68,
      salesExecution: 75
    },
    competencyProgress: {
      customerAnalysis: 3,
      valueCommunication: 7,
      salesExecution: 2
    }
  },
  CUST_CRITICAL: {
    name: 'Critical Priority Customer',
    assessment: {
      performance: {
        level: 'Critical',
        isHighPriority: true
      },
      scores: {
        overall: 25,
        buyerUnderstanding: 20,
        techToValue: 30
      },
      revenue: {
        opportunity: 500000,
        roiMultiplier: 5.0,
        impactTimeline: '12-18 months'
      },
      challenges: [
        'Buyer Conversations Challenge',
        'Technical Translation Challenge',
        'Competitive Positioning Challenge'
      ],
      strategy: {
        focusArea: 'Technical Translation',
        primaryRecommendation: 'Immediate systematic foundation building required',
        recommendationType: 'critical_intervention'
      }
    },
    competencyBaselines: {
      customerAnalysis: 25,
      valueCommunication: 20,
      salesExecution: 30
    },
    competencyProgress: {
      customerAnalysis: 0,
      valueCommunication: 0,
      salesExecution: 0
    }
  },
  CUST_NULL: {
    name: 'Null Assessment Data (Error Handling)',
    assessment: null,
    competencyBaselines: null,
    competencyProgress: null
  }
};

const CompetencyDashboardTest = () => {
  const [selectedProfile, setSelectedProfile] = useState('CUST_02');
  const [showRawData, setShowRawData] = useState(false);

  const currentProfile = TEST_PROFILES[selectedProfile];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
        {/* Test Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-4">
              🧪 Personalized Competency Dashboard Test Environment
            </h1>
            <p className="text-gray-300 mb-4">
              Testing assessment-driven competency dashboard with different user profiles and scenarios.
            </p>
            
            {/* Profile Selector */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(TEST_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  onClick={() => setSelectedProfile(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedProfile === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {profile.name}
                </button>
              ))}
            </div>
            
            {/* Raw Data Toggle */}
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              {showRawData ? 'Hide' : 'Show'} Raw Test Data
            </button>
            
            {/* Raw Data Display */}
            {showRawData && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-600">
                <h3 className="text-white font-medium mb-2">Current Profile Data:</h3>
                <pre className="text-gray-300 text-xs overflow-auto max-h-64">
                  {JSON.stringify(currentProfile, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Provider Wrapper */}
        <div className="max-w-7xl mx-auto">
          <AssessmentProvider customerData={currentProfile}>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Testing Profile: {currentProfile.name}
              </h2>
              
              {/* Expected Behavior Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <h4 className="text-blue-400 font-medium mb-1">Expected Performance Level</h4>
                  <p className="text-gray-300">
                    {currentProfile.assessment?.performance?.level || 'No assessment data'}
                  </p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <h4 className="text-green-400 font-medium mb-1">Expected Focus Area</h4>
                  <p className="text-gray-300">
                    {currentProfile.assessment?.strategy?.focusArea || 'Comprehensive Development'}
                  </p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <h4 className="text-purple-400 font-medium mb-1">Expected Revenue Opportunity</h4>
                  <p className="text-gray-300">
                    ${Math.round((currentProfile.assessment?.revenue?.opportunity || 500000) / 1000)}K
                  </p>
                </div>
              </div>
            </div>

            {/* Competency Dashboard Component */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">
                Personalized Competency Dashboard Component
              </h2>
              
              <CompetencyDashboard customerData={currentProfile} />
            </div>
          </AssessmentProvider>
        </div>

        {/* Test Instructions */}
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
            <h3 className="text-blue-400 font-semibold mb-3">Test Instructions</h3>
            <div className="space-y-2 text-blue-200 text-sm">
              <div>• <strong>CUST_02:</strong> Should show "Developing" level with Buyer Psychology focus</div>
              <div>• <strong>CUST_4:</strong> Should show "Good" level with Competitive Positioning focus</div>
              <div>• <strong>Critical Customer:</strong> Should show urgent messaging and high-priority indicators</div>
              <div>• <strong>Null Data:</strong> Should gracefully handle missing assessment data with fallbacks</div>
              <div>• Verify personalized activities, achievements, and tool descriptions appear correctly</div>
              <div>• Check that competency scores progress from baseline + current progress</div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CompetencyDashboardTest;