/**
 * ICP Rating Focus Component - Leads with Dynamic Company Rating System
 * 
 * Primary Focus: Interactive company rating system - immediate, satisfying
 * Secondary Reveal: Actionable tier classification with probabilities
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { airtableService } from '../../services/airtableService';

const ICPRatingFocus = ({ customerId, onProgressionComplete, onInteraction }) => {
  const [ratingState, setRatingState] = useState({
    companies: [],
    userRatings: {},
    showTierClassification: false,
    completedFirstRating: false
  });
  
  const [focusedCompany, setFocusedCompany] = useState(null);
  const [satisfactionTrigger, setSatisfactionTrigger] = useState(false);

  useEffect(() => {
    const initializeRatingSystem = () => {
      const demoCompanies = [
        { 
          id: 'tesla',
          name: 'Tesla', 
          logo: '🚗',
          industry: 'Electric Vehicles',
          size: 'Large Enterprise',
          suggestedScore: 8.5,
          tier: 'Champion',
          insights: {
            strengths: ['High innovation budget', 'Tech-forward culture', 'Rapid scaling needs'],
            probabilities: { close: 85, avgDeal: 50000, timeline: '3 months' }
          }
        },
        { 
          id: 'stripe',
          name: 'Stripe', 
          logo: '💳',
          industry: 'FinTech',
          size: 'Growth Stage',
          suggestedScore: 7.2,
          tier: 'Strong',
          insights: {
            strengths: ['Developer-first', 'API-focused', 'Global expansion'],
            probabilities: { close: 68, avgDeal: 35000, timeline: '4 months' }
          }
        },
        { 
          id: 'localcorp',
          name: 'Local Corp', 
          logo: '🏢',
          industry: 'Traditional Services',
          size: 'Mid-Market',
          suggestedScore: 4.1,
          tier: 'Weak',
          insights: {
            strengths: ['Stable revenue', 'Local presence'],
            probabilities: { close: 23, avgDeal: 12000, timeline: '8+ months' }
          }
        }
      ];
      
      setRatingState(prev => ({
        ...prev,
        companies: demoCompanies
      }));
    };

    initializeRatingSystem();
  }, []);

  const handleCompanyRating = async (company, score) => {
    // Trigger satisfaction animation
    setSatisfactionTrigger(true);
    setTimeout(() => setSatisfactionTrigger(false), 1000);

    // Update rating state
    setRatingState(prev => ({
      ...prev,
      userRatings: {
        ...prev.userRatings,
        [company.id]: score
      },
      completedFirstRating: true,
      showTierClassification: true
    }));

    setFocusedCompany(company);

    // Track interaction for progressive engagement
    onInteraction('company_rated', { company: company.name, score, tier: company.tier });

    // Update backend with ICP progress
    try {
      await airtableService.trackICPProgress(customerId, {
        company: company.name,
        rating: score,
        tier: company.tier,
        interaction_type: 'rating_focus_demo'
      });
    } catch (error) {
      console.error('Error tracking ICP progress:', error);
    }
  };

  const proceedToFullAnalysis = () => {
    onProgressionComplete('icp_analysis', {
      ratingsCompleted: Object.keys(ratingState.userRatings).length,
      demonstratedValue: true,
      engagementLevel: 'high'
    });
  };

  return (
    <div className="icp-rating-focus">
      {/* Immediate Hook: Dynamic Rating System */}
      <motion.div 
        className="rating-system-hook"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Rate Your Ideal Customer Prospects
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Instant qualification with strategic scoring methodology
          </p>
          <p className="text-blue-300">
            Try rating these companies to see the power of systematic evaluation ↓
          </p>
        </div>

        {/* Interactive Rating Cards */}
        <div className="company-rating-grid grid gap-6 mb-8">
          {ratingState.companies.map((company, index) => (
            <motion.div
              key={company.id}
              className="rating-card group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className={`bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
                focusedCompany?.id === company.id 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20 bg-blue-900/20' 
                  : 'border-gray-600/50 hover:border-gray-500 group-hover:shadow-xl'
              }`}>
                
                {/* Company Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{company.logo}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{company.name}</h3>
                    <p className="text-gray-400">{company.industry} • {company.size}</p>
                  </div>
                  
                  {/* Current Rating Display */}
                  {ratingState.userRatings[company.id] && (
                    <motion.div 
                      className="rating-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${
                        ratingState.userRatings[company.id] >= 7.5 ? 'text-green-400 bg-green-900/30' :
                        ratingState.userRatings[company.id] >= 6.0 ? 'text-blue-400 bg-blue-900/30' :
                        'text-red-400 bg-red-900/30'
                      }`}>
                        {ratingState.userRatings[company.id]}/10
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Rating Interface */}
                <div className="rating-interface mb-4">
                  <p className="text-gray-300 text-sm mb-3">Rate this prospect (1-10):</p>
                  <div className="rating-scale flex space-x-2">
                    {[...Array(10)].map((_, i) => {
                      const score = i + 1;
                      const isSelected = ratingState.userRatings[company.id] === score;
                      const isSuggested = Math.abs(score - company.suggestedScore) < 0.5;
                      
                      return (
                        <motion.button
                          key={score}
                          className={`rating-button w-8 h-8 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-500 text-white shadow-lg' 
                              : isSuggested
                                ? 'bg-blue-700/50 text-blue-300 border border-blue-500/50'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCompanyRating(company, score)}
                        >
                          {score}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Immediate Satisfaction Feedback */}
                <AnimatePresence>
                  {ratingState.userRatings[company.id] && focusedCompany?.id === company.id && (
                    <motion.div
                      className="immediate-feedback"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`tier-preview p-4 rounded-xl border mt-4 ${
                        company.tier === 'Champion' ? 'bg-green-900/30 border-green-500/50' :
                        company.tier === 'Strong' ? 'bg-blue-900/30 border-blue-500/50' :
                        'bg-red-900/30 border-red-500/50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold ${
                            company.tier === 'Champion' ? 'text-green-400' :
                            company.tier === 'Strong' ? 'text-blue-400' :
                            'text-red-400'
                          }`}>
                            {company.tier} Tier Prospect
                          </span>
                          <span className="text-sm text-gray-400">
                            {company.insights.probabilities.close}% close probability
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Avg deal: ${company.insights.probabilities.avgDeal.toLocaleString()} • Timeline: {company.insights.probabilities.timeline}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Satisfaction Animation Trigger */}
        <AnimatePresence>
          {satisfactionTrigger && (
            <motion.div
              className="satisfaction-burst fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-6xl">✨</div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progressive Reveal: Tier Classification Intelligence */}
      <AnimatePresence>
        {ratingState.showTierClassification && (
          <motion.div
            className="tier-classification-reveal"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-500/30 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Strategic Tier Classification System
              </h2>
              
              <div className="tier-breakdown grid md:grid-cols-3 gap-6 mb-8">
                <div className="champion-tier bg-gradient-to-br from-green-800/30 to-green-700/30 rounded-xl p-6 border border-green-500/50">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">👑</div>
                    <h3 className="text-lg font-bold text-green-400">Champion Tier</h3>
                    <p className="text-sm text-gray-300">8.0+ Rating</p>
                  </div>
                  <div className="metrics space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Close Rate:</span>
                      <span className="text-green-400 font-semibold">80-90%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Deal Size:</span>
                      <span className="text-green-400 font-semibold">$45-60K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sales Cycle:</span>
                      <span className="text-green-400 font-semibold">2-4 months</span>
                    </div>
                  </div>
                  <div className="actions mt-4 pt-4 border-t border-green-500/30">
                    <p className="text-xs text-green-300 font-medium">Recommended Actions:</p>
                    <p className="text-xs text-gray-300">Direct CEO outreach, technical demo, expedited process</p>
                  </div>
                </div>

                <div className="strong-tier bg-gradient-to-br from-blue-800/30 to-blue-700/30 rounded-xl p-6 border border-blue-500/50">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">💪</div>
                    <h3 className="text-lg font-bold text-blue-400">Strong Tier</h3>
                    <p className="text-sm text-gray-300">6.0-7.9 Rating</p>
                  </div>
                  <div className="metrics space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Close Rate:</span>
                      <span className="text-blue-400 font-semibold">60-75%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Deal Size:</span>
                      <span className="text-blue-400 font-semibold">$25-40K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sales Cycle:</span>
                      <span className="text-blue-400 font-semibold">4-6 months</span>
                    </div>
                  </div>
                  <div className="actions mt-4 pt-4 border-t border-blue-500/30">
                    <p className="text-xs text-blue-300 font-medium">Recommended Actions:</p>
                    <p className="text-xs text-gray-300">Standard process, value demonstration, stakeholder alignment</p>
                  </div>
                </div>

                <div className="weak-tier bg-gradient-to-br from-red-800/30 to-red-700/30 rounded-xl p-6 border border-red-500/50">
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">⚠️</div>
                    <h3 className="text-lg font-bold text-red-400">Weak Tier</h3>
                    <p className="text-sm text-gray-300">Below 6.0 Rating</p>
                  </div>
                  <div className="metrics space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Close Rate:</span>
                      <span className="text-red-400 font-semibold">15-35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Deal Size:</span>
                      <span className="text-red-400 font-semibold">$8-20K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sales Cycle:</span>
                      <span className="text-red-400 font-semibold">8+ months</span>
                    </div>
                  </div>
                  <div className="actions mt-4 pt-4 border-t border-red-500/30">
                    <p className="text-xs text-red-300 font-medium">Recommended Actions:</p>
                    <p className="text-xs text-gray-300">Nurture campaign, educational content, long-term relationship</p>
                  </div>
                </div>
              </div>

              <div className="sophistication-reveal text-center">
                <p className="text-lg text-purple-300 font-medium mb-2">
                  This systematic approach typically requires months of sales training.
                </p>
                <p className="text-gray-300">
                  You just experienced it in 60 seconds.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progression to Full Tool */}
      {ratingState.completedFirstRating && (
        <motion.div
          className="progression-action text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <button
            onClick={proceedToFullAnalysis}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
          >
            Experience Full ICP Analysis Framework
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Build complete customer profiles with 15+ strategic criteria
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ICPRatingFocus;