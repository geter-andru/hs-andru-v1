import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import SimpleEnhancedDashboard from './components/dashboard/SimpleEnhancedDashboard';
import ICPDisplay from './components/tools/ICPDisplay';
import CostCalculator from './components/tools/CostCalculator';
import BusinessCaseBuilder from './components/tools/BusinessCaseBuilder';

// Landing page component for invalid routes
const InvalidAccess = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-900/20 mb-6">
        <svg className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-white mb-3">
        Access Required
      </h3>
      <p className="text-base text-gray-400 mb-6 leading-relaxed">
        Please access this application through your personalized link with a valid customer ID and access token.
      </p>
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <p className="text-sm text-gray-500 font-mono">
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
              <Route index element={<Navigate to="dashboard/icp-analysis" replace />} />
              <Route path="dashboard" element={<SimpleEnhancedDashboard />}>
                <Route index element={<Navigate to="icp-analysis" replace />} />
                {/* ICP Analysis - Always available (Foundation Level) */}
                <Route path="icp-analysis" element={<ICPDisplay />} />
                {/* Cost Calculator - Requires Value Communication 70+ */}
                <Route path="cost-calculator" element={<CostCalculator />} />
                {/* Business Case - Requires Sales Execution 70+ */}
                <Route path="business-case" element={<BusinessCaseBuilder />} />
              </Route>
            </Route>
            
            {/* Customer path without ID - show access required */}
            <Route path="/customer" element={<InvalidAccess />} />
            
            {/* Catch-all for invalid routes */}
            <Route path="*" element={<InvalidAccess />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;