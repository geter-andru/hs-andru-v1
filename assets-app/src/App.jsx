import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import CustomerDashboard from './pages/CustomerDashboard';
import SimplifiedPlatform from './pages/SimplifiedPlatform';
import Phase1Test from './components/test/Phase1Test';
import TestLauncher from './components/test/TestLauncher';
import AssessmentPersonalizationTest from './components/test/AssessmentPersonalizationTest';
import AssessmentContextTest from './components/test/AssessmentContextTest';
import CompetencyDashboardTest from './components/test/CompetencyDashboardTest';
import SimplifiedPlatformTest from './components/test/SimplifiedPlatformTest';
import Phase3ExportTest from './components/test/Phase3ExportTest';
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
            {/* Simplified Platform Routes */}
            <Route path="/customer/:customerId/simplified/*" element={<SimplifiedPlatform />} />
            
            {/* Customer Dashboard Routes */}
            <Route path="/customer/:customerId/dashboard/*" element={<CustomerDashboard />} />
            <Route path="/customer/:customerId" element={<CustomerDashboard />} />
            
            {/* Test Routes */}
            <Route path="/test" element={<Phase1Test />} />
            <Route path="/test-launcher" element={<TestLauncher />} />
            <Route path="/test-assessment" element={<AssessmentPersonalizationTest />} />
            <Route path="/test-context" element={<AssessmentContextTest />} />
            <Route path="/test-competency" element={<CompetencyDashboardTest />} />
            <Route path="/test-simplified" element={<SimplifiedPlatformTest />} />
            <Route path="/test-phase3" element={<Phase3ExportTest />} />
            
            {/* Default - redirect to admin demo */}
            <Route path="*" element={<CustomerDashboard />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;