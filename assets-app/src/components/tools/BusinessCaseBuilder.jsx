import React, { useState, useEffect } from 'react';
import ContentDisplay, { Callout } from '../common/ContentDisplay';
import LoadingSpinner, { CardSkeleton } from '../common/LoadingSpinner';
import { airtableService } from '../../services/airtableService';
import { authService } from '../../services/authService';

const BusinessCaseBuilder = () => {
  const [businessCaseData, setBusinessCaseData] = useState(null);
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
        const customerAssets = await airtableService.getCustomerAssets(
          session.recordId,
          session.accessToken
        );
        setBusinessCaseData(customerAssets.businessCaseContent);
        
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
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="form-input"
                        placeholder="Acme Corporation"
                      />
                    </div>
                    <div>
                      <label className="form-label">Project Title</label>
                      <input
                        type="text"
                        value={formData.projectTitle}
                        onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                        className="form-input"
                        placeholder="Digital Transformation Initiative"
                      />
                    </div>
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
                    <div>
                      <label className="form-label">Expected ROI (%)</label>
                      <input
                        type="number"
                        value={formData.expectedROI}
                        onChange={(e) => handleInputChange('expectedROI', e.target.value)}
                        className="form-input"
                        placeholder="300"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem Statement */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Problem Statement</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Current Challenges</label>
                      <textarea
                        value={formData.currentChallenges}
                        onChange={(e) => handleInputChange('currentChallenges', e.target.value)}
                        className="form-input h-20"
                        placeholder="Describe the current challenges and pain points..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Business Impact</label>
                      <textarea
                        value={formData.businessImpact}
                        onChange={(e) => handleInputChange('businessImpact', e.target.value)}
                        className="form-input h-20"
                        placeholder="Quantify the business impact of these challenges..."
                      />
                    </div>
                    <div>
                      <label className="form-label">Urgency Factors</label>
                      <textarea
                        value={formData.urgencyFactors}
                        onChange={(e) => handleInputChange('urgencyFactors', e.target.value)}
                        className="form-input h-16"
                        placeholder="Why is this urgent? What happens if we don't act?"
                      />
                    </div>
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