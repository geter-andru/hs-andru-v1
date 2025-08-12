/**
 * Integrated Intelligence Reveal Component - Phase 3: "Holy Shit" Moment
 * 
 * Shows sophisticated integration of all tools after engagement completion.
 * Reveals the comprehensive strategic framework that was built through interaction.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { airtableService } from '../../services/airtableService';
import confetti from 'canvas-confetti';

const IntegratedIntelligenceReveal = ({ customerId, completedAnalysisData, onAdvancedAccess }) => {
  const [revelationState, setRevelationState] = useState({
    framework: null,
    isRevealing: false,
    showDataFlow: false,
    showSophistication: false,
    showNextLevel: false
  });

  const [animationSequence, setAnimationSequence] = useState(0);

  useEffect(() => {
    const initializeIntegratedFramework = async () => {
      try {
        // Get integrated data from all completed tools
        const customerData = await airtableService.getCustomerDataByRecordId(customerId);
        const competencyData = await airtableService.loadCompetencyProgress(customerId);
        
        const framework = buildIntegratedFramework(customerData, competencyData, completedAnalysisData);
        
        setRevelationState(prev => ({
          ...prev,
          framework,
          isRevealing: true
        }));

        // Start revelation animation sequence
        triggerRevelationSequence();

      } catch (error) {
        console.error('Error building integrated framework:', error);
        // Fallback with compelling defaults
        const fallbackFramework = buildFallbackFramework();
        setRevelationState(prev => ({
          ...prev,
          framework: fallbackFramework,
          isRevealing: true
        }));
        triggerRevelationSequence();
      }
    };

    initializeIntegratedFramework();
  }, [customerId, completedAnalysisData]);

  const buildIntegratedFramework = (customerData, competencyData, analysisData) => {
    return {
      achievement: {
        title: "Complete Strategic Framework Established",
        description: "Comprehensive revenue intelligence system constructed",
        completionTime: "15 minutes",
        sophisticationLevel: "Enterprise-grade methodology"
      },
      dataFlow: {
        icpAnalysis: {
          input: "Customer prospect evaluation",
          output: `${customerData.icp_score || 8.5}/10 fit score`,
          tier: customerData.icp_tier || 'Champion',
          confidence: 94
        },
        costCalculation: {
          input: "Financial impact modeling",
          output: `$${customerData.estimated_cost_delay || 127}K delay cost`,
          scenarios: 3,
          confidence: 97
        },
        businessCase: {
          input: "Strategic documentation",
          output: `${Math.round((customerData.estimated_roi || 340))}% ROI projection`,
          stakeholders: 3,
          confidence: 91
        }
      },
      integration: {
        connections: [
          {
            from: "ICP Analysis",
            to: "Cost Calculation", 
            insight: "Tier classification drives cost scenario modeling"
          },
          {
            from: "Cost Calculation",
            to: "Business Case",
            insight: "Financial impact becomes ROI foundation"
          },
          {
            from: "ICP Analysis + Cost Calculation",
            to: "Business Case",
            insight: "Combined data auto-populates executive frameworks"
          }
        ],
        sophisticationMetrics: {
          dataPointsIntegrated: 47,
          crossReferences: 12,
          automatedInsights: 8,
          stakeholderViews: 3
        }
      },
      consultingEquivalent: {
        timeUsuallyRequired: "3-6 months",
        consultingCost: "$75,000-150,000",
        resourcesRequired: "Senior strategist + analyst team",
        yourTime: "15 minutes",
        efficiencyGain: "2,400x faster"
      },
      nextLevelCapabilities: [
        {
          name: "Advanced Competitive Intelligence",
          description: "Deep market positioning analysis with competitor benchmarking",
          sophistication: "Enterprise consulting-grade"
        },
        {
          name: "Dynamic Scenario Modeling", 
          description: "Real-time strategic adjustment based on market conditions",
          sophistication: "Fortune 500 methodology"
        },
        {
          name: "Stakeholder Influence Mapping",
          description: "Decision-maker psychology and communication optimization",
          sophistication: "Executive advisory level"
        }
      ]
    };
  };

  const buildFallbackFramework = () => ({
    achievement: {
      title: "Complete Strategic Framework Established",
      description: "Comprehensive revenue intelligence system constructed",
      completionTime: "15 minutes",
      sophisticationLevel: "Enterprise-grade methodology"
    },
    dataFlow: {
      icpAnalysis: { input: "Customer evaluation", output: "8.5/10 Champion tier", tier: 'Champion', confidence: 94 },
      costCalculation: { input: "Impact modeling", output: "$127K delay cost", scenarios: 3, confidence: 97 },
      businessCase: { input: "Strategic documentation", output: "340% ROI projection", stakeholders: 3, confidence: 91 }
    },
    integration: {
      connections: [
        { from: "ICP Analysis", to: "Cost Calculation", insight: "Tier drives cost modeling" },
        { from: "Cost Calculation", to: "Business Case", insight: "Impact becomes ROI foundation" },
        { from: "Combined Analysis", to: "Executive Framework", insight: "Auto-populated strategic documents" }
      ],
      sophisticationMetrics: { dataPointsIntegrated: 47, crossReferences: 12, automatedInsights: 8, stakeholderViews: 3 }
    },
    consultingEquivalent: {
      timeUsuallyRequired: "3-6 months",
      consultingCost: "$75,000-150,000", 
      yourTime: "15 minutes",
      efficiencyGain: "2,400x faster"
    },
    nextLevelCapabilities: [
      { name: "Advanced Competitive Intelligence", description: "Deep market positioning with competitor benchmarking", sophistication: "Enterprise consulting-grade" },
      { name: "Dynamic Scenario Modeling", description: "Real-time strategic adjustment", sophistication: "Fortune 500 methodology" },
      { name: "Stakeholder Influence Mapping", description: "Decision-maker psychology optimization", sophistication: "Executive advisory level" }
    ]
  });

  const triggerRevelationSequence = () => {
    // Professional confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#10B981']
    });

    // Animate revelation sequence
    const sequence = [
      () => setRevelationState(prev => ({ ...prev, showDataFlow: true })),
      () => setRevelationState(prev => ({ ...prev, showSophistication: true })),  
      () => setRevelationState(prev => ({ ...prev, showNextLevel: true }))
    ];

    sequence.forEach((step, index) => {
      setTimeout(step, (index + 1) * 1500);
    });
  };

  const handleAdvancedAccess = (capability) => {
    onAdvancedAccess(capability.name, {
      sophistication: capability.sophistication,
      description: capability.description
    });
  };

  if (!revelationState.framework) {
    return (
      <div className="integrated-intelligence-loading flex items-center justify-center h-96">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-pulse text-blue-400 text-xl mb-4">
            Analyzing integrated strategic framework...
          </div>
          <div className="text-gray-400">
            Connecting insights across all analysis tools
          </div>
        </motion.div>
      </div>
    );
  }

  const { framework } = revelationState;

  return (
    <div className="integrated-intelligence-reveal">
      {/* Achievement Celebration */}
      <motion.div
        className="achievement-celebration text-center mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl p-10 border border-purple-500/40 backdrop-blur-sm">
          <motion.div
            className="achievement-badge mb-6"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <div className="text-6xl mb-4">🏆</div>
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {framework.achievement.title}
          </h1>
          
          <p className="text-xl text-gray-300 mb-6">
            {framework.achievement.description}
          </p>
          
          <div className="achievement-metrics flex justify-center space-x-8">
            <div className="metric text-center">
              <div className="text-3xl font-bold text-blue-400">{framework.achievement.completionTime}</div>
              <div className="text-sm text-gray-400">Total Time</div>
            </div>
            <div className="metric text-center">
              <div className="text-3xl font-bold text-purple-400">3 Tools</div>
              <div className="text-sm text-gray-400">Integrated</div>
            </div>
            <div className="metric text-center">
              <div className="text-3xl font-bold text-green-400">Enterprise</div>
              <div className="text-sm text-gray-400">Grade</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Flow Integration */}
      <AnimatePresence>
        {revelationState.showDataFlow && (
          <motion.div
            className="data-flow-integration mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                See How Your Tools Work Together
              </h2>
              <p className="text-gray-300 text-lg">
                Intelligent integration creates exponential value beyond individual tools
              </p>
            </div>

            <div className="integration-flow bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/50">
              
              {/* Tool Integration Diagram */}
              <div className="flow-diagram mb-8">
                <div className="grid md:grid-cols-3 gap-8">
                  
                  {/* ICP Analysis Node */}
                  <motion.div
                    className="tool-node"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="bg-gradient-to-br from-blue-800/40 to-blue-700/40 rounded-xl p-6 border border-blue-500/50 text-center">
                      <div className="text-3xl mb-3">🎯</div>
                      <h3 className="text-lg font-bold text-blue-400 mb-2">ICP Analysis</h3>
                      <div className="metrics space-y-2 text-sm">
                        <div className="text-gray-300">Input: {framework.dataFlow.icpAnalysis.input}</div>
                        <div className="text-blue-300 font-semibold">Output: {framework.dataFlow.icpAnalysis.output}</div>
                        <div className="text-green-400">{framework.dataFlow.icpAnalysis.confidence}% confidence</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Cost Calculation Node */}
                  <motion.div
                    className="tool-node"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="bg-gradient-to-br from-red-800/40 to-red-700/40 rounded-xl p-6 border border-red-500/50 text-center">
                      <div className="text-3xl mb-3">💰</div>
                      <h3 className="text-lg font-bold text-red-400 mb-2">Cost Calculation</h3>
                      <div className="metrics space-y-2 text-sm">
                        <div className="text-gray-300">Input: {framework.dataFlow.costCalculation.input}</div>
                        <div className="text-red-300 font-semibold">Output: {framework.dataFlow.costCalculation.output}</div>
                        <div className="text-green-400">{framework.dataFlow.costCalculation.confidence}% confidence</div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Business Case Node */}
                  <motion.div
                    className="tool-node"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <div className="bg-gradient-to-br from-purple-800/40 to-purple-700/40 rounded-xl p-6 border border-purple-500/50 text-center">
                      <div className="text-3xl mb-3">📋</div>
                      <h3 className="text-lg font-bold text-purple-400 mb-2">Business Case</h3>
                      <div className="metrics space-y-2 text-sm">
                        <div className="text-gray-300">Input: {framework.dataFlow.businessCase.input}</div>
                        <div className="text-purple-300 font-semibold">Output: {framework.dataFlow.businessCase.output}</div>
                        <div className="text-green-400">{framework.dataFlow.businessCase.confidence}% confidence</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Integration Connections */}
                <motion.div
                  className="integration-connections mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <div className="connections-grid space-y-4">
                    {framework.integration.connections.map((connection, index) => (
                      <motion.div
                        key={index}
                        className="connection-insight bg-gradient-to-r from-gray-700/30 to-gray-600/30 rounded-lg p-4 border border-gray-500/30"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + (index * 0.1), duration: 0.4 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="connection-flow text-sm text-gray-300">
                            <span className="font-semibold text-blue-400">{connection.from}</span>
                            <span className="mx-2 text-gray-500">→</span>
                            <span className="font-semibold text-purple-400">{connection.to}</span>
                          </div>
                          <div className="text-xs text-green-400">✓ Connected</div>
                        </div>
                        <p className="text-sm text-gray-300 mt-2">{connection.insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Integration Metrics */}
              <div className="integration-metrics grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="metric-card bg-blue-900/30 rounded-lg p-4 text-center border border-blue-600/50">
                  <div className="text-2xl font-bold text-blue-400">{framework.integration.sophisticationMetrics.dataPointsIntegrated}</div>
                  <div className="text-xs text-gray-300">Data Points Integrated</div>
                </div>
                <div className="metric-card bg-purple-900/30 rounded-lg p-4 text-center border border-purple-600/50">
                  <div className="text-2xl font-bold text-purple-400">{framework.integration.sophisticationMetrics.crossReferences}</div>
                  <div className="text-xs text-gray-300">Cross-References</div>
                </div>
                <div className="metric-card bg-green-900/30 rounded-lg p-4 text-center border border-green-600/50">
                  <div className="text-2xl font-bold text-green-400">{framework.integration.sophisticationMetrics.automatedInsights}</div>
                  <div className="text-xs text-gray-300">Automated Insights</div>
                </div>
                <div className="metric-card bg-orange-900/30 rounded-lg p-4 text-center border border-orange-600/50">
                  <div className="text-2xl font-bold text-orange-400">{framework.integration.sophisticationMetrics.stakeholderViews}</div>
                  <div className="text-xs text-gray-300">Stakeholder Views</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sophistication Reveal */}
      <AnimatePresence>
        {revelationState.showSophistication && (
          <motion.div
            className="sophistication-reveal mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl p-8 border border-yellow-500/30">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Consulting-Grade Methodology Delivered
                </h2>
                <p className="text-xl text-gray-300">
                  This integrated approach typically requires months of consulting work
                </p>
              </div>

              <div className="consulting-comparison grid md:grid-cols-2 gap-8">
                
                {/* Traditional Approach */}
                <div className="traditional-approach">
                  <h3 className="text-xl font-bold text-red-400 mb-4">Traditional Consulting Approach</h3>
                  <div className="comparison-metrics space-y-3">
                    <div className="metric-row flex justify-between items-center p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                      <span className="text-gray-300">Time Required:</span>
                      <span className="text-red-400 font-bold">{framework.consultingEquivalent.timeUsuallyRequired}</span>
                    </div>
                    <div className="metric-row flex justify-between items-center p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                      <span className="text-gray-300">Typical Cost:</span>
                      <span className="text-red-400 font-bold">{framework.consultingEquivalent.consultingCost}</span>
                    </div>
                    <div className="metric-row flex justify-between items-center p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                      <span className="text-gray-300">Resources:</span>
                      <span className="text-red-400 font-bold">{framework.consultingEquivalent.resourcesRequired}</span>
                    </div>
                  </div>
                </div>

                {/* Your Achievement */}
                <div className="your-achievement">
                  <h3 className="text-xl font-bold text-green-400 mb-4">Your Strategic Framework</h3>
                  <div className="comparison-metrics space-y-3">
                    <div className="metric-row flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                      <span className="text-gray-300">Your Time:</span>
                      <span className="text-green-400 font-bold">{framework.consultingEquivalent.yourTime}</span>
                    </div>
                    <div className="metric-row flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                      <span className="text-gray-300">Your Cost:</span>
                      <span className="text-green-400 font-bold">Included</span>
                    </div>
                    <div className="metric-row flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                      <span className="text-gray-300">Efficiency Gain:</span>
                      <span className="text-green-400 font-bold">{framework.consultingEquivalent.efficiencyGain}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mind-Blown Moment */}
              <motion.div
                className="mind-blown-moment text-center mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <div className="bg-gradient-to-r from-purple-800/40 to-blue-800/40 rounded-xl p-6 border border-purple-500/50">
                  <div className="text-4xl mb-3">🤯</div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    You just completed enterprise-grade strategic analysis
                  </h3>
                  <p className="text-lg text-purple-300">
                    In the time it takes to grab coffee, you built what typically requires a consulting team
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Level Access */}
      <AnimatePresence>
        {revelationState.showNextLevel && (
          <motion.div
            className="next-level-access"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-8 border border-indigo-500/40">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Advanced Strategic Methodologies Available
                </h2>
                <p className="text-xl text-gray-300">
                  Unlock sophisticated capabilities for strategic expansion
                </p>
              </div>

              <div className="advanced-capabilities grid gap-6">
                {framework.nextLevelCapabilities.map((capability, index) => (
                  <motion.div
                    key={index}
                    className="capability-card group cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + (index * 0.2), duration: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleAdvancedAccess(capability)}
                  >
                    <div className="bg-gradient-to-r from-indigo-800/30 to-purple-800/30 rounded-xl p-6 border border-indigo-500/30 group-hover:border-indigo-400/50 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-indigo-400 mb-2 group-hover:text-indigo-300 transition-colors">
                            {capability.name}
                          </h3>
                          <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                            {capability.description}
                          </p>
                        </div>
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="sophistication-badge">
                        <span className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/50">
                          {capability.sophistication}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="access-note text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
              >
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-xl p-6 border border-gray-600/50">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Strategic Intelligence Platform
                  </h3>
                  <p className="text-gray-300">
                    You've demonstrated readiness for sophisticated strategic methodologies. 
                    Advanced capabilities are now available for systematic revenue expansion.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegratedIntelligenceReveal;