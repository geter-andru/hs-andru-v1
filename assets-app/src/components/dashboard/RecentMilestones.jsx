import React from 'react';
import { Trophy, Target, MessageCircle, TrendingUp, Star, Zap, Award, ArrowRight } from 'lucide-react';

// Professional milestone categories (stealth gamification achievement system)
const MILESTONE_CATEGORIES = {
  customerAnalysis: {
    icon: Target,
    label: 'Customer Intelligence',
    description: 'Systematic buyer analysis capability'
  },
  valueCommunication: {
    icon: MessageCircle,
    label: 'Value Intelligence',
    description: 'Business impact communication mastery'
  },
  salesExecution: {
    icon: TrendingUp,
    label: 'Revenue Intelligence',
    description: 'Advanced sales process execution'
  },
  competency: {
    icon: Star,
    label: 'Professional Advancement',
    description: 'Systematic skill development'
  },
  streak: {
    icon: Zap,
    label: 'Consistency Achievement',
    description: 'Sustained development practice'
  },
  achievement: {
    icon: Award,
    label: 'Professional Recognition',
    description: 'Exceptional performance milestone'
  }
};

// Professional level styling (psychological hierarchy without gaming aesthetics)
const LEVEL_STYLES = {
  foundation: {
    color: 'text-amber-400',
    bg: 'bg-amber-900/30',
    border: 'border-amber-500/30',
    label: 'Foundation'
  },
  developing: {
    color: 'text-blue-400',
    bg: 'bg-blue-900/30',
    border: 'border-blue-500/30',
    label: 'Developing'
  },
  proficient: {
    color: 'text-green-400',
    bg: 'bg-green-900/30',
    border: 'border-green-500/30',
    label: 'Proficient'
  },
  advanced: {
    color: 'text-purple-400',
    bg: 'bg-purple-900/30',
    border: 'border-purple-500/30',
    label: 'Advanced'
  },
  expert: {
    color: 'text-red-400',
    bg: 'bg-red-900/30',
    border: 'border-red-500/30',
    label: 'Expert'
  }
};

const MilestoneItem = ({ 
  title, 
  description, 
  completedAt, 
  category, 
  level,
  isRecent = false,
  className = '' 
}) => {
  const milestoneCategory = MILESTONE_CATEGORIES[category] || MILESTONE_CATEGORIES.competency;
  const levelStyle = LEVEL_STYLES[level] || LEVEL_STYLES.foundation;
  const IconComponent = milestoneCategory.icon;

  return (
    <div className={`
      group flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
      ${isRecent ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 animate-pulse' : 'bg-black/30 border-gray-700/30'}
      ${className}
    `}>
      {/* Professional Icon with Level Styling */}
      <div className={`
        p-3 rounded-lg border transition-all duration-200 group-hover:scale-110
        ${levelStyle.bg} ${levelStyle.border}
      `}>
        <IconComponent size={18} className={levelStyle.color} />
      </div>
      
      {/* Milestone Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title with Recent Indicator */}
            <div className="flex items-center space-x-2 mb-1">
              <h5 className="text-white font-semibold text-sm truncate group-hover:text-blue-100 transition-colors">
                {title}
              </h5>
              {isRecent && (
                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full font-medium">
                  New
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className="text-purple-200 text-xs leading-relaxed group-hover:text-purple-100 transition-colors">
              {description}
            </p>
            
            {/* Professional Metadata */}
            <div className="flex items-center space-x-3 mt-2 text-xs">
              <span className="text-purple-300">{completedAt}</span>
              <span className="text-gray-500">•</span>
              <span className="text-purple-300">{milestoneCategory.label}</span>
            </div>
          </div>
          
          {/* Level Badge */}
          <div className={`
            px-2 py-1 rounded-full text-xs font-medium border
            ${levelStyle.bg} ${levelStyle.color} ${levelStyle.border}
          `}>
            {levelStyle.label}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentMilestones = ({ 
  milestones = [], 
  showAll,
  className = '' 
}) => {
  // Show most recent 3 milestones for optimal psychological impact
  const recentMilestones = milestones.slice(0, 3);
  const hasMoreMilestones = milestones.length > 3;

  // Identify very recent milestones (last 24 hours for animation)
  const isRecentMilestone = (milestone) => {
    const completedText = milestone.completedAt?.toLowerCase() || '';
    return completedText.includes('hour') || completedText.includes('minute') || completedText === 'today';
  };

  return (
    <div className={`mb-6 ${className}`}>
      {/* Professional Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-white font-semibold flex items-center space-x-2">
            <Trophy size={18} className="text-amber-400" />
            <span>Professional Milestones</span>
          </h4>
          <p className="text-purple-200 text-sm mt-1">
            Recognition of systematic development achievements
          </p>
        </div>
        
        {/* View All Button */}
        {hasMoreMilestones && (
          <button 
            onClick={showAll}
            className="group flex items-center space-x-1 text-purple-300 hover:text-purple-200 text-sm transition-colors"
          >
            <span>View All</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
      
      {/* Milestones List */}
      {recentMilestones.length > 0 ? (
        <div className="space-y-3">
          {recentMilestones.map((milestone, index) => (
            <MilestoneItem 
              key={milestone.id || index}
              title={milestone.title}
              description={milestone.description}
              completedAt={milestone.completedAt}
              category={milestone.category}
              level={milestone.level}
              isRecent={isRecentMilestone(milestone)}
            />
          ))}
        </div>
      ) : (
        // Empty State (Encourages Engagement)
        <div className="text-center py-6 px-4 border-2 border-dashed border-purple-700/50 rounded-lg">
          <div className="text-purple-400 mb-3">
            <Trophy size={32} className="mx-auto opacity-50" />
          </div>
          <h5 className="text-white font-medium mb-2">No Milestones Yet</h5>
          <p className="text-purple-300 text-sm leading-relaxed">
            Complete professional development activities to earn recognition for your systematic advancement
          </p>
          <div className="mt-3 text-xs text-purple-400">
            Your achievements will appear here as you progress
          </div>
        </div>
      )}
      
      {/* Professional Summary Statistics */}
      {recentMilestones.length > 0 && (
        <div className="mt-4 p-3 bg-black/30 border border-purple-700/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-white">
                {milestones.length}
              </div>
              <div className="text-xs text-purple-200 uppercase tracking-wide">
                Total Achieved
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">
                {milestones.filter(m => isRecentMilestone(m)).length}
              </div>
              <div className="text-xs text-purple-200 uppercase tracking-wide">
                This Week
              </div>
            </div>
          </div>
          
          {/* Professional Encouragement */}
          <div className="mt-3 pt-3 border-t border-purple-700/30 text-center">
            <p className="text-xs text-purple-300">
              Consistent development creates sustainable competitive advantage
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentMilestones;