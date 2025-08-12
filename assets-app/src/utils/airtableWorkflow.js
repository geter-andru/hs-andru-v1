// Airtable Workflow Management Utilities
const AIRTABLE_BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;

// Default JSON structures
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

class AirtableWorkflowManager {
  constructor() {
    this.baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Customer%20Assets`;
    this.headers = {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    };
  }

  // Load customer workflow data
  async loadCustomerWorkflow(customerId) {
    try {
      const response = await fetch(
        `${this.baseUrl}?filterByFormula=({Customer ID}='${customerId}')`,
        { headers: this.headers }
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const record = data.records[0];
        
        return {
          recordId: record.id,
          workflowProgress: this.parseJSON(record.fields['Workflow_Progress'], DEFAULT_WORKFLOW_PROGRESS),
          userPreferences: this.parseJSON(record.fields['User_Preferences'], DEFAULT_USER_PREFERENCES),
          usageAnalytics: this.parseJSON(record.fields['Usage_Analytics'], DEFAULT_USAGE_ANALYTICS),
          customerData: record.fields
        };
      }
      
      throw new Error('Customer not found');
    } catch (error) {
      console.error('Error loading customer workflow:', error);
      throw error;
    }
  }

  // Update workflow progress
  async updateWorkflowProgress(customerId, progressUpdate) {
    try {
      const customerData = await this.loadCustomerWorkflow(customerId);
      const updatedProgress = { ...customerData.workflowProgress, ...progressUpdate };
      
      // Calculate completion percentage
      updatedProgress.completion_percentage = this.calculateCompletionPercentage(updatedProgress);
      
      const response = await fetch(`${this.baseUrl}/${customerData.recordId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          fields: {
            'Workflow_Progress': JSON.stringify(updatedProgress),
            'Last Accessed': new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Error updating workflow progress:', error);
      throw error;
    }
  }

  // Update user preferences
  async updateUserPreferences(customerId, preferencesUpdate) {
    try {
      const customerData = await this.loadCustomerWorkflow(customerId);
      const updatedPreferences = { ...customerData.userPreferences, ...preferencesUpdate };
      
      const response = await fetch(`${this.baseUrl}/${customerData.recordId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          fields: {
            'User_Preferences': JSON.stringify(updatedPreferences)
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Update usage analytics
  async updateUsageAnalytics(customerId, analyticsUpdate) {
    try {
      const customerData = await this.loadCustomerWorkflow(customerId);
      const updatedAnalytics = { ...customerData.usageAnalytics, ...analyticsUpdate };
      
      // Update last_login timestamp
      updatedAnalytics.last_login = new Date().toISOString();
      
      const response = await fetch(`${this.baseUrl}/${customerData.recordId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          fields: {
            'Usage_Analytics': JSON.stringify(updatedAnalytics)
          }
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Error updating usage analytics:', error);
      throw error;
    }
  }

  // Mark tool as completed
  async completeToolWorkflow(customerId, toolName, toolData = {}) {
    try {
      const updates = {
        last_active_tool: toolName,
        analysis_date: new Date().toISOString()
      };

      // Tool-specific updates
      switch (toolName) {
        case 'icp':
          updates.icp_completed = true;
          if (toolData.score) updates.icp_score = toolData.score;
          if (toolData.company_name) updates.company_name = toolData.company_name;
          break;
        case 'cost':
          updates.cost_calculated = true;
          if (toolData.annual_cost) updates.annual_cost = toolData.annual_cost;
          break;
        case 'business_case':
          updates.business_case_ready = true;
          if (toolData.selected_template) updates.selected_template = toolData.selected_template;
          break;
      }

      // Update analytics
      const customerData = await this.loadCustomerWorkflow(customerId);
      const toolsCompleted = [...(customerData.usageAnalytics.tools_completed || [])];
      if (!toolsCompleted.includes(toolName)) {
        toolsCompleted.push(toolName);
      }

      await Promise.all([
        this.updateWorkflowProgress(customerId, updates),
        this.updateUsageAnalytics(customerId, { tools_completed: toolsCompleted })
      ]);

      return { success: true, toolName, updates };
    } catch (error) {
      console.error('Error completing tool workflow:', error);
      throw error;
    }
  }

  // Initialize new customer workflow
  async initializeCustomerWorkflow(customerId) {
    try {
      const customerData = await this.loadCustomerWorkflow(customerId);
      
      const initUpdates = {
        'Workflow_Progress': JSON.stringify(DEFAULT_WORKFLOW_PROGRESS),
        'User_Preferences': JSON.stringify(DEFAULT_USER_PREFERENCES),
        'Usage_Analytics': JSON.stringify({
          ...DEFAULT_USAGE_ANALYTICS,
          session_start: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
      };

      const response = await fetch(`${this.baseUrl}/${customerData.recordId}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ fields: initUpdates })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error('Error initializing customer workflow:', error);
      throw error;
    }
  }

  // Track tool usage time
  async trackToolTime(customerId, toolName, timeSpent) {
    try {
      const customerData = await this.loadCustomerWorkflow(customerId);
      const timePerTool = { ...customerData.usageAnalytics.time_per_tool };
      timePerTool[toolName] = (timePerTool[toolName] || 0) + timeSpent;

      await this.updateUsageAnalytics(customerId, { time_per_tool: timePerTool });
      return { success: true, toolName, timeSpent };
    } catch (error) {
      console.error('Error tracking tool time:', error);
      throw error;
    }
  }

  // Track exports
  async trackExport(customerId, exportType, format) {
    try {
      const customerData = await this.loadCustomerWorkflow(customerId);
      const exportHistory = [...(customerData.userPreferences.export_history || [])];
      const newExport = {
        type: exportType,
        format: format,
        timestamp: new Date().toISOString()
      };
      exportHistory.push(newExport);

      await Promise.all([
        this.updateUserPreferences(customerId, { export_history: exportHistory }),
        this.updateUsageAnalytics(customerId, { 
          export_count: (customerData.usageAnalytics.export_count || 0) + 1 
        })
      ]);

      return { success: true, exportType, format };
    } catch (error) {
      console.error('Error tracking export:', error);
      throw error;
    }
  }

  // Helper methods
  parseJSON(jsonString, defaultValue) {
    try {
      return jsonString ? JSON.parse(jsonString) : defaultValue;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return defaultValue;
    }
  }

  calculateCompletionPercentage(progress) {
    const weights = {
      icp_completed: 40,
      cost_calculated: 30,
      business_case_ready: 30
    };

    let totalCompleted = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      if (progress[key]) totalCompleted += weight;
    });

    return Math.round(totalCompleted);
  }

  // Get workflow status for navigation
  getWorkflowStatus(progress) {
    return {
      canAccessCost: progress.icp_completed,
      canAccessBusinessCase: progress.icp_completed && progress.cost_calculated,
      canExport: progress.icp_completed && progress.cost_calculated && progress.business_case_ready,
      nextRecommendedTool: this.getNextTool(progress),
      completionPercentage: progress.completion_percentage || 0
    };
  }

  getNextTool(progress) {
    if (!progress.icp_completed) return 'icp';
    if (!progress.cost_calculated) return 'cost';
    if (!progress.business_case_ready) return 'business_case';
    return 'completed';
  }
}

export default new AirtableWorkflowManager();