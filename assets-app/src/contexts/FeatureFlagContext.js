import React, { createContext, useContext, useState, useEffect } from 'react';

// Create feature flag context
const FeatureFlagContext = createContext();

// Feature flag configurations
const DEFAULT_FLAGS = {
  simplifiedPlatform: false,
  enableSimplifiedDashboard: false,
  enableSimplifiedICP: false,
  enableSimplifiedFinancial: false,
  enableSimplifiedResources: false,
  showPlatformSwitcher: true,
  enableMilestoneDetection: true,
  enableUsageTracking: true,
  enableStealthGamification: true
};

// Custom hook for using feature flags
export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
};

// Provider component
export const FeatureFlagProvider = ({ children, customerId }) => {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  // Load feature flags from localStorage or API
  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        // Check localStorage for user-specific flags
        const storageKey = `featureFlags_${customerId}`;
        const savedFlags = localStorage.getItem(storageKey);
        
        if (savedFlags) {
          const parsedFlags = JSON.parse(savedFlags);
          setFlags(prev => ({ ...prev, ...parsedFlags }));
        }

        // For MVP, enable simplified platform for specific customers
        const simplifiedUsers = ['CUST_02', 'CUST_03']; // Test users
        
        if (simplifiedUsers.includes(customerId)) {
          setFlags(prev => ({
            ...prev,
            simplifiedPlatform: true,
            enableSimplifiedDashboard: true,
            enableSimplifiedICP: true,
            enableSimplifiedFinancial: true,
            enableSimplifiedResources: true
          }));
        }

        // Admin users (CUST_4) can access both platforms
        if (customerId === 'CUST_4') {
          setFlags(prev => ({
            ...prev,
            showPlatformSwitcher: true
          }));
        }

      } catch (error) {
        console.error('Error loading feature flags:', error);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      loadFeatureFlags();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  // Toggle a specific feature flag
  const toggleFlag = (flagName) => {
    setFlags(prev => {
      const newFlags = { ...prev, [flagName]: !prev[flagName] };
      
      // Special logic for simplified platform
      if (flagName === 'simplifiedPlatform') {
        newFlags.enableSimplifiedDashboard = newFlags.simplifiedPlatform;
        newFlags.enableSimplifiedICP = newFlags.simplifiedPlatform;
        newFlags.enableSimplifiedFinancial = newFlags.simplifiedPlatform;
        newFlags.enableSimplifiedResources = newFlags.simplifiedPlatform;
      }
      
      // Save to localStorage
      try {
        const storageKey = `featureFlags_${customerId}`;
        localStorage.setItem(storageKey, JSON.stringify(newFlags));
      } catch (error) {
        console.error('Error saving feature flags:', error);
      }
      
      return newFlags;
    });
  };

  // Set multiple flags at once
  const setMultipleFlags = (newFlags) => {
    setFlags(prev => {
      const updatedFlags = { ...prev, ...newFlags };
      
      // Save to localStorage
      try {
        const storageKey = `featureFlags_${customerId}`;
        localStorage.setItem(storageKey, JSON.stringify(updatedFlags));
      } catch (error) {
        console.error('Error saving feature flags:', error);
      }
      
      return updatedFlags;
    });
  };

  // Check if a feature is enabled
  const isEnabled = (flagName) => {
    return flags[flagName] === true;
  };

  // Get platform mode
  const getPlatformMode = () => {
    return flags.simplifiedPlatform ? 'simplified' : 'standard';
  };

  // Reset all flags to defaults
  const resetFlags = () => {
    setFlags(DEFAULT_FLAGS);
    try {
      const storageKey = `featureFlags_${customerId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error resetting feature flags:', error);
    }
  };

  const value = {
    flags,
    loading,
    toggleFlag,
    setMultipleFlags,
    isEnabled,
    getPlatformMode,
    resetFlags
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagContext;