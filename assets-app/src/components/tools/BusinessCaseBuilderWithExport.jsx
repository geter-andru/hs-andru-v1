// BusinessCaseBuilderWithExport.jsx - Enhanced Business Case Builder with Smart Export Capabilities

import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import AsyncErrorBoundary, { useAsyncError } from '../common/AsyncErrorBoundary';
import DashboardLayout from '../layout/DashboardLayout';
import SidebarSection from '../layout/SidebarSection';
import { MobileOptimizedCard } from '../layout/MobileOptimized';
import NavigationControls from '../navigation/NavigationControls';
import { PrimaryButton, SecondaryButton } from '../ui/ButtonComponents';
import SmartExportInterface from '../export/SmartExportInterface';
import useNavigation from '../../hooks/useNavigation';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const BusinessCaseBuilderWithExport = () => {
  const { onBusinessCaseReady } = useOutletContext() || {};
  const { throwError } = useAsyncError();
  const navigation = useNavigation(null, 'business-case');
  const [businessCaseData, setBusinessCaseData] = useState(null);
  const [customerAssets, setCustomerAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState('pilot');
  const [startTime, setStartTime] = useState(Date.now());
  const [isNavigating, setIsNavigating] = useState(false);
  const [showExportInterface, setShowExportInterface] = useState(false);
  const [userTools, setUserTools] = useState(['claude', 'hubspot', 'apollo']);
  const [formData, setFormData] = useState({
    // Executive Summary
    companyName: '',
    projectTitle: '',
    requestedAmount: '',
    expectedROI: '',
    
    // Problem Statement
    currentChallenges: '',
    businessImpact: '',
    urgencyFactors: '',
    
    // Proposed Solution
    solutionOverview: '',
    keyFeatures: '',
    implementationApproach: '',
    
    // Financial Projections
    currentStateCosts: '',
    solutionCosts: '',
    expectedSavings: '',
    paybackPeriod: '',
    
    // Risk Assessment
    implementationRisks: '',
    mitigationStrategies: '',
    
    // Success Metrics
    successMetrics: '',
    measurementPlan: '',
    timeline: ''
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [autoPopulated, setAutoPopulated] = useState(new Set());

  const session = authService.getCurrentSession();

  // Enhanced sidebar with export guidance
  const BusinessCaseSidebar = ({ usage }) => {
    return (
      <div className="space-y-6">
        <SidebarSection icon="💡" title="WHEN TO USE">
          <ul className="space-y-1">
            {usage.when.map((item, index) => (
              <li key={index} className="text-gray-300 text-sm">• {item}</li>
            ))}
          </ul>
        </SidebarSection>
        
        <SidebarSection icon="🎯" title="TARGET AUDIENCE">
          <ul className="space-y-1">
            {usage.audience.map((item, index) => (
              <li key={index} className="text-gray-300 text-sm">• {item}</li>
            ))}
          </ul>
        </SidebarSection>
        
        <SidebarSection icon="📋" title="PRESENTATION TIPS">
          <p className="text-gray-300 text-sm">"{usage.presentationTip}"</p>
        </SidebarSection>

        {/* Export Integration Guidance */}
        {formData.companyName && (
          <SidebarSection icon="🚀" title="AMPLIFY WITH YOUR TOOLS">
            <div className="space-y-3">
              <p className="text-gray-300 text-sm">
                Transform this business case into compelling assets for prospect engagement
              </p>
              <div className="flex flex-wrap gap-2">
                {userTools.map(tool => (
                  <span key={tool} className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">
                    {tool}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowExportInterface(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded transition-colors"
              >
                Export Business Intelligence →
              </button>
            </div>
          </SidebarSection>
        )}
        
        <SidebarSection icon="⚡" title="SUCCESS FACTORS">
          <ul className="space-y-1">
            {usage.successFactors.map((factor, index) => (
              <li key={index} className="text-gray-300 text-sm">• {factor}</li>
            ))}
          </ul>
        </SidebarSection>
      </div>
    );
  };

  // Enhanced export source data generation
  const generateExportSourceData = useCallback(() => {
    if (!formData.companyName || !businessCaseData || !customerAssets) return null;

    return {
      icpData: {
        buyerPersona: {
          name: 'Executive Decision Maker',
          role: 'C-Suite/VP Level',
          painPoints: ['budget optimization', 'competitive pressure', 'operational efficiency'],
          demographics: 'Enterprise companies, $50M+ revenue',
          decisionMaking: 'committee-based with financial validation',
          language: 'business and financial terminology',
          motivations: ['ROI maximization', 'risk mitigation', 'strategic advantage'],
          objections: ['budget constraints', 'implementation risk', 'timing concerns'],
          decisionCriteria: ['financial impact', 'risk assessment', 'implementation feasibility']
        },
        targetIndustries: ['Technology', 'Financial Services', 'Manufacturing'],
        companySize: { min: 500, max: 5000 },
        revenueRange: { 
          min: parseInt(formData.requestedAmount) * 50 || 50000000, 
          max: parseInt(formData.requestedAmount) * 200 || 200000000 
        }
      },
      costData: {
        impactCalculation: {
          methodology: 'Business case ROI analysis with risk-adjusted projections',
          results: `${formData.expectedROI || '250'}% ROI with ${formData.paybackPeriod || '8'} month payback`,
          categories: [
            { name: 'Current State Costs', value: formData.currentStateCosts },
            { name: 'Solution Investment', value: formData.solutionCosts },
            { name: 'Expected Savings', value: formData.expectedSavings }
          ],
          timeframe: 12,
          assumptions: {
            investmentAmount: parseInt(formData.requestedAmount) || 0,
            expectedROI: parseFloat(formData.expectedROI) || 0,
            paybackPeriod: parseInt(formData.paybackPeriod) || 8,
            riskAdjustment: 'Conservative estimates with 15% contingency'
          }
        },
        qualificationCriteria: [
          'Executive sponsorship confirmed',
          'Budget authority established',
          'Business case alignment verified',
          'Implementation timeline agreed'
        ]
      },
      businessCaseData: {
        framework: {
          executiveSummary: formData.projectTitle || 'Strategic business transformation initiative',
          financialJustification: `${formData.expectedROI || '250'}% ROI through ${formData.solutionOverview}`,
          riskAssessment: formData.implementationRisks || 'Comprehensive risk mitigation strategy included',
          valueProposition: formData.keyFeatures || 'Competitive advantage through strategic implementation',
          implementation: {
            template: activeTemplate,
            timeline: formData.timeline,
            approach: formData.implementationApproach,
            successMetrics: formData.successMetrics
          },
          problemStatement: {
            challenges: formData.currentChallenges,
            impact: formData.businessImpact,
            urgency: formData.urgencyFactors
          }
        }
      },
      assessmentData: {
        competencyAreas: ['Executive Alignment', 'Financial Planning', 'Implementation Strategy']
      }
    };
  }, [formData, businessCaseData, customerAssets, activeTemplate]);

  // Export completion handler
  const handleExportComplete = (exportResults) => {
    console.log('Business case export completed:', exportResults);
    
    // Create downloadable files
    exportResults.forEach(result => {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    setShowExportInterface(false);
  };

  // Navigation handlers
  const handleGoBack = () => {
    setIsNavigating(true);
    try {
      navigation.goBack();
    } catch (error) {
      console.error('Navigation back error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleGoHome = () => {
    setIsNavigating(true);
    try {
      navigation.goHome();
    } catch (error) {
      console.error('Navigation home error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleCompleteBusinessCase = () => {
    setIsNavigating(true);
    try {
      if (onBusinessCaseReady) {
        onBusinessCaseReady({
          selectedTemplate: activeTemplate,
          formData,
          hasCompleted: true,
          timeSpent: Date.now() - startTime
        });
      }
      navigation.goToPhase('results');
    } catch (error) {
      console.error('Business case completion error:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const templates = {
    pilot: {
      name: 'Pilot Program',
      description: 'Test implementation with limited scope',
      duration: '3-6 months'
    },
    fullDeployment: {
      name: 'Full Deployment',
      description: 'Enterprise-wide implementation',
      duration: '6-12 months'
    },
    expansion: {
      name: 'Expansion Phase',
      description: 'Scale existing successful pilot',
      duration: '4-8 months'
    }
  };

  useEffect(() => {
    const loadBusinessCaseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!session || !session.recordId || !session.accessToken) {
          throw new Error('No valid session found. Please check your access link.');
        }

        const customerAssetsData = await airtableService.getCustomerAssets(
          session.recordId,
          session.accessToken
        );
        setCustomerAssets(customerAssetsData);
        setBusinessCaseData(customerAssetsData.businessCaseContent);
        
        // Load saved progress
        const savedProgress = await airtableService.getUserProgress(
          session.customerId,
          'business_case_builder'
        );
        
        if (savedProgress && savedProgress.formData) {
          setFormData({ ...formData, ...savedProgress.formData });
          setActiveTemplate(savedProgress.activeTemplate || 'pilot');
        }
        
      } catch (err) {
        console.error('Failed to load business case data:', err);
        setError(err.message);
        if (err.message.includes('configuration') || err.message.includes('unauthorized')) {
          throwError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadBusinessCaseData();
    } else {
      setLoading(false);
      setError('No session available');
    }
  }, [session, throwError]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Remove from auto-populated set if user manually edits
    if (autoPopulated.has(field)) {
      setAutoPopulated(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  };

  const autoPopulateFields = async () => {
    if (!session || !formData.companyName?.trim() || !customerAssets) return;

    try {
      const companyName = formData.companyName.trim();
      const newFormData = { ...formData };
      const newAutoPopulated = new Set();
      
      const icpData = customerAssets.icpDescription || customerAssets.icpContent;
      const costData = customerAssets.costCalculatorContent;  
      const businessData = customerAssets.businessCaseContent;

      // Auto-populate key fields using customer assets
      if (!formData.projectTitle) {
        newFormData.projectTitle = `${companyName} Strategic Transformation Initiative`;
        newAutoPopulated.add('projectTitle');
      }

      if (!formData.currentChallenges && icpData?.segments) {
        let challenges = `${companyName} faces critical business challenges:\n\n`;
        challenges += "**Market Positioning Challenges:**\n";
        icpData.segments.slice(0, 2).forEach(segment => {
          if (segment.criteria) {
            challenges += segment.criteria.slice(0, 2).map(criterion => `• ${criterion}`).join('\n') + '\n';
          }
        });
        newFormData.currentChallenges = challenges.trim();
        newAutoPopulated.add('currentChallenges');
      }

      if (!formData.businessImpact) {
        let impact = `**Business Impact Assessment for ${companyName}:**\n\n`;
        if (icpData?.segments) {
          const topSegment = icpData.segments[0];
          impact += `**Market Segment Analysis:**\n`;
          impact += `• Primary fit: ${topSegment.name} (${topSegment.score}% alignment)\n`;
          if (topSegment.criteria) {
            impact += `• Key characteristics: ${topSegment.criteria.slice(0, 2).join(', ')}\n\n`;
          }
        }
        impact += `**Projected Business Benefits:**\n• Revenue growth acceleration: 15-25%\n• Operational efficiency gains: 20-35%\n• Market competitiveness improvement: High priority`;
        newFormData.businessImpact = impact;
        newAutoPopulated.add('businessImpact');
      }

      if (!formData.solutionOverview && businessData?.frameworks) {
        const framework = businessData.frameworks[0];
        let solution = `**Comprehensive Solution Framework for ${companyName}:**\n\n`;
        solution += `**${framework.name}:**\n${framework.description}\n\n`;
        if (framework.components) {
          solution += `**Core Components:**\n`;
          solution += framework.components.map(comp => `• ${comp}`).join('\n');
        }
        newFormData.solutionOverview = solution;
        newAutoPopulated.add('solutionOverview');
      }

      if (!formData.expectedROI) {
        const roi = costData?.scenarios ? 250 : 200;
        newFormData.expectedROI = `${roi}`;
        newAutoPopulated.add('expectedROI');
      }

      if (!formData.paybackPeriod) {
        const payback = businessData?.frameworks?.find(f => f.benchmark)?.benchmark || '8 months';
        newFormData.paybackPeriod = payback.includes('month') ? payback.replace(' months', '') : '8';
        newAutoPopulated.add('paybackPeriod');
      }

      setFormData(newFormData);
      setAutoPopulated(newAutoPopulated);

      console.log(`✅ Auto-populated ${newAutoPopulated.size} fields for ${companyName}`);

    } catch (error) {
      console.error('Error auto-populating fields:', error);
    }
  };

  const generateBusinessCase = () => {
    const template = templates[activeTemplate];
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <div class="business-case-document">
        <header class="document-header">
          <h1>Business Case: ${formData.projectTitle || 'Project Implementation'}</h1>
          <div class="document-meta">
            <p><strong>Company:</strong> ${formData.companyName}</p>
            <p><strong>Template:</strong> ${template.name}</p>
            <p><strong>Date:</strong> ${currentDate}</p>
            <p><strong>Requested Amount:</strong> $${formData.requestedAmount || '0'}</p>
          </div>
        </header>

        <section class="executive-summary">
          <h2>Executive Summary</h2>
          <p><strong>Project:</strong> ${formData.projectTitle}</p>
          <p><strong>Investment Required:</strong> $${formData.requestedAmount}</p>
          <p><strong>Expected ROI:</strong> ${formData.expectedROI}%</p>
          <p><strong>Payback Period:</strong> ${formData.paybackPeriod} months</p>
        </section>

        <section class="problem-statement">
          <h2>Problem Statement</h2>
          <h3>Current Challenges</h3>
          <p>${formData.currentChallenges || 'Current challenges to be defined'}</p>
          
          <h3>Business Impact</h3>
          <p>${formData.businessImpact || 'Business impact to be quantified'}</p>
          
          <h3>Urgency Factors</h3>
          <p>${formData.urgencyFactors || 'Urgency factors to be identified'}</p>
        </section>

        <section class="proposed-solution">
          <h2>Proposed Solution</h2>
          <h3>Solution Overview</h3>
          <p>${formData.solutionOverview || 'Solution overview to be provided'}</p>
          
          <h3>Key Features</h3>
          <p>${formData.keyFeatures || 'Key features to be listed'}</p>
          
          <h3>Implementation Approach</h3>
          <p>${formData.implementationApproach || 'Implementation approach to be detailed'}</p>
        </section>

        <section class="financial-analysis">
          <h2>Financial Analysis</h2>
          <h3>Current State Costs</h3>
          <p>${formData.currentStateCosts || 'Current state costs to be calculated'}</p>
          
          <h3>Solution Costs</h3>
          <p>${formData.solutionCosts || 'Solution costs to be itemized'}</p>
          
          <h3>Expected Savings</h3>
          <p>${formData.expectedSavings || 'Expected savings to be projected'}</p>
        </section>

        <section class="success-metrics">
          <h2>Success Metrics & Timeline</h2>
          <h3>Success Metrics</h3>
          <p>${formData.successMetrics || 'Success metrics to be defined'}</p>
          
          <h3>Implementation Timeline</h3>
          <p>${formData.timeline || template.duration}</p>
        </section>
      </div>
    `;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Business Case Builder</h1>
            <p className="text-gray-400">Create compelling pilot-to-contract business cases</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error && !businessCaseData) {
    return (
      <div className="space-y-6">
        <Callout type="error" title="Error Loading Business Case Data">
          {error}
        </Callout>
      </div>
    );
  }

  // Prepare sidebar content
  const sidebarContent = (
    <BusinessCaseSidebar 
      usage={{
        when: ["Executive presentations", "Budget approvals", "Stakeholder alignment"],
        audience: ["CEO", "CFO", "Board members", "VP Sales", "CTO"],
        presentationTip: "Focus on ROI and risk mitigation for executives",
        successFactors: [
          "Clear problem definition",
          "Quantified business impact", 
          "Realistic implementation plan",
          "Strong ROI justification"
        ]
      }}
    />
  );

  const exportSourceData = generateExportSourceData();

  return (
    <DashboardLayout 
      sidebarContent={sidebarContent} 
      currentPhase="business-case"
    >
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Business Case Builder
            {formData.companyName && (
              <span className="ml-3 text-sm bg-green-600 text-white px-3 py-1 rounded-full">
                Export Ready
              </span>
            )}
          </h1>
          
          {/* Business Case Summary */}
          {businessCaseData && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Framework Overview</h2>
              <ContentDisplay content={businessCaseData} />
            </div>
          )}
        </div>

        {/* Template Selection */}
        <MobileOptimizedCard title="Template Selection">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setActiveTemplate(key)}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  activeTemplate === key
                    ? 'border-green-500 bg-green-950 bg-opacity-30'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <h4 className="font-medium text-white">{template.name}</h4>
                <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                <p className="text-xs text-gray-500 mt-2">Duration: {template.duration}</p>
              </button>
            ))}
          </div>
        </MobileOptimizedCard>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Form Builder */}
          {!previewMode && (
            <div className="space-y-6">
              <MobileOptimizedCard title="Business Case Builder">
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">Executive Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            placeholder="Acme Corporation"
                          />
                          <SecondaryButton
                            onClick={autoPopulateFields}
                            disabled={!formData.companyName?.trim()}
                            className="whitespace-nowrap"
                            title="Auto-populate fields using analysis data"
                          >
                            Auto-fill
                          </SecondaryButton>
                        </div>
                        {autoPopulated.size > 0 && (
                          <p className="text-xs text-green-400 mt-1">
                            ✨ {autoPopulated.size} fields auto-populated
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                        <input
                          type="text"
                          value={formData.projectTitle}
                          onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          placeholder="Digital Transformation Initiative"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Requested Amount ($)</label>
                        <input
                          type="number"
                          value={formData.requestedAmount}
                          onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          placeholder="250000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Expected ROI (%)</label>
                        <input
                          type="number"
                          value={formData.expectedROI}
                          onChange={(e) => handleInputChange('expectedROI', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          placeholder="300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">Problem Statement</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Current Challenges</label>
                        <textarea
                          value={formData.currentChallenges}
                          onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                          placeholder="Describe the current challenges and pain points..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Business Impact</label>
                        <textarea
                          value={formData.businessImpact}
                          onChange={(e) => handleInputChange('businessImpact', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                          placeholder="Quantify the business impact of these challenges..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Solution Overview */}
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">Proposed Solution</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Solution Overview</label>
                      <textarea
                        value={formData.solutionOverview}
                        onChange={(e) => handleInputChange('solutionOverview', e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white h-20"
                        placeholder="Provide a high-level overview of the proposed solution..."
                      />
                    </div>
                  </div>

                  {/* Financial Analysis */}
                  <div>
                    <h3 className="text-md font-medium text-white mb-3">Financial Analysis</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Payback Period (months)</label>
                        <input
                          type="number"
                          value={formData.paybackPeriod}
                          onChange={(e) => handleInputChange('paybackPeriod', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </MobileOptimizedCard>
            </div>
          )}

          {/* Right Column: Preview or Export Interface */}
          <div className={`space-y-6 ${previewMode ? 'lg:col-span-2' : ''}`}>
            {previewMode ? (
              <MobileOptimizedCard title="Document Preview">
                <div 
                  className="prose prose-gray max-w-none text-gray-300"
                  dangerouslySetInnerHTML={{ __html: generateBusinessCase() }}
                />
              </MobileOptimizedCard>
            ) : (
              <MobileOptimizedCard title="Actions">
                <div className="space-y-4">
                  <SecondaryButton
                    onClick={() => setPreviewMode(!previewMode)}
                    className="w-full"
                  >
                    {previewMode ? 'Edit Mode' : 'Preview Document'}
                  </SecondaryButton>
                  
                  {formData.companyName && exportSourceData && (
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-sm font-medium text-white mb-3">Export Options</h4>
                      <div className="space-y-3">
                        <PrimaryButton
                          onClick={() => setShowExportInterface(true)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Export Business Intelligence →
                        </PrimaryButton>
                        <p className="text-xs text-gray-400">
                          Export to AI prompts, CRM fields, and sales automation tools
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </MobileOptimizedCard>
            )}
          </div>
        </div>

        {/* Export Interface */}
        {exportSourceData && (
          <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-500 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Business Intelligence Ready for Export
                </h3>
                <p className="text-green-200">
                  Transform this business case into compelling assets for executive engagement
                </p>
              </div>
            </div>
            
            {!showExportInterface ? (
              <div className="flex flex-wrap gap-3">
                <PrimaryButton
                  onClick={() => setShowExportInterface(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Export Business Intelligence →
                </PrimaryButton>
                <SecondaryButton
                  onClick={handleCompleteBusinessCase}
                  className="border-gray-500 text-gray-300 hover:border-gray-400"
                >
                  Complete Business Case
                </SecondaryButton>
              </div>
            ) : (
              <div className="mt-6">
                <SmartExportInterface
                  sourceData={exportSourceData}
                  contentType="business-case"
                  userTools={userTools}
                  onExport={handleExportComplete}
                  className="bg-gray-900 bg-opacity-50"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <NavigationControls
        currentPhase={navigation.currentPhase}
        onGoBack={handleGoBack}
        onGoHome={handleGoHome}
        onNextPhase={handleCompleteBusinessCase}
        canGoBack={true}
        nextLabel="Complete Business Case"
        disabled={isNavigating}
      />
    </DashboardLayout>
  );
};

const BusinessCaseBuilderWithExportAndErrorBoundary = (props) => (
  <AsyncErrorBoundary 
    fallbackMessage="Failed to load the Business Case Builder tool. This might be due to a configuration issue or temporary service disruption."
    onRetry={() => window.location.reload()}
  >
    <BusinessCaseBuilderWithExport {...props} />
  </AsyncErrorBoundary>
);

export default BusinessCaseBuilderWithExportAndErrorBoundary;