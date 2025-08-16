// TaskCacheManager.js - Intelligent caching for task system performance optimization
export const TaskCacheManager = {
  
  // CACHE CONFIGURATION
  CACHE_DURATION: {
    tasks: 5 * 60 * 1000,      // 5 minutes for task data
    milestones: 10 * 60 * 1000, // 10 minutes for milestone data
    competency: 2 * 60 * 1000,  // 2 minutes for competency scores
    progress: 30 * 1000         // 30 seconds for progress data
  },
  
  CACHE_KEYS: {
    customerTasks: (customerId, milestone) => `tasks_${customerId}_${milestone}`,
    milestoneData: (milestone) => `milestone_${milestone}`,
    competencyScores: (customerId) => `competency_${customerId}`,
    taskProgress: (customerId) => `progress_${customerId}`,
    upcomingTasks: (milestone) => `upcoming_${milestone}`
  },

  // MEMORY CACHE STORAGE
  memoryCache: new Map(),
  
  // CACHE STATISTICS
  statistics: {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  },

  // SET CACHE ENTRY
  set: (key, data, duration = null) => {
    try {
      const entry = {
        data,
        timestamp: Date.now(),
        duration: duration || TaskCacheManager.CACHE_DURATION.tasks,
        accessCount: 0,
        lastAccessed: Date.now()
      };
      
      // Check cache size and evict if necessary
      TaskCacheManager.evictIfNecessary();
      
      TaskCacheManager.memoryCache.set(key, entry);
      TaskCacheManager.statistics.size = TaskCacheManager.memoryCache.size;
      
      // Also store in localStorage as backup
      TaskCacheManager.setLocalStorageCache(key, entry);
      
      return true;
      
    } catch (error) {
      console.warn('TaskCacheManager: Failed to set cache entry:', error);
      return false;
    }
  },

  // GET CACHE ENTRY
  get: (key) => {
    try {
      // Check memory cache first
      let entry = TaskCacheManager.memoryCache.get(key);
      
      // Fallback to localStorage
      if (!entry) {
        entry = TaskCacheManager.getLocalStorageCache(key);
        if (entry) {
          // Restore to memory cache
          TaskCacheManager.memoryCache.set(key, entry);
        }
      }
      
      // Check if entry exists and is valid
      if (!entry || TaskCacheManager.isExpired(entry)) {
        TaskCacheManager.statistics.misses++;
        TaskCacheManager.delete(key);
        return null;
      }
      
      // Update access statistics
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      TaskCacheManager.statistics.hits++;
      
      return entry.data;
      
    } catch (error) {
      console.warn('TaskCacheManager: Failed to get cache entry:', error);
      TaskCacheManager.statistics.misses++;
      return null;
    }
  },

  // DELETE CACHE ENTRY
  delete: (key) => {
    try {
      TaskCacheManager.memoryCache.delete(key);
      localStorage.removeItem(`taskCache_${key}`);
      TaskCacheManager.statistics.size = TaskCacheManager.memoryCache.size;
      return true;
    } catch (error) {
      console.warn('TaskCacheManager: Failed to delete cache entry:', error);
      return false;
    }
  },

  // CHECK IF ENTRY IS EXPIRED
  isExpired: (entry) => {
    const age = Date.now() - entry.timestamp;
    return age > entry.duration;
  },

  // EVICT OLD ENTRIES WHEN CACHE IS FULL
  evictIfNecessary: () => {
    const maxSize = 50; // Maximum number of cache entries
    
    if (TaskCacheManager.memoryCache.size >= maxSize) {
      // Sort by last accessed time and remove oldest
      const entries = Array.from(TaskCacheManager.memoryCache.entries());
      entries.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
      
      // Remove oldest 20% of entries
      const toRemove = Math.ceil(maxSize * 0.2);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        const [key] = entries[i];
        TaskCacheManager.delete(key);
        TaskCacheManager.statistics.evictions++;
      }
    }
  },

  // CLEAR ALL CACHE
  clear: () => {
    try {
      TaskCacheManager.memoryCache.clear();
      
      // Clear localStorage entries
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('taskCache_')) {
          localStorage.removeItem(key);
        }
      });
      
      TaskCacheManager.statistics = {
        hits: 0,
        misses: 0,
        evictions: 0,
        size: 0
      };
      
      return true;
    } catch (error) {
      console.warn('TaskCacheManager: Failed to clear cache:', error);
      return false;
    }
  },

  // INVALIDATE CUSTOMER-SPECIFIC CACHE
  invalidateCustomer: (customerId) => {
    try {
      const keysToDelete = [];
      
      // Find all keys related to this customer
      TaskCacheManager.memoryCache.forEach((entry, key) => {
        if (key.includes(customerId)) {
          keysToDelete.push(key);
        }
      });
      
      // Delete found keys
      keysToDelete.forEach(key => TaskCacheManager.delete(key));
      
      console.log(`TaskCacheManager: Invalidated ${keysToDelete.length} entries for customer ${customerId}`);
      return keysToDelete.length;
      
    } catch (error) {
      console.warn('TaskCacheManager: Failed to invalidate customer cache:', error);
      return 0;
    }
  },

  // INVALIDATE MILESTONE-SPECIFIC CACHE
  invalidateMilestone: (milestone) => {
    try {
      const keysToDelete = [];
      
      TaskCacheManager.memoryCache.forEach((entry, key) => {
        if (key.includes(milestone)) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => TaskCacheManager.delete(key));
      
      console.log(`TaskCacheManager: Invalidated ${keysToDelete.length} entries for milestone ${milestone}`);
      return keysToDelete.length;
      
    } catch (error) {
      console.warn('TaskCacheManager: Failed to invalidate milestone cache:', error);
      return 0;
    }
  },

  // PRELOAD CRITICAL DATA
  preloadCriticalData: async (customerId, milestone, dataLoaders) => {
    try {
      const preloadTasks = [];
      
      // Preload tasks for current milestone
      const tasksKey = TaskCacheManager.CACHE_KEYS.customerTasks(customerId, milestone);
      if (!TaskCacheManager.get(tasksKey) && dataLoaders.fetchTasks) {
        preloadTasks.push(
          dataLoaders.fetchTasks(customerId, milestone).then(data => 
            TaskCacheManager.set(tasksKey, data, TaskCacheManager.CACHE_DURATION.tasks)
          ).catch(error => console.warn('Failed to preload tasks:', error))
        );
      }
      
      // Preload milestone data
      const milestoneKey = TaskCacheManager.CACHE_KEYS.milestoneData(milestone);
      if (!TaskCacheManager.get(milestoneKey) && dataLoaders.fetchMilestone) {
        preloadTasks.push(
          dataLoaders.fetchMilestone(milestone).then(data =>
            TaskCacheManager.set(milestoneKey, data, TaskCacheManager.CACHE_DURATION.milestones)
          ).catch(error => console.warn('Failed to preload milestone:', error))
        );
      }
      
      // Preload competency scores
      const competencyKey = TaskCacheManager.CACHE_KEYS.competencyScores(customerId);
      if (!TaskCacheManager.get(competencyKey) && dataLoaders.fetchCompetency) {
        preloadTasks.push(
          dataLoaders.fetchCompetency(customerId).then(data =>
            TaskCacheManager.set(competencyKey, data, TaskCacheManager.CACHE_DURATION.competency)
          ).catch(error => console.warn('Failed to preload competency:', error))
        );
      }
      
      // Execute all preload tasks in parallel
      await Promise.allSettled(preloadTasks);
      
      console.log(`TaskCacheManager: Preloaded ${preloadTasks.length} data sets for customer ${customerId}`);
      
    } catch (error) {
      console.warn('TaskCacheManager: Failed to preload critical data:', error);
    }
  },

  // CACHE WITH OPTIMISTIC UPDATES
  setWithOptimisticUpdate: (key, data, updateCallback, duration) => {
    // Immediately set the data in cache
    TaskCacheManager.set(key, data, duration);
    
    // Asynchronously update the server
    if (updateCallback) {
      updateCallback(data).catch(error => {
        console.warn('TaskCacheManager: Optimistic update failed, invalidating cache:', error);
        TaskCacheManager.delete(key);
      });
    }
  },

  // GET CACHE STATISTICS
  getStatistics: () => {
    const hitRate = TaskCacheManager.statistics.hits + TaskCacheManager.statistics.misses > 0 
      ? (TaskCacheManager.statistics.hits / (TaskCacheManager.statistics.hits + TaskCacheManager.statistics.misses) * 100).toFixed(1)
      : 0;
      
    return {
      ...TaskCacheManager.statistics,
      hitRate: `${hitRate}%`,
      memoryUsage: TaskCacheManager.memoryCache.size,
      localStorageKeys: Object.keys(localStorage).filter(key => key.startsWith('taskCache_')).length
    };
  },

  // BACKGROUND CLEANUP
  startBackgroundCleanup: () => {
    // Run cleanup every 2 minutes
    const cleanupInterval = setInterval(() => {
      TaskCacheManager.cleanupExpiredEntries();
    }, 2 * 60 * 1000);
    
    // Return cleanup function
    return () => clearInterval(cleanupInterval);
  },

  // CLEANUP EXPIRED ENTRIES
  cleanupExpiredEntries: () => {
    try {
      let cleaned = 0;
      const keysToDelete = [];
      
      TaskCacheManager.memoryCache.forEach((entry, key) => {
        if (TaskCacheManager.isExpired(entry)) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => {
        TaskCacheManager.delete(key);
        cleaned++;
      });
      
      if (cleaned > 0) {
        console.log(`TaskCacheManager: Cleaned up ${cleaned} expired entries`);
      }
      
      return cleaned;
      
    } catch (error) {
      console.warn('TaskCacheManager: Failed to cleanup expired entries:', error);
      return 0;
    }
  },

  // LOCALSTORAGE CACHE HELPERS
  setLocalStorageCache: (key, entry) => {
    try {
      const storageKey = `taskCache_${key}`;
      const storageData = {
        data: entry.data,
        timestamp: entry.timestamp,
        duration: entry.duration
      };
      localStorage.setItem(storageKey, JSON.stringify(storageData));
    } catch (error) {
      // localStorage quota exceeded or other error - continue silently
    }
  },

  getLocalStorageCache: (key) => {
    try {
      const storageKey = `taskCache_${key}`;
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      return {
        data: parsed.data,
        timestamp: parsed.timestamp,
        duration: parsed.duration,
        accessCount: 0,
        lastAccessed: Date.now()
      };
    } catch (error) {
      return null;
    }
  },

  // HIGH-LEVEL CACHE OPERATIONS FOR TASK SYSTEM
  
  // Cache customer tasks with intelligent key generation
  cacheCustomerTasks: (customerId, milestone, tasks) => {
    const key = TaskCacheManager.CACHE_KEYS.customerTasks(customerId, milestone);
    return TaskCacheManager.set(key, tasks, TaskCacheManager.CACHE_DURATION.tasks);
  },

  // Get cached customer tasks
  getCachedCustomerTasks: (customerId, milestone) => {
    const key = TaskCacheManager.CACHE_KEYS.customerTasks(customerId, milestone);
    return TaskCacheManager.get(key);
  },

  // Cache upcoming tasks preview
  cacheUpcomingTasks: (milestone, tasks) => {
    const key = TaskCacheManager.CACHE_KEYS.upcomingTasks(milestone);
    return TaskCacheManager.set(key, tasks, TaskCacheManager.CACHE_DURATION.tasks);
  },

  // Get cached upcoming tasks
  getCachedUpcomingTasks: (milestone) => {
    const key = TaskCacheManager.CACHE_KEYS.upcomingTasks(milestone);
    return TaskCacheManager.get(key);
  },

  // Cache competency scores with progress tracking
  cacheCompetencyProgress: (customerId, scores) => {
    const key = TaskCacheManager.CACHE_KEYS.competencyScores(customerId);
    return TaskCacheManager.set(key, scores, TaskCacheManager.CACHE_DURATION.competency);
  },

  // Get cached competency scores
  getCachedCompetencyProgress: (customerId) => {
    const key = TaskCacheManager.CACHE_KEYS.competencyScores(customerId);
    return TaskCacheManager.get(key);
  }
};

export default TaskCacheManager;