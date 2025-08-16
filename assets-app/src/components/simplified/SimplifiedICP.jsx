import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target,
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Download,
  ChevronRight,
  Info,
  Lightbulb,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import { useUserIntelligence } from '../../contexts/simplified/UserIntelligenceContext';
import ICPFrameworkDisplay from '../tools/ICPFrameworkDisplay';

const SimplifiedICP = ({ customerId }) => {
  const navigate = useNavigate();
  const { assessment, milestone, usage, updateUsage } = useUserIntelligence();
  const [companyName, setCompanyName] = useState('');
  const [ratingResult, setRatingResult] = useState(null);
  const [isRating, setIsRating] = useState(false);
  const [icpFramework, setIcpFramework] = useState(null);
  const [activeSection, setActiveSection] = useState('framework');
  
  // Usage tracking refs
  const startTimeRef = useRef(Date.now());
  const clickCountRef = useRef(0);
  const sectionsViewedRef = useRef(new Set());

  // Track section views for usage assessment
  useEffect(() => {
    sectionsViewedRef.current.add(activeSection);
  }, [activeSection]);

  // Track clicks for engagement assessment
  const trackClick = useCallback((action) => {
    clickCountRef.current += 1;
    console.log('Usage tracked:', action, clickCountRef.current);
  }, []);

  // Track time spent on component unmount
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      updateUsage({
        icpTimeSpent: timeSpent,
        icpClicks: clickCountRef.current,
        icpSectionsViewed: sectionsViewedRef.current.size,
        icpProgress: ratingResult ? 100 : 50,
        lastICPAccess: Date.now()
      });
    };
  }, [ratingResult, updateUsage]);

  // Milestone-specific guidance
  const guidance = useMemo(() => {
    const guides = {
      foundation: {
        focus: 'Establish systematic buyer understanding frameworks',
        tip: 'Start with clear buyer personas and pain point identification',
        nextStep: 'Use these insights to improve value communication',
        depth: 'basic'
      },
      growth: {
        focus: 'Optimize buyer intelligence for scale and team training',
        tip: 'Refine personas for enterprise deals and competitive scenarios',
        nextStep: 'Apply insights to multi-stakeholder engagement strategies',
        depth: 'intermediate'
      },
      expansion: {
        focus: 'Advanced buyer intelligence for market expansion',
        tip: 'Develop sophisticated competitive positioning and market insights',
        nextStep: 'Use for strategic market penetration and Series B positioning',
        depth: 'advanced'
      }
    };
    
    return guides[milestone?.tier] || guides.foundation;
  }, [milestone]);

  // Handle company rating
  const handleRateCompany = useCallback(() => {
    if (!companyName.trim()) return;
    
    setIsRating(true);
    trackClick('rate_company');
    
    // Simulate rating calculation
    setTimeout(() => {
      // Calculate score based on framework weights
      const criteria = icpFramework || [
        { name: 'Company Size', weight: 25, score: 0 },
        { name: 'Technical Maturity', weight: 30, score: 0 },
        { name: 'Growth Stage', weight: 20, score: 0 },
        { name: 'Pain Point Severity', weight: 25, score: 0 }
      ];
      
      // Generate random scores for demo (in production, this would be calculated)
      const scoredCriteria = criteria.map(criterion => ({
        ...criterion,
        score: Math.floor(Math.random() * 30) + 70 // 70-100 range
      }));
      
      const overallScore = scoredCriteria.reduce((total, criterion) => {
        return total + (criterion.score * criterion.weight / 100);
      }, 0);
      
      const result = {
        companyName,
        overallScore: Math.round(overallScore),
        criteria: scoredCriteria,
        recommendation: overallScore >= 85 ? 'High Priority' : 
                       overallScore >= 70 ? 'Medium Priority' : 'Low Priority',
        insights: generateInsights(overallScore, scoredCriteria)
      };
      
      setRatingResult(result);
      setIsRating(false);
      
      // Update usage
      updateUsage({
        lastICPRating: Date.now(),
        icpProgress: 100,
        companiesRated: (usage?.companiesRated || 0) + 1
      });
    }, 1500);
  }, [companyName, icpFramework, trackClick, updateUsage, usage]);

  // Generate insights based on score
  const generateInsights = (score, criteria) => {
    const insights = [];
    
    if (score >= 85) {
      insights.push({
        type: 'success',
        message: 'Excellent ICP fit - prioritize for immediate engagement',
        icon: CheckCircle
      });
    }
    
    const lowestCriterion = criteria.reduce((min, c) => c.score < min.score ? c : min);
    if (lowestCriterion.score < 75) {
      insights.push({
        type: 'warning',
        message: `${lowestCriterion.name} needs improvement for optimal fit`,
        icon: AlertCircle
      });
    }
    
    insights.push({
      type: 'info',
      message: milestone?.tier === 'foundation' 
        ? 'Document this analysis for team training'
        : milestone?.tier === 'growth'
        ? 'Use for multi-stakeholder engagement strategy'
        : 'Apply to strategic account planning',
      icon: Lightbulb
    });
    
    return insights;
  };

  // Sample buyer personas based on milestone tier
  const buyerPersonas = useMemo(() => {
    const personas = {
      foundation: [
        {
          title: 'Technical Decision Maker',
          role: 'CTO / VP Engineering',
          priorities: ['Technical excellence', 'Scalability', 'Integration ease'],
          painPoints: ['Legacy system limitations', 'Technical debt', 'Resource constraints'],
          messaging: 'Focus on technical superiority and implementation efficiency'
        },
        {
          title: 'Business Stakeholder',
          role: 'CEO / COO',
          priorities: ['Revenue growth', 'Operational efficiency', 'Competitive advantage'],
          painPoints: ['Market pressure', 'Growth limitations', 'Process inefficiencies'],
          messaging: 'Emphasize business outcomes and ROI'
        }
      ],
      growth: [
        {
          title: 'Economic Buyer',
          role: 'CFO / VP Finance',
          priorities: ['Cost reduction', 'ROI maximization', 'Budget optimization'],
          painPoints: ['Budget constraints', 'Unclear ROI', 'Hidden costs'],
          messaging: 'Quantify financial impact and payback period'
        },
        {
          title: 'Champion',
          role: 'Director / Senior Manager',
          priorities: ['Team productivity', 'Career advancement', 'Departmental success'],
          painPoints: ['Team bottlenecks', 'Lack of resources', 'Performance pressure'],
          messaging: 'Show how solution enables their success'
        },
        {
          title: 'End User',
          role: 'Individual Contributor',
          priorities: ['Ease of use', 'Time savings', 'Better tools'],
          painPoints: ['Manual processes', 'Tool frustration', 'Productivity barriers'],
          messaging: 'Highlight user experience and efficiency gains'
        }
      ],
      expansion: [
        {
          title: 'Executive Sponsor',
          role: 'C-Suite Executive',
          priorities: ['Strategic initiatives', 'Market leadership', 'Board metrics'],
          painPoints: ['Competitive threats', 'Digital transformation', 'Investor pressure'],
          messaging: 'Position as strategic enabler for company vision'
        },
        {
          title: 'Procurement',
          role: 'Head of Procurement',
          priorities: ['Vendor consolidation', 'Risk mitigation', 'Contract terms'],
          painPoints: ['Vendor management', 'Compliance requirements', 'Cost control'],
          messaging: 'Demonstrate vendor excellence and partnership approach'
        },
        {
          title: 'Legal/Compliance',
          role: 'General Counsel / Compliance Officer',
          priorities: ['Risk reduction', 'Regulatory compliance', 'Data security'],
          painPoints: ['Security concerns', 'Regulatory changes', 'Audit requirements'],
          messaging: 'Address security, compliance, and risk mitigation'
        }
      ]
    };
    
    return personas[milestone?.tier] || personas.foundation;
  }, [milestone]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/customer/${customerId}/simplified/dashboard`)}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">ICP Analysis Tool</h1>
          <p className="text-gray-400">Systematic buyer understanding and targeting framework</p>
        </div>

        {/* Milestone Guidance */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-1">{milestone?.tier?.charAt(0).toUpperCase() + milestone?.tier?.slice(1)} Stage Guidance</p>
              <p className="text-gray-400 text-sm mb-2">{guidance.focus}</p>
              <p className="text-blue-400 text-sm">{guidance.tip}</p>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => {
              setActiveSection('framework');
              trackClick('view_framework');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'framework'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Scoring Framework
          </button>
          <button
            onClick={() => {
              setActiveSection('personas');
              trackClick('view_personas');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'personas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Buyer Personas
          </button>
          <button
            onClick={() => {
              setActiveSection('rate');
              trackClick('view_rating');
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeSection === 'rate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Rate Company
          </button>
        </div>

        {/* Main Content */}
        {activeSection === 'framework' && (
          <div className="space-y-6">
            <ICPFrameworkDisplay 
              customerData={{ icpFramework }}
              onFrameworkUpdate={(framework) => {
                setIcpFramework(framework);
                trackClick('update_framework');
              }}
            />
            
            {/* Quick Tips */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Implementation Tips
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-gray-300 text-sm">
                    Weight criteria based on your specific market and product fit
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-gray-300 text-sm">
                    Use historical win/loss data to validate scoring accuracy
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <p className="text-gray-300 text-sm">
                    Review and adjust quarterly based on market changes
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'personas' && (
          <div className="space-y-6">
            {buyerPersonas.map((persona, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{persona.title}</h3>
                    <p className="text-gray-400">{persona.role}</p>
                  </div>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Priorities</h4>
                    <ul className="space-y-1">
                      {persona.priorities.map((priority, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-gray-500 mt-0.5" />
                          {priority}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Pain Points</h4>
                    <ul className="space-y-1">
                      {persona.painPoints.map((pain, i) => (
                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-gray-500 mt-0.5" />
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Messaging</h4>
                    <p className="text-gray-300 text-sm">{persona.messaging}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Next Step */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-white font-medium">Next Step</p>
                  <p className="text-blue-400 text-sm">{guidance.nextStep}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'rate' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rate Company Fit</h3>
              
              {!ratingResult ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter company name to analyze"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <button
                    onClick={handleRateCompany}
                    disabled={!companyName.trim() || isRating}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isRating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Rate Company
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-800 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{ratingResult.overallScore}%</div>
                        <div className="text-sm text-gray-400">ICP Score</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{ratingResult.companyName}</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                      ratingResult.recommendation === 'High Priority' 
                        ? 'bg-green-900/30 text-green-400'
                        : ratingResult.recommendation === 'Medium Priority'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      <Star className="w-4 h-4" />
                      {ratingResult.recommendation}
                    </div>
                  </div>
                  
                  {/* Criteria Scores */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Scoring Breakdown</h4>
                    <div className="space-y-2">
                      {ratingResult.criteria.map((criterion, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">{criterion.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${criterion.score}%` }}
                              />
                            </div>
                            <span className="text-white text-sm font-medium w-12 text-right">
                              {criterion.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Insights */}
                  <div>
                    <h4 className="text-white font-medium mb-3">Key Insights</h4>
                    <div className="space-y-2">
                      {ratingResult.insights.map((insight, index) => (
                        <div key={index} className={`p-3 rounded-lg flex items-start gap-3 ${
                          insight.type === 'success' 
                            ? 'bg-green-900/20 border border-green-800'
                            : insight.type === 'warning'
                            ? 'bg-yellow-900/20 border border-yellow-800'
                            : 'bg-blue-900/20 border border-blue-800'
                        }`}>
                          <insight.icon className={`w-4 h-4 mt-0.5 ${
                            insight.type === 'success' 
                              ? 'text-green-400'
                              : insight.type === 'warning'
                              ? 'text-yellow-400'
                              : 'text-blue-400'
                          }`} />
                          <p className="text-gray-300 text-sm">{insight.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setRatingResult(null);
                        setCompanyName('');
                        trackClick('rate_another');
                      }}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Rate Another
                    </button>
                    <button
                      onClick={() => {
                        updateUsage({ lastICPExport: Date.now() });
                        trackClick('export_analysis');
                        alert('Analysis exported!');
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedICP;