// TaskCompletionService.js - Handles task completion tracking and behavioral assessment
import { TaskDataService } from './TaskDataService';
import { TaskCacheManager } from './TaskCacheManager';

export const TaskCompletionService = {
  
  // SESSION MANAGEMENT
  getCurrentSessionId: () => {
    let sessionId = sessionStorage.getItem('taskCompletionSession');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('taskCompletionSession', sessionId);
    }
    return sessionId;
  },

  // TRACK TASK COMPLETION FOR BEHAVIORAL ASSESSMENT
  trackTaskCompletion: async (taskData) => {
    const completionEvent = {
      type: 'task_completion',
      ...taskData,
      sessionId: this.getCurrentSessionId(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: 'simplified_dashboard'
    };
    
    try {
      // Update local usage data immediately
      this.updateLocalUsageData('taskCompletion', completionEvent);
      
      // Save to Airtable (non-blocking)
      this.throttledUpdateUsageData(completionEvent);
      
      // Update competency scores
      this.updateCompetencyProgress(taskData.competencyArea, taskData.priority, taskData.customerId);
      
      // Check for milestone achievements
      this.checkForMilestoneAchievements(taskData);
      
      return completionEvent;
      
    } catch (error) {
      console.error('Error tracking task completion:', error);
      // Don't throw - allow operation to continue
      return completionEvent;
    }
  },

  // UPDATE LOCAL USAGE DATA
  updateLocalUsageData: (eventType, eventData) => {
    try {
      const storageKey = `taskUsageData_${eventData.customerId || 'unknown'}`;
      const existingData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      // Update completion statistics
      existingData.taskCompletions = (existingData.taskCompletions || 0) + 1;
      existingData.lastTaskCompletion = Date.now();
      
      // Track by competency area
      if (!existingData.competencyProgress) {
        existingData.competencyProgress = {};
      }
      existingData.competencyProgress[eventData.competencyArea] = 
        (existingData.competencyProgress[eventData.competencyArea] || 0) + 1;
      
      // Track by priority level
      if (!existingData.priorityCompletions) {
        existingData.priorityCompletions = {};
      }
      existingData.priorityCompletions[eventData.priority] = 
        (existingData.priorityCompletions[eventData.priority] || 0) + 1;
      
      // Track tool usage connection
      if (eventData.toolUsed && eventData.toolUsed !== 'none') {
        if (!existingData.toolConnections) {
          existingData.toolConnections = {};
        }
        existingData.toolConnections[eventData.toolUsed] = 
          (existingData.toolConnections[eventData.toolUsed] || 0) + 1;
      }
      
      // Calculate development velocity
      existingData.developmentVelocity = this.calculateDevelopmentVelocity(existingData);
      
      localStorage.setItem(storageKey, JSON.stringify(existingData));
      
    } catch (error) {
      console.error('Error updating local usage data:', error);
    }
  },

  // THROTTLED SERVER UPDATE (BATCHED)
  throttledUpdateUsageData: (() => {
    let updateQueue = [];
    let isUpdating = false;
    
    const processQueue = async () => {
      if (isUpdating || updateQueue.length === 0) return;
      
      isUpdating = true;
      const batch = updateQueue.splice(0, 5); // Process up to 5 at a time
      
      try {
        // Save each task completion to Airtable
        const savePromises = batch.map(eventData => 
          TaskDataService.saveTaskProgress(
            eventData.customerId,
            {
              id: eventData.taskId,
              name: eventData.taskName,
              competencyArea: eventData.competencyArea,
              priority: eventData.priority,
              category: eventData.milestone
            },
            {
              toolUsed: eventData.toolUsed,
              notes: eventData.notes || `Completed via ${eventData.platform}`,
              competencyGain: eventData.competencyGain
            }
          )
        );
        
        await Promise.allSettled(savePromises);
        
      } catch (error) {
        console.warn('Batch task progress save failed:', error);
      } finally {
        isUpdating = false;
        
        // Process remaining queue after delay
        if (updateQueue.length > 0) {
          setTimeout(processQueue, 2000);
        }
      }
    };
    
    return (eventData) => {
      updateQueue.push(eventData);
      
      // Process queue with debounced delay
      setTimeout(processQueue, 1000);
    };
  })(),

  // UPDATE COMPETENCY SCORES BASED ON TASK TYPE WITH CACHING
  updateCompetencyProgress: (competencyArea, priority, customerId) => {
    if (competencyArea === 'general') return;
    
    const competencyBoosts = {
      critical: 8,
      high: 5,
      medium: 3,
      low: 1
    };
    
    const boost = competencyBoosts[priority] || 1;
    
    try {
      // Get current competency scores
      const currentScores = this.getCurrentCompetencyScores();
      
      // Apply boost
      const updatedScores = {
        ...currentScores,
        [competencyArea]: Math.min(100, (currentScores[competencyArea] || 50) + boost)
      };
      
      // Save updated scores locally
      this.saveCompetencyScores(updatedScores);
      
      // Update cache with new scores
      if (customerId) {
        TaskCacheManager.cacheCompetencyProgress(customerId, updatedScores);
      }
      
      // Trigger competency update event
      this.triggerCompetencyUpdate(competencyArea, boost);
      
    } catch (error) {
      console.error('Error updating competency progress:', error);
    }
  },

  // GET CURRENT COMPETENCY SCORES
  getCurrentCompetencyScores: () => {
    try {
      const scores = localStorage.getItem('competencyScores');
      return scores ? JSON.parse(scores) : {
        customerAnalysis: 50,
        valueCommunication: 50,
        executiveReadiness: 50
      };
    } catch (error) {
      console.error('Error getting competency scores:', error);
      return { customerAnalysis: 50, valueCommunication: 50, executiveReadiness: 50 };
    }
  },

  // SAVE COMPETENCY SCORES
  saveCompetencyScores: (scores) => {
    try {
      localStorage.setItem('competencyScores', JSON.stringify(scores));
      localStorage.setItem('competencyScoresUpdated', Date.now().toString());
    } catch (error) {
      console.error('Error saving competency scores:', error);
    }
  },

  // TRIGGER COMPETENCY UPDATE EVENT
  triggerCompetencyUpdate: (competencyArea, boost) => {
    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('competencyUpdated', {
      detail: { competencyArea, boost, timestamp: Date.now() }
    }));
  },

  // CHECK FOR MILESTONE ACHIEVEMENTS
  checkForMilestoneAchievements: (taskData) => {
    try {
      const currentScores = this.getCurrentCompetencyScores();
      const milestoneTargets = this.getMilestoneTargets(taskData.milestone);
      
      // Check if any competency area reached target
      const achievements = [];
      Object.keys(milestoneTargets).forEach(area => {
        if (currentScores[area] >= milestoneTargets[area]) {
          achievements.push({
            area,
            target: milestoneTargets[area],
            current: currentScores[area]
          });
        }
      });
      
      if (achievements.length > 0) {
        this.triggerMilestoneAchievement(achievements, taskData.milestone);
      }
      
    } catch (error) {
      console.error('Error checking milestone achievements:', error);
    }
  },

  // GET MILESTONE TARGETS
  getMilestoneTargets: (milestoneTier) => {
    const targets = {
      foundation: { customerAnalysis: 70, valueCommunication: 65, executiveReadiness: 50 },
      growth: { customerAnalysis: 85, valueCommunication: 80, executiveReadiness: 75 },
      expansion: { customerAnalysis: 90, valueCommunication: 90, executiveReadiness: 85 }
    };
    
    return targets[milestoneTier] || targets.foundation;
  },

  // TRIGGER MILESTONE ACHIEVEMENT
  triggerMilestoneAchievement: (achievements, milestone) => {
    // Dispatch milestone achievement event
    window.dispatchEvent(new CustomEvent('milestoneAchieved', {
      detail: { achievements, milestone, timestamp: Date.now() }
    }));
    
    // Log achievement for analytics
    console.log('🎯 Milestone Achievement:', achievements);
  },

  // PROFESSIONAL TASK COMPLETION RECOGNITION
  showTaskCompletionRecognition: (task, completionData) => {
    const recognition = {
      message: `${task.name} implementation complete`,
      competencyGain: `${task.competencyArea} capability enhanced (+${completionData.competencyGain} points)`,
      businessImpact: this.getBusinessImpactMessage(task),
      nextSuggestion: this.getNextActionSuggestion(task),
      timestamp: Date.now()
    };
    
    // Dispatch recognition event for UI to handle
    window.dispatchEvent(new CustomEvent('taskRecognition', {
      detail: recognition
    }));
    
    // Log for development
    console.log('🏆 Professional Recognition:', recognition);
    
    // Suggest platform tool if applicable
    if (task.platformConnection) {
      this.suggestPlatformTool(task.platformConnection);
    }
    
    return recognition;
  },

  // GET BUSINESS IMPACT MESSAGE
  getBusinessImpactMessage: (task) => {
    const impactMessages = {
      customerAnalysis: 'Enhanced buyer understanding drives more effective targeting and higher conversion rates',
      valueCommunication: 'Improved value articulation accelerates deal closure and increases average deal size',
      executiveReadiness: 'Strengthened executive capabilities enable scaling and strategic decision-making',
      general: 'Systematic business development progress achieved through structured implementation'
    };
    
    return impactMessages[task.competencyArea] || impactMessages.general;
  },

  // GET NEXT ACTION SUGGESTION
  getNextActionSuggestion: (task) => {
    if (task.platformConnection) {
      return `Continue with ${task.platformConnection.toolName}: ${task.platformConnection.action}`;
    }
    
    const suggestions = {
      customerAnalysis: 'Use ICP Analysis tool to systematically apply this customer intelligence',
      valueCommunication: 'Use Financial Impact Builder to quantify and communicate this value',
      executiveReadiness: 'Access Resource Library for executive-level implementation frameworks',
      general: 'Continue with next recommended action for systematic business development'
    };
    
    return suggestions[task.competencyArea] || suggestions.general;
  },

  // SUGGEST PLATFORM TOOL
  suggestPlatformTool: (platformConnection) => {
    // Dispatch tool suggestion event
    window.dispatchEvent(new CustomEvent('toolSuggestion', {
      detail: {
        tool: platformConnection.tool,
        toolName: platformConnection.toolName,
        connection: platformConnection.connection,
        action: platformConnection.action,
        timestamp: Date.now()
      }
    }));
  },

  // CALCULATE DEVELOPMENT VELOCITY
  calculateDevelopmentVelocity: (usageData) => {
    if (!usageData.taskCompletions || usageData.taskCompletions < 2) {
      return 0;
    }
    
    // Simple velocity calculation based on completion frequency
    const daysSinceStart = (Date.now() - (usageData.firstTaskCompletion || Date.now())) / (1000 * 60 * 60 * 24);
    const completionsPerDay = usageData.taskCompletions / Math.max(1, daysSinceStart);
    
    // Normalize to 0-1 scale (1 completion per day = 1.0 velocity)
    return Math.min(1, completionsPerDay);
  },

  // ENHANCE USAGE ASSESSMENT WITH TASK DATA
  enhanceUsageAssessmentWithTasks: (baseAssessment, customerId) => {
    try {
      const storageKey = `taskUsageData_${customerId}`;
      const taskData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      const taskBasedScoring = {
        // Task completion rate as competency indicator
        completionRate: this.calculateTaskCompletionRate(taskData),
        
        // Task complexity progression as skill indicator  
        complexityProgression: this.analyzeTaskComplexityProgression(taskData),
        
        // Task-to-tool usage correlation
        implementationFollow: this.analyzeToolUsageAfterTasks(taskData),
        
        // Professional development pace
        developmentVelocity: taskData.developmentVelocity || 0
      };
      
      return {
        ...baseAssessment,
        taskIntelligence: taskBasedScoring,
        overallCompetency: this.combineAssessments(baseAssessment, taskBasedScoring)
      };
      
    } catch (error) {
      console.error('Error enhancing usage assessment with tasks:', error);
      return baseAssessment;
    }
  },

  // CALCULATE TASK COMPLETION RATE
  calculateTaskCompletionRate: (taskData) => {
    if (!taskData.taskCompletions) return 0;
    
    // Calculate based on available tasks vs completed
    const availableTasks = 10; // Estimate based on milestone
    return Math.min(1, taskData.taskCompletions / availableTasks);
  },

  // ANALYZE TASK COMPLEXITY PROGRESSION
  analyzeTaskComplexityProgression: (taskData) => {
    if (!taskData.priorityCompletions) return 0;
    
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    let totalComplexity = 0;
    let totalTasks = 0;
    
    Object.keys(taskData.priorityCompletions).forEach(priority => {
      const count = taskData.priorityCompletions[priority];
      totalComplexity += weights[priority] * count;
      totalTasks += count;
    });
    
    return totalTasks > 0 ? totalComplexity / (totalTasks * 4) : 0; // Normalize to 0-1
  },

  // ANALYZE TOOL USAGE AFTER TASKS
  analyzeToolUsageAfterTasks: (taskData) => {
    if (!taskData.toolConnections) return 0;
    
    // Calculate percentage of tasks that led to tool usage
    const toolUsageCount = Object.values(taskData.toolConnections).reduce((sum, count) => sum + count, 0);
    const totalTasks = taskData.taskCompletions || 1;
    
    return Math.min(1, toolUsageCount / totalTasks);
  },

  // COMBINE ASSESSMENTS
  combineAssessments: (baseAssessment, taskBasedScoring) => {
    // Weighted combination of base assessment and task-based scoring
    const baseWeight = 0.6;
    const taskWeight = 0.4;
    
    const baseScore = baseAssessment.overallScore || 50;
    const taskScore = (
      taskBasedScoring.completionRate * 25 +
      taskBasedScoring.complexityProgression * 25 +
      taskBasedScoring.implementationFollow * 25 +
      taskBasedScoring.developmentVelocity * 25
    );
    
    return Math.round(baseScore * baseWeight + taskScore * taskWeight);
  }
};

export default TaskCompletionService;