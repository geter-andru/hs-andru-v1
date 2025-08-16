import React, { useEffect, useState } from 'react';
import { Routes, Route, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { FeatureFlagProvider } from '../contexts/FeatureFlagContext';
import { UserIntelligenceProvider } from '../contexts/simplified/UserIntelligenceContext';
import PlatformSwitcher from '../components/platform-switcher/PlatformSwitcher';
import SimplifiedDashboard from '../components/simplified/SimplifiedDashboard';
import SimplifiedICP from '../components/simplified/SimplifiedICP';
import SimplifiedFinancialImpact from '../components/simplified/SimplifiedFinancialImpact';
import SimplifiedResourceLibrary from '../components/simplified/SimplifiedResourceLibrary';
import ErrorBoundary from '../components/common/ErrorBoundary';

const SimplifiedPlatform = () => {
  const { customerId } = useParams();
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!customerId) {
          throw new Error('Customer ID is required');
        }

        // Check existing session
        let session = authService.getCurrentSession();
        
        // If no session but token provided, validate credentials and create session
        if (!session && token) {
          const authResult = await authService.validateCredentials(customerId, token);
          if (!authResult.valid) {
            throw new Error(authResult.error || 'Authentication failed');
          }
          session = authService.generateSession(authResult.customerData, token);
        }
        
        if (!session) {
          throw new Error('Authentication required');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    validateAccess();
  }, [customerId, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading simplified platform...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <a 
            href="/customer/CUST_4?token=admin-demo-token-2025"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Admin Demo
          </a>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      <FeatureFlagProvider customerId={customerId}>
        <UserIntelligenceProvider customerId={customerId}>
          <div className="relative">
            {/* Platform Switcher */}
            <PlatformSwitcher customerId={customerId} />
            
            {/* Simplified Platform Routes */}
            <Routes>
              <Route path="dashboard" element={<SimplifiedDashboard customerId={customerId} />} />
              <Route path="icp" element={<SimplifiedICP customerId={customerId} />} />
              <Route path="financial" element={<SimplifiedFinancialImpact customerId={customerId} />} />
              <Route path="resources" element={<SimplifiedResourceLibrary customerId={customerId} />} />
              
              {/* Default redirect to dashboard */}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </UserIntelligenceProvider>
      </FeatureFlagProvider>
    </ErrorBoundary>
  );
};

export default SimplifiedPlatform;