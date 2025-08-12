import React, { useState, useEffect } from 'react';
import { X, TrendingUp, Award, Unlock, Star, CheckCircle } from 'lucide-react';

const ProgressNotifications = ({ 
  notifications, 
  onDismiss, 
  position = 'top-right',
  className = '' 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Add new notifications with stagger effect
    notifications.forEach((notification, index) => {
      if (!visibleNotifications.find(n => n.id === notification.id)) {
        setTimeout(() => {
          setVisibleNotifications(prev => [...prev, notification]);
          
          // Auto-dismiss after delay (variable timing for psychological effect)
          const dismissDelay = getDismissDelay(notification.type);
          setTimeout(() => {
            handleDismiss(notification.id);
          }, dismissDelay);
        }, index * 200); // Stagger notifications
      }
    });
  }, [notifications]);

  const getDismissDelay = (type) => {
    // Variable timing creates anticipation and prevents habituation
    const delays = {
      progress_recognition: 3000,
      competency_advancement: 4500,
      milestone_reached: 6000,
      tool_access_earned: 5000,
      consistency_reward: 4000
    };
    return delays[type] || 3500;
  };

  const handleDismiss = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const getNotificationContent = (notification) => {
    const { type, data } = notification;
    
    const contentMap = {
      progress_recognition: {
        icon: TrendingUp,
        iconColor: 'text-blue-400',
        bgGradient: 'from-blue-900/80 to-blue-800/80',
        borderColor: 'border-blue-600',
        title: 'Progress Recognition',
        message: `+${data.points} Development Points`,
        subtitle: data.activity,
        celebrationLevel: 'low'
      },
      competency_advancement: {
        icon: Award,
        iconColor: 'text-green-400',
        bgGradient: 'from-green-900/80 to-green-800/80',
        borderColor: 'border-green-600',
        title: 'Competency Advanced',
        message: `${data.competency} +${data.gain}`,
        subtitle: 'Professional capability increased',
        celebrationLevel: 'medium'
      },
      milestone_reached: {
        icon: Star,
        iconColor: 'text-yellow-400',
        bgGradient: 'from-yellow-900/80 to-yellow-800/80',
        borderColor: 'border-yellow-600',
        title: 'Professional Milestone',
        message: data.milestone_name,
        subtitle: 'Systematic development recognized',
        celebrationLevel: 'high'
      },
      tool_access_earned: {
        icon: Unlock,
        iconColor: 'text-purple-400',
        bgGradient: 'from-purple-900/80 to-purple-800/80',
        borderColor: 'border-purple-600',
        title: 'Advanced Tools Available',
        message: data.tool_name,
        subtitle: 'Competency readiness demonstrated',
        celebrationLevel: 'high'
      },
      consistency_reward: {
        icon: CheckCircle,
        iconColor: 'text-emerald-400',
        bgGradient: 'from-emerald-900/80 to-emerald-800/80',
        borderColor: 'border-emerald-600',
        title: 'Consistency Recognition',
        message: `${data.streak_days} Day Excellence`,
        subtitle: 'Professional dedication acknowledged',
        celebrationLevel: 'medium'
      }
    };

    return contentMap[type] || contentMap.progress_recognition;
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };
    return positions[position] || positions['top-right'];
  };

  const NotificationCard = ({ notification, index }) => {
    const content = getNotificationContent(notification);
    const Icon = content.icon;
    const animationDelay = index * 100;

    return (
      <div
        className={`relative mb-3 transform transition-all duration-500 ease-out animate-slide-in-right`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Glow effect for high celebration level */}
        {content.celebrationLevel === 'high' && (
          <div className={`absolute inset-0 bg-gradient-to-r ${content.bgGradient} opacity-20 blur-xl rounded-lg animate-pulse`} />
        )}
        
        {/* Main notification card */}
        <div className={`relative bg-gray-900/95 backdrop-blur-sm border-2 ${content.borderColor} rounded-lg shadow-2xl max-w-sm overflow-hidden`}>
          {/* Animated border effect */}
          {content.celebrationLevel === 'high' && (
            <div className={`absolute inset-0 bg-gradient-to-r ${content.bgGradient} opacity-30 animate-pulse`} />
          )}
          
          {/* Header */}
          <div className={`relative bg-gradient-to-r ${content.bgGradient} p-4 border-b border-gray-700`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-black/20 rounded-lg ${content.celebrationLevel === 'high' ? 'animate-bounce' : ''}`}>
                  <Icon className={`w-5 h-5 ${content.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {content.title}
                  </h3>
                  {notification.timestamp && (
                    <p className="text-xs text-gray-300 opacity-75">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-4">
            <div className="space-y-2">
              <p className="text-white font-medium">
                {content.message}
              </p>
              {content.subtitle && (
                <p className="text-gray-400 text-sm">
                  {content.subtitle}
                </p>
              )}
              
              {/* Progress points animation */}
              {notification.data?.points && (
                <div className="flex items-center space-x-2 mt-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${content.bgGradient} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    +{notification.data.points}
                  </span>
                </div>
              )}

              {/* Competency gain visualization */}
              {notification.data?.competency && (
                <div className="mt-3 p-2 bg-gray-800/50 rounded border border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {notification.data.competency}
                    </span>
                    <span className="text-xs font-medium text-green-400">
                      +{notification.data.gain}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Achievement sparkle effect */}
            {content.celebrationLevel === 'high' && (
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full" />
              </div>
            )}
          </div>

          {/* Footer for milestones */}
          {notification.type === 'milestone_reached' && notification.data?.badge && (
            <div className="px-4 pb-4">
              <div className={`inline-flex items-center px-3 py-1 bg-gradient-to-r ${content.bgGradient} rounded-full border ${content.borderColor}`}>
                <Star className="w-3 h-3 text-yellow-400 mr-2" />
                <span className="text-xs font-medium text-white">
                  {notification.data.badge}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()} ${className}`}>
      <div className="space-y-3 max-h-screen overflow-y-auto">
        {visibleNotifications.map((notification, index) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

// Hook for managing progress notifications
export const useProgressNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [nextId, setNextId] = useState(1);

  const addNotification = (type, data, options = {}) => {
    const notification = {
      id: nextId,
      type,
      data,
      timestamp: new Date().toISOString(),
      ...options
    };

    setNotifications(prev => [...prev, notification]);
    setNextId(prev => prev + 1);

    return notification.id;
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Professional notification builders
  const showProgressRecognition = (activity, points) => {
    return addNotification('progress_recognition', { activity, points });
  };

  const showCompetencyAdvancement = (competency, gain) => {
    return addNotification('competency_advancement', { competency, gain });
  };

  const showMilestoneReached = (milestoneName, badge, points = 0) => {
    return addNotification('milestone_reached', { 
      milestone_name: milestoneName, 
      badge,
      points 
    });
  };

  const showToolAccessEarned = (toolName) => {
    return addNotification('tool_access_earned', { tool_name: toolName });
  };

  const showConsistencyReward = (streakDays, points = 0) => {
    return addNotification('consistency_reward', { 
      streak_days: streakDays, 
      points 
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    // Professional builders
    showProgressRecognition,
    showCompetencyAdvancement,
    showMilestoneReached,
    showToolAccessEarned,
    showConsistencyReward
  };
};

export default ProgressNotifications;