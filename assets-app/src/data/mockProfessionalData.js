import { TrendingUp, Target, BarChart3 } from 'lucide-react';

// Mock customer data for Phase 1 testing
export const mockCustomerData = {
  customer: {
    name: "Alex Chen",
    company: "TechFlow Analytics", 
    email: "alex@techflow.com",
    customerId: "CUST_02",
    competencyLevel: "Customer Analysis Developing",
    isAdmin: false
  },
  
  // Admin user for testing
  adminCustomer: {
    name: "Admin User",
    company: "Demo Company",
    email: "admin@demo.com", 
    customerId: "CUST_4",
    competencyLevel: "Revenue Intelligence Master",
    isAdmin: true
  },

  // Competency scores matching Airtable structure
  competencyScores: {
    customerAnalysis: { 
      current: 67, 
      baseline: 45,
      level: "Developing", 
      unlocked: true,
      color: "blue",
      icon: Target
    },
    valueCommunication: { 
      current: 45, 
      baseline: 35,
      level: "Foundation", 
      unlocked: false,
      color: "amber", 
      icon: TrendingUp
    },
    salesExecution: { 
      current: 52, 
      baseline: 38,
      level: "Foundation", 
      unlocked: false,
      color: "amber",
      icon: BarChart3
    }
  },

  // Enhanced competency areas for Phase 2 Circular Gauges
  competencyAreas: [
    {
      name: "Customer Analysis",
      current: 67,
      baseline: 45,
      level: "Developing", 
      color: "developing",
      unlocked: true,
      unlockBenefit: "ICP Rating Tools & Prospect Scoring",
      description: "Systematic understanding of buyer psychology and decision-making patterns",
      icon: Target
    },
    {
      name: "Value Communication", 
      current: 45,
      baseline: 35,
      level: "Foundation",
      color: "foundation", 
      unlocked: false,
      unlockBenefit: "Cost of Inaction Calculator",
      description: "Translating technical capabilities into quantifiable business outcomes",
      icon: TrendingUp
    },
    {
      name: "Sales Execution",
      current: 52,
      baseline: 38, 
      level: "Foundation",
      color: "foundation",
      unlocked: false,
      unlockBenefit: "Executive Business Case Builder",
      description: "Systematic approach to managing complex B2B sales processes",
      icon: BarChart3
    }
  ],

  // Next unlock information
  nextUnlock: {
    tool: "Cost Calculator", 
    pointsNeeded: 23,
    requirement: "70+ Value Communication score"
  },

  // Enhanced Phase 3 professional activities with comprehensive tracking
  recentActivities: [
    {
      id: 1,
      type: 'ICP_ANALYSIS',
      description: "Completed TechCorp customer analysis with detailed ICP scoring",
      timestamp: "2 hours ago",
      competencyCategory: "Customer Analysis", 
      pointsEarned: 25,
      impactLevel: 'high',
      evidence: "Created comprehensive buyer persona analysis for $150K prospect"
    },
    {
      id: 2,
      type: 'COST_MODEL',
      description: "Built financial impact model for enterprise prospect", 
      timestamp: "Yesterday",
      competencyCategory: "Value Communication",
      pointsEarned: 35,
      impactLevel: 'high',
      evidence: "Quantified $2.3M potential cost savings over 3 years"
    },
    {
      id: 3,
      type: 'REAL_ACTION',
      description: "Presented ROI analysis to C-suite stakeholders",
      timestamp: "2 days ago", 
      competencyCategory: "Sales Execution",
      pointsEarned: 50,
      impactLevel: 'critical',
      evidence: "Live presentation to CEO and CFO, secured next meeting"
    },
    {
      id: 4,
      type: 'BUSINESS_CASE',
      description: "Created executive business case for $250K enterprise deal",
      timestamp: "3 days ago",
      competencyCategory: "Sales Execution", 
      pointsEarned: 40,
      impactLevel: 'high',
      evidence: "15-page comprehensive business case with 18-month ROI projection"
    },
    {
      id: 5,
      type: 'COMPETENCY_IMPROVEMENT',
      description: "Completed advanced customer psychology training module",
      timestamp: "1 week ago",
      competencyCategory: "Professional Development",
      pointsEarned: 30,
      impactLevel: 'medium',
      evidence: "Certification in behavioral economics for B2B sales"
    },
    {
      id: 6,
      type: 'REAL_ACTION',
      description: "Qualified and scored 5 enterprise prospects",
      timestamp: "1 week ago",
      competencyCategory: "Customer Analysis",
      pointsEarned: 35,
      impactLevel: 'high',
      evidence: "Applied systematic ICP framework to new prospect pipeline"
    }
  ],

  // Weekly summary data for Phase 3 components
  weeklySummary: {
    currentWeek: {
      totalPoints: 215,
      activitiesCompleted: 6,
      competencyGrowth: 15,
      toolsUnlocked: 1,
      averageImpact: 3.3,
      focusHours: 16.5,
      streak: 6,
      criticalActions: 1,
      highImpactActions: 4
    },
    previousWeek: {
      totalPoints: 165,
      activitiesCompleted: 4,
      competencyGrowth: 8,
      toolsUnlocked: 0,
      averageImpact: 2.5,
      focusHours: 12.0,
      streak: 3,
      criticalActions: 0,
      highImpactActions: 2
    },
    goals: {
      weeklyPointTarget: 200,
      competencyTarget: 15,
      consistencyTarget: 7
    },
    achievements: [
      {
        title: "Critical Impact Achievement",
        description: "Completed 1+ critical impact activity this week",
        earned: true,
        icon: "Star"
      },
      {
        title: "Consistency Builder", 
        description: "6-day activity streak achieved",
        earned: true,
        icon: "Target"
      },
      {
        title: "Growth Accelerator",
        description: "Exceeded weekly competency growth target",
        earned: true,
        icon: "TrendingUp"
      }
    ]
  },

  // Phase 5: Development Focus data (Stealth Gamification)
  developmentFocus: {
    currentLevel: 'Developing',
    nextUnlock: {
      name: 'Advanced Cost Calculator & Competitive Intelligence',
      benefits: 'Multi-scenario financial modeling with competitive benchmarking and advanced ROI projection capabilities',
      currentProgress: 67,
      requiredProgress: 70,
      pointsNeeded: 3
    },
    
    recommendations: [
      {
        id: 1,
        title: 'Complete Customer Analysis Deep Dive',
        description: 'Systematic evaluation of 3 target customers using enhanced behavioral psychology methodology',
        points: 15,
        category: 'customerAnalysis',
        timeEstimate: '25 min',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Update Financial Impact Model',
        description: 'Quantify monthly delay costs for 2 active pipeline opportunities with stakeholder impact analysis', 
        points: 12,
        category: 'valueCommunication',
        timeEstimate: '15 min',
        priority: 'high'
      },
      {
        id: 3,
        title: 'Document Real Sales Conversation',
        description: 'Log insights and outcome metrics from recent stakeholder presentation with decision-maker feedback',
        points: 8,
        category: 'salesExecution', 
        timeEstimate: '10 min',
        priority: 'medium'
      }
    ],
    
    recentMilestones: [
      {
        id: 1,
        title: 'Customer Analysis Proficiency Achieved',
        description: 'Completed 10 systematic ICP evaluations with quantified scoring methodology',
        completedAt: '2 days ago',
        category: 'customerAnalysis',
        level: 'developing'
      },
      {
        id: 2,
        title: 'Consistent Weekly Development',
        description: '7-day professional development activity streak with measurable progress',
        completedAt: '1 week ago', 
        category: 'streak',
        level: 'foundation'
      },
      {
        id: 3,
        title: 'Value Communication Advancement',
        description: 'Successfully presented 3 business cases with stakeholder approval and budget allocation',
        completedAt: '2 weeks ago',
        category: 'valueCommunication', 
        level: 'developing'
      }
    ]
  },

  // Professional development progress summary
  progressSummary: {
    totalPoints: 160,
    currentLevel: "Customer Analysis Developing",
    nextLevel: "Value Communication Developing",
    pointsToNextLevel: 90,
    weeklyVelocity: 32
  }
};

// Admin user data with higher competency scores
export const mockAdminData = {
  customer: {
    name: "Admin User",
    company: "Demo Company",
    email: "admin@demo.com", 
    customerId: "CUST_4",
    competencyLevel: "Revenue Intelligence Master",
    isAdmin: true
  },

  competencyAreas: [
    {
      name: "Customer Analysis",
      current: 95,
      baseline: 85,
      level: "Master", 
      color: "proficient",
      unlocked: true,
      unlockBenefit: "Advanced ICP Analytics & Behavioral Modeling",
      description: "Expert-level buyer psychology analysis and strategic customer intelligence",
      icon: Target
    },
    {
      name: "Value Communication", 
      current: 92,
      baseline: 78,
      level: "Expert",
      color: "proficient", 
      unlocked: true,
      unlockBenefit: "Executive ROI Modeling & Financial Impact Analysis",
      description: "Master-level business value communication and C-suite presentations",
      icon: TrendingUp
    },
    {
      name: "Sales Execution",
      current: 88,
      baseline: 72, 
      level: "Expert",
      color: "proficient",
      unlocked: true,
      unlockBenefit: "Strategic Deal Architecture & Enterprise Sales Management",
      description: "Advanced B2B sales process optimization and deal closure expertise",
      icon: BarChart3
    }
  ],

  nextUnlock: null, // All tools unlocked for admin

  recentActivities: [
    {
      id: 1,
      type: 'REAL_ACTION',
      description: "Mentored team on advanced customer analysis techniques",
      timestamp: "1 hour ago",
      competencyCategory: "Professional Development", 
      pointsEarned: 50,
      impactLevel: 'critical',
      evidence: "Led 3-hour workshop for 8 team members on behavioral psychology"
    },
    {
      id: 2,
      type: 'REAL_ACTION',
      description: "Closed enterprise deal - $250K ARR", 
      timestamp: "2 hours ago",
      competencyCategory: "Sales Execution",
      pointsEarned: 100,
      impactLevel: 'critical',
      evidence: "Successfully negotiated multi-year contract with Fortune 500 client"
    },
    {
      id: 3,
      type: 'BUSINESS_CASE',
      description: "Presented comprehensive ROI analysis to C-suite stakeholders",
      timestamp: "Yesterday", 
      competencyCategory: "Value Communication",
      pointsEarned: 75,
      impactLevel: 'critical',
      evidence: "Board-level presentation resulting in $500K budget approval"
    },
    {
      id: 4,
      type: 'ICP_ANALYSIS',
      description: "Developed strategic customer success case study",
      timestamp: "2 days ago",
      competencyCategory: "Customer Analysis", 
      pointsEarned: 80,
      impactLevel: 'high',
      evidence: "Created reusable framework for enterprise customer onboarding"
    },
    {
      id: 5,
      type: 'REAL_ACTION',
      description: "Led quarterly business review with key stakeholders",
      timestamp: "3 days ago",
      competencyCategory: "Professional Development",
      pointsEarned: 60,
      impactLevel: 'high',
      evidence: "Facilitated strategic planning session for executive team"
    }
  ],

  // Admin weekly summary data
  weeklySummary: {
    currentWeek: {
      totalPoints: 365,
      activitiesCompleted: 5,
      competencyGrowth: 25,
      toolsUnlocked: 0, // All already unlocked
      averageImpact: 3.8,
      focusHours: 28.5,
      streak: 7,
      criticalActions: 3,
      highImpactActions: 2
    },
    previousWeek: {
      totalPoints: 285,
      activitiesCompleted: 4,
      competencyGrowth: 18,
      toolsUnlocked: 0,
      averageImpact: 3.5,
      focusHours: 22.0,
      streak: 7,
      criticalActions: 2,
      highImpactActions: 2
    },
    goals: {
      weeklyPointTarget: 300,
      competencyTarget: 20,
      consistencyTarget: 7
    },
    achievements: [
      {
        title: "Master Performer",
        description: "Exceeded all weekly targets with critical impact",
        earned: true,
        icon: "Star"
      },
      {
        title: "Team Leader", 
        description: "Mentored team members on advanced techniques",
        earned: true,
        icon: "Award"
      },
      {
        title: "Perfect Consistency",
        description: "Maintained 7-day daily activity streak",
        earned: true,
        icon: "Target"
      }
    ]
  },

  // Admin development focus data (Advanced Level)
  developmentFocus: {
    currentLevel: 'Expert',
    nextUnlock: {
      name: 'All Professional Capabilities Unlocked',
      benefits: 'Maximum revenue intelligence mastery achieved - complete systematic approach with executive-level strategic consultation capabilities',
      currentProgress: 100,
      requiredProgress: 100,
      pointsNeeded: 0
    },
    
    recommendations: [
      {
        id: 1,
        title: 'Strategic Account Portfolio Review',
        description: 'Comprehensive analysis of top 5 enterprise accounts with expansion opportunity identification and risk assessment',
        points: 50,
        category: 'customerAnalysis',
        timeEstimate: '45 min',
        priority: 'high'
      },
      {
        id: 2,
        title: 'Advanced ROI Methodology Training',
        description: 'Mentor team on sophisticated business case development with competitive intelligence integration', 
        points: 40,
        category: 'valueCommunication',
        timeEstimate: '60 min',
        priority: 'medium'
      },
      {
        id: 3,
        title: 'Executive Stakeholder Engagement',
        description: 'Conduct C-suite strategy session with board-level presentation on revenue intelligence transformation',
        points: 60,
        category: 'salesExecution', 
        timeEstimate: '90 min',
        priority: 'high'
      }
    ],
    
    recentMilestones: [
      {
        id: 1,
        title: 'Revenue Intelligence Mastery',
        description: 'Achieved expert-level competency across all professional development areas with quantified business impact',
        completedAt: '1 hour ago',
        category: 'achievement',
        level: 'expert'
      },
      {
        id: 2,
        title: 'Strategic Leadership Recognition',
        description: 'Led organizational transformation resulting in 40% revenue increase through systematic methodology implementation',
        completedAt: '3 days ago', 
        category: 'salesExecution',
        level: 'expert'
      },
      {
        id: 3,
        title: 'Advanced Mentorship Capability',
        description: 'Successfully developed 5 team members to proficient level through systematic coaching methodology',
        completedAt: '1 week ago',
        category: 'competency', 
        level: 'advanced'
      }
    ]
  },

  progressSummary: {
    totalPoints: 45000,
    currentLevel: "Revenue Intelligence Master",
    nextLevel: null,
    pointsToNextLevel: 0,
    weeklyVelocity: 285
  }
};

// Function to get mock data by customer ID
export const getMockDataByCustomerId = (customerId) => {
  switch (customerId) {
    case 'CUST_4':
      return mockAdminData;
    case 'CUST_02':
    default:
      return mockCustomerData;
  }
};

// Professional competency levels for reference
export const competencyLevels = [
  { name: "Customer Intelligence Foundation", points: 1000, color: "amber" },
  { name: "Value Communication Developing", points: 2500, color: "amber" },
  { name: "Sales Strategy Proficient", points: 5000, color: "blue" },
  { name: "Revenue Development Advanced", points: 10000, color: "blue" },
  { name: "Market Execution Expert", points: 20000, color: "green" },
  { name: "Revenue Intelligence Master", points: 50000, color: "green" }
];

// Phase 2 Test Scenarios for Different Gauge States
export const testScenarios = {
  mixedProgress: {
    name: "Mixed Progress State",
    description: "One unlocked, two locked - demonstrates progression path",
    data: mockCustomerData
  },
  
  allLocked: {
    name: "All Locked State",
    description: "All competencies below threshold - shows early user state",
    data: {
      ...mockCustomerData,
      competencyAreas: mockCustomerData.competencyAreas.map(comp => ({
        ...comp,
        current: 45,
        unlocked: false,
        level: "Foundation",
        color: "foundation"
      }))
    }
  },
  
  allUnlocked: {
    name: "All Unlocked State", 
    description: "All competencies above threshold - shows advanced user state",
    data: {
      ...mockCustomerData,
      competencyAreas: mockCustomerData.competencyAreas.map(comp => ({
        ...comp,
        current: 85,
        unlocked: true,
        level: "Proficient",
        color: "proficient"
      })),
      nextUnlock: null
    }
  },
  
  nearUnlock: {
    name: "Near Unlock State",
    description: "Just 2 points from unlock - high psychological engagement",
    data: {
      ...mockCustomerData,
      competencyAreas: mockCustomerData.competencyAreas.map(comp => ({
        ...comp,
        current: 68,
        unlocked: false,
        level: "Developing",
        color: "developing"
      }))
    }
  }
};