import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  User, 
  Target, 
  BarChart3, 
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const SimplifiedPlatformTest = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState({});

  const testUsers = [
    {
      id: 'CUST_02',
      name: 'Test User (Simplified)',
      token: 'test-token-123456',
      description: 'Regular user with access to simplified platform',
      platform: 'simplified'
    },
    {
      id: 'CUST_4',
      name: 'Admin User (Both Platforms)',
      token: 'admin-demo-token-2025',
      description: 'Admin user with access to both platforms and platform switcher',
      platform: 'both'
    }
  ];

  const testURLs = [
    {
      name: 'Simplified Dashboard',
      path: '/simplified/dashboard',
      description: 'Main dashboard with milestone-based competency tracking'
    },
    {
      name: 'Simplified ICP Analysis',
      path: '/simplified/icp',
      description: 'ICP analysis tool with usage tracking'
    },
    {
      name: 'Simplified Financial Impact',
      path: '/simplified/financial',
      description: 'Financial impact calculator and business case builder'
    },
    {
      name: 'Simplified Resource Library',
      path: '/simplified/resources',
      description: 'Tier-based resource library with smart recommendations'
    }
  ];

  const handleTestURL = (user, testURL) => {
    const fullURL = `/customer/${user.id}${testURL.path}?token=${user.token}`;
    
    // Record test attempt
    setTestResults(prev => ({
      ...prev,
      [`${user.id}-${testURL.name}`]: {
        status: 'testing',
        timestamp: new Date().toLocaleTimeString()
      }
    }));

    // Open in new tab for testing
    window.open(fullURL, '_blank');
    
    // Mark as tested after a delay
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [`${user.id}-${testURL.name}`]: {
          status: 'tested',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }, 1000);
  };

  const getTestStatus = (userId, testName) => {
    const result = testResults[`${userId}-${testName}`];
    if (!result) return null;
    
    if (result.status === 'testing') {
      return <div className="flex items-center gap-1 text-yellow-400"><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400"></div> Testing</div>;
    }
    
    return <div className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" /> Tested</div>;
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Simplified Platform Test Suite</h1>
          <p className="text-gray-400">Test the simplified platform components and feature flags</p>
        </div>

        {/* Platform Features Overview */}
        <div className="mb-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">✨ Simplified Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Milestone Detection</div>
                  <div className="text-gray-400 text-sm">Foundation → Growth → Expansion tiers</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Stealth Gamification</div>
                  <div className="text-gray-400 text-sm">Professional language with achievement tracking</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Usage Analytics</div>
                  <div className="text-gray-400 text-sm">Behavioral assessment and progress tracking</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-medium">Single Data Fetch</div>
                  <div className="text-gray-400 text-sm">Performance optimized context system</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Matrix */}
        <div className="space-y-6">
          {testUsers.map((user) => (
            <div key={user.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">ID: {user.id}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.platform === 'both' ? 'bg-purple-900/30 text-purple-400' :
                      user.platform === 'simplified' ? 'bg-green-900/30 text-green-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {user.platform === 'both' ? 'Admin Access' : 'Simplified Only'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`/customer/${user.id}/dashboard?token=${user.token}`, '_blank')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Standard Platform
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testURLs.map((testURL) => (
                  <div key={testURL.name} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-medium">{testURL.name}</h4>
                        <p className="text-gray-400 text-sm">{testURL.description}</p>
                      </div>
                      {getTestStatus(user.id, testURL.name)}
                    </div>
                    <button
                      onClick={() => handleTestURL(user, testURL)}
                      className="w-full mt-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Test Component
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Flag Testing */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🎛️ Feature Flag Testing</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Platform switcher appears in top-right corner for admin users</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Simplified platform enabled for CUST_02 by default</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Feature flags stored in localStorage per customer</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Toggle between platforms using the platform switcher</span>
            </div>
          </div>
        </div>

        {/* Manual Testing Guide */}
        <div className="mt-8 bg-blue-900/20 border border-blue-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Manual Testing Guide</h2>
          <ol className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">1.</span>
              <span>Test CUST_02 simplified platform URLs to verify all components load</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">2.</span>
              <span>Test CUST_4 admin access to verify platform switcher appears</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">3.</span>
              <span>Use platform switcher to toggle between simplified and standard platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">4.</span>
              <span>Verify milestone detection works by checking dashboard tier displays</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">5.</span>
              <span>Test usage tracking by interacting with ICP and Financial tools</span>
            </li>
          </ol>
        </div>

        {/* Back Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/test-launcher')}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ← Back to Test Launcher
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedPlatformTest;