/**
 * CompellingAspectDemo Component - Phase 1: Immediate Value Hooks
 * 
 * Provides compelling previews of each tool's most engaging aspect
 * before users commit to full tool engagement.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CompellingAspectDemo = ({ aspectType, onEngageWith, customerData }) => {
  const [demoData, setDemoData] = useState(null);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    const initializeDemoData = () => {
      switch (aspectType) {
        case 'immediate_rating':
          setDemoData(getICPRatingDemo());
          break;
        case 'financial_impact':
          setDemoData(getCostImpactDemo());
          break;
        case 'business_case':
          setDemoData(getBusinessCaseDemo());
          break;
        default:
          setDemoData(null);
      }
    };

    initializeDemoData();
  }, [aspectType]);

  const getICPRatingDemo = () => ({
    title: 'Rate Your Ideal Customer Prospects',
    subtitle: 'Instant qualification with strategic scoring',
    companies: [
      { name: 'Tesla', score: 8.5, status: 'Champion', color: 'green' },
      { name: 'Stripe', score: 7.2, status: 'Strong', color: 'blue' },
      { name: 'Local Corp', score: 4.1, status: 'Weak', color: 'red' }
    ],
    interactionPrompt: 'Try rating your actual prospects above ↑',
    compellingInsight: 'Champion Tier: 85% close probability • $50K average deal size'
  });

  const getCostImpactDemo = () => ({
    title: 'Your Current Revenue Loss Timeline',
    subtitle: 'Real-time financial impact of strategic delays',
    timelineData: [
      { month: 'Month 1', loss: 21, cumulative: 21 },
      { month: 'Month 3', loss: 23, cumulative: 67 },
      { month: 'Month 6', loss: 25, cumulative: 127 },
      { month: 'Month 12', loss: 28, cumulative: 298 }
    ],
    urgencyTrigger: 'Every month of delay = $21K in lost revenue',
    compellingInsight: 'Engineering opportunity cost: 2.5 developers for 3 months'
  });

  const getBusinessCaseDemo = () => ({
    title: 'Your Executive Business Case is Ready',
    subtitle: 'Smart auto-population from integrated analysis',
    sections: [
      { title: 'Customer Analysis', status: 'complete', value: '8.5/10 fit score, Champion tier' },
      { title: 'Financial Impact', status: 'complete', value: '$127K cost of delay identified' },
      { title: 'ROI Projection', status: 'complete', value: '340% return in 12 months' },
      { title: 'Risk Assessment', status: 'complete', value: 'Low implementation risk' }
    ],
    magicMoment: 'All data auto-populated from your previous analysis',
    compellingInsight: 'Generate versions for CEO, CFO, and CTO stakeholders'
  });

  const handleInteraction = (interactionType, data) => {
    setIsInteractive(true);
    
    // Simulate interaction effect
    setTimeout(() => {
      onEngageWith(aspectType, { interaction: interactionType, data });
    }, 500);
  };

  if (!demoData) return null;

  return (
    <motion.div 
      className="compelling-aspect-demo"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {aspectType === 'immediate_rating' && (
        <ICPRatingDemo 
          data={demoData} 
          onInteraction={handleInteraction}
          isInteractive={isInteractive}
        />
      )}
      
      {aspectType === 'financial_impact' && (
        <FinancialImpactDemo 
          data={demoData} 
          onInteraction={handleInteraction}
          isInteractive={isInteractive}
        />
      )}
      
      {aspectType === 'business_case' && (
        <BusinessCaseDemo 
          data={demoData} 
          onInteraction={handleInteraction}
          isInteractive={isInteractive}
        />
      )}
    </motion.div>
  );
};

// ICP Rating Demo Component
const ICPRatingDemo = ({ data, onInteraction, isInteractive }) => {
  const [selectedCompany, setSelectedCompany] = useState(null);

  return (
    <div className="icp-rating-demo bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-8 border border-gray-600/50">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
        <p className="text-gray-300">{data.subtitle}</p>
      </div>

      <div className="company-rating-cards grid gap-4 mb-6">
        {data.companies.map((company, index) => (
          <motion.div
            key={index}
            className={`rating-card cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedCompany === company.name
                ? 'border-blue-500 bg-blue-900/30'
                : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedCompany(company.name);
              onInteraction('company_rated', company);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">🏢</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                  <p className={`text-sm font-medium ${
                    company.color === 'green' ? 'text-green-400' :
                    company.color === 'blue' ? 'text-blue-400' : 'text-red-400'
                  }`}>
                    {company.status} Prospect
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  company.color === 'green' ? 'text-green-400' :
                  company.color === 'blue' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {company.score}/10
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="instant-value text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-blue-300 font-medium mb-4">{data.interactionPrompt}</p>
        
        <AnimatePresence>
          {selectedCompany && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="compelling-insight bg-gradient-to-r from-green-900/50 to-blue-900/50 rounded-xl p-4 border border-green-500/30"
            >
              <p className="text-green-300 font-semibold">{data.compellingInsight}</p>
              <p className="text-gray-300 text-sm mt-1">Recommended actions: Direct CEO outreach, technical demo</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Financial Impact Demo Component
const FinancialImpactDemo = ({ data, onInteraction, isInteractive }) => {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  return (
    <div className="financial-impact-demo bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-2xl p-8 border border-red-500/30">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
        <p className="text-gray-300">{data.subtitle}</p>
      </div>

      <div className="real-time-chart mb-6">
        <div className="timeline-visualization grid grid-cols-4 gap-4 mb-6">
          {data.timelineData.map((point, index) => (
            <motion.div
              key={index}
              className="timeline-point cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredMonth(index)}
              onHoverEnd={() => setHoveredMonth(null)}
              onClick={() => onInteraction('timeline_explored', point)}
            >
              <div className={`bg-gradient-to-br from-red-800/80 to-red-700/80 rounded-xl p-4 border transition-all duration-300 ${
                hoveredMonth === index ? 'border-red-400 shadow-lg' : 'border-red-600/50'
              }`}>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">{point.month}</h3>
                  <div className="text-2xl font-bold text-red-400 mb-1">-${point.cumulative}K</div>
                  <div className="text-xs text-gray-400">+${point.loss}K this period</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="urgency-trigger text-center mb-6">
          <motion.p 
            className="text-xl font-bold text-red-400 mb-2"
            animate={{ 
              scale: hoveredMonth !== null ? 1.05 : 1,
              opacity: hoveredMonth !== null ? 1 : 0.8
            }}
          >
            {data.urgencyTrigger}
          </motion.p>
        </div>

        <AnimatePresence>
          {hoveredMonth !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="technical-founder-costs bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-xl p-4 border border-orange-500/30"
            >
              <p className="text-orange-300 font-semibold mb-2">{data.compellingInsight}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-gray-300">Product development delay: <span className="text-orange-400">1.2 quarters behind</span></div>
                <div className="text-gray-300">Technical debt accumulation: <span className="text-red-400">$45K future costs</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Business Case Demo Component
const BusinessCaseDemo = ({ data, onInteraction, isInteractive }) => {
  const [previewExpanded, setPreviewExpanded] = useState(false);

  return (
    <div className="business-case-demo bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-8 border border-blue-500/30">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{data.title}</h2>
        <p className="text-gray-300">{data.subtitle}</p>
      </div>

      <div className="auto-populated-preview mb-6">
        <div className="prefilled-sections space-y-3 mb-6">
          {data.sections.map((section, index) => (
            <motion.div
              key={index}
              className="section-item bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg p-4 border border-green-500/30 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setPreviewExpanded(true);
                onInteraction('section_previewed', section);
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="text-green-400 text-xl">✅</div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{section.title}</h3>
                  <p className="text-green-300 text-sm">{section.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="magic-moment text-center mb-6"
          animate={{ 
            scale: previewExpanded ? 1.05 : 1,
            opacity: previewExpanded ? 1 : 0.8
          }}
        >
          <p className="text-blue-300 font-semibold text-lg mb-2">✨ {data.magicMoment}</p>
        </motion.div>

        <AnimatePresence>
          {previewExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="stakeholder-views bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/30"
            >
              <h3 className="text-white font-semibold mb-4">{data.compellingInsight}</h3>
              <div className="view-options grid grid-cols-3 gap-3">
                <button className="stakeholder-button bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200">
                  CEO: Executive Summary
                </button>
                <button className="stakeholder-button bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200">
                  CFO: Financial Analysis
                </button>
                <button className="stakeholder-button bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200">
                  CTO: Technical Impact
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompellingAspectDemo;