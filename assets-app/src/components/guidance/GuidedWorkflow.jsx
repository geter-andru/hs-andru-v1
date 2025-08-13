/**
 * Guided Workflow Overlays
 * 
 * Interactive overlays that guide users through complex workflows step-by-step
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronLeft, ChevronRight, Play, CheckCircle, 
  Target, Lightbulb, ArrowRight, HelpCircle, 
  Mouse, Keyboard, Eye, Hand
} from 'lucide-react';

// Main Guided Workflow Overlay
export const GuidedWorkflow = ({ 
  workflow, 
  isActive, 
  onComplete, 
  onSkip, 
  onClose,
  className = '' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    if (isActive && workflow?.steps) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isActive, workflow]);

  if (!isActive || !workflow?.steps) return null;

  const currentStepData = workflow.steps[currentStep];
  const isLastStep = currentStep === workflow.steps.length - 1;
  const progress = ((currentStep + 1) / workflow.steps.length) * 100;

  const handleNext = () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);

    if (isLastStep) {
      onComplete?.();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 ${className}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Workflow Container */}
      <div className="relative h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">{workflow.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{workflow.description}</p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Step {currentStep + 1} of {workflow.steps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex space-x-2">
              {workflow.steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                    completedSteps.has(index) 
                      ? 'bg-green-600 text-white' 
                      : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                          ? 'bg-gray-600 text-gray-300 cursor-pointer hover:bg-gray-500'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={index > currentStep && !completedSteps.has(index)}
                >
                  {completedSteps.has(index) ? (
                    <CheckCircle className="w-4 h-4 mx-auto" />
                  ) : (
                    index + 1
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StepContent step={currentStepData} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-800 border-t border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-gray-300 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={onSkip}
                  className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Skip Guide
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                <span>{isLastStep ? 'Complete' : 'Next'}</span>
                {isLastStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Highlight Overlay */}
      {currentStepData?.highlight && (
        <StepHighlight highlight={currentStepData.highlight} />
      )}
    </motion.div>
  );
};

// Individual Step Content
const StepContent = ({ step }) => {
  const getStepIcon = (type) => {
    const icons = {
      action: Target,
      tip: Lightbulb,
      info: HelpCircle,
      warning: Target
    };
    return icons[type] || Target;
  };

  const StepIcon = getStepIcon(step.type);

  return (
    <div className="space-y-4">
      {/* Step Header */}
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${
          step.type === 'tip' ? 'bg-yellow-900/20 text-yellow-400' :
          step.type === 'warning' ? 'bg-red-900/20 text-red-400' :
          'bg-blue-900/20 text-blue-400'
        }`}>
          <StepIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
          <p className="text-gray-300">{step.description}</p>
        </div>
      </div>

      {/* Step Instructions */}
      {step.instructions && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">Instructions:</h4>
          <div className="space-y-2">
            {step.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-400 font-medium text-sm mt-0.5">{index + 1}.</span>
                <p className="text-gray-300 text-sm">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Elements */}
      {step.interactions && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Try This:</h4>
          {step.interactions.map((interaction, index) => (
            <InteractionGuide key={index} interaction={interaction} />
          ))}
        </div>
      )}

      {/* Expected Result */}
      {step.expectedResult && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
          <h4 className="text-green-400 font-medium mb-2">What to Expect:</h4>
          <p className="text-gray-300 text-sm">{step.expectedResult}</p>
        </div>
      )}

      {/* Tips */}
      {step.tips && step.tips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-yellow-400 font-medium text-sm">💡 Pro Tips:</h4>
          {step.tips.map((tip, index) => (
            <p key={index} className="text-gray-400 text-sm pl-4 border-l-2 border-yellow-500/30">
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

// Interaction Guide Component
const InteractionGuide = ({ interaction }) => {
  const getInteractionIcon = (type) => {
    const icons = {
      click: Mouse,
      type: Keyboard,
      look: Eye,
      drag: Hand
    };
    return icons[type] || Mouse;
  };

  const InteractionIcon = getInteractionIcon(interaction.type);

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
      <InteractionIcon className="w-5 h-5 text-blue-400" />
      <div className="flex-1">
        <p className="text-white text-sm">{interaction.description}</p>
        {interaction.target && (
          <p className="text-gray-400 text-xs mt-1">Target: {interaction.target}</p>
        )}
      </div>
    </div>
  );
};

// Step Highlight Overlay
const StepHighlight = ({ highlight }) => {
  const element = document.querySelector(highlight.selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute pointer-events-none"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        border: '2px solid #3B82F6',
        borderRadius: '6px',
        boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
      }}
    >
      {highlight.tooltip && (
        <div className="absolute -top-12 left-0 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white whitespace-nowrap">
          {highlight.tooltip}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </motion.div>
  );
};

// Quick Tour Component
export const QuickTour = ({ tourSteps, onComplete, className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const startTour = () => {
    setIsActive(true);
    setCurrentTip(0);
  };

  const nextTip = () => {
    if (currentTip < tourSteps.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      setIsActive(false);
      onComplete?.();
    }
  };

  const skipTour = () => {
    setIsActive(false);
    onComplete?.();
  };

  if (!tourSteps || tourSteps.length === 0) return null;

  return (
    <>
      {/* Tour Trigger Button */}
      {!isActive && (
        <button
          onClick={startTour}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors ${className}`}
        >
          <Play className="w-4 h-4" />
          <span>Take Quick Tour</span>
        </button>
      )}

      {/* Tour Overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/40" />
            
            <TourTooltip
              step={tourSteps[currentTip]}
              stepNumber={currentTip + 1}
              totalSteps={tourSteps.length}
              onNext={nextTip}
              onSkip={skipTour}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Tour Tooltip Component
const TourTooltip = ({ step, stepNumber, totalSteps, onNext, onSkip }) => {
  const element = document.querySelector(step.selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  const isLastStep = stepNumber === totalSteps;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute pointer-events-auto"
      style={{
        top: rect.bottom + 10,
        left: Math.max(10, rect.left - 100),
        maxWidth: '300px'
      }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-blue-400 font-medium">
            Step {stepNumber} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <h4 className="text-white font-medium mb-2">{step.title}</h4>
        <p className="text-gray-300 text-sm mb-4">{step.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-300 text-sm"
          >
            Skip Tour
          </button>
          
          <button
            onClick={onNext}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
          >
            <span>{isLastStep ? 'Finish' : 'Next'}</span>
            {isLastStep ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Arrow */}
        <div className="absolute -top-2 left-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
      </div>

      {/* Highlight the target element */}
      <div
        className="absolute border-2 border-blue-500 rounded pointer-events-none"
        style={{
          top: rect.top - rect.bottom - 14,
          left: rect.left - Math.max(10, rect.left - 100),
          width: rect.width,
          height: rect.height,
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
        }}
      />
    </motion.div>
  );
};

export default GuidedWorkflow;