/**
 * Assessment Service - Phase 3
 * 
 * Comprehensive professional competency assessment and tracking system
 * Handles baseline assessments, progress tracking, and competency analytics
 */

import { airtableService } from './airtableService';

class AssessmentService {
  constructor() {
    this.competencyCategories = [
      {
        id: 'customerAnalysis',
        name: 'Customer Analysis',
        description: 'Ability to identify, analyze, and profile ideal customers',
        icon: 'target',
        color: 'blue',
        maxScore: 100
      },
      {
        id: 'valueCommunication',
        name: 'Value Communication',
        description: 'Skill in articulating value propositions and ROI',
        icon: 'trending-up',
        color: 'green',
        maxScore: 100
      },
      {
        id: 'salesExecution',
        name: 'Sales Execution',
        description: 'Proficiency in sales methodology and deal progression',
        icon: 'bar-chart',
        color: 'purple',
        maxScore: 100
      }
    ];

    this.professionalLevels = [
      {
        id: 'foundation',
        name: 'Customer Intelligence Foundation',
        description: 'Building fundamental customer analysis skills',
        requiredPoints: 0,
        maxPoints: 1000,
        color: 'blue',
        benefits: [
          'Access to ICP Analysis tools',
          'Basic customer profiling frameworks',
          'Foundational assessment benchmarks'
        ]
      },
      {
        id: 'developing',
        name: 'Value Communication Developing',
        description: 'Developing value articulation capabilities',
        requiredPoints: 1000,
        maxPoints: 2500,
        color: 'green',
        benefits: [
          'Cost Calculator methodology access',
          'Value proposition frameworks',
          'ROI calculation tools'
        ]
      },
      {
        id: 'proficient',
        name: 'Sales Strategy Proficient',
        description: 'Proficient in systematic sales execution',
        requiredPoints: 2500,
        maxPoints: 5000,
        color: 'purple',
        benefits: [
          'Business Case Builder access',
          'Advanced sales frameworks',
          'Deal progression methodologies'
        ]
      },
      {
        id: 'advanced',
        name: 'Revenue Development Advanced',
        description: 'Advanced revenue generation expertise',
        requiredPoints: 5000,
        maxPoints: 10000,
        color: 'orange',
        benefits: [
          'Advanced analytics access',
          'Custom framework creation',
          'Peer mentoring opportunities'
        ]
      },
      {
        id: 'expert',
        name: 'Market Execution Expert',
        description: 'Expert-level market execution capabilities',
        requiredPoints: 10000,
        maxPoints: 20000,
        color: 'red',
        benefits: [
          'Expert methodologies',
          'Advanced market analysis',
          'Leadership development access'
        ]
      },
      {
        id: 'master',
        name: 'Revenue Intelligence Master',
        description: 'Master-level revenue intelligence expertise',
        requiredPoints: 20000,
        maxPoints: null,
        color: 'gold',
        benefits: [
          'Full platform access',
          'Custom methodology development',
          'Industry recognition programs'
        ]
      }
    ];

    this.assessmentQuestions = {
      customerAnalysis: [
        {
          id: 'ca_1',
          category: 'customerAnalysis',
          question: 'How do you currently identify ideal customer prospects?',
          type: 'multiple_choice',
          options: [
            { value: 20, text: 'Manual research and guesswork' },
            { value: 40, text: 'Basic demographic filtering' },
            { value: 60, text: 'Systematic ICP framework' },
            { value: 80, text: 'Data-driven scoring methodology' },
            { value: 100, text: 'AI-enhanced predictive modeling' }
          ]
        },
        {
          id: 'ca_2',
          category: 'customerAnalysis',
          question: 'How do you qualify prospect fit before investing time?',
          type: 'multiple_choice',
          options: [
            { value: 20, text: 'Minimal qualification process' },
            { value: 40, text: 'Basic budget and authority check' },
            { value: 60, text: 'Systematic BANT qualification' },
            { value: 80, text: 'Multi-criteria scoring system' },
            { value: 100, text: 'Predictive qualification framework' }
          ]
        },
        {
          id: 'ca_3',
          category: 'customerAnalysis',
          question: 'How well do you understand customer decision-making processes?',
          type: 'scale',
          scale: { min: 1, max: 10, labels: ['Limited understanding', 'Expert understanding'] }
        }
      ],
      valueCommunication: [
        {
          id: 'vc_1',
          category: 'valueCommunication',
          question: 'How do you typically communicate ROI to prospects?',
          type: 'multiple_choice',
          options: [
            { value: 20, text: 'Generic ROI estimates' },
            { value: 40, text: 'Industry benchmark comparisons' },
            { value: 60, text: 'Customized ROI calculations' },
            { value: 80, text: 'Interactive ROI modeling' },
            { value: 100, text: 'Comprehensive business case development' }
          ]
        },
        {
          id: 'vc_2',
          category: 'valueCommunication',
          question: 'How do you handle price objections?',
          type: 'multiple_choice',
          options: [
            { value: 20, text: 'Immediate discount offering' },
            { value: 40, text: 'Feature justification' },
            { value: 60, text: 'Value reframe discussion' },
            { value: 80, text: 'Cost of inaction analysis' },
            { value: 100, text: 'Strategic value alignment' }
          ]
        },
        {
          id: 'vc_3',
          category: 'valueCommunication',
          question: 'Rate your confidence in value proposition delivery',
          type: 'scale',
          scale: { min: 1, max: 10, labels: ['Low confidence', 'High confidence'] }
        }
      ],
      salesExecution: [
        {
          id: 'se_1',
          category: 'salesExecution',
          question: 'How do you manage your sales pipeline?',
          type: 'multiple_choice',
          options: [
            { value: 20, text: 'Basic CRM tracking' },
            { value: 40, text: 'Stage-based methodology' },
            { value: 60, text: 'Systematic deal progression' },
            { value: 80, text: 'Predictive pipeline management' },
            { value: 100, text: 'AI-enhanced opportunity scoring' }
          ]
        },
        {
          id: 'se_2',
          category: 'salesExecution',
          question: 'How do you handle complex stakeholder situations?',
          type: 'multiple_choice',
          options: [
            { value: 20, text: 'Single point of contact approach' },
            { value: 40, text: 'Basic stakeholder mapping' },
            { value: 60, text: 'Systematic stakeholder analysis' },
            { value: 80, text: 'Multi-threaded engagement strategy' },
            { value: 100, text: 'Influence network orchestration' }
          ]
        },
        {
          id: 'se_3',
          category: 'salesExecution',
          question: 'Rate your deal closing effectiveness',
          type: 'scale',
          scale: { min: 1, max: 10, labels: ['Needs improvement', 'Highly effective'] }
        }
      ]
    };
  }

