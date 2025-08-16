// TaskResourceMatcher.js - Maps completed tasks to relevant resource recommendations
import { TaskCacheManager } from './TaskCacheManager';

export const TaskResourceMatcher = {
  
  // TASK-TO-RESOURCE MAPPING RULES
  taskResourceMap: {
    // Customer Analysis Tasks
    'Define Ideal Customer Profile': {
      immediate: ['icp-basics-1', 'icp-basics-3'],
      nextLevel: ['icp-growth-1', 'icp-expansion-1'],
      category: 'ICP Intelligence'
    },
    'Conduct Customer Discovery Research': {
      immediate: ['icp-basics-3', 'icp-basics-2'],
      nextLevel: ['icp-growth-2'],
      category: 'ICP Intelligence'
    },
    'Map Customer Journey': {
      immediate: ['icp-basics-1', 'value-basics-1'],
      nextLevel: ['value-growth-1'],
      category: 'Value Communication'
    },
    
    // Value Communication Tasks
    'Calculate Technical ROI': {
      immediate: ['value-basics-1', 'value-basics-2'],
      nextLevel: ['value-growth-2', 'value-expansion-1'],
      category: 'Value Communication'
    },
    'Build Financial Business Case': {
      immediate: ['value-basics-1', 'impl-basics-1'],
      nextLevel: ['value-growth-1', 'value-expansion-2'],
      category: 'Value Communication'
    },
    'Create Stakeholder Value Maps': {
      immediate: ['value-basics-2'],
      nextLevel: ['value-growth-1', 'icp-growth-1'],
      category: 'Value Communication'
    },
    
    // Executive Readiness Tasks
    'Develop Executive Presentations': {
      immediate: ['value-basics-2'],
      nextLevel: ['value-expansion-1', 'value-growth-1'],
      category: 'Value Communication'
    },
    'Create Scalable Processes': {
      immediate: ['impl-basics-1'],
      nextLevel: ['impl-growth-1', 'impl-expansion-1'],
      category: 'Implementation'
    },
    'Build Team Training Materials': {
      immediate: ['impl-basics-1'],
      nextLevel: ['impl-growth-1'],
      category: 'Implementation'
    },
    
    // General Business Development
    'Systematic Customer Analysis': {
      immediate: ['icp-basics-1', 'icp-basics-3'],
      nextLevel: ['icp-growth-1'],
      category: 'ICP Intelligence'
    },
    'Revenue Process Optimization': {
      immediate: ['value-basics-1', 'impl-basics-1'],
      nextLevel: ['value-growth-2', 'impl-growth-1'],
      category: 'Implementation'
    }
  },

  // COMPETENCY-BASED RESOURCE RECOMMENDATIONS
  competencyResourceMap: {
    customerAnalysis: {
      low: ['icp-basics-1', 'icp-basics-3', 'icp-basics-2'],
      medium: ['icp-growth-1', 'icp-growth-2'],
      high: ['icp-expansion-1']
    },
    valueCommunication: {
      low: ['value-basics-1', 'value-basics-2'],
      medium: ['value-growth-1', 'value-growth-2'],
      high: ['value-expansion-1', 'value-expansion-2']
    },
    executiveReadiness: {
      low: ['impl-basics-1', 'value-basics-2'],
      medium: ['impl-growth-1', 'value-growth-1'],
      high: ['impl-expansion-1', 'value-expansion-1']
    }
  },

  // MILESTONE-BASED RESOURCE PROGRESSION
  milestoneResourceFlow: {
    foundation: {
      essential: ['icp-basics-1', 'value-basics-1', 'impl-basics-1'],
      recommended: ['icp-basics-2', 'icp-basics-3', 'value-basics-2'],
      advanced: ['icp-growth-1', 'value-growth-1']
    },
    growth: {
      essential: ['icp-growth-1', 'value-growth-1', 'impl-growth-1'],
      recommended: ['icp-growth-2', 'value-growth-2'],
      advanced: ['icp-expansion-1', 'value-expansion-1']
    },
    expansion: {
      essential: ['icp-expansion-1', 'value-expansion-1', 'impl-expansion-1'],
      recommended: ['value-expansion-2'],
      advanced: []
    }
  },

  // GET RESOURCE RECOMMENDATIONS BASED ON COMPLETED TASKS
  getTaskDrivenRecommendations: (completedTasks, customerData, usageAssessment) => {
    const recommendations = new Set();
    const completedTaskNames = completedTasks.map(task => task.name || task.taskName || '');
    
    // Find immediate resource needs based on completed tasks
    completedTaskNames.forEach(taskName => {
      const mapping = TaskResourceMatcher.findTaskMapping(taskName);
      if (mapping) {
        // Add immediate resources
        mapping.immediate.forEach(resourceId => recommendations.add({
          resourceId,
          reason: `Follow-up to "${taskName}"`,
          priority: 'high',
          category: mapping.category,
          source: 'task-completion'
        }));
        
        // Add next-level resources if user is advanced
        if (TaskResourceMatcher.isAdvancedUser(customerData, usageAssessment)) {
          mapping.nextLevel.forEach(resourceId => recommendations.add({
            resourceId,
            reason: `Advanced implementation for "${taskName}"`,
            priority: 'medium',
            category: mapping.category,
            source: 'task-progression'
          }));
        }
      }
    });

    return Array.from(recommendations);
  },

  // GET COMPETENCY GAP RECOMMENDATIONS
  getCompetencyGapRecommendations: (competencyScores, milestone) => {
    const recommendations = [];
    
    Object.entries(competencyScores).forEach(([competency, score]) => {
      const level = score < 50 ? 'low' : score < 75 ? 'medium' : 'high';
      const resourceMap = TaskResourceMatcher.competencyResourceMap[competency];
      
      if (resourceMap && resourceMap[level]) {
        resourceMap[level].forEach(resourceId => {
          recommendations.push({
            resourceId,
            reason: `Improve ${competency} competency (current: ${score}%)`,
            priority: score < 50 ? 'high' : 'medium',
            category: TaskResourceMatcher.getResourceCategory(competency),
            source: 'competency-gap',
            competencyArea: competency,
            currentScore: score
          });
        });
      }
    });

    return recommendations;
  },

  // GET MILESTONE-BASED RECOMMENDATIONS
  getMilestoneRecommendations: (milestone, completedTasksCount = 0) => {
    const recommendations = [];
    const tierResources = TaskResourceMatcher.milestoneResourceFlow[milestone.tier];
    
    if (!tierResources) return recommendations;

    // Essential resources (always recommend)
    tierResources.essential.forEach(resourceId => {
      recommendations.push({
        resourceId,
        reason: `Essential for ${milestone.tier} stage`,
        priority: 'high',
        category: TaskResourceMatcher.getResourceCategoryFromId(resourceId),
        source: 'milestone-essential'
      });
    });

    // Recommended resources (if user has completed some tasks)
    if (completedTasksCount > 2) {
      tierResources.recommended.forEach(resourceId => {
        recommendations.push({
          resourceId,
          reason: `Recommended for ${milestone.tier} stage progression`,
          priority: 'medium',
          category: TaskResourceMatcher.getResourceCategoryFromId(resourceId),
          source: 'milestone-recommended'
        });
      });
    }

    // Advanced resources (if user is progressing well)
    if (completedTasksCount > 5) {
      tierResources.advanced.forEach(resourceId => {
        recommendations.push({
          resourceId,
          reason: `Advanced ${milestone.tier} stage capabilities`,
          priority: 'low',
          category: TaskResourceMatcher.getResourceCategoryFromId(resourceId),
          source: 'milestone-advanced'
        });
      });
    }

    return recommendations;
  },

  // UNIFIED RECOMMENDATION ENGINE
  getSmartRecommendations: (completedTasks, customerData, usageAssessment) => {
    const allRecommendations = [];
    
    // Task-driven recommendations
    const taskRecs = TaskResourceMatcher.getTaskDrivenRecommendations(
      completedTasks, 
      customerData, 
      usageAssessment
    );
    allRecommendations.push(...taskRecs);

    // Competency gap recommendations
    if (customerData.competencyScores) {
      const competencyRecs = TaskResourceMatcher.getCompetencyGapRecommendations(
        customerData.competencyScores,
        customerData.milestone
      );
      allRecommendations.push(...competencyRecs);
    }

    // Milestone-based recommendations
    if (customerData.milestone) {
      const milestoneRecs = TaskResourceMatcher.getMilestoneRecommendations(
        customerData.milestone,
        completedTasks.length
      );
      allRecommendations.push(...milestoneRecs);
    }

    // Deduplicate and prioritize
    return TaskResourceMatcher.deduplicateAndPrioritize(allRecommendations);
  },

  // HELPER METHODS

  // Find task mapping by partial name match
  findTaskMapping: (taskName) => {
    // Direct match first
    if (TaskResourceMatcher.taskResourceMap[taskName]) {
      return TaskResourceMatcher.taskResourceMap[taskName];
    }
    
    // Partial match
    const lowerTaskName = taskName.toLowerCase();
    for (const [mappedTaskName, mapping] of Object.entries(TaskResourceMatcher.taskResourceMap)) {
      if (lowerTaskName.includes(mappedTaskName.toLowerCase()) || 
          mappedTaskName.toLowerCase().includes(lowerTaskName)) {
        return mapping;
      }
    }
    
    return null;
  },

  // Determine if user is advanced based on usage patterns
  isAdvancedUser: (customerData, usageAssessment) => {
    const usage = usageAssessment?.usage || {};
    const totalProgress = (usage.icpProgress || 0) + (usage.financialProgress || 0);
    const resourcesAccessed = usage.resourcesAccessed || 0;
    const avgCompetency = Object.values(customerData.competencyScores || {})
      .reduce((sum, score) => sum + score, 0) / 3;
    
    return totalProgress > 100 || resourcesAccessed > 10 || avgCompetency > 70;
  },

  // Get resource category from competency area
  getResourceCategory: (competencyArea) => {
    const categoryMap = {
      customerAnalysis: 'ICP Intelligence',
      valueCommunication: 'Value Communication',
      executiveReadiness: 'Implementation'
    };
    return categoryMap[competencyArea] || 'Implementation';
  },

  // Get resource category from resource ID
  getResourceCategoryFromId: (resourceId) => {
    if (resourceId.includes('icp-')) return 'ICP Intelligence';
    if (resourceId.includes('value-')) return 'Value Communication';
    if (resourceId.includes('impl-')) return 'Implementation';
    return 'Implementation';
  },

  // Deduplicate and prioritize recommendations
  deduplicateAndPrioritize: (recommendations) => {
    // Remove duplicates by resourceId
    const uniqueRecs = recommendations.reduce((acc, rec) => {
      if (!acc.find(existing => existing.resourceId === rec.resourceId)) {
        acc.push(rec);
      }
      return acc;
    }, []);

    // Sort by priority and source
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const sourceOrder = {
      'task-completion': 4,
      'competency-gap': 3,
      'milestone-essential': 2,
      'milestone-recommended': 1,
      'task-progression': 1,
      'milestone-advanced': 0
    };

    return uniqueRecs.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return sourceOrder[b.source] - sourceOrder[a.source];
    }).slice(0, 8); // Limit to top 8 recommendations
  },

  // Cache recommendations for performance
  getCachedRecommendations: (customerId, completedTasks, customerData, usageAssessment) => {
    const cacheKey = `resource_recs_${customerId}_${completedTasks.length}`;
    let cached = TaskCacheManager.get(cacheKey);
    
    if (!cached) {
      cached = TaskResourceMatcher.getSmartRecommendations(
        completedTasks, 
        customerData, 
        usageAssessment
      );
      TaskCacheManager.set(cacheKey, cached, 10 * 60 * 1000); // 10 minute cache
    }
    
    return cached;
  },

  // Invalidate recommendations cache when tasks completed
  invalidateRecommendationsCache: (customerId) => {
    // Find and remove all resource recommendation cache entries for this customer
    TaskCacheManager.invalidateCustomer(customerId);
  }
};

export default TaskResourceMatcher;