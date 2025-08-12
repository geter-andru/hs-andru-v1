import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Zap, Star, ArrowUp } from 'lucide-react';
import { useProgressNotifications } from '../notifications/ProgressNotifications';

const CompetencyFeedback = ({ 
  customerId, 
  recentActions = [], 
  competencyChanges = [],
  className = '' 
}) => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [competencyLevels, setCompetencyLevels] = useState({});
  const [showingFeedback, setShowingFeedback] = useState(false);
  const { 
    showProgressRecognition, 
    showCompetencyAdvancement, 
    showConsistencyReward 
  } = useProgressNotifications();

  useEffect(() => {
    // Process recent actions into feedback
    const processedFeedback = recentActions.map(action => ({
      id: `${action.type}_${action.timestamp}`,
      type: action.type,
      message: generateFeedbackMessage(action),
      points: calculateProgressPoints(action),
      timestamp: action.timestamp,
      competencyImpact: calculateCompetencyImpact(action)
    }));

    setFeedbackItems(processedFeedback.slice(0, 5)); // Keep recent 5 items
  }, [recentActions]);

  useEffect(() => {
    // Process competency changes and show notifications
    competencyChanges.forEach(change => {
      if (change.gained > 0) {
        showCompetencyAdvancement(change.competency, change.gained);
        
        // Show consistency rewards for streaks
        if (change.type === 'streak_bonus') {
          showConsistencyReward(change.streak_days, change.bonus_points);
        }
      }
    });
  }, [competencyChanges, showCompetencyAdvancement, showConsistencyReward]);

  const generateFeedbackMessage = (action) => {
    const messages = {
      icp_completed: {
        message: 'Customer analysis methodology applied',
        activity: 'ICP Analysis Completion',
        celebration: 'Systematic approach recognized'
      },
      cost_calculated: {
        message: 'Value quantification framework executed',
        activity: 'Revenue Impact Analysis',
        celebration: 'Financial modeling proficiency demonstrated'
      },
      business_case_ready: {
        message: 'Strategic proposal development completed',
        activity: 'Business Case Construction',
        celebration: 'Executive communication capability exhibited'
      },
      workflow_completed: {
        message: 'Comprehensive methodology workflow executed',
        activity: 'Full Strategic Process',
        celebration: 'End-to-end competency demonstrated'
      },
      consistency_milestone: {
        message: 'Professional development consistency maintained',
        activity: 'Daily Engagement',
        celebration: 'Systematic practice excellence'
      },
      efficiency_achievement: {
        message: 'Process efficiency benchmark exceeded',
        activity: 'Rapid Methodology Execution',
        celebration: 'Optimization mastery displayed'
      }
    };

    return messages[action.type] || {
      message: 'Professional development progress',
      activity: 'Methodology Practice',
      celebration: 'Competency advancement'
    };
  };

  const calculateProgressPoints = (action) => {
    const pointValues = {
      icp_completed: 25,
      cost_calculated: 35,
      business_case_ready: 50,
      workflow_completed: 100,
      consistency_milestone: 75,
      efficiency_achievement: 40
    };

    let basePoints = pointValues[action.type] || 10;

    // Bonus modifiers based on performance
    if (action.score && action.score > 80) {
      basePoints *= 1.5; // Excellence multiplier
    }
    
    if (action.speed && action.speed < 300) { // Under 5 minutes
      basePoints *= 1.25; // Speed multiplier
    }

    return Math.round(basePoints);
  };

  const calculateCompetencyImpact = (action) => {
    const competencyMap = {
      icp_completed: [
        { type: 'customer_analysis', gain: 3 },
        { type: 'systematic_thinking', gain: 2 }
      ],
      cost_calculated: [
        { type: 'value_articulation', gain: 4 },
        { type: 'financial_modeling', gain: 3 }
      ],
      business_case_ready: [
        { type: 'strategic_communication', gain: 5 },
        { type: 'executive_presence', gain: 3 }
      ],
      workflow_completed: [
        { type: 'process_mastery', gain: 8 },
        { type: 'comprehensive_thinking', gain: 6 }
      ]
    };

    return competencyMap[action.type] || [];
  };

  const FeedbackItem = ({ item, index }) => {
    const feedbackContent = generateFeedbackMessage({ type: item.type });
    const isRecent = index < 2;

    return (
      <div className={`relative p-4 rounded-lg border transition-all duration-500 ${
        isRecent 
          ? 'bg-blue-900/20 border-blue-700 animate-fade-in' 
          : 'bg-gray-800 border-gray-700'
      } hover:border-gray-600`}>
        
        {/* Fresh indicator */}
        {isRecent && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        )}

        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${
            isRecent ? 'bg-blue-800/50' : 'bg-gray-700'
          }`}>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-white text-sm">
                {feedbackContent.celebration}
              </h4>
              {item.points > 0 && (
                <span className="text-xs font-semibold text-green-400">
                  +{item.points}
                </span>
              )}
            </div>
            
            <p className="text-gray-400 text-xs mb-2">
              {feedbackContent.message}
            </p>

            {/* Competency impacts */}
            {item.competencyImpact && item.competencyImpact.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.competencyImpact.map((impact, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded border border-green-800">
                    {impact.type.replace('_', ' ')} +{impact.gain}
                  </span>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-2">
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompetencyMeter = ({ competency, level, change = 0 }) => {
    const levelValues = {
      Foundation: 20,
      Developing: 40,
      Proficient: 60,
      Advanced: 80,
      Expert: 100
    };

    const currentValue = levelValues[level] || 0;
    const hasGrowth = change > 0;

    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-white text-sm">
            {competency.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h4>
          <div className="flex items-center space-x-1">
            {hasGrowth && (
              <>
                <ArrowUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">+{change}</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">{level}</span>
            <span className="text-gray-300">{currentValue}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                hasGrowth 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${currentValue}%` }}
            />
          </div>
          
          {hasGrowth && (
            <div className="text-xs text-green-400 font-medium">
              Professional capability increased
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Real-time Feedback Stream */}
      {feedbackItems.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Real-time Development Recognition
            </h3>
            <button
              onClick={() => setShowingFeedback(!showingFeedback)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showingFeedback ? 'Minimize' : 'View Details'}
            </button>
          </div>

          {showingFeedback && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {feedbackItems.map((item, index) => (
                <FeedbackItem key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Competency Level Display */}
      {Object.keys(competencyLevels).length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-400" />
            Competency Advancement Status
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(competencyLevels).map(([competency, data]) => (
              <CompetencyMeter
                key={competency}
                competency={competency}
                level={data.level}
                change={data.recent_gain}
              />
            ))}
          </div>
        </div>
      )}

      {/* Achievement Summary */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-purple-400" />
          Professional Achievement Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {feedbackItems.reduce((sum, item) => sum + item.points, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Progress Points</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {feedbackItems.length}
            </div>
            <div className="text-xs text-gray-400">Recent Activities</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {competencyChanges.reduce((sum, change) => sum + change.gained, 0)}
            </div>
            <div className="text-xs text-gray-400">Competency Gains</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {Object.keys(competencyLevels).length}
            </div>
            <div className="text-xs text-gray-400">Active Competencies</div>
          </div>
        </div>

        {/* Excellence multiplier indicator */}
        {feedbackItems.some(item => item.points > 50) && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">
                Excellence Multiplier Active
              </span>
            </div>
            <p className="text-xs text-yellow-200 mt-1">
              High-performance activities are generating bonus recognition points
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyFeedback;