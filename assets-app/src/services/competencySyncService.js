/**
 * Competency Synchronization Service - Phase 4
 * 
 * Handles efficient data synchronization between frontend and Airtable
 * Manages caching, batching, and optimistic updates for performance
 */

import enhancedAirtableService from './enhancedAirtableService';
import assessmentService from './assessmentService';

class CompetencySyncService {
  constructor() {
    this.cache = new Map();
    this.pendingUpdates = new Map();
    this.syncInterval = null;
    this.syncIntervalMs = 30000; // Sync every 30 seconds
    this.batchSize = 10;
  }

  /**
   * Initialize sync service for a customer
   */
  async initialize(customerId) {
    try {
      // Load initial data
      const competencyData = await enhancedAirtableService.getCustomerCompetencyData(customerId);
      
      if (!competencyData) {
        throw new Error('Customer not found');
      }

      // Cache the data
      this.cache.set(customerId, {
        data: competencyData,
        lastSync: new Date().toISOString(),
        isDirty: false
      });

      // Start periodic sync if not already running
      if (!this.syncInterval) {
        this.startPeriodicSync();
      }

      return competencyData;
    } catch (error) {
      console.error('Error initializing competency sync:', error);
      throw error;
    }
  }

  /**
   * Get cached competency data with fallback to API
   */
  async getCompetencyData(customerId) {
    const cached = this.cache.get(customerId);
    
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    // Fetch fresh data
    return await this.initialize(customerId);
  }

  /**
   * Track action with optimistic update
   */
  async trackAction(customerId, actionData) {
    try {
      // Calculate points locally
      const points = assessmentService.calculateActionPoints(actionData);
      
      // Optimistic update to cache
      const cached = this.cache.get(customerId);
      if (cached) {
        cached.data.totalProgressPoints += points;
        
        // Update category score
        const scoreIncrease = points / 10;
        switch (actionData.category) {
          case 'customerAnalysis':
            cached.data.currentCustomerAnalysis = Math.min(100, 
              cached.data.currentCustomerAnalysis + scoreIncrease);
            break;
          case 'valueCommunication':
            cached.data.currentValueCommunication = Math.min(100,
              cached.data.currentValueCommunication + scoreIncrease);
            break;
          case 'salesExecution':
            cached.data.currentSalesExecution = Math.min(100,
              cached.data.currentSalesExecution + scoreIncrease);
            break;
        }
        
        // Add to recent actions
        cached.data.recentActions.unshift({
          ...actionData,
          pointsAwarded: points,
          actionDate: new Date().toISOString(),
          verified: true
        });
        
        cached.isDirty = true;
      }

      // Queue for sync
      this.queueUpdate(customerId, 'action', {
        ...actionData,
        pointsAwarded: points
      });

      // Sync to Airtable (async, don't wait)
      this.syncActionToAirtable(customerId, actionData, points);

      return {
        success: true,
        pointsAwarded: points,
        newTotal: cached?.data.totalProgressPoints || 0
      };
    } catch (error) {
      console.error('Error tracking action:', error);
      throw error;
    }
  }

  /**
   * Sync action to Airtable (async)
   */
  async syncActionToAirtable(customerId, actionData, points) {
    try {
      await enhancedAirtableService.trackRealWorldAction(customerId, {
        ...actionData,
        pointsAwarded: points,
        actionDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error syncing action to Airtable:', error);
      // Store for retry
      this.queueUpdate(customerId, 'action_retry', {
        ...actionData,
        pointsAwarded: points,
        retryCount: 1
      });
    }
  }

  /**
   * Update achievement status
   */
  async unlockAchievement(customerId, achievementId, bonusPoints) {
    try {
      // Optimistic update
      const cached = this.cache.get(customerId);
      if (cached) {
        if (!cached.data.achievementIds.includes(achievementId)) {
          cached.data.achievementIds.push(achievementId);
          cached.data.totalProgressPoints += bonusPoints;
          cached.isDirty = true;
        }
      }

      // Queue for sync
      this.queueUpdate(customerId, 'achievement', {
        achievementId,
        bonusPoints
      });

      // Sync to Airtable
      await enhancedAirtableService.unlockAchievement(customerId, achievementId, bonusPoints);

      return { success: true };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  /**
   * Record assessment with history tracking
   */
  async recordAssessment(customerId, assessmentData) {
    try {
      // Update cache
      const cached = this.cache.get(customerId);
      if (cached) {
        cached.data.currentCustomerAnalysis = assessmentData.customerAnalysisScore;
        cached.data.currentValueCommunication = assessmentData.valueCommunicationScore;
        cached.data.currentSalesExecution = assessmentData.salesExecutionScore;
        cached.data.lastAssessmentDate = new Date().toISOString();
        cached.isDirty = true;
      }

      // Sync to Airtable
      await enhancedAirtableService.recordAssessmentResults(customerId, {
        ...assessmentData,
        updateCurrent: true
      });

      return { success: true };
    } catch (error) {
      console.error('Error recording assessment:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analytics data
   */
  async getAnalyticsData(customerId) {
    try {
      const competencyData = await this.getCompetencyData(customerId);
      const actionStats = await enhancedAirtableService.getActionStatistics(customerId);
      const insights = assessmentService.generateCompetencyInsights(competencyData);
      const developmentPlan = assessmentService.generateDevelopmentPlan(competencyData);

      return {
        competencyData,
        actionStats,
        insights,
        developmentPlan,
        learningVelocity: await enhancedAirtableService.calculateLearningVelocity(customerId)
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  /**
   * Queue update for batch processing
   */
  queueUpdate(customerId, type, data) {
    if (!this.pendingUpdates.has(customerId)) {
      this.pendingUpdates.set(customerId, []);
    }
    
    this.pendingUpdates.get(customerId).push({
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Process pending updates
   */
  async processPendingUpdates() {
    if (this.pendingUpdates.size === 0) return;

    for (const [customerId, updates] of this.pendingUpdates.entries()) {
      try {
        // Group updates by type
        const actions = updates.filter(u => u.type === 'action');
        const achievements = updates.filter(u => u.type === 'achievement');
        const retries = updates.filter(u => u.type === 'action_retry');

        // Process actions in batch
        if (actions.length > 0) {
          for (const action of actions) {
            await enhancedAirtableService.trackRealWorldAction(customerId, action.data);
          }
        }

        // Process achievements
        if (achievements.length > 0) {
          for (const achievement of achievements) {
            await enhancedAirtableService.unlockAchievement(
              customerId, 
              achievement.data.achievementId, 
              achievement.data.bonusPoints
            );
          }
        }

        // Retry failed actions
        if (retries.length > 0) {
          for (const retry of retries) {
            if (retry.data.retryCount < 3) {
              await enhancedAirtableService.trackRealWorldAction(customerId, retry.data);
            }
          }
        }

        // Clear processed updates
        this.pendingUpdates.delete(customerId);
      } catch (error) {
        console.error(`Error processing updates for ${customerId}:`, error);
      }
    }
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync() {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.processPendingUpdates();
      this.syncDirtyCache();
    }, this.syncIntervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync dirty cache entries
   */
  async syncDirtyCache() {
    for (const [customerId, cached] of this.cache.entries()) {
      if (cached.isDirty) {
        try {
          await enhancedAirtableService.updateCustomerCompetencyScores(customerId, {
            currentCustomerAnalysis: cached.data.currentCustomerAnalysis,
            currentValueCommunication: cached.data.currentValueCommunication,
            currentSalesExecution: cached.data.currentSalesExecution,
            totalProgressPoints: cached.data.totalProgressPoints,
            achievementIds: cached.data.achievementIds
          });
          
          cached.isDirty = false;
          cached.lastSync = new Date().toISOString();
        } catch (error) {
          console.error(`Error syncing cache for ${customerId}:`, error);
        }
      }
    }
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(cached) {
    const cacheAge = Date.now() - new Date(cached.lastSync).getTime();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    return cacheAge < maxAge;
  }

  /**
   * Force refresh cache for a customer
   */
  async refreshCache(customerId) {
    return await this.initialize(customerId);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    this.pendingUpdates.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedCustomers: this.cache.size,
      pendingUpdates: Array.from(this.pendingUpdates.entries()).reduce(
        (sum, [_, updates]) => sum + updates.length, 0
      ),
      dirtyEntries: Array.from(this.cache.values()).filter(c => c.isDirty).length
    };
  }
}

// Export singleton instance
export const competencySyncService = new CompetencySyncService();
export default competencySyncService;