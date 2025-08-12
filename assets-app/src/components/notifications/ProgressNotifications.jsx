import React, { useState, useEffect, useRef } from 'react';
import { X, TrendingUp, Award, Unlock, Star, CheckCircle } from 'lucide-react';
import '../../styles/gamification.css';

const ProgressNotifications = ({ 
  notifications, 
  onDismiss, 
  position = 'top-right',
  className = '' 
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const timeoutRefs = useRef(new Map());

  useEffect(() => {
    // Add new notifications with stagger effect
    notifications.forEach((notification, index) => {
      if (!visibleNotifications.find(n => n.id === notification.id)) {
        const staggerTimeout = setTimeout(() => {
          setVisibleNotifications(prev => [...prev, notification]);
          
          // Auto-dismiss after delay (variable timing for psychological effect)
          const dismissDelay = getDismissDelay(notification.type);
          const dismissTimeout = setTimeout(() => {
            handleDismiss(notification.id);
          }, dismissDelay);
          
          // Store timeout reference for cleanup
          timeoutRefs.current.set(`${notification.id}_dismiss`, dismissTimeout);
        }, index * 200); // Stagger notifications
        
        // Store timeout reference for cleanup
        timeoutRefs.current.set(`${notification.id}_stagger`, staggerTimeout);
      }
    });
    
    // Cleanup function
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
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
    
    // Clear any pending timeouts for this notification
    const staggerKey = `${id}_stagger`;
    const dismissKey = `${id}_dismiss`;
    if (timeoutRefs.current.has(staggerKey)) {
      clearTimeout(timeoutRefs.current.get(staggerKey));
      timeoutRefs.current.delete(staggerKey);
    }
    if (timeoutRefs.current.has(dismissKey)) {
      clearTimeout(timeoutRefs.current.get(dismissKey));
      timeoutRefs.current.delete(dismissKey);
    }
    
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
        bgGradient: 'from-blue-900/90 to-blue-800/90',
        borderColor: 'border-blue-500',
        title: 'Strategic Progress Recognition',
        message: `+${data.points} Excellence Points`,
        subtitle: data.activity,
        celebrationLevel: 'medium'
      },
      competency_advancement: {
        icon: Award,
        iconColor: 'text-green-400',
        bgGradient: 'from-green-900/90 to-green-800/90',
        borderColor: 'border-green-500',
        title: 'Executive Competency Advancement',
        message: `${data.competency} +${data.gain}`,
        subtitle: 'Strategic capability expanded',
        celebrationLevel: 'high'
      },
      milestone_reached: {
        icon: Star,
        iconColor: 'text-yellow-400',
        bgGradient: 'from-yellow-900/90 to-yellow-800/90',
        borderColor: 'border-yellow-500',
        title: 'Strategic Milestone Achievement',
        message: data.milestone_name,
        subtitle: 'Executive excellence demonstrated',
        celebrationLevel: 'high'
      },
      tool_access_earned: {
        icon: Unlock,
        iconColor: 'text-purple-400',
        bgGradient: 'from-purple-900/90 to-purple-800/90',
        borderColor: 'border-purple-500',
        title: 'Executive Methodology Unlocked',
        message: data.tool_name,
        subtitle: 'Strategic competency requirements fulfilled',
        celebrationLevel: 'high'
      },
      consistency_reward: {
        icon: CheckCircle,
        iconColor: 'text-emerald-400',
        bgGradient: 'from-emerald-900/90 to-emerald-800/90',
        borderColor: 'border-emerald-500',
        title: 'Executive Excellence Momentum',
        message: `${data.streak_days} Day Strategic Consistency`,
        subtitle: 'Leadership dedication recognized',
        celebrationLevel: 'high'
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
        className={`relative mb-4 transform transition-all duration-500 ease-out animate-notification-professional`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Executive Glow Effect for High Achievement */}
        {content.celebrationLevel === 'high' && (
          <div className={`absolute inset-0 bg-gradient-to-r ${content.bgGradient} opacity-30 blur-2xl rounded-xl animate-sophisticated-glow`} />
        )}
        
        {/* Executive Notification Card */}
        <div className={`notification-container notification-${notification.type} max-w-md`}>
          {/* Executive Animated Border Effect */}
          {content.celebrationLevel === 'high' && (
            <div className={`absolute inset-0 bg-gradient-to-r ${content.bgGradient} opacity-20 animate-milestone-celebration`} />
          )}
          
          {/* Executive Header */}
          <div className={`relative bg-gradient-to-r ${content.bgGradient} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 bg-black/30 rounded-xl shadow-lg ${content.celebrationLevel === 'high' ? 'animate-milestone-bounce' : 'animate-professional-pulse'}`}>
                  <Icon className={`w-6 h-6 ${content.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base tracking-tight">
                    {content.title}
                  </h3>
                  {notification.timestamp && (
                    <p className="text-sm text-gray-200 opacity-80 font-medium">
                      {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="professional-interactive text-gray-300 hover:text-white p-2 hover:bg-white/20 rounded-lg backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Executive Content */}
          <div className="relative p-6">
            <div className="space-y-3">
              <p className="text-white font-bold text-lg">
                {content.message}
              </p>
              {content.subtitle && (
                <p className="text-gray-300 text-sm font-medium leading-relaxed">
                  {content.subtitle}
                </p>
              )}
              
              {/* Executive Progress Points Animation */}
              {notification.data?.points && (
                <div className="flex items-center space-x-3 mt-4">
                  <div className="flex-1 bg-gray-700/50 rounded-full h-3 shadow-inner">
                    <div
                      className={`bg-gradient-to-r ${content.bgGradient} h-3 rounded-full animate-sophisticated-progress-fill shadow-lg`}
                      style={{ width: '100%', '--target-width': '100%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>
                  </div>
                  <span className="text-sm text-gray-200 font-bold whitespace-nowrap animate-sophisticated-points-increment">
                    +{notification.data.points}
                  </span>
                </div>
              )}

              {/* Executive Competency Advancement Visualization */}
              {notification.data?.competency && (
                <div className="mt-4 p-4 bg-gray-800/60 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-medium">
                      {notification.data.competency}
                    </span>
                    <span className="text-sm font-bold text-green-400 animate-competency-advancement">
                      +{notification.data.gain}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Executive Achievement Celebration Effect */}
            {content.celebrationLevel === 'high' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-professional-confetti" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-purple-400 rounded-full animate-professional-confetti" style={{ animationDelay: '0.3s' }} />
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-400 rounded-full animate-professional-confetti" style={{ animationDelay: '0.6s' }} />
              </div>
            )}
          </div>

          {/* Executive Milestone Footer */}
          {notification.type === 'milestone_reached' && notification.data?.badge && (
            <div className="px-6 pb-6">
              <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${content.bgGradient} rounded-xl border-2 ${content.borderColor} shadow-lg`}>
                <Star className="w-4 h-4 text-yellow-400 mr-2 animate-executive-streak-fire" />
                <span className="text-sm font-bold text-white">
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
      <div className="space-y-4 max-h-screen overflow-y-auto">
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