  /**
   * Calculate baseline assessment scores
   */
  calculateBaselineScores(assessmentResponses) {
    const scores = {
      customerAnalysis: 0,
      valueCommunication: 0,
      salesExecution: 0
    };

    const counts = {
      customerAnalysis: 0,
      valueCommunication: 0,
      salesExecution: 0
    };

    // Process responses
    assessmentResponses.forEach(response => {
      const question = this.findQuestion(response.questionId);
      if (question) {
        let score = 0;
        
        if (question.type === 'multiple_choice') {
          const selectedOption = question.options.find(opt => opt.value === response.value);
          score = selectedOption ? selectedOption.value : 0;
        } else if (question.type === 'scale') {
          // Convert scale to percentage
          score = (response.value / question.scale.max) * 100;
        }

        scores[question.category] += score;
        counts[question.category]++;
      }
    });

    // Calculate averages
    Object.keys(scores).forEach(category => {
      if (counts[category] > 0) {
        scores[category] = scores[category] / counts[category];
      }
    });

    return scores;
  }

  /**
   * Find question by ID
   */
  findQuestion(questionId) {
    for (const category of Object.keys(this.assessmentQuestions)) {
      const question = this.assessmentQuestions[category].find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  }

  /**
   * Calculate current professional level
   */
  calculateProfessionalLevel(totalPoints) {
    for (let i = this.professionalLevels.length - 1; i >= 0; i--) {
      const level = this.professionalLevels[i];
      if (totalPoints >= level.requiredPoints) {
        return level;
      }
    }
    return this.professionalLevels[0];
  }

  /**
   * Calculate progress to next level
   */
  calculateLevelProgress(totalPoints) {
    const currentLevel = this.calculateProfessionalLevel(totalPoints);
    const currentIndex = this.professionalLevels.findIndex(l => l.id === currentLevel.id);
    
    if (currentIndex === this.professionalLevels.length - 1) {
      // Already at maximum level
      return {
        current: currentLevel,
        next: null,
        progress: 100,
        pointsToNext: 0
      };
    }

    const nextLevel = this.professionalLevels[currentIndex + 1];
    const progressInLevel = totalPoints - currentLevel.requiredPoints;
    const pointsNeededForLevel = nextLevel.requiredPoints - currentLevel.requiredPoints;
    const progressPercentage = (progressInLevel / pointsNeededForLevel) * 100;

    return {
      current: currentLevel,
      next: nextLevel,
      progress: Math.min(100, progressPercentage),
      pointsToNext: nextLevel.requiredPoints - totalPoints,
      pointsInLevel: progressInLevel,
      pointsNeededForLevel
    };
  }

  /**
   * Generate competency insights and recommendations
   */
  generateCompetencyInsights(competencyData) {
    const insights = [];
    const recommendations = [];

    // Analyze competency gaps
    const categories = ['customerAnalysis', 'valueCommunication', 'salesExecution'];
    const categoryNames = {
      customerAnalysis: 'Customer Analysis',
      valueCommunication: 'Value Communication',
      salesExecution: 'Sales Execution'
    };

    let lowestCategory = categories[0];
    let lowestScore = competencyData[`current${categories[0].charAt(0).toUpperCase()}${categories[0].slice(1)}`];

    categories.forEach(category => {
      const baselineKey = `baseline${category.charAt(0).toUpperCase()}${category.slice(1)}`;
      const currentKey = `current${category.charAt(0).toUpperCase()}${category.slice(1)}`;
      
      const baseline = competencyData[baselineKey] || 0;
      const current = competencyData[currentKey] || 0;
      const improvement = current - baseline;

      if (current < lowestScore) {
        lowestScore = current;
        lowestCategory = category;
      }

      // Generate category-specific insights
      if (improvement > 10) {
        insights.push({
          type: 'positive',
          category,
          title: `Strong Progress in ${categoryNames[category]}`,
          message: `You've improved ${improvement.toFixed(0)} points since your baseline assessment.`,
          impact: 'high'
        });
      } else if (improvement < 5) {
        insights.push({
          type: 'opportunity',
          category,
          title: `Development Opportunity: ${categoryNames[category]}`,
          message: `Consider focusing more attention on ${categoryNames[category].toLowerCase()} skills.`,
          impact: 'medium'
        });
      }

      // Tool unlock recommendations
      if (current < 70) {
        const toolMap = {
          customerAnalysis: 'ICP Analysis deep-dives',
          valueCommunication: 'Cost Calculator methodology',
          salesExecution: 'Business Case Builder framework'
        };

        recommendations.push({
          category,
          priority: current < 50 ? 'high' : 'medium',
          action: `Focus on ${toolMap[category]}`,
          description: `Reach 70+ points to unlock advanced ${categoryNames[category].toLowerCase()} tools`,
          estimatedTime: '2-4 hours',
          potentialPoints: Math.ceil((70 - current) * 10)
        });
      }
    });

    // Generate level progression insights
    const levelProgress = this.calculateLevelProgress(competencyData.totalProgressPoints);
    if (levelProgress.next) {
      insights.push({
        type: 'milestone',
        category: 'progression',
        title: `${levelProgress.pointsToNext} Points to ${levelProgress.next.name}`,
        message: `You're ${levelProgress.progress.toFixed(0)}% of the way to your next professional level.`,
        impact: 'high'
      });
    }

    return {
      insights,
      recommendations,
      focusArea: categoryNames[lowestCategory],
      overallScore: Math.round((competencyData.currentCustomerAnalysis + competencyData.currentValueCommunication + competencyData.currentSalesExecution) / 3),
      levelProgress
    };
  }

  /**
   * Track real-world action completion
   */
  async trackRealWorldAction(customerId, actionData) {
    try {
      const timestamp = new Date().toISOString();
      
      // Calculate points based on action type and impact
      let points = this.calculateActionPoints(actionData);
      
      // Create action record
      const actionRecord = {
        id: `action_${Date.now()}`,
        customerId,
        type: actionData.type,
        category: actionData.category,
        description: actionData.description,
        impact: actionData.impact,
        evidence: actionData.evidence || null,
        pointsAwarded: points,
        timestamp,
        verified: false, // Honor system - could be enhanced with verification
        tags: actionData.tags || []
      };

      // In Phase 4, this would integrate with Airtable
      console.log('Real-world action tracked:', actionRecord);
      
      return {
        success: true,
        points,
        actionRecord
      };

    } catch (error) {
      console.error('Error tracking real-world action:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate points for real-world actions
   */
  calculateActionPoints(actionData) {
    const basePoints = {
      'customer_meeting': 100,
      'prospect_qualification': 75,
      'value_proposition_delivery': 150,
      'roi_presentation': 200,
      'proposal_creation': 250,
      'deal_closure': 500,
      'referral_generation': 300,
      'case_study_development': 400
    };

    const impactMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.5,
      'critical': 2.0
    };

    const base = basePoints[actionData.type] || 50;
    const multiplier = impactMultiplier[actionData.impact] || 1.0;
    
    return Math.round(base * multiplier);
  }

  /**
   * Generate professional development recommendations
   */
  generateDevelopmentPlan(competencyData, timeframe = '30days') {
    const insights = this.generateCompetencyInsights(competencyData);
    const plan = {
      timeframe,
      objectives: [],
      activities: [],
      milestones: [],
      estimatedOutcome: {}
    };

    // Generate objectives based on competency gaps
    insights.recommendations.forEach(rec => {
      if (rec.priority === 'high') {
        plan.objectives.push({
          category: rec.category,
          target: `Reach 70+ points in ${rec.category}`,
          currentScore: competencyData[`current${rec.category.charAt(0).toUpperCase()}${rec.category.slice(1)}`],
          targetScore: 70,
          priority: 'high'
        });
      }
    });

    // Generate recommended activities
    const activities = [
      {
        type: 'platform_engagement',
        title: 'Complete ICP Analysis Deep-Dive',
        description: 'Comprehensive customer intelligence framework mastery',
        estimatedTime: '2 hours',
        pointsPotential: 90,
        category: 'customerAnalysis'
      },
      {
        type: 'platform_engagement',
        title: 'Master Buyer Persona Framework',
        description: 'Advanced stakeholder psychology and communication',
        estimatedTime: '3 hours',
        pointsPotential: 275,
        category: 'valueCommunication'
      },
      {
        type: 'real_world_action',
        title: 'Apply ICP Framework to 3 Prospects',
        description: 'Real-world application of customer analysis skills',
        estimatedTime: '4 hours',
        pointsPotential: 300,
        category: 'customerAnalysis'
      },
      {
        type: 'real_world_action',
        title: 'Deliver ROI Presentation to Prospect',
        description: 'Practice value communication methodology',
        estimatedTime: '2 hours',
        pointsPotential: 200,
        category: 'valueCommunication'
      }
    ];

    plan.activities = activities.filter(activity => {
      // Include activities relevant to user's development needs
      return insights.recommendations.some(rec => rec.category === activity.category);
    });

    // Generate milestones
    if (insights.levelProgress.next) {
      plan.milestones.push({
        type: 'level_progression',
        title: `Achieve ${insights.levelProgress.next.name}`,
        description: `Unlock advanced ${insights.levelProgress.next.name.toLowerCase()} capabilities`,
        targetPoints: insights.levelProgress.next.requiredPoints,
        currentPoints: competencyData.totalProgressPoints,
        estimatedTimeframe: '2-4 weeks'
      });
    }

    // Estimate outcomes
    const totalPotentialPoints = plan.activities.reduce((sum, activity) => sum + activity.pointsPotential, 0);
    plan.estimatedOutcome = {
      totalPointsGain: totalPotentialPoints,
      competencyImprovements: this.estimateCompetencyGains(competencyData, totalPotentialPoints),
      toolUnlocks: this.estimateToolUnlocks(competencyData, totalPotentialPoints),
      levelProgression: this.estimateLevelProgression(competencyData, totalPotentialPoints)
    };

    return plan;
  }

  /**
   * Estimate competency score improvements
   */
  estimateCompetencyGains(competencyData, additionalPoints) {
    // Simplified estimation - in reality would be more sophisticated
    const pointsPerCategory = additionalPoints / 3;
    const scoreImprovement = pointsPerCategory / 10; // 10 points = 1 score point

    return {
      customerAnalysis: Math.min(100, competencyData.currentCustomerAnalysis + scoreImprovement),
      valueCommunication: Math.min(100, competencyData.currentValueCommunication + scoreImprovement),
      salesExecution: Math.min(100, competencyData.currentSalesExecution + scoreImprovement)
    };
  }

  /**
   * Estimate tool unlock potential
   */
  estimateToolUnlocks(competencyData, additionalPoints) {
    const improvements = this.estimateCompetencyGains(competencyData, additionalPoints);
    const unlocks = [];

    if (improvements.valueCommunication >= 70 && !competencyData.toolUnlockStates?.costCalculatorUnlocked) {
      unlocks.push('Cost Calculator');
    }

    if (improvements.salesExecution >= 70 && !competencyData.toolUnlockStates?.businessCaseUnlocked) {
      unlocks.push('Business Case Builder');
    }

    return unlocks;
  }

  /**
   * Estimate level progression potential
   */
  estimateLevelProgression(competencyData, additionalPoints) {
    const newTotalPoints = competencyData.totalProgressPoints + additionalPoints;
    const currentLevel = this.calculateProfessionalLevel(competencyData.totalProgressPoints);
    const newLevel = this.calculateProfessionalLevel(newTotalPoints);

    return {
      willAdvance: newLevel.id !== currentLevel.id,
      currentLevel: currentLevel.name,
      potentialLevel: newLevel.name,
      progressToNext: this.calculateLevelProgress(newTotalPoints)
    };
  }
}

// Export singleton instance
export const assessmentService = new AssessmentService();
export default assessmentService;