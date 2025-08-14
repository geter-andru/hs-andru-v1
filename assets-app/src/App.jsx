import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Phase1Test from './components/test/Phase1Test';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="*" element={<Phase1Test />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;