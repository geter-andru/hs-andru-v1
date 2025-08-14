/**
 * Professional Development Path Recommendations - Phase 3
 * 
 * AI-driven professional development planning with personalized learning paths
 * Provides systematic competency development roadmaps and milestone tracking
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, TrendingUp, BarChart3, Award, Calendar,
  CheckCircle, Clock, Zap, Star, Brain, Users,
  ArrowRight, Play, BookOpen, Activity, Lightbulb,
  Map, Route, Flag, Compass, Trophy, Download
} from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';

const ProfessionalDevelopmentPath = ({ 
  competencyData, 
  completedActions = [],
  onStartActivity,
  className = '' 
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [selectedFocus, setSelectedFocus] = useState('balanced');
  const [showDetailedPath, setShowDetailedPath] = useState(false);

  // Generate personalized development plan
  const developmentPlan = useMemo(() => {
    return assessmentService.generateDevelopmentPlan(competencyData, selectedTimeframe);
  }, [competencyData, selectedTimeframe]);

  // Calculate enhanced recommendations
  const enhancedRecommendations = useMemo(() => {
    const insights = assessmentService.generateCompetencyInsights(competencyData);
    
    return {
      priorityObjectives: calculatePriorityObjectives(competencyData, selectedFocus),
      learningPath: generateLearningPath(competencyData, selectedTimeframe),
      practiceActivities: generatePracticeActivities(competencyData, completedActions),
      milestoneTracker: generateMilestoneTracker(competencyData),
      skillGapAnalysis: performSkillGapAnalysis(competencyData),
      timelineEstimates: calculateTimelineEstimates(competencyData, selectedTimeframe)
    };
  }, [competencyData, selectedTimeframe, selectedFocus, completedActions]);

  // Timeframe options
  const timeframeOptions = [
    { id: '30days', name: '30 Days', description: 'Intensive sprint', color: 'red' },
    { id: '90days', name: '90 Days', description: 'Balanced development', color: 'blue' },
    { id: '6months', name: '6 Months', description: 'Comprehensive mastery', color: 'green' }
  ];

  // Focus area options
  const focusOptions = [
    { 
      id: 'balanced', 
      name: 'Balanced Development', 
      description: 'Equal focus on all competency areas',
      icon: Target,
      color: 'blue'
    },
    { 
      id: 'strength_based', 
      name: 'Strength Amplification', 
      description: 'Build on existing strengths',
      icon: TrendingUp,
      color: 'green'
    },
    { 
      id: 'gap_focused', 
      name: 'Gap Closure', 
      description: 'Address primary development gaps',
      icon: Award,
      color: 'purple'
    },
    { 
      id: 'career_accelerated', 
      name: 'Career Acceleration', 
      description: 'Fast-track to senior competencies',
      icon: Zap,
      color: 'yellow'
    }
  ];

  // Handle activity start
  const handleStartActivity = useCallback((activity) => {
    if (onStartActivity) {
      onStartActivity(activity);
    }
  }, [onStartActivity]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Development Path Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Professional Development Roadmap
            </h3>
            <p className="text-gray-400">
              Personalized learning path with AI-driven recommendations for systematic competency growth
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowDetailedPath(!showDetailedPath)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {showDetailedPath ? 'Simple View' : 'Detailed Path'}
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Plan</span>
            </button>
          </div>
        </div>

        {/* Plan Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeframe Selection */}
          <div>
            <h4 className="font-medium text-white mb-3">Development Timeframe</h4>
            <div className="space-y-2">
              {timeframeOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setSelectedTimeframe(option.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    selectedTimeframe === option.id
                      ? `border-${option.color}-500 bg-${option.color}-900/20`
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-medium ${
                      selectedTimeframe === option.id ? `text-${option.color}-300` : 'text-white'
                    }`}>
                      {option.name}
                    </div>
                    <div className="text-sm text-gray-400">{option.description}</div>
                  </div>
                  {selectedTimeframe === option.id && (
                    <CheckCircle className={`w-5 h-5 text-${option.color}-400`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Area Selection */}
          <div>
            <h4 className="font-medium text-white mb-3">Development Focus</h4>
            <div className="space-y-2">
              {focusOptions.map(option => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFocus(option.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      selectedFocus === option.id
                        ? `border-${option.color}-500 bg-${option.color}-900/20`
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      selectedFocus === option.id ? `text-${option.color}-400` : 'text-gray-400'
                    }`} />
                    <div className="text-left flex-1">
                      <div className={`font-medium ${
                        selectedFocus === option.id ? `text-${option.color}-300` : 'text-white'
                      }`}>
                        {option.name}
                      </div>
                      <div className="text-xs text-gray-400">{option.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Development Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {enhancedRecommendations.priorityObjectives.length}
          </div>
          <div className="text-sm text-gray-400">Priority Objectives</div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {enhancedRecommendations.learningPath.totalActivities}
          </div>
          <div className="text-sm text-gray-400">Learning Activities</div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">
            {enhancedRecommendations.timelineEstimates.totalWeeks}
          </div>
          <div className="text-sm text-gray-400">Weeks to Completion</div>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {developmentPlan.estimatedOutcome.totalPointsGain}
          </div>
          <div className="text-sm text-gray-400">Estimated Points</div>
        </div>
      </div>

      {/* Learning Path Visualization */}
      <LearningPathVisualization 
        learningPath={enhancedRecommendations.learningPath}
        showDetailed={showDetailedPath}
        onStartActivity={handleStartActivity}
      />

      {/* Development Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityObjectives objectives={enhancedRecommendations.priorityObjectives} />
        <MilestoneTracker milestones={enhancedRecommendations.milestoneTracker} />
      </div>

      {/* Skill Gap Analysis and Practice Activities */}
      {showDetailedPath && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkillGapAnalysis analysis={enhancedRecommendations.skillGapAnalysis} />
          <PracticeActivities 
            activities={enhancedRecommendations.practiceActivities}
            onStartActivity={handleStartActivity}
          />
        </div>
      )}

      {/* Development Outcomes Projection */}
      <DevelopmentOutcomesProjection 
        outcomes={developmentPlan.estimatedOutcome}
        timeframe={selectedTimeframe}
      />
    </div>
  );
};

// Learning Path Visualization Component
const LearningPathVisualization = ({ learningPath, showDetailed, onStartActivity }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Professional Learning Journey</h4>
    
    <div className="space-y-6">
      {learningPath.phases.map((phase, phaseIndex) => (
        <div key={phaseIndex} className="relative">
          {/* Phase Header */}
          <div className="flex items-center space-x-4 mb-4">
            <div className={`w-8 h-8 rounded-full bg-${phase.color}-600 flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">{phaseIndex + 1}</span>
            </div>
            <div>
              <h5 className="font-semibold text-white">{phase.name}</h5>
              <p className="text-sm text-gray-400">{phase.description}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-400">Duration</div>
              <div className="font-medium text-white">{phase.duration}</div>
            </div>
          </div>

          {/* Phase Activities */}
          <div className="ml-12 space-y-3">
            {phase.activities.map((activity, activityIndex) => (
              <motion.div
                key={activityIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: phaseIndex * 0.1 + activityIndex * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full ${
                    activity.completed ? 'bg-green-500' : 'bg-gray-600'
                  } flex items-center justify-center`}>
                    {activity.completed ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-xs text-white">{activityIndex + 1}</span>
                    )}
                  </div>
                  <div>
                    <h6 className="font-medium text-white">{activity.title}</h6>
                    <p className="text-sm text-gray-400">{activity.description}</p>
                    {showDetailed && (
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{activity.estimatedTime}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>+{activity.points} points</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          activity.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                          activity.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {activity.difficulty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-400">+{activity.points}</div>
                    <div className="text-xs text-gray-500">{activity.estimatedTime}</div>
                  </div>
                  
                  {!activity.completed && (
                    <button
                      onClick={() => onStartActivity(activity)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                    >
                      Start
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Phase Connection Line */}
          {phaseIndex < learningPath.phases.length - 1 && (
            <div className="absolute left-4 top-16 w-0.5 h-8 bg-gray-700" />
          )}
        </div>
      ))}
    </div>
  </div>
);

// Priority Objectives Component
const PriorityObjectives = ({ objectives }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Priority Development Objectives</h4>
    
    <div className="space-y-4">
      {objectives.map((objective, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-white">{objective.title}</h5>
            <span className={`px-2 py-1 rounded text-xs ${
              objective.priority === 'high' ? 'bg-red-900 text-red-300' :
              objective.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
              'bg-green-900 text-green-300'
            }`}>
              {objective.priority} priority
            </span>
          </div>
          
          <p className="text-sm text-gray-400 mb-3">{objective.description}</p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Current: {objective.currentProgress}% • Target: {objective.targetProgress}%
            </div>
            <div className="text-sm font-medium text-blue-400">
              +{objective.pointsValue} points
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 bg-blue-500 rounded-full"
                style={{ width: `${objective.currentProgress}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Milestone Tracker Component
const MilestoneTracker = ({ milestones }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Milestone Tracker</h4>
    
    <div className="space-y-4">
      {milestones.map((milestone, index) => {
        const Icon = milestone.icon;
        
        return (
          <div key={index} className="flex items-start space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              milestone.achieved ? 'bg-green-600' : 'bg-gray-700'
            }`}>
              <Icon className={`w-5 h-5 ${milestone.achieved ? 'text-white' : 'text-gray-400'}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h5 className={`font-medium ${milestone.achieved ? 'text-green-300' : 'text-white'}`}>
                  {milestone.title}
                </h5>
                {milestone.achieved && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              
              <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{milestone.estimatedDate}</span>
                <span className="text-blue-400 font-medium">+{milestone.points} points</span>
              </div>
              
              {milestone.progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="h-1.5 bg-blue-500 rounded-full"
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{milestone.progress}% complete</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// Skill Gap Analysis Component
const SkillGapAnalysis = ({ analysis }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Skill Gap Analysis</h4>
    
    <div className="space-y-4">
      {analysis.gaps.map((gap, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-white">{gap.skill}</h5>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs ${
                gap.severity === 'critical' ? 'bg-red-900 text-red-300' :
                gap.severity === 'major' ? 'bg-orange-900 text-orange-300' :
                'bg-yellow-900 text-yellow-300'
              }`}>
                {gap.severity}
              </span>
              <span className="text-sm text-gray-400">{gap.currentLevel}/10</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full ${
                gap.currentLevel >= 7 ? 'bg-green-500' :
                gap.currentLevel >= 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(gap.currentLevel / 10) * 100}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-400 mb-2">{gap.recommendation}</div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Est. improvement time: {gap.improvementTime}</span>
            <span>Target level: {gap.targetLevel}/10</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Practice Activities Component
const PracticeActivities = ({ activities, onStartActivity }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Recommended Practice Activities</h4>
    
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        
        return (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
            <div className="flex items-center space-x-3">
              <Icon className={`w-5 h-5 text-${activity.color}-400`} />
              <div>
                <h5 className="font-medium text-white">{activity.title}</h5>
                <p className="text-sm text-gray-400">{activity.description}</p>
                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                  <span>{activity.estimatedTime}</span>
                  <span>•</span>
                  <span>+{activity.points} points</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.5 rounded ${
                    activity.difficulty === 'beginner' ? 'bg-green-900 text-green-300' :
                    activity.difficulty === 'intermediate' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {activity.difficulty}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onStartActivity(activity)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
            >
              Start
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

// Development Outcomes Projection Component
const DevelopmentOutcomesProjection = ({ outcomes, timeframe }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-white mb-6">Projected Development Outcomes</h4>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Competency Improvements */}
      <div>
        <h5 className="font-medium text-gray-300 mb-4">Competency Score Improvements</h5>
        <div className="space-y-3">
          {Object.entries(outcomes.competencyImprovements).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-green-400 font-medium">+{(value - 60).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Unlocks */}
      <div>
        <h5 className="font-medium text-gray-300 mb-4">Tool Unlocks</h5>
        <div className="space-y-2">
          {outcomes.toolUnlocks.map((tool, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">{tool}</span>
            </div>
          ))}
          {outcomes.toolUnlocks.length === 0 && (
            <div className="text-gray-500 text-sm">All tools already unlocked</div>
          )}
        </div>
      </div>

      {/* Level Progression */}
      <div>
        <h5 className="font-medium text-gray-300 mb-4">Level Progression</h5>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Current Level:</span>
            <span className="text-white">{outcomes.levelProgression.currentLevel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Projected Level:</span>
            <span className="text-blue-400 font-medium">{outcomes.levelProgression.potentialLevel}</span>
          </div>
          {outcomes.levelProgression.willAdvance && (
            <div className="text-green-400 text-sm">
              ✓ Level advancement expected
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Timeline Summary */}
    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
      <h5 className="font-medium text-blue-300 mb-2">
        {timeframe === '30days' ? '30-Day' : timeframe === '90days' ? '90-Day' : '6-Month'} Development Summary
      </h5>
      <p className="text-blue-100 text-sm">
        Following this development path, you can expect to gain <strong>{outcomes.totalPointsGain} progress points</strong>,
        {outcomes.toolUnlocks.length > 0 && ` unlock ${outcomes.toolUnlocks.length} advanced tools,`}
        {outcomes.levelProgression.willAdvance && ' advance to the next professional level,'}
        {' '}and significantly enhance your revenue intelligence capabilities.
      </p>
    </div>
  </div>
);

// Utility functions for enhanced recommendations
const calculatePriorityObjectives = (competencyData, focus) => {
  const objectives = [
    {
      title: 'Customer Analysis Mastery',
      description: 'Reach 70+ proficiency in customer intelligence frameworks',
      currentProgress: competencyData.currentCustomerAnalysis,
      targetProgress: 70,
      priority: competencyData.currentCustomerAnalysis < 50 ? 'high' : 'medium',
      pointsValue: 200,
      category: 'customerAnalysis'
    },
    {
      title: 'Value Communication Excellence',
      description: 'Master ROI articulation and value proposition delivery',
      currentProgress: competencyData.currentValueCommunication,
      targetProgress: 70,
      priority: competencyData.currentValueCommunication < 50 ? 'high' : 'medium',
      pointsValue: 250,
      category: 'valueCommunication'
    },
    {
      title: 'Sales Execution Proficiency',
      description: 'Develop systematic sales methodology expertise',
      currentProgress: competencyData.currentSalesExecution,
      targetProgress: 70,
      priority: competencyData.currentSalesExecution < 50 ? 'high' : 'medium',
      pointsValue: 300,
      category: 'salesExecution'
    }
  ];

  // Adjust priorities based on focus
  if (focus === 'gap_focused') {
    objectives.sort((a, b) => a.currentProgress - b.currentProgress);
  } else if (focus === 'strength_based') {
    objectives.sort((a, b) => b.currentProgress - a.currentProgress);
  }

  return objectives.slice(0, 3);
};

const generateLearningPath = (competencyData, timeframe) => {
  const phases = [
    {
      name: 'Foundation Building',
      description: 'Establish core competency frameworks',
      duration: timeframe === '30days' ? '1 week' : '2-3 weeks',
      color: 'blue',
      activities: [
        {
          title: 'Complete Baseline Assessment Review',
          description: 'Analyze current competency gaps and strengths',
          estimatedTime: '30 minutes',
          points: 25,
          difficulty: 'beginner',
          completed: false
        },
        {
          title: 'ICP Framework Deep-Dive',
          description: 'Master customer intelligence fundamentals',
          estimatedTime: '2 hours',
          points: 90,
          difficulty: 'intermediate',
          completed: false
        }
      ]
    },
    {
      name: 'Skill Development',
      description: 'Build practical competency through guided practice',
      duration: timeframe === '30days' ? '2 weeks' : '4-6 weeks',
      color: 'green',
      activities: [
        {
          title: 'Buyer Persona Mastery',
          description: 'Advanced stakeholder psychology and communication',
          estimatedTime: '3 hours',
          points: 275,
          difficulty: 'intermediate',
          completed: false
        },
        {
          title: 'Real-World Application Practice',
          description: 'Apply frameworks to actual business scenarios',
          estimatedTime: '4 hours',
          points: 400,
          difficulty: 'advanced',
          completed: false
        }
      ]
    },
    {
      name: 'Mastery & Integration',
      description: 'Achieve proficiency and unlock advanced tools',
      duration: timeframe === '30days' ? '1 week' : '2-4 weeks',
      color: 'purple',
      activities: [
        {
          title: 'Advanced Methodology Unlock',
          description: 'Access sophisticated professional frameworks',
          estimatedTime: '1 hour',
          points: 100,
          difficulty: 'advanced',
          completed: false
        },
        {
          title: 'Professional Certification',
          description: 'Demonstrate mastery through comprehensive assessment',
          estimatedTime: '2 hours',
          points: 500,
          difficulty: 'expert',
          completed: false
        }
      ]
    }
  ];

  return {
    phases,
    totalActivities: phases.reduce((sum, phase) => sum + phase.activities.length, 0)
  };
};

const generatePracticeActivities = (competencyData, completedActions) => {
  return [
    {
      title: 'Customer Discovery Practice',
      description: 'Conduct structured discovery sessions with sample scenarios',
      estimatedTime: '45 minutes',
      points: 150,
      difficulty: 'intermediate',
      icon: Users,
      color: 'blue',
      category: 'customerAnalysis'
    },
    {
      title: 'ROI Calculation Workshop',
      description: 'Build comprehensive ROI models for different industries',
      estimatedTime: '1 hour',
      points: 200,
      difficulty: 'intermediate',
      icon: BarChart3,
      color: 'green',
      category: 'valueCommunication'
    },
    {
      title: 'Business Case Development',
      description: 'Create compelling business cases for enterprise prospects',
      estimatedTime: '2 hours',
      points: 350,
      difficulty: 'advanced',
      icon: Award,
      color: 'purple',
      category: 'salesExecution'
    }
  ];
};

const generateMilestoneTracker = (competencyData) => {
  return [
    {
      title: 'First Competency Threshold',
      description: 'Reach 70+ in any competency area',
      estimatedDate: 'Week 2-3',
      points: 100,
      icon: Target,
      achieved: Math.max(competencyData.currentCustomerAnalysis, competencyData.currentValueCommunication, competencyData.currentSalesExecution) >= 70,
      progress: Math.max(competencyData.currentCustomerAnalysis, competencyData.currentValueCommunication, competencyData.currentSalesExecution)
    },
    {
      title: 'Tool Methodology Unlock',
      description: 'Unlock advanced professional tools',
      estimatedDate: 'Week 3-4',
      points: 200,
      icon: Zap,
      achieved: Object.values(competencyData.toolUnlockStates || {}).some(Boolean),
      progress: (Object.values(competencyData.toolUnlockStates || {}).filter(Boolean).length / 3) * 100
    },
    {
      title: 'Professional Level Advancement',
      description: 'Advance to next professional competency level',
      estimatedDate: 'Week 4-6',
      points: 300,
      icon: Award,
      achieved: false,
      progress: (competencyData.totalProgressPoints % 1000) / 1000 * 100
    }
  ];
};

const performSkillGapAnalysis = (competencyData) => {
  const skills = [
    {
      skill: 'Customer Qualification',
      currentLevel: Math.round(competencyData.currentCustomerAnalysis / 10),
      targetLevel: 7,
      severity: competencyData.currentCustomerAnalysis < 50 ? 'critical' : competencyData.currentCustomerAnalysis < 70 ? 'major' : 'minor',
      recommendation: 'Focus on ICP framework mastery and prospect scoring methodology',
      improvementTime: '2-3 weeks'
    },
    {
      skill: 'Value Articulation',
      currentLevel: Math.round(competencyData.currentValueCommunication / 10),
      targetLevel: 7,
      severity: competencyData.currentValueCommunication < 50 ? 'critical' : competencyData.currentValueCommunication < 70 ? 'major' : 'minor',
      recommendation: 'Practice ROI calculation and value proposition delivery',
      improvementTime: '3-4 weeks'
    },
    {
      skill: 'Sales Process Management',
      currentLevel: Math.round(competencyData.currentSalesExecution / 10),
      targetLevel: 7,
      severity: competencyData.currentSalesExecution < 50 ? 'critical' : competencyData.currentSalesExecution < 70 ? 'major' : 'minor',
      recommendation: 'Develop systematic sales methodology and deal progression skills',
      improvementTime: '4-5 weeks'
    }
  ];

  return { gaps: skills };
};

const calculateTimelineEstimates = (competencyData, timeframe) => {
  const weekMapping = {
    '30days': 4,
    '90days': 12,
    '6months': 24
  };

  return {
    totalWeeks: weekMapping[timeframe] || 12,
    milestoneWeeks: {
      firstThreshold: 2,
      toolUnlock: 4,
      levelAdvancement: 6
    }
  };
};

export default ProfessionalDevelopmentPath;