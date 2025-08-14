import React from 'react';
import { 
  UserPlus, 
  Calculator, 
  Download, 
  PlusCircle, 
  Lock, 
  Clock, 
  TrendingUp,
  Target,
  FileText,
  Activity
} from 'lucide-react';

// Icon mapping for action types
const ACTION_ICONS = {
  'user-plus': UserPlus,
  'calculator': Calculator,
  'download': Download,
  'plus-circle': PlusCircle,
  'target': Target,
  'file-text': FileText,
  'activity': Activity,
  'trending-up': TrendingUp
};

// Category color schemes
const CATEGORY_STYLES = {
  customerAnalysis: {
    border: 'border-blue-500',
    hover: 'hover:bg-blue-900/30',
    icon: 'text-blue-400',
    badge: 'bg-blue-900/50 text-blue-300',
    locked: 'border-blue-900/50'
  },
  valueCommunication: {
    border: 'border-green-500',
    hover: 'hover:bg-green-900/30',
    icon: 'text-green-400',
    badge: 'bg-green-900/50 text-green-300',
    locked: 'border-green-900/50'
  },
  salesExecution: {
    border: 'border-purple-500',
    hover: 'hover:bg-purple-900/30',
    icon: 'text-purple-400',
    badge: 'bg-purple-900/50 text-purple-300',
    locked: 'border-purple-900/50'
  },
  general: {
    border: 'border-gray-500',
    hover: 'hover:bg-gray-700/30',
    icon: 'text-gray-400',
    badge: 'bg-gray-700/50 text-gray-300',
    locked: 'border-gray-700/50'
  }
};

const QuickActionButton = ({
  title,
  description,
  icon,
  onClick,
  enabled = true,
  category = 'general',
  estimatedTime,
  pointValue,
  requirement,
  progress,
  className = ''
}) => {
  const IconComponent = ACTION_ICONS[icon] || PlusCircle;
  const styles = CATEGORY_STYLES[category] || CATEGORY_STYLES.general;
  
  // Calculate progress percentage if provided
  const progressPercent = progress ? Math.min(100, Math.max(0, progress)) : 0;
  const isNearUnlock = !enabled && progressPercent >= 80;

  return (
    <button
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200 text-left
        min-h-[120px] md:min-h-[140px]
        ${enabled 
          ? `${styles.border} ${styles.hover} hover:scale-105 cursor-pointer bg-gray-800 hover:shadow-lg` 
          : `${styles.locked} bg-gray-900/50 opacity-75 cursor-not-allowed`
        }
        ${className}
      `}
      aria-label={`${title} - ${enabled ? 'Available' : 'Locked'}`}
      aria-disabled={!enabled}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        {/* Main Icon */}
        <div className={`${enabled ? styles.icon : 'text-gray-600'}`}>
          <IconComponent size={24} />
        </div>
        
        {/* Lock Status */}
        {!enabled && (
          <div className="flex items-center space-x-1">
            <Lock size={14} className="text-gray-500" />
            {isNearUnlock && (
              <span className="text-xs text-amber-400 font-medium">Soon</span>
            )}
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="mb-3">
        {/* Title */}
        <h4 className={`font-semibold mb-1 ${enabled ? 'text-white' : 'text-gray-500'}`}>
          {title}
        </h4>
        
        {/* Description */}
        <p className={`text-sm line-clamp-2 ${enabled ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
      
      {/* Metadata Footer */}
      <div className="space-y-2">
        {/* Time and Points */}
        <div className="flex items-center justify-between text-xs">
          {estimatedTime && (
            <div className={`flex items-center space-x-1 ${enabled ? 'text-gray-400' : 'text-gray-600'}`}>
              <Clock size={12} />
              <span>{estimatedTime}</span>
            </div>
          )}
          
          {pointValue && (
            <div className={`flex items-center space-x-1 ${enabled ? 'text-green-400' : 'text-gray-600'}`}>
              <TrendingUp size={12} />
              <span className="font-medium">+{pointValue} pts</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar for Locked Items */}
        {!enabled && progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className={isNearUnlock ? 'text-amber-400' : 'text-gray-500'}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isNearUnlock 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Requirement Text */}
        {!enabled && requirement && (
          <div className="text-xs text-gray-500 italic">
            Requires: {requirement}
          </div>
        )}
      </div>
      
      {/* Locked Overlay */}
      {!enabled && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center p-4">
            <Lock size={20} className="text-gray-500 mx-auto mb-2" />
            <div className="text-xs text-gray-400 font-medium">
              {isNearUnlock ? 'Almost Unlocked!' : 'Keep Growing'}
            </div>
            {progress !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                {100 - Math.round(progressPercent)}% to go
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Professional Hover Glow Effect */}
      {enabled && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-green-600/0 opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};

export default QuickActionButton;