// TaskDataService.js - Handles task data fetching and filtering from Airtable
import { TaskRecommendationEngine } from './TaskRecommendationEngine';
import { TaskCacheManager } from './TaskCacheManager';

export const TaskDataService = {
  
  // AIRTABLE CONFIGURATION
  config: {
    baseId: process.env.REACT_APP_AIRTABLE_BASE_ID || 'app0jJkgTCqn46vp9',
    apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
    tables: {
      seedTasks: 'Seed_Tasks',
      seriesATasks: 'Series_A_Tasks',
      taskProgress: 'Customer Task Progress'
    }
  },

  // FETCH TASKS FROM AIRTABLE WITH FILTERING AND CACHING
  fetchTasksForCustomer: async (customerData, usageAssessment) => {
    const customerId = customerData.customerId || 'unknown';
    const milestone = customerData.milestone || { tier: 'foundation' };
    const competencyScores = customerData.competencyScores || {};
    
    try {
      // Try to get from cache first
      const cacheKey = `${customerId}_${milestone.tier}_${JSON.stringify(milestone.milestoneCategories || [])}`;
      const cachedTasks = TaskCacheManager.getCachedCustomerTasks(customerId, cacheKey);
      
      if (cachedTasks) {
        console.log('TaskDataService: Using cached tasks');
        return cachedTasks;
      }
      
      // TEMPORARY: Skip Airtable fetch since task tables don't exist yet
      // Use default tasks instead of trying to fetch from non-existent tables
      console.log('TaskDataService: Using default tasks (task tables not yet created)');
      const defaultTasks = TaskRecommendationEngine.getDefaultTasksForMilestone(milestone.tier);
      
      // Ensure milestone has targets for calculations
      const milestoneWithTargets = {
        ...milestone,
        targets: milestone.targets || {
          customerAnalysis: 70,
          valueCommunication: 65,
          executiveReadiness: 50
        }
      };
      
      const prioritizedTasks = TaskDataService.prioritizeTasksForUser(defaultTasks, competencyScores, usageAssessment, milestoneWithTargets);
      
      // Cache the results
      TaskCacheManager.cacheCustomerTasks(customerId, cacheKey, prioritizedTasks);
      
      return prioritizedTasks;
      
    } catch (error) {
      console.error('Error in fetchTasksForCustomer:', error);
      
      // Graceful degradation with default tasks
      const defaultTasks = TaskRecommendationEngine.getDefaultTasksForMilestone(milestone.tier);
      
      // Ensure milestone has targets for calculations
      const milestoneWithTargets = {
        ...milestone,
        targets: milestone.targets || {
          customerAnalysis: 70,
          valueCommunication: 65,
          executiveReadiness: 50
        }
      };
      
      const fallbackTasks = TaskDataService.prioritizeTasksForUser(defaultTasks, competencyScores, usageAssessment, milestoneWithTargets);
      
      // Cache fallback tasks with shorter duration
      const cacheKey = `${customerId}_${milestone.tier}_fallback`;
      TaskCacheManager.set(cacheKey, fallbackTasks, 60 * 1000); // 1 minute cache for fallback
      
      return fallbackTasks;
    }
  },

  // BUILD AIRTABLE FILTER BASED ON MILESTONE DATA
  buildTaskFilter: (milestone, competencyScores) => {
    const { milestoneCategories, revenueRange } = milestone || {};
    
    // Create OR condition for milestone categories
    const categoryFilter = (milestoneCategories || []).map(category => 
      `{Stage Milestone} = "${category}"`
    ).join(', ');
    
    // Revenue range filter
    const revenueFilter = revenueRange ? `{Ideal Revenue Goal} = "${revenueRange}"` : '';
    
    // Optional: Priority filter based on competency gaps
    const hasLowCompetencies = competencyScores && Object.values(competencyScores).some(score => score < 60);
    const priorityFilter = hasLowCompetencies ? `, {Priority} = "High"` : '';
    
    // Build filter with fallback
    if (!categoryFilter && !revenueFilter) {
      return '{Priority} = "High"'; // Default filter
    }
    
    const filters = [];
    if (categoryFilter) filters.push(`OR(${categoryFilter})`);
    if (revenueFilter) filters.push(revenueFilter);
    
    return filters.length > 0 ? `AND(${filters.join(', ')}${priorityFilter})` : '{Priority} = "High"';
  },

  // FETCH FILTERED TASKS FROM SPECIFIC TABLE(S)
  fetchFilteredTasks: async (tableSource, filter) => {
    const tasks = [];
    
    try {
      // Determine which tables to query
      const tablesToQuery = TaskDataService.getTableNamesForSource(tableSource);
      
      // Fetch from each table
      for (const tableName of tablesToQuery) {
        const tableTasks = await TaskDataService.fetchFromTable(tableName, filter);
        tasks.push(...tableTasks);
      }
      
      return tasks;
      
    } catch (error) {
      console.error('Error fetching filtered tasks:', error);
      return [];
    }
  },

  // GET TABLE NAMES BASED ON SOURCE
  getTableNamesForSource: (source) => {
    switch (source) {
      case 'seed':
        return [TaskDataService.config.tables.seedTasks];
      case 'series-a':
        return [TaskDataService.config.tables.seriesATasks];
      case 'both':
        return [TaskDataService.config.tables.seedTasks, TaskDataService.config.tables.seriesATasks];
      default:
        return [TaskDataService.config.tables.seedTasks];
    }
  },

  // FETCH TASKS FROM SPECIFIC AIRTABLE
  fetchFromTable: async (tableName, filter) => {
    const url = `https://api.airtable.com/v0/${TaskDataService.config.baseId}/${tableName}`;
    
    const params = new URLSearchParams({
      filterByFormula: filter,
      maxRecords: '10', // Limit to prevent overwhelming user
      sort: JSON.stringify([{ field: 'Priority', direction: 'desc' }])
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${TaskDataService.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Airtable records to task objects
    return data.records.map(record => TaskDataService.transformAirtableRecord(record, tableName));
  },

  // TRANSFORM AIRTABLE RECORD TO TASK OBJECT
  transformAirtableRecord: (record, sourceTable) => {
    const fields = record.fields;
    
    return {
      id: record.id,
      name: fields['Task Name'] || fields['Name'] || 'Unnamed Task',
      description: fields['Description'] || '',
      category: fields['Stage Milestone'] || fields['Category'] || 'General',
      stageMilestone: fields['Stage Milestone'] || '',
      priority: TaskDataService.mapPriorityFromAirtable(fields['Priority']),
      revenueGoal: fields['Ideal Revenue Goal'] || '',
      competencyArea: '', // Will be calculated in prioritizeTasksForUser
      platformConnection: null, // Will be calculated in prioritizeTasksForUser
      sourceTable: sourceTable,
      estimatedTime: fields['Estimated Time'] || '30 min',
      businessImpact: fields['Business Impact'] || '',
      prerequisites: fields['Prerequisites'] || '',
      resources: fields['Related Resources'] || [],
      createdTime: record.createdTime
    };
  },

  // MAP PRIORITY FROM AIRTABLE TO STANDARD FORMAT
  mapPriorityFromAirtable: (airtablePriority) => {
    const priorityMap = {
      'Critical': 'critical',
      'High': 'high',
      'Medium': 'medium',
      'Low': 'low',
      'Must Have': 'critical',
      'Should Have': 'high',
      'Could Have': 'medium',
      'Won\'t Have': 'low'
    };
    
    return priorityMap[airtablePriority] || 'medium';
  },

  // PRIORITIZE TASKS FOR USER BASED ON COMPETENCY GAPS
  prioritizeTasksForUser: (tasks, competencyScores, usageAssessment, milestone) => {
    return tasks
      .map(task => {
        // Add competency mapping
        const competencyArea = TaskRecommendationEngine.mapTaskToCompetency(task.name);
        
        // Add platform tool connection
        const platformConnection = TaskRecommendationEngine.getToolRecommendation(task.name);
        
        // Calculate priority based on competency gap
        const calculatedPriority = TaskRecommendationEngine.calculateTaskPriority(
          task, 
          competencyScores, 
          milestone
        );
        
        // Use calculated priority if higher than existing
        const finalPriority = TaskDataService.getHigherPriority(task.priority, calculatedPriority);
        
        return {
          ...task,
          competencyArea,
          platformConnection,
          priority: finalPriority,
          competencyGap: TaskDataService.calculateCompetencyGap(competencyArea, competencyScores, milestone),
          relevanceScore: TaskDataService.calculateRelevanceScore(task, competencyScores, usageAssessment)
        };
      })
      .sort((a, b) => {
        // Sort by priority first, then relevance score
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by relevance score
        return b.relevanceScore - a.relevanceScore;
      })
      .slice(0, 5); // Limit to top 5 recommendations
  },

  // GET HIGHER PRIORITY BETWEEN TWO VALUES
  getHigherPriority: (priority1, priority2) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const score1 = priorityOrder[priority1] || 2;
    const score2 = priorityOrder[priority2] || 2;
    
    return score1 >= score2 ? priority1 : priority2;
  },

  // CALCULATE COMPETENCY GAP FOR TASK
  calculateCompetencyGap: (competencyArea, competencyScores, milestone) => {
    if (competencyArea === 'general') return 0;
    
    const currentScore = competencyScores[competencyArea] || 50;
    const targetScore = milestone?.targets?.[competencyArea] || 70;
    
    return Math.max(0, targetScore - currentScore);
  },

  // CALCULATE RELEVANCE SCORE BASED ON USAGE PATTERNS
  calculateRelevanceScore: (task, competencyScores, usageAssessment) => {
    let score = 50; // Base score
    
    // Boost if competency area has low score
    const competencyGap = TaskDataService.calculateCompetencyGap(task.competencyArea, competencyScores, { targets: {} });
    score += competencyGap * 2;
    
    // Boost if user has used related platform tool
    if (task.platformConnection && usageAssessment) {
      const toolUsage = TaskDataService.getToolUsageScore(task.platformConnection.tool, usageAssessment);
      score += toolUsage;
    }
    
    // Boost for higher priority tasks
    const priorityBoost = { critical: 20, high: 15, medium: 10, low: 5 };
    score += priorityBoost[task.priority] || 5;
    
    return Math.min(100, score);
  },

  // GET TOOL USAGE SCORE FROM USAGE ASSESSMENT
  getToolUsageScore: (toolName, usageAssessment) => {
    if (!usageAssessment || !usageAssessment.usage) return 0;
    
    const usage = usageAssessment.usage;
    
    switch (toolName) {
      case 'icp':
        return (usage.icpProgress || 0) / 5; // Convert percentage to 0-20 score
      case 'financial':
        return (usage.financialProgress || 0) / 5;
      case 'resources':
        return Math.min(20, (usage.resourcesAccessed || 0) * 2);
      default:
        return 0;
    }
  },

  // FETCH UPCOMING TASKS FOR NEXT MILESTONE WITH CACHING
  fetchUpcomingTasks: async (currentMilestone, competencyScores) => {
    try {
      // Try cache first
      const cacheKey = `upcoming_${currentMilestone.tier}`;
      const cachedUpcoming = TaskCacheManager.getCachedUpcomingTasks(cacheKey);
      
      if (cachedUpcoming) {
        console.log('TaskDataService: Using cached upcoming tasks');
        return cachedUpcoming;
      }
      
      const nextMilestone = TaskRecommendationEngine.getNextMilestone(currentMilestone);
      if (!nextMilestone) return [];
      
      // Create mock customer data for next milestone
      const nextMilestoneData = {
        ...nextMilestone,
        targets: TaskDataService.getTargetsForMilestone(nextMilestone.tier)
      };
      
      const filter = TaskDataService.buildTaskFilter(nextMilestoneData, competencyScores);
      const tasks = await TaskDataService.fetchFilteredTasks(nextMilestoneData.taskTableSource, filter);
      
      const upcomingTasks = tasks.slice(0, 2); // Limit to 2 preview tasks
      
      // Cache upcoming tasks
      TaskCacheManager.cacheUpcomingTasks(cacheKey, upcomingTasks);
      
      return upcomingTasks;
      
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      return [];
    }
  },

  // GET TARGETS FOR MILESTONE TIER
  getTargetsForMilestone: (tier) => {
    const milestoneTargets = {
      foundation: { customerAnalysis: 70, valueCommunication: 65, executiveReadiness: 50 },
      growth: { customerAnalysis: 85, valueCommunication: 80, executiveReadiness: 75 },
      expansion: { customerAnalysis: 90, valueCommunication: 90, executiveReadiness: 85 }
    };
    
    return milestoneTargets[tier] || milestoneTargets.foundation;
  },

  // SAVE TASK PROGRESS TO AIRTABLE WITH CACHE INVALIDATION
  saveTaskProgress: async (customerId, taskData, completionData) => {
    try {
      const url = `https://api.airtable.com/v0/${TaskDataService.config.baseId}/${TaskDataService.config.tables.taskProgress}`;
      
      const record = {
        fields: {
          'Customer ID': customerId,
          'Task ID': taskData.id,
          'Task Name': taskData.name,
          'Task Source': taskData.sourceTable || 'default',
          'Stage Milestone': taskData.stageMilestone || taskData.category,
          'Competency Area': taskData.competencyArea || 'general',
          'Priority Level': taskData.priority || 'medium',
          'Status': 'completed',
          'Completed Date': new Date().toISOString(),
          'Platform Tool Used': completionData.toolUsed || 'none',
          'Completion Notes': completionData.notes || '',
          'Competency Impact': completionData.competencyGain || 0
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TaskDataService.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error(`Failed to save task progress: ${response.status}`);
      }

      const result = await response.json();
      
      // Invalidate related cache entries since task completion affects recommendations
      TaskCacheManager.invalidateCustomer(customerId);
      
      // Update competency cache with optimistic update
      TaskDataService.updateCompetencyCache(customerId, taskData.competencyArea, completionData.competencyGain);
      
      return result;
      
    } catch (error) {
      console.error('Error saving task progress:', error);
      // Don't throw - allow operation to continue even if logging fails
      return null;
    }
  },

  // PERFORMANCE OPTIMIZATION METHODS

  // Preload critical data for dashboard
  preloadDashboardData: async (customerId, milestone, competencyScores) => {
    const dataLoaders = {
      fetchTasks: (custId, ms) => TaskDataService.fetchTasksForCustomer({ 
        customerId: custId, 
        milestone: ms, 
        competencyScores 
      }, {}),
      fetchUpcoming: (ms) => TaskDataService.fetchUpcomingTasks(ms, competencyScores),
      fetchCompetency: (custId) => Promise.resolve(competencyScores)
    };
    
    await TaskCacheManager.preloadCriticalData(customerId, milestone.tier, dataLoaders);
  },

  // Update competency cache optimistically
  updateCompetencyCache: (customerId, competencyArea, gain) => {
    const cachedScores = TaskCacheManager.getCachedCompetencyProgress(customerId);
    if (cachedScores) {
      const updatedScores = {
        ...cachedScores,
        [competencyArea]: Math.min(100, (cachedScores[competencyArea] || 50) + gain)
      };
      TaskCacheManager.cacheCompetencyProgress(customerId, updatedScores);
    }
  },

  // Invalidate customer cache when major changes occur
  invalidateCustomerCache: (customerId) => {
    return TaskCacheManager.invalidateCustomer(customerId);
  },

  // Invalidate milestone cache when milestone changes
  invalidateMilestoneCache: (milestone) => {
    return TaskCacheManager.invalidateMilestone(milestone);
  },

  // Get cache performance statistics
  getCacheStatistics: () => {
    return TaskCacheManager.getStatistics();
  },

  // Start background cache cleanup
  startCacheCleanup: () => {
    return TaskCacheManager.startBackgroundCleanup();
  },

  // Clear all cache (for testing or troubleshooting)
  clearCache: () => {
    return TaskCacheManager.clear();
  }
};

export default TaskDataService;