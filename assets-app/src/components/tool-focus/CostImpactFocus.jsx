/**
 * Cost Impact Focus Component - Leads with Financial Impact Visualization
 * 
 * Primary Focus: Real-time financial impact with visual timeline - creates urgency
 * Secondary Reveal: Technical founder-specific costs - personal relevance
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { airtableService } from '../../services/airtableService';

const CostImpactFocus = ({ customerId, onProgressionComplete, onInteraction }) => {
  const [impactState, setImpactState] = useState({
    timelineData: [],
    monthlyLoss: 21000,
    showTechnicalCosts: false,
    interactionCount: 0,
    urgencyLevel: 'medium'
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [animatedValues, setAnimatedValues] = useState({});
  const [urgencyPulse, setUrgencyPulse] = useState(false);

  useEffect(() => {
    const generateImpactData = () => {
      const monthlyBase = impactState.monthlyLoss;
      const timeframes = {
        '3months': 3,
        '6months': 6,
        '12months': 12,
        '18months': 18
      };

      const months = timeframes[selectedTimeframe];
      const data = [];
      let cumulative = 0;

      for (let i = 1; i <= months; i++) {
        // Escalating loss pattern - gets worse over time
        const escalationFactor = 1 + (i * 0.05); // 5% increase per month
        const monthlyLoss = Math.round(monthlyBase * escalationFactor);
        cumulative += monthlyLoss;
        
        data.push({
          month: `Month ${i}`,
          monthIndex: i,
          monthlyLoss: monthlyLoss,
          cumulativeLoss: cumulative,
          urgencyColor: i <= 3 ? '#ef4444' : i <= 6 ? '#dc2626' : '#991b1b'
        });
      }

      setImpactState(prev => ({
        ...prev,
        timelineData: data
      }));
    };

    generateImpactData();
  }, [selectedTimeframe, impactState.monthlyLoss]);

  const handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    setImpactState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      showTechnicalCosts: prev.interactionCount >= 0 // Show after any interaction
    }));

    // Trigger urgency pulse
    setUrgencyPulse(true);
    setTimeout(() => setUrgencyPulse(false), 1000);

    // Track interaction
    onInteraction('timeline_explored', { timeframe, totalLoss: impactState.timelineData[impactState.timelineData.length - 1]?.cumulativeLoss });
  };

  const handleDataPointClick = (data) => {
    setImpactState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
      showTechnicalCosts: true
    }));

    onInteraction('chart_explored', { month: data.monthIndex, loss: data.cumulativeLoss });
  };

  const proceedToFullCalculator = () => {
    onProgressionComplete('cost_calculator', {
      interactionsCompleted: impactState.interactionCount,
      timeframesExplored: [selectedTimeframe],
      engagementLevel: impactState.interactionCount >= 3 ? 'high' : 'medium'
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-red-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{label}</p>
          <p className="text-red-400">
            Monthly Loss: <span className="font-bold">${payload[0]?.payload?.monthlyLoss.toLocaleString()}</span>
          </p>
          <p className="text-red-300">
            Total Lost: <span className="font-bold">${payload[0]?.value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const finalLoss = impactState.timelineData[impactState.timelineData.length - 1]?.cumulativeLoss || 0;

  return (
    <div className="cost-impact-focus">
      {/* Immediate Hook: Financial Impact Visualization */}
      <motion.div
        className="financial-impact-hook"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Your Current Revenue Loss Timeline
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Real-time financial impact of strategic delays
          </p>
          <motion.p 
            className="text-red-400 text-lg font-medium"
            animate={{ 
              scale: urgencyPulse ? 1.05 : 1,
              color: urgencyPulse ? '#ff6b6b' : '#ef4444'
            }}
            transition={{ duration: 0.3 }}
          >
            Every month of delay = ${impactState.monthlyLoss.toLocaleString()} in lost revenue
          </motion.p>
        </div>

        {/* Interactive Timeline Selection */}
        <div className="timeframe-selector mb-8">
          <div className="flex justify-center space-x-4">
            {[
              { key: '3months', label: '3 Months', urgency: 'low' },
              { key: '6months', label: '6 Months', urgency: 'medium' },
              { key: '12months', label: '12 Months', urgency: 'high' },
              { key: '18months', label: '18 Months', urgency: 'critical' }
            ].map((timeframe) => (
              <motion.button
                key={timeframe.key}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedTimeframe === timeframe.key
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleTimeframeChange(timeframe.key)}
              >
                {timeframe.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Real-Time Impact Chart */}
        <motion.div 
          className="impact-visualization mb-8"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-8 border border-red-500/30">
            
            {/* Key Metrics Display */}
            <div className="metrics-overview grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="metric-card bg-red-800/30 rounded-xl p-4 text-center border border-red-600/50"
                animate={{ scale: urgencyPulse ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-2xl font-bold text-red-400">${impactState.monthlyLoss.toLocaleString()}</div>
                <div className="text-sm text-gray-300">Monthly Loss</div>
              </motion.div>
              
              <motion.div 
                className="metric-card bg-red-700/30 rounded-xl p-4 text-center border border-red-600/50"
                animate={{ scale: urgencyPulse ? 1.05 : 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="text-2xl font-bold text-red-300">${finalLoss.toLocaleString()}</div>
                <div className="text-sm text-gray-300">Total at {selectedTimeframe.replace('months', 'mo')}</div>
              </motion.div>
              
              <div className="metric-card bg-orange-800/30 rounded-xl p-4 text-center border border-orange-600/50">
                <div className="text-2xl font-bold text-orange-400">
                  {Math.round(finalLoss / impactState.monthlyLoss)}x
                </div>
                <div className="text-sm text-gray-300">Escalation Factor</div>
              </div>
              
              <div className="metric-card bg-yellow-800/30 rounded-xl p-4 text-center border border-yellow-600/50">
                <div className="text-2xl font-bold text-yellow-400">
                  ${Math.round(finalLoss / (impactState.timelineData.length || 1)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300">Avg Per Month</div>
              </div>
            </div>

            {/* Interactive Chart */}
            <div className="chart-container h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={impactState.timelineData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="cumulativeLoss"
                    stroke="#ef4444"
                    strokeWidth={3}
                    fill="url(#lossGradient)"
                    onClick={handleDataPointClick}
                    style={{ cursor: 'pointer' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Urgency Trigger */}
            <motion.div 
              className="urgency-message text-center"
              animate={{ 
                scale: urgencyPulse ? 1.1 : 1,
                opacity: urgencyPulse ? 1 : 0.8
              }}
            >
              <p className="text-xl font-bold text-red-400 mb-2">
                ⚠️ Revenue Impact Accelerating
              </p>
              <p className="text-gray-300">
                Delay costs compound exponentially - early action minimizes total loss
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Progressive Reveal: Technical Founder Costs */}
      <AnimatePresence>
        {impactState.showTechnicalCosts && (
          <motion.div
            className="technical-costs-reveal"
            initial={{ opacity: 0, y: 30, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -30, height: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-500/30 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Technical Founder Impact Analysis
              </h2>
              
              <div className="technical-costs-breakdown grid md:grid-cols-3 gap-6 mb-6">
                
                {/* Engineering Opportunity Cost */}
                <div className="cost-category bg-gradient-to-br from-blue-800/30 to-blue-700/30 rounded-xl p-6 border border-blue-500/50">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">👨‍💻</div>
                    <h3 className="text-lg font-bold text-blue-400">Engineering Opportunity Cost</h3>
                  </div>
                  <div className="metrics space-y-3">
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Developer Hours Lost:</span>
                      <span className="text-blue-400 font-bold">2,160 hours</span>
                    </div>
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Equivalent Team:</span>
                      <span className="text-blue-400 font-bold">2.5 devs × 3mo</span>
                    </div>
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Salary Cost:</span>
                      <span className="text-blue-400 font-bold">${Math.round(finalLoss * 0.4).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="impact-note mt-4 pt-4 border-t border-blue-500/30">
                    <p className="text-xs text-blue-300">
                      Time spent on manual processes that could be systematized
                    </p>
                  </div>
                </div>

                {/* Product Development Delay */}
                <div className="cost-category bg-gradient-to-br from-purple-800/30 to-purple-700/30 rounded-xl p-6 border border-purple-500/50">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">🚀</div>
                    <h3 className="text-lg font-bold text-purple-400">Product Development Delay</h3>
                  </div>
                  <div className="metrics space-y-3">
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Release Delay:</span>
                      <span className="text-purple-400 font-bold">1.2 quarters</span>
                    </div>
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Market Position:</span>
                      <span className="text-purple-400 font-bold">Behind competitors</span>
                    </div>
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Market Share Loss:</span>
                      <span className="text-purple-400 font-bold">${Math.round(finalLoss * 0.35).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="impact-note mt-4 pt-4 border-t border-purple-500/30">
                    <p className="text-xs text-purple-300">
                      Revenue focus delays core product innovation
                    </p>
                  </div>
                </div>

                {/* Technical Debt Accumulation */}
                <div className="cost-category bg-gradient-to-br from-red-800/30 to-red-700/30 rounded-xl p-6 border border-red-500/50">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">⚡</div>
                    <h3 className="text-lg font-bold text-red-400">Technical Debt</h3>
                  </div>
                  <div className="metrics space-y-3">
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Future Refactor Cost:</span>
                      <span className="text-red-400 font-bold">$45,000</span>
                    </div>
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Performance Impact:</span>
                      <span className="text-red-400 font-bold">25% slower</span>
                    </div>
                    <div className="metric-row flex justify-between items-center">
                      <span className="text-gray-300 text-sm">Maintenance Overhead:</span>
                      <span className="text-red-400 font-bold">+40% time</span>
                    </div>
                  </div>
                  <div className="impact-note mt-4 pt-4 border-t border-red-500/30">
                    <p className="text-xs text-red-300">
                      Rushed revenue solutions create long-term costs
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Leader Reality Check */}
              <div className="reality-check bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl p-6 border border-gray-600/50 text-center">
                <h3 className="text-xl font-bold text-white mb-3">
                  Technical Leadership Reality
                </h3>
                <p className="text-lg text-orange-300 mb-2">
                  You're solving revenue problems with engineering time instead of revenue methodology.
                </p>
                <p className="text-gray-300">
                  This systematic approach recovers {Math.round(finalLoss * 0.65 / 1000)}K+ in engineering capacity
                  while generating {Math.round(finalLoss * 1.2 / 1000)}K+ in systematic revenue.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progression to Full Calculator */}
      {impactState.interactionCount >= 1 && (
        <motion.div
          className="progression-action text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <button
            onClick={proceedToFullCalculator}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30"
          >
            Calculate Your Complete Cost of Inaction
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Industry-specific scenarios with competitive analysis
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CostImpactFocus;