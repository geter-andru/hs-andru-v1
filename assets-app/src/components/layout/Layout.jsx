import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import LoadingSpinner from '../common/LoadingSpinner';
import { authService } from '../../services/authService';
import { airtableService } from '../../services/airtableService';

const Layout = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if already authenticated
        const existingSession = authService.getCurrentSession();
        if (existingSession) {
          setCustomerData(existingSession);
          setLoading(false);
          return;
        }

        // Extract credentials from URL
        const { customerId, accessToken } = authService.extractCredentials(location);
        console.log('Layout - Extracted credentials:', { customerId, accessToken });
        
        if (!customerId || !accessToken) {
          setError('Missing customer ID or access token in URL');
          setLoading(false);
          return;
        }

        // Validate credentials
        const validation = await authService.validateCredentials(customerId, accessToken);
        
        if (!validation.valid) {
          setError(validation.error);
          setLoading(false);
          return;
        }

        // Generate session and update last accessed
        console.log('Layout - Generating session with token:', accessToken);
        const session = authService.generateSession(validation.customerData, accessToken);
        console.log('Layout - Generated session:', session);
        await airtableService.updateLastAccessed(validation.customerData.id);
        
        setCustomerData(session);
        setLoading(false);

        // Redirect to first tool if on root dashboard
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
          navigate('/dashboard/icp', { replace: true });
        }

      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate. Please check your credentials.');
        setLoading(false);
      }
    };

    initializeAuth();
  }, [location, navigate]);

  // Refresh session periodically
  useEffect(() => {
    if (customerData) {
      const interval = setInterval(() => {
        authService.refreshSession();
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(interval);
    }
  }, [customerData]);

  if (loading) {
    return (
      <LoadingSpinner 
        fullScreen 
        message="Authenticating and loading your business assets..." 
        size="large"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Authentication Error
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Required
          </h3>
          <p className="text-sm text-gray-500">
            Please access this application through your personalized link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;