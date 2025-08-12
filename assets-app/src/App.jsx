import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import CustomerDashboard from './components/dashboard/CustomerDashboard';
import ICPDisplay from './components/tools/ICPDisplay';
import CostCalculator from './components/tools/CostCalculator';
import BusinessCaseBuilder from './components/tools/BusinessCaseBuilder';
import ResultsDashboard from './components/results/ResultsDashboard';
import CompetencyProtectedRoute from './components/routing/CompetencyProtectedRoute';

// Landing page component for invalid routes
const InvalidAccess = () => (
  <div className="min-h-screen flex items-center justify-center bg-primary">
    <div className="max-w-md w-full card card-padding text-center animate-fade-in">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-warning/10 mb-6 shadow-elegant">
        <svg className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-primary mb-3">
        Access Required
      </h3>
      <p className="text-base text-secondary mb-6 leading-relaxed">
        Please access this application through your personalized link with a valid customer ID and access token.
      </p>
      <div className="bg-surface/30 rounded-lg p-4 border border-glass-border">
        <p className="text-sm text-muted font-mono">
          Expected URL format: /customer/[id]?token=[accessToken]
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            {/* Redirect root to customer route structure */}
            <Route path="/" element={<Navigate to="/customer" replace />} />
            
            {/* Customer dashboard routes */}
            <Route path="/customer/:customerId" element={<Layout />}>
              <Route index element={<Navigate to="dashboard/icp" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />}>
                <Route index element={<Navigate to="icp" replace />} />
                {/* ICP Analysis - Always available (Foundation Level) */}
                <Route path="icp" element={<ICPDisplay />} />
                
                {/* Cost Calculator - Requires demonstrated ICP competency */}
                <Route path="cost-calculator" element={
                  <CompetencyProtectedRoute requiredTool="cost-calculator">
                    <CostCalculator />
                  </CompetencyProtectedRoute>
                } />
                
                {/* Business Case Builder - Requires demonstrated cost analysis competency */}
                <Route path="business-case" element={
                  <CompetencyProtectedRoute requiredTool="business-case">
                    <BusinessCaseBuilder />
                  </CompetencyProtectedRoute>
                } />
                
                <Route path="results" element={<ResultsDashboard />} />
              </Route>
            </Route>
            
            {/* Fallback for any other routes */}
            <Route path="*" element={<InvalidAccess />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;