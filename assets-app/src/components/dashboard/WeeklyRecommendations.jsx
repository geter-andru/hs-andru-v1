import React from 'react';
import { Target, MessageCircle, TrendingUp, Star, Clock, Zap, ArrowRight } from 'lucide-react';
import { useAssessment } from '../../contexts/AssessmentContext';

// Professional icons for categories (stealth gamification)
const CATEGORY_ICONS = {
  customerAnalysis: Target,
  valueCommunication: MessageCircle,
  salesExecution: TrendingUp,
  general: Star
};

// Professional colors for categories
const CATEGORY_COLORS = {
  customerAnalysis: {
    icon: 'text-blue-400',
    border: 'border-l-blue-400',
    bg: 'bg-blue-900/20'
  },
  valueCommunication: {
    icon: 'text-green-400',
    border: 'border-l-green-400', 
    bg: 'bg-green-900/20'
  },
  salesExecution: {
    icon: 'text-purple-400',
    border: 'border-l-purple-400',
    bg: 'bg-purple-900/20'
  },
  general: {
    icon: 'text-gray-400',
    border: 'border-l-gray-400',
    bg: 'bg-gray-900/20'
  }
};

// Priority styling (assessment-driven psychological urgency)
const PRIORITY_STYLES = {
  critical: {
    border: 'border-l-red-500',
    bg: 'bg-red-900/20',
    badge: 'bg-red-600 text-white',
    label: 'Critical'
  },
  strategic: {
    border: 'border-l-purple-400',
    bg: 'bg-purple-900/15',
    badge: 'bg-purple-600 text-white',
    label: 'Strategic'
  },
  high: {
    border: 'border-l-red-400',
    bg: 'bg-red-900/15',
    badge: 'bg-red-600 text-white',
    label: 'High Impact'
  },
  medium: {
    border: 'border-l-amber-400', 
    bg: 'bg-amber-900/15',
    badge: 'bg-amber-600 text-white',
    label: 'Standard'
  },
  low: {
    border: 'border-l-green-400',
    bg: 'bg-green-900/15', 
    badge: 'bg-green-600 text-white',
    label: 'Foundation'
  }
};

const RecommendationItem = ({ 
  title, 
  description, 
  points, 
  category, 
  timeEstimate, 
  priority, 
  onStart,
  className = '' 
}) => {
  const CategoryIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.general;
  const categoryStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
  const priorityStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;

  return (
    <div className={`
      group border-l-4 pl-4 pr-3 py-4 rounded-r-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
      ${priorityStyle.border} ${priorityStyle.bg}
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header with Category Icon */}
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-1.5 rounded-lg bg-gray-800 ${categoryStyle.icon}`}>
              <CategoryIcon size={14} />
            </div>
            <h5 className="text-white font-semibold text-sm group-hover:text-blue-100 transition-colors">
              {title}
            </h5>
            <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityStyle.badge}`}>
              {priorityStyle.label}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-purple-200 text-sm mb-3 leading-relaxed group-hover:text-purple-100 transition-colors">
            {description}
          </p>
          
          {/* Professional Metadata */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1 text-purple-300">
              <Clock size={12} />
              <span>{timeEstimate}</span>
            </div>
            <div className="flex items-center space-x-1 text-green-400 font-medium">
              <TrendingUp size={12} />
              <span>+{points} points</span>
            </div>
            <div className="text-purple-300 capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </div>
          </div>
        </div>
        
        {/* Professional Action Button */}
        <button
          onClick={onStart}
          className="ml-4 group/btn px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center space-x-1"
        >
          <span>Start</span>
          <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const WeeklyRecommendations = ({ 
  recommendations = [], 
  onStartSession,
  className = '' 
}) => {
  // Get personalized messaging from assessment context
  const { personalizedMessaging, getFocusAreaMessage, getRevenueOpportunity } = useAssessment();
  // Sort recommendations by priority for optimal psychological flow (assessment-driven)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { critical: 5, strategic: 4, high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
  });

  const handleStartRecommendation = (recommendation) => {
    if (onStartSession) {
      onStartSession(recommendation);
    } else {
      console.log('Starting professional development session:', recommendation.title);
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-white font-semibold flex items-center space-x-2">
            <Zap size={18} className="text-amber-400" />
            <span>{getFocusAreaMessage()?.focusArea ? `${getFocusAreaMessage().focusArea} Priorities` : 'Recommended This Week'}</span>
          </h4>
          <p className="text-purple-200 text-sm mt-1">
            {personalizedMessaging?.welcomeMessage?.secondary || `Strategic development priorities for $${Math.round(getRevenueOpportunity()/1000)}K revenue impact`}
          </p>
        </div>
        
        {/* Progress Indicator */}
        {recommendations.length > 0 && (
          <div className="text-right">
            <div className="text-purple-200 text-xs uppercase tracking-wide">
              Development Queue
            </div>
            <div className="text-white font-medium">
              {recommendations.length} objectives
            </div>
          </div>
        )}
      </div>
      
      {/* Recommendations List */}
      {sortedRecommendations.length > 0 ? (
        <div className="space-y-3">
          {sortedRecommendations.map((rec, index) => (
            <RecommendationItem 
              key={rec.id || index}
              title={rec.title}
              description={rec.description}
              points={rec.points}
              category={rec.category}
              timeEstimate={rec.timeEstimate}
              priority={rec.priority}
              onStart={() => handleStartRecommendation(rec)}
            />
          ))}
        </div>
      ) : (
        // Empty State (Encourages Engagement)
        <div className="text-center py-6 px-4 border-2 border-dashed border-purple-700/50 rounded-lg">
          <div className="text-purple-400 mb-2">
            <Star size={32} className="mx-auto opacity-50" />
          </div>
          <h5 className="text-white font-medium mb-1">No Active Recommendations</h5>
          <p className="text-purple-300 text-sm">
            Complete current activities to unlock new development objectives
          </p>
        </div>
      )}
      
      {/* Professional Summary */}
      {sortedRecommendations.length > 0 && (
        <div className="mt-4 p-3 bg-black/30 border border-purple-700/30 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="text-purple-200">
              Total Development Value:
            </div>
            <div className="text-green-400 font-semibold">
              +{sortedRecommendations.reduce((sum, rec) => sum + rec.points, 0)} points
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <div className="text-purple-200">
              Estimated Time Investment:
            </div>
            <div className="text-blue-400 font-medium">
              {sortedRecommendations.reduce((sum, rec) => {
                const minutes = parseInt(rec.timeEstimate.match(/\d+/)?.[0] || '0');
                return sum + minutes;
              }, 0)} minutes
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyRecommendations;