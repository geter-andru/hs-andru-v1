/**
 * WelcomeHero Component - Phase 1: Initial Welcome Experience
 * 
 * Replaces complex dashboard with focused, compelling value demonstration
 * that creates immediate engagement within first 10 seconds.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { airtableService } from '../../services/airtableService';

const WelcomeHero = ({ customerId, customerData, onStartEngagement }) => {
  const [personalizedData, setPersonalizedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPersonalizedWelcome = async () => {
      try {
        const data = await airtableService.getCustomerDataByRecordId(customerId);
        
        // Generate personalized value proposition
        const estimatedValue = calculateEstimatedValue(data);
        const compellingOpportunities = generateCompellingPreviews(data);
        
        setPersonalizedData({
          customerName: data.customer_name || 'Strategic Leader',
          company: data.company || 'Your Organization',
          estimatedValue,
          opportunities: compellingOpportunities
        });
      } catch (error) {
        console.error('Error loading personalized welcome:', error);
        // Fallback to generic compelling content
        setPersonalizedData({
          customerName: 'Strategic Leader',
          company: 'Your Organization',
          estimatedValue: 250,
          opportunities: getDefaultOpportunities()
        });
      } finally {
        setLoading(false);
      }
    };

    loadPersonalizedWelcome();
  }, [customerId]);

  const calculateEstimatedValue = (data) => {
    // Calculate based on previous responses or defaults
    const baseValue = 150;
    const companyMultiplier = data.company_size === 'enterprise' ? 2.5 : 1.8;
    return Math.round(baseValue * companyMultiplier);
  };

  const generateCompellingPreviews = (data) => [
    {
      icon: '🎯',
      title: 'Rate this company',
      preview: 'Tesla → 8.5/10 fit score',
      insight: 'Champion tier prospect identification',
      engagement: 'immediate_rating'
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
  ];

  const getDefaultOpportunities = () => [
    {
      icon: '🎯',
      title: 'Prospect Rating System',
      preview: 'Score customers in 30 seconds',
      insight: 'Instant qualification methodology',
      engagement: 'immediate_rating'
    },
    {
      icon: '💰',
      title: 'Revenue Impact Analysis',
      preview: 'Quantify opportunity costs',
      insight: 'Technical founder cost breakdown',
      engagement: 'financial_impact'
    },
    {
      icon: '📋',
      title: 'Strategic Documentation',
      preview: 'Executive-ready frameworks',
      insight: 'Multi-stakeholder business cases',
      engagement: 'business_case'
    }
  ];

  if (loading) {
    return (
      <div className="welcome-hero-loading">
        <motion.div 
          className="flex items-center justify-center h-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-pulse text-gray-400">
            Preparing your strategic intelligence...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="welcome-hero-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Personalized Greeting */}
      <motion.div 
        className="personalized-greeting mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-white mb-3">
          Welcome back, {personalizedData.customerName}
        </h1>
        <p className="text-xl text-gray-300 mb-2">
          from {personalizedData.company}
        </p>
        <p className="text-lg text-blue-300 font-medium">
          Your Strategic Revenue Intelligence is ready.
        </p>
      </motion.div>

      {/* Value Teaser */}
      <motion.div 
        className="value-teaser mb-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-blue-700/30 backdrop-blur-sm">
          <p className="text-lg text-gray-200 mb-4 leading-relaxed">
            Based on your strategic requirements, we've identified{' '}
            <span className="text-blue-300 font-semibold">3 critical opportunities</span>{' '}
            worth <span className="text-green-400 font-bold text-xl">${personalizedData.estimatedValue}K</span>{' '}
            in potential revenue impact.
          </p>
          <p className="text-blue-300 font-medium text-lg">
            Let's start with your biggest opportunity...
          </p>
        </div>
      </motion.div>

      {/* Immediate Value Demo */}
      <motion.div 
        className="immediate-value-demo mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="compelling-previews grid gap-6">
          {personalizedData.opportunities.map((opportunity, index) => (
            <motion.div
              key={index}
              className="preview-card group cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              onClick={() => onStartEngagement(opportunity.engagement)}
            >
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 rounded-xl p-6 border border-gray-600/50 hover:border-blue-500/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{opportunity.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {opportunity.title}
                    </h3>
                    <p className="text-xl font-medium text-blue-300 mb-2">
                      {opportunity.preview}
                    </p>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {opportunity.insight}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Primary Action */}
      <motion.div 
        className="primary-action mb-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <button
          onClick={() => onStartEngagement('strategic_analysis')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
        >
          Start Strategic Analysis
        </button>
      </motion.div>

      {/* Progress Hint */}
      <motion.div 
        className="progress-hint text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <div className="flex items-center justify-center space-x-4 text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>3 integrated tools</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>15 minutes total</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Professional methodology framework
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeHero;