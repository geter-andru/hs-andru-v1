/**
 * useNavigation Hook
 * 
 * Manages navigation state and history throughout the platform,
 * preventing users from getting stuck on dead-end screens.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNavigation = (customerId, initialPhase = 'welcome') => {
  const [currentPhase, setCurrentPhase] = useState(initialPhase);
  const [navigationHistory, setNavigationHistory] = useState([initialPhase]);
  const navigate = useNavigate();

  const goToPhase = useCallback((phase) => {
    setNavigationHistory(prev => [...prev, phase]);
    setCurrentPhase(phase);
    
    // Update URL with proper customer context
    if (phase === 'welcome') {
      navigate(`/customer/${customerId}/dashboard`);
    } else if (phase === 'icp-analysis') {
      navigate(`/customer/${customerId}/dashboard/icp`);
    } else if (phase === 'cost-calculator') {
      navigate(`/customer/${customerId}/dashboard/cost-calculator`);
    } else if (phase === 'business-case') {
      navigate(`/customer/${customerId}/dashboard/business-case`);
    }
  }, [navigate, customerId]);

  const goBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousPhase = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentPhase(previousPhase);
      
      // Navigate to previous phase URL
      goToPhase(previousPhase);
    }
  }, [navigationHistory, goToPhase]);

  const goHome = useCallback(() => {
    setCurrentPhase('welcome');
    setNavigationHistory(['welcome']);
    navigate(`/customer/${customerId}/dashboard`);
  }, [navigate, customerId]);

  const canGoBack = navigationHistory.length > 1;

  const getNextPhase = useCallback(() => {
    const phaseOrder = ['welcome', 'icp-analysis', 'cost-calculator', 'business-case', 'results'];
    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
      return phaseOrder[currentIndex + 1];
    }
    return null;
  }, [currentPhase]);

  const goToNextPhase = useCallback(() => {
    const nextPhase = getNextPhase();
    if (nextPhase) {
      goToPhase(nextPhase);
    }
  }, [getNextPhase, goToPhase]);

  return {
    currentPhase,
    navigationHistory,
    goToPhase,
    goBack,
    goHome,
    goToNextPhase,
    canGoBack,
    getNextPhase
  };
};

export default useNavigation;