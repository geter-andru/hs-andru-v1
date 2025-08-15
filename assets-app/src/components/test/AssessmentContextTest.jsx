import React from 'react';
import { Target, MessageCircle, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { AssessmentProvider, useAssessment } from '../../contexts/AssessmentContext';
import { getMockDataByCustomerId } from '../../data/mockProfessionalData';

const AssessmentContextValidator = () => {
  const {
    assessmentData,
    personalizedMessaging,
    competencyBaselines,
    isHighPriority,
    needsFocus,
    hasCriticalChallenges,
    hasHighPriorityChallenges,
    getFocusAreaMessage,
    getRevenueOpportunity,
    getPerformanceLevel
  } = useAssessment();

  const testResults = [
    {
      name: 'Assessment Data Available',
      passed: !!assessmentData,
      value: assessmentData ? 'Yes' : 'No',
      details: assessmentData ? `Performance: ${assessmentData.performance?.level}` : 'Missing'
    },
    {
      name: 'Personalized Messaging Generated',
      passed: !!personalizedMessaging?.welcomeMessage,
      value: personalizedMessaging?.welcomeMessage?.primary ? 'Generated' : 'Missing',
      details: personalizedMessaging?.welcomeMessage?.urgency || 'N/A'
    },
    {
      name: 'Competency Baselines Set',
      passed: !!competencyBaselines,
      value: competencyBaselines ? 'Available' : 'Missing',
      details: competencyBaselines ? `CA: ${competencyBaselines.customerAnalysis}, VC: ${competencyBaselines.valueCommunication}` : 'N/A'
    },
    {
      name: 'High Priority Detection',
      passed: typeof isHighPriority === 'boolean',
      value: isHighPriority ? 'High Priority' : 'Standard',
      details: `Assessment-driven priority flag`
    },
    {
      name: 'Focus Area Detection',
      passed: typeof needsFocus === 'function',
      value: 'Function Available',
      details: `Can check focus area requirements`
    },
    {
      name: 'Challenge Analysis',
      passed: typeof hasCriticalChallenges === 'boolean',
      value: hasCriticalChallenges ? 'Has Critical' : 'No Critical',
      details: hasHighPriorityChallenges ? 'Has High Priority Challenges' : 'No High Priority'
    },
    {
      name: 'Focus Area Messaging',
      passed: !!getFocusAreaMessage(),
      value: getFocusAreaMessage()?.focusArea || 'N/A',
      details: getFocusAreaMessage()?.activityPrefixes?.[0] || 'No prefixes'
    },
    {
      name: 'Revenue Opportunity',
      passed: getRevenueOpportunity() > 0,
      value: `$${Math.round(getRevenueOpportunity()/1000)}K`,
      details: 'Assessment-driven revenue calculation'
    },
    {
      name: 'Performance Level',
      passed: !!getPerformanceLevel(),
      value: getPerformanceLevel(),
      details: 'Assessment performance classification'
    }
  ];

  const getStatusIcon = (passed) => {
    if (passed) return <CheckCircle className="text-green-500" size={16} />;
    return <XCircle className="text-red-500" size={16} />;
  };

  const getStatusColor = (passed) => {
    return passed ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Context Validation Results */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <Target size={18} className="mr-2 text-blue-400" />
          Assessment Context Validation Results
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testResults.map((result, index) => (
            <div key={index} className="bg-gray-700 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium text-sm">{result.name}</h4>
                {getStatusIcon(result.passed)}
              </div>
              <div className={`text-xs ${getStatusColor(result.passed)}`}>
                {result.value}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {result.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Messaging Preview */}
      {personalizedMessaging?.welcomeMessage && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <MessageCircle size={18} className="mr-2 text-green-400" />
            Generated Personalized Messaging Preview
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-blue-300 font-medium mb-2">Welcome Message</h4>
              <p className="text-white text-sm mb-2">{personalizedMessaging.welcomeMessage.primary}</p>
              <p className="text-gray-300 text-sm">{personalizedMessaging.welcomeMessage.secondary}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                  Urgency: {personalizedMessaging.welcomeMessage.urgency}
                </span>
              </div>
            </div>

            {personalizedMessaging.toolDescriptions && (
              <div className="p-4 bg-gray-700 rounded">
                <h4 className="text-green-300 font-medium mb-2">Tool Descriptions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-blue-300 font-medium">ICP Tool:</span>
                    <p className="text-gray-300 mt-1">{personalizedMessaging.toolDescriptions.icpTool}</p>
                  </div>
                  <div>
                    <span className="text-green-300 font-medium">Cost Tool:</span>
                    <p className="text-gray-300 mt-1">{personalizedMessaging.toolDescriptions.costTool}</p>
                  </div>
                  <div>
                    <span className="text-purple-300 font-medium">Business Case:</span>
                    <p className="text-gray-300 mt-1">{personalizedMessaging.toolDescriptions.businessCase}</p>
                  </div>
                </div>
              </div>
            )}

            {personalizedMessaging.nextSteps && (
              <div className="p-4 bg-gray-700 rounded">
                <h4 className="text-amber-300 font-medium mb-2">Next Steps</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  {personalizedMessaging.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-400 mr-2">•</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assessment Data Details */}
      {assessmentData && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <TrendingUp size={18} className="mr-2 text-purple-400" />
            Assessment Data Structure Preview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-blue-300 font-medium mb-2">Performance Metrics</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level:</span>
                  <span className="text-white">{assessmentData.performance?.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score:</span>
                  <span className="text-white">{assessmentData.scores?.overall}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High Priority:</span>
                  <span className="text-white">{assessmentData.performance?.isHighPriority ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-green-300 font-medium mb-2">Revenue Impact</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Opportunity:</span>
                  <span className="text-white">${Math.round(assessmentData.revenue?.opportunity/1000)}K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ROI Multiplier:</span>
                  <span className="text-white">{assessmentData.revenue?.roiMultiplier}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Timeline:</span>
                  <span className="text-white">{assessmentData.revenue?.impactTimeline}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-purple-300 font-medium mb-2">Challenge Analysis</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Challenges:</span>
                  <span className="text-white">{assessmentData.challenges?.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Critical:</span>
                  <span className="text-white">{assessmentData.challenges?.critical}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High Priority:</span>
                  <span className="text-white">{assessmentData.challenges?.highPriority}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-amber-300 font-medium mb-2">Strategy Focus</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">Focus Area:</span>
                  <span className="text-white">{assessmentData.strategy?.focusArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{assessmentData.strategy?.recommendationType}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-gray-400 text-xs">Primary Recommendation:</span>
                <p className="text-white text-xs mt-1">{assessmentData.strategy?.primaryRecommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AssessmentContextTest = ({ customerId = 'CUST_02' }) => {
  // Get mock data for the specified customer
  const customerData = getMockDataByCustomerId(customerId);
  
  // Transform to match expected assessment structure
  const assessmentCustomerData = {
    assessment: {
      performance: {
        level: customerData.assessmentData?.performance_level,
        isHighPriority: customerData.assessmentData?.is_high_priority
      },
      scores: {
        overall: customerData.assessmentData?.overall_score,
        buyerUnderstanding: customerData.assessmentData?.buyer_understanding_score,
        techToValue: customerData.assessmentData?.tech_to_value_score
      },
      revenue: {
        opportunity: customerData.assessmentData?.revenue_opportunity,
        roiMultiplier: customerData.assessmentData?.roi_multiplier,
        impactTimeline: customerData.assessmentData?.impact_timeline
      },
      challenges: {
        total: customerData.assessmentData?.total_challenges,
        critical: customerData.assessmentData?.critical_challenges,
        highPriority: customerData.assessmentData?.high_priority_challenges
      },
      strategy: {
        focusArea: customerData.assessmentData?.focus_area,
        primaryRecommendation: customerData.assessmentData?.primary_recommendation,
        recommendationType: customerData.assessmentData?.recommendation_type
      }
    },
    competencyBaselines: customerData.competencyBaselines
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Target size={32} className="mr-3 text-blue-400" />
            Assessment Context Provider Testing
          </h1>
          <p className="text-gray-400">
            Testing assessment context generation and personalized messaging for Customer ID: {customerId}
          </p>
        </div>

        {/* Assessment Provider Wrapper */}
        <AssessmentProvider customerData={assessmentCustomerData}>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Context Provider Status</h2>
              <div className="flex items-center space-x-2 text-green-400">
                <CheckCircle size={18} />
                <span className="text-sm">Context Active</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Assessment Context Provider is wrapping components and providing personalized data based on customer assessment results.
            </p>
          </div>

          {/* Context Validation Component */}
          <AssessmentContextValidator />
        </AssessmentProvider>

        {/* Customer Selection */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-white font-semibold mb-4">Test Different Customer Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-blue-300 font-medium mb-2">CUST_02 - Developing Level</h4>
              <p className="text-gray-300 text-sm mb-2">
                Performance: Developing (67 overall score)
              </p>
              <p className="text-gray-300 text-sm">
                Expected: Encouraging tone, systematic improvement focus, $250K revenue opportunity
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded">
              <h4 className="text-purple-300 font-medium mb-2">CUST_4 - Expert Level</h4>
              <p className="text-gray-300 text-sm mb-2">
                Performance: Expert (94 overall score)
              </p>
              <p className="text-gray-300 text-sm">
                Expected: Expert tone, strategic leadership focus, $2.5M revenue opportunity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentContextTest;