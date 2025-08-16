/**
 * WelcomeHero Component - Revenue Intelligence Infrastructure Welcome
 * 
 * Positions platform as infrastructure that amplifies existing AI, CRM, and sales automation tools.
 * Features personalized analysis with immediate export capabilities for user's tech stack.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { airtableService } from '../../services/airtableService';
import BuyerPersonaDetail from '../icp-analysis/BuyerPersonaDetail';
import AllSectionsGrid from '../icp-analysis/AllSectionsGrid';
import DashboardLayout from '../layout/DashboardLayout';
import SidebarSection from '../layout/SidebarSection';
import { MobileOptimizedButton, MobileOptimizedCard } from '../layout/MobileOptimized';
import NavigationControls from '../navigation/NavigationControls';
import { PrimaryButton } from '../ui/ButtonComponents';
import useNavigation from '../../hooks/useNavigation';

const WelcomeHero = ({ customerId, customerData, onStartEngagement }) => {
  const navigation = useNavigation(customerId, 'welcome');
  const [personalizedData, setPersonalizedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [icpAnalysisData, setIcpAnalysisData] = useState(null);
  const [showICPAnalysis, setShowICPAnalysis] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const loadPersonalizedWelcome = async () => {
      try {
        const data = await airtableService.getCustomerDataByRecordId(customerId);
        
        // Generate personalized value proposition
        const estimatedValue = calculateEstimatedValue(data);
        const compellingOpportunities = generateCompellingPreviews(data);
        
        // Load ICP analysis data for the wow moment
        const icpData = {
          detailedAnalysis: data.detailedIcpAnalysis,
          buyerPersonas: data.targetBuyerPersonas,
          hasAnalysis: !!(data.detailedIcpAnalysis || data.targetBuyerPersonas)
        };
        
        setPersonalizedData({
          customerName: data.customerName || 'Strategic Leader',
          company: data.company || 'Your Organization',
          estimatedValue,
          opportunities: compellingOpportunities
        });
        
        setIcpAnalysisData(icpData);
        
      } catch (error) {
        console.error('Error loading personalized welcome:', error);
        // Fallback to generic compelling content
        setPersonalizedData({
          customerName: 'Strategic Leader',
          company: 'Your Organization',
          estimatedValue: 250,
          opportunities: getDefaultOpportunities()
        });
        setIcpAnalysisData({ hasAnalysis: false });
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

  const generateCompellingPreviews = (data) => {
    const hasICPAnalysis = !!(data.detailedIcpAnalysis || data.targetBuyerPersonas);
    
    return [
      {
        icon: '🎯',
        title: hasICPAnalysis ? 'Your Personalized ICP Analysis' : 'Rate this company',
        preview: hasICPAnalysis ? 'Complete buyer persona & market fit analysis ready' : 'Tesla → 8.5/10 fit score',
        insight: hasICPAnalysis ? 'AI-generated strategic intelligence based on your data' : 'Champion tier prospect identification',
        engagement: hasICPAnalysis ? 'icp_analysis' : 'immediate_rating',
        isPersonalized: hasICPAnalysis
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
  };

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

  // Sidebar content for contextual guidance
  const WelcomeHeroSidebar = ({ timeToValue, nextSteps, firstTip }) => {
    return (
      <div className="space-y-6">
        <SidebarSection icon="🚀" title="WHAT'S NEXT">
          <ul className="space-y-2">
            {nextSteps.map((step, index) => (
              <li key={index} className="text-gray-300 text-sm">• {step}</li>
            ))}
          </ul>
        </SidebarSection>
        
        <SidebarSection icon="⏱️" title="TIME TO VALUE">
          <p className="text-gray-300 text-sm">{timeToValue}</p>
        </SidebarSection>
        
        <SidebarSection icon="💡" title="FIRST TIP">
          <p className="text-gray-300 text-sm">"{firstTip}"</p>
        </SidebarSection>
      </div>
    );
  };

  // Highlight Card Component
  const HighlightCard = ({ icon, title, content, action, onClick }) => {
    const handleClick = () => {
      try {
        if (onClick) {
          onClick();
        }
      } catch (error) {
        console.error('HighlightCard click error:', error);
      }
    };

    return (
      <button
        onClick={handleClick}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors duration-200 text-left w-full group cursor-pointer min-h-[44px] touch-manipulation"
      >
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {title}
        </h3>
        <p className="text-gray-300 mb-4">{content}</p>
        <p className="text-blue-400 text-sm group-hover:text-blue-300 transition-colors">
          {action} →
        </p>
      </button>
    );
  };

  // Navigation handlers
  const handleStartAnalysis = async () => {
    setIsNavigating(true);
    try {
      navigation.goToPhase('icp-analysis');
      if (onStartEngagement) {
        onStartEngagement('icp-analysis');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleHighlightClick = (toolType) => {
    try {
      navigation.goToPhase(toolType);
      if (onStartEngagement) {
        onStartEngagement(toolType);
      }
    } catch (error) {
      console.error('Highlight navigation error:', error);
    }
  };

  if (loading) {
    return (
      <div className="welcome-hero-loading">
        <motion.div 
          className="flex items-center justify-center h-96"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-pulse text-gray-400">
            Preparing your Revenue Intelligence Infrastructure...
          </div>
        </motion.div>
      </div>
    );
  }

  // Prepare sidebar content
  const sidebarContent = personalizedData ? (
    <WelcomeHeroSidebar 
      timeToValue="15 minutes total"
      nextSteps={["Full ICP Analysis", "Cost Calculator", "Business Case"]}
      firstTip="Use the ICP in tomorrow's prospect research call"
    />
  ) : null;

  return (
    <DashboardLayout 
      sidebarContent={sidebarContent} 
      currentPhase="welcome"
      customerName={personalizedData?.customerName}
      companyName={personalizedData?.company}
    >
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
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
        className="value-teaser mb-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-blue-700/30 backdrop-blur-sm">
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
          <HighlightCard 
            icon="🤖"
            title="AI AMPLIFICATION"
            content="Claude/ChatGPT prompts for immediate implementation"
            action="Generate AI-ready intelligence"
            onClick={() => handleHighlightClick('icp-analysis')}
          />
          <HighlightCard 
            icon="📊"
            title="CRM INTEGRATION" 
            content="HubSpot/Salesforce fields and workflow automation"
            action="Export prospect intelligence"
            onClick={() => handleHighlightClick('cost-calculator')}
          />
          <HighlightCard 
            icon="⚡"
            title="SALES AUTOMATION"
            content="Outreach/SalesLoft sequences and campaign assets"
            action="Deploy systematic engagement"
            onClick={() => handleHighlightClick('business-case')}
          />
        </motion.div>

        {/* Immediate Value Demo */}
        <motion.div 
          className="immediate-value-demo mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="compelling-previews grid gap-6">
            {personalizedData.opportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                className="preview-card group cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + (index * 0.1), duration: 0.5 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onClick={() => {
                  if (opportunity.engagement === 'icp_analysis') {
                    setShowICPAnalysis(true);
                  } else {
                    onStartEngagement(opportunity.engagement);
                  }
                }}
              >
                <div className={`rounded-xl p-6 transition-all duration-300 group-hover:shadow-2xl ${
                  opportunity.isPersonalized 
                    ? 'bg-gradient-to-r from-blue-800/60 to-purple-800/60 border border-blue-500/70 hover:border-blue-400/80 group-hover:shadow-blue-500/30' 
                    : 'bg-gradient-to-r from-gray-800/80 to-gray-700/80 border border-gray-600/50 hover:border-blue-500/50 group-hover:shadow-blue-500/20'
                }`}>
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{opportunity.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
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

        {/* Single Prominent CTA */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <PrimaryButton
            onClick={handleStartAnalysis}
            loading={isNavigating}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg py-4 px-8"
          >
            See Full Analysis & Rating Tools
          </PrimaryButton>
        </motion.div>

        {/* Progress Hint */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <p className="text-gray-400">
            2 more strategic frameworks after this
          </p>
          <div className="flex items-center justify-center space-x-4 text-gray-400 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-sm">3 integrated tools</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-600"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">15 minutes total</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ICP Analysis Modal/Overlay */}
      <AnimatePresence>
        {showICPAnalysis && icpAnalysisData?.hasAnalysis && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowICPAnalysis(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Your Personalized ICP Analysis
                  </h2>
                  <p className="text-gray-300 mt-2">
                    AI-generated strategic intelligence based on your business data
                  </p>
                </div>
                <button
                  onClick={() => setShowICPAnalysis(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {icpAnalysisData?.buyerPersonas && (
                  <BuyerPersonaDetail persona={icpAnalysisData.buyerPersonas} />
                )}
                
                {icpAnalysisData?.detailedAnalysis && (
                  <div className="mt-8">
                    <AllSectionsGrid sections={icpAnalysisData.detailedAnalysis} />
                  </div>
                )}
                
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => {
                      setShowICPAnalysis(false);
                      onStartEngagement('strategic_analysis');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300"
                  >
                    Continue to Strategic Tools
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Controls */}
      <NavigationControls
        currentPhase={navigation.currentPhase}
        onGoBack={navigation.goBack}
        onGoHome={navigation.goHome}
        onNextPhase={handleStartAnalysis}
        canGoBack={false} // First screen
        nextLabel="Start Analysis"
        disabled={isNavigating}
      />
    </DashboardLayout>
  );
};

export default WelcomeHero;