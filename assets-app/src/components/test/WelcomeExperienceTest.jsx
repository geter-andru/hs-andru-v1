import React, { useState } from 'react';
import { motion } from 'motion/react';

const WelcomeExperienceTest = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('');

  const handleStartEngagement = (phase) => {
    console.log('Welcome Experience completed, next phase:', phase);
    setSelectedPhase(phase);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const personalizedData = {
    customerName: 'Test User',
    company: 'Test Company',
    estimatedValue: 250,
    opportunities: [
      {
        icon: '🎯',
        title: 'Your Personalized ICP Analysis',
        preview: 'Complete buyer persona & market fit analysis ready',
        insight: 'AI-generated strategic intelligence based on your data',
        engagement: 'icp_analysis',
        isPersonalized: true
      },
      {
        icon: '💰',
        title: 'Current delay cost',
        preview: '$127K over 6 months',
        insight: 'Revenue loss timeline visualization',
        engagement: 'financial_impact'
      },
      {
        icon: '📋',
        title: 'Executive business case',
        preview: 'Ready for stakeholder review',
        insight: 'Auto-populated strategic framework',
        engagement: 'business_case'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black">
      <motion.div 
        className="max-w-7xl mx-auto px-4 py-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Alert */}
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            Would navigate to: {selectedPhase}
          </motion.div>
        )}

        {/* Personalized Greeting */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Welcome back, {personalizedData.customerName}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-2">
            from {personalizedData.company}
          </p>
          <p className="text-base sm:text-lg text-blue-300 font-medium">
            Your Revenue Intelligence Infrastructure is ready to amplify your existing tools.
          </p>
        </motion.div>

        {/* Value Teaser */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-blue-700/30">
            <p className="text-lg text-gray-200 mb-4 leading-relaxed">
              Transform your analysis into <span className="text-blue-300 font-semibold">actionable assets</span> for{' '}
              <span className="text-purple-300 font-semibold">Claude/ChatGPT</span>, <span className="text-green-400 font-semibold">CRM platforms</span>, and{' '}
              <span className="text-orange-400 font-semibold">sales automation tools</span> — worth{' '}
              <span className="text-yellow-400 font-bold text-xl">${personalizedData.estimatedValue}K</span>{' '}
              in implementation value.
            </p>
            <p className="text-blue-300 font-medium text-lg">
              Export-ready intelligence for your existing tech stack...
            </p>
          </div>
        </motion.div>

        {/* Three-Column Highlights */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <button
            onClick={() => handleStartEngagement('icp-analysis')}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors text-left group"
          >
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300">
              WHO TO TARGET
            </h3>
            <p className="text-gray-300 mb-4">Your specific ideal customer profile</p>
            <p className="text-blue-400 text-sm group-hover:text-blue-300">
              See detailed scoring criteria →
            </p>
          </button>

          <button
            onClick={() => handleStartEngagement('cost-calculator')}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors text-left group"
          >
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300">
              DEAL CHARACTERISTICS
            </h3>
            <p className="text-gray-300 mb-4">Typical deal size and buying process</p>
            <p className="text-blue-400 text-sm group-hover:text-blue-300">
              View financial analysis →
            </p>
          </button>

          <button
            onClick={() => handleStartEngagement('icp-analysis')}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors text-left group"
          >
            <div className="text-3xl mb-4">🚫</div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300">
              WHO TO AVOID
            </h3>
            <p className="text-gray-300 mb-4">Save time and resources</p>
            <p className="text-blue-400 text-sm group-hover:text-blue-300">
              Understand buying vs technical interest →
            </p>
          </button>
        </motion.div>

        {/* Opportunity Cards */}
        <div className="space-y-4">
          {personalizedData.opportunities.map((opportunity, index) => (
            <motion.button
              key={index}
              onClick={() => handleStartEngagement(opportunity.engagement)}
              className={`w-full rounded-xl p-6 transition-all duration-300 hover:shadow-2xl text-left ${
                opportunity.isPersonalized 
                  ? 'bg-gradient-to-r from-blue-800/60 to-purple-800/60 border border-blue-500/70 hover:border-blue-400/80' 
                  : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 hover:border-blue-500/50'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{opportunity.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {opportunity.title}
                    </h3>
                    {opportunity.isPersonalized && (
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        ✨ PERSONALIZED
                      </span>
                    )}
                  </div>
                  <p className="text-xl font-medium text-blue-300 mb-2">
                    {opportunity.preview}
                  </p>
                  <p className="text-gray-400">
                    {opportunity.insight}
                  </p>
                </div>
                <div className="text-blue-400">
                  →
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Primary CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <button
            onClick={() => handleStartEngagement('icp-analysis')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg py-4 px-8 rounded-xl transition-all duration-300"
          >
            See Full Analysis & Rating Tools
          </button>
        </motion.div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/test'}
            className="text-gray-400 hover:text-white underline"
          >
            Back to Test Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeExperienceTest;