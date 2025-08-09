import React, { useState, useEffect } from 'react';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const BusinessCaseBuilder = () => {
  const [businessCaseData, setBusinessCaseData] = useState(null);
  const [customerAssets, setCustomerAssets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState('pilot');
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
  const [autoPopulated, setAutoPopulated] = useState(new Set()); // Track which fields were auto-populated

  const session = authService.getCurrentSession();

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
        
        setError(null);
      } catch (err) {
        console.error('Failed to load business case data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadBusinessCaseData();
    }
  }, [session?.recordId, session?.customerId]); // Only re-run if these specific values change

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

  // Auto-populate fields using structured business content sections from Customer Assets
  const autoPopulateFields = async () => {
    if (!session || !formData.companyName?.trim() || !customerAssets) return;

    try {
      console.log('🔍 Auto-populate Debug:');
      console.log('Customer Assets:', customerAssets);

      const companyName = formData.companyName.trim();
      const newFormData = { ...formData };
      const newAutoPopulated = new Set();
      
      const icpData = customerAssets.icpDescription || customerAssets.icpContent;
      const costData = customerAssets.costCalculatorContent;  
      const businessData = customerAssets.businessCaseContent;

      console.log('📊 ICP Data:', icpData);
      console.log('💰 Cost Data:', costData);
      console.log('📋 Business Data:', businessData);

      // === PROBLEM STATEMENT SECTION ===
      
      // Current Challenges: ICP Business Characteristics + Cost Risk Categories + Business Case Challenges
      if (!formData.currentChallenges) {
        let challenges = `${companyName} faces critical business challenges:\n\n`;
        
        // From ICP Analysis: Business pain points and decision-making challenges
        if (icpData?.segments) {
          challenges += "**Market Positioning Challenges:**\n";
          icpData.segments.slice(0, 2).forEach(segment => {
            if (segment.criteria) {
              challenges += segment.criteria.slice(0, 2).map(criterion => `• ${criterion}`).join('\n') + '\n';
            }
          });
          challenges += '\n';
        }
        
        // From Cost Calculator: Risk Categories and operational inefficiencies  
        if (costData?.categories) {
          challenges += "**Operational Risk Areas:**\n";
          costData.categories.slice(0, 3).forEach(category => {
            challenges += `• ${category.name}: ${category.description}\n`;
          });
          challenges += '\n';
        }
        
        // From Business Case: Specific stakeholder problems
        if (businessData?.templates) {
          const template = businessData.templates[0];
          if (template?.keyPoints) {
            challenges += "**Strategic Challenges:**\n";
            challenges += template.keyPoints.slice(0, 2).map(point => `• ${point}`).join('\n');
          }
        }
        
        newFormData.currentChallenges = challenges.trim();
        newAutoPopulated.add('currentChallenges');
      }

      // Business Impact: ICP Demographics + Firmographics + Cost Calculator Operational Impact
      if (!formData.businessImpact) {
        let impact = `**Business Impact Assessment for ${companyName}:**\n\n`;
        
        // From ICP Analysis: Company size, revenue, growth stage pressures
        if (icpData?.segments) {
          const topSegment = icpData.segments[0];
          impact += `**Market Segment Analysis:**\n`;
          impact += `• Primary fit: ${topSegment.name} (${topSegment.score}% alignment)\n`;
          if (topSegment.criteria) {
            impact += `• Key characteristics: ${topSegment.criteria.slice(0, 2).join(', ')}\n\n`;
          }
        }
        
        // From Cost Calculator: Operational efficiency impact
        if (costData?.defaultValues) {
          impact += `**Financial Impact Scope:**\n`;
          impact += `• Average deal size impact: $${(costData.defaultValues.averageDealSize || 25000).toLocaleString()}\n`;
          impact += `• Conversion rate effects: ${((costData.defaultValues.conversionRate || 0.15) * 100).toFixed(0)}% efficiency factor\n`;
          impact += `• Operational scale: ${costData.defaultValues.inefficiencyRate ? (costData.defaultValues.inefficiencyRate * 100).toFixed(0) + '% current inefficiency' : 'Significant process optimization potential'}\n\n`;
        }
        
        impact += `**Projected Business Benefits:**\n• Revenue growth acceleration: 15-25%\n• Operational efficiency gains: 20-35%\n• Market competitiveness improvement: High priority`;
        
        newFormData.businessImpact = impact;
        newAutoPopulated.add('businessImpact');
      }

      // Urgency Factors: Cost Calculator Compounding Effects + Business Case "Why Now" + ICP Urgency
      if (!formData.urgencyFactors) {
        let urgency = `**Why ${companyName} Must Act Now:**\n\n`;
        
        // From Cost Calculator: Compounding effects timeline
        if (costData?.scenarios) {
          urgency += `**Cost of Delay Analysis:**\n`;
          costData.scenarios.forEach(scenario => {
            urgency += `• ${scenario.name} scenario: ${scenario.multiplier}x impact multiplier\n`;
          });
          urgency += '\n';
        }
        
        // From ICP Analysis: Purchase decision urgency factors
        if (icpData?.keyIndicators) {
          urgency += `**Market Timing Factors:**\n`;
          urgency += icpData.keyIndicators.slice(0, 3).map(indicator => `• ${indicator}`).join('\n') + '\n\n';
        }
        
        urgency += `**Competitive Risk Timeline:**\n• 3-month delay: 15% competitive disadvantage\n• 6-month delay: 35% market position erosion\n• 12-month delay: Significant competitive displacement risk`;
        
        newFormData.urgencyFactors = urgency;
        newAutoPopulated.add('urgencyFactors');
      }

      // === SOLUTION SECTIONS ===
      
      // Solution Overview: Business Case Approach + ICP Strategic Fit
      if (!formData.solutionOverview) {
        let solution = `**Comprehensive Solution Framework for ${companyName}:**\n\n`;
        
        // From Business Case: Approach & differentiation
        if (businessData?.frameworks) {
          const framework = businessData.frameworks[0];
          solution += `**${framework.name}:**\n${framework.description}\n\n`;
          if (framework.components) {
            solution += `**Core Components:**\n`;
            solution += framework.components.map(comp => `• ${comp}`).join('\n') + '\n\n';
          }
        }
        
        // From ICP: Strategic fit analysis
        if (icpData?.ratingCriteria) {
          solution += `**Strategic Alignment:**\n`;
          icpData.ratingCriteria.slice(0, 2).forEach(criterion => {
            solution += `• ${criterion.name} (${criterion.weight}% weight): ${criterion.description}\n`;
          });
        }
        
        newFormData.solutionOverview = solution;
        newAutoPopulated.add('solutionOverview');
      }

      // Key Features: Business Case 3-Phase Framework + ICP Competitive Analysis
      if (!formData.keyFeatures) {
        let features = `**Solution Key Features & Differentiators:**\n\n`;
        
        // From Business Case: Technical advantages and capabilities
        if (businessData?.templates) {
          const template = businessData.templates.find(t => t.name.includes('Full Implementation')) || businessData.templates[0];
          features += `**Implementation Capabilities:**\n`;
          if (template.sections) {
            features += template.sections.slice(0, 4).map(section => `• ${section}`).join('\n') + '\n\n';
          }
        }
        
        // From ICP: Competitive differentiation
        if (icpData?.segments) {
          features += `**Competitive Advantages:**\n`;
          features += `• Targeted solution for ${icpData.segments[0]?.name || 'enterprise'} segment\n`;
          features += `• Proven framework addressing specific market needs\n`;
          features += `• Scalable implementation approach\n`;
        }
        
        newFormData.keyFeatures = features;
        newAutoPopulated.add('keyFeatures');
      }

      // Implementation Approach: Business Case Implementation + ICP Guidelines  
      if (!formData.implementationApproach) {
        let implementation = `**${companyName} Implementation Strategy:**\n\n`;
        
        // From Business Case: Timeline & milestones, resource needs
        if (businessData?.templates) {
          const template = businessData.templates[0];
          implementation += `**${template.name} Approach:**\n`;
          implementation += `• Duration: ${template.duration}\n`;
          implementation += `• Investment Range: ${template.investment}\n\n`;
          
          if (template.sections) {
            implementation += `**Implementation Phases:**\n`;
            template.sections.forEach((section, index) => {
              implementation += `• Phase ${index + 1}: ${section}\n`;
            });
            implementation += '\n';
          }
        }
        
        implementation += `**Resource Requirements:**\n• Dedicated project team: 3-5 members\n• Executive sponsor: Required\n• Technical integration: 2-4 weeks\n• User training: Ongoing support included`;
        
        newFormData.implementationApproach = implementation;
        newAutoPopulated.add('implementationApproach');
      }

      // === FINANCIAL & SUCCESS SECTIONS ===
      
      // Current State Costs: Cost Calculator categories and calculations
      if (!formData.currentStateCosts) {
        let costs = '';
        if (costData?.defaultValues) {
          const avgDeal = costData.defaultValues.averageDealSize || 25000;
          const inefficiency = costData.defaultValues.inefficiencyRate || 0.12;
          const annualCost = Math.round(avgDeal * 50 * (1 + inefficiency));
          costs = `$${annualCost.toLocaleString()} annually in operational inefficiencies, missed opportunities, and productivity losses`;
        } else {
          costs = `$1,250,000 annually in operational inefficiencies and missed revenue opportunities`;
        }
        newFormData.currentStateCosts = costs;
        newAutoPopulated.add('currentStateCosts');
      }

      // Expected Savings: Cost Calculator ROI calculations
      if (!formData.expectedSavings) {
        let savings = '';
        if (costData?.defaultValues) {
          const avgDeal = costData.defaultValues.averageDealSize || 25000;
          const conversion = costData.defaultValues.conversionRate || 0.15;
          const annualSavings = Math.round(avgDeal * conversion * 60);
          savings = `$${annualSavings.toLocaleString()} in annual savings through efficiency gains, revenue optimization, and process improvements`;
        } else {
          savings = `$875,000 in annual savings through efficiency gains and revenue optimization`;
        }
        newFormData.expectedSavings = savings;
        newAutoPopulated.add('expectedSavings');
      }

      // Solution Costs: Business Case investment framework
      if (!formData.solutionCosts) {
        let solutionCost = '';
        if (businessData?.templates) {
          const template = businessData.templates[0];
          solutionCost = `${template.investment} total implementation investment`;
        } else if (costData?.defaultValues) {
          const avgDeal = costData.defaultValues.averageDealSize || 25000;
          const cost = Math.round(avgDeal * 2);
          solutionCost = `$${cost.toLocaleString()} total implementation investment`;
        } else {
          solutionCost = `$75,000 total implementation investment`;
        }
        newFormData.solutionCosts = solutionCost;
        newAutoPopulated.add('solutionCosts');
      }

      // Success Metrics: Business Case ROI + Cost Calculator scenarios + ICP validation
      if (!formData.successMetrics) {
        let metrics = `**${companyName} Success Metrics & KPIs:**\n\n`;
        
        // From Business Case: Impact table with current vs target states
        if (businessData?.successMetrics) {
          businessData.successMetrics.forEach(category => {
            metrics += `**${category.category} Metrics:**\n`;
            category.metrics.slice(0, 3).forEach(metric => {
              metrics += `• ${metric}\n`;
            });
            metrics += '\n';
          });
        } else {
          metrics += `**Financial Metrics:**\n• Revenue growth: 20-30%\n• Cost reduction: 25-40%\n• ROI achievement: 6-12 months\n\n`;
          metrics += `**Operational Metrics:**\n• Process efficiency: 35% improvement\n• Error reduction: 50% decrease\n• User adoption: 90%+ within 90 days\n\n`;
        }
        
        // From ICP: Success indicators and validation criteria
        metrics += `**Strategic Success Indicators:**\n• Market position strengthening\n• Competitive advantage realization\n• Scalability foundation established`;
        
        newFormData.successMetrics = metrics;
        newAutoPopulated.add('successMetrics');
      }

      // Timeline: Business Case milestones + Cost Calculator projections
      if (!formData.timeline) {
        let timeline = `**${companyName} Implementation Timeline:**\n\n`;
        
        if (businessData?.templates) {
          const template = businessData.templates[0];
          timeline += `**${template.duration} Implementation Schedule:**\n\n`;
        }
        
        timeline += `**Month 1: Foundation Phase**\n• Requirements gathering and validation\n• Team formation and kick-off\n• Initial system configuration\n\n`;
        timeline += `**Months 2-3: Implementation Phase**\n• Core system deployment\n• Integration and testing\n• User training program launch\n\n`;
        timeline += `**Months 4-6: Optimization Phase**\n• Performance monitoring and tuning\n• Full user adoption\n• Success metrics achievement\n• Ongoing support transition`;
        
        newFormData.timeline = timeline;
        newAutoPopulated.add('timeline');
      }

      // Project Title
      if (!formData.projectTitle) {
        newFormData.projectTitle = `${companyName} Strategic Transformation Initiative`;
        newAutoPopulated.add('projectTitle');
      }

      // Expected ROI and Payback Period
      if (!formData.expectedROI) {
        const roi = costData?.scenarios ? 250 : 200;
        newFormData.expectedROI = `${roi}% annual ROI based on comprehensive impact analysis`;
        newAutoPopulated.add('expectedROI');
      }

      if (!formData.paybackPeriod) {
        const payback = businessData?.frameworks?.find(f => f.benchmark)?.benchmark || '8 months';
        newFormData.paybackPeriod = payback.includes('month') ? payback : `${payback} estimated payback period`;
        newAutoPopulated.add('paybackPeriod');
      }

      // Update form data and auto-populated tracking
      setFormData(newFormData);
      setAutoPopulated(newAutoPopulated);

      console.log(`✅ Auto-populated ${newAutoPopulated.size} fields for ${companyName} using structured business content`);

    } catch (error) {
      console.error('Error auto-populating fields:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await airtableService.saveUserProgress(
        session.customerId,
        'business_case_builder',
        { formData, activeTemplate }
      );
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (session && formData.companyName) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, activeTemplate, session]);

  // Helper function to render form fields with auto-population indicators
  const renderFormField = (field, label, placeholder, type = 'text', isTextarea = false) => {
    const isAutoPopulated = autoPopulated.has(field);
    const baseClassName = isTextarea ? 'form-textarea' : 'form-input';
    const className = isAutoPopulated 
      ? `${baseClassName} border-blue-200 bg-blue-50` 
      : baseClassName;

    return (
      <div>
        <label className="form-label flex items-center gap-1">
          {label}
          {isAutoPopulated && (
            <span className="text-blue-500" title="Auto-populated from analysis data">
              ✨
            </span>
          )}
        </label>
        {isTextarea ? (
          <textarea
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={className}
            placeholder={placeholder}
            rows={4}
          />
        ) : (
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={className}
            placeholder={placeholder}
          />
        )}
      </div>
    );
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

        <section class="risk-assessment">
          <h2>Risk Assessment & Mitigation</h2>
          <h3>Implementation Risks</h3>
          <p>${formData.implementationRisks || 'Implementation risks to be identified'}</p>
          
          <h3>Mitigation Strategies</h3>
          <p>${formData.mitigationStrategies || 'Mitigation strategies to be developed'}</p>
        </section>

        <section class="success-metrics">
          <h2>Success Metrics & Timeline</h2>
          <h3>Success Metrics</h3>
          <p>${formData.successMetrics || 'Success metrics to be defined'}</p>
          
          <h3>Measurement Plan</h3>
          <p>${formData.measurementPlan || 'Measurement plan to be established'}</p>
          
          <h3>Implementation Timeline</h3>
          <p>${formData.timeline || template.duration}</p>
        </section>
      </div>
    `;
  };

  const exportDocument = async (format = 'html') => {
    const businessCaseHtml = generateBusinessCase();
    
    if (format === 'html') {
      const blob = new Blob([businessCaseHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `business-case-${formData.companyName || 'document'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    // Save export action
    await airtableService.saveUserProgress(
      session.customerId,
      'business_case_export',
      { exportDate: new Date().toISOString(), format, formData }
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Case Builder</h1>
            <p className="text-gray-600">Create compelling pilot-to-contract business cases</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Business Case Builder</h1>
        <Callout type="error" title="Error Loading Business Case Data">
          {error}
        </Callout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Case Builder</h1>
          <p className="text-gray-600">Create compelling business cases for pilot programs and full deployments</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn btn-secondary"
          >
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
          <button
            onClick={() => exportDocument('html')}
            className="btn btn-primary"
            disabled={!formData.companyName}
          >
            Export Document
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="card p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Template Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(templates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setActiveTemplate(key)}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                activeTemplate === key
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <p className="text-xs text-gray-500 mt-2">Duration: {template.duration}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column: Framework Guide */}
        {!previewMode && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Framework Guide</h2>
              {businessCaseData ? (
                <ContentDisplay content={businessCaseData} />
              ) : (
                <p className="text-gray-500">No framework guide data available</p>
              )}
            </div>
          </div>
        )}

        {/* Right Column: Form Builder or Preview */}
        <div className={`space-y-6 ${previewMode ? 'lg:col-span-2' : ''}`}>
          {previewMode ? (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Preview</h2>
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: generateBusinessCase() }}
              />
            </div>
          ) : (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Case Builder</h2>
              
              <div className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Executive Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Company Name</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="form-input flex-1"
                          placeholder="Acme Corporation"
                        />
                        <button
                          type="button"
                          onClick={autoPopulateFields}
                          disabled={!formData.companyName?.trim()}
                          className="btn btn-secondary whitespace-nowrap"
                          title="Auto-populate fields using data from ICP and Cost Calculator analysis"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Auto-fill
                        </button>
                      </div>
                      {autoPopulated.size > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          ✨ {autoPopulated.size} fields auto-populated from your analysis data
                        </p>
                      )}
                    </div>
                    {renderFormField('projectTitle', 'Project Title', 'Digital Transformation Initiative')}
                    <div>
                      <label className="form-label">Requested Amount ($)</label>
                      <input
                        type="number"
                        value={formData.requestedAmount}
                        onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                        className="form-input"
                        placeholder="250000"
                      />
                    </div>
                    {renderFormField('expectedROI', 'Expected ROI (%)', '300', 'number')}
                  </div>
                </div>

                {/* Problem Statement */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Problem Statement</h3>
                  <div className="space-y-4">
                    {renderFormField('currentChallenges', 'Current Challenges', 'Describe the current challenges and pain points...', 'text', true)}
                    {renderFormField('businessImpact', 'Business Impact', 'Quantify the business impact of these challenges...', 'text', true)}
                    {renderFormField('urgencyFactors', 'Urgency Factors', 'Why is this urgent? What happens if we don\'t act?', 'text', true)}
                  </div>
                </div>

                {/* Proposed Solution */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Proposed Solution</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Solution Overview</label>
                      <textarea
                        value={formData.solutionOverview}
                        onChange={(e) => handleInputChange('solutionOverview', e.target.value)}
                        className="form-input h-20"
                        placeholder="Provide a high-level overview of the proposed solution..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Key Features</label>
                      <textarea
                        value={formData.keyFeatures}
                        onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                        className="form-input h-20"
                        placeholder="List the key features and capabilities..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Implementation Approach</label>
                      <textarea
                        value={formData.implementationApproach}
                        onChange={(e) => handleInputChange('implementationApproach', e.target.value)}
                        className="form-input h-20"
                        placeholder="Describe how the solution will be implemented..."
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Analysis */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Financial Analysis</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Current State Costs ($)</label>
                        <input
                          type="number"
                          value={formData.currentStateCosts}
                          onChange={(e) => handleInputChange('currentStateCosts', e.target.value)}
                          className="form-input"
                          placeholder="500000"
                        />
                      </div>
                      <div>
                        <label className="form-label">Solution Costs ($)</label>
                        <input
                          type="number"
                          value={formData.solutionCosts}
                          onChange={(e) => handleInputChange('solutionCosts', e.target.value)}
                          className="form-input"
                          placeholder="250000"
                        />
                      </div>
                      <div>
                        <label className="form-label">Expected Annual Savings ($)</label>
                        <input
                          type="number"
                          value={formData.expectedSavings}
                          onChange={(e) => handleInputChange('expectedSavings', e.target.value)}
                          className="form-input"
                          placeholder="750000"
                        />
                      </div>
                      <div>
                        <label className="form-label">Payback Period (months)</label>
                        <input
                          type="number"
                          value={formData.paybackPeriod}
                          onChange={(e) => handleInputChange('paybackPeriod', e.target.value)}
                          className="form-input"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Metrics */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Success Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Success Metrics</label>
                      <textarea
                        value={formData.successMetrics}
                        onChange={(e) => handleInputChange('successMetrics', e.target.value)}
                        className="form-input h-16"
                        placeholder="How will success be measured? List specific KPIs..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Timeline</label>
                      <textarea
                        value={formData.timeline}
                        onChange={(e) => handleInputChange('timeline', e.target.value)}
                        className="form-input h-16"
                        placeholder="Provide implementation timeline and key milestones..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCaseBuilder;