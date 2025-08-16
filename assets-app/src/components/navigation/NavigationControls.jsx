/**
 * NavigationControls Component
 * 
 * Universal navigation system providing consistent back/home/next controls
 * across all platform screens to prevent dead-ends and ensure smooth navigation.
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';

const NavigationControls = ({ 
  currentPhase, 
  onGoBack, 
  onGoHome, 
  onNextPhase,
  canGoBack = true,
  canGoHome = true,
  nextLabel = "Continue",
  showNext = true,
  disabled = false
}) => {
  return (
    <div className="flex justify-between items-center py-4 border-t border-gray-700 mt-8">
      {/* Left side - Back/Home controls */}
      <div className="flex space-x-3">
        {canGoBack && (
          <button
            onClick={onGoBack}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors duration-200 min-h-[44px] touch-manipulation"
            aria-label="Go back to previous screen"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        )}
        
        {canGoHome && (
          <button
            onClick={onGoHome}
            disabled={disabled}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors duration-200 min-h-[44px] touch-manipulation"
            aria-label="Return to dashboard"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        )}
      </div>

      {/* Center - Phase indicator */}
      <div className="text-sm text-gray-400 hidden sm:block">
        {getPhaseDisplay(currentPhase)}
      </div>

      {/* Right side - Next/Continue controls */}
      <div>
        {showNext && onNextPhase && (
          <button
            onClick={onNextPhase}
            disabled={disabled}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 min-h-[44px] touch-manipulation font-medium"
            aria-label={nextLabel}
          >
            <span>{nextLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const getPhaseDisplay = (phase) => {
  const phases = {
    'welcome': 'Revenue Intelligence Welcome',
    'icp-analysis': 'ICP Analysis',
    'cost-calculator': 'Cost Calculator', 
    'business-case': 'Business Case Builder',
    'integration': 'Integration Complete',
    'results': 'Results Dashboard'
  };
  return phases[phase] || 'Revenue Intelligence Infrastructure';
};

export default NavigationControls;