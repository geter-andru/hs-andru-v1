import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardTest = () => {
  const navigate = useNavigate();

  const testScenarios = [
    {
      id: 'admin',
      title: 'Admin Dashboard',
      customerId: 'CUST_4',
      token: 'admin-demo-token-2025',
      description: 'Full admin access with all tools unlocked',
      color: 'blue'
    },
    {
      id: 'regular',
      title: 'Regular User Dashboard',
      customerId: 'CUST_02',
      token: 'test-token-123456',
      description: 'Standard user with progressive tool unlocking',
      color: 'green'
    }
  ];

  const handleNavigate = (scenario) => {
    // Navigate to the customer dashboard with authentication
    const url = `/customer/${scenario.customerId}?token=${scenario.token}`;
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Dashboard Test Environment
          </h1>
          <p className="text-gray-400">
            Select a test scenario to launch the full dashboard with authentication
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition-colors"
            >
              <h3 className={`text-xl font-semibold text-${scenario.color}-400 mb-2`}>
                {scenario.title}
              </h3>
              <p className="text-gray-300 mb-4">{scenario.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div>Customer ID: <span className="text-gray-400">{scenario.customerId}</span></div>
                <div>Token: <span className="text-gray-400 font-mono text-xs">{scenario.token.substring(0, 20)}...</span></div>
              </div>

              <button
                onClick={() => handleNavigate(scenario)}
                className={`w-full bg-${scenario.color}-600 hover:bg-${scenario.color}-700 text-white py-2 px-4 rounded transition-colors`}
              >
                Launch Dashboard
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Dashboard Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Welcome Experience with personalized greeting
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              ICP Analysis with comprehensive scoring
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Cost Calculator (unlocked at 70+ Value Communication)
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Business Case Builder (unlocked at 70+ Sales Execution)
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Professional competency tracking with Airtable
            </li>
            <li className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              Real-world action tracking and achievements
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/test'}
            className="text-gray-400 hover:text-white underline"
          >
            Back to Test Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;