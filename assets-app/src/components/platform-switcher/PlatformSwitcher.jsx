import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, 
  ToggleLeft, 
  ToggleRight,
  Zap,
  User,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagContext';

const PlatformSwitcher = ({ customerId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flags, isEnabled, toggleFlag, resetFlags } = useFeatureFlags();
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if user can see platform switcher
  if (!isEnabled('showPlatformSwitcher')) {
    return null;
  }

  const handlePlatformSwitch = () => {
    toggleFlag('simplifiedPlatform');
    
    // Navigate to appropriate dashboard
    const currentPath = location.pathname;
    if (currentPath.includes('/simplified/')) {
      // Switch to standard platform
      navigate(`/customer/${customerId}/dashboard`);
    } else {
      // Switch to simplified platform
      navigate(`/customer/${customerId}/simplified/dashboard`);
    }
  };

  const currentPlatform = isEnabled('simplifiedPlatform') ? 'simplified' : 'standard';

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
        {/* Main Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition-colors w-full"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <div className="text-left">
            <div className="text-sm font-medium">Platform Mode</div>
            <div className="text-xs text-gray-400 capitalize">{currentPlatform}</div>
          </div>
          {isExpanded ? 
            <ChevronUp className="w-4 h-4 text-gray-400" /> : 
            <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="border-t border-gray-700">
            {/* Platform Switch */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">Standard Platform</span>
                </div>
                <button
                  onClick={handlePlatformSwitch}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {currentPlatform === 'standard' ? 
                    <ToggleRight className="w-5 h-5 text-blue-500" /> : 
                    <ToggleLeft className="w-5 h-5" />
                  }
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white">Simplified Platform</span>
                </div>
                <button
                  onClick={handlePlatformSwitch}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {currentPlatform === 'simplified' ? 
                    <ToggleRight className="w-5 h-5 text-green-500" /> : 
                    <ToggleLeft className="w-5 h-5" />
                  }
                </button>
              </div>

              {/* Platform Description */}
              <div className="pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-400 mb-2">
                  {currentPlatform === 'simplified' ? (
                    <>
                      <div className="font-medium text-green-400 mb-1">Simplified Infrastructure</div>
                      <div>Streamlined export-ready tools designed for immediate deployment to your existing AI, CRM, and sales automation platforms.</div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium text-blue-400 mb-1">Full Infrastructure</div>
                      <div>Complete Revenue Intelligence Infrastructure with comprehensive export capabilities, advanced analytics, and multi-platform integration.</div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-gray-800">
                <button
                  onClick={() => {
                    resetFlags();
                    setIsExpanded(false);
                    navigate(`/customer/${customerId}/dashboard`);
                  }}
                  className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to Defaults
                </button>
              </div>
            </div>

            {/* Admin Panel - Only for CUST_4 */}
            {customerId === 'CUST_4' && (
              <div className="border-t border-gray-700 p-4">
                <div className="text-xs font-medium text-purple-400 mb-2">Admin Controls</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Milestone Detection</span>
                    <button
                      onClick={() => toggleFlag('enableMilestoneDetection')}
                      className="text-gray-400 hover:text-white"
                    >
                      {isEnabled('enableMilestoneDetection') ? 
                        <ToggleRight className="w-4 h-4 text-purple-500" /> : 
                        <ToggleLeft className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Usage Tracking</span>
                    <button
                      onClick={() => toggleFlag('enableUsageTracking')}
                      className="text-gray-400 hover:text-white"
                    >
                      {isEnabled('enableUsageTracking') ? 
                        <ToggleRight className="w-4 h-4 text-purple-500" /> : 
                        <ToggleLeft className="w-4 h-4" />
                      }
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stealth Gamification</span>
                    <button
                      onClick={() => toggleFlag('enableStealthGamification')}
                      className="text-gray-400 hover:text-white"
                    >
                      {isEnabled('enableStealthGamification') ? 
                        <ToggleRight className="w-4 h-4 text-purple-500" /> : 
                        <ToggleLeft className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformSwitcher;