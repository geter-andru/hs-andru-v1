import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import ICPDisplay from './components/tools/ICPDisplay';
import CostCalculator from './components/tools/CostCalculator';
import BusinessCaseBuilder from './components/tools/BusinessCaseBuilder';

// Landing page component for invalid routes
const InvalidAccess = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-6 text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
        <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Access Required
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Please access this application through your personalized link with a valid customer ID and access token.
      </p>
      <p className="text-xs text-gray-400">
        Expected URL format: /customer/[id]?token=[accessToken]
      </p>
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
              <Route path="dashboard" element={<Navigate to="icp" replace />} />
              <Route path="dashboard/icp" element={<ICPDisplay />} />
              <Route path="dashboard/cost-calculator" element={<CostCalculator />} />
              <Route path="dashboard/business-case" element={<BusinessCaseBuilder />} />
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