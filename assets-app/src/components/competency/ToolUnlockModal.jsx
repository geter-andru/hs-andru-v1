import React, { useState, useEffect } from 'react';
import { X, Unlock, Award, TrendingUp, Star, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const ToolUnlockModal = ({ 
  isOpen, 
  onClose, 
  unlockedTool, 
  competencyAchieved,
  onNavigateToTool,
  className = '' 
}) => {
  const [animationPhase, setAnimationPhase] = useState('entering');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const triggerConfetti = () => {
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
          });
        }, 250);

        return () => clearInterval(interval);
      };

      setAnimationPhase('entering');
      setShowContent(false);
      
      const confettiCleanup = triggerConfetti();
      
      setTimeout(() => {
        setAnimationPhase('visible');
        setShowContent(true);
      }, 300);

      return () => {
        if (confettiCleanup) confettiCleanup();
      };
    }
  }, [isOpen]);

  if (!isOpen || !unlockedTool) return null;

  const getToolConfig = () => {
    const configs = {
      'cost-calculator': {
        name: 'Cost of Inaction Calculator',
        icon: '📊',
        level: 'Developing Level',
        levelBadge: 'Level 2',
        color: 'green',
        competency: 'Value Quantification',
        achievement: 'Customer Analysis Foundation Mastered',
        description: 'Advanced revenue impact analysis methodology now accessible',
        capabilities: [
          'Multi-scenario cost modeling',
          'Risk-adjusted impact calculations',
          'Competitive positioning analysis',
          'Executive summary generation'
        ],
        professionalMessage: 'Your demonstrated customer analysis proficiency qualifies you for advanced value articulation methodologies.',
        nextStep: 'Begin quantifying business impact with sophisticated financial modeling tools.',
        celebrationMessage: 'Outstanding Professional Achievement!'
      },
      'business-case': {
        name: 'Business Case Builder',
        icon: '📋',
        level: 'Proficient Level',
        levelBadge: 'Level 3',
        color: 'purple',
        competency: 'Strategic Development',
        achievement: 'Value Articulation Mastery Achieved',
        description: 'Executive strategic development framework now accessible',
        capabilities: [
          'Comprehensive business case templates',
          'ROI projection modeling',
          'Risk mitigation frameworks',
          'Implementation roadmap generation'
        ],
        professionalMessage: 'Your proven value quantification expertise enables access to executive-level strategic development tools.',
        nextStep: 'Create comprehensive business cases with pilot-to-contract progression frameworks.',
        celebrationMessage: 'Exceptional Strategic Competency!'
      }
    };
    return configs[unlockedTool] || configs['cost-calculator'];
  };

  const toolConfig = getToolConfig();

  const handleNavigate = () => {
    if (onNavigateToTool) {
      onNavigateToTool(unlockedTool);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className}`}>
        <div className={`bg-gray-900 border-2 border-${toolConfig.color}-600 rounded-xl shadow-2xl max-w-2xl w-full transform transition-all duration-500 ${
          animationPhase === 'entering' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {/* Glowing Border Effect */}
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${toolConfig.color}-600 to-${toolConfig.color}-500 opacity-20 blur-xl`} />

          {/* Content Container */}
          <div className="relative">
            {/* Header with Gradient */}
            <div className={`bg-gradient-to-r from-${toolConfig.color}-900/80 to-${toolConfig.color}-800/80 rounded-t-xl border-b border-gray-700 p-6`}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Achievement Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className={`relative`}>
                  <div className={`w-24 h-24 bg-gradient-to-br from-${toolConfig.color}-600 to-${toolConfig.color}-500 rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
                    <div className="text-4xl">{toolConfig.icon}</div>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                  </div>
                </div>
              </div>

              {/* Celebration Message */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2 animate-fade-in">
                  {toolConfig.celebrationMessage}
                </h2>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-semibold text-yellow-400">
                    {toolConfig.achievement}
                  </span>
                </div>
                <p className={`text-${toolConfig.color}-300 font-medium`}>
                  {toolConfig.competency} Competency Unlocked
                </p>
              </div>
            </div>

            {/* Body Content */}
            {showContent && (
              <div className="p-6 space-y-6 animate-slide-up">
                {/* Unlock Announcement */}
                <div className={`bg-${toolConfig.color}-900/20 border border-${toolConfig.color}-700 rounded-lg p-4`}>
                  <div className="flex items-center space-x-3">
                    <Unlock className={`w-6 h-6 text-${toolConfig.color}-400`} />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {toolConfig.name} Now Available
                      </h3>
                      <p className={`text-${toolConfig.color}-200 text-sm`}>
                        {toolConfig.description}
                      </p>
                    </div>
                    <div className={`px-3 py-1 bg-${toolConfig.color}-900 border border-${toolConfig.color}-600 rounded-full`}>
                      <span className={`text-sm font-semibold text-${toolConfig.color}-300`}>
                        {toolConfig.levelBadge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Professional Rationale */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-300 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-400" />
                    Professional Development Achievement
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {toolConfig.professionalMessage}
                  </p>
                </div>

                {/* New Capabilities */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-400" />
                    New Methodologies Available
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {toolConfig.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <ChevronRight className={`w-4 h-4 text-${toolConfig.color}-400 mt-0.5 flex-shrink-0`} />
                        <p className="text-sm text-gray-400">{capability}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-300 mb-2">
                    Recommended Next Steps
                  </h4>
                  <p className="text-blue-200 text-sm">
                    {toolConfig.nextStep}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleNavigate}
                    className={`flex-1 py-3 px-4 bg-gradient-to-r from-${toolConfig.color}-600 to-${toolConfig.color}-500 hover:from-${toolConfig.color}-700 hover:to-${toolConfig.color}-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center space-x-2`}
                  >
                    <span>Access {toolConfig.name}</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors duration-200"
                  >
                    Continue Later
                  </button>
                </div>

                {/* Professional Note */}
                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    This achievement reflects your professional development in {toolConfig.competency.toLowerCase()}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Hook for managing unlock modal
export const useToolUnlockModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    unlockedTool: null,
    competencyAchieved: null
  });

  const showUnlockModal = (tool, competency) => {
    setModalState({
      isOpen: true,
      unlockedTool: tool,
      competencyAchieved: competency
    });
  };

  const hideModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  const navigateToTool = (tool) => {
    // Navigate to the unlocked tool
    const basePath = window.location.pathname.split('/dashboard')[0];
    window.location.href = `${basePath}/dashboard/${tool}`;
  };

  return {
    modalState,
    showUnlockModal,
    hideModal,
    navigateToTool
  };
};

export default ToolUnlockModal;