import React, { useState, useEffect } from 'react';
import { CheckCircle, TrendingUp, Lock, Unlock, ArrowRight } from 'lucide-react';

const MethodologyUnlockNotification = ({ 
  isVisible, 
  onClose, 
  unlockedTool,
  competencyAchieved,
  nextSteps,
  className = '' 
}) => {
  const [animationPhase, setAnimationPhase] = useState('entering');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('entering');
      const timer1 = setTimeout(() => setAnimationPhase('visible'), 100);
      const timer2 = setTimeout(() => setAnimationPhase('exiting'), 8000);
      const timer3 = setTimeout(() => {
        onClose();
        setAnimationPhase('hidden');
      }, 8500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToolConfig = (toolName) => {
    const configs = {
      'cost-calculator': {
        title: 'Advanced Value Articulation Tools Available',
        icon: '📊',
        color: 'from-green-600 to-green-500',
        methodology: 'Cost of Inaction Analysis',
        description: 'Sophisticated value quantification capabilities',
        competencyTitle: 'Customer Analysis Foundation',
        rationalTitle: 'Value Quantification Readiness',
        rationalText: 'Your demonstrated customer analysis proficiency enables access to advanced revenue impact methodologies.',
        nextStepText: 'Continue systematic development with cost impact analysis and ROI calculations.',
        capabilities: [
          'Multi-scenario cost modeling',
          'Risk-adjusted impact calculations', 
          'Competitive positioning analysis',
          'Executive summary generation'
        ]
      },
      'business-case': {
        title: 'Executive Strategy Tools Accessible',
        icon: '📋',
        color: 'from-purple-600 to-purple-500',
        methodology: 'Strategic Business Case Development',
        description: 'Comprehensive strategic proposal frameworks',
        competencyTitle: 'Value Articulation Mastery',
        rationalTitle: 'Strategic Development Authorization',
        rationalText: 'Your proven value quantification capabilities qualify you for advanced strategic development methodologies.',
        nextStepText: 'Develop executive-level business cases with pilot-to-contract progression frameworks.',
        capabilities: [
          'Executive business case templates',
          'ROI projection modeling',
          'Risk mitigation frameworks',
          'Implementation roadmap generation'
        ]
      }
    };
    return configs[toolName] || configs['cost-calculator'];
  };

  const toolConfig = getToolConfig(unlockedTool);

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'entering':
        return 'translate-x-full opacity-0 scale-95';
      case 'visible':
        return 'translate-x-0 opacity-100 scale-100';
      case 'exiting':
        return '-translate-x-full opacity-0 scale-95';
      default:
        return 'translate-x-full opacity-0 scale-95';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`transform transition-all duration-500 ease-out ${getAnimationClasses()}`}>
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-md overflow-hidden">
          {/* Header with gradient accent */}
          <div className={`bg-gradient-to-r ${toolConfig.color} p-1`}>
            <div className="bg-gray-900 m-1 rounded-sm">
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{toolConfig.icon}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
                        Competency Demonstrated
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {toolConfig.competencyTitle}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-4">
            {/* Unlock Announcement */}
            <div className="text-center py-4 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Unlock className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-semibold text-white">
                  {toolConfig.title}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {toolConfig.methodology}
              </p>
            </div>

            {/* Professional Rationale */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                {toolConfig.rationalTitle}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {toolConfig.rationalText}
              </p>
            </div>

            {/* New Capabilities */}
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Now Available
              </h5>
              <div className="grid grid-cols-1 gap-2">
                {toolConfig.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                    <span className="text-gray-300">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Recommended Next Steps
              </h4>
              <p className="text-sm text-blue-200 leading-relaxed">
                {toolConfig.nextStepText}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                onClose();
                // Navigate to the newly unlocked tool
                if (window.location.pathname.includes('/dashboard/')) {
                  const newPath = window.location.pathname.replace(/\/dashboard\/.*$/, `/dashboard/${unlockedTool}`);
                  window.location.href = newPath;
                }
              }}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 bg-gradient-to-r ${toolConfig.color} hover:shadow-lg hover:scale-[1.02]`}
            >
              Access {toolConfig.methodology}
            </button>
          </div>

          {/* Professional Development Footer */}
          <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Professional Development Milestone</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400">Methodology Unlocked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing unlock notifications
export const useMethodologyUnlock = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    unlockedTool: null,
    competencyAchieved: null,
    nextSteps: null
  });

  const showUnlockNotification = (toolName, competency, steps) => {
    setNotification({
      isVisible: true,
      unlockedTool: toolName,
      competencyAchieved: competency,
      nextSteps: steps
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return {
    notification,
    showUnlockNotification,
    hideNotification
  };
};

export default MethodologyUnlockNotification;