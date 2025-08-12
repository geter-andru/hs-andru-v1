import axios from 'axios';

const BASE_URL = 'https://api.airtable.com/v0';
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;

// Cache for customer assets and user progress to avoid redundant API calls
let customerAssetsCache = new Map();
let userProgressCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    console.log('Airtable Request:', config.method?.toUpperCase(), config.url);
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
        console.log(`Using cached customer assets for: ${customerId}`);
        return cachedData.data;
      }
      
      console.log(`Fetching customer assets for: ${customerId} with token: ${accessToken}`);
      
      // Strategy 1: Try filtering by Access Token only (more reliable)
      const response = await airtableClient.get('/Customer Assets', {
        params: {
          filterByFormula: `{Access Token} = '${accessToken}'`,
          maxRecords: 10  // Reduced from 100 to minimize timeout risk
        }
      });

      console.log(`Found ${response.data.records.length} records with matching access token`);

      // Find matching record by Customer ID in the filtered results
      const matchingRecord = response.data.records.find(record => {
        const recordCustomerId = record.fields['Customer ID'];
        console.log(`Checking record with Customer ID: ${recordCustomerId}`);
        return recordCustomerId === customerId;
      });

      if (!matchingRecord) {
        // Strategy 2: If no match found, try direct record lookup if customerId looks like record ID
        if (customerId.startsWith('rec')) {
          console.log('Trying direct record lookup...');
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
            workflowProgress: this.parseJsonField(record.fields['Workflow_Progress']) || this.getDefaultWorkflowProgress(),
            userPreferences: this.parseJsonField(record.fields['User_Preferences']) || this.getDefaultUserPreferences(),
            usageAnalytics: this.parseJsonField(record.fields['Usage_Analytics']) || this.getDefaultUsageAnalytics(),
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
      console.log('Successfully found matching customer record');
      
      const customerData = {
        id: record.id,
        customerId: record.fields['Customer ID'],
        customerName: record.fields['Customer Name'],
        accessToken: record.fields['Access Token'],
        icpContent: this.parseJsonField(record.fields['ICP Content']),
        icpDescription: this.parseJsonField(record.fields['ICP Description']),
        costCalculatorContent: this.parseJsonField(record.fields['Cost Calculator Content']),
        businessCaseContent: this.parseJsonField(record.fields['Business Case Content']),
        workflowProgress: this.parseJsonField(record.fields['Workflow_Progress']) || this.getDefaultWorkflowProgress(),
        userPreferences: this.parseJsonField(record.fields['User_Preferences']) || this.getDefaultUserPreferences(),
        usageAnalytics: this.parseJsonField(record.fields['Usage_Analytics']) || this.getDefaultUsageAnalytics(),
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

  // Update workflow progress
  async updateWorkflowProgress(recordId, progressUpdate) {
    try {
      // Get current progress first
      const currentData = await this.getCustomerDataByRecordId(recordId);
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
            'Workflow_Progress': JSON.stringify(updatedProgress)
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
      const currentData = await this.getCustomerDataByRecordId(recordId);
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
            'User_Preferences': JSON.stringify(updatedPreferences)
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
      const currentData = await this.getCustomerDataByRecordId(recordId);
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
            'Usage_Analytics': JSON.stringify(updatedAnalytics)
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

  // ICP Completion Handler
  async handleICPCompletion(recordId, data) {
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
      }
    };

    await Promise.all([
      this.updateWorkflowProgress(recordId, progressUpdate),
      this.updateUsageAnalytics(recordId, analyticsUpdate)
    ]);

    return progressUpdate;
  },

  // Cost Calculator Completion Handler
  async handleCostCalculatorCompletion(recordId, data) {
    const progressUpdate = {
      cost_calculated: true,
      annual_cost: data.annualCost,
      last_active_tool: "business-case"
    };

    // Get current analytics to append to tools_completed
    const currentData = await this.getCustomerAssets(null, null, recordId);
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
      }
    };

    await Promise.all([
      this.updateWorkflowProgress(recordId, progressUpdate),
      this.updateUsageAnalytics(recordId, analyticsUpdate)
    ]);

    return progressUpdate;
  },

  // Business Case Completion Handler
  async handleBusinessCaseCompletion(recordId, data) {
    const progressUpdate = {
      business_case_ready: true,
      selected_template: data.templateName,
      last_active_tool: "results"
    };

    const currentData = await this.getCustomerAssets(null, null, recordId);
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
      }
    };

    await Promise.all([
      this.updateWorkflowProgress(recordId, progressUpdate),
      this.updateUsageAnalytics(recordId, analyticsUpdate)
    ]);

    return progressUpdate;
  },

  // Results Dashboard Access Handler
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
      }
    };

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
        workflowProgress: this.parseJsonField(record.fields['Workflow_Progress']) || this.getDefaultWorkflowProgress(),
        userPreferences: this.parseJsonField(record.fields['User_Preferences']) || this.getDefaultUserPreferences(),
        usageAnalytics: this.parseJsonField(record.fields['Usage_Analytics']) || this.getDefaultUsageAnalytics(),
        createdAt: record.fields['Created At'],
        lastAccessed: record.fields['Last Accessed']
      };
    } catch (error) {
      console.error('Error fetching customer data by recordId:', error);
      throw error;
    }
  },

  // Health check method
  async healthCheck() {
    try {
      const response = await airtableClient.get('/Customer Assets', {
        params: { maxRecords: 1 }
      });
      return true;
    } catch (error) {
      console.error('Airtable health check failed:', error);
      return false;
    }
  }
};