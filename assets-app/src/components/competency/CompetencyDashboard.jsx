import React, { useState, useEffect } from 'react';
import { useAssessment } from '../../contexts/AssessmentContext';

const CompetencyDashboard = ({ customerData }) => {
  const { assessmentData, personalizedMessaging, competencyBaselines } = useAssessment();
  const [currentCompetencies, setCurrentCompetencies] = useState({});

  useEffect(() => {
    if (competencyBaselines && customerData?.competencyProgress) {
      // Initialize competencies from assessment baselines + any progress made
      const progress = customerData.competencyProgress;
      setCurrentCompetencies({
        customerAnalysis: Math.min(70, competencyBaselines.customerAnalysis + (progress.customerAnalysis || 0)),
        valueCommunication: Math.min(70, competencyBaselines.valueCommunication + (progress.valueCommunication || 0)),
        salesExecution: Math.min(70, competencyBaselines.salesExecution + (progress.salesExecution || 0))
      });
    }
  }, [competencyBaselines, customerData]);

  const getCompetencyLevel = (score) => {
    if (score >= 65) return 'Advanced';
    if (score >= 55) return 'Proficient';
    if (score >= 45) return 'Developing';
    return 'Foundation';
  };

  const getNextUnlockMessage = () => {
    if (!assessmentData?.challenges?.length) return 'Continue professional development activities';
    
    const primaryChallenge = assessmentData.challenges[0];
    const challengeMessages = {
      'Buyer Conversations Challenge': 'ICP Rating Tools & Prospect Scoring - addresses your buyer psychology development needs',
      'Technical Translation Challenge': 'Cost of Inaction Calculator - builds your technical-to-business translation capabilities',
      'Competitive Positioning Challenge': 'Business Case Builder - strengthens your competitive differentiation skills'
    };
    
    return challengeMessages[primaryChallenge] || 'Advanced revenue intelligence tools';
  };

  const getPersonalizedActivities = () => {
    if (!assessmentData?.challenges?.length) {
      return [
        { id: 1, activity: "Completed comprehensive ICP analysis", points: 25, category: "Customer Intelligence", time: "2 hours ago" },
        { id: 2, activity: "Built financial impact model for enterprise prospect", points: 35, category: "Value Intelligence", time: "Yesterday" },
        { id: 3, activity: "Presented ROI analysis to C-suite stakeholders", points: 50, category: "Revenue Intelligence", time: "2 days ago" }
      ];
    }

    // Generate challenge-specific activities
    const challengeActivities = {
      'Buyer Conversations Challenge': [
        { activity: "Advanced buyer psychology application: TechCorp stakeholder mapping", challenge: true },
        { activity: "Buyer conversation optimization: Enterprise discovery call framework", challenge: true },
        { activity: "Stakeholder identification breakthrough: Multi-committee analysis", challenge: true }
      ],
      'Technical Translation Challenge': [
        { activity: "Technical-to-business translation: Feature-value mapping for C-suite", challenge: true },
        { activity: "Executive communication enhancement: ROI presentation to CFO", challenge: true },
        { activity: "Feature-value mapping advancement: API benefits to business outcomes", challenge: true }
      ],
      'Competitive Positioning Challenge': [
        { activity: "Competitive differentiation focus: Technical advantages business case", challenge: true },
        { activity: "Market positioning advancement: Unique value proposition refinement", challenge: true },
        { activity: "Strategic advantage development: Competitive analysis framework", challenge: true }
      ]
    };

    const primaryChallenge = assessmentData.challenges[0];
    const activities = challengeActivities[primaryChallenge] || challengeActivities['Technical Translation Challenge'];
    
    return activities.map((activity, index) => ({
      id: index + 1,
      activity: activity.activity,
      points: [25, 35, 50][index],
      category: activity.challenge ? "Development" : "Customer Intelligence",
      time: ["2 hours ago", "Yesterday", "2 days ago"][index],
      challengeSpecific: activity.challenge
    }));
  };

  const getPersonalizedAchievements = () => {
    if (!assessmentData?.challenges?.length) {
      return [
        { title: "Critical Impact Achievement", description: "Consistent career impact activity this week", type: "impact" },
        { title: "Consistency Builder", description: "Daily competency development", type: "consistency" },
        { title: "Growth Accelerator", description: "3 strategic weekly competency growth streak", type: "growth" }
      ];
    }

    const challengeAchievements = {
      'Buyer Conversations Challenge': [
        { title: "Buyer Psychology Breakthrough", description: "Advanced stakeholder identification mastery", type: "challenge" },
        { title: "Conversation Catalyst", description: "Systematic buyer engagement improvement", type: "challenge" },
        { title: "Enterprise Navigator", description: "Multi-stakeholder relationship development", type: "challenge" }
      ],
      'Technical Translation Challenge': [
        { title: "Technical Translation Mastery", description: "Consistent feature-to-value articulation", type: "challenge" },
        { title: "Executive Communicator", description: "C-suite presentation effectiveness", type: "challenge" },
        { title: "Value Architecture", description: "Systematic business outcome mapping", type: "challenge" }
      ],
      'Competitive Positioning Challenge': [
        { title: "Competitive Intelligence", description: "Strategic advantage identification", type: "challenge" },
        { title: "Market Differentiator", description: "Unique positioning development", type: "challenge" },
        { title: "Strategic Advantage", description: "Competitive moat articulation", type: "challenge" }
      ]
    };

    const primaryChallenge = assessmentData.challenges[0];
    const achievements = challengeAchievements[primaryChallenge] || challengeAchievements['Technical Translation Challenge'];
    
    return achievements;
  };

  const getAchievementPersonalization = (strategy, challenges) => {
    const focusArea = strategy?.focusArea;
    
    const achievementMap = {
      'Buyer Psychology': [
        { title: "Buyer Psychology Breakthrough", description: "Advanced stakeholder identification mastery", type: "focus" },
        { title: "Conversation Catalyst", description: "Systematic buyer engagement improvement", type: "focus" },
        { title: "Enterprise Navigator", description: "Multi-stakeholder relationship development", type: "focus" }
      ],
      'Technical Translation': [
        { title: "Technical Translation Mastery", description: "Consistent feature-to-value articulation", type: "focus" },
        { title: "Executive Communicator", description: "C-suite presentation effectiveness", type: "focus" },
        { title: "Value Architecture", description: "Systematic business outcome mapping", type: "focus" }
      ],
      'Competitive Positioning': [
        { title: "Competitive Intelligence", description: "Strategic advantage identification", type: "focus" },
        { title: "Market Differentiator", description: "Unique positioning development", type: "focus" },
        { title: "Strategic Advantage", description: "Competitive moat articulation", type: "focus" }
      ],
      'Sales Process': [
        { title: "Process Architect", description: "Systematic sales process optimization", type: "focus" },
        { title: "Revenue Engineer", description: "Predictable revenue system building", type: "focus" },
        { title: "Conversion Catalyst", description: "Lead-to-customer process mastery", type: "focus" }
      ]
    };
    
    return achievementMap[focusArea] || [
      { title: "Critical Impact Achievement", description: "Consistent career impact activity this week", type: "general" },
      { title: "Consistency Builder", description: "Daily competency development", type: "general" },
      { title: "Growth Accelerator", description: "Strategic weekly competency growth", type: "general" }
    ];
  };

  const getNextSteps = (performance, strategy) => {
    const stepMap = {
      'Critical': `Focus on ${strategy?.focusArea} fundamentals with immediate implementation`,
      'Needs Work': `Systematic ${strategy?.focusArea} development with structured progress tracking`,
      'Average': `Competitive advantage building through ${strategy?.focusArea} optimization`,
      'Good': `Advanced ${strategy?.focusArea} mastery and strategic application`,
      'Excellent': `Market leadership through ${strategy?.focusArea} expertise and innovation`
    };
    
    return stepMap[performance?.level] || `Professional development through ${strategy?.focusArea || 'systematic'} enhancement`;
  };

  if (!assessmentData || !personalizedMessaging) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading personalized professional development dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Assessment-Driven Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Revenue Intelligence Development</h2>
            <p className="text-blue-100 mt-1">
              Level: {getCompetencyLevel(competencyBaselines?.customerAnalysis || 50)} • 
              Focus Area: Export-ready {assessmentData?.strategy?.focusArea || 'Revenue Intelligence'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {assessmentData?.performance?.isHighPriority ? 'Critical' : 'Strategic'}
            </div>
            <div className="text-sm text-blue-100">Priority Level</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white/10 rounded-lg">
          <p className="text-sm">{personalizedMessaging.welcomeMessage?.primary}</p>
          <p className="text-xs text-blue-100 mt-1">{personalizedMessaging.welcomeMessage?.secondary}</p>
        </div>
      </div>

      {/* Assessment-Based Competency Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Professional Competency Development</h3>
          
          <div className="space-y-4">
            {Object.entries(currentCompetencies).map(([key, value]) => {
              const labels = {
                customerAnalysis: 'Customer Analysis',
                valueCommunication: 'Value Communication',
                salesExecution: 'Sales Execution'
              };
              
              const baseline = competencyBaselines?.[key] || 50;
              const improvement = value - baseline;
              
              return (
                <div key={key} className="relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">{labels[key]}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-white">{value}</span>
                      <span className="text-xs text-gray-400">/{getCompetencyLevel(value)}</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(value / 70) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Baseline: {baseline}</span>
                    {improvement > 0 && <span className="text-green-400">+{improvement} improvement</span>}
                    <span>{70 - value} to unlock</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assessment-Driven Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Professional Development Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-left transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Rate Prospect</span>
                <span className="text-blue-200">🎯</span>
              </div>
              <div className="text-xs text-blue-100 mt-1">
                {personalizedMessaging?.toolDescriptions?.icpTool || 'Apply ICP analysis framework'}
              </div>
            </button>
            
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-left transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Build Cost Model</span>
                <span className="text-gray-300">🔒</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {personalizedMessaging?.toolDescriptions?.costTool || 'Create financial impact analysis'}
              </div>
            </button>
            
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg text-left transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Log Activity</span>
                <span className="text-gray-300">📊</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Complete assessments and track activities to unlock advanced tools
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Assessment-Driven Next Tool Unlock */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Next Tool Unlock</h3>
            <p className="text-purple-100 text-sm mb-1">{getNextUnlockMessage()}</p>
            <div className="text-xs text-purple-200">
              Current Progress: 50% to unlock • Target: 70+ for tool unlock
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-2xl font-bold">3</div>
            <div className="text-sm text-purple-100">points needed</div>
          </div>
        </div>
        
        <div className="mt-4 bg-white/10 rounded-full h-2">
          <div className="bg-white h-2 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
        </div>
      </div>

      {/* Assessment-Aware Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Professional Development Activity</h3>
          <div className="text-sm text-gray-400 mb-4">Last 7 days</div>
          
          <div className="space-y-4">
            {getPersonalizedActivities().map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                  activity.challengeSpecific ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {activity.challengeSpecific ? '🎯' : '📊'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{activity.activity}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-green-400">+{activity.points} points</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{activity.category}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment-Based Weekly Achievements */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Weekly Achievements</h3>
          
          <div className="space-y-3">
            {getPersonalizedAchievements().map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{achievement.title}</div>
                  <div className="text-xs text-gray-400">{achievement.description}</div>
                </div>
                <div className="text-green-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyDashboard;