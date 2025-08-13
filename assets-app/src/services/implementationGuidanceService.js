/**
 * Implementation Guidance Service
 * 
 * Bridges business intelligence insights to actionable sales execution
 * by providing contextual guidance, progress tracking, and recommendations.
 */

export const implementationGuidanceService = {
  /**
   * Get contextual guidance based on current tool and user progress
   */
  getContextualGuidance(toolName, userProgress, customerData) {
    const guidanceMap = {
      'icp-analysis': this.getICPGuidance(userProgress, customerData),
      'cost-calculator': this.getCostCalculatorGuidance(userProgress, customerData),
      'business-case': this.getBusinessCaseGuidance(userProgress, customerData),
      'welcome': this.getWelcomeGuidance(userProgress, customerData)
    };

    return guidanceMap[toolName] || this.getDefaultGuidance();
  },

  /**
   * ICP Analysis Implementation Guidance
   */
  getICPGuidance(progress, customerData) {
    const completionLevel = progress?.icp_complete ? 'completed' : 
                           progress?.icp_progress > 50 ? 'advanced' : 'beginner';

    const guidance = {
      beginner: {
        currentStep: 'Understanding Your Ideal Customer',
        nextActions: [
          {
            priority: 'high',
            action: 'Complete company firmographics assessment',
            reason: 'Foundation for all customer targeting',
            timeEstimate: '5 minutes',
            businessImpact: 'Identify high-value prospect characteristics'
          },
          {
            priority: 'high',
            action: 'Define key pain points and goals',
            reason: 'Align your solution to customer needs',
            timeEstimate: '3 minutes',
            businessImpact: 'Improve messaging resonance by 40%'
          },
          {
            priority: 'medium',
            action: 'Score your first prospect',
            reason: 'Practice applying the framework',
            timeEstimate: '2 minutes',
            businessImpact: 'Validate qualification criteria'
          }
        ],
        tips: [
          'Focus on customers who have already succeeded with your solution',
          'Look for patterns in your best customer relationships',
          'Consider both technical and business stakeholders'
        ],
        salesExecution: {
          immediate: 'Use the scoring criteria in your next discovery call',
          thisWeek: 'Apply ICP filters to your current pipeline',
          thisMonth: 'Refine targeting based on conversion data'
        }
      },
      advanced: {
        currentStep: 'Refining Customer Intelligence',
        nextActions: [
          {
            priority: 'high',
            action: 'Validate scoring with recent wins/losses',
            reason: 'Ensure accuracy of qualification criteria',
            timeEstimate: '10 minutes',
            businessImpact: 'Increase close rates by 25%'
          },
          {
            priority: 'medium',
            action: 'Create persona-specific messaging',
            reason: 'Improve engagement with different stakeholders',
            timeEstimate: '15 minutes',
            businessImpact: 'Reduce sales cycle by 20%'
          }
        ],
        tips: [
          'Compare scores of won vs lost deals',
          'Interview recent customers about their buying process',
          'Document technical vs business buyer differences'
        ],
        salesExecution: {
          immediate: 'Update CRM with ICP scores for all prospects',
          thisWeek: 'Train team on new qualification criteria',
          thisMonth: 'Implement automated lead scoring'
        }
      },
      completed: {
        currentStep: 'Optimizing Customer Acquisition',
        nextActions: [
          {
            priority: 'high',
            action: 'Move to Cost Calculator',
            reason: 'Quantify value for qualified prospects',
            timeEstimate: '10 minutes',
            businessImpact: 'Build compelling business case'
          },
          {
            priority: 'medium',
            action: 'Share ICP with marketing team',
            reason: 'Align demand generation efforts',
            timeEstimate: '30 minutes',
            businessImpact: 'Improve lead quality by 40%'
          }
        ],
        tips: [
          'Use ICP scores to prioritize outreach',
          'Create different talk tracks for each persona',
          'Track conversion rates by ICP segment'
        ],
        salesExecution: {
          immediate: 'Prioritize high-score prospects for immediate outreach',
          thisWeek: 'Develop ICP-specific sales materials',
          thisMonth: 'Measure pipeline velocity by ICP segment'
        }
      }
    };

    return guidance[completionLevel];
  },

  /**
   * Cost Calculator Implementation Guidance
   */
  getCostCalculatorGuidance(progress, customerData) {
    const hasICPComplete = progress?.icp_complete || false;
    const costProgress = progress?.cost_progress || 0;

    return {
      currentStep: 'Quantifying Business Impact',
      prerequisiteCheck: {
        hasICP: hasICPComplete,
        message: hasICPComplete ? 
          'ICP complete - calculations will be more accurate' : 
          'Complete ICP first for targeted value propositions'
      },
      nextActions: [
        {
          priority: 'high',
          action: 'Input prospect-specific parameters',
          reason: 'Personalized impact resonates 3x better',
          timeEstimate: '5 minutes',
          businessImpact: 'Create urgency with specific numbers'
        },
        {
          priority: 'high',
          action: 'Calculate cost of inaction',
          reason: 'Loss aversion drives decisions',
          timeEstimate: '3 minutes',
          businessImpact: 'Accelerate decision timeline by 30%'
        },
        {
          priority: 'medium',
          action: 'Generate competitive comparison',
          reason: 'Position against alternatives',
          timeEstimate: '5 minutes',
          businessImpact: 'Justify premium pricing'
        }
      ],
      tips: [
        'Use conservative estimates to maintain credibility',
        'Focus on costs the prospect already acknowledges',
        'Include both hard costs and opportunity costs'
      ],
      salesExecution: {
        immediate: 'Share cost analysis in next prospect meeting',
        thisWeek: 'Create cost templates for common scenarios',
        thisMonth: 'Track which costs resonate most with buyers'
      },
      talkingPoints: [
        'Every month of delay costs you $[X] in [specific area]',
        'Companies like yours typically see [Y]% improvement',
        'The investment pays for itself in [Z] months'
      ]
    };
  },

  /**
   * Business Case Implementation Guidance
   */
  getBusinessCaseGuidance(progress, customerData) {
    const hasPrerequisites = progress?.icp_complete && progress?.cost_complete;
    
    return {
      currentStep: 'Building Executive Consensus',
      prerequisiteCheck: {
        ready: hasPrerequisites,
        message: hasPrerequisites ? 
          'All data ready - create compelling business case' : 
          'Complete ICP and Cost Calculator first for comprehensive case'
      },
      nextActions: [
        {
          priority: 'high',
          action: 'Select appropriate template',
          reason: 'Match format to decision-making process',
          timeEstimate: '2 minutes',
          businessImpact: 'Align with internal approval requirements'
        },
        {
          priority: 'high',
          action: 'Customize for specific stakeholders',
          reason: 'Different stakeholders have different priorities',
          timeEstimate: '10 minutes',
          businessImpact: 'Increase stakeholder buy-in by 50%'
        },
        {
          priority: 'high',
          action: 'Define success metrics',
          reason: 'Clear KPIs enable decision making',
          timeEstimate: '5 minutes',
          businessImpact: 'Facilitate approval process'
        }
      ],
      tips: [
        'Lead with the business impact, not the solution',
        'Include risk mitigation strategies',
        'Provide multiple investment options (good, better, best)'
      ],
      salesExecution: {
        immediate: 'Schedule stakeholder review meeting',
        thisWeek: 'Prepare executive presentation',
        thisMonth: 'Track business case to closure'
      },
      stakeholderGuide: {
        'Technical Stakeholder': [
          'Focus on implementation feasibility',
          'Address integration concerns',
          'Highlight technical advantages'
        ],
        'Financial Stakeholder': [
          'Lead with ROI and payback period',
          'Show conservative projections',
          'Include sensitivity analysis'
        ],
        'Executive Stakeholder': [
          'Connect to strategic initiatives',
          'Show competitive advantages',
          'Demonstrate risk mitigation'
        ]
      }
    };
  },

  /**
   * Welcome/Overview Guidance
   */
  getWelcomeGuidance(progress, customerData) {
    const toolsCompleted = [
      progress?.icp_complete,
      progress?.cost_complete,
      progress?.business_case_complete
    ].filter(Boolean).length;

    return {
      currentStep: 'Revenue Intelligence Journey',
      progressSummary: {
        completed: toolsCompleted,
        total: 3,
        nextTool: !progress?.icp_complete ? 'icp-analysis' : 
                  !progress?.cost_complete ? 'cost-calculator' : 
                  !progress?.business_case_complete ? 'business-case' : 'results'
      },
      nextActions: [
        {
          priority: 'high',
          action: toolsCompleted === 0 ? 'Start with ICP Analysis' :
                  toolsCompleted === 1 ? 'Continue to Cost Calculator' :
                  toolsCompleted === 2 ? 'Complete Business Case' :
                  'Review complete intelligence package',
          reason: 'Progressive value building',
          timeEstimate: '10-15 minutes per tool',
          businessImpact: 'Complete sales enablement toolkit'
        }
      ],
      journeyMap: {
        'Foundation': {
          tool: 'ICP Analysis',
          purpose: 'Know who to target',
          outcome: 'Qualified prospect list'
        },
        'Quantification': {
          tool: 'Cost Calculator',
          purpose: 'Prove the value',
          outcome: 'ROI documentation'
        },
        'Execution': {
          tool: 'Business Case',
          purpose: 'Win the deal',
          outcome: 'Stakeholder alignment'
        }
      }
    };
  },

  /**
   * Default Guidance
   */
  getDefaultGuidance() {
    return {
      currentStep: 'Getting Started',
      nextActions: [
        {
          priority: 'high',
          action: 'Begin with ICP Analysis',
          reason: 'Foundation for all sales activities',
          timeEstimate: '10 minutes',
          businessImpact: 'Improve targeting accuracy'
        }
      ],
      tips: [
        'Follow the recommended tool sequence for best results',
        'Each tool builds on insights from the previous one',
        'Export results for team sharing'
      ]
    };
  },

  /**
   * Get implementation roadmap based on overall progress
   */
  getImplementationRoadmap(progress, customerData) {
    const phase = this.getCurrentPhase(progress);
    
    const roadmap = {
      'discovery': {
        title: 'Discovery & Foundation',
        timeline: 'Week 1',
        milestones: [
          { task: 'Complete ICP Analysis', status: progress?.icp_complete ? 'complete' : 'pending' },
          { task: 'Score existing pipeline', status: 'pending' },
          { task: 'Identify top 10 prospects', status: 'pending' }
        ],
        outcome: 'Clear target customer definition'
      },
      'validation': {
        title: 'Value Validation',
        timeline: 'Week 2',
        milestones: [
          { task: 'Calculate customer ROI', status: progress?.cost_complete ? 'complete' : 'pending' },
          { task: 'Document cost of inaction', status: 'pending' },
          { task: 'Create value proposition', status: 'pending' }
        ],
        outcome: 'Quantified business impact'
      },
      'execution': {
        title: 'Sales Execution',
        timeline: 'Week 3-4',
        milestones: [
          { task: 'Build business cases', status: progress?.business_case_complete ? 'complete' : 'pending' },
          { task: 'Conduct stakeholder meetings', status: 'pending' },
          { task: 'Close pilot deals', status: 'pending' }
        ],
        outcome: 'Systematic sales process'
      },
      'optimization': {
        title: 'Continuous Optimization',
        timeline: 'Ongoing',
        milestones: [
          { task: 'Track conversion metrics', status: 'pending' },
          { task: 'Refine ICP based on results', status: 'pending' },
          { task: 'Scale successful patterns', status: 'pending' }
        ],
        outcome: 'Predictable revenue growth'
      }
    };

    return {
      currentPhase: phase,
      phases: Object.values(roadmap),
      nextMilestone: this.getNextMilestone(roadmap, progress),
      estimatedCompletion: this.estimateCompletionTime(progress)
    };
  },

  /**
   * Helper: Determine current phase
   */
  getCurrentPhase(progress) {
    if (!progress?.icp_complete) return 'discovery';
    if (!progress?.cost_complete) return 'validation';
    if (!progress?.business_case_complete) return 'execution';
    return 'optimization';
  },

  /**
   * Helper: Get next milestone
   */
  getNextMilestone(roadmap, progress) {
    for (const phase of Object.values(roadmap)) {
      const pending = phase.milestones.find(m => m.status === 'pending');
      if (pending) {
        return {
          phase: phase.title,
          task: pending.task,
          timeline: phase.timeline
        };
      }
    }
    return null;
  },

  /**
   * Helper: Estimate completion time
   */
  estimateCompletionTime(progress) {
    const toolsComplete = [
      progress?.icp_complete,
      progress?.cost_complete,
      progress?.business_case_complete
    ].filter(Boolean).length;

    const remainingTools = 3 - toolsComplete;
    const minutesPerTool = 15;
    
    return {
      tools: remainingTools,
      estimatedMinutes: remainingTools * minutesPerTool,
      message: remainingTools === 0 ? 'All tools complete!' :
               `${remainingTools} tool${remainingTools > 1 ? 's' : ''} remaining (~${remainingTools * minutesPerTool} minutes)`
    };
  },

  /**
   * Get sales execution checklist
   */
  getSalesExecutionChecklist(toolName, progress) {
    const checklists = {
      'icp-analysis': {
        immediate: [
          { task: 'Score your next prospect call', done: false },
          { task: 'Update CRM with ICP fields', done: false },
          { task: 'Share criteria with team', done: false }
        ],
        thisWeek: [
          { task: 'Audit existing pipeline with ICP scores', done: false },
          { task: 'Create ICP-specific email templates', done: false },
          { task: 'Train SDRs on qualification criteria', done: false }
        ]
      },
      'cost-calculator': {
        immediate: [
          { task: 'Calculate ROI for top opportunity', done: false },
          { task: 'Add cost data to proposal', done: false },
          { task: 'Schedule value review call', done: false }
        ],
        thisWeek: [
          { task: 'Build cost models for all active deals', done: false },
          { task: 'Create industry-specific benchmarks', done: false },
          { task: 'Document customer success metrics', done: false }
        ]
      },
      'business-case': {
        immediate: [
          { task: 'Customize for current opportunity', done: false },
          { task: 'Identify all stakeholders', done: false },
          { task: 'Schedule executive presentation', done: false }
        ],
        thisWeek: [
          { task: 'Prepare stakeholder-specific versions', done: false },
          { task: 'Gather competitive intelligence', done: false },
          { task: 'Define success criteria with champion', done: false }
        ]
      }
    };

    return checklists[toolName] || { immediate: [], thisWeek: [] };
  }
};

export default implementationGuidanceService;