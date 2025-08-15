/**
 * ICP Detail Modal - Phase 2
 * 
 * Full-screen modal with comprehensive ICP analysis and sidebar navigation
 * Includes progress tracking for content engagement and professional milestones
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, Download, FileText, Users, AlertTriangle,
  Target, BarChart3, Star, CheckCircle, Play, Eye,
  TrendingUp, Award, Zap, Clock, ExternalLink
} from 'lucide-react';

const ICPDetailModal = ({ 
  isOpen, 
  onClose, 
  icpContent, 
  onProgressUpdate,
  className = '' 
}) => {
  // Modal state management
  const [activeSection, setActiveSection] = useState('overview');
  const [viewedSections, setViewedSections] = useState(new Set());
  const [ratedCompanies, setRatedCompanies] = useState(new Map());
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [achievements, setAchievements] = useState(new Set());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Sample companies for rating system
  const sampleCompanies = [
    {
      id: 'tech-startup-a',
      name: 'TechFlow Systems',
      industry: 'SaaS',
      size: '150 employees',
      revenue: '$12M ARR',
      description: 'Cloud-based workflow automation platform'
    },
    {
      id: 'enterprise-b',
      name: 'DataCorp Industries',
      industry: 'Data Analytics',
      size: '850 employees', 
      revenue: '$45M ARR',
      description: 'Enterprise data intelligence solutions'
    },
    {
      id: 'mid-market-c',
      name: 'Solutions Inc',
      industry: 'Consulting',
      size: '320 employees',
      revenue: '$28M ARR', 
      description: 'Business transformation consulting'
    },
    {
      id: 'growth-stage-d',
      name: 'InnovateLabs',
      industry: 'AI/ML',
      size: '95 employees',
      revenue: '$8M ARR',
      description: 'Machine learning platform for enterprises'
    },
    {
      id: 'established-e',
      name: 'MegaCorp Solutions',
      industry: 'ERP',
      size: '2400 employees',
      revenue: '$180M ARR',
      description: 'Enterprise resource planning systems'
    }
  ];

  // ICP section configuration with point values
  const sectionConfig = [
    {
      id: 'overview',
      label: 'ICP Overview',
      icon: Target,
      description: 'Complete customer profile framework',
      points: 10,
      timeEstimate: '3 min read'
    },
    {
      id: 'rating-system',
      label: 'Rating System',
      icon: BarChart3,
      description: 'Interactive company scoring methodology',
      points: 25,
      timeEstimate: '5 min practice'
    },
    {
      id: 'buyer-personas',
      label: 'Buyer Personas',
      icon: Users,
      description: 'Detailed stakeholder profiles',
      points: 20,
      timeEstimate: '4 min read'
    },
    {
      id: 'who-to-avoid',
      label: 'Who to Avoid',
      icon: AlertTriangle,
      description: 'Red flags and disqualification criteria',
      points: 15,
      timeEstimate: '2 min read'
    },
    {
      id: 'empathy-map',
      label: 'Empathy Map',
      icon: Star,
      description: 'Customer psychology and motivations',
      points: 20,
      timeEstimate: '4 min read'
    }
  ];

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Award progress points for actions
  const awardPoints = useCallback((points, action, category = 'customerAnalysis') => {
    setTotalPointsEarned(prev => prev + points);
    
    // Call parent progress update
    if (onProgressUpdate) {
      onProgressUpdate({
        points,
        action,
        category,
        timestamp: new Date().toISOString()
      });
    }

    // Check for achievements
    checkAchievements(points, action);
  }, [onProgressUpdate]);

  // Check for professional achievements
  const checkAchievements = useCallback((points, action) => {
    const newAchievements = new Set(achievements);

    // First Steps Achievement
    if (viewedSections.size === 1 && !achievements.has('first-steps')) {
      newAchievements.add('first-steps');
      awardPoints(10, 'First Steps Achievement');
    }

    // Content Explorer Achievement
    if (viewedSections.size >= sectionConfig.length && !achievements.has('content-explorer')) {
      newAchievements.add('content-explorer');
      awardPoints(50, 'Content Explorer Achievement');
    }

    // Rating Master Achievement
    if (ratedCompanies.size >= 5 && !achievements.has('rating-master')) {
      newAchievements.add('rating-master');
      awardPoints(50, 'Rating Master Achievement');
    }

    setAchievements(newAchievements);
  }, [achievements, viewedSections.size, ratedCompanies.size, awardPoints]);

  // Handle section navigation with progress tracking
  const handleSectionChange = useCallback((sectionId) => {
    setActiveSection(sectionId);
    
    // Track section view if not already viewed
    if (!viewedSections.has(sectionId)) {
      const newViewed = new Set(viewedSections);
      newViewed.add(sectionId);
      setViewedSections(newViewed);
      
      // Award points for viewing section
      const section = sectionConfig.find(s => s.id === sectionId);
      if (section) {
        awardPoints(section.points, `Viewed ${section.label}`);
      }
    }
  }, [viewedSections, awardPoints, sectionConfig]);

  // Handle company rating
  const handleCompanyRating = useCallback((companyId, rating) => {
    const newRatings = new Map(ratedCompanies);
    const isFirstRating = !newRatings.has(companyId);
    newRatings.set(companyId, rating);
    setRatedCompanies(newRatings);

    // Award points for rating (higher for first-time ratings)
    if (isFirstRating) {
      awardPoints(25, `Rated ${sampleCompanies.find(c => c.id === companyId)?.name}`);
    } else {
      awardPoints(5, `Updated rating for ${sampleCompanies.find(c => c.id === companyId)?.name}`);
    }
  }, [ratedCompanies, awardPoints, sampleCompanies]);

  // Handle export actions
  const handleExport = useCallback((format) => {
    // Award significant points for export actions
    awardPoints(30, `Exported ICP analysis as ${format.toUpperCase()}`);
    
    // In real implementation, this would trigger actual export
    console.log(`Exporting ICP analysis as ${format}`);
  }, [awardPoints]);

  // Render section content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-300 mb-4">
                Your Ideal Customer Profile Framework
              </h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed mb-4">
                  This comprehensive ICP analysis provides the foundation for all your customer 
                  targeting and sales activities. Based on data-driven insights and proven 
                  methodologies, this framework will significantly improve your prospecting efficiency.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Target Segments</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Mid-market SaaS companies (100-500 employees)</li>
                      <li>• Revenue range: $10M-$50M annually</li>
                      <li>• Technology-forward culture</li>
                      <li>• Rapid growth phase (20%+ YoY)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Key Indicators</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Experiencing scalability challenges</li>
                      <li>• Active digital transformation</li>
                      <li>• Budget allocated for technology</li>
                      <li>• Decision-maker accessibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h4 className="font-medium text-white mb-4">Professional Application</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl text-green-400 mb-2">85%</div>
                  <div className="text-sm text-gray-400">Qualification Accuracy</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl text-blue-400 mb-2">40%</div>
                  <div className="text-sm text-gray-400">Time Savings</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-2xl text-purple-400 mb-2">60%</div>
                  <div className="text-sm text-gray-400">Conversion Improvement</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rating-system':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Interactive Company Rating System
              </h3>
              <p className="text-gray-400 mb-6">
                Practice applying your ICP criteria by rating these sample companies. 
                Each rating helps refine your qualification instincts.
              </p>
              
              <div className="space-y-4">
                {sampleCompanies.map((company) => (
                  <CompanyRatingCard
                    key={company.id}
                    company={company}
                    currentRating={ratedCompanies.get(company.id)}
                    onRate={(rating) => handleCompanyRating(company.id, rating)}
                  />
                ))}
              </div>
              
              {ratedCompanies.size >= 3 && (
                <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-400">Professional Progress</span>
                  </div>
                  <p className="text-green-300 text-sm">
                    Excellent work! You've rated {ratedCompanies.size} companies. 
                    This systematic approach builds qualification expertise.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'buyer-personas':
        return (
          <div className="space-y-6">
            <PersonaDetailView />
          </div>
        );

      case 'who-to-avoid':
        return (
          <div className="space-y-6">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-red-300 mb-4">
                Disqualification Criteria
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                    Industry Red Flags
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Highly regulated industries with strict compliance requirements</li>
                    <li>• Traditional industries resistant to technology adoption</li>
                    <li>• Companies with recent major layoffs or financial instability</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-white mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                    Organizational Red Flags
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• No dedicated technology budget or IT decision maker</li>
                    <li>• History of failed technology implementations</li>
                    <li>• Excessive reliance on legacy systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'empathy-map':
        return (
          <div className="space-y-6">
            <EmpathyMapView />
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400">Select a section from the sidebar to continue</div>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`h-full w-full bg-gray-950 ${className}`}
        >
          {/* Modal Header */}
          <div className="bg-gray-900 border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
                
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    ICP Analysis Deep Dive
                  </h1>
                  <p className="text-sm text-gray-400">
                    Comprehensive customer intelligence framework
                  </p>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{totalPointsEarned}</div>
                  <div className="text-xs text-gray-500">Points Earned</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{viewedSections.size}/{sectionConfig.length}</div>
                  <div className="text-xs text-gray-500">Sections Viewed</div>
                </div>

                {/* Export Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Content - 80/20 Layout */}
          <div className={`flex h-full ${isMobile ? 'flex-col' : ''}`}>
            {/* Sidebar Navigation - 20% */}
            <div className={`${isMobile ? 'h-auto' : 'w-80 h-full'} bg-gray-900 border-r border-gray-800 overflow-y-auto`}>
              <div className="p-4">
                <h3 className="font-medium text-white mb-4">Navigation</h3>
                
                <div className="space-y-2">
                  {sectionConfig.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const isViewed = viewedSections.has(section.id);
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => handleSectionChange(section.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isActive ? 'bg-blue-900/50 border-blue-500/50' : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                            <span className={`font-medium ${isActive ? 'text-blue-300' : 'text-gray-300'}`}>
                              {section.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isViewed && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                            <span className="text-xs text-blue-400">+{section.points}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-1">{section.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{section.timeEstimate}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Achievement Summary */}
                {achievements.size > 0 && (
                  <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <h4 className="font-medium text-yellow-400 mb-2">Professional Achievements</h4>
                    <div className="space-y-1 text-sm text-yellow-300">
                      {achievements.has('first-steps') && <div>• First Steps (+10 points)</div>}
                      {achievements.has('content-explorer') && <div>• Content Explorer (+50 points)</div>}
                      {achievements.has('rating-master') && <div>• Rating Master (+50 points)</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content - 80% */}
            <div className={`${isMobile ? 'flex-1' : 'flex-1'} overflow-y-auto`}>
              <div className="p-6">
                {renderSectionContent()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Company Rating Card Component
const CompanyRatingCard = ({ company, currentRating, onRate }) => {
  const ratingOptions = [20, 40, 60, 80, 100];
  
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-white">{company.name}</h4>
          <p className="text-sm text-gray-400">{company.description}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <span>{company.industry}</span>
            <span>•</span>
            <span>{company.size}</span>
            <span>•</span>
            <span>{company.revenue}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-300">ICP Fit Score:</span>
        <div className="flex space-x-1">
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentRating === rating
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>
      
      {currentRating && (
        <div className="mt-2 text-xs text-green-400">
          ✓ Rated {currentRating}/100 - {currentRating >= 80 ? 'High Priority' : currentRating >= 60 ? 'Qualified' : 'Low Priority'}
        </div>
      )}
    </div>
  );
};

// Persona Detail View Component
const PersonaDetailView = () => (
  <div className="bg-gray-800 rounded-lg p-6">
    <h3 className="text-xl font-semibold text-white mb-6">Key Buyer Personas</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-white">Technical Decision Maker</h4>
            <p className="text-sm text-gray-400">CTO / VP Engineering</p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-400">Primary Concerns:</span>
            <ul className="text-gray-300 mt-1 space-y-1">
              <li>• Scalability and performance</li>
              <li>• Technical integration complexity</li>
              <li>• Security and compliance</li>
            </ul>
          </div>
          
          <div>
            <span className="text-gray-400">Communication Style:</span>
            <p className="text-gray-300 mt-1">Data-driven, technical depth, ROI-focused</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-white">Business Decision Maker</h4>
            <p className="text-sm text-gray-400">CEO / VP Operations</p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-400">Primary Concerns:</span>
            <ul className="text-gray-300 mt-1 space-y-1">
              <li>• Business impact and ROI</li>
              <li>• Implementation timeline</li>
              <li>• Team productivity gains</li>
            </ul>
          </div>
          
          <div>
            <span className="text-gray-400">Communication Style:</span>
            <p className="text-gray-300 mt-1">Business outcomes, strategic alignment, efficiency</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Empathy Map View Component
const EmpathyMapView = () => (
  <div className="bg-gray-800 rounded-lg p-6">
    <h3 className="text-xl font-semibold text-white mb-6">Customer Empathy Map</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-green-400 mb-3">What they THINK & FEEL</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Pressure to deliver results quickly</li>
            <li>• Concern about technology adoption</li>
            <li>• Excitement about growth opportunities</li>
            <li>• Anxiety about competitive threats</li>
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-yellow-400 mb-3">What they SEE</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Competitors moving faster</li>
            <li>• Technology success stories</li>
            <li>• Industry transformation</li>
            <li>• Customer expectations rising</li>
          </ul>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-blue-400 mb-3">What they SAY & DO</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Research multiple vendors</li>
            <li>• Seek stakeholder consensus</li>
            <li>• Request detailed ROI analysis</li>
            <li>• Prefer proven solutions</li>
          </ul>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-purple-400 mb-3">PAIN POINTS</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Limited time for evaluation</li>
            <li>• Budget approval complexity</li>
            <li>• Implementation disruption</li>
            <li>• Technology learning curve</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default ICPDetailModal;