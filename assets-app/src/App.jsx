import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import CustomerDashboard from './pages/CustomerDashboard';
import Phase1Test from './components/test/Phase1Test';
import testEnvironmentVariables from './utils/testEnv';

function App() {
  useEffect(() => {
    // Test environment variables on app load
    const envValid = testEnvironmentVariables();
    if (!envValid) {
      console.warn('⚠️ Some environment variables are missing. Check your .env file and restart the development server.');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            {/* Customer Dashboard Routes */}
            <Route path="/customer/:customerId/dashboard/*" element={<CustomerDashboard />} />
            <Route path="/customer/:customerId" element={<CustomerDashboard />} />
            
            {/* Test Routes */}
            <Route path="/test" element={<Phase1Test />} />
            
            {/* Default - redirect to admin demo */}
            <Route path="*" element={<CustomerDashboard />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;