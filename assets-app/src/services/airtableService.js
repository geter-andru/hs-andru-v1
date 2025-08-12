import axios from 'axios';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || (() => {
  console.error('Missing REACT_APP_AIRTABLE_BASE_ID environment variable');
  throw new Error('Airtable configuration missing');
})();
const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY || (() => {
  console.error('Missing REACT_APP_AIRTABLE_API_KEY environment variable');
  throw new Error('Airtable configuration missing');
})();

// Cache for customer assets and user progress to avoid redundant API calls
let customerAssetsCache = new Map();
let userProgressCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Default JSON structures for workflow tracking
const DEFAULT_WORKFLOW_PROGRESS = {
  icp_completed: false,
  icp_score: null,
  cost_calculated: false,
  annual_cost: null,
  business_case_ready: false,
  selected_template: null,
  last_active_tool: "icp",
  completion_percentage: 0,
  company_name: "",
  analysis_date: null
};

const DEFAULT_USER_PREFERENCES = {
  icp_framework_customized: false,
  preferred_export_format: "pdf",
  methodology_transparency: false,
  custom_criteria: [],
  export_history: []
};

const DEFAULT_USAGE_ANALYTICS = {
  session_start: null,
  time_per_tool: {},
  export_count: 0,
  share_count: 0,
  tools_completed: [],
  last_login: null
};

// Enhanced gamification default structures
const DEFAULT_COMPETENCY_PROGRESS = {
  overall_level: "Foundation",
  total_progress_points: 0,
  competency_scores: {
    customer_analysis: 0,
    business_communication: 0,
    revenue_strategy: 0,
    value_articulation: 0,
    strategic_thinking: 0
  },
  level_history: [],
  advancement_dates: {},
  consistency_streak: 0,
  last_activity: null,
  hidden_rank: "E", // Solo Leveling rank (E, D, C, B, A, S)
  rank_points: 0,
  next_rank_threshold: 500
};

const DEFAULT_TOOL_ACCESS_STATUS = {
  icp_analysis: {
    access: true,
    completions: 0,
    average_score: 0,
    total_time_spent: 0,
    best_score: 0,
    completion_history: []
  },
  cost_calculator: {
    access: false,
    unlock_progress: { 
      analyses_needed: 3, 
      score_needed: 70,
      current_analyses: 0,
      current_avg_score: 0
    },
    completions: 0,
    average_impact: 0,
    completion_history: []
  },
  business_case_builder: {
    access: false,
    unlock_progress: { 
      calculations_needed: 2, 
      impact_threshold: 100000,
      current_calculations: 0,
      current_max_impact: 0
    },
    completions: 0,
    completion_quality: 0,
    completion_history: []
  }
};

const DEFAULT_PROFESSIONAL_MILESTONES = {
  milestones_achieved: [],
  milestone_progress: {},
  total_milestone_points: 0,
  recent_achievements: [],
  next_milestone_targets: {},
  achievement_history: [],
  categories_completed: []
};

const DEFAULT_DAILY_OBJECTIVES = {
  current_date: new Date().toISOString().split('T')[0],
  objectives_completed: [],
  completion_streak: 0,
  daily_progress_earned: 0,
  objectives_available: true,
  streak_multiplier: 1.0,
  objectives_for_today: [],
  last_generated: null
};

// Create axios instance with default config
const airtableClient = axios.create({
  baseURL: `${BASE_URL}/${BASE_ID}`,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000  // Increased from 10000ms to 30000ms
});

// Add request interceptor for logging
airtableClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Airtable Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
airtableClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Airtable Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to fetch data from Airtable');
  }
);

export const airtableService = {
  // Fetch customer assets data with caching
  async getCustomerAssets(customerId, accessToken) {
    try {
      const cacheKey = `${customerId}_${accessToken}`;
      
      // Check cache first
      const cachedData = customerAssetsCache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Using cached customer assets for: ${customerId}`);
        }
        return cachedData.data;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Fetching customer assets for: ${customerId} with token: ${accessToken}`);
      }
      
      // Strategy 1: Try filtering by Access Token only (more reliable)
      // Sanitize accessToken to prevent injection attacks
      const sanitizedToken = accessToken.replace(/'/g, "''").replace(/\\/g, "\\\\");
      const response = await airtableClient.get('/Customer Assets', {
        params: {
          filterByFormula: `{Access Token} = '${sanitizedToken}'`,
          maxRecords: 10  // Reduced from 100 to minimize timeout risk
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`Found ${response.data.records.length} records with matching access token`);
      }

      // Find matching record by Customer ID in the filtered results
      const matchingRecord = response.data.records.find(record => {
        const recordCustomerId = record.fields['Customer ID'];
        if (process.env.NODE_ENV === 'development') {
          console.log(`Checking record with Customer ID: ${recordCustomerId}`);
        }
        return recordCustomerId === customerId;
      });

      if (!matchingRecord) {
        // Strategy 2: If no match found, try direct record lookup if customerId looks like record ID
        if (customerId.startsWith('rec')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Trying direct record lookup...');
          }
          const directResponse = await airtableClient.get(`/Customer Assets/${customerId}`);
          const record = directResponse.data;
          
          // Verify access token matches
          if (record.fields['Access Token'] !== accessToken) {
            throw new Error('Invalid customer ID or access token');
          }
          
          const customerData = {
            id: record.id,
            customerId: record.fields['Customer ID'] || customerId,
            customerName: record.fields['Customer Name'],
            accessToken: record.fields['Access Token'],
            icpContent: this.parseJsonField(record.fields['ICP Content']),
            icpDescription: this.parseJsonField(record.fields['ICP Description']),
            costCalculatorContent: this.parseJsonField(record.fields['Cost Calculator Content']),
            businessCaseContent: this.parseJsonField(record.fields['Business Case Content']),
            workflowProgress: this.parseJsonField(record.fields['Workflow Progress']) || this.getDefaultWorkflowProgress(),
            userPreferences: this.parseJsonField(record.fields['User Preferences']) || this.getDefaultUserPreferences(),
            usageAnalytics: this.parseJsonField(record.fields['Usage Analytics']) || this.getDefaultUsageAnalytics(),
            // Enhanced gamification fields
            competencyProgress: this.parseJsonField(record.fields['Competency Progress']) || this.getDefaultCompetencyProgress(),
            toolAccessStatus: this.parseJsonField(record.fields['Tool Access Status']) || this.getDefaultToolAccessStatus(),
            professionalMilestones: this.parseJsonField(record.fields['Professional Milestones']) || this.getDefaultProfessionalMilestones(),
            dailyObjectives: this.parseJsonField(record.fields['Daily Objectives']) || this.getDefaultDailyObjectives(),
            createdAt: record.fields['Created At'],
            lastAccessed: record.fields['Last Accessed']
          };
          
          // Cache the result to avoid redundant API calls
          customerAssetsCache.set(cacheKey, {
            data: customerData,
            timestamp: Date.now()
          });
          
          return customerData;
        }
        
        throw new Error('Invalid customer ID or access token');
      }

      const record = matchingRecord;
      if (process.env.NODE_ENV === 'development') {
        console.log('Successfully found matching customer record');
      }
      
      const customerData = {
        id: record.id,
        customerId: record.fields['Customer ID'],
        customerName: record.fields['Customer Name'],
        accessToken: record.fields['Access Token'],
        icpContent: this.parseJsonField(record.fields['ICP Content']),
        icpDescription: this.parseJsonField(record.fields['ICP Description']),
        costCalculatorContent: this.parseJsonField(record.fields['Cost Calculator Content']),
        businessCaseContent: this.parseJsonField(record.fields['Business Case Content']),
        workflowProgress: this.parseJsonField(record.fields['Workflow Progress']) || this.getDefaultWorkflowProgress(),
        userPreferences: this.parseJsonField(record.fields['User Preferences']) || this.getDefaultUserPreferences(),
        usageAnalytics: this.parseJsonField(record.fields['Usage Analytics']) || this.getDefaultUsageAnalytics(),
        // Enhanced gamification fields
        competencyProgress: this.parseJsonField(record.fields['Competency Progress']) || this.getDefaultCompetencyProgress(),
        toolAccessStatus: this.parseJsonField(record.fields['Tool Access Status']) || this.getDefaultToolAccessStatus(),
        professionalMilestones: this.parseJsonField(record.fields['Professional Milestones']) || this.getDefaultProfessionalMilestones(),
        dailyObjectives: this.parseJsonField(record.fields['Daily Objectives']) || this.getDefaultDailyObjectives(),
        createdAt: record.fields['Created At'],
        lastAccessed: record.fields['Last Accessed']
      };
      
      // Cache the result to avoid redundant API calls
      customerAssetsCache.set(cacheKey, {
        data: customerData,
        timestamp: Date.now()
      });
      
      return customerData;
    } catch (error) {
      console.error('Error fetching customer assets:', error);
      throw error;
    }
  },

  // Update last accessed timestamp
  async updateLastAccessed(recordId) {
    try {
      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Last Accessed': new Date().toISOString()
          }
        }]
      });
    } catch (error) {
      console.error('Error updating last accessed:', error);
      // Don't throw - this is not critical
    }
  },

  // Save user progress/state
  async saveUserProgress(customerId, toolName, progressData) {
    try {
      const response = await airtableClient.post('/User Progress', {
        records: [{
          fields: {
            'Customer ID': customerId,
            'Tool Name': toolName,
            'Progress Data': JSON.stringify(progressData),
            'Updated At': new Date().toISOString()
          }
        }]
      });
      return response.data.records[0];
    } catch (error) {
      console.error('Error saving user progress:', error);
      throw error;
    }
  },

  // Fetch user progress with caching
  async getUserProgress(customerId, toolName) {
    try {
      const cacheKey = `${customerId}_${toolName}`;
      
      // Check cache first
      const cachedProgress = userProgressCache.get(cacheKey);
      if (cachedProgress && (Date.now() - cachedProgress.timestamp < CACHE_DURATION)) {
        console.log(`Using cached user progress for: ${customerId}_${toolName}`);
        return cachedProgress.data;
      }
      
      const response = await airtableClient.get('/User Progress', {
        params: {
          filterByFormula: `AND({Customer ID} = '${customerId}', {Tool Name} = '${toolName}')`,
          sort: [{ field: 'Updated At', direction: 'desc' }],
          maxRecords: 1
        }
      });

      let progressData = null;
      if (response.data.records.length > 0) {
        const record = response.data.records[0];
        progressData = this.parseJsonField(record.fields['Progress Data']);
      }
      
      // Cache the result
      userProgressCache.set(cacheKey, {
        data: progressData,
        timestamp: Date.now()
      });
      
      return progressData;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  },

  // Helper method to safely parse JSON fields
  parseJsonField(field) {
    if (!field) return null;
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch (error) {
      console.error('Error parsing JSON field:', error);
      return null;
    }
  },

  // Default JSON structures for new fields
  getDefaultWorkflowProgress() {
    return {
      icp_completed: false,
      icp_score: null,
      cost_calculated: false,
      annual_cost: null,
      business_case_ready: false,
      selected_template: null,
      results_generated: false,
      all_tools_completed: false,
      last_active_tool: "icp",
      completion_percentage: 0,
      company_name: "",
      analysis_date: null,
      last_updated: new Date().toISOString()
    };
  },

  getDefaultUserPreferences() {
    return {
      icp_framework_customized: false,
      preferred_export_format: "pdf",
      methodology_transparency: false,
      custom_criteria: [],
      export_history: [],
      last_updated: new Date().toISOString()
    };
  },

  getDefaultUsageAnalytics() {
    return {
      session_start: null,
      time_per_tool: {},
      export_count: 0,
      share_count: 0,
      tools_completed: [],
      last_login: null,
      total_sessions: 0,
      last_updated: new Date().toISOString()
    };
  },

  // Enhanced gamification default getters
  getDefaultCompetencyProgress() {
    return {
      ...DEFAULT_COMPETENCY_PROGRESS,
      last_updated: new Date().toISOString()
    };
  },

  getDefaultToolAccessStatus() {
    return {
      ...DEFAULT_TOOL_ACCESS_STATUS,
      last_updated: new Date().toISOString()
    };
  },

  getDefaultProfessionalMilestones() {
    return {
      ...DEFAULT_PROFESSIONAL_MILESTONES,
      last_updated: new Date().toISOString()
    };
  },

  getDefaultDailyObjectives() {
    return {
      ...DEFAULT_DAILY_OBJECTIVES,
      current_date: new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString()
    };
  },

  // Update workflow progress
  async updateWorkflowProgress(recordId, progressUpdate) {
    try {
      // Get current progress first
      let currentData;
      try {
        currentData = await this.getCustomerDataByRecordId(recordId);
      } catch (error) {
        console.warn('Could not load existing data, using defaults:', error.message);
        currentData = { workflowProgress: this.getDefaultWorkflowProgress() };
      }
      
      const currentProgress = currentData?.workflowProgress || this.getDefaultWorkflowProgress();
      
      // Merge with updates
      const updatedProgress = {
        ...currentProgress,
        ...progressUpdate,
        last_updated: new Date().toISOString()
      };

      // Calculate completion percentage
      const totalSteps = 4; // ICP, Cost, Business Case, Results
      let completedSteps = 0;
      if (updatedProgress.icp_completed) completedSteps++;
      if (updatedProgress.cost_calculated) completedSteps++;
      if (updatedProgress.business_case_ready) completedSteps++;
      if (updatedProgress.results_generated) completedSteps++;
      
      updatedProgress.completion_percentage = Math.round((completedSteps / totalSteps) * 100);
      updatedProgress.all_tools_completed = completedSteps === totalSteps;

      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Workflow Progress': JSON.stringify(updatedProgress)
          }
        }]
      });

      // Clear cache to force refresh
      this.clearCustomerCache();

      return updatedProgress;
    } catch (error) {
      console.error('Error updating workflow progress:', error);
      throw error;
    }
  },

  // Update user preferences
  async updateUserPreferences(recordId, preferencesUpdate) {
    try {
      let currentData;
      try {
        currentData = await this.getCustomerDataByRecordId(recordId);
      } catch (error) {
        console.warn('Could not load existing preferences, using defaults:', error.message);
        currentData = { userPreferences: this.getDefaultUserPreferences() };
      }
      
      const currentPreferences = currentData?.userPreferences || this.getDefaultUserPreferences();
      
      const updatedPreferences = {
        ...currentPreferences,
        ...preferencesUpdate,
        last_updated: new Date().toISOString()
      };

      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'User Preferences': JSON.stringify(updatedPreferences)
          }
        }]
      });

      this.clearCustomerCache();
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  // Update usage analytics
  async updateUsageAnalytics(recordId, analyticsUpdate) {
    try {
      let currentData;
      try {
        currentData = await this.getCustomerDataByRecordId(recordId);
      } catch (error) {
        console.warn('Could not load existing analytics, using defaults:', error.message);
        currentData = { usageAnalytics: this.getDefaultUsageAnalytics() };
      }
      
      const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();
      
      const updatedAnalytics = {
        ...currentAnalytics,
        ...analyticsUpdate,
        last_updated: new Date().toISOString()
      };

      // Track session if session_start is provided
      if (analyticsUpdate.session_start) {
        updatedAnalytics.total_sessions = (currentAnalytics.total_sessions || 0) + 1;
      }

      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Usage Analytics': JSON.stringify(updatedAnalytics)
          }
        }]
      });

      this.clearCustomerCache();
      return updatedAnalytics;
    } catch (error) {
      console.error('Error updating usage analytics:', error);
      throw error;
    }
  },

  // ========================================
  // ENHANCED GAMIFICATION API FUNCTIONS
  // ========================================

  // Competency Management Functions
  async loadCompetencyProgress(recordId) {
    try {
      const customerData = await this.getCustomerDataByRecordId(recordId);
      return customerData.competencyProgress || this.getDefaultCompetencyProgress();
    } catch (error) {
      console.error('Error loading competency progress:', error);
      return this.getDefaultCompetencyProgress();
    }
  },

  async updateProgressPoints(recordId, points, source) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const competencyProgress = currentData.competencyProgress || this.getDefaultCompetencyProgress();
      
      const updatedProgress = {
        ...competencyProgress,
        total_progress_points: (competencyProgress.total_progress_points || 0) + points,
        rank_points: (competencyProgress.rank_points || 0) + points,
        last_activity: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };

      // Check for rank advancement (Solo Leveling ranks)
      const rankAdvancement = this.checkRankAdvancement(updatedProgress);
      if (rankAdvancement.advanced) {
        updatedProgress.hidden_rank = rankAdvancement.newRank;
        updatedProgress.rank_points = rankAdvancement.remainingPoints;
        updatedProgress.next_rank_threshold = rankAdvancement.nextThreshold;
        
        // Log advancement
        if (!updatedProgress.level_history) updatedProgress.level_history = [];
        updatedProgress.level_history.push({
          rank: rankAdvancement.newRank,
          date: new Date().toISOString(),
          points_at_advancement: updatedProgress.total_progress_points,
          source: source
        });
      }

      await this.updateCompetencyProgress(recordId, updatedProgress);
      
      return {
        success: true,
        pointsAwarded: points,
        totalPoints: updatedProgress.total_progress_points,
        rankAdvanced: rankAdvancement.advanced,
        newRank: rankAdvancement.advanced ? rankAdvancement.newRank : null,
        source: source
      };
    } catch (error) {
      console.error('Error updating progress points:', error);
      throw error;
    }
  },

  checkRankAdvancement(competencyProgress) {
    const ranks = {
      'E': { threshold: 500, next: 'D' },
      'D': { threshold: 1200, next: 'C' },
      'C': { threshold: 2500, next: 'B' },
      'B': { threshold: 5000, next: 'A' },
      'A': { threshold: 10000, next: 'S' },
      'S': { threshold: 25000, next: 'S+' }
    };

    const currentRank = competencyProgress.hidden_rank || 'E';
    const currentPoints = competencyProgress.rank_points || 0;
    const rankInfo = ranks[currentRank];
    
    if (rankInfo && currentPoints >= rankInfo.threshold) {
      return {
        advanced: true,
        newRank: rankInfo.next,
        remainingPoints: currentPoints - rankInfo.threshold,
        nextThreshold: ranks[rankInfo.next]?.threshold || 50000
      };
    }
    
    return {
      advanced: false,
      currentRank: currentRank,
      pointsToNext: rankInfo ? rankInfo.threshold - currentPoints : 0,
      nextThreshold: rankInfo?.threshold || 500
    };
  },

  async advanceCompetency(recordId, competencyType, gain) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const competencyProgress = currentData.competencyProgress || this.getDefaultCompetencyProgress();
      
      if (!competencyProgress.competency_scores) {
        competencyProgress.competency_scores = DEFAULT_COMPETENCY_PROGRESS.competency_scores;
      }
      
      const updatedProgress = {
        ...competencyProgress,
        competency_scores: {
          ...competencyProgress.competency_scores,
          [competencyType]: (competencyProgress.competency_scores[competencyType] || 0) + gain
        },
        last_updated: new Date().toISOString()
      };

      // Check overall level advancement
      const levelCheck = this.checkLevelAdvancement(updatedProgress);
      if (levelCheck.advanced) {
        updatedProgress.overall_level = levelCheck.newLevel;
        if (!updatedProgress.advancement_dates) updatedProgress.advancement_dates = {};
        updatedProgress.advancement_dates[levelCheck.newLevel] = new Date().toISOString();
      }

      await this.updateCompetencyProgress(recordId, updatedProgress);
      
      return {
        success: true,
        competencyType: competencyType,
        gainAmount: gain,
        newScore: updatedProgress.competency_scores[competencyType],
        levelAdvanced: levelCheck.advanced,
        newLevel: levelCheck.advanced ? levelCheck.newLevel : null
      };
    } catch (error) {
      console.error('Error advancing competency:', error);
      throw error;
    }
  },

  checkLevelAdvancement(competencyProgress) {
    const levels = {
      'Foundation': 50,
      'Developing': 150,
      'Proficient': 300,
      'Advanced': 500,
      'Expert': 750
    };

    const averageScore = Object.values(competencyProgress.competency_scores || {})
      .reduce((sum, score) => sum + score, 0) / Object.keys(competencyProgress.competency_scores || {}).length;

    const currentLevel = competencyProgress.overall_level || 'Foundation';
    
    for (const [level, threshold] of Object.entries(levels)) {
      if (averageScore >= threshold && levels[level] > levels[currentLevel]) {
        return {
          advanced: true,
          newLevel: level,
          averageScore: Math.round(averageScore)
        };
      }
    }
    
    return {
      advanced: false,
      currentLevel: currentLevel,
      averageScore: Math.round(averageScore)
    };
  },

  async updateCompetencyProgress(recordId, progressUpdate) {
    try {
      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Competency Progress': JSON.stringify(progressUpdate)
          }
        }]
      });

      this.clearCustomerCache();
      return progressUpdate;
    } catch (error) {
      console.error('Error updating competency progress:', error);
      throw error;
    }
  },

  // Tool Access Control Functions
  async checkToolAccess(recordId, toolName) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const toolAccessStatus = currentData.toolAccessStatus || this.getDefaultToolAccessStatus();
      
      if (!toolAccessStatus[toolName]) {
        return { access: false, reason: 'Tool not found' };
      }
      
      return {
        access: toolAccessStatus[toolName].access,
        unlockProgress: toolAccessStatus[toolName].unlock_progress,
        completions: toolAccessStatus[toolName].completions
      };
    } catch (error) {
      console.error('Error checking tool access:', error);
      return { access: false, reason: 'Error checking access' };
    }
  },

  async updateToolCompletion(recordId, toolName, completionData) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const toolAccessStatus = currentData.toolAccessStatus || this.getDefaultToolAccessStatus();
      
      if (!toolAccessStatus[toolName]) {
        throw new Error(`Tool ${toolName} not found in access status`);
      }
      
      const toolStatus = { ...toolAccessStatus[toolName] };
      
      // Update completion stats
      toolStatus.completions = (toolStatus.completions || 0) + 1;
      
      // Update completion history
      if (!toolStatus.completion_history) toolStatus.completion_history = [];
      toolStatus.completion_history.push({
        timestamp: new Date().toISOString(),
        ...completionData
      });
      
      // Keep only last 10 completions
      toolStatus.completion_history = toolStatus.completion_history.slice(-10);
      
      // Tool-specific metrics
      if (toolName === 'icp_analysis') {
        const scores = toolStatus.completion_history.map(h => h.score || 0).filter(s => s > 0);
        toolStatus.average_score = scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : 0;
        toolStatus.best_score = Math.max(...scores, toolStatus.best_score || 0);
        toolStatus.total_time_spent = (toolStatus.total_time_spent || 0) + (completionData.timeSpent || 0);
      } else if (toolName === 'cost_calculator') {
        const impacts = toolStatus.completion_history.map(h => h.annualCost || 0).filter(i => i > 0);
        toolStatus.average_impact = impacts.length > 0 ? Math.round(impacts.reduce((sum, i) => sum + i, 0) / impacts.length) : 0;
      } else if (toolName === 'business_case_builder') {
        toolStatus.completion_quality = (toolStatus.completion_quality || 0) + 1;
      }
      
      const updatedAccessStatus = {
        ...toolAccessStatus,
        [toolName]: toolStatus,
        last_updated: new Date().toISOString()
      };
      
      await this.updateToolAccessStatus(recordId, updatedAccessStatus);
      
      return {
        success: true,
        toolName: toolName,
        completions: toolStatus.completions,
        updatedMetrics: toolStatus
      };
    } catch (error) {
      console.error('Error updating tool completion:', error);
      throw error;
    }
  },

  async evaluateUnlockCriteria(recordId) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const toolAccessStatus = currentData.toolAccessStatus || this.getDefaultToolAccessStatus();
      
      const unlockResults = [];
      
      // Check Cost Calculator unlock
      if (!toolAccessStatus.cost_calculator.access) {
        const icpHistory = toolAccessStatus.icp_analysis.completion_history || [];
        const qualifyingAnalyses = icpHistory.filter(h => (h.score || 0) >= 70);
        
        const progress = {
          current_analyses: qualifyingAnalyses.length,
          current_avg_score: qualifyingAnalyses.length > 0 ? 
            Math.round(qualifyingAnalyses.reduce((sum, h) => sum + h.score, 0) / qualifyingAnalyses.length) : 0
        };
        
        toolAccessStatus.cost_calculator.unlock_progress = {
          ...toolAccessStatus.cost_calculator.unlock_progress,
          ...progress
        };
        
        if (qualifyingAnalyses.length >= 3) {
          await this.unlockAdvancedTool(recordId, 'cost_calculator');
          unlockResults.push({
            tool: 'cost_calculator',
            unlocked: true,
            message: 'Cost Calculator methodology now available'
          });
        }
      }
      
      // Check Business Case Builder unlock
      if (!toolAccessStatus.business_case_builder.access) {
        const costHistory = toolAccessStatus.cost_calculator.completion_history || [];
        const qualifyingCalculations = costHistory.filter(h => (h.annualCost || 0) >= 100000);
        
        const progress = {
          current_calculations: qualifyingCalculations.length,
          current_max_impact: costHistory.length > 0 ? 
            Math.max(...costHistory.map(h => h.annualCost || 0)) : 0
        };
        
        toolAccessStatus.business_case_builder.unlock_progress = {
          ...toolAccessStatus.business_case_builder.unlock_progress,
          ...progress
        };
        
        if (qualifyingCalculations.length >= 2) {
          await this.unlockAdvancedTool(recordId, 'business_case_builder');
          unlockResults.push({
            tool: 'business_case_builder',
            unlocked: true,
            message: 'Business Case Builder methodology now available'
          });
        }
      }
      
      // Update tool access status
      await this.updateToolAccessStatus(recordId, {
        ...toolAccessStatus,
        last_updated: new Date().toISOString()
      });
      
      return {
        success: true,
        unlocks: unlockResults,
        currentStatus: toolAccessStatus
      };
    } catch (error) {
      console.error('Error evaluating unlock criteria:', error);
      throw error;
    }
  },

  async unlockAdvancedTool(recordId, toolName) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const toolAccessStatus = currentData.toolAccessStatus || this.getDefaultToolAccessStatus();
      
      if (toolAccessStatus[toolName]) {
        toolAccessStatus[toolName].access = true;
        toolAccessStatus[toolName].unlock_date = new Date().toISOString();
      }
      
      await this.updateToolAccessStatus(recordId, {
        ...toolAccessStatus,
        last_updated: new Date().toISOString()
      });
      
      return {
        success: true,
        toolName: toolName,
        unlockedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error unlocking advanced tool:', error);
      throw error;
    }
  },

  async updateToolAccessStatus(recordId, accessUpdate) {
    try {
      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Tool Access Status': JSON.stringify(accessUpdate)
          }
        }]
      });

      this.clearCustomerCache();
      return accessUpdate;
    } catch (error) {
      console.error('Error updating tool access status:', error);
      throw error;
    }
  },

  // Track competency demonstration for progressive access
  async trackCompetencyDemonstration(recordId, toolName, competencyData) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const analytics = currentData.usageAnalytics || this.getDefaultUsageAnalytics();
      
      // Initialize competency tracking arrays if needed
      if (!analytics.competency_demonstrations) {
        analytics.competency_demonstrations = [];
      }
      if (!analytics.tool_completions) {
        analytics.tool_completions = [];
      }
      
      // Add competency demonstration record
      analytics.competency_demonstrations.push({
        tool: toolName,
        timestamp: new Date().toISOString(),
        score: competencyData.score || 0,
        competency: competencyData.competency || 'Unknown',
        level: competencyData.level || 'Foundation',
        data: competencyData
      });
      
      // Track for unlock criteria evaluation
      analytics.tool_completions.push({
        name: toolName,
        timestamp: new Date().toISOString(),
        score: competencyData.score,
        annual_cost: competencyData.annualCost,
        data: competencyData
      });
      
      await this.updateUsageAnalytics(recordId, analytics);
      
      return {
        success: true,
        demonstrations: analytics.competency_demonstrations,
        completions: analytics.tool_completions
      };
    } catch (error) {
      console.error('Error tracking competency demonstration:', error);
      throw error;
    }
  },

  // Milestone System API Functions
  async checkMilestoneProgress(recordId, milestoneId) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const milestones = currentData.professionalMilestones || this.getDefaultProfessionalMilestones();
      const toolAccess = currentData.toolAccessStatus || this.getDefaultToolAccessStatus();
      const competency = currentData.competencyProgress || this.getDefaultCompetencyProgress();
      
      // Check if milestone already achieved
      if (milestones.milestones_achieved && milestones.milestones_achieved.includes(milestoneId)) {
        return { achieved: true, alreadyCompleted: true };
      }
      
      // Milestone criteria evaluation
      const milestoneProgress = this.evaluateMilestoneProgress(milestoneId, {
        toolAccess,
        competency,
        milestones
      });
      
      if (milestoneProgress.achieved && !milestones.milestones_achieved.includes(milestoneId)) {
        await this.awardProfessionalMilestone(recordId, {
          id: milestoneId,
          achievedAt: new Date().toISOString(),
          ...milestoneProgress.data
        });
        
        return { 
          achieved: true, 
          newlyAchieved: true,
          milestoneData: milestoneProgress.data
        };
      }
      
      return {
        achieved: false,
        progress: milestoneProgress.progress || 0,
        requirements: milestoneProgress.requirements
      };
    } catch (error) {
      console.error('Error checking milestone progress:', error);
      throw error;
    }
  },

  evaluateMilestoneProgress(milestoneId, userData) {
    const { toolAccess, competency } = userData;
    
    // Define milestone criteria
    const milestones = {
      'customer_intelligence_foundation': {
        name: 'Customer Intelligence Foundation',
        criteria: () => {
          const icpCompletions = toolAccess.icp_analysis?.completions || 0;
          return icpCompletions >= 1;
        },
        progress: () => {
          const icpCompletions = toolAccess.icp_analysis?.completions || 0;
          return Math.min(icpCompletions / 1, 1) * 100;
        },
        points: 50
      },
      'value_articulation_mastery': {
        name: 'Value Articulation Mastery',
        criteria: () => {
          const costCompletions = toolAccess.cost_calculator?.completions || 0;
          const avgImpact = toolAccess.cost_calculator?.average_impact || 0;
          return costCompletions >= 2 && avgImpact >= 150000;
        },
        progress: () => {
          const costCompletions = toolAccess.cost_calculator?.completions || 0;
          const avgImpact = toolAccess.cost_calculator?.average_impact || 0;
          const completionProgress = Math.min(costCompletions / 2, 1) * 50;
          const impactProgress = Math.min(avgImpact / 150000, 1) * 50;
          return completionProgress + impactProgress;
        },
        points: 75
      },
      'strategic_proposal_development': {
        name: 'Strategic Proposal Development',
        criteria: () => {
          const businessCompletions = toolAccess.business_case_builder?.completions || 0;
          return businessCompletions >= 1;
        },
        progress: () => {
          const businessCompletions = toolAccess.business_case_builder?.completions || 0;
          return Math.min(businessCompletions / 1, 1) * 100;
        },
        points: 100
      },
      'comprehensive_strategist': {
        name: 'Comprehensive Revenue Strategist',
        criteria: () => {
          const icpCompleted = (toolAccess.icp_analysis?.completions || 0) >= 1;
          const costCompleted = (toolAccess.cost_calculator?.completions || 0) >= 1;
          const businessCompleted = (toolAccess.business_case_builder?.completions || 0) >= 1;
          return icpCompleted && costCompleted && businessCompleted;
        },
        progress: () => {
          let progress = 0;
          if ((toolAccess.icp_analysis?.completions || 0) >= 1) progress += 33;
          if ((toolAccess.cost_calculator?.completions || 0) >= 1) progress += 33;
          if ((toolAccess.business_case_builder?.completions || 0) >= 1) progress += 34;
          return progress;
        },
        points: 200
      },
      'consistency_professional': {
        name: 'Professional Consistency Excellence',
        criteria: () => {
          const streak = competency.consistency_streak || 0;
          return streak >= 7;
        },
        progress: () => {
          const streak = competency.consistency_streak || 0;
          return Math.min(streak / 7, 1) * 100;
        },
        points: 125
      }
    };
    
    const milestone = milestones[milestoneId];
    if (!milestone) {
      return { achieved: false, progress: 0 };
    }
    
    const achieved = milestone.criteria();
    const progress = milestone.progress();
    
    return {
      achieved,
      progress,
      data: {
        name: milestone.name,
        points: milestone.points,
        category: this.getMilestoneCategory(milestoneId)
      },
      requirements: milestone.criteria.toString()
    };
  },

  getMilestoneCategory(milestoneId) {
    const categories = {
      'customer_intelligence_foundation': 'Customer Intelligence',
      'value_articulation_mastery': 'Value Communication',
      'strategic_proposal_development': 'Strategic Development',
      'comprehensive_strategist': 'Comprehensive Mastery',
      'consistency_professional': 'Professional Excellence'
    };
    return categories[milestoneId] || 'General';
  },

  async awardProfessionalMilestone(recordId, milestoneData) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const milestones = currentData.professionalMilestones || this.getDefaultProfessionalMilestones();
      
      // Add to achieved milestones
      if (!milestones.milestones_achieved) milestones.milestones_achieved = [];
      if (!milestones.milestones_achieved.includes(milestoneData.id)) {
        milestones.milestones_achieved.push(milestoneData.id);
      }
      
      // Add to achievement history
      if (!milestones.achievement_history) milestones.achievement_history = [];
      milestones.achievement_history.push({
        milestone_id: milestoneData.id,
        name: milestoneData.name,
        achieved_at: milestoneData.achievedAt,
        points_awarded: milestoneData.points,
        category: milestoneData.category
      });
      
      // Update points
      milestones.total_milestone_points = (milestones.total_milestone_points || 0) + (milestoneData.points || 0);
      
      // Add to recent achievements (keep last 5)
      if (!milestones.recent_achievements) milestones.recent_achievements = [];
      milestones.recent_achievements.unshift({
        milestone_id: milestoneData.id,
        name: milestoneData.name,
        achieved_at: milestoneData.achievedAt,
        points: milestoneData.points
      });
      milestones.recent_achievements = milestones.recent_achievements.slice(0, 5);
      
      await this.updateProfessionalMilestones(recordId, {
        ...milestones,
        last_updated: new Date().toISOString()
      });
      
      // Also award progress points to competency system
      await this.updateProgressPoints(recordId, milestoneData.points || 0, `Milestone: ${milestoneData.name}`);
      
      return {
        success: true,
        milestoneId: milestoneData.id,
        pointsAwarded: milestoneData.points,
        totalMilestonePoints: milestones.total_milestone_points
      };
    } catch (error) {
      console.error('Error awarding professional milestone:', error);
      throw error;
    }
  },

  async loadMilestoneHistory(recordId) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const milestones = currentData.professionalMilestones || this.getDefaultProfessionalMilestones();
      
      return {
        achieved: milestones.milestones_achieved || [],
        history: milestones.achievement_history || [],
        recent: milestones.recent_achievements || [],
        totalPoints: milestones.total_milestone_points || 0
      };
    } catch (error) {
      console.error('Error loading milestone history:', error);
      return {
        achieved: [],
        history: [],
        recent: [],
        totalPoints: 0
      };
    }
  },

  async updateProfessionalMilestones(recordId, milestonesUpdate) {
    try {
      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Professional Milestones': JSON.stringify(milestonesUpdate)
          }
        }]
      });

      this.clearCustomerCache();
      return milestonesUpdate;
    } catch (error) {
      console.error('Error updating professional milestones:', error);
      throw error;
    }
  },

  // Daily Objectives API Functions
  async generateDailyObjectives(recordId, competencyLevel = 'Foundation') {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const dailyObj = currentData.dailyObjectives || this.getDefaultDailyObjectives();
      const today = new Date().toISOString().split('T')[0];
      
      // Check if objectives already generated for today
      if (dailyObj.current_date === today && dailyObj.objectives_for_today && dailyObj.objectives_for_today.length > 0) {
        return {
          success: true,
          objectives: dailyObj.objectives_for_today,
          alreadyGenerated: true
        };
      }
      
      // Generate new objectives based on competency level
      const objectivePool = this.getObjectivePool(competencyLevel);
      const selectedObjectives = this.selectDailyObjectives(objectivePool, 3);
      
      const updatedObjectives = {
        ...dailyObj,
        current_date: today,
        objectives_for_today: selectedObjectives,
        objectives_completed: [],
        daily_progress_earned: 0,
        last_generated: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      await this.updateDailyObjectives(recordId, updatedObjectives);
      
      return {
        success: true,
        objectives: selectedObjectives,
        newlyGenerated: true
      };
    } catch (error) {
      console.error('Error generating daily objectives:', error);
      throw error;
    }
  },

  getObjectivePool(competencyLevel) {
    const objectives = {
      'Foundation': [
        { id: 'explore_icp', name: 'Explore Customer Analysis Framework', points: 15, type: 'exploration' },
        { id: 'review_methodology', name: 'Review Systematic Methodology Guide', points: 10, type: 'learning' },
        { id: 'practice_analysis', name: 'Practice Customer Segmentation', points: 20, type: 'practice' }
      ],
      'Developing': [
        { id: 'complete_icp', name: 'Complete ICP Analysis', points: 25, type: 'completion' },
        { id: 'optimize_process', name: 'Optimize Analysis Process', points: 20, type: 'optimization' },
        { id: 'review_results', name: 'Review Previous Analysis Results', points: 15, type: 'review' }
      ],
      'Proficient': [
        { id: 'cost_analysis', name: 'Conduct Value Quantification', points: 35, type: 'completion' },
        { id: 'business_case', name: 'Develop Strategic Proposal', points: 50, type: 'completion' },
        { id: 'methodology_mastery', name: 'Demonstrate Process Mastery', points: 30, type: 'mastery' }
      ],
      'Advanced': [
        { id: 'full_workflow', name: 'Execute Complete Methodology', points: 75, type: 'comprehensive' },
        { id: 'efficiency_focus', name: 'Optimize Execution Speed', points: 40, type: 'efficiency' },
        { id: 'quality_excellence', name: 'Achieve Excellence Standards', points: 45, type: 'quality' }
      ]
    };
    
    return objectives[competencyLevel] || objectives['Foundation'];
  },

  selectDailyObjectives(pool, count) {
    // Shuffle and select objectives
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((obj, index) => ({
      ...obj,
      id: `${obj.id}_${Date.now()}_${index}`,
      assigned_at: new Date().toISOString(),
      completed: false
    }));
  },

  async completeObjective(recordId, objectiveId, rewards = {}) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const dailyObj = currentData.dailyObjectives || this.getDefaultDailyObjectives();
      
      // Find and complete the objective
      const objectives = dailyObj.objectives_for_today || [];
      const objectiveIndex = objectives.findIndex(obj => obj.id === objectiveId);
      
      if (objectiveIndex === -1) {
        throw new Error('Objective not found');
      }
      
      if (objectives[objectiveIndex].completed) {
        return { success: false, reason: 'Already completed' };
      }
      
      // Mark as completed
      objectives[objectiveIndex].completed = true;
      objectives[objectiveIndex].completed_at = new Date().toISOString();
      
      // Add to completed list
      if (!dailyObj.objectives_completed) dailyObj.objectives_completed = [];
      dailyObj.objectives_completed.push(objectiveId);
      
      // Award points
      const pointsEarned = objectives[objectiveIndex].points || 0;
      dailyObj.daily_progress_earned = (dailyObj.daily_progress_earned || 0) + pointsEarned;
      
      const updatedObjectives = {
        ...dailyObj,
        objectives_for_today: objectives,
        last_updated: new Date().toISOString()
      };
      
      await this.updateDailyObjectives(recordId, updatedObjectives);
      
      // Award progress points
      await this.updateProgressPoints(recordId, pointsEarned, `Daily Objective: ${objectives[objectiveIndex].name}`);
      
      return {
        success: true,
        pointsEarned,
        objectiveName: objectives[objectiveIndex].name,
        totalDailyProgress: updatedObjectives.daily_progress_earned
      };
    } catch (error) {
      console.error('Error completing objective:', error);
      throw error;
    }
  },

  async updateConsistencyStreak(recordId) {
    try {
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const competency = currentData.competencyProgress || this.getDefaultCompetencyProgress();
      const dailyObj = currentData.dailyObjectives || this.getDefaultDailyObjectives();
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      // Check if user was active today
      const hasActivityToday = competency.last_activity && 
        competency.last_activity.startsWith(today);
      
      if (hasActivityToday) {
        let newStreak = competency.consistency_streak || 0;
        
        // If last activity was yesterday, increment streak
        if (competency.last_activity && competency.last_activity.startsWith(yesterday)) {
          newStreak += 1;
        } else if (!competency.last_activity || !competency.last_activity.startsWith(yesterday)) {
          // Reset streak if there was a gap
          newStreak = 1;
        }
        
        const updatedCompetency = {
          ...competency,
          consistency_streak: newStreak,
          last_updated: new Date().toISOString()
        };
        
        await this.updateCompetencyProgress(recordId, updatedCompetency);
        
        // Award streak bonus points
        if (newStreak > 1 && newStreak % 7 === 0) {
          const streakBonus = Math.floor(newStreak / 7) * 25;
          await this.updateProgressPoints(recordId, streakBonus, `Consistency Streak: ${newStreak} days`);
          
          return {
            success: true,
            streak: newStreak,
            bonusAwarded: streakBonus,
            milestone: newStreak % 7 === 0
          };
        }
        
        return {
          success: true,
          streak: newStreak,
          bonusAwarded: 0,
          milestone: false
        };
      }
      
      return {
        success: true,
        streak: competency.consistency_streak || 0,
        bonusAwarded: 0,
        milestone: false
      };
    } catch (error) {
      console.error('Error updating consistency streak:', error);
      throw error;
    }
  },

  async updateDailyObjectives(recordId, objectivesUpdate) {
    try {
      await airtableClient.patch('/Customer Assets', {
        records: [{
          id: recordId,
          fields: {
            'Daily Objectives': JSON.stringify(objectivesUpdate)
          }
        }]
      });

      this.clearCustomerCache();
      return objectivesUpdate;
    } catch (error) {
      console.error('Error updating daily objectives:', error);
      throw error;
    }
  },

  // Enhanced ICP Completion Handler with full gamification integration
  async handleICPCompletion(recordId, data) {
    try {
      const progressUpdate = {
        icp_completed: true,
        icp_score: data.score,
        company_name: data.companyName || "",
        analysis_date: new Date().toISOString(),
        last_active_tool: "cost-calculator"
      };

      const analyticsUpdate = {
        tools_completed: ["icp"],
        time_per_tool: {
          ...this.getDefaultUsageAnalytics().time_per_tool,
          icp: data.timeSpent || 0
        },
        last_activity: new Date().toISOString(),
        activity_count: (analyticsUpdate.activity_count || 0) + 1
      };

      // Enhanced gamification triggers
      const gamificationResults = await Promise.allSettled([
        // Update progress points (25 base + score bonus)
        this.updateProgressPoints(recordId, 25 + Math.round((data.score || 0) * 0.25), 'Customer Analysis Completed'),
        
        // Advance customer analysis competency
        this.advanceCompetency(recordId, 'customer_analysis', 3),
        
        // Update tool completion stats
        this.updateToolCompletion(recordId, 'icp_analysis', {
          score: data.score,
          timeSpent: data.timeSpent,
          companyName: data.companyName
        }),
        
        // Check milestone progress
        this.checkMilestoneProgress(recordId, 'customer_intelligence_foundation'),
        
        // Evaluate unlock criteria
        this.evaluateUnlockCriteria(recordId),
        
        // Update consistency streak
        this.updateConsistencyStreak(recordId)
      ]);

      // Track competency demonstration (legacy support)
      await this.trackCompetencyDemonstration(recordId, 'icp', {
        score: data.score,
        companyName: data.companyName,
        competency: 'Customer Analysis',
        level: 'Foundation',
        timeSpent: data.timeSpent
      });

      await Promise.all([
        this.updateWorkflowProgress(recordId, progressUpdate),
        this.updateUsageAnalytics(recordId, analyticsUpdate)
      ]);

      // Compile gamification results
      const gamificationSummary = {
        pointsAwarded: gamificationResults[0].status === 'fulfilled' ? gamificationResults[0].value?.pointsAwarded : 0,
        competencyAdvanced: gamificationResults[1].status === 'fulfilled' ? gamificationResults[1].value?.success : false,
        toolUnlocked: gamificationResults[4].status === 'fulfilled' ? gamificationResults[4].value?.unlocks?.length > 0 : false,
        milestoneAchieved: gamificationResults[3].status === 'fulfilled' ? gamificationResults[3].value?.newlyAchieved : false,
        streakUpdated: gamificationResults[5].status === 'fulfilled' ? gamificationResults[5].value?.streak : 0
      };

      return {
        ...progressUpdate,
        gamification: gamificationSummary
      };
    } catch (error) {
      console.error('Error in enhanced ICP completion handler:', error);
      // Fallback to basic completion if gamification fails
      await Promise.all([
        this.updateWorkflowProgress(recordId, {
          icp_completed: true,
          icp_score: data.score,
          company_name: data.companyName || "",
          analysis_date: new Date().toISOString(),
          last_active_tool: "cost-calculator"
        }),
        this.updateUsageAnalytics(recordId, {
          tools_completed: ["icp"],
          time_per_tool: { icp: data.timeSpent || 0 },
          last_activity: new Date().toISOString()
        })
      ]);
      
      throw error;
    }
  },

  // Enhanced Cost Calculator Completion Handler with full gamification integration
  async handleCostCalculatorCompletion(recordId, data) {
    try {
      const progressUpdate = {
        cost_calculated: true,
        annual_cost: data.annualCost,
        last_active_tool: "business-case"
      };

      // Get current analytics to append to tools_completed
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();
      const completedTools = [...(currentAnalytics.tools_completed || [])];
      if (!completedTools.includes("cost-calculator")) {
        completedTools.push("cost-calculator");
      }

      const analyticsUpdate = {
        tools_completed: completedTools,
        time_per_tool: {
          ...currentAnalytics.time_per_tool,
          'cost-calculator': data.timeSpent || 0
        },
        last_activity: new Date().toISOString(),
        activity_count: (currentAnalytics.activity_count || 0) + 1
      };

      // Calculate impact-based bonus points
      const impactMultiplier = Math.min((data.annualCost || 0) / 100000, 3); // Up to 3x multiplier for high impact
      const basePoints = 35;
      const bonusPoints = Math.round(basePoints * impactMultiplier);

      // Enhanced gamification triggers
      const gamificationResults = await Promise.allSettled([
        // Update progress points with impact bonus
        this.updateProgressPoints(recordId, bonusPoints, 'Value Quantification Completed'),
        
        // Advance value articulation competency
        this.advanceCompetency(recordId, 'value_articulation', 4),
        this.advanceCompetency(recordId, 'revenue_strategy', 2),
        
        // Update tool completion stats
        this.updateToolCompletion(recordId, 'cost_calculator', {
          annualCost: data.annualCost,
          timeSpent: data.timeSpent,
          impactLevel: this.calculateImpactLevel(data.annualCost)
        }),
        
        // Check milestone progress
        this.checkMilestoneProgress(recordId, 'value_articulation_mastery'),
        
        // Evaluate unlock criteria (Business Case Builder)
        this.evaluateUnlockCriteria(recordId),
        
        // Update consistency streak
        this.updateConsistencyStreak(recordId)
      ]);

      // Track competency demonstration (legacy support)
      await this.trackCompetencyDemonstration(recordId, 'cost', {
        annualCost: data.annualCost,
        competency: 'Value Quantification',
        level: 'Developing',
        timeSpent: data.timeSpent
      });

      await Promise.all([
        this.updateWorkflowProgress(recordId, progressUpdate),
        this.updateUsageAnalytics(recordId, analyticsUpdate)
      ]);

      // Compile gamification results
      const gamificationSummary = {
        pointsAwarded: gamificationResults[0].status === 'fulfilled' ? gamificationResults[0].value?.pointsAwarded : 0,
        competencyAdvanced: gamificationResults[1].status === 'fulfilled' && gamificationResults[2].status === 'fulfilled',
        toolUnlocked: gamificationResults[5].status === 'fulfilled' ? gamificationResults[5].value?.unlocks?.length > 0 : false,
        milestoneAchieved: gamificationResults[4].status === 'fulfilled' ? gamificationResults[4].value?.newlyAchieved : false,
        impactLevel: this.calculateImpactLevel(data.annualCost),
        streakUpdated: gamificationResults[6].status === 'fulfilled' ? gamificationResults[6].value?.streak : 0
      };

      return {
        ...progressUpdate,
        gamification: gamificationSummary
      };
    } catch (error) {
      console.error('Error in enhanced Cost Calculator completion handler:', error);
      // Fallback to basic completion if gamification fails
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();
      const completedTools = [...(currentAnalytics.tools_completed || [])];
      if (!completedTools.includes("cost-calculator")) {
        completedTools.push("cost-calculator");
      }

      await Promise.all([
        this.updateWorkflowProgress(recordId, {
          cost_calculated: true,
          annual_cost: data.annualCost,
          last_active_tool: "business-case"
        }),
        this.updateUsageAnalytics(recordId, {
          tools_completed: completedTools,
          time_per_tool: {
            ...currentAnalytics.time_per_tool,
            'cost-calculator': data.timeSpent || 0
          },
          last_activity: new Date().toISOString()
        })
      ]);
      
      throw error;
    }
  },

  calculateImpactLevel(annualCost) {
    const cost = annualCost || 0;
    if (cost >= 1000000) return 'Transformational';
    if (cost >= 500000) return 'High Impact';
    if (cost >= 250000) return 'Significant';
    if (cost >= 100000) return 'Moderate';
    if (cost >= 50000) return 'Baseline';
    return 'Minimal';
  },

  // Enhanced Business Case Completion Handler with full gamification integration
  async handleBusinessCaseCompletion(recordId, data) {
    try {
      const progressUpdate = {
        business_case_ready: true,
        selected_template: data.templateName,
        last_active_tool: "results"
      };

      const currentData = await this.getCustomerDataByRecordId(recordId);
      const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();
      const completedTools = [...(currentAnalytics.tools_completed || [])];
      if (!completedTools.includes("business-case")) {
        completedTools.push("business-case");
      }

      const analyticsUpdate = {
        tools_completed: completedTools,
        time_per_tool: {
          ...currentAnalytics.time_per_tool,
          'business-case': data.timeSpent || 0
        },
        last_activity: new Date().toISOString(),
        activity_count: (currentAnalytics.activity_count || 0) + 1
      };

      // Enhanced gamification triggers
      const gamificationResults = await Promise.allSettled([
        // Update progress points (50 base for strategic communication mastery)
        this.updateProgressPoints(recordId, 50, 'Strategic Proposal Development'),
        
        // Advance strategic thinking and communication competencies
        this.advanceCompetency(recordId, 'strategic_thinking', 5),
        this.advanceCompetency(recordId, 'business_communication', 4),
        
        // Update tool completion stats
        this.updateToolCompletion(recordId, 'business_case_builder', {
          templateName: data.templateName,
          timeSpent: data.timeSpent,
          qualityLevel: this.calculateBusinessCaseQuality(data)
        }),
        
        // Check milestone progress
        this.checkMilestoneProgress(recordId, 'strategic_proposal_development'),
        
        // Check for comprehensive strategist milestone (all tools completed)
        this.checkMilestoneProgress(recordId, 'comprehensive_strategist'),
        
        // Update consistency streak
        this.updateConsistencyStreak(recordId)
      ]);

      // Track competency demonstration (legacy support)
      await this.trackCompetencyDemonstration(recordId, 'business_case', {
        templateName: data.templateName,
        competency: 'Strategic Communication',
        level: 'Proficient',
        timeSpent: data.timeSpent
      });

      await Promise.all([
        this.updateWorkflowProgress(recordId, progressUpdate),
        this.updateUsageAnalytics(recordId, analyticsUpdate)
      ]);

      // Compile gamification results
      const gamificationSummary = {
        pointsAwarded: gamificationResults[0].status === 'fulfilled' ? gamificationResults[0].value?.pointsAwarded : 0,
        competencyAdvanced: gamificationResults[1].status === 'fulfilled' && gamificationResults[2].status === 'fulfilled',
        milestoneAchieved: gamificationResults[4].status === 'fulfilled' ? gamificationResults[4].value?.newlyAchieved : false,
        comprehensiveMilestone: gamificationResults[5].status === 'fulfilled' ? gamificationResults[5].value?.newlyAchieved : false,
        qualityLevel: this.calculateBusinessCaseQuality(data),
        streakUpdated: gamificationResults[6].status === 'fulfilled' ? gamificationResults[6].value?.streak : 0
      };

      return {
        ...progressUpdate,
        gamification: gamificationSummary
      };
    } catch (error) {
      console.error('Error in enhanced Business Case completion handler:', error);
      // Fallback to basic completion if gamification fails
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();
      const completedTools = [...(currentAnalytics.tools_completed || [])];
      if (!completedTools.includes("business-case")) {
        completedTools.push("business-case");
      }

      await Promise.all([
        this.updateWorkflowProgress(recordId, {
          business_case_ready: true,
          selected_template: data.templateName,
          last_active_tool: "results"
        }),
        this.updateUsageAnalytics(recordId, {
          tools_completed: completedTools,
          time_per_tool: {
            ...currentAnalytics.time_per_tool,
            'business-case': data.timeSpent || 0
          },
          last_activity: new Date().toISOString()
        })
      ]);
      
      throw error;
    }
  },

  calculateBusinessCaseQuality(data) {
    // Quality assessment based on template complexity and completion metrics
    const templateComplexity = {
      'pilot_program': 'Foundation',
      'full_implementation': 'Advanced',
      'comprehensive_strategy': 'Expert'
    };
    
    const timeSpent = data.timeSpent || 0;
    let qualityLevel = templateComplexity[data.templateName] || 'Standard';
    
    // Bonus for thorough completion (longer time spent indicates detail)
    if (timeSpent > 900) { // 15+ minutes
      qualityLevel = qualityLevel === 'Foundation' ? 'Proficient' : 
                     qualityLevel === 'Advanced' ? 'Expert' : qualityLevel;
    }
    
    return qualityLevel;
  },

  // Results Dashboard Access Handler with milestone triggers for workflow completion
  async handleResultsGenerated(recordId, data) {
    const progressUpdate = {
      results_generated: true,
      last_active_tool: "results"
    };

    const currentData = await this.getCustomerAssets(null, null, recordId);
    const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();
    const completedTools = [...(currentAnalytics.tools_completed || [])];
    if (!completedTools.includes("results")) {
      completedTools.push("results");
    }

    const analyticsUpdate = {
      tools_completed: completedTools,
      time_per_tool: {
        ...currentAnalytics.time_per_tool,
        results: data.timeSpent || 0
      },
      last_activity: new Date().toISOString(),
      activity_count: (currentAnalytics.activity_count || 0) + 1
    };

    // Check if this completes the full workflow (all tools completed)
    const allToolsCompleted = ['icp', 'cost-calculator', 'business-case', 'results'].every(
      tool => completedTools.includes(tool)
    );

    // Trigger milestone evaluation for results access and potential workflow completion
    try {
      const { milestoneService } = await import('./milestoneService');
      
      // Check for results generation milestone
      await milestoneService.checkMilestoneProgress(recordId, 'tool_completed', {
        tool: 'results',
        timestamp: new Date().toISOString(),
        timeSpent: data.timeSpent
      });

      // Check for comprehensive workflow completion milestone
      if (allToolsCompleted) {
        await milestoneService.checkMilestoneProgress(recordId, 'workflow_completed', {
          tools: completedTools,
          timestamp: new Date().toISOString(),
          totalTimeSpent: Object.values(analyticsUpdate.time_per_tool).reduce((sum, time) => sum + time, 0)
        });
      }
    } catch (error) {
      console.warn('Milestone tracking unavailable:', error);
    }

    await Promise.all([
      this.updateWorkflowProgress(recordId, progressUpdate),
      this.updateUsageAnalytics(recordId, analyticsUpdate)
    ]);

    return progressUpdate;
  },

  // Export Tracking
  async trackExport(recordId, exportData) {
    const currentData = await this.getCustomerAssets(null, null, recordId);
    const currentPreferences = currentData?.userPreferences || this.getDefaultUserPreferences();
    const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();

    const exportEntry = {
      format: exportData.format,
      timestamp: new Date().toISOString(),
      tool: exportData.tool || "results"
    };

    const preferencesUpdate = {
      preferred_export_format: exportData.format,
      export_history: [
        ...currentPreferences.export_history.slice(-9), // Keep last 10 exports
        exportEntry
      ]
    };

    const analyticsUpdate = {
      export_count: (currentAnalytics.export_count || 0) + 1
    };

    await Promise.all([
      this.updateUserPreferences(recordId, preferencesUpdate),
      this.updateUsageAnalytics(recordId, analyticsUpdate)
    ]);
  },

  // Share Tracking
  async trackShare(recordId, shareData) {
    const currentData = await this.getCustomerAssets(null, null, recordId);
    const currentAnalytics = currentData?.usageAnalytics || this.getDefaultUsageAnalytics();

    const analyticsUpdate = {
      share_count: (currentAnalytics.share_count || 0) + 1
    };

    await this.updateUsageAnalytics(recordId, analyticsUpdate);
  },

  // Session Management
  async startSession(recordId) {
    const analyticsUpdate = {
      session_start: new Date().toISOString(),
      last_login: new Date().toISOString()
    };

    await this.updateUsageAnalytics(recordId, analyticsUpdate);
  },

  // Clear customer cache (useful after updates)
  clearCustomerCache() {
    customerAssetsCache.clear();
  },

  // Get customer data by recordId (used internally)
  async getCustomerDataByRecordId(recordId) {
    try {
      const response = await airtableClient.get(`/Customer Assets/${recordId}`);
      const record = response.data;
      
      return {
        id: record.id,
        customerId: record.fields['Customer ID'],
        customerName: record.fields['Customer Name'],
        accessToken: record.fields['Access Token'],
        icpContent: this.parseJsonField(record.fields['ICP Content']),
        icpDescription: this.parseJsonField(record.fields['ICP Description']),
        costCalculatorContent: this.parseJsonField(record.fields['Cost Calculator Content']),
        businessCaseContent: this.parseJsonField(record.fields['Business Case Content']),
        workflowProgress: this.parseJsonField(record.fields['Workflow Progress']) || this.getDefaultWorkflowProgress(),
        userPreferences: this.parseJsonField(record.fields['User Preferences']) || this.getDefaultUserPreferences(),
        usageAnalytics: this.parseJsonField(record.fields['Usage Analytics']) || this.getDefaultUsageAnalytics(),
        // Enhanced gamification fields
        competencyProgress: this.parseJsonField(record.fields['Competency Progress']) || this.getDefaultCompetencyProgress(),
        toolAccessStatus: this.parseJsonField(record.fields['Tool Access Status']) || this.getDefaultToolAccessStatus(),
        professionalMilestones: this.parseJsonField(record.fields['Professional Milestones']) || this.getDefaultProfessionalMilestones(),
        dailyObjectives: this.parseJsonField(record.fields['Daily Objectives']) || this.getDefaultDailyObjectives(),
        createdAt: record.fields['Created At'],
        lastAccessed: record.fields['Last Accessed']
      };
    } catch (error) {
      console.error('Error fetching customer data by recordId:', error);
      throw error;
    }
  },

  // ========================================
  // ERROR HANDLING & VALIDATION UTILITIES
  // ========================================

  // Validate gamification data integrity
  validateGamificationData(data, type) {
    const validators = {
      competencyProgress: (data) => {
        const required = ['overall_level', 'total_progress_points', 'competency_scores'];
        return required.every(field => data.hasOwnProperty(field)) &&
               typeof data.total_progress_points === 'number' &&
               data.total_progress_points >= 0;
      },
      toolAccessStatus: (data) => {
        const requiredTools = ['icp_analysis', 'cost_calculator', 'business_case_builder'];
        return requiredTools.every(tool => 
          data[tool] && 
          typeof data[tool].access === 'boolean' &&
          typeof data[tool].completions === 'number'
        );
      },
      professionalMilestones: (data) => {
        return Array.isArray(data.milestones_achieved) &&
               typeof data.total_milestone_points === 'number' &&
               data.total_milestone_points >= 0;
      },
      dailyObjectives: (data) => {
        return typeof data.current_date === 'string' &&
               Array.isArray(data.objectives_completed) &&
               typeof data.completion_streak === 'number';
      }
    };

    const validator = validators[type];
    if (!validator) return false;
    
    try {
      return validator(data);
    } catch (error) {
      console.error(`Validation error for ${type}:`, error);
      return false;
    }
  },

  // Graceful data migration for existing customers
  async migrateCustomerData(recordId) {
    try {
      console.log(`Migrating customer data for record: ${recordId}`);
      
      const currentData = await this.getCustomerDataByRecordId(recordId);
      const updates = {};
      
      // Migrate missing gamification fields
      if (!currentData.competencyProgress || !this.validateGamificationData(currentData.competencyProgress, 'competencyProgress')) {
        updates['Competency Progress'] = JSON.stringify(this.getDefaultCompetencyProgress());
      }
      
      if (!currentData.toolAccessStatus || !this.validateGamificationData(currentData.toolAccessStatus, 'toolAccessStatus')) {
        updates['Tool Access Status'] = JSON.stringify(this.getDefaultToolAccessStatus());
      }
      
      if (!currentData.professionalMilestones || !this.validateGamificationData(currentData.professionalMilestones, 'professionalMilestones')) {
        updates['Professional Milestones'] = JSON.stringify(this.getDefaultProfessionalMilestones());
      }
      
      if (!currentData.dailyObjectives || !this.validateGamificationData(currentData.dailyObjectives, 'dailyObjectives')) {
        updates['Daily Objectives'] = JSON.stringify(this.getDefaultDailyObjectives());
      }
      
      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        await airtableClient.patch('/Customer Assets', {
          records: [{
            id: recordId,
            fields: updates
          }]
        });
        
        this.clearCustomerCache();
        console.log(`Successfully migrated ${Object.keys(updates).length} fields for record: ${recordId}`);
      }
      
      return { success: true, migratedFields: Object.keys(updates) };
    } catch (error) {
      console.error('Error migrating customer data:', error);
      return { success: false, error: error.message };
    }
  },

  // Enhanced error handling with retry logic
  async executeWithRetry(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  // Comprehensive data sanitization
  sanitizeJsonData(data, type) {
    if (!data || typeof data !== 'object') {
      return this.getDefaultByType(type);
    }
    
    try {
      // Remove any potentially harmful properties
      const sanitized = JSON.parse(JSON.stringify(data));
      
      // Ensure required fields exist
      const defaults = this.getDefaultByType(type);
      const result = { ...defaults, ...sanitized };
      
      // Validate after sanitization
      if (!this.validateGamificationData(result, type)) {
        console.warn(`Data failed validation after sanitization for type: ${type}, using defaults`);
        return defaults;
      }
      
      return result;
    } catch (error) {
      console.error(`Error sanitizing ${type} data:`, error);
      return this.getDefaultByType(type);
    }
  },

  getDefaultByType(type) {
    const defaultGetters = {
      competencyProgress: () => this.getDefaultCompetencyProgress(),
      toolAccessStatus: () => this.getDefaultToolAccessStatus(),
      professionalMilestones: () => this.getDefaultProfessionalMilestones(),
      dailyObjectives: () => this.getDefaultDailyObjectives()
    };
    
    const getter = defaultGetters[type];
    return getter ? getter() : {};
  },

  // Enhanced health check with gamification fields
  async healthCheck() {
    try {
      const response = await airtableClient.get('/Customer Assets', {
        params: { maxRecords: 1 }
      });
      
      // Check if gamification fields exist in schema
      if (response.data.records.length > 0) {
        const record = response.data.records[0];
        const gamificationFields = [
          'Competency Progress',
          'Tool Access Status', 
          'Professional Milestones',
          'Daily Objectives'
        ];
        
        const missingFields = gamificationFields.filter(field => 
          !record.fields.hasOwnProperty(field)
        );
        
        if (missingFields.length > 0) {
          console.warn('Missing gamification fields:', missingFields);
          return {
            status: 'partial',
            missingFields: missingFields
          };
        }
      }
      
      return { status: 'healthy' };
    } catch (error) {
      console.error('Airtable health check failed:', error);
      return { 
        status: 'failed', 
        error: error.message 
      };
    }
  },

  // Batch operation utility for performance
  async batchUpdateCustomers(updates) {
    try {
      // Airtable API supports up to 10 records per batch
      const batchSize = 10;
      const results = [];
      
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        const response = await this.executeWithRetry(async () => {
          return await airtableClient.patch('/Customer Assets', {
            records: batch
          });
        });
        
        results.push(...response.data.records);
      }
      
      this.clearCustomerCache();
      return { success: true, updatedCount: results.length };
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }
};