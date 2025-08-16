// TaskRecommendationEngine.js - Maps tasks to competencies and platform tools

export const TaskRecommendationEngine = {
  
  // TASK-TO-COMPETENCY MAPPING
  mapTaskToCompetency: (taskName) => {
    const competencyMapping = {
      // Customer Analysis competency
      'Gather and analyze customer feedback to refine the product': 'customerAnalysis',
      'Define Ideal Customer Profile (ICP)': 'customerAnalysis',
      'Refine understanding of target customers to focus sales efforts': 'customerAnalysis',
      'Build a Customer Success Team': 'customerAnalysis',
      'Conduct customer interviews to validate product-market fit': 'customerAnalysis',
      'Analyze user behavior and usage patterns': 'customerAnalysis',
      'Segment customers by value and usage': 'customerAnalysis',
      'Create detailed buyer personas': 'customerAnalysis',
      'Map customer journey and touchpoints': 'customerAnalysis',
      'Implement customer feedback loops': 'customerAnalysis',
      
      // Value Communication competency
      'Build a repeatable sales process': 'valueCommunication',
      'Start building a sales pipeline and closing deals': 'valueCommunication',
      'Develop a compelling sales pitch and messaging': 'valueCommunication',
      'Implement sales automation and CRM tools to improve efficiency': 'valueCommunication',
      'Optimize Pricing & Packaging': 'valueCommunication',
      'Create value proposition documentation': 'valueCommunication',
      'Develop competitive positioning materials': 'valueCommunication',
      'Build ROI calculators for prospects': 'valueCommunication',
      'Create sales enablement materials': 'valueCommunication',
      'Implement lead qualification framework': 'valueCommunication',
      'Design demo and presentation materials': 'valueCommunication',
      
      // Executive Readiness competency
      'Hire a dedicated sales leader to build and manage the team': 'executiveReadiness',
      'Implement a sales training program and provide ongoing coaching': 'executiveReadiness',
      'Prepare for Series A funding by demonstrating strong growth': 'executiveReadiness',
      'Expand Sales Team & Channels': 'executiveReadiness',
      'Develop Strategic Partnerships': 'executiveReadiness',
      'Build board reporting and metrics dashboard': 'executiveReadiness',
      'Create investor updates and communication': 'executiveReadiness',
      'Establish executive team structure': 'executiveReadiness',
      'Develop strategic planning processes': 'executiveReadiness',
      'Implement OKRs and performance management': 'executiveReadiness',
      'Create market expansion strategy': 'executiveReadiness'
    };
    
    return competencyMapping[taskName] || 'general';
  },

  // TASK-TO-PLATFORM-TOOL CONNECTIONS
  getToolRecommendation: (taskName) => {
    const taskToolMapping = {
      // ICP Analysis Tool connections
      'Gather and analyze customer feedback to refine the product': {
        tool: 'icp',
        toolName: 'ICP Analysis',
        connection: 'Use ICP Analysis to understand buyer feedback patterns systematically',
        action: 'Analyze feedback data to refine buyer personas'
      },
      'Define Ideal Customer Profile (ICP)': {
        tool: 'icp', 
        toolName: 'ICP Analysis',
        connection: 'Direct platform tool usage - core ICP development capability',
        action: 'Build systematic buyer targeting framework'
      },
      'Refine understanding of target customers to focus sales efforts': {
        tool: 'icp',
        toolName: 'ICP Analysis',
        connection: 'Use ICP rating system to prioritize prospect outreach',
        action: 'Rate prospects using systematic scoring framework'
      },
      'Create detailed buyer personas': {
        tool: 'icp',
        toolName: 'ICP Analysis',
        connection: 'Build comprehensive buyer persona documentation',
        action: 'Use persona templates and stakeholder mapping'
      },
      'Segment customers by value and usage': {
        tool: 'icp',
        toolName: 'ICP Analysis',
        connection: 'Apply systematic customer segmentation framework',
        action: 'Use ICP scoring to segment customer base'
      },
      
      // Financial Impact Builder connections
      'Build a repeatable sales process': {
        tool: 'financial',
        toolName: 'Financial Impact Builder',
        connection: 'Use Cost Calculator to quantify value in systematic sales process',
        action: 'Create ROI models for consistent value communication'
      },
      'Start building a sales pipeline and closing deals': {
        tool: 'financial',
        toolName: 'Financial Impact Builder',
        connection: 'Use Business Case Builder to close deals with financial justification',
        action: 'Generate stakeholder-specific business cases'
      },
      'Implement sales automation and CRM tools': {
        tool: 'financial',
        toolName: 'Financial Impact Builder',
        connection: 'Export financial models for CRM ROI justification',
        action: 'Build business case for sales automation investment'
      },
      'Optimize Pricing & Packaging': {
        tool: 'financial',
        toolName: 'Financial Impact Builder',
        connection: 'Model pricing impact on customer ROI and business outcomes',
        action: 'Calculate optimal pricing for value delivery'
      },
      'Build ROI calculators for prospects': {
        tool: 'financial',
        toolName: 'Financial Impact Builder',
        connection: 'Create prospect-facing ROI calculation templates',
        action: 'Export financial models for prospect use'
      },
      'Create value proposition documentation': {
        tool: 'financial',
        toolName: 'Financial Impact Builder',
        connection: 'Quantify value propositions with financial modeling',
        action: 'Build measurable value proposition framework'
      },
      
      // Resource Library connections
      'Hire a dedicated sales leader to build and manage the team': {
        tool: 'resources',
        toolName: 'Resource Library',
        connection: 'Access hiring frameworks and sales leader onboarding guides',
        action: 'Use systematic hiring templates and role definitions'
      },
      'Implement a sales training program': {
        tool: 'resources',
        toolName: 'Resource Library',
        connection: 'Use systematic training materials and competency frameworks',
        action: 'Access training curricula and competency assessments'
      },
      'Develop Strategic Partnerships': {
        tool: 'resources',
        toolName: 'Resource Library',
        connection: 'Access partnership frameworks and negotiation templates',
        action: 'Use partnership development resources'
      },
      'Create sales enablement materials': {
        tool: 'resources',
        toolName: 'Resource Library',
        connection: 'Access templates for sales materials and presentations',
        action: 'Use proven sales enablement frameworks'
      },
      'Establish executive team structure': {
        tool: 'resources',
        toolName: 'Resource Library',
        connection: 'Access organizational design and leadership frameworks',
        action: 'Use executive team building resources'
      }
    };
    
    return taskToolMapping[taskName] || null;
  },

  // ENHANCED MILESTONE DETECTION WITH TASK DATA
  detectMilestoneWithTasks: (businessMetrics) => {
    const { mrr = 0, arr = 0, stage, teamSize = 1 } = businessMetrics;
    
    // Convert ARR to MRR if only ARR provided
    const monthlyRevenue = mrr || (arr / 12);
    
    // Foundation Building: Initial PMF + Key Hires ($10K-$100K MRR)
    if (monthlyRevenue >= 10000 && monthlyRevenue <= 100000) {
      return {
        tier: 'foundation',
        stage: 'seed',
        milestoneCategories: ['Initial PMF (Product-Market Fit)', 'Key Hires'],
        revenueRange: '$10K - $100K MRR',
        taskTableSource: 'seed',
        context: 'Building systematic foundations for scalable PMF validation',
        targets: { customerAnalysis: 70, valueCommunication: 65, executiveReadiness: 50 },
        priority: ['Customer Analysis', 'Value Communication', 'Executive Readiness'],
        focus: 'Establish systematic buyer understanding and value communication',
        timeframe: '3-6 months'
      };
    }
    
    // Growth Scaling: Scalability + User Base + Early Series A ($100K-$500K MRR)
    if (monthlyRevenue >= 100000 && monthlyRevenue <= 500000) {
      return {
        tier: 'growth',
        stage: 'seed-to-series-a',
        milestoneCategories: ['Scalability/Revenue', 'User Base', 'Scaling Product'],
        revenueRange: '$100K - $500K+ MRR',
        taskTableSource: 'both', // Pull from both Seed + Series A tables
        context: 'Scaling systematic processes for Series A readiness',
        targets: { customerAnalysis: 85, valueCommunication: 80, executiveReadiness: 75 },
        priority: ['Value Communication', 'Executive Readiness', 'Customer Analysis'],
        focus: 'Optimize revenue processes for scale and team training',
        timeframe: '6-12 months'
      };
    }
    
    // Market Expansion: Series A Revenue Growth + Market Penetration ($1M+ ARR)
    if (arr >= 1000000 || monthlyRevenue >= 83333) {
      return {
        tier: 'expansion',
        stage: 'series-a',
        milestoneCategories: ['Revenue Growth', 'Market Penetration'],
        revenueRange: '$1M+ ARR',
        taskTableSource: 'series-a',
        context: 'Systematic enterprise sales and market leadership',
        targets: { customerAnalysis: 90, valueCommunication: 90, executiveReadiness: 85 },
        priority: ['Executive Readiness', 'Strategic Intelligence', 'Competitive Mastery'],
        focus: 'Advanced revenue intelligence for market expansion',
        timeframe: '12-18 months'
      };
    }
    
    // Default to foundation if below thresholds
    return {
      tier: 'foundation',
      stage: 'pre-seed',
      milestoneCategories: ['Product Launch', 'Initial Traction'],
      revenueRange: 'Pre-$10K MRR',
      taskTableSource: 'seed',
      context: 'Building systematic foundations for initial market traction',
      targets: { customerAnalysis: 60, valueCommunication: 55, executiveReadiness: 40 },
      priority: ['Customer Analysis', 'Value Communication'],
      focus: 'Establish basic buyer understanding and product-market fit',
      timeframe: '3-6 months'
    };
  },

  // PRIORITY CALCULATION BASED ON COMPETENCY GAPS
  calculateTaskPriority: (task, competencyScores, milestoneData) => {
    const taskCompetency = TaskRecommendationEngine.mapTaskToCompetency(task.name);
    const competencyScore = competencyScores[taskCompetency] || 50;
    const milestoneTarget = milestoneData.targets[taskCompetency] || 70;
    
    const gap = Math.max(0, milestoneTarget - competencyScore);
    
    // Priority calculation based on competency gap
    if (gap > 30) return 'critical';
    if (gap > 15) return 'high';
    if (gap > 5) return 'medium';
    return 'low';
  },

  // GET NEXT MILESTONE PREVIEW
  getNextMilestone: (currentMilestone) => {
    const progressionMap = {
      'foundation': {
        tier: 'growth',
        stage: 'seed-to-series-a',
        revenueRange: '$100K - $500K+ MRR',
        context: 'Scaling systematic processes for Series A readiness'
      },
      'growth': {
        tier: 'expansion',
        stage: 'series-a',
        revenueRange: '$1M+ ARR', 
        context: 'Systematic enterprise sales and market leadership'
      },
      'expansion': {
        tier: 'market-leader',
        stage: 'series-b-plus',
        revenueRange: '$10M+ ARR',
        context: 'Market leadership and strategic expansion'
      }
    };
    
    return progressionMap[currentMilestone.tier] || null;
  },

  // GET DEFAULT TASKS FOR MILESTONE (FALLBACK)
  getDefaultTasksForMilestone: (milestoneTier) => {
    const defaultTasks = {
      foundation: [
        {
          id: 'default-f1',
          name: 'Define Ideal Customer Profile (ICP)',
          category: 'Initial PMF (Product-Market Fit)',
          priority: 'high',
          competencyArea: 'customerAnalysis'
        },
        {
          id: 'default-f2', 
          name: 'Build a repeatable sales process',
          category: 'Key Hires',
          priority: 'high',
          competencyArea: 'valueCommunication'
        },
        {
          id: 'default-f3',
          name: 'Create value proposition documentation',
          category: 'Initial PMF (Product-Market Fit)',
          priority: 'medium',
          competencyArea: 'valueCommunication'
        }
      ],
      growth: [
        {
          id: 'default-g1',
          name: 'Implement sales automation and CRM tools to improve efficiency',
          category: 'Scalability/Revenue',
          priority: 'critical',
          competencyArea: 'valueCommunication'
        },
        {
          id: 'default-g2',
          name: 'Hire a dedicated sales leader to build and manage the team',
          category: 'Scaling Product',
          priority: 'high',
          competencyArea: 'executiveReadiness'
        },
        {
          id: 'default-g3',
          name: 'Analyze user behavior and usage patterns',
          category: 'User Base',
          priority: 'medium',
          competencyArea: 'customerAnalysis'
        }
      ],
      expansion: [
        {
          id: 'default-e1',
          name: 'Develop Strategic Partnerships',
          category: 'Market Penetration',
          priority: 'critical',
          competencyArea: 'executiveReadiness'
        },
        {
          id: 'default-e2',
          name: 'Prepare for Series A funding by demonstrating strong growth',
          category: 'Revenue Growth',
          priority: 'high',
          competencyArea: 'executiveReadiness'
        },
        {
          id: 'default-e3',
          name: 'Create market expansion strategy',
          category: 'Market Penetration',
          priority: 'medium',
          competencyArea: 'executiveReadiness'
        }
      ]
    };
    
    return defaultTasks[milestoneTier] || defaultTasks.foundation;
  }
};

export default TaskRecommendationEngine